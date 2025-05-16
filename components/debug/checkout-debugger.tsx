"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function CheckoutDebugger() {
  const [sessionId, setSessionId] = useState("")
  const [checkoutInfo, setCheckoutInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCheckoutInfo = async () => {
    if (!sessionId) return

    setLoading(true)
    setError(null)

    try {
      // In a real app, this would call the SolPay API to get checkout info
      // For demo purposes, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate a successful checkout lookup
      if (sessionId.length > 5) {
        setCheckoutInfo({
          id: sessionId,
          name: "Premium Subscription",
          amount: 49.99,
          status: "active",
          createdAt: new Date().toISOString(),
        })
      } else {
        throw new Error("Checkout session not found. Please check the session ID and try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setCheckoutInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "completed":
        return "bg-blue-500"
      case "expired":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Checkout Session Debugger</CardTitle>
        <CardDescription>Debug checkout sessions by session ID</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="session-id">Session ID</Label>
            <Input
              id="session-id"
              placeholder="Enter checkout session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {checkoutInfo && (
          <div className="mt-4 space-y-4">
            <div className="rounded-md border p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">Checkout Session Details</h3>
                <Badge variant="outline" className={`${getStatusColor(checkoutInfo.status)} text-white`}>
                  {checkoutInfo.status.charAt(0).toUpperCase() + checkoutInfo.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">ID:</span> {checkoutInfo.id}
                </div>
                <div>
                  <span className="font-medium">Name:</span> {checkoutInfo.name}
                </div>
                <div>
                  <span className="font-medium">Amount:</span> {checkoutInfo.amount}
                </div>
                <div>
                  <span className="font-medium">Created At:</span> {new Date(checkoutInfo.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchCheckoutInfo} disabled={loading} className="w-full">
          {loading ? "Loading..." : "Debug Checkout Session"}
        </Button>
      </CardFooter>
    </Card>
  )
}
