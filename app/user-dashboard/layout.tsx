import type React from "react"
import ErrorBoundary from "@/components/ui/error-boundary"

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">{children}</div>
    </ErrorBoundary>
  )
}
