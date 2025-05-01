import { useQuery } from "@tanstack/react-query"

type StrategyType = "NON_PEGGED" | "PEGGED"
type StrategyStatus = "LIVE" | "DEPRECATED" | "STAGING"

interface Strategy {
  address: string
  type: StrategyType
  shareMint: string
  status: StrategyStatus
  tokenAMint: string
  tokenBMint: string
}

interface UseStrategiesProps {
  env?: "mainnet-beta" | "devnet"
  status?: StrategyStatus
  enabled?: boolean
}

const BASE_URL = "https://api.kamino.finance/strategies"

const fetchStrategies = async ({
  env = "mainnet-beta",
  status = "LIVE",
}: {
  env?: string
  status?: StrategyStatus
}): Promise<Strategy[]> => {
  const url = new URL(BASE_URL)
  url.searchParams.append("env", env)
  url.searchParams.append("status", status)

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: Strategy[] = await response.json()
  return data
}

export function useStrategies({ 
  env = "mainnet-beta", 
  status = "LIVE", 
  enabled = true 
}: UseStrategiesProps = {}) {
  const queryKey = ["strategies", env, status]

  const {
    data: strategies,
    isLoading,
    error,
    ...rest
  } = useQuery<Strategy[], Error>({
    queryKey,
    queryFn: () => fetchStrategies({ env, status }),
    enabled,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Garbage collect after 10 minutes
    refetchOnWindowFocus: false,
  })

  return {
    strategies,
    isLoading,
    error,
    ...rest,
  }
} 