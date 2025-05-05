pub use anchor_lang::prelude::*;
use crate::{constants::{SEED, VAULT_SEED}, state::*};

#[derive(Accounts)]
pub struct InitializeUserVault<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(init, payer = user, space = UserVault::init_len(), seeds = [SEED.as_bytes(), VAULT_SEED.as_bytes(), user.key().as_ref()], bump)]
    pub user_vault: Account<'info, UserVault>,

    pub system_program: Program<'info, System>,
}

impl InitializeUserVault<'_> {
    pub fn handler(ctx: Context<InitializeUserVault>) -> Result<()> {
        let user_vault = &mut ctx.accounts.user_vault;
        user_vault.user = ctx.accounts.user.key();
        user_vault.sol_balance = 0;
        user_vault.token_accounts_balances = vec![];
        user_vault.bump = ctx.bumps.user_vault;
        Ok(())
    }
}