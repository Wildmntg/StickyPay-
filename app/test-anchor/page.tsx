"use client"

import { AnchorPaymentTester } from "@/components/anchor/payment-tester"
import { ResponsiveContainer } from "@/components/layout/responsive-container"

export default function TestAnchorPage() {
  return (
    <ResponsiveContainer className="py-8">
      <h1 className="mb-8 text-2xl font-bold">Test Anchor Program</h1>
      <AnchorPaymentTester />
    </ResponsiveContainer>
  )
}
