"use client"

import Image from "next/image"
import { useState } from "react"

interface TokenIconProps {
  symbol: string
  className?: string
  size?: number
}

export function TokenIcon({ symbol, className = "", size = 20 }: TokenIconProps) {
  const [error, setError] = useState(false)

  if (!symbol || error) {
    // Fallback to a circle with the first letter
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gray-200 text-gray-700 ${className}`}
        style={{ width: size, height: size }}
      >
        {symbol ? symbol.charAt(0).toUpperCase() : "?"}
      </div>
    )
  }

  const tokenSymbol = symbol.toUpperCase()
  const imagePath = `/tokens/${tokenSymbol.toLowerCase()}.png`

  return (
    <div className={`rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <Image
        src={imagePath || "/placeholder.svg"}
        alt={tokenSymbol}
        width={size}
        height={size}
        onError={() => setError(true)}
      />
    </div>
  )
}
