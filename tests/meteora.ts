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

    const automationId = "my-meteora-swap-" + Math.floor(Math.random() * 1_000_000); // Unique ID for the automation

    // Helper to set up test tokens (USDC mint and fund user)
    async function setupTestTokens() {
        // Create USDC Mint for testing on localnet/devnet
        USDC_MINT = await SPL.createMint(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 6); // USDC usually has 6 decimals

        // Fund user with some test USDC (for potential future use or to check balances)
        const userUsdcAta = await SPL.getOrCreateAssociatedTokenAccount(
            provider.connection,
            provider.wallet.payer,
            USDC_MINT,
            provider.wallet.publicKey
        );
        await SPL.mintTo(provider.connection, provider.wallet.payer, USDC_MINT, userUsdcAta.address, provider.wallet.payer, 10_000 * (10 ** 6)); // Mint 10,000 USDC
    }

    async function transformSolToWSol(amount: number) {
        const userSolAta = await SPL.getOrCreateAssociatedTokenAccount(
            provider.connection,
            provider.wallet.payer,
            NATIVE_MINT,
            provider.wallet.publicKey
        );
        const tx = new anchor.web3.Transaction().add(
            SystemProgram.transfer({
                fromPubkey: provider.wallet.publicKey,
                toPubkey: userSolAta.address,
                lamports: amount
            }),
            createSyncNativeInstruction(userSolAta.address)
        );
        await provider.sendAndConfirm(tx, [], { skipPreflight: false, commitment: "confirmed" });
    }

    before(async () => {
        //await setupTestTokens();
        await transformSolToWSol(0.1 * anchor.web3.LAMPORTS_PER_SOL); // Ensure we have some SOL wrapped as wSOL
        // Placeholder for a Meteora wSOL-USDC pool address.
        // REPLACE THIS WITH A REAL DLMM POOL ADDRESS ON YOUR TESTNET!
        // Example: If running on localnet, you'd need to deploy a DLMM pool first.
        WSOL_USDC_DLMM_POOL_ADDRESS = new PublicKey("3xoczq45qQL5e2vsq1c8LeyoRqxJBggnF3tMZUvHE68Y");
        console.log("Using USDC Mint:", USDC_MINT.toBase58());
        console.log("Using wSOL Mint:", WSOL_MINT.toBase58());
        console.log("Using Meteora DLMM Program ID:", METEORA_DLMM_PROGRAM_ID.toBase58());
        console.log("Using placeholder Meteora Pool Address:", WSOL_USDC_DLMM_POOL_ADDRESS.toBase58());
    });

    /*it("Initializes config!", async () => {
        const tx = await program.methods.initializeConfig().accounts({
            admin: provider.wallet.publicKey,
        }).rpc({skipPreflight: true, commitment: "confirmed"});
        console.log("Your transaction signature", tx);
    });*/

    /*it("Initializes User Vault!", async () => {
        const tx = await program.methods.initializeUserVault().accounts({
            user: provider.wallet.publicKey
        }).rpc({skipPreflight: true, commitment: "confirmed"});
        console.log("Your transaction signature", tx);
    });*/

    /*it("Deposits a token into Vault!", async () => {
        const mint = WSOL_MINT;        
        const [userVault, _bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("reka"), Buffer.from("vault"), provider.wallet.publicKey.toBuffer()], program.programId)
        const userTokenAccount = await SPL.getAssociatedTokenAddress(mint, provider.wallet.publicKey)
        const vaultTokenAccount = await SPL.getAssociatedTokenAddress(mint, userVault, true)
        const tx = await program.methods.depositToken(new anchor.BN(0.001 * anchor.web3.LAMPORTS_PER_SOL)).accountsPartial({
            userTokenAccount: userTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            mint: mint
        }).rpc({skipPreflight: true, commitment: "confirmed"});
        console.log("Your transaction signatures", tx);
    });*/

    // --- NEW: Add supported protocol for Meteora Swap ---
    /*it("Adds a supported protocol: meteoraSwap!", async () => {
        const id = "meteoraSwap";
        const tx = await program.methods.addSupportedProtocol(id, METEORA_DLMM_PROGRAM_ID, Buffer.from(Uint8Array.from([]))).accountsPartial({
            supportedProtocol: anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("reka"), Buffer.from("protocol"), Buffer.from(id)], program.programId)[0],
        }).rpc({skipPreflight: true, commitment: "confirmed"});
        console.log("Your transaction signature for adding meteoraSwap protocol", tx);
    });*/

    // --- NEW: Creates a Meteora swap automation ---
    it("Creates a Meteora swap automation", async () => {
        const supportedProtocolId = "meteoraSwap";
        const swapAmountWSOL = new anchor.BN(0.001 * anchor.web3.LAMPORTS_PER_SOL); // Amount of wSOL to swap
        const frequencySeconds = new anchor.BN(10); // Swap every 10 seconds

        const [userVaultPda, userVaultBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("reka"), Buffer.from("vault"), provider.wallet.publicKey.toBuffer()],
            program.programId
        );

        const [supportedProtocolPda, supportedProtocolBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("reka"), Buffer.from("protocol"), Buffer.from(supportedProtocolId)],
            program.programId
        );

        const [automationPda, automationBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("reka"), Buffer.from("automation"), userVaultPda.toBuffer(), Buffer.from(automationId)],
            program.programId
        );

        // Get or create associated token accounts for the vault PDA
        // These ATAs will hold the wSOL before the swap and USDC after the swap.
        const vaultWSolAccount = await SPL.getOrCreateAssociatedTokenAccount(
            provider.connection,
            provider.wallet.payer,
            WSOL_MINT,
            userVaultPda, // Owner is the vault PDA
            true // allowOwnerOffCurve = true for PDAs
        );

        const vaultUsdcAccount = await SPL.getOrCreateAssociatedTokenAccount(
            provider.connection,
            provider.wallet.payer,
            USDC_MINT,
            userVaultPda, // Owner is the vault PDA
            true
        );

        console.log("Vault wSOL Account:", vaultWSolAccount.address.toBase58());
        console.log("Vault USDC Account:", vaultUsdcAccount.address.toBase58());

        // --- Prepare Meteora Swap Instruction Data and Accounts ---
        const dlmmPool = await DLMM.create(provider.connection, WSOL_USDC_DLMM_POOL_ADDRESS);

        // For wSOL to USDC swap, assuming WSOL is Token X and USDC is Token Y in the pool.
        // `false` for `swapForY` means swapping from Token X (wSOL) to Token Y (USDC).
        // This might vary based on the specific pool's configuration (TokenA/TokenB).
        const binArrays = await dlmmPool.getBinArrayForSwap(false); // Get bin arrays for the swap direction

        if (!binArrays || binArrays.length === 0) {
            throw new Error("No bin arrays found for the swap. Pool might be empty or invalid.");
        }

        const swapQuote = await dlmmPool.swapQuote(
            swapAmountWSOL,
            false, // `swapForY`: false if input is tokenX (wSOL), true if input is tokenY (USDC)
            new anchor.BN(5), // Slippage: 5 basis points (0.05%)
            binArrays
        );

        if (!swapQuote) {
            throw new Error("Failed to get swap quote from Meteora. Check pool address and liquidity.");
        }

        console.log(`Estimated USDC out: ${swapQuote.minOutAmount.toNumber() / (10 ** 6)}`);

        // Generate the actual Meteora swap instruction
        const swapIx = await dlmmPool.swap({
            inToken: WSOL_MINT, // wSOL mint
            outToken: USDC_MINT, // USDC mint
            binArraysPubkey: swapQuote.binArraysPubkey,
            minOutAmount: swapQuote.minOutAmount,
            lbPair: dlmmPool.pubkey, // Meteora pool address
            inAmount: swapAmountWSOL,
            user: userVaultPda // The vault PDA will be the signer for the swap instruction
        });
        // Extract the relevant instruction from the generated transaction
        const meteoraSwapInstruction = swapIx.instructions.filter(i => i.programId.equals(METEORA_DLMM_PROGRAM_ID))[0];
        // Ensure the program ID matches
        /*if (!meteoraSwapInstruction.programId.equals(METEORA_DLMM_PROGRAM_ID)) {
            throw new Error("Meteora swap instruction program ID mismatch!");
        }*/

        // Map AccountMeta from Meteora instruction to the format required by RekaDcaProgram
        // It's crucial that these accounts are ordered exactly as the target program expects.
        // The `dlmmPool.swap` method returns the keys in the correct order.
        let automationAccountsInfo: { address: anchor.web3.PublicKey; isMut: boolean; isSigner: boolean }[] =
            meteoraSwapInstruction.keys.map(key => key.pubkey.equals(userVaultPda) ? ({
                address: key.pubkey,
                isMut: key.isWritable,
                isSigner: true,
            }) : ({
                address: key.pubkey,
                isMut: key.isWritable,
                isSigner: key.isSigner,
            }));

        // Manually ensure SystemProgram and TokenProgram are included if not by DLMM (they usually are)
        const tokenProgramAccountMeta = { address: SPL.TOKEN_PROGRAM_ID, isSigner: false, isMut: false };
        if (!automationAccountsInfo.some(acc => acc.address.equals(SPL.TOKEN_PROGRAM_ID))) {
            automationAccountsInfo.push(tokenProgramAccountMeta);
        }
        const systemProgramAccountMeta = { address: SystemProgram.programId, isSigner: false, isMut: false };
        if (!automationAccountsInfo.some(acc => acc.address.equals(SystemProgram.programId))) {
            automationAccountsInfo.push(systemProgramAccountMeta);
        }
        // Clock sysvar is often needed
        const clockSysvarAccountMeta = { address: SYSVAR_CLOCK_PUBKEY, isSigner: false, isMut: false };
        if (!automationAccountsInfo.some(acc => acc.address.equals(SYSVAR_CLOCK_PUBKEY))) {
            automationAccountsInfo.push(clockSysvarAccountMeta);
        }

        const tx = await program.methods
            .createAutomation(automationId, [
                {
                    protocol: {
                        id: supportedProtocolId,
                        key: supportedProtocolPda,
                    },
                    automationAccountsInfo: automationAccountsInfo,
                    automationParams: [
                        {
                            index: 0, // Start replacing at the beginning of the (empty) template
                            data: meteoraSwapInstruction.data,
                            mode: { add: {} }, // Use Add mode to insert the instruction data
                        }],
                },
            ], frequencySeconds)
            .accountsPartial({
                user: provider.wallet.publicKey,
                userVault: userVaultPda,
                automation: automationPda,
            })
            .rpc({ skipPreflight: true, commitment: "confirmed" });

        console.log("Create Meteora Swap Automation successful, signature:", tx);
    });


    // --- NEW: Executes the Meteora swap automation ---
    it("Executes the Meteora swap automation", async () => {
        const supportedProtocolId = "meteoraSwap";
        const frequencySeconds = new anchor.BN(10); // Match frequency from creation

        const [userVaultPda, userVaultBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("reka"), Buffer.from("vault"), provider.wallet.publicKey.toBuffer()],
            program.programId
        );

        const [supportedProtocolPda, supportedProtocolBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("reka"), Buffer.from("protocol"), Buffer.from(supportedProtocolId)],
            program.programId
        );

        const [automationPda, automationBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("reka"), Buffer.from("automation"), userVaultPda.toBuffer(), Buffer.from(automationId)],
            program.programId
        );

        console.log(`Waiting for ${frequencySeconds.toNumber() + 1} seconds before execution...`);
        await udelay((frequencySeconds.toNumber() + 1) * 1000); // Wait longer than frequency

        const vaultWSolAccount = await getAssociatedTokenAddress(WSOL_MINT, userVaultPda, true);
        const vaultUsdcAccount = await getAssociatedTokenAddress(USDC_MINT, userVaultPda, true);

        let vaultWSolBalanceBefore = 0;
        try {
            const vaultWSolAccountInfo = await getAccount(provider.connection, vaultWSolAccount);
            vaultWSolBalanceBefore = Number(vaultWSolAccountInfo.amount);
        } catch (error) {
            console.warn("Vault wSOL account not found or uninitialized before swap.", error);
        }

        let vaultUsdcBalanceBefore = 0;
        try {
            const vaultUsdcAccountInfo = await getAccount(provider.connection, vaultUsdcAccount);
            vaultUsdcBalanceBefore = Number(vaultUsdcAccountInfo.amount);
        } catch (error) {
            console.warn("Vault USDC account not found or uninitialized before swap.", error);
        }

        console.log(`Vault wSOL balance before: ${vaultWSolBalanceBefore / anchor.web3.LAMPORTS_PER_SOL} wSOL`);
        console.log(`Vault USDC balance before: ${vaultUsdcBalanceBefore / (10 ** 6)} USDC`);

        // To correctly execute, the `remainingAccountsMeta` must match the
        // `automationAccountsInfo` saved during the `createAutomation` call.
        // In a real application, you would fetch the `automation` account and
        // deserialize its stored `protocolsData[0].automationAccountsInfo`.
        // For this test, we'll re-derive them using the same logic.
        const swapAmountWSOL = new anchor.BN(0.01 * anchor.web3.LAMPORTS_PER_SOL);
        const dlmmPool = await DLMM.create(provider.connection, WSOL_USDC_DLMM_POOL_ADDRESS);
        const binArrays = await dlmmPool.getBinArrayForSwap(false);
        const swapQuote = await dlmmPool.swapQuote(
            swapAmountWSOL,
            false,
            new anchor.BN(5),
            binArrays
        );
        if (!swapQuote) {
            throw new Error("Failed to get swap quote for execution. Check pool address and liquidity.");
        }

        const swapIx = await dlmmPool.swap({
            inToken: WSOL_MINT,
            outToken: USDC_MINT,
            binArraysPubkey: swapQuote.binArraysPubkey,
            minOutAmount: swapQuote.minOutAmount,
            lbPair: dlmmPool.pubkey,
            inAmount: swapAmountWSOL,
            user: userVaultPda,
        });

        const meteoraSwapInstruction = swapIx.instructions.filter(i => i.programId.equals(METEORA_DLMM_PROGRAM_ID))[0];

        let remainingAccountsMeta: anchor.web3.AccountMeta[] = meteoraSwapInstruction.keys.map(key => key.pubkey.equals(userVaultPda) ? ({
            pubkey: key.pubkey,
            isWritable: key.isWritable,
            isSigner: false, // The DLMM SDK should correctly mark the userVaultPda as signer
        }) : ({
            pubkey: key.pubkey,
            isWritable: key.isWritable,
            isSigner: key.isSigner, // The DLMM SDK should correctly mark the userVaultPda as signer
        }));

        // Ensure SystemProgram and TokenProgram are included if not already (they usually are needed for CPI)
        const tokenProgramAccountMeta = { pubkey: SPL.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false };
        if (!remainingAccountsMeta.some(acc => acc.pubkey.equals(SPL.TOKEN_PROGRAM_ID))) {
            remainingAccountsMeta.push(tokenProgramAccountMeta);
        }
        const systemProgramAccountMeta = { pubkey: SystemProgram.programId, isSigner: false, isWritable: false };
        if (!remainingAccountsMeta.some(acc => acc.pubkey.equals(SystemProgram.programId))) {
            remainingAccountsMeta.push(systemProgramAccountMeta);
        }
        const clockSysvarAccountMeta = { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false };
        if (!remainingAccountsMeta.some(acc => acc.pubkey.equals(SYSVAR_CLOCK_PUBKEY))) {
            remainingAccountsMeta.push(clockSysvarAccountMeta);
        }

        const tx = await program.methods
            .executeAutomation()
            .accountsPartial({
                executor: provider.wallet.publicKey, // Anyone can execute (within program's logic)
                userVault: userVaultPda,
                automation: automationPda,
                supportedProtocol: supportedProtocolPda,
                targetProgram: METEORA_DLMM_PROGRAM_ID, // The program being called (Meteora DLMM)
                systemProgram: anchor.web3.SystemProgram.programId,
                clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            })
            .remainingAccounts(remainingAccountsMeta) // Pass the accounts needed by the *target* instruction
            .transaction()

        tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;

        tx.feePayer = provider.wallet.publicKey;

        let signedTx = (await provider.wallet.signTransaction(tx)).serialize();

        await provider.connection.sendRawTransaction(signedTx);

        console.log("Execute Meteora Swap Automation successful, signature:", tx);

        await udelay(2000); // Give some time for balance to update

        let vaultWSolBalanceAfter = 0;
        try {
            const vaultWSolAccountInfo = await getAccount(provider.connection, vaultWSolAccount);
            vaultWSolBalanceAfter = Number(vaultWSolAccountInfo.amount);
        } catch (error) {
            console.warn("Vault wSOL account not found or uninitialized after swap.", error);
        }

        let vaultUsdcBalanceAfter = 0;
        try {
            const vaultUsdcAccountInfo = await getAccount(provider.connection, vaultUsdcAccount);
            vaultUsdcBalanceAfter = Number(vaultUsdcAccountInfo.amount);
        } catch (error) {
            console.warn("Vault USDC account not found or uninitialized after swap.", error);
        }

        console.log(`Vault wSOL balance after: ${vaultWSolBalanceAfter / anchor.web3.LAMPORTS_PER_SOL} wSOL`);
        console.log(`Vault USDC balance after: ${vaultUsdcBalanceAfter / (10 ** 6)} USDC`);

        console.assert(vaultWSolBalanceAfter < vaultWSolBalanceBefore, "wSOL balance should decrease after swap");
        console.assert(vaultUsdcBalanceAfter > vaultUsdcBalanceBefore, "USDC balance should increase after swap");
    });

    await udelay(1_000_000)
});

async function udelay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}