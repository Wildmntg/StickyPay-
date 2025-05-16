import { z } from "zod"

// Define the checkout session schema
export const checkoutSessionSchema = z.object({
  id: z.string().uuid(),
  merchantId: z.string(),
  name: z.string().min(2),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0),
  description: z.string().optional(),
  status: z.enum(["active", "completed", "expired", "cancelled"]),
  paymentAddress: z.string(),
  enableNftDiscounts: z.boolean().default(false),
  nftDiscountCollections: z.array(z.string()).optional(),
  nftDiscountPercentage: z.number().min(0).max(100).optional(),
  redirectUrl: z.string().url().optional().or(z.literal("")),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
})

export type CheckoutSession = z.infer<typeof checkoutSessionSchema>

// Define the transaction schema
export const transactionSchema = z.object({
  id: z.string(),
  sessionId: z.string().uuid(),
  merchantId: z.string(),
  customerWallet: z.string(),
  amount: z.string(),
  token: z.string(), // Always USDC or USDT
  status: z.enum(["pending", "confirmed", "failed"]),
  signature: z.string(),
  timestamp: z.string().datetime(),
})

export type Transaction = z.infer<typeof transactionSchema>

// Helper function to create a checkout session
export async function createCheckoutSession(data: {
  merchantId: string
  name: string
  amount: string
  description?: string
  enableNftDiscounts?: boolean
  redirectUrl?: string
}): Promise<CheckoutSession | null> {
  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create checkout session")
    }

    const result = await response.json()
    return result.session
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return null
  }
}

// Helper function to get a checkout session
export async function getCheckoutSession(sessionId: string): Promise<CheckoutSession | null> {
  try {
    const response = await fetch(`/api/checkout?sessionId=${sessionId}`)

    if (!response.ok) {
      throw new Error("Failed to get checkout session")
    }

    const result = await response.json()
    return result.session
  } catch (error) {
    console.error("Error getting checkout session:", error)
    return null
  }
}

// Helper function to process a transaction
export async function processTransaction(data: {
  sessionId: string
  transaction: string
  customerWallet: string
}): Promise<Transaction | null> {
  try {
    const response = await fetch("/api/solana", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to process transaction")
    }

    const result = await response.json()
    return result.transaction
  } catch (error) {
    console.error("Error processing transaction:", error)
    return null
  }
}
