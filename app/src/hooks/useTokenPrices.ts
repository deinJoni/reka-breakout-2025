import { useQuery } from "@tanstack/react-query"

// Define the structure of a single token price object from the API
interface TokenPrice {
  usdPrice: string
  token: string
  mint: string
}

// Define the possible environments
type KaminoEnv = "mainnet-beta" | "devnet"

// Define the possible price sources
type PriceSource = "scope" | "birdeye"

// Define the hook's props
interface UseTokenPricesProps {
  env?: KaminoEnv // Made optional
  source?: PriceSource // Optional, defaults to 'scope'
  enabled?: boolean // Optional: Control when the query is executed
}

const BASE_URL = "https://api.kamino.finance/prices"

// Function to fetch token prices
const fetchTokenPrices = async ({ env = "mainnet-beta", source }: { env?: KaminoEnv; source?: PriceSource }): Promise<TokenPrice[]> => {
  const url = new URL(BASE_URL)
  url.searchParams.append("env", env)
  if (source) {
    url.searchParams.append("source", source)
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    // TanStack Query expects errors to be thrown for the error state
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: TokenPrice[] = await response.json()
  return data
}

export function useTokenPrices({ env = "mainnet-beta", source = "scope", enabled = true }: UseTokenPricesProps) {
  // Define a unique query key based on the parameters
  const queryKey = ["tokenPrices", env, source]

  const {
    data: prices, // Renamed data to prices for clarity
    isLoading, // React Query uses isLoading
    error,
    ...rest // Include other useful properties returned by useQuery
  } = useQuery<TokenPrice[], Error>({
    queryKey: queryKey,
    queryFn: () => fetchTokenPrices({ env, source }),
    enabled: enabled, // Control query execution
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    gcTime: 1000 * 60 * 10, // Garbage collect data after 10 minutes of inactivity
    refetchOnWindowFocus: false, // Optional: disable refetching on window focus if desired
  })

  return { prices, isLoading, error, ...rest }
} 