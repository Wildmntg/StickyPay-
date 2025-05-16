import { TokenTester } from "@/components/testnet/token-tester"

export default function TestnetTokensPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Testnet Tokens</h1>
      <div className="flex justify-center">
        <TokenTester />
      </div>
    </div>
  )
}
