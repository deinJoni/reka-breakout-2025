import { useQuery } from "@tanstack/react-query"

interface StakingYield {
  apy: string
  tokenMint: string
}

interface UseStakingYieldsProps {
  enabled?: boolean
}

const BASE_URL = "https://api.kamino.finance/v2/staking-yields"

const fetchStakingYields = async (): Promise<StakingYield[]> => {
  const response = await fetch(BASE_URL)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: StakingYield[] = await response.json()
  return data
}

export function useStakingYields({ enabled = true }: UseStakingYieldsProps = {}) {
  const queryKey = ["stakingYields"]

  const {
    data: yields,
    isLoading,
    error,
    ...rest
  } = useQuery<StakingYield[], Error>({
    queryKey,
    queryFn: fetchStakingYields,
    enabled,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Garbage collect after 10 minutes
    refetchOnWindowFocus: false,
  })

  return {
    yields,
    isLoading,
    error,
    ...rest,
  }
} 