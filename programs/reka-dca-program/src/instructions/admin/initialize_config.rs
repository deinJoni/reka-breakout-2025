use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(init, payer = admin, space = Config::init_len(), seeds = [b"reka", b"admin-account".as_ref()], bump)]
    pub config: Account<'info, Config>,

    pub system_program: Program<'info, System>,
}

impl InitializeConfig<'_> {
    pub fn handler(ctx: Context<InitializeConfig>) -> Result<()> {
        ctx.accounts.config.admin = ctx.accounts.admin.key();
        ctx.accounts.config.bump = ctx.bumps.config;
        Ok(())
    }
}
