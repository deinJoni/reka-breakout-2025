use anchor_lang::{prelude::*, system_program::Transfer};
use crate::{constants::{SEED, VAULT_SEED}, state::*};

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut, 
        has_one = user,
        seeds = [SEED.as_bytes(), VAULT_SEED.as_bytes(), user.key().as_ref()], 
        bump = user_vault.bump
    )]
    pub user_vault: Account<'info, UserVault>,

    pub system_program: Program<'info, System>,
}

impl WithdrawSol<'_> {
    pub fn handler(ctx: Context<WithdrawSol>, amount: u64) -> Result<()> {
        let user_vault = &mut ctx.accounts.user_vault;
        user_vault.sol_balance -= amount;

        ctx.accounts.user_vault.sub_lamports(amount)?;
        ctx.accounts.user.add_lamports(amount)?;

        Ok(())
    }
}