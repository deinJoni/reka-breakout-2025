use std::ops::Deref;

use anchor_lang::{prelude::*, system_program::Transfer};
use crate::{constants::{SEED, VAULT_SEED}, state::*};

#[derive(Accounts)]
pub struct DepositSol<'info> {
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

impl DepositSol<'_> {
    pub fn handler(ctx: Context<DepositSol>, amount: u64) -> Result<()> {
        let user_vault = &mut ctx.accounts.user_vault;
        user_vault.sol_balance += amount;

        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.user_vault.to_account_info(),
        };

        let transfer_cpi_program = ctx.accounts.system_program.to_account_info();
        let transfer_cpi_ctx = CpiContext::new(transfer_cpi_program, transfer_cpi_accounts);

        anchor_lang::system_program::transfer(transfer_cpi_ctx, amount)?;

        Ok(())
    }
}