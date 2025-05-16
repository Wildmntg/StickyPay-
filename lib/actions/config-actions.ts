"use server"

export async function getConfig() {
  return {
    enableMultiToken: false, // Always false now
    enableNftDiscounts: process.env.NEXT_PUBLIC_ENABLE_NFT_DISCOUNTS === "true",
  }
}

export async function getFeatureFlags() {
  return {
    enableMultiToken: false, // Always false now
    enableNftDiscounts: process.env.NEXT_PUBLIC_ENABLE_NFT_DISCOUNTS === "true",
  }
}
