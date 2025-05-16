import { type Connection, PublicKey } from "@solana/web3.js"
import { getAssociatedTokenAddress } from "@solana/spl-token"

// Testnet token mints
export const TESTNET_TOKENS = {
  USDC: new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),
  BONK: new PublicKey("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"),
  JUP: new PublicKey("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"),
}

// Check if a user has a token account for a specific token
export async function hasTokenAccount(
  connection: Connection,
  walletAddress: PublicKey,
  tokenMint: PublicKey,
): Promise<boolean> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(tokenMint, walletAddress)
    const accountInfo = await connection.getAccountInfo(tokenAccount)
    return accountInfo !== null
  } catch (error) {
    console.error("Error checking token account:", error)
    return false
  }
}

// Get token balance for a specific token
export async function getTokenBalance(
  connection: Connection,
  walletAddress: PublicKey,
  tokenMint: PublicKey,
): Promise<number | null> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(tokenMint, walletAddress)
    const accountInfo = await connection.getAccountInfo(tokenAccount)

    if (!accountInfo) {
      return null
    }

    const accountData = await connection.getTokenAccountBalance(tokenAccount)
    return Number(accountData.value.uiAmount)
  } catch (error) {
    console.error("Error getting token balance:", error)
    return null
  }
}

// Get testnet token faucet URL
export function getTokenFaucetUrl(tokenMint: PublicKey): string {
  // These are example URLs - replace with actual testnet token faucet URLs if available
  if (tokenMint.equals(TESTNET_TOKENS.USDC)) {
    return "https://spl-token-faucet.com/?token-name=USDC-Dev"
  } else if (tokenMint.equals(TESTNET_TOKENS.BONK)) {
    return "https://spl-token-faucet.com/?token-name=BONK-Dev"
  } else if (tokenMint.equals(TESTNET_TOKENS.JUP)) {
    return "https://spl-token-faucet.com/?token-name=JUP-Dev"
  }

  // Default to a general SPL token faucet
  return "https://spl-token-faucet.com/"
}
