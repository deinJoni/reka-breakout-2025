use anchor_lang::prelude::*;
use crate::{constants::{AUTOMATION_SEED, SEED}, state::*};

#[derive(Accounts)]
#[instruction(id: String, protocols_data: Vec<ProtocolData>)]
pub struct CreateAutomation<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut , has_one = user)]
    pub user_vault: Account<'info, UserVault>,

    #[account(
        init,
        payer = user,
        space = Automation::init_len(id.len(), protocols_data),
        seeds = [SEED.as_bytes(), AUTOMATION_SEED.as_bytes(), user_vault.key().as_ref(), id.as_bytes()],
        bump
    )]
    pub automation: Account<'info, Automation>,

    pub system_program: Program<'info, System>,
}

impl CreateAutomation<'_> {
    pub fn handler(
        ctx: Context<CreateAutomation>,
        id: String,
        protocols_data: Vec<ProtocolData>,
        frequency_seconds: i64,
    ) -> Result<()> {
        let automation = &mut ctx.accounts.automation;
        automation.id = id;
        automation.user_vault = ctx.accounts.user_vault.key();
        automation.protocols_data = protocols_data;
        automation.frequency_seconds = frequency_seconds;
        automation.last_executed_timestamp = 0;
        automation.user = ctx.accounts.user.key();
        automation.bump = ctx.bumps.automation;
        Ok(())
    }
}