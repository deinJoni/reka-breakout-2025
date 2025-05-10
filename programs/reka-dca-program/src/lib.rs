#![allow(unexpected_cfgs)]

pub mod error;
pub mod instructions;
pub mod state;
pub mod constants;

pub use crate::instructions::*;
pub use state::*;

declare_id!("6oEgHD36vj2r1RZXAbDT8dsqEFtmNSe574aDPbxLQde9");

#[program]
pub mod reka_dca_program {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
        InitializeConfig::handler(ctx)
    }

    pub fn add_supported_protocol(
        ctx: Context<AddSupportedProtocol>,
        automation_id: String,
        protocol_program_id: Pubkey,
        automation_data_template: Vec<u8>,
    ) -> Result<()> {
        AddSupportedProtocol::handler(
            ctx,
            automation_id,
            protocol_program_id,
            automation_data_template
        )
    }
    
    pub fn initialize_user_vault(ctx: Context<InitializeUserVault>) -> Result<()> {
        InitializeUserVault::handler(ctx)
    }
    
    pub fn deposit_sol(ctx: Context<DepositSol>, amount: u64) -> Result<()> {
        DepositSol::handler(ctx, amount)
    }
    
    pub fn deposit_token(ctx: Context<DepositToken>, amount: u64) -> Result<()> {
        DepositToken::handler(ctx, amount)
    }

    pub fn withdraw_sol(ctx: Context<WithdrawSol>, amount: u64) -> Result<()> {
        WithdrawSol::handler(ctx, amount)
    }

    pub fn withdraw_token(ctx: Context<WithdrawToken>, amount: u64) -> Result<()> {
        WithdrawToken::handler(ctx, amount)
    }

    // User instruction to create a DCA event
    pub fn create_dca_event(
        ctx: Context<CreateAutomation>,
        id: String,
        protocols_data: Vec<ProtocolData>,
        frequency_seconds: i64,
    ) -> Result<()> {
        CreateAutomation::handler(
            ctx,
            id,
            protocols_data,
            frequency_seconds
        )
    }

    // Instruction to execute a DCA event (likely called by an off-chain service)
    pub fn execute_dca_event(ctx: Context<ExecuteDCAEvent>) -> Result<()> {
        ExecuteDCAEvent::handler(ctx)
    }
}
