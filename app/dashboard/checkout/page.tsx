"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Search, QrCode, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock data for checkout sessions
const checkoutSessions = [
  {
    id: "1",
    name: "Premium Subscription",
    amount: "49.99",
    status: "active",
    createdAt: "2023-05-01T12:00:00Z",
    url: "/checkout/1",
  },
  {
    id: "2",
    name: "Basic Plan",
    amount: "19.99",
    status: "completed",
    createdAt: "2023-04-28T10:30:00Z",
    url: "/checkout/2",
  },
  {
    id: "3",
    name: "Pro Package",
    amount: "99.99",
    status: "expired",
    createdAt: "2023-04-25T15:45:00Z",
    url: "/checkout/3",
  },
  {
    id: "4",
    name: "One-time Purchase",
    amount: "149.99",
    status: "active",
    createdAt: "2023-04-20T09:15:00Z",
    url: "/checkout/4",
  },
  {
    id: "5",
    name: "Enterprise License",
    amount: "499.99",
    status: "completed",
    createdAt: "2023-04-15T14:20:00Z",
    url: "/checkout/5",
  },
]

export default function CheckoutPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSessions = checkoutSessions.filter(
    (session) => session.name.toLowerCase().includes(searchQuery.toLowerCase()) || session.id.includes(searchQuery),
  )

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The checkout URL has been copied to your clipboard.",
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "completed":
        return "bg-blue-500"
      case "expired":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Checkout Sessions</h2>
        <Link href="/dashboard/checkout/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Checkout
          </Button>
        </Link>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search checkout sessions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No checkout sessions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.name}</TableCell>
                  <TableCell>${session.amount} USDC</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(session.status)} text-white`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(session.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => copyToClipboard(`https://example.com${session.url}`)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={session.url} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Checkout
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/checkout/${session.id}/qr`}>
                            <QrCode className="mr-2 h-4 w-4" />
                            View QR Code
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/checkout/${session.id}`}>View Details</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
