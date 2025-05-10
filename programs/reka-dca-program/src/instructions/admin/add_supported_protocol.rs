use std::ops::Deref;

use crate::{constants::{CONFIG_SEED, SEED}, state::*};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(id: String, _program_id: Pubkey, data_template: Vec<u8>)]
pub struct AddSupportedProtocol<'info> {

    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut, 
        has_one = admin, 
        seeds = [SEED.as_bytes(), CONFIG_SEED.as_bytes()], 
        bump = config.bump,
        realloc = Config::len_with_new_protocol(config.deref().clone()),
        realloc::payer = admin,
        realloc::zero = true,

    )]
    pub config: Account<'info, Config>,

    #[account(init, payer = admin, space = SupportedProtocol::init_len(id.len(), data_template.len()), seeds = [SEED.as_bytes(), id.as_bytes()], bump)]
    pub supported_protocol: Account<'info, SupportedProtocol>,

    pub system_program: Program<'info, System>,
}

impl AddSupportedProtocol<'_> {
    pub fn handler(
        ctx: Context<AddSupportedProtocol>,
        id: String,
        program_id: Pubkey,
        data_template: Vec<u8>,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.supported_protocols.push(ProtocolIdKey {
            id: id.clone(),
            key: program_id,
        });

        let supported_protocol = &mut ctx.accounts.supported_protocol;
        supported_protocol.id = id;
        supported_protocol.program_id = program_id;
        supported_protocol.data_template = data_template;
        supported_protocol.bump = ctx.bumps.supported_protocol;

        Ok(())
    }
}