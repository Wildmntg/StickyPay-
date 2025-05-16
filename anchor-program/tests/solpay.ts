import * as anchor from "@coral-xyz/anchor"
import type { Program } from "@coral-xyz/anchor"
import type { Solpay } from "../target/types/solpay"
import { expect } from "chai"

describe("solpay", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.Solpay as Program<Solpay>
  const payer = anchor.web3.Keypair.generate()
  const merchant = provider.wallet
  const reference = anchor.web3.Keypair.generate().publicKey
  const paymentAmount = new anchor.BN(100000000) // 0.1 SOL

  let merchantPDA: anchor.web3.PublicKey
  let paymentPDA: anchor.web3.PublicKey

  before(async () => {
    // Airdrop SOL to payer
    const signature = await provider.connection.requestAirdrop(payer.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL)
    await provider.connection.confirmTransaction(signature)
  })

  it("Initializes a merchant", async () => {
    // Find the merchant PDA
    const [merchantAccount, _] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("merchant"), merchant.publicKey.toBuffer()],
      program.programId,
    )
    merchantPDA = merchantAccount

    // Initialize the merchant
    await program.methods
      .initialize()
      .accounts({
        merchant: merchantPDA,
        authority: merchant.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    // Fetch the merchant account
    const merchantData = await program.account.merchant.fetch(merchantPDA)
    expect(merchantData.authority.toString()).to.equal(merchant.publicKey.toString())
  })

  it("Creates a payment", async () => {
    // Find the payment PDA
    const [paymentAccount, _] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("payment"), merchantPDA.toBuffer(), reference.toBuffer()],
      program.programId,
    )
    paymentPDA = paymentAccount

    // Create the payment
    await program.methods
      .createPayment(paymentAmount, reference)
      .accounts({
        merchant: merchantPDA,
        payment: paymentPDA,
        authority: merchant.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    // Fetch the payment account
    const paymentData = await program.account.payment.fetch(paymentPDA)
    expect(paymentData.merchant.toString()).to.equal(merchantPDA.toString())
    expect(paymentData.amount.toString()).to.equal(paymentAmount.toString())
    expect(paymentData.reference.toString()).to.equal(reference.toString())
    expect(paymentData.paid).to.equal(false)
  })

  it("Processes a payment", async () => {
    // Get initial balances
    const initialPayerBalance = await provider.connection.getBalance(payer.publicKey)
    const initialMerchantBalance = await provider.connection.getBalance(merchant.publicKey)

    // Process the payment
    await program.methods
      .processPayment()
      .accounts({
        merchant: merchantPDA,
        payment: paymentPDA,
        payer: payer.publicKey,
        merchantWallet: merchant.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc()

    // Fetch the payment account
    const paymentData = await program.account.payment.fetch(paymentPDA)
    expect(paymentData.paid).to.equal(true)

    // Check balances
    const finalPayerBalance = await provider.connection.getBalance(payer.publicKey)
    const finalMerchantBalance = await provider.connection.getBalance(merchant.publicKey)

    // Payer should have less SOL (payment amount + some fees)
    expect(initialPayerBalance - finalPayerBalance).to.be.greaterThan(paymentAmount.toNumber())

    // Merchant should have more SOL (exactly payment amount)
    expect(finalMerchantBalance - initialMerchantBalance).to.equal(paymentAmount.toNumber())
  })
})
