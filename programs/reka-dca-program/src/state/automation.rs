use anchor_lang::prelude::*;

use super::ProtocolIdKey;

#[account]
pub struct Automation {
    pub id: String,
    pub user: Pubkey,
    pub user_vault: Pubkey,
    pub protocols_data: Vec<ProtocolData>,
    pub frequency_seconds: i64,
    pub last_executed_timestamp: i64,
    pub bump: u8,
}

impl Automation {
    pub fn init_len(id_length: usize, protocols_data: Vec<ProtocolData>) -> usize {
        8 + 4
            + id_length
            + 32
            + 32
            + 4
            + protocols_data
                .iter()
                .map(|pd| pd.clone().len())
                .sum::<usize>()
            + 8
            + 8
            + 1
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ProtocolData {
    pub protocol: ProtocolIdKey,
    pub automation_accounts_info: Vec<AutomationAccountInfo>,
    pub automation_params: Vec<AutomationParam>,
}

impl ProtocolData {
    pub fn len(self: ProtocolData) -> usize {
        (4 + self.protocol.id.len() + 32)
            + 4
            + self
                .automation_accounts_info
                .iter()
                .map(|pd| pd.clone().len())
                .sum::<usize>()
            + 4
            + self
                .automation_params
                .iter()
                .map(|pd| pd.clone().len())
                .sum::<usize>()
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AutomationAccountInfo {
    pub address: Pubkey,
    pub is_mut: bool,
    pub is_signer: bool,
}

impl AutomationAccountInfo {
    pub fn len(self: AutomationAccountInfo) -> usize {
        32 + 1 + 1
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AutomationParam {
    pub index: u8,
    pub data: Vec<u8>,
    pub mode: AutomationParamMode,
}

impl AutomationParam {
    pub fn len(self: AutomationParam) -> usize {
        1 + 4 + self.data.len() + 1
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum AutomationParamMode {
    Replace,
    Add,
}
