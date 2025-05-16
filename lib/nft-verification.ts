"use server"

// Interface for NFT collection
export interface NftCollection {
  name: string
  address: string
  discountPercentage: number
}

// Default NFT collections that provide discounts
export const DEFAULT_NFT_COLLECTIONS: NftCollection[] = [
  {
    name: "StickyPay Membership",
    address: "SPAYNftMembershipCollection111111111111111111",
    discountPercentage: 10,
  },
  {
    name: "StickyPay Premium",
    address: "SPAYNftPremiumCollection1111111111111111111",
    discountPercentage: 20,
  },
]

/**
 * Verify if a wallet owns NFTs from specific collections
 */
export async function verifyNftOwnership(
  walletAddress: string,
  collections: NftCollection[] = DEFAULT_NFT_COLLECTIONS,
): Promise<{
  hasNft: boolean
  collection?: NftCollection
  discountPercentage: number
}> {
  try {
    // In a real implementation, this would query the Solana blockchain
    // For now, we'll simulate NFT ownership based on the wallet address

    // This is a placeholder implementation
    // In production, you would use the Metaplex SDK or similar to query NFT ownership

    // For testing, we'll return true for specific wallet addresses
    const testWallets = [
      "DummyWalletWithNFT111111111111111111111111111",
      "AnotherWalletWithNFT22222222222222222222222222",
    ]

    if (testWallets.includes(walletAddress)) {
      // Return the first collection for test wallets
      return {
        hasNft: true,
        collection: collections[0],
        discountPercentage: collections[0].discountPercentage,
      }
    }

    // For real implementation, you would:
    // 1. Connect to Solana
    // 2. Query the wallet's NFT holdings
    // 3. Check if any NFTs belong to the specified collections
    // 4. Return the appropriate discount

    return {
      hasNft: false,
      discountPercentage: 0,
    }
  } catch (error) {
    console.error("Error verifying NFT ownership:", error)
    return {
      hasNft: false,
      discountPercentage: 0,
    }
  }
}

/**
 * Get all NFT collections that provide discounts
 */
export async function getDiscountNftCollections(): Promise<NftCollection[]> {
  // In a real implementation, this might fetch from a database
  return DEFAULT_NFT_COLLECTIONS
}

/**
 * Calculate discount amount based on NFT ownership
 */
export async function calculateNftDiscount(
  amount: number,
  discountPercentage: number,
): Promise<{
  discountedAmount: number
  discountValue: number
}> {
  const discountValue = (amount * discountPercentage) / 100
  const discountedAmount = amount - discountValue

  return {
    discountedAmount,
    discountValue,
  }
}
