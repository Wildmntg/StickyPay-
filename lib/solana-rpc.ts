import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"

// Get the RPC endpoint from environment variables
const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com"

// Create a reusable connection instance
export const connection = new Connection(rpcEndpoint, "confirmed")

/**
 * Test the connection to the Solana RPC endpoint
 */
export async function testConnection(): Promise<{
  success: boolean
  message: string
  latency: number
  slot?: number
  version?: string
  error?: string
}> {
  const startTime = Date.now()

  try {
    // Get the current slot (simple RPC call to test connection)
    const slot = await connection.getSlot()

    // Get the version of the node
    const version = await connection.getVersion()

    const endTime = Date.now()
    const latency = endTime - startTime

    return {
      success: true,
      message: "Successfully connected to Solana RPC endpoint",
      latency,
      slot,
      version: version.solana,
    }
  } catch (error) {
    const endTime = Date.now()
    const latency = endTime - startTime

    return {
      success: false,
      message: "Failed to connect to Solana RPC endpoint",
      latency,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Get the SOL balance for a wallet address
 */
export async function getSolBalance(address: string): Promise<{
  success: boolean
  balance?: number
  error?: string
}> {
  try {
    const publicKey = new PublicKey(address)
    const balance = await connection.getBalance(publicKey)

    return {
      success: true,
      balance: balance / LAMPORTS_PER_SOL,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Get the network name from the RPC endpoint
 */
export function getNetworkName(): string {
  if (rpcEndpoint.includes("devnet")) {
    return "Devnet"
  } else if (rpcEndpoint.includes("testnet")) {
    return "Testnet"
  } else if (rpcEndpoint.includes("mainnet")) {
    return "Mainnet"
  } else {
    return "Custom"
  }
}

/**
 * Airdrop SOL to a wallet (only works on devnet and testnet)
 */
export async function requestAirdrop(
  address: string,
  amount = 1,
): Promise<{
  success: boolean
  signature?: string
  error?: string
}> {
  try {
    const publicKey = new PublicKey(address)
    const signature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL)

    // Wait for confirmation
    await connection.confirmTransaction(signature)

    return {
      success: true,
      signature,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
