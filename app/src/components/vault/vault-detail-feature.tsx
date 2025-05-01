"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useVaultById } from "@/hooks/useSupabaseVaults"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface VaultDetailFeatureProps {
    vaultId: string
}

// Type for vault data from Supabase
interface VaultData {
    id: string
    owner_pubkey: string
    created_at: string
    data: {
        sourceToken: string
        sourceAmount: number
        target: string
        duration: {
            value: number
            unit: string
        }
        executions: number
        metadata: {
            sourceToken: string
            sourceAmount: number
            sourceSymbol: string
            targetName: string
            targetAmount: number
            targetSymbol: string
            percentage: number
            timeLeft: string
        }
    }
}

export default function VaultDetailFeature({ vaultId }: VaultDetailFeatureProps) {
    const router = useRouter()
    const { data: vault, isLoading, error } = useVaultById(vaultId)

    // Handle loading state
    if (isLoading) {
        return (
            <div className="flex justify-center w-full">
                <div className="max-w-5xl py-10 flex flex-col items-center justify-center min-h-[400px] w-full">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading vault details...</p>
                </div>
            </div>
        )
    }

    // Handle error state
    if (error || !vault) {
        return (
            <div className="flex justify-center w-full">
                <div className="max-w-5xl py-10 w-full">
                    <Button
                        variant="ghost"
                        className="mb-6 pl-0 flex items-center"
                        onClick={() => router.push('/vault')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Vaults
                    </Button>

                    <Card className="bg-red-50 border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-700">Vault Not Found</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-red-600">
                                The requested vault could not be found or you don&apos;t have permission to view it.
                            </p>
                            <Button
                                className="mt-4"
                                onClick={() => router.push('/vault')}
                            >
                                Return to Vaults
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // Type assertion for vault data
    const typedVault = vault as unknown as VaultData

    // Get metadata from vault
    const vaultData = typedVault.data?.metadata || {}

    return (
        <div className="flex justify-center w-full">
            <div className="max-w-5xl py-10 w-full">
                <Button
                    variant="ghost"
                    className="mb-6 pl-0 flex items-center hover:cursor-pointer"
                    onClick={() => router.push('/vault')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Vaults
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Main vault info card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Source</h3>
                                    <p className="text-lg font-medium">
                                        {vaultData.sourceAmount} {vaultData.sourceSymbol}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Target</h3>
                                    <p className="text-lg font-medium">
                                        {vaultData.targetName}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                                    <p className="text-lg font-medium">
                                        {vaultData.timeLeft}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Executions</h3>
                                    <p className="text-lg font-medium">
                                        {typedVault.data?.executions || 1}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                                <p className="text-lg font-medium">
                                    {typedVault.created_at ? new Date(typedVault.created_at).toLocaleString() : 'Unknown'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Advanced details section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Vault ID</h3>
                                    <p className="text-sm font-mono bg-muted p-2 rounded-md overflow-auto">
                                        {typedVault.id}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Owner</h3>
                                    <p className="text-sm font-mono bg-muted p-2 rounded-md overflow-auto">
                                        {typedVault.owner_pubkey}
                                    </p>
                                </div>
                                {typedVault.data?.sourceToken && (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Source Token</h3>
                                        <p className="text-sm font-mono bg-muted p-2 rounded-md overflow-auto">
                                            {typedVault.data.sourceToken}
                                        </p>
                                    </div>
                                )}
                                {typedVault.data?.target && (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Target Token</h3>
                                        <p className="text-sm font-mono bg-muted p-2 rounded-md overflow-auto">
                                            {typedVault.data.target}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
} 