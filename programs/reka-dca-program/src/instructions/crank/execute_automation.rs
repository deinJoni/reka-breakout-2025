// src/instructions/execute_automation.rs
use crate::{
    constants::{AUTOMATION_SEED, SEED, SUPPORTED_PROTOCOL_SEED, VAULT_SEED},
    error::RekaError,
    state::*,
};
use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke_signed},
};

#[derive(Accounts)]
pub struct ExecuteAutomation<'info> {
    #[account(mut)]
    pub executor: Signer<'info>,

    #[account(
        mut,
        seeds = [SEED.as_bytes(), VAULT_SEED.as_bytes(), automation.user.as_ref()],
        bump = user_vault.bump,
        constraint = user_vault.key() == automation.user_vault @ RekaError::InvalidUserVault,
        constraint = user_vault.user == automation.user @ RekaError::VaultUserMismatch,
    )]
    pub user_vault: Account<'info, UserVault>,

    #[account(
        mut,
        seeds = [SEED.as_bytes(), AUTOMATION_SEED.as_bytes(), automation.user_vault.as_ref(), automation.id.as_bytes()],
        bump = automation.bump,
        has_one = user_vault, // Ensures association
    )]
    pub automation: Account<'info, Automation>,

    /// CHECK: Account validation is done below against automation.protocols_data[0].protocol
    #[account(
        seeds = [SEED.as_bytes(), SUPPORTED_PROTOCOL_SEED.as_bytes(), automation.protocols_data[0].protocol.id.as_bytes()],
        bump = supported_protocol.bump,
        constraint = supported_protocol.key() == automation.protocols_data[0].protocol.key @ RekaError::InvalidSupportedProtocol
    )]
    pub supported_protocol: Account<'info, SupportedProtocol>,

    /// CHECK: This is the program we are calling via CPI. Validated against supported_protocol.program_id. Marked executable.
    #[account(
        executable,
        constraint = target_program.key() == supported_protocol.program_id @ RekaError::InvalidTargetProgram
    )]
    pub target_program: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

impl ExecuteAutomation<'_> {
    pub fn handler(ctx: Context<ExecuteAutomation>) -> Result<()> {
        let automation = &mut ctx.accounts.automation;
        let user_vault = &ctx.accounts.user_vault;
        let supported_protocol = &ctx.accounts.supported_protocol;
        let target_program = &ctx.accounts.target_program;
        let clock = &ctx.accounts.clock;
        let current_timestamp = clock.unix_timestamp;
        
        require!(
            current_timestamp >= automation.last_executed_timestamp + automation.frequency_seconds,
            RekaError::ExecutionTooSoon
        );
        
        require!(
            !automation.protocols_data.is_empty(),
            RekaError::NoProtocolsDefined
        );
        let protocol_data = automation.protocols_data[0].clone();
        
        let mut instruction_data = supported_protocol.data_template.clone();
        
        for param in &protocol_data.automation_params {
            let index = param.index as usize;
            match param.mode {
                AutomationParamMode::Replace => {
                    let start = param.index as usize;
                    let end = start + param.data.len();
                    require!(
                        end <= instruction_data.len(),
                        RekaError::DataIndexOutOfBounds
                    );
                    instruction_data[start..end].copy_from_slice(&param.data);
                }
                AutomationParamMode::Add => {
                    instruction_data.extend_from_slice(&param.data);
                    require!(
                        index <= instruction_data.len(),
                        RekaError::DataIndexOutOfBounds
                    );

                    if index == instruction_data.len() {
                        instruction_data.extend_from_slice(&param.data);
                    } else {
                        let tail = instruction_data.split_off(index);
                        instruction_data.extend_from_slice(&param.data);
                        instruction_data.extend_from_slice(&tail);
                    }
                }
            }
        }

        let required_accounts_count = protocol_data.automation_accounts_info.len();
        require!(
            ctx.remaining_accounts.len() == required_accounts_count,
            RekaError::IncorrectRemainingAccountsCount
        );

        let mut account_metas = Vec::with_capacity(required_accounts_count);
        let mut account_infos_for_cpi = Vec::with_capacity(required_accounts_count);
        
        for (i, acc_info_def) in protocol_data.automation_accounts_info.iter().enumerate() {
            let provided_acc_info = &ctx.remaining_accounts[i];
            
            require!(
                provided_acc_info.key() == acc_info_def.address,
                RekaError::AccountMismatch
            );
            
            let is_signer_for_cpi =
                acc_info_def.is_signer && (acc_info_def.address == user_vault.key());
                
            if acc_info_def.is_mut {
                account_metas.push(AccountMeta::new(*provided_acc_info.key, is_signer_for_cpi));
            } else {
                account_metas.push(AccountMeta::new_readonly(
                    *provided_acc_info.key,
                    is_signer_for_cpi,
                ));
            }
            
            account_infos_for_cpi.push(provided_acc_info.clone());
        }
        
        let instruction = Instruction {
            program_id: *target_program.key,
            accounts: account_metas,
            data: instruction_data,
        };
        
        let user_vault_signer_seeds: &[&[&[u8]]] = &[&[
            SEED.as_bytes(),
            VAULT_SEED.as_bytes(),
            automation.user.as_ref(),
            &[user_vault.bump],
        ]];

        invoke_signed(
            &instruction,
            &account_infos_for_cpi,
            user_vault_signer_seeds,
        )?;

        automation.last_executed_timestamp = current_timestamp;

        Ok(())
    }
}