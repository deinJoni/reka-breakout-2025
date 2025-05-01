'use client'

import dynamic from 'next/dynamic'
import { ReactNode, useEffect } from 'react'
import { createSolanaDevnet, createSolanaLocalnet, createWalletUiConfig, WalletUi, createSolanaMainnet, useWalletUi } from '@wallet-ui/react'
import '@wallet-ui/tailwind/index.css'

export const WalletButton = dynamic(async () => (await import('@wallet-ui/react')).WalletUiDropdown, {
  ssr: false,
})
export const ClusterButton = dynamic(async () => (await import('@wallet-ui/react')).WalletUiClusterDropdown, {
  ssr: false,
})

const config = createWalletUiConfig({
  clusters: [createSolanaDevnet(), createSolanaLocalnet(), createSolanaMainnet()],
})

// Helper function to connect to Phantom silently, Phantom does not support auto connect with new Wallet-UI: https://github.com/solana-developers/create-solana-dapp/issues/132
const PhantomSilentConnect = () => {
  const { account, wallets, connected, connect } = useWalletUi();

  useEffect(() => {
    // if we’re already connected (e.g. Solflare / Backpack) just exit
    if (connected || account) return;

    const provider = (window as any).phantom?.solana;
    if (!provider?.isPhantom) return;             // the user isn’t running Phantom

    // ask Phantom to reconnect only if the user had already approved the dApp once
    provider
      .connect({ onlyIfTrusted: true })
      .then(() => {
        // once Phantom returns its account list, pick the same wallet silently
        const phantom = wallets.find(w => w.name === 'Phantom');
        if (phantom && phantom.accounts.length) {
          connect(phantom.accounts[0]);
        }
      })
      .catch(() => {
        /* user never approved before, do nothing */
      });
  }, []);

  return null; // invisible helper component
}

export function SolanaProvider({ children }: { children: ReactNode }) {
  return <WalletUi config={config}>
    <PhantomSilentConnect />
    {children}
  </WalletUi>
}
