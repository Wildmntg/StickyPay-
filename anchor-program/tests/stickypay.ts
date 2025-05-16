import * as anchor from "@coral-xyz/anchor"
import type { Program } from "@coral-xyz/anchor"
import type { Stickypay } from "../target/types/stickypay"
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { expect } from "chai"

describe("stickypay", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.Stickypay as Program<Stickypay>
  const merchantAuthority = Keypair.generate()
  const payer = Keypair.generate()
  const feeCollector = provider.wallet.publicKey
  let merchantPDA: PublicKey
  let paymentPDA: PublicKey
  const reference = Keypair.generate().publicKey

  before(async () => {
    // Airdrop SOL to merchant and payer
    const merchantAirdrop = await provider.connection.requestAirdrop(merchantAuthority.publicKey, 2 * LAMPORTS_PER_SOL)
    await provider.connection.confirmTransaction(merchantAirdrop)

    const payerAirdrop = await provider.connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL)
    await provider.connection.confirmTransaction(payerAirdrop)

    // Find PDAs
    ;[merchantPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("merchant"), merchantAuthority.publicKey.toBuffer()],
      program.programId,
    )
    ;[paymentPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("payment"), merchantPDA.toBuffer(), reference.toBuffer()],
      program.programId,
    )
  })

  it("Initializes a merchant", async () => {
    const merchantName = "Test Merchant"
    const feeBasisPoints = 100 // 1%

    await program.methods
      .initializeMerchant(merchantName, feeBasisPoints)
      .accounts({
        merchant: merchantPDA,
        authority: merchantAuthority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([merchantAuthority])
      .rpc()

    const merchantAccount = await program.account.merchant.fetch(merchantPDA)
    expect(merchantAccount.authority.toString()).to.equal(merchantAuthority.publicKey.toString())
    expect(merchantAccount.name).to.equal(merchantName)
    expect(merchantAccount.feeBasisPoints).to.equal(feeBasisPoints)
    expect(merchantAccount.totalPayments.toNumber()).to.equal(0)
    expect(merchantAccount.totalVolume.toNumber()).to.equal(0)
  })

  it("Creates a payment session", async () => {
    const amount = 0.1 * LAMPORTS_PER_SOL
    const memo = "Test payment"
    const now = Math.floor(Date.now() / 1000)
    const expiryTimestamp = now + 3600 // 1 hour from now

    await program.methods
      .createPaymentSession(new anchor.BN(amount), reference, memo, new anchor.BN(expiryTimestamp))
      .accounts({
        merchant: merchantPDA,
        payment: paymentPDA,
        authority: merchantAuthority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([merchantAuthority])
      .rpc()

    const paymentAccount = await program.account.payment.fetch(paymentPDA)
    expect(paymentAccount.merchant.toString()).to.equal(merchantPDA.toString())
    expect(paymentAccount.amount.toNumber()).to.equal(amount)
    expect(paymentAccount.reference.toString()).to.equal(reference.toString())
    expect(paymentAccount.memo).to.equal(memo)
    expect(paymentAccount.paid).to.equal(false)
    expect(paymentAccount.expiresAt.toNumber()).to.equal(expiryTimestamp)
  })

  it("Processes a payment", async () => {
    const initialMerchantBalance = await provider.connection.getBalance(merchantAuthority.publicKey)
    const initialFeeCollectorBalance = await provider.connection.getBalance(feeCollector)

    await program.methods
      .processPayment()
      .accounts({
        merchant: merchantPDA,
        payment: paymentPDA,
        payer: payer.publicKey,
        merchantWallet: merchantAuthority.publicKey,
        feeCollector: feeCollector,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc()

    const paymentAccount = await program.account.payment.fetch(paymentPDA)
    expect(paymentAccount.paid).to.equal(true)
    expect(paymentAccount.payer.toString()).to.equal(payer.publicKey.toString())

    const merchantAccount = await program.account.merchant.fetch(merchantPDA)
    expect(merchantAccount.totalPayments.toNumber()).to.equal(1)
    expect(merchantAccount.totalVolume.toNumber()).to.equal(paymentAccount.amount.toNumber())

    // Check balances
    const finalMerchantBalance = await provider.connection.getBalance(merchantAuthority.publicKey)
    const finalFeeCollectorBalance = await provider.connection.getBalance(feeCollector)

    // Calculate expected fee
    const feeAmount = Math.floor((paymentAccount.amount.toNumber() * merchantAccount.feeBasisPoints) / 10000)
    const merchantAmount = paymentAccount.amount.toNumber() - feeAmount

    // Check that merchant received the correct amount
    expect(finalMerchantBalance - initialMerchantBalance).to.be.at.least(
      merchantAmount - 10000, // Allow for some transaction fees
    )

    // Check that fee collector received the fee
    expect(finalFeeCollectorBalance - initialFeeCollectorBalance).to.be.at.least(
      feeAmount - 10000, // Allow for some transaction fees
    )
  })

  it("Cannot process the same payment twice", async () => {
    try {
      await program.methods
        .processPayment()
        .accounts({
          merchant: merchantPDA,
          payment: paymentPDA,
          payer: payer.publicKey,
          merchantWallet: merchantAuthority.publicKey,
          feeCollector: feeCollector,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([payer])
        .rpc()
      expect.fail("Should have thrown an error")
    } catch (error) {
      expect(error.message).to.include("Payment has already been processed")
    }
  })
})
