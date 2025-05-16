"use server"

// Get merchant's settlement token
export async function getMerchantSettlementToken(merchantId: string): Promise<string> {
  // In a real app, this would fetch from a database
  // For now, we'll return a hardcoded value
  return "USDC"
}

// Update merchant's settlement token
export async function updateMerchantSettlementToken(merchantId: string, token: string): Promise<boolean> {
  // In a real app, this would update a database
  console.log(`Updating settlement token for merchant ${merchantId} to ${token}`)
  return true
}

// Get merchant profile
export async function getMerchantProfile(merchantId: string): Promise<{
  name: string
  walletAddress: string
  settlementToken: string
  acceptsMultipleTokens: boolean
}> {
  // In a real app, this would fetch from a database
  return {
    name: "Demo Merchant",
    walletAddress: "5FHwkrdxD5AKmYrGQPqGJGWFzwxrJnGMXwGCadQhNHWV",
    settlementToken: "USDC",
    acceptsMultipleTokens: true,
  }
}

// Update merchant profile
export async function updateMerchantProfile(
  merchantId: string,
  profile: {
    name?: string
    walletAddress?: string
    settlementToken?: string
    acceptsMultipleTokens?: boolean
  },
): Promise<boolean> {
  // In a real app, this would update a database
  console.log(`Updating profile for merchant ${merchantId}:`, profile)
  return true
}
