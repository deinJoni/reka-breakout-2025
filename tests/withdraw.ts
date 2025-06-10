import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RekaDcaProgram } from "../target/types/reka_dca_program";
import * as SPL from '@solana/spl-token';
import { NATIVE_MINT, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount, createSyncNativeInstruction } from '@solana/spl-token';
import DLMM from '@meteora-ag/dlmm'; // Import Meteora DLMM SDK
import { PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, TransactionInstruction } from '@solana/web3.js';


describe("meteora", async () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.rekaDcaProgram as Program<RekaDcaProgram>;

    // Define mint addresses for wSOL and USDC
    const WSOL_MINT = NATIVE_MINT; // wSOL mint address [9, 13]
    // For devnet/localnet testing, it's best to create your own USDC mint or use a known devnet faucet token.
    // The mainnet USDC mint is 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' [1, 2, 4, 6].
    // We'll create a test USDC mint dynamically for the test environment.
    let USDC_MINT: PublicKey = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU")

    // Meteora DLMM Program ID [7, 15]
    const METEORA_DLMM_PROGRAM_ID = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo');

    // Placeholder for a Meteora wSOL-USDC DLMM pool address.
    // !!! IMPORTANT: You MUST replace this with a real DLMM pool address for wSOL/USDC
    // on your localnet or devnet. For localnet, you'd typically deploy a pool first.
    // For a real-world scenario, you might fetch this from Meteora's APIs.
    let WSOL_USDC_DLMM_POOL_ADDRESS: PublicKey;

    before(async () => {
        // Placeholder for a Meteora wSOL-USDC pool address.
        // REPLACE THIS WITH A REAL DLMM POOL ADDRESS ON YOUR TESTNET!
        // Example: If running on localnet, you'd need to deploy a DLMM pool first.
        WSOL_USDC_DLMM_POOL_ADDRESS = new PublicKey("5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6");
        console.log("Using USDC Mint:", USDC_MINT.toBase58());
        console.log("Using wSOL Mint:", WSOL_MINT.toBase58());
        console.log("Using Meteora DLMM Program ID:", METEORA_DLMM_PROGRAM_ID.toBase58());
        console.log("Using placeholder Meteora Pool Address:", WSOL_USDC_DLMM_POOL_ADDRESS.toBase58());
    });

    it("withdraws everything!", async () => {
        const mint = WSOL_MINT
        const [userVault, bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("reka"), Buffer.from("vault"), provider.wallet.publicKey.toBuffer()], program.programId)
        const userTokenAccount = await SPL.getAssociatedTokenAddress(mint, provider.wallet.publicKey)
        const vaultTokenAccount = await SPL.getAssociatedTokenAddress(mint, userVault, true)

        const tx = await program.methods.withdrawSol(new anchor.BN(6 * anchor.web3.LAMPORTS_PER_SOL)).rpc({skipPreflight: true, commitment: "confirmed"});

        console.log("Your transaction signatures", tx);
    });

    await udelay(1_000_000)
});

async function udelay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}