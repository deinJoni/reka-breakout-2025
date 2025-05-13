use anchor_lang::prelude::*;

#[error_code]
pub enum RekaError {
    #[msg("Automation is not due for execution yet.")]
    ExecutionTooSoon,
    #[msg("The provided user vault does not match the one stored in the automation.")]
    InvalidUserVault,
    #[msg("The user field in the vault does not match the user field in the automation.")]
    VaultUserMismatch,
    #[msg("The provided supported protocol account does not match the one specified in the automation.")]
    InvalidSupportedProtocol,
    #[msg("The provided target program ID does not match the one in the supported protocol account.")]
    InvalidTargetProgram,
    #[msg("Automation has no protocols defined.")]
    NoProtocolsDefined,
    #[msg("Data modification index out of bounds.")]
    DataIndexOutOfBounds,
    #[msg("Unsupported data modification mode.")]
    UnsupportedDataMode,
    #[msg("The number of remaining accounts does not match the number required by the protocol data.")]
    IncorrectRemainingAccountsCount,
    #[msg("The provided account does not match the expected address in protocol data.")]
    AccountMismatch,
}