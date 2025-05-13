"use client"

import { useVaults } from "@/hooks/useSupabaseVaults"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface VaultMetadata {
  timeLeft: string;
  percentage: number;
  targetName: string;
  sourceToken: string;
  sourceAmount: number;
  sourceSymbol: string;
  targetAmount: number;
  targetSymbol: string;
}

interface VaultData {
  target: string;
  duration: {
    unit: string;
    value: number;
  };
  metadata: VaultMetadata;
  executions: number;
  sourceToken: string;
  sourceAmount: number;
}

export function DashboardFeature() {
  const router = useRouter();
  const { data: vaults } = useVaults()
  const d = vaults?.map((vault) => {
    const typedData = vault.data as unknown as VaultData;
    return (
      <Card key={vault.id}>
        <CardHeader>
          <CardTitle>{typedData?.metadata?.sourceSymbol} {'->'} {typedData?.metadata?.targetSymbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Amount: {typedData?.sourceAmount}</p>
          <p>Target: {typedData?.metadata?.targetAmount}</p>
          <p>Time Left: {typedData?.metadata?.timeLeft}</p>
          <p>Percentage: {typedData?.metadata?.percentage}</p>
        </CardContent>
      </Card>
    )
  })
  return (
    <>
    <h2>Active Automations</h2>
    <p>Manage your automations here</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="col-span-1 group transition-all duration-200">
          <CardHeader className="pt-4 pb-3 text-center">
            <CardTitle className="text-base font-medium text-muted-foreground">New Automation</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex justify-center items-center">
            <Button 
              variant="default"
              className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2 px-6 py-2.5 rounded-md shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              onClick={() => router.push('/vault/create')}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Create New</span>
            </Button>
          </CardContent>
        </Card>
        {d}
      </div>
      </>
  )
}
