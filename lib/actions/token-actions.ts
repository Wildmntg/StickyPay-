"use server"

import { z } from "zod"
import { STABLECOIN_TOKENS } from "@/lib/solana"

// Token schema
const tokenSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  mint: z.string(),
  decimals: z.number(),
  logoUrl: z.string().optional(),
  enabled: z.boolean().default(true),
})

export type TokenInfo = z.infer<typeof tokenSchema>

// Get all accepted tokens (only stablecoins)
export async function getAcceptedTokens(): Promise<TokenInfo[]> {
  // Convert STABLECOIN_TOKENS to TokenInfo array
  return Object.values(STABLECOIN_TOKENS).map((token) => ({
    symbol: token.symbol,
    name: token.name,
    mint: token.mint,
    decimals: token.decimals,
    logoUrl: token.logoURI,
    enabled: true,
  }))
}

// Update accepted tokens
export async function updateAcceptedTokens(tokens: TokenInfo[]): Promise<{ success: boolean; message?: string }> {
  try {
    // Validate tokens
    const validatedTokens = tokens.map((token) => tokenSchema.parse(token))

    // In a real app, this would update a database
    // For now, we'll just return success
    return { success: true }
  } catch (error) {
    console.error("Error updating accepted tokens:", error)
    return { success: false, message: "Failed to update tokens" }
  }
}

// Add a new token
export async function addToken(token: TokenInfo): Promise<{ success: boolean; message?: string }> {
  try {
    // Validate token
    const validatedToken = tokenSchema.parse(token)

    // In a real app, this would add to a database
    // For now, we'll just return success
    return { success: true }
  } catch (error) {
    console.error("Error adding token:", error)
    return { success: false, message: "Failed to add token" }
  }
}

// Remove a token
export async function removeToken(mint: string): Promise<{ success: boolean; message?: string }> {
  try {
    // In a real app, this would remove from a database
    // For now, we'll just return success
    return { success: true }
  } catch (error) {
    console.error("Error removing token:", error)
    return { success: false, message: "Failed to remove token" }
  }
}

// Toggle token enabled status
export async function toggleTokenStatus(
  mint: string,
  enabled: boolean,
): Promise<{ success: boolean; message?: string }> {
  try {
    // In a real app, this would update a database
    // For now, we'll just return success
    return { success: true }
  } catch (error) {
    console.error("Error toggling token status:", error)
    return { success: false, message: "Failed to update token status" }
  }
}

// Estimate token swap
export async function estimateTokenSwap(
  fromToken: string,
  toToken: string,
  amount: string,
): Promise<{
  success: boolean
  estimatedAmount?: string
  fee?: string
  priceImpact?: string
  error?: string
}> {
  try {
    // In a real app, this would call Jupiter API
    // For now, we'll return mock data
    const estimatedAmount = (Number(amount) * 0.98).toString() // 2% slippage
    const fee = (Number(amount) * 0.005).toString() // 0.5% fee
    const priceImpact = "0.1" // 0.1% price impact

    return {
      success: true,
      estimatedAmount,
      fee,
      priceImpact,
    }
  } catch (error) {
    console.error("Error estimating token swap:", error)
    return {
      success: false,
      error: "Failed to estimate token swap",
    }
  }
}

async function getConfig() {
  return {
    defaultAcceptedTokens: ["SOL", "USDC", "BONK", "JUP", "RAY", "ORCA", "MNGO", "SRM"],
  }
}

// Get merchant's accepted tokens
export async function getMerchantAcceptedTokens(merchantId: string): Promise<string[]> {
  // Only return stablecoins
  return ["USDC", "USDT"]
}

// Update merchant's accepted tokens
export async function updateMerchantAcceptedTokens(merchantId: string, tokens: string[]): Promise<boolean> {
  // In a real app, this would update a database
  // Only allow stablecoins
  const validTokens = tokens.filter((token) => token === "USDC" || token === "USDT")
  console.log(`Updating accepted tokens for merchant ${merchantId}:`, validTokens)
  return true
}

export async function getDefaultAcceptedTokens(): Promise<string[]> {
  // Only return stablecoins
  return ["USDC", "USDT"]
}

async function getTokenExchangeRates(): Promise<{ [key: string]: number }> {
  // In a real app, this would fetch from an API or database
  // For now, we'll return mock data
  return {
    SOL: 100,
    USDC: 1,
    BONK: 0.0001,
  }
}

export async function getTokenExchangeRate(
  fromToken: string,
  toToken = "USDC",
): Promise<{ rate: number; lastUpdated: string }> {
  const exchangeRates = await getTokenExchangeRates()
  const fromRate = exchangeRates[fromToken] || 1
  const toRate = exchangeRates[toToken] || 1

  return {
    rate: fromRate / toRate,
    lastUpdated: new Date().toISOString(),
  }
}
