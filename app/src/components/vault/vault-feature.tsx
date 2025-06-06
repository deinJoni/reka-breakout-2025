'use client'

import { WalletButton } from '../solana/solana-provider'
import { useWalletUi } from '@wallet-ui/react'
import { VaultCard } from './vault-card'
import { Button } from '../ui/button'
import Link from 'next/link'
import { useVaults } from '@/hooks/useSupabaseVaults'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Type for vault metadata structure
type VaultMetadata = Record<string, string | number>;

// Type for vault data structure
type VaultData = {
  sourceToken?: string;
  sourceAmount?: number;
  metadata?: VaultMetadata;
  [key: string]: unknown;
};

export default function VaultFeature() {
    const { account } = useWalletUi()
    const { data: vaults, isLoading } = useVaults()
    const router = useRouter()

    // if (account) {
    //   return redirect(`/account/${account.address.toString()}`)
    // }

    if (!account) {
        return (
            <div className="hero py-[64px]">
                <div className="hero-content text-center">
                    <WalletButton />
                </div>
            </div>
        )
    }

    return (
        <div className="hero py-[64px]">
            <h1 className="text-2xl font-bold mb-6 text-center">Vault Overview</h1>
            <div className="flex justify-end mb-4">
                <Button asChild>
                    <Link href="/vault/create">Create Vault</Link>
                </Button>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading vaults...</span>
                </div>
            ) : vaults && vaults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-between">
                    {vaults.map((vault) => {
                        // Type assertion and safe access with optional chaining
                        const data = vault.data as VaultData || {};
                        const metadata = data.metadata as VaultMetadata || {};
                        
                        return (
                            <VaultCard
                                key={vault.id}
                                id={vault.id}
                                sourceToken={data.sourceToken || ""}
                                sourceAmount={Number(data.sourceAmount) || 0}
                                sourceSymbol={metadata.sourceSymbol as string || ""}
                                targetName={metadata.targetName as string || ""}
                                targetAmount={Number(metadata.targetAmount) || 0}
                                targetSymbol={metadata.targetSymbol as string || ""}
                                percentage={Number(metadata.percentage) || 0}
                                timeLeft={metadata.timeLeft as string || ""}
                                mode="view"
                                onAction={() => router.push(`/vault/${vault.id}`)}
                            />
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg p-6">
                    <p className="text-muted-foreground mb-4">You don&apos;t have any vaults yet.</p>
                    <Button asChild>
                        <Link href="/vault/create">Create Your First Vault</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
