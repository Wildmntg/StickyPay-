"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle } from "lucide-react"
import { formatAmount } from "@/lib/utils"

interface TransactionConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  recipient: string
  amount: string
  memo?: string
  isLoading?: boolean
  walletBalance?: number | null
  estimatedFee?: number
}

export function TransactionConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  recipient,
  amount,
  memo,
  isLoading = false,
  walletBalance = null,
  estimatedFee = 0.000005,
}: TransactionConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
    } finally {
      setIsConfirming(false)
    }
  }

  const parsedAmount = Number.parseFloat(amount) || 0
  const totalAmount = parsedAmount + estimatedFee
  const hasInsufficientFunds = walletBalance !== null && walletBalance < totalAmount

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Transaction</DialogTitle>
          <DialogDescription>Please review the transaction details before confirming.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">From</span>
              <span className="text-sm">Your wallet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">To</span>
              <span className="text-sm font-mono text-xs truncate max-w-[200px]">{recipient}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Amount</span>
              <span className="text-sm font-medium">{formatAmount(parsedAmount)} SOL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Network Fee</span>
              <span className="text-sm">{formatAmount(estimatedFee)} SOL</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-medium">{formatAmount(totalAmount)} SOL</span>
              </div>
            </div>
            {memo && (
              <div className="mt-4">
                <span className="text-sm font-medium text-muted-foreground">Memo</span>
                <p className="text-sm mt-1 bg-muted p-2 rounded">{memo}</p>
              </div>
            )}
          </div>

          {hasInsufficientFunds && (
            <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Insufficient funds</p>
                <p className="text-xs mt-1">
                  You have {formatAmount(walletBalance || 0)} SOL but need {formatAmount(totalAmount)} SOL (including
                  fees).
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading || isConfirming}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || isConfirming || hasInsufficientFunds}
            className="sm:ml-2"
          >
            {isConfirming || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
