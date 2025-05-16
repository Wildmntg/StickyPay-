"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Wallet, Store, User } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function RegisterPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [accountType, setAccountType] = useState<"business" | "user">("business")
  const [businessName, setBusinessName] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Error state
  const [businessNameError, setBusinessNameError] = useState("")
  const [fullNameError, setFullNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Reset errors
    setBusinessNameError("")
    setFullNameError("")
    setEmailError("")
    setPasswordError("")
    setConfirmPasswordError("")

    // Basic validation
    let isValid = true

    if (accountType === "business" && (!businessName || businessName.length < 2)) {
      setBusinessNameError("Business name must be at least 2 characters")
      isValid = false
    }

    if (accountType === "user" && (!fullName || fullName.length < 2)) {
      setFullNameError("Full name must be at least 2 characters")
      isValid = false
    }

    if (!email) {
      setEmailError("Email is required")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address")
      isValid = false
    }

    if (!password) {
      setPasswordError("Password is required")
      isValid = false
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      isValid = false
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match")
      isValid = false
    }

    if (!isValid) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Registration successful",
        description: `Your ${accountType} account has been created. You can now log in.`,
      })

      // Redirect to appropriate dashboard based on account type
      if (accountType === "business") {
        router.push("/dashboard")
      } else {
        router.push("/user-dashboard")
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
      <div className="mb-6 flex items-center">
        <Wallet className="mr-2 h-6 w-6" />
        <span className="text-xl font-bold">SolPay</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Join SolPay to start using Solana for payments</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">I want to:</label>
              <RadioGroup
                value={accountType}
                onValueChange={(value) => setAccountType(value as "business" | "user")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business" id="business" />
                  <label
                    htmlFor="business"
                    className="flex cursor-pointer items-center rounded-lg border p-4 hover:bg-accent"
                  >
                    <Store className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Receive Payments</p>
                      <p className="text-sm text-muted-foreground">
                        For businesses and merchants who want to accept crypto payments
                      </p>
                    </div>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user" />
                  <label
                    htmlFor="user"
                    className="flex cursor-pointer items-center rounded-lg border p-4 hover:bg-accent"
                  >
                    <User className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Make Payments</p>
                      <p className="text-sm text-muted-foreground">For users who want to pay with crypto</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {accountType === "business" && (
              <div className="space-y-2">
                <label htmlFor="businessName" className="text-sm font-medium">
                  Business Name
                </label>
                <Input
                  id="businessName"
                  placeholder="Your Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
                {businessNameError && <p className="text-sm text-red-500">{businessNameError}</p>}
              </div>
            )}

            {accountType === "user" && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  placeholder="Your Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                {fullNameError && <p className="text-sm text-red-500">{fullNameError}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPasswordError && <p className="text-sm text-red-500">{confirmPasswordError}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
