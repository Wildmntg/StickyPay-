import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RpcConnectionTester } from "@/components/solana/rpc-connection-tester"
import { WalletBalanceChecker } from "@/components/solana/wallet-balance-checker"

export default function SolanaToolsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Solana Tools</h1>
      <p className="mb-8 text-muted-foreground">Utilities for testing and interacting with the Solana blockchain</p>

      <Tabs defaultValue="connection" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <RpcConnectionTester />

            <Card>
              <CardHeader>
                <CardTitle>Solana Configuration</CardTitle>
                <CardDescription>Current Solana configuration for SolPay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="font-medium">RPC Endpoint: </span>
                        <span className="break-all">{process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT}</span>
                      </div>
                      <div>
                        <span className="font-medium">App URL: </span>
                        <span>{process.env.NEXT_PUBLIC_APP_URL}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md bg-muted p-4 text-sm">
                    <p className="font-medium">Environment Variables Status:</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      <li
                        className={
                          process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        NEXT_PUBLIC_SOLANA_RPC_ENDPOINT:{" "}
                        {process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT ? "✓ Set" : "✗ Not Set"}
                      </li>
                      <li
                        className={
                          process.env.NEXT_PUBLIC_APP_URL
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        NEXT_PUBLIC_APP_URL: {process.env.NEXT_PUBLIC_APP_URL ? "✓ Set" : "✗ Not Set"}
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <WalletBalanceChecker />

            <Card>
              <CardHeader>
                <CardTitle>Wallet Information</CardTitle>
                <CardDescription>Information about Solana wallets and testing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="mb-2 font-medium">Test Wallets</h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      On Solana devnet, you can create test wallets and request airdrops for testing.
                    </p>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="font-medium">Example Test Wallet:</div>
                      <code className="block rounded bg-muted p-2 text-xs">
                        8YUkX4HL8oEyUEwgBK7ndZ5kYZCJPjKJTLXnTzY2zLV3
                      </code>
                      <p className="text-xs text-muted-foreground">
                        Note: This is just an example address. You should use your own wallet for testing.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md bg-muted p-4 text-sm">
                    <h3 className="mb-2 font-medium">Devnet Limitations</h3>
                    <ul className="list-inside list-disc space-y-1">
                      <li>Airdrops are limited to 1-2 SOL per request</li>
                      <li>There may be rate limits on RPC requests</li>
                      <li>Transactions might occasionally fail due to network congestion</li>
                      <li>Devnet is occasionally reset, which clears all accounts</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
