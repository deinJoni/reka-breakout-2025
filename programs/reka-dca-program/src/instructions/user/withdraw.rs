use anchor_lang::prelude::*;
use anchor_spl::token::{Token, Transfer};
use crate::state::*;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut , has_one = user)]
    pub user_vault: Account<'info, UserVault>,
    #[account(mut)]
    /// CHECK: This is the vault's token account to withdraw from
    pub vault_token_account: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is the user's token account to withdraw into
    pub user_token_account: AccountInfo<'info>,
    /// CHECK: The token program account
    pub token_program: Program<'info, Token>,
}

impl Withdraw<'_> {
    pub fn handler(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let user_vault_key = ctx.accounts.user_vault.key();
        let seeds = &[
            b"reka", b"vault".as_ref(),
            user_vault_key.as_ref(),
            &[ctx.accounts.user_vault.bump],
        ];
        let signer_seeds = &[&seeds[..]];
    
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.user_vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        anchor_spl::token::transfer(cpi_ctx, amount)?;
        Ok(())
    }
}