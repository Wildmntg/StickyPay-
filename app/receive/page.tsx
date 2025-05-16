"use client"

import { ReceiverWallet } from "@/components/checkout/receiver-wallet"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ReceivePage() {
  const router = useRouter()

  return (
    <div className="container mx-auto flex min-h-screen flex-col overflow-auto py-8">
      <header className="mb-8 flex items-center justify-between px-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
        <h1 className="mb-6 text-center text-2xl font-bold">Receive Payment</h1>
        <ReceiverWallet />
      </main>
    </div>
  )
}
