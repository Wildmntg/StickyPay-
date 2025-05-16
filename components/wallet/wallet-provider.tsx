"use client"

import type React from "react"

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import { useMemo } from "react"

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css"

interface SolanaWalletProviderProps {
  children: React.ReactNode
  endpoint?: string
  network?: WalletAdapterNetwork
}

export function SolanaWalletProvider({
  children,
  endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.testnet.solana.com",
  network = WalletAdapterNetwork.Testnet,
}: SolanaWalletProviderProps) {
  // Set up wallet adapters
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })], [network])

  // Use provided endpoint or fallback to clusterApiUrl
  const rpcEndpoint = useMemo(() => endpoint || clusterApiUrl(network), [endpoint, network])

  return (
    <ConnectionProvider endpoint={rpcEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
