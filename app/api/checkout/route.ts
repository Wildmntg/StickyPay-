import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const checkoutSchema = z.object({
  name: z.string().min(2),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0),
  description: z.string().optional(),
  enableNftDiscounts: z.boolean().default(false),
  redirectUrl: z.string().url().optional().or(z.literal("")),
  merchantId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request body
    const result = checkoutSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Invalid request data", details: result.error.format() }, { status: 400 })
    }

    // Generate a unique session ID
    const sessionId = crypto.randomUUID()

    // In a real app, we would store the checkout session in a database
    // and associate it with the merchant

    // Return the checkout session details
    return NextResponse.json({
      success: true,
      sessionId,
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${sessionId}`,
      data: result.data,
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
  }

  // In a real app, we would fetch the checkout session from a database

  // For demo purposes, return mock data
  return NextResponse.json({
    success: true,
    session: {
      id: sessionId,
      name: "Premium Subscription",
      amount: "49.99",
      description: "Monthly subscription to premium services",
      status: "active",
      createdAt: new Date().toISOString(),
    },
  })
}
