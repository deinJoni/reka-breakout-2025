use anchor_lang::prelude::*;
use crate::{constants::{AUTOMATION_SEED, SEED}, state::*};

#[derive(Accounts)]
#[instruction(automation_id: String)]
pub struct CreateDCAEvent<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut , has_one = user)]
    pub user_vault: Account<'info, UserVault>,

    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 8 + 8 + 1000 + 32, 
        seeds = [SEED.as_bytes(), AUTOMATION_SEED.as_bytes(), user_vault.key().as_ref(), automation_id.as_bytes()],
        bump
    )]
    pub dca_event: Account<'info, DcaEvent>,

    pub system_program: Program<'info, System>,
}

impl CreateDCAEvent<'_> {
    pub fn handler(
        ctx: Context<CreateDCAEvent>,
        automation: Pubkey,
        amount: u64,
        frequency_seconds: i64,
        automation_params: Vec<u8>,
    ) -> Result<()> {
        let dca_event = &mut ctx.accounts.dca_event;
        dca_event.user_vault = ctx.accounts.user_vault.key();
        dca_event.automation = automation;
        dca_event.amount = amount;
        dca_event.frequency_seconds = frequency_seconds;
        dca_event.automation_params = automation_params;
        dca_event.last_executed_timestamp = 0;
        dca_event.user = ctx.accounts.user.key();
        Ok(())
    }
}