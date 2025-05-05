use anchor_lang::prelude::*;

#[account]
pub struct UserVault {
    pub user: Pubkey,
    pub sol_balance: u64,
    pub token_accounts_balances: Vec<TokenAccountBalance>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TokenAccountBalance {
    pub token_account: Pubkey,
    pub mint: Pubkey,
    pub balance: u64,
}

impl UserVault {
    pub fn init_len() -> usize {
        8 + 32 + 4 + 1
    }

    pub fn len(self) -> usize {
        8 + 32 + 4 * (self.token_accounts_balances.len() * (32 + 32 + 8)) + 1
    }

    pub fn len_with_new_token_account(self) -> usize {
        8 + 32 + 4 * ((self.token_accounts_balances.len() + 1) * (32 + 32 + 8)) + 1
    }
}