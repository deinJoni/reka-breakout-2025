import VaultDetailFeature from "@/components/vault/vault-detail-feature"

// Properly define page props according to Next.js conventions
interface VaultDetailPageProps {
  params: {
    address: string
  },
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default function VaultDetailPage({ params }: VaultDetailPageProps) {
  return <VaultDetailFeature vaultId={params.address} />
}
