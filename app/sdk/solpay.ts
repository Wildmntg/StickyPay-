// This file would be the main SDK entry point for developers to integrate SolPay

export interface SolPayConfig {
  apiKey: string
  merchantId: string
  environment?: "production" | "development"
  redirectUrl?: string
}

export interface CreateCheckoutOptions {
  name: string
  amount: string | number
  description?: string
  enableNftDiscounts?: boolean
  nftDiscountCollections?: string[]
  nftDiscountPercentage?: number
  redirectUrl?: string
  metadata?: Record<string, any>
}

export interface CheckoutResponse {
  sessionId: string
  checkoutUrl: string
  qrCodeUrl: string
}

export class SolPay {
  private config: SolPayConfig
  private baseUrl: string

  constructor(config: SolPayConfig) {
    this.config = config
    this.baseUrl = config.environment === "production" ? "https://api.solpay.com" : "https://api.dev.solpay.com"
  }

  /**
   * Create a checkout session
   */
  async createCheckout(options: CreateCheckoutOptions): Promise<CheckoutResponse> {
    // In a real SDK, this would make an API call to create a checkout session
    // For demo purposes, return a mock response
    const sessionId = `session_${Math.random().toString(36).substring(2, 15)}`

    return {
      sessionId,
      checkoutUrl: `https://checkout.solpay.com/${sessionId}`,
      qrCodeUrl: `https://checkout.solpay.com/qr/${sessionId}`,
    }
  }

  /**
   * Get a checkout session
   */
  async getCheckout(sessionId: string): Promise<any> {
    // In a real SDK, this would make an API call to get a checkout session
    // For demo purposes, return a mock response
    return {
      id: sessionId,
      status: "active",
      name: "Example Checkout",
      amount: "49.99",
      description: "Example checkout session",
      createdAt: new Date().toISOString(),
    }
  }

  /**
   * Get transactions for a checkout session
   */
  async getTransactions(sessionId: string): Promise<any[]> {
    // In a real SDK, this would make an API call to get transactions
    // For demo purposes, return a mock response
    return [
      {
        id: `tx_${Math.random().toString(36).substring(2, 15)}`,
        sessionId,
        status: "confirmed",
        amount: "49.99",
        token: "SOL",
        convertedAmount: "49.99",
        convertedToken: "USDC",
        timestamp: new Date().toISOString(),
      },
    ]
  }

  /**
   * Verify NFT ownership for discounts
   */
  async verifyNftOwnership(walletAddress: string, collectionAddress: string): Promise<boolean> {
    // In a real SDK, this would make an API call to verify NFT ownership
    // For demo purposes, return a mock response
    return true
  }
}

// Example usage:
// const solpay = new SolPay({
//   apiKey: 'your-api-key',
//   merchantId: 'your-merchant-id',
//   environment: 'development',
// });
//
// const checkout = await solpay.createCheckout({
//   name: 'Premium Subscription',
//   amount: 49.99,
//   description: 'Monthly subscription to premium services',
// });
