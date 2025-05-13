use anchor_lang::prelude::*;
use crate::{constants::{AUTOMATION_SEED, SEED}, state::*};

#[derive(Accounts)]
#[instruction(id: String, protocols_data: Vec<ProtocolData>)]
pub struct UpdateAutomation<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut , has_one = user)]
    pub user_vault: Account<'info, UserVault>,

    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 8 + 8 + 1000 + 32, 
        seeds = [SEED.as_bytes(), AUTOMATION_SEED.as_bytes(), user_vault.key().as_ref(), id.as_bytes()],
        bump
    )]
    pub dca_event: Account<'info, Automation>,

    pub system_program: Program<'info, System>,
}

impl UpdateAutomation<'_> {
    pub fn handler(
        ctx: Context<UpdateAutomation>,
        id: String,
        protocols_data: Vec<ProtocolData>,
        frequency_seconds: i64,
    ) -> Result<()> {
        let dca_event = &mut ctx.accounts.dca_event;
        dca_event.user_vault = ctx.accounts.user_vault.key();
        dca_event.protocols_data = protocols_data;
        dca_event.frequency_seconds = frequency_seconds;
        dca_event.last_executed_timestamp = 0;
        dca_event.user = ctx.accounts.user.key();
        Ok(())
    }
}