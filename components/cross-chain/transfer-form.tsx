"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface TransferFormProps {
  destinationAddress?: string
  amount?: string
  onTransferComplete?: (transferId: string) => void
  settlementToken?: string
}

export function CrossChainTransferForm({
  destinationAddress,
  amount,
  onTransferComplete,
  settlementToken,
}: TransferFormProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cross-Chain Transfer</CardTitle>
        <CardDescription>Transfer tokens between blockchains</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Feature Unavailable</AlertTitle>
          <AlertDescription>
            Cross-chain transfers are currently unavailable. Please use the Solana payment options instead.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Export TransferForm as an alias to CrossChainTransferForm for backward compatibility
export { CrossChainTransferForm as TransferForm }
