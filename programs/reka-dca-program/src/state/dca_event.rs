use anchor_lang::prelude::*;

#[account]
pub struct DcaEvent {
    pub user: Pubkey,
    pub user_vault: Pubkey,
    pub automation: Pubkey,
    pub automation_params: Vec<u8>,
    pub amount: u64,
    pub frequency_seconds: i64,
    pub last_executed_timestamp: i64,
    pub bump: u8,
}