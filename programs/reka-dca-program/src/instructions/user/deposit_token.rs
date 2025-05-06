use std::ops::Deref;

use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{Mint, Token, TokenAccount, Transfer}};
use crate::{constants::{SEED, VAULT_SEED}, state::*};

#[derive(Accounts)]
pub struct DepositToken<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut, 
        has_one = user,
        seeds = [SEED.as_bytes(), VAULT_SEED.as_bytes(), user.key().as_ref()], 
        bump = user_vault.bump,
        realloc = UserVault::realloc_len(user_vault.deref().clone(), mint.key()),
        realloc::payer = user,
        realloc::zero = true,
    )]
    pub user_vault: Account<'info, UserVault>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = user_vault,
        associated_token::token_program = token_program,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}

impl DepositToken<'_> {
    pub fn handler(ctx: Context<DepositToken>, amount: u64) -> Result<()> {
        let user_vault = &mut ctx.accounts.user_vault;

        let token_account_balance_index = user_vault.token_accounts_balances.iter().position(|x| x.mint == ctx.accounts.mint.key());
        if let Some(index) = token_account_balance_index {
            user_vault.token_accounts_balances[index].balance += amount;
        } else {
            user_vault.token_accounts_balances.push(TokenAccountBalance {
                token_account: ctx.accounts.vault_token_account.key(),
                mint: ctx.accounts.mint.key(),
                balance: amount,
            });
        }

        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        let transfer_cpi_program = ctx.accounts.token_program.to_account_info();
        let transfer_cpi_ctx = CpiContext::new(transfer_cpi_program, transfer_cpi_accounts);

        anchor_spl::token::transfer(transfer_cpi_ctx, amount)?;

        Ok(())
    }
}