import { DirectSolTransfer } from "@/components/debug/direct-sol-transfer"

export default function TestDirectTransferPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Test Direct SOL Transfer</h1>
      <p className="mb-6 text-muted-foreground">
        This page allows you to test direct SOL transfers without using the smart contract. Use this to verify that your
        wallet can send SOL correctly.
      </p>

      <div className="flex justify-center">
        <DirectSolTransfer />
      </div>
    </div>
  )
}
