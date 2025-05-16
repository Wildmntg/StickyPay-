"use client"

import { useState } from "react"
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
import { MoreHorizontal, Search, ExternalLink } from "lucide-react"
import Link from "next/link"

// Mock data for transactions
const transactions = [
  {
    id: "tx1",
    sessionId: "1",
    customerWallet: "8YUkX4HL8oEyUEwgBK7ndZ5kYZCJPjKJTLXnTzY2zLV3",
    amount: "49.99",
    token: "SOL",
    convertedAmount: "49.99",
    convertedToken: "USDC",
    status: "confirmed",
    signature: "5UfgJ5rVUQRrNZS5NsYDUwUJAyGBBajuBJX9mDaJKvYwfbCkfXjc9Ur4NVXjCgHqVuKyQJbVs6CzA9QLLnSxBYVZ",
    timestamp: "2023-05-01T12:05:30Z",
  },
  {
    id: "tx2",
    sessionId: "2",
    customerWallet: "7YUkX4HL8oEyUEwgBK7ndZ5kYZCJPjKJTLXnTzY2zLV3",
    amount: "19.99",
    token: "BONK",
    convertedAmount: "19.99",
    convertedToken: "USDC",
    status: "confirmed",
    signature: "4UfgJ5rVUQRrNZS5NsYDUwUJAyGBBajuBJX9mDaJKvYwfbCkfXjc9Ur4NVXjCgHqVuKyQJbVs6CzA9QLLnSxBYVZ",
    timestamp: "2023-04-28T10:35:15Z",
  },
  {
    id: "tx3",
    sessionId: "3",
    customerWallet: "6YUkX4HL8oEyUEwgBK7ndZ5kYZCJPjKJTLXnTzY2zLV3",
    amount: "99.99",
    token: "JUP",
    convertedAmount: "99.99",
    convertedToken: "USDC",
    status: "failed",
    signature: "3UfgJ5rVUQRrNZS5NsYDUwUJAyGBBajuBJX9mDaJKvYwfbCkfXjc9Ur4NVXjCgHqVuKyQJbVs6CzA9QLLnSxBYVZ",
    timestamp: "2023-04-25T15:50:22Z",
  },
  {
    id: "tx4",
    sessionId: "4",
    customerWallet: "5YUkX4HL8oEyUEwgBK7ndZ5kYZCJPjKJTLXnTzY2zLV3",
    amount: "149.99",
    token: "USDC",
    convertedAmount: "149.99",
    convertedToken: "USDC",
    status: "pending",
    signature: "2UfgJ5rVUQRrNZS5NsYDUwUJAyGBBajuBJX9mDaJKvYwfbCkfXjc9Ur4NVXjCgHqVuKyQJbVs6CzA9QLLnSxBYVZ",
    timestamp: "2023-04-20T09:20:45Z",
  },
  {
    id: "tx5",
    sessionId: "5",
    customerWallet: "4YUkX4HL8oEyUEwgBK7ndZ5kYZCJPjKJTLXnTzY2zLV3",
    amount: "499.99",
    token: "SOL",
    convertedAmount: "499.99",
    convertedToken: "USDC",
    status: "confirmed",
    signature: "1UfgJ5rVUQRrNZS5NsYDUwUJAyGBBajuBJX9mDaJKvYwfbCkfXjc9Ur4NVXjCgHqVuKyQJbVs6CzA9QLLnSxBYVZ",
    timestamp: "2023-04-15T14:25:10Z",
  },
]

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.customerWallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.signature.includes(searchQuery) ||
      tx.id.includes(searchQuery),
  )

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

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by wallet address or signature..."
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
              <TableHead>Transaction ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Converted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{truncateAddress(tx.customerWallet)}</TableCell>
                  <TableCell>
                    {tx.amount} {tx.token}
                  </TableCell>
                  <TableCell>
                    {tx.convertedAmount} {tx.convertedToken}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(tx.status)} text-white`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(tx.timestamp)}</TableCell>
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
                        <DropdownMenuItem asChild>
                          <Link href={`https://explorer.solana.com/tx/${tx.signature}`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View on Explorer
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/checkout/${tx.sessionId}`}>View Checkout</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/transactions/${tx.id}`}>View Details</Link>
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
