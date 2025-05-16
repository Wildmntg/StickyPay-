"use client"

import { StickyPayTester } from "@/components/anchor/stickypay-tester"
import { ResponsiveContainer } from "@/components/layout/responsive-container"

export default function TestSmartContractPage() {
  return (
    <ResponsiveContainer className="py-8">
      <h1 className="mb-8 text-2xl font-bold">Test StickyPay Smart Contract</h1>
      <p className="mb-6 text-muted-foreground">
        This page allows you to test the StickyPay smart contract on the Solana blockchain. The smart contract handles
        payment processing between wallets with built-in fee handling and payment verification.
      </p>
      <StickyPayTester />
    </ResponsiveContainer>
  )
}
