// src/hooks/useVaults.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useWalletUiAccount } from '@wallet-ui/react'
import { Json } from '@/lib/supabase.types'

export function useVaults() {
  const { account } = useWalletUiAccount()

  const key = ['vaults', account?.address.toString()]
  return useQuery({
    queryKey: key,
    enabled: !!account?.address.toString(),
    queryFn: async () => {
      if (!account?.address) {
        throw new Error('Wallet address is not available')
      }
      
      const { data, error } = await supabase
        .from('vaults')
        .select('*')
        .eq('owner_pubkey', account.address.toString())
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useVaultById(id: string) {
  return useQuery({
    queryKey: ['vault', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vaults')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
  })
}

export function useCreateVault() {
  const { account } = useWalletUiAccount()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { data: Json }) => {
      if (!account?.address) {
        throw new Error('Wallet address is not available')
      }
      
      const { data, error } = await supabase
        .from('vaults')
        .insert({
          owner_pubkey: account.address.toString(),
          ...payload,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      if (account?.address) {
        queryClient.invalidateQueries({ queryKey: ['vaults', account.address.toString()] })
      }
    },
  })
}
