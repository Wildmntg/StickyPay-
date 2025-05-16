"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Simulate logout process
    const logout = async () => {
      // In a real app, this would call an API to invalidate the session
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })

      router.push("/")
    }

    logout()
  }, [router, toast])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Logging out...</p>
    </div>
  )
}
