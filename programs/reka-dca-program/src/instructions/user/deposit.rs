use std::ops::Deref;

use anchor_lang::prelude::*;
use anchor_spl::token::{Token, Transfer};
use crate::state::*;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut, 
        has_one = user,
        seeds = [b"reka", b"vault", user.key().as_ref()], 
        bump = user_vault.bump,
        realloc = UserVault::len_with_new_token_account(user_vault.deref().clone()),
        realloc::payer = user,
        realloc::zero = true,
    )]
    pub user_vault: Account<'info, UserVault>,

    #[account(mut)]
    /// CHECK: This is the user's token account to deposit from
    pub user_token_account: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: This is the vault's token account to deposit into
    pub vault_token_account: AccountInfo<'info>,

    /// CHECK: The token program account
    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}

impl Deposit<'_> {
    pub fn handler(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        anchor_spl::token::transfer(cpi_ctx, amount)?;
        Ok(())
    }
}