import { useQuery } from "@tanstack/react-query"

// Reuse types from useTokenPrices
type KaminoEnv = "mainnet-beta" | "devnet"
type PriceSource = "scope" | "birdeye"

interface TokenPrice {
  usdPrice: string
  token: string
  mint: string
}

interface UseTokenPriceProps {
  env?: KaminoEnv
  source?: PriceSource
  token: string // Can be either token name (e.g., "SOL") or mint address
  enabled?: boolean
}

const BASE_URL = "https://api.kamino.finance/prices"

const fetchTokenPrice = async ({
  env = "mainnet-beta",
  source,
  token,
}: {
  env?: KaminoEnv
  source?: PriceSource
  token: string
}): Promise<TokenPrice> => {
  const url = new URL(BASE_URL)
  url.searchParams.append("env", env)
  if (source) {
    url.searchParams.append("source", source)
  }
  url.searchParams.append("token", token)

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: TokenPrice[] = await response.json()
  
  // API returns an array with one item, we want just that item
  if (!data.length) {
    throw new Error(`No price data found for token: ${token}`)
  }

  return data[0]
}

export function useTokenPrice({ env = "mainnet-beta", source = "scope", token, enabled = true }: UseTokenPriceProps) {
  const queryKey = ["tokenPrice", env, source, token]

  const {
    data: price,
    isLoading,
    error,
    ...rest
  } = useQuery<TokenPrice, Error>({
    queryKey,
    queryFn: () => fetchTokenPrice({ env, source, token }),
    enabled: enabled && Boolean(token), // Only run if we have a token
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Garbage collect after 10 minutes
    refetchOnWindowFocus: false,
  })

  return {
    price, // Single price object instead of array
    isLoading,
    error,
    ...rest,
  }
} 