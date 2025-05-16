import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import {
  type Connection,
  type Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js"
import { createConnection } from "./rpc-config"

// Default configuration
export const DEFAULT_CONFIG = {
  network: "testnet" as "mainnet" | "testnet",
  rpcEndpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.testnet.solana.com",
  walletAdapterNetwork: WalletAdapterNetwork.Testnet,
}

// Stablecoin tokens
export const STABLECOIN_TOKENS = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    mint: "CpMah17kQEL2wqyMKt3mZBdTnZbkbfx4nqmQMFDP5vwp", // Testnet USDC
    decimals: 6,
    logoURI: "/tokens/usdc.png",
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    mint: "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ", // Testnet USDT
    decimals: 6,
    logoURI: "/tokens/usdt.png",
  },
}

// NFT Collections for discounts
export const NFT_DISCOUNT_COLLECTIONS = {
  StickyPayVIP: {
    name: "StickyPay VIP",
    address: "VIPNFTCollectionAddressHere", // Replace with actual collection address
    discountPercentage: 10,
  },
  StickyPayFounder: {
    name: "StickyPay Founder",
    address: "FounderNFTCollectionAddressHere", // Replace with actual collection address
    discountPercentage: 15,
  },
}

// Verify NFT ownership for discount
export async function verifyNftOwnership(walletAddress: string, collectionNames: string[]): Promise<boolean> {
  try {
    // In a real implementation, this would:
    // 1. Query the Solana blockchain for NFTs owned by the wallet
    // 2. Check if any of the NFTs belong to the specified collections
    // 3. Return true if a matching NFT is found, false otherwise

    // For demo purposes, we'll simulate NFT ownership with a 50% chance
    // In a real app, you would use the Metaplex JS SDK or another NFT indexer
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

    // Simulate a 50% chance of having an NFT from the collections
    return Math.random() > 0.5
  } catch (error) {
    console.error("Error verifying NFT ownership:", error)
    return false
  }
}

// Send SOL directly (without using the smart contract)
export async function sendSol(
  connection: Connection,
  fromKeypair: Keypair,
  toPublicKey: PublicKey,
  amountSol: number,
  memo?: string,
): Promise<string> {
  try {
    // Create transaction
    const transaction = new Transaction()

    // Add transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKey,
        lamports: Math.floor(amountSol * LAMPORTS_PER_SOL),
      }),
    )

    // Add memo if provided
    if (memo) {
      transaction.add(
        new TransactionInstruction({
          keys: [],
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
          data: Buffer.from(memo, "utf8"),
        }),
      )
    }

    // Send and confirm transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair], {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    })

    return signature
  } catch (error) {
    console.error("Error sending SOL:", error)
    throw error
  }
}

// Check if a transaction is confirmed
export async function isTransactionConfirmed(connection: Connection, signature: string): Promise<boolean> {
  try {
    const status = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    })

    if (!status || !status.value) {
      return false
    }

    return status.value.confirmationStatus === "confirmed" || status.value.confirmationStatus === "finalized"
  } catch (error) {
    console.error("Error checking transaction status:", error)
    return false
  }
}

// Get transaction details
export async function getTransactionDetails(connection: Connection, signature: string) {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: "confirmed",
    })

    return transaction
  } catch (error) {
    console.error("Error getting transaction details:", error)
    throw error
  }
}

// Estimate transaction fee
export async function estimateTransactionFee(
  connection: Connection,
  transaction: Transaction,
  signers: PublicKey[],
): Promise<number> {
  try {
    const { feeCalculator } = await connection.getRecentBlockhash()
    return feeCalculator.lamportsPerSignature * signers.length
  } catch (error) {
    console.error("Error estimating transaction fee:", error)
    // Return a default estimate if calculation fails
    return 5000 * signers.length
  }
}

// Check if an account has sufficient balance for a transaction
export async function hasSufficientBalance(
  connection: Connection,
  publicKey: PublicKey,
  amountSol: number,
  estimatedFee = 5000,
): Promise<boolean> {
  try {
    const balance = await connection.getBalance(publicKey)
    const requiredLamports = Math.floor(amountSol * LAMPORTS_PER_SOL) + estimatedFee

    return balance >= requiredLamports
  } catch (error) {
    console.error("Error checking balance:", error)
    return false
  }
}

// Create a reliable connection
export function getReliableConnection(): Connection {
  return createConnection()
}
