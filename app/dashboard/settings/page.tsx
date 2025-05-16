"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, BadgePercent } from "lucide-react"
import { getAcceptedTokens, type TokenInfo } from "@/lib/actions/token-actions"
import { TokenIcon } from "@/components/ui/token-icon"
import { NFT_DISCOUNT_COLLECTIONS } from "@/lib/solana"
import { getFeatureFlags } from "@/lib/actions/feature-flags"

const businessFormSchema = z.object({
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  website: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
  logo: z.string().optional(),
})

const walletFormSchema = z.object({
  walletAddress: z.string().min(32, {
    message: "Please enter a valid Solana wallet address.",
  }),
  settlementToken: z.string().min(1, {
    message: "Please select a settlement token.",
  }),
  autoConvertToSettlement: z.boolean().default(true),
})

const nftDiscountFormSchema = z.object({
  enableNftDiscounts: z.boolean().default(true),
  discountPercentage: z.string().refine(
    (val) => {
      const num = Number.parseFloat(val)
      return !isNaN(num) && num > 0 && num <= 50
    },
    {
      message: "Discount must be between 1% and 50%",
    },
  ),
  selectedCollections: z.array(z.string()).min(1, {
    message: "Select at least one NFT collection",
  }),
  customCollectionAddress: z.string().optional(),
})

const tokenFormSchema = z.object({
  acceptSol: z.boolean().default(true),
  acceptUsdc: z.boolean().default(true),
  acceptBonk: z.boolean().default(false),
  acceptJup: z.boolean().default(false),
  customTokens: z.string().optional(),
})

export default function SettingsPage() {
  const { toast } = useToast()
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [multiTokenEnabled, setMultiTokenEnabled] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        // Get feature flags from server action
        const flags = await getFeatureFlags()
        setMultiTokenEnabled(flags.enableMultiToken)

        const acceptedTokens = await getAcceptedTokens()
        setTokens(acceptedTokens)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const businessForm = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      businessName: "Example Store",
      email: "contact@example.com",
      website: "https://example.com",
      logo: "",
    },
  })

  const walletForm = useForm<z.infer<typeof walletFormSchema>>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      walletAddress: "9YUkX4HL8oEyUEwgBK7ndZ5kYZCJPjKJTLXnTzY2zLV3",
      settlementToken: "USDC",
      autoConvertToSettlement: true,
    },
  })

  const nftDiscountForm = useForm<z.infer<typeof nftDiscountFormSchema>>({
    resolver: zodResolver(nftDiscountFormSchema),
    defaultValues: {
      enableNftDiscounts: true,
      discountPercentage: "10",
      selectedCollections: ["StickyPayVIP", "StickyPayFounder"],
      customCollectionAddress: "",
    },
  })

  const tokenForm = useForm<z.infer<typeof tokenFormSchema>>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      acceptSol: true,
      acceptUsdc: true,
      acceptBonk: false,
      acceptJup: false,
      customTokens: "",
    },
  })

  function onBusinessSubmit(values: z.infer<typeof businessFormSchema>) {
    toast({
      title: "Business settings updated",
      description: "Your business settings have been updated successfully.",
    })
  }

  function onWalletSubmit(values: z.infer<typeof walletFormSchema>) {
    toast({
      title: "Wallet settings updated",
      description: "Your wallet settings have been updated successfully.",
    })
    console.log("Settlement token:", values.settlementToken)
  }

  function onNftDiscountSubmit(values: z.infer<typeof nftDiscountFormSchema>) {
    toast({
      title: "NFT discount settings updated",
      description: "Your NFT discount settings have been updated successfully.",
    })
    console.log("NFT discount settings:", values)
  }

  function onTokenSubmit(values: z.infer<typeof tokenFormSchema>) {
    toast({
      title: "Token settings updated",
      description: "Your token settings have been updated successfully.",
    })
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">Manage your business, wallet, and payment settings.</p>
      </div>
      <Tabs defaultValue="business" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="wallet">Wallet & Settlement</TabsTrigger>
          <TabsTrigger value="nft-discounts">NFT Discounts</TabsTrigger>
          <TabsTrigger value="tokens">Accepted Tokens</TabsTrigger>
        </TabsList>
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details and branding.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...businessForm}>
                <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-8">
                  <FormField
                    control={businessForm.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Business Name" {...field} />
                        </FormControl>
                        <FormDescription>This will be displayed to your customers during checkout.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={businessForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormDescription>Your business contact email.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={businessForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormDescription>Your business website URL.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={businessForm.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              // In a real app, this would handle file upload
                              field.onChange(e.target.value)
                            }}
                          />
                        </FormControl>
                        <FormDescription>Upload your business logo (recommended size: 512x512px).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Save Business Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>Wallet & Settlement Settings</CardTitle>
              <CardDescription>Configure your wallet and payment settlement preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...walletForm}>
                <form onSubmit={walletForm.handleSubmit(onWalletSubmit)} className="space-y-8">
                  <FormField
                    control={walletForm.control}
                    name="walletAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Solana Wallet Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your Solana wallet address" {...field} />
                        </FormControl>
                        <FormDescription>All payments will be sent to this wallet address.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={walletForm.control}
                    name="settlementToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Settlement Token</FormLabel>
                        <FormControl>
                          {loading ? (
                            <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Loading tokens...</span>
                            </div>
                          ) : (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select settlement token" />
                              </SelectTrigger>
                              <SelectContent>
                                {tokens
                                  .filter((token) => ["SOL", "USDC"].includes(token.symbol))
                                  .map((token) => (
                                    <SelectItem key={token.symbol} value={token.symbol}>
                                      <div className="flex items-center">
                                        <TokenIcon symbol={token.symbol} size={20} className="mr-2" />
                                        {token.name} ({token.symbol})
                                      </div>
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          )}
                        </FormControl>
                        <FormDescription>
                          All payments will be converted to this token before being sent to your wallet.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={walletForm.control}
                    name="autoConvertToSettlement"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto-convert to Settlement Token</FormLabel>
                          <FormDescription>
                            Automatically convert all received tokens to your settlement token.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Save Wallet Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="nft-discounts">
          <Card>
            <CardHeader>
              <CardTitle>NFT Discount Settings</CardTitle>
              <CardDescription>Configure discounts for NFT holders.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...nftDiscountForm}>
                <form onSubmit={nftDiscountForm.handleSubmit(onNftDiscountSubmit)} className="space-y-8">
                  <FormField
                    control={nftDiscountForm.control}
                    name="enableNftDiscounts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable NFT Discounts</FormLabel>
                          <FormDescription>Offer discounts to customers who own specific NFTs.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {nftDiscountForm.watch("enableNftDiscounts") && (
                    <>
                      <FormField
                        control={nftDiscountForm.control}
                        name="discountPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Percentage</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Input type="number" min="1" max="50" placeholder="10" {...field} className="w-20" />
                                <span className="ml-2">%</span>
                              </div>
                            </FormControl>
                            <FormDescription>The percentage discount to offer NFT holders (1-50%).</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={nftDiscountForm.control}
                        name="selectedCollections"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NFT Collections for Discounts</FormLabel>
                            <FormDescription className="mb-4">
                              Select which NFT collections qualify for discounts.
                            </FormDescription>
                            <div className="space-y-4">
                              {Object.entries(NFT_DISCOUNT_COLLECTIONS).map(([key, collection]) => (
                                <div key={key} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`collection-${key}`}
                                    checked={field.value.includes(key)}
                                    onChange={(e) => {
                                      const updatedCollections = e.target.checked
                                        ? [...field.value, key]
                                        : field.value.filter((val) => val !== key)
                                      field.onChange(updatedCollections)
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <label
                                    htmlFor={`collection-${key}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {collection.name} ({collection.discountPercentage}% discount)
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={nftDiscountForm.control}
                        name="customCollectionAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Collection Address (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter NFT collection address" {...field} />
                            </FormControl>
                            <FormDescription>
                              Add a custom NFT collection address that qualifies for discounts.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="rounded-md bg-muted p-4">
                        <div className="flex items-start gap-3">
                          <BadgePercent className="mt-0.5 h-5 w-5 text-primary" />
                          <div>
                            <h4 className="text-sm font-medium">How NFT Discounts Work</h4>
                            <p className="text-sm text-muted-foreground">
                              When a customer connects their wallet during checkout, we'll check if they own any NFTs
                              from the selected collections. If they do, they'll automatically receive the configured
                              discount.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Button type="submit">Save NFT Discount Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tokens">
          <Card>
            <CardHeader>
              <CardTitle>Accepted Tokens</CardTitle>
              <CardDescription>Configure which SPL tokens you want to accept as payment.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...tokenForm}>
                <form onSubmit={tokenForm.handleSubmit(onTokenSubmit)} className="space-y-8">
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span>Loading tokens...</span>
                      </div>
                    ) : (
                      <>
                        {tokens.map((token) => (
                          <FormField
                            key={token.symbol}
                            control={tokenForm.control}
                            name={`accept${token.symbol}` as any}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center space-x-3">
                                  <TokenIcon symbol={token.symbol} size={24} />
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">{token.name}</FormLabel>
                                    <FormDescription>Accept {token.symbol} as payment</FormDescription>
                                  </div>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={token.symbol === "SOL" || token.symbol === "USDC"}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </>
                    )}
                  </div>
                  <FormField
                    control={tokenForm.control}
                    name="customTokens"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Tokens</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter token addresses separated by commas" {...field} />
                        </FormControl>
                        <FormDescription>Add custom SPL token addresses that you want to accept.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Save Token Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
