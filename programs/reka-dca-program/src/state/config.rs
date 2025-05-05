use anchor_lang::prelude::*;

#[account]
pub struct Config {
    pub admin: Pubkey,
    pub supported_protocols: Vec<ProtocolIdKey>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ProtocolIdKey {
    pub id: String,
    pub key: Pubkey,
}

impl Config {
    pub const MAX_ID_LENGTH: usize = 32;

    pub fn init_len() -> usize {
        8 + 32 + 4 + 1
    }

    pub fn len(self) -> usize {
        8 + 32 + 4 * (self.supported_protocols.len() * (Self::MAX_ID_LENGTH + 32)) + 1
    }

    pub fn len_with_new_protocol(self) -> usize {
        8 + 32 + 4 * ((self.supported_protocols.len() + 1) * (Self::MAX_ID_LENGTH + 32)) + 1
    }
}
