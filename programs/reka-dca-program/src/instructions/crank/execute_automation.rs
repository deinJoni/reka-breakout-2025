use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use crate::state::*;
use crate::error::RekaError;

#[derive(Accounts)]
pub struct ExecuteDCAEvent<'info> {
    #[account(mut/* , has_one = owner*/)]
    // Ensure only the vault owner or a designated executor can trigger
    pub dca_event: Account<'info, DcaEvent>,
    #[account(mut/* , has_one = owner*/)]
    pub user_vault: Account<'info, UserVault>,
    // You'll need to fetch the correct supported_protocol account based on dca_event.automation_id
    // This might require another account in the context or fetching within the instruction logic.
    // For simplicity, we'll assume a single SupportedProtocol account for now.
    pub supported_protocol: Account<'info, SupportedProtocol>,
    /// CHECK: The program to perform the CPI to (fetched from supported_protocol)
    pub target_program: UncheckedAccount<'info>,
    // Add any other accounts required by the target protocol's CPI instruction
    // These would be dynamically determined based on the automation_id and automation_params
    // For example, token accounts, pool accounts, etc.
    // #[account(mut)]
    // /// CHECK: Example: Token account for a swap
    // pub source_token_account: AccountInfo<'info>,
    // #[account(mut)]
    // /// CHECK: Example: Token account for a swap
    // pub destination_token_account: AccountInfo<'info>,

    // The signer for the CPI from the vault (the user_vault PDA)
    /// CHECK: The user_vault PDA is the signer for the CPI
    pub user_vault_authority: AccountInfo<'info>, // This will be the PDA
    /// CHECK: The token program account (if transferring tokens)
    pub token_program: Program<'info, Token>, // Add if CPI involves token transfers
    pub system_program: Program<'info, System>, // Add if CPI involves system program interactions (like creating accounts)
}

impl ExecuteDCAEvent<'_> {

    pub fn handler(ctx: Context<ExecuteDCAEvent>) -> Result<()> {
        let dca_event = &mut ctx.accounts.dca_event;
        let supported_protocol = &ctx.accounts.supported_protocol;
        let user_vault = &ctx.accounts.user_vault;
    
        // Check if the DCA event is due for execution
        let current_timestamp = Clock::get()?.unix_timestamp;
        if current_timestamp < dca_event.last_executed_timestamp + dca_event.frequency_seconds {
            return Err(RekaError::DcaNotDue.into());
        }
    
        // TODO: Implement the CPI to the supported protocol based on `supported_protocol.protocol_program_id`
        // and `dca_event.automation_params`. This is the most complex part and
        // will require dynamic CPI calls based on the automation_id and parameters.
    
        // Example CPI structure (this will vary greatly depending on the protocol):
        // let cpi_accounts = ... // Accounts required by the target protocol
        // let cpi_program = supported_protocol.protocol_program_id;
        // let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        // // You'll need to construct the instruction data for the CPI based on automation_params
        // let instruction_data = ...;
        // invoke(
        //     &solana_program::instruction::Instruction {
        //         program_id: cpi_program,
        //         accounts: cpi_ctx.to_account_metas(None),
        //         data: instruction_data,
        //     },
        //     &cpi_ctx.to_account_infos(),
        // )?;
    
        // After successful CPI execution:
        dca_event.last_executed_timestamp = current_timestamp;
    
        Ok(())
    }
}