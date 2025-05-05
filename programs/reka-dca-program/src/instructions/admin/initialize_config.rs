use crate::{constants::{CONFIG_SEED, SEED}, state::*};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(init, payer = admin, space = Config::init_len(), seeds = [SEED.as_bytes(), CONFIG_SEED.as_bytes()], bump)]
    pub config: Account<'info, Config>,

    pub system_program: Program<'info, System>,
}

impl InitializeConfig<'_> {
    pub fn handler(ctx: Context<InitializeConfig>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.supported_protocols = vec![];
        config.bump = ctx.bumps.config;
        Ok(())
    }
}
