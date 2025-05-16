import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full">
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <Sidebar />
    </div>
  )
}
