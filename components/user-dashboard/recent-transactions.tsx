import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function RecentTransactions() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/abstract-logo.png" alt="Avatar" />
          <AvatarFallback>ES</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Example Store</p>
          <p className="text-sm text-muted-foreground">Premium Subscription</p>
        </div>
        <div className="ml-auto flex flex-col items-end">
          <div className="font-medium">-0.5 SOL</div>
          <Badge variant="outline" className="bg-green-500 text-white">
            Completed
          </Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/abstract-logo.png" alt="Avatar" />
          <AvatarFallback>DS</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Digital Shop</p>
          <p className="text-sm text-muted-foreground">NFT Purchase</p>
        </div>
        <div className="ml-auto flex flex-col items-end">
          <div className="font-medium">-1.2 SOL</div>
          <Badge variant="outline" className="bg-green-500 text-white">
            Completed
          </Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/abstract-logo.png" alt="Avatar" />
          <AvatarFallback>CS</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Crypto Store</p>
          <p className="text-sm text-muted-foreground">Digital Product</p>
        </div>
        <div className="ml-auto flex flex-col items-end">
          <div className="font-medium">-0.3 SOL</div>
          <Badge variant="outline" className="bg-green-500 text-white">
            Completed
          </Badge>
        </div>
      </div>
    </div>
  )
}
