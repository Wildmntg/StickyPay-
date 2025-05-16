"use client"

import * as anchor from "@coral-xyz/anchor"
import type { Program } from "@coral-xyz/anchor"
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token"
import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"

// This is the simplified IDL for our program
const idl = {
  version: "0.1.0",
  name: "solpay",
  instructions: [
    {
      name: "sendSol",
      accounts: [
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "recipient",
          isMut: true,
          isSigner: false,
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
      ],
    },
    {
      name: "sendSplTokens",
      accounts: [
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "recipientTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "recipient",
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
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [],
  errors: [],
}

// Program ID from your deployed Anchor program
const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS")

// Common testnet token mints
export const TESTNET_TOKENS = {
  SOL: null, // Native SOL
  USDC: new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"), // Testnet USDC
  USDT: new PublicKey("EbMg3VYAE9Krhndw7FuogpHNcEPkXVhtXr7mGisdeaur"), // Testnet USDT
  BTC: new PublicKey("C6kYXcaRUMqeBF5fhg165RWU7AnpT9z92fvKNoMqjmz6"), // Testnet BTC
  ETH: new PublicKey("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"), // Testnet ETH
}

export function useSimpleAnchorProgram() {
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

export async function sendSol(program: Program, payer: PublicKey, recipient: PublicKey, amountLamports: number) {
  if (!program) throw new Error("Program not initialized")

  try {
    console.log("Sending SOL via smart contract...")
    console.log("Payer:", payer.toString())
    console.log("Recipient:", recipient.toString())
    console.log("Amount (lamports):", amountLamports)

    // Send SOL
    const tx = await program.methods
      .sendSol(new anchor.BN(amountLamports))
      .accounts({
        payer,
        recipient,
        systemProgram: SystemProgram.programId,
      })
      .rpc({ commitment: "confirmed" })

    console.log("SOL transfer successful:", tx)
    return { tx }
  } catch (error) {
    console.error("Error sending SOL:", error)
    throw error
  }
}

export async function sendSplTokens(
  program: Program,
  connection: Connection,
  payer: PublicKey,
  recipient: PublicKey,
  tokenMint: PublicKey,
  amount: number,
) {
  if (!program) throw new Error("Program not initialized")

  try {
    console.log("Sending SPL tokens via smart contract...")
    console.log("Payer:", payer.toString())
    console.log("Recipient:", recipient.toString())
    console.log("Token Mint:", tokenMint.toString())
    console.log("Amount:", amount)

    // Get associated token accounts
    const payerTokenAccount = await getAssociatedTokenAddress(tokenMint, payer, false)
    const recipientTokenAccount = await getAssociatedTokenAddress(tokenMint, recipient, false)

    console.log("Payer token account:", payerTokenAccount.toString())
    console.log("Recipient token account:", recipientTokenAccount.toString())

    // Check if recipient token account exists
    let recipientAccountExists = true
    try {
      await getAccount(connection, recipientTokenAccount)
    } catch (error) {
      console.log("Recipient token account doesn't exist, will create it")
      recipientAccountExists = false
    }

    // If recipient token account doesn't exist, create it first
    if (!recipientAccountExists) {
      console.log("Creating recipient token account...")
      const createAtaIx = createAssociatedTokenAccountInstruction(payer, recipientTokenAccount, recipient, tokenMint)

      const tx = new Transaction().add(createAtaIx)
      const { blockhash } = await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash
      tx.feePayer = payer

      // @ts-ignore - We know the wallet has these methods
      const signedTx = await program.provider.wallet.signTransaction(tx)
      const txid = await connection.sendRawTransaction(signedTx.serialize())
      await connection.confirmTransaction(txid, "confirmed")
      console.log("Created recipient token account:", txid)
    }

    // Send tokens
    const tx = await program.methods
      .sendSplTokens(new anchor.BN(amount))
      .accounts({
        payer,
        mint: tokenMint,
        payerTokenAccount,
        recipientTokenAccount,
        recipient,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc({ commitment: "confirmed" })

    console.log("Token transfer successful:", tx)
    return { tx }
  } catch (error) {
    console.error("Error sending tokens:", error)
    throw error
  }
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
