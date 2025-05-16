import { Connection, type ConnectionConfig } from "@solana/web3.js"

// Default RPC endpoints
const RPC_ENDPOINTS = {
  mainnet: "https://api.mainnet-beta.solana.com",
  testnet: "https://api.testnet.solana.com",
  devnet: "https://api.devnet.solana.com",
}

// Get the appropriate RPC endpoint based on environment
export function getRpcEndpoint(): string {
  // Use environment variable if available
  if (process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT) {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT
  }

  // Otherwise use the default endpoint based on network
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"

  switch (network) {
    case "mainnet-beta":
      return RPC_ENDPOINTS.mainnet
    case "testnet":
      return RPC_ENDPOINTS.testnet
    case "devnet":
      return RPC_ENDPOINTS.devnet
    default:
      return RPC_ENDPOINTS.testnet
  }
}

// Create a connection with optimal configuration
export function createConnection(endpoint?: string, config?: ConnectionConfig): Connection {
  const rpcEndpoint = endpoint || getRpcEndpoint()

  const defaultConfig: ConnectionConfig = {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000, // 60 seconds
    disableRetryOnRateLimit: false,
  }

  return new Connection(rpcEndpoint, config || defaultConfig)
}

// Get a backup connection if the primary one fails
export function getBackupConnection(): Connection {
  // Use a different RPC provider as backup
  const backupEndpoints = {
    mainnet: "https://solana-api.projectserum.com",
    testnet: "https://testnet.solana.com",
    devnet: "https://devnet.solana.com",
  }

  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"
  let backupEndpoint = backupEndpoints.testnet

  switch (network) {
    case "mainnet-beta":
      backupEndpoint = backupEndpoints.mainnet
      break
    case "testnet":
      backupEndpoint = backupEndpoints.testnet
      break
    case "devnet":
      backupEndpoint = backupEndpoints.devnet
      break
  }

  return createConnection(backupEndpoint)
}
