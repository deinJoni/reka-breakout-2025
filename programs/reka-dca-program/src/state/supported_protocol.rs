use anchor_lang::prelude::*;

#[account]
pub struct SupportedProtocol {
    pub id: String,
    pub program_id: Pubkey,
    pub automation_data_template: Vec<u8>,
    pub bump: u8
}

impl SupportedProtocol {
    pub fn init_len(id_length: usize, automation_data_template_length: usize) -> usize {
        8 + 4 * (id_length * 1) + 32 + 4 * (automation_data_template_length * 1) + 1
    }
}