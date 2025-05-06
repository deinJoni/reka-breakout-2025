use anchor_lang::prelude::*;

#[error_code]
pub enum RekaError {
    #[msg("DCA event is not yet due for execution.")]
    DcaNotDue,
    // Add more specific error codes for CPI failures, invalid parameters, etc.
}