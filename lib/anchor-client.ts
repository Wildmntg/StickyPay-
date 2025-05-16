"use client"

import * as anchor from "@coral-xyz/anchor"
import type { Program } from "@coral-xyz/anchor"
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token"
import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"

// This would be the actual IDL from your compiled program
// You'll need to replace this with your actual IDL after compiling the program
const idl = {
  version: "0.1.0",
  name: "stickypay",
  instructions: [
    {
      name: "initializeMerchant",
      accounts: [
        {
          name: "merchant",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "feeBasisPoints",
          type: "u16",
        },
      ],
    },
    {
      name: "createPaymentSession",
      accounts: [
        {
          name: "merchant",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payment",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
        {
          name: "reference",
          type: "publicKey",
        },
        {
          name: "memo",
          type: "string",
        },
        {
          name: "expiryTimestamp",
          type: "i64",
        },
        {
          name: "tokenMint",
          type: { option: "publicKey" },
        },
      ],
    },
    {
      name: "processSolPayment",
      accounts: [
        {
          name: "merchant",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payment",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "merchantWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "feeCollector",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "processTokenPayment",
      accounts: [
        {
          name: "merchant",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payment",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "payerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "merchantTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "feeCollectorTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "cancelPayment",
      accounts: [
        {
          name: "merchant",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payment",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "Merchant",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "feeBasisPoints",
            type: "u16",
          },
          {
            name: "totalPayments",
            type: "u64",
          },
          {
            name: "totalVolume",
            type: "u64",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "Payment",
      type: {
        kind: "struct",
        fields: [
          {
            name: "merchant",
            type: "publicKey",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "reference",
            type: "publicKey",
          },
          {
            name: "memo",
            type: "string",
          },
          {
            name: "createdAt",
            type: "i64",
          },
          {
            name: "expiresAt",
            type: "i64",
          },
          {
            name: "paid",
            type: "bool",
          },
          {
            name: "cancelled",
            type: "bool",
          },
          {
            name: "paidAt",
            type: { option: "i64" },
          },
          {
            name: "payer",
            type: { option: "publicKey" },
          },
          {
            name: "cancelledAt",
            type: { option: "i64" },
          },
          {
            name: "tokenMint",
            type: { option: "publicKey" },
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "FeeTooHigh",
      msg: "Fee basis points cannot exceed 1000 (10%)",
    },
    {
      code: 6001,
      name: "PaymentAlreadyProcessed",
      msg: "Payment has already been processed",
    },
    {
      code: 6002,
      name: "PaymentExpired",
      msg: "Payment has expired",
    },
    {
      code: 6003,
      name: "Unauthorized",
      msg: "Unauthorized action",
    },
    {
      code: 6004,
      name: "InvalidExpiry",
      msg: "Invalid expiry timestamp",
    },
    {
      code: 6005,
      name: "InvalidPaymentType",
      msg: "Invalid payment type",
    },
    {
      code: 6006,
      name: "TokenMintMismatch",
      msg: "Token mint mismatch",
    },
    {
      code: 6007,
      name: "PaymentAlreadyCancelled",
      msg: "Payment has already been cancelled",
    },
    {
      code: 6008,
      name: "MathOverflow",
      msg: "Math overflow error",
    },
  ],
}

// Program ID from your deployed Anchor program
const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS")

// Fee collector address - this would be the StickyPay platform wallet
const FEE_COLLECTOR = new PublicKey("3NRCPphqcyVmJviPyTzPBvwamLwUW5WN5sgJLifW2Q7q")

// Common testnet token mints
export const TESTNET_TOKENS = {
  SOL: null, // Native SOL
  USDC: new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"), // Testnet USDC
  USDT: new PublicKey("EbMg3VYAE9Krhndw7FuogpHNcEPkXVhtXr7mGisdeaur"), // Testnet USDT
  BTC: new PublicKey("C6kYXcaRUMqeBF5fhg165RWU7AnpT9z92fvKNoMqjmz6"), // Testnet BTC
  ETH: new PublicKey("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"), // Testnet ETH
}

export function useAnchorProgram() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const [program, setProgram] = useState<Program | null>(null)
  const [connection, setConnection] = useState<Connection | null>(null)

  useEffect(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return

    // Create a custom provider
    const conn = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.testnet.solana.com", {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000, // 60 seconds timeout
    })
    setConnection(conn)

    const provider = new anchor.AnchorProvider(
      conn,
      {
        publicKey,
        signTransaction,
        signAllTransactions,
      },
      { commitment: "confirmed" },
    )

    // Create the program
    const program = new anchor.Program(idl as any, PROGRAM_ID, provider)
    setProgram(program)
  }, [publicKey, signTransaction, signAllTransactions])

  return { program, connection }
}

export async function initializeMerchant(program: Program, authority: PublicKey, name: string, feeBasisPoints = 100) {
  if (!program) throw new Error("Program not initialized")

  // Find the merchant PDA
  const [merchantPDA] = await PublicKey.findProgramAddressSync(
    [Buffer.from("merchant"), authority.toBuffer()],
    program.programId,
  )

  // Initialize the merchant
  const tx = await program.methods
    .initializeMerchant(name, feeBasisPoints)
    .accounts({
      merchant: merchantPDA,
      authority,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  return { merchantPDA, tx }
}

export async function createPaymentSession(
  program: Program,
  merchantPDA: PublicKey,
  authority: PublicKey,
  amount: number,
  memo = "Payment via StickyPay",
  expiryHours = 1,
  tokenMint: PublicKey | null = null, // null for SOL, PublicKey for SPL tokens
) {
  if (!program) throw new Error("Program not initialized")

  // Generate a random reference
  const reference = Keypair.generate().publicKey

  // Calculate expiry timestamp (current time + expiryHours)
  const now = Math.floor(Date.now() / 1000)
  const expiryTimestamp = now + expiryHours * 60 * 60

  // Find the payment PDA
  const [paymentPDA] = await PublicKey.findProgramAddressSync(
    [Buffer.from("payment"), merchantPDA.toBuffer(), reference.toBuffer()],
    program.programId,
  )

  // Create the payment session
  const tx = await program.methods
    .createPaymentSession(
      new anchor.BN(amount),
      reference,
      memo,
      new anchor.BN(expiryTimestamp),
      tokenMint ? tokenMint : null,
    )
    .accounts({
      merchant: merchantPDA,
      payment: paymentPDA,
      authority,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  return { paymentPDA, reference, tx }
}

// For backward compatibility
export async function createPayment(
  program: Program,
  merchantPDA: PublicKey,
  authority: PublicKey,
  amount: number,
  reference?: PublicKey,
) {
  // If reference is not provided, generate a random one
  const actualReference = reference || Keypair.generate().publicKey

  return createPaymentSession(program, merchantPDA, authority, amount, "Payment via StickyPay", 1)
}

export async function processSolPayment(
  program: Program,
  merchantPDA: PublicKey,
  paymentPDA: PublicKey,
  payer: PublicKey,
  merchantWallet: PublicKey,
) {
  if (!program) throw new Error("Program not initialized")

  try {
    console.log("Processing SOL payment...")
    console.log("Merchant PDA:", merchantPDA.toString())
    console.log("Payment PDA:", paymentPDA.toString())
    console.log("Payer:", payer.toString())
    console.log("Merchant Wallet:", merchantWallet.toString())
    console.log("Fee Collector:", FEE_COLLECTOR.toString())

    // Process the SOL payment
    const tx = await program.methods
      .processSolPayment()
      .accounts({
        merchant: merchantPDA,
        payment: paymentPDA,
        payer,
        merchantWallet,
        feeCollector: FEE_COLLECTOR,
        systemProgram: SystemProgram.programId,
      })
      .rpc({ commitment: "confirmed" })

    console.log("SOL payment processed successfully:", tx)
    return { tx }
  } catch (error) {
    console.error("Error processing SOL payment:", error)
    throw error
  }
}

export async function processTokenPayment(
  program: Program,
  merchantPDA: PublicKey,
  paymentPDA: PublicKey,
  payer: PublicKey,
  merchantWallet: PublicKey,
  tokenMint: PublicKey,
) {
  if (!program) throw new Error("Program not initialized")

  try {
    console.log("Processing token payment...")
    console.log("Merchant PDA:", merchantPDA.toString())
    console.log("Payment PDA:", paymentPDA.toString())
    console.log("Payer:", payer.toString())
    console.log("Merchant Wallet:", merchantWallet.toString())
    console.log("Token Mint:", tokenMint.toString())

    // Get the payment account to verify token mint
    const paymentAccount = await program.account.payment.fetch(paymentPDA)
    if (!paymentAccount.tokenMint) {
      throw new Error("This payment does not accept tokens")
    }

    const paymentTokenMint = new PublicKey(paymentAccount.tokenMint)
    if (!paymentTokenMint.equals(tokenMint)) {
      throw new Error("Token mint mismatch")
    }

    // Get associated token accounts
    const payerTokenAccount = await getAssociatedTokenAddress(tokenMint, payer, false)

    const merchantTokenAccount = await getAssociatedTokenAddress(tokenMint, merchantWallet, false)

    const feeCollectorTokenAccount = await getAssociatedTokenAddress(tokenMint, FEE_COLLECTOR, false)

    // Check if the merchant token account exists, if not create it
    try {
      await getAccount(program.provider.connection, merchantTokenAccount)
    } catch (error) {
      console.log("Creating merchant token account...")
      // Account doesn't exist, create it
      const createAtaIx = createAssociatedTokenAccountInstruction(
        payer,
        merchantTokenAccount,
        merchantWallet,
        tokenMint,
      )

      const tx = new Transaction().add(createAtaIx)
      const { blockhash } = await program.provider.connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash
      tx.feePayer = payer

      // @ts-ignore - We know the wallet has these methods
      const signedTx = await program.provider.wallet.signTransaction(tx)
      await sendAndConfirmTransaction(program.provider.connection, signedTx, [])
    }

    // Check if the fee collector token account exists, if not create it
    try {
      await getAccount(program.provider.connection, feeCollectorTokenAccount)
    } catch (error) {
      console.log("Creating fee collector token account...")
      // Account doesn't exist, create it
      const createAtaIx = createAssociatedTokenAccountInstruction(
        payer,
        feeCollectorTokenAccount,
        FEE_COLLECTOR,
        tokenMint,
      )

      const tx = new Transaction().add(createAtaIx)
      const { blockhash } = await program.provider.connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash
      tx.feePayer = payer

      // @ts-ignore - We know the wallet has these methods
      const signedTx = await program.provider.wallet.signTransaction(tx)
      await sendAndConfirmTransaction(program.provider.connection, signedTx, [])
    }

    // Process the token payment
    const tx = await program.methods
      .processTokenPayment()
      .accounts({
        merchant: merchantPDA,
        payment: paymentPDA,
        mint: tokenMint,
        payer,
        payerTokenAccount,
        merchantTokenAccount,
        feeCollectorTokenAccount,
        authority: merchantWallet,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc({ commitment: "confirmed" })

    console.log("Token payment processed successfully:", tx)
    return { tx }
  } catch (error) {
    console.error("Error processing token payment:", error)
    throw error
  }
}

export async function processPayment(
  program: Program,
  merchantPDA: PublicKey,
  paymentPDA: PublicKey,
  payer: PublicKey,
  merchantWallet: PublicKey,
  tokenMint?: PublicKey,
) {
  try {
    // Get the payment account to determine if it's a SOL or token payment
    const paymentAccount = await program.account.payment.fetch(paymentPDA)

    if (paymentAccount.tokenMint && tokenMint) {
      // Token payment
      return processTokenPayment(program, merchantPDA, paymentPDA, payer, merchantWallet, tokenMint)
    } else if (!paymentAccount.tokenMint) {
      // SOL payment
      return processSolPayment(program, merchantPDA, paymentPDA, payer, merchantWallet)
    } else {
      throw new Error("Token mint mismatch or missing")
    }
  } catch (error) {
    console.error("Error processing payment:", error)
    throw error
  }
}

export async function cancelPayment(
  program: Program,
  merchantPDA: PublicKey,
  paymentPDA: PublicKey,
  authority: PublicKey,
) {
  if (!program) throw new Error("Program not initialized")

  // Cancel the payment
  const tx = await program.methods
    .cancelPayment()
    .accounts({
      merchant: merchantPDA,
      payment: paymentPDA,
      authority,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  return { tx }
}

export async function getMerchantPDA(authority: PublicKey) {
  const [merchantPDA] = await PublicKey.findProgramAddressSync(
    [Buffer.from("merchant"), authority.toBuffer()],
    PROGRAM_ID,
  )
  return merchantPDA
}

export async function getPaymentPDA(merchantPDA: PublicKey, reference: PublicKey) {
  const [paymentPDA] = await PublicKey.findProgramAddressSync(
    [Buffer.from("payment"), merchantPDA.toBuffer(), reference.toBuffer()],
    PROGRAM_ID,
  )
  return paymentPDA
}

// Helper function to get token balance
export async function getTokenBalance(connection: Connection, tokenAccount: PublicKey) {
  try {
    const account = await getAccount(connection, tokenAccount)
    return Number(account.amount)
  } catch (error) {
    console.error("Error getting token balance:", error)
    return 0
  }
}

// Helper function to check if a token account exists
export async function tokenAccountExists(connection: Connection, tokenAccount: PublicKey) {
  try {
    await getAccount(connection, tokenAccount)
    return true
  } catch (error) {
    return false
  }
}

// Helper function to create a token account if it doesn't exist
export async function createTokenAccountIfNeeded(
  connection: Connection,
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
) {
  const associatedTokenAccount = await getAssociatedTokenAddress(mint, owner, false)

  // Check if the account already exists
  if (await tokenAccountExists(connection, associatedTokenAccount)) {
    return associatedTokenAccount
  }

  // Create the account
  const createAtaIx = createAssociatedTokenAccountInstruction(payer, associatedTokenAccount, owner, mint)

  const tx = new Transaction().add(createAtaIx)
  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.feePayer = payer

  const signedTx = await signTransaction(tx)
  await sendAndConfirmTransaction(connection, signedTx, [])

  return associatedTokenAccount
}

// Helper function to get payment details
export async function getPaymentDetails(program: Program, paymentPDA: PublicKey) {
  try {
    const paymentAccount = await program.account.payment.fetch(paymentPDA)
    return paymentAccount
  } catch (error) {
    console.error("Error getting payment details:", error)
    throw error
  }
}

// Helper function to get merchant details
export async function getMerchantDetails(program: Program, merchantPDA: PublicKey) {
  try {
    const merchantAccount = await program.account.merchant.fetch(merchantPDA)
    return merchantAccount
  } catch (error) {
    console.error("Error getting merchant details:", error)
    throw error
  }
}
