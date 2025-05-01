"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Clock, Eye, Plus, Save } from "lucide-react"

export type VaultCardMode = "view" | "create" | "preview"

interface VaultCardProps {
  sourceToken: string
  sourceAmount: number
  sourceSymbol: string
  targetName: string
  targetAmount: number
  targetSymbol: string
  percentage: number
  timeLeft: string
  id?: string
  mode?: VaultCardMode
  onAction?: () => void
}

interface ButtonConfig {
  text: string
  icon: React.ReactNode
  action: () => void
  disabled?: boolean
}

export function VaultCard({
  sourceToken = "USDC",
  sourceAmount = 1000,
  sourceSymbol = "USDC",
  targetName = "mSOL / SOL Yield loop",
  targetAmount = 950,
  targetSymbol = "mSOL",
  percentage = 65,
  timeLeft = "3 Days",
  id,
  mode = "view",
  onAction,
}: VaultCardProps) {
  // Define button configurations based on mode
  const buttonConfig: Record<VaultCardMode, ButtonConfig> = {
    view: {
      text: "View Vault",
      icon: <Eye className="h-4 w-4 mr-2" />,
      action: onAction || (() => {}),
    },
    create: {
      text: "Create Vault",
      icon: <Save className="h-4 w-4 mr-2" />,
      action: onAction || (() => {}),
    },
    preview: {
      text: "Preparing...",
      icon: null,
      action: () => {},
      disabled: true,
    },
  }

  const { text, icon, action, disabled } = buttonConfig[mode]

  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Token Flow */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Source Token</p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-sm">
                  {sourceSymbol.slice(0, 2)}
                </div>
                <span className="font-medium">{sourceSymbol}</span>
              </div>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground mx-2" />

            <div className="space-y-1 text-right">
              <p className="text-sm text-muted-foreground">Target</p>
              <div className="flex items-center gap-2 justify-end">
                <span className="font-medium">{targetName}</span>
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-sm">
                  {targetSymbol.slice(0, 2)}
                </div>
              </div>
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Source Amount</p>
              <p className="text-xl font-bold">
                {sourceAmount.toLocaleString()} {sourceSymbol}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-muted-foreground">Current Target Amount</p>
              <p className="text-xl font-bold">
                {targetAmount.toLocaleString()} {targetSymbol}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Progress</p>
              <p className="text-sm font-medium">{percentage}%</p>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          {/* Time Left */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{timeLeft} remaining</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          className="w-full hover:cursor-pointer" 
          onClick={action}
          disabled={disabled}
        >
          {icon}
          {text}
        </Button>
      </CardFooter>
    </Card>
  )
}
