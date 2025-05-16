import { SimplePaymentTester } from "@/components/anchor/simple-payment-tester"
import { ResponsiveContainer } from "@/components/layout/responsive-container"

export default function TestSimpleContractPage() {
  return (
    <ResponsiveContainer className="py-8">
      <h1 className="mb-8 text-2xl font-bold">Test Simple Payment Contract</h1>
      <p className="mb-6 text-muted-foreground">
        This page allows you to test the simplified payment smart contract on the Solana blockchain. The smart contract
        handles direct SOL and token transfers between wallets.
      </p>
      <div className="flex justify-center">
        <SimplePaymentTester />
      </div>
    </ResponsiveContainer>
  )
}
