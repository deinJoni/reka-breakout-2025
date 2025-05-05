#![allow(unexpected_cfgs)]

pub mod error;
pub mod instructions;
pub mod state;

pub use crate::instructions::*;
pub use state::*;

declare_id!("6oEgHD36vj2r1RZXAbDT8dsqEFtmNSe574aDPbxLQde9");

#[program]
pub mod reka_dca_program {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
        InitializeConfig::handler(ctx)
    }

    pub fn add_supported_protocols(
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

    // User instruction to create a Vault
    pub fn create_vault(ctx: Context<CreateVault>) -> Result<()> {
        CreateVault::handler(ctx)
    }

    // User instruction to deposit assets into their Vault
    // This is a simplified example, handling specific token types is needed
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        Deposit::handler(ctx, amount)
    }

    // User instruction to withdraw assets from their Vault
    // This is a simplified example, handling specific token types is needed
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        Withdraw::handler(ctx, amount)
    }

    // User instruction to create a DCA event
    pub fn create_dca_event(
        ctx: Context<CreateDCAEvent>,
        automation: Pubkey,
        amount: u64,
        frequency_seconds: i64,
        // Potentially pass specific parameters for this automation instance
        automation_params: Vec<u8>,
    ) -> Result<()> {
        CreateDCAEvent::handler(
            ctx,
            automation,
            amount,
            frequency_seconds,
            automation_params
        )
    }

    // Instruction to execute a DCA event (likely called by an off-chain service)
    pub fn execute_dca_event(ctx: Context<ExecuteDCAEvent>) -> Result<()> {
        ExecuteDCAEvent::handler(ctx)
    }
}
