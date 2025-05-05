pub use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(init, payer = user, space = 8 + 32 + 8 + 8 + 1000, seeds = [b"reka", b"vault".as_ref(), user.key().as_ref()], bump)]
    pub user_vault: Account<'info, UserVault>,

    pub system_program: Program<'info, System>,
}

impl CreateVault<'_> {
    pub fn handler(ctx: Context<CreateVault>) -> Result<()> {
        ctx.accounts.user_vault.user = ctx.accounts.user.key();
        // Additional initialization for token accounts within the vault would go here
        Ok(())
    }
}