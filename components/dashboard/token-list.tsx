"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import {
  getAcceptedTokens,
  getMerchantAcceptedTokens,
  updateMerchantAcceptedTokens,
  type TokenInfo,
} from "@/lib/actions/token-actions"

interface TokenListProps {
  merchantId: string
}

export function TokenList({ merchantId }: TokenListProps) {
  const { toast } = useToast()
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [acceptedTokens, setAcceptedTokens] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [allTokens, merchantTokens] = await Promise.all([
          getAcceptedTokens(),
          getMerchantAcceptedTokens(merchantId),
        ])

        setTokens(allTokens)
        setAcceptedTokens(merchantTokens)
      } catch (error) {
        console.error("Error loading token data:", error)
        toast({
          title: "Error",
          description: "Failed to load token data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [merchantId, toast])

  const handleTokenToggle = (symbol: string) => {
    setAcceptedTokens((prev) => {
      const isCurrentlyAccepted = prev.includes(symbol)

      if (isCurrentlyAccepted) {
        // Don't allow removing all tokens - keep at least one
        if (prev.length <= 1) {
          toast({
            title: "Error",
            description: "You must accept at least one token",
            variant: "destructive",
          })
          return prev
        }
        return prev.filter((t) => t !== symbol)
      } else {
        return [...prev, symbol]
      }
    })

    setHasChanges(true)
  }

  const saveChanges = async () => {
    try {
      setSaving(true)
      await updateMerchantAcceptedTokens(merchantId, acceptedTokens)

      toast({
        title: "Success",
        description: "Token settings updated successfully",
      })

      setHasChanges(false)
    } catch (error) {
      console.error("Error saving token settings:", error)
      toast({
        title: "Error",
        description: "Failed to save token settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span>Loading tokens...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {tokens.map((token) => (
          <div key={token.symbol} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center">
              <div className="relative mr-3 h-8 w-8">
                <Image
                  src={token.logoUrl || `/placeholder.svg?height=32&width=32&query=${token.symbol}`}
                  alt={token.name}
                  fill
                  className="rounded-full"
                />
              </div>
              <div>
                <div className="font-medium">{token.name}</div>
                <div className="text-sm text-muted-foreground">{token.symbol}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id={`token-${token.symbol}`}
                checked={acceptedTokens.includes(token.symbol)}
                onCheckedChange={() => handleTokenToggle(token.symbol)}
              />
              <Label htmlFor={`token-${token.symbol}`}>
                {acceptedTokens.includes(token.symbol) ? "Accepted" : "Not Accepted"}
              </Label>
            </div>
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={saveChanges} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
