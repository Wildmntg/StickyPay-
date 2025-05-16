"use client"

import { useState, useEffect } from "react"
import { getFeatureFlags } from "@/lib/actions/feature-flags"

export function FeatureFlagExample() {
  const [flags, setFlags] = useState<{
    enableMultiToken: boolean
    enableNftDiscounts: boolean
  }>({
    enableMultiToken: false,
    enableNftDiscounts: false,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFlags() {
      try {
        const featureFlags = await getFeatureFlags()
        setFlags(featureFlags)
      } catch (error) {
        console.error("Failed to load feature flags:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFlags()
  }, [])

  if (loading) {
    return <div>Loading feature flags...</div>
  }

  return (
    <div className="space-y-4 p-4 rounded-md border">
      <h3 className="font-medium">Feature Flags</h3>
      <ul className="space-y-2">
        <li>
          Multi-token support: <span className="font-medium">{flags.enableMultiToken ? "Enabled" : "Disabled"}</span>
        </li>
        <li>
          NFT discounts: <span className="font-medium">{flags.enableNftDiscounts ? "Enabled" : "Disabled"}</span>
        </li>
      </ul>
    </div>
  )
}
