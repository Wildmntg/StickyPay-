"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function ScanPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the user dashboard home page which now has the camera
    router.push("/user-dashboard")
  }, [router])

  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Redirecting to scanner...</p>
      </div>
    </div>
  )
}
