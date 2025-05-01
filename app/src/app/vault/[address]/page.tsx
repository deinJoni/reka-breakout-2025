import VaultDetailFeature from "@/components/vault/vault-detail-feature"

interface VaultDetailPageProps {
  params: {
    address: string
  }
}

export default async function VaultDetailPage({ params }: VaultDetailPageProps) {
  // Ensure params is resolved before accessing properties
  const resolvedParams = await Promise.resolve(params)
  return <VaultDetailFeature vaultId={resolvedParams.address} />
}
