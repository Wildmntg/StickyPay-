"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

export default function TransactionDebugger() {
  const [signature, setSignature] = useState("")
  const [transactionInfo, setTransactionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactionInfo = async () => {
    if (!signature) return

    setLoading(true)
    setError(null)

    try {
      // In a real app, this would call the Solana RPC to get transaction info
      // For demo purposes, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate a successful transaction lookup
      if (signature.length > 20) {
        setTransactionInfo({
          signature,
          slot: 123456789,
          blockTime: new Date().toISOString(),
          status: "confirmed",
          fee: 0.000005,
          tokenTransfers: [
            {
              source: "8YUkX4HL8oEyUEwgBK7ndZ5kYZCJPjKJTLXnTzY2zLV3",
              destination: "7YUkX4HL8oEyUEwgBK7ndZ5kYZCJPjKJTLXnTzY2zLV3",
              amount: 49.99,
              token: "SOL",
            },
          ],
        })
      } else {
        throw new Error("Transaction not found. Please check the signature and try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setTransactionInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Transaction Debugger</CardTitle>
        <CardDescription>Debug Solana transactions by signature</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="signature">Transaction Signature</Label>
            <Input
              id="signature"
              placeholder="Enter transaction signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {transactionInfo && (
          <div className="mt-4 space-y-4">
            <div className="rounded-md border p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">Transaction Status</h3>
                <Badge variant="outline" className={`${getStatusColor(transactionInfo.status)} text-white`}>
                  {transactionInfo.status.charAt(0).toUpperCase() + transactionInfo.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Slot:</span> {transactionInfo.slot}
                </div>
                <div>
                  <span className="font-medium">Block Time:</span>{" "}
                  {new Date(transactionInfo.blockTime).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Fee:</span> {transactionInfo.fee} SOL
                </div>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <h3 className="mb-2 font-medium">Token Transfers</h3>
              {transactionInfo.tokenTransfers.map((transfer: any, index: number) => (
                <div key={index} className="mb-2 rounded-md bg-muted p-2 text-sm">
                  <div>
                    <span className="font-medium">From:</span> {transfer.source}
                  </div>
                  <div>
                    <span className="font-medium">To:</span> {transfer.destination}
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span> {transfer.amount} {transfer.token}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Link
                href={`https://explorer.solana.com/tx/${signature}`}
                target="_blank"
                className="inline-flex items-center text-sm text-blue-500 hover:underline"
              >
                View on Solana Explorer
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchTransactionInfo} disabled={loading} className="w-full">
          {loading ? "Loading..." : "Debug Transaction"}
        </Button>
      </CardFooter>
    </Card>
  )
}
