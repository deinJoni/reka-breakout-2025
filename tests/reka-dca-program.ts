import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RekaDcaProgram } from "../target/types/reka_dca_program";
import * as SPL from '@solana/spl-token'

describe("reka-dca-program", async () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.rekaDcaProgram as Program<RekaDcaProgram>;

    it("Initializes config!", async () => {

        const tx = await program.methods.initializeConfig().accounts({
            admin: provider.wallet.publicKey,
        }).rpc();

        console.log("Your transaction signature", tx);
    });

    it("Initializes User Vault!", async () => {

        const tx = await program.methods.initializeUserVault().accounts({
            user: provider.wallet.publicKey
        }).rpc();

        console.log("Your transaction signature", tx);
    });

    it("Deposits solana into Vault twice!", async () => {

        const tx = await program.methods.depositSol(new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL)).accounts({}).rpc();

        const tx2 = await program.methods.depositSol(new anchor.BN(1.5 * anchor.web3.LAMPORTS_PER_SOL)).accounts({}).rpc();

        console.log("Your transaction signatures", tx, tx2);
    });

    it("Deposits a token into Vault twice!", async () => {
        const mint = await SPL.createMint(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 0)

        const tokenAccount = await SPL.getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, mint, provider.wallet.publicKey)

        await SPL.mintTo(provider.connection, provider.wallet.payer, mint, tokenAccount.address, provider.wallet.payer, 100_000)

        const [userVault, bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("reka"), Buffer.from("vault"), provider.wallet.publicKey.toBuffer()], program.programId)

        const userTokenAccount = await SPL.getAssociatedTokenAddress(mint, provider.wallet.publicKey)
        const vaultTokenAccount = await SPL.getAssociatedTokenAddress(mint, userVault, true)

        const tx = await program.methods.depositToken(new anchor.BN(1_000)).accountsPartial({
            userTokenAccount: userTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            mint: mint
        }).rpc();

        const tx2 = await program.methods.depositToken(new anchor.BN(2_000)).accountsPartial({
            userTokenAccount: userTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            mint: mint
        }).rpc();

        console.log("Your transaction signatures", tx, tx2);
    });

    it("Deposits another token into Vault three times!", async () => {

        const mint = await SPL.createMint(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 0)

        const tokenAccount = await SPL.getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, mint, provider.wallet.publicKey)

        await SPL.mintTo(provider.connection, provider.wallet.payer, mint, tokenAccount.address, provider.wallet.payer, 100_000)

        const [userVault, bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("reka"), Buffer.from("vault"), provider.wallet.publicKey.toBuffer()], program.programId)

        const userTokenAccount = await SPL.getAssociatedTokenAddress(mint, provider.wallet.publicKey)
        const vaultTokenAccount = await SPL.getAssociatedTokenAddress(mint, userVault, true)

        const tx = await program.methods.depositToken(new anchor.BN(1_000)).accountsPartial({
            userTokenAccount: userTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            mint: mint
        }).rpc();

        const tx2 = await program.methods.depositToken(new anchor.BN(2_000)).accountsPartial({
            userTokenAccount: userTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            mint: mint
        }).rpc();

        const tx3 = await program.methods.depositToken(new anchor.BN(3_000)).accountsPartial({
            userTokenAccount: userTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            mint: mint
        }).rpc();

        console.log("Your transaction signatures", tx, tx2, tx3);
    });

    it("Withdraws solana twice from Vault!", async () => {

        const tx = await program.methods.withdrawSol(new anchor.BN(0.3 * anchor.web3.LAMPORTS_PER_SOL)).accounts({}).rpc();

        const tx2 = await program.methods.withdrawSol(new anchor.BN(0.2 * anchor.web3.LAMPORTS_PER_SOL)).accounts({}).rpc();

        console.log("Your transaction signatures", tx, tx2);
    });

    it("Withdraws tokens twice from Vault!", async () => {

        const mint = await SPL.createMint(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 0)

        const tokenAccount = await SPL.getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, mint, provider.wallet.publicKey)

        await SPL.mintTo(provider.connection, provider.wallet.payer, mint, tokenAccount.address, provider.wallet.payer, 100_000)

        const [userVault, bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("reka"), Buffer.from("vault"), provider.wallet.publicKey.toBuffer()], program.programId)

        const userTokenAccount = await SPL.getAssociatedTokenAddress(mint, provider.wallet.publicKey)
        const vaultTokenAccount = await SPL.getAssociatedTokenAddress(mint, userVault, true)

        await program.methods.depositToken(new anchor.BN(1_000)).accountsPartial({
            userTokenAccount: userTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            mint: mint
        }).rpc();

        await program.methods.depositToken(new anchor.BN(2_000)).accountsPartial({
            userTokenAccount: userTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            mint: mint
        }).rpc();

        const tx = await program.methods.withdrawToken(new anchor.BN(300)).accountsPartial({
            userTokenAccount: userTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            mint: mint
        }).rpc();

        const tx2 = await program.methods.withdrawToken(new anchor.BN(700)).accountsPartial({
            userTokenAccount: userTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            mint: mint
        }).rpc();

        console.log("Your transaction signatures", tx, tx2);
    });

    it("Adds a supported protocol: transferSOL!", async () => {

        const id = "transferSOL"

        const tx = await program.methods.addSupportedProtocol(id, anchor.web3.SystemProgram.programId, Buffer.from(Uint8Array.from([]))).accountsPartial({
            supportedProtocol: anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("reka"), Buffer.from("protocol"), Buffer.from(id)], program.programId)[0],
        }).rpc();

        console.log("Your transaction signatures", tx);
    });

    it("Creates a SOL transfer automation", async () => {
        const supportedProtocolId = "transferSOL";
        const automationId = "my-sol-transfer-automation";
        const transferAmount = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL * 0.1);
        const frequencySeconds = new anchor.BN(5);
        const recipient = anchor.web3.Keypair.fromSecretKey(Uint8Array.from([23,136,48,120,183,4,98,94,45,179,195,25,42,230,23,153,248,173,179,140,161,179,94,236,241,195,130,78,225,109,226,7,12,197,55,48,113,151,126,29,29,146,251,229,130,51,250,189,250,20,187,200,114,201,55,103,156,100,119,206,206,7,18,38]));

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

        const transferAccountsInfo: { address: anchor.web3.PublicKey; isMut: boolean; isSigner: boolean }[] = [
            {
                address: userVaultPda,
                isMut: true,
                isSigner: true,
            },
            {
                address: recipient.publicKey,
                isMut: true,
                isSigner: false,
            },
        ];

        // Define the parameters for the automation
        // For SystemProgram::transfer, the instruction data itself needs to be constructed.
        // It typically includes the instruction index (2 for transfer) and the amount.
        // The template is empty, so we use 'Replace' mode at index 0.
        // We need to serialize the transfer instruction data (ix discriminator + amount)
        const transferIxDiscriminator = Buffer.from([2, 0, 0, 0]); // SystemProgram Transfer instruction discriminator (usually 2)
        const amountBuffer = transferAmount.toArrayLike(Buffer, "le", 8); // u64 amount, little-endian
        const transferData = Buffer.concat([transferIxDiscriminator, amountBuffer]);

        const automationParams: { index: number; data: Buffer; mode: object }[] = [
            {
                index: 0, // Start replacing at the beginning of the (empty) template
                data: transferData,
                mode: { add: {} }, // Use Replace mode
            }
        ];


        // Construct the ProtocolData
        const protocolsData: {
            protocol: { id: string; key: anchor.web3.PublicKey }; // Match Rust struct ProtocolIdKey
            automationAccountsInfo: typeof transferAccountsInfo;
            automationParams: typeof automationParams;
        }[] = [
                {
                    protocol: {
                        id: supportedProtocolId, // ID used for SupportedProtocol seeds
                        key: supportedProtocolPda, // Key of the SupportedProtocol account
                    },
                    automationAccountsInfo: transferAccountsInfo,
                    automationParams: automationParams,
                },
            ];

        const tx = await program.methods
            .createAutomation(automationId, [
                {
                    protocol: {
                        id: supportedProtocolId, // ID used for SupportedProtocol seeds
                        key: supportedProtocolPda, // Key of the SupportedProtocol account
                    },
                    automationAccountsInfo: transferAccountsInfo,
                    automationParams: [
                        {
                            index: 0, // Start replacing at the beginning of the (empty) template
                            data: transferData,
                            mode: { add: {} }, // Use Replace mode
                        }
                    ],
                },
            ], frequencySeconds)
            .accountsPartial({
                user: provider.wallet.publicKey,
                userVault: userVaultPda,
                automation: automationPda
            })
            .rpc({ skipPreflight: true });

        console.log("Create Automation successful, signature:", tx);
    })


    it("Executes the SOL transfer automation", async () => {
        const supportedProtocolId = "transferSOL";
        const automationId = "my-sol-transfer-automation";
        const frequencySeconds = new anchor.BN(5);
        const recipient = anchor.web3.Keypair.fromSecretKey(Uint8Array.from([23,136,48,120,183,4,98,94,45,179,195,25,42,230,23,153,248,173,179,140,161,179,94,236,241,195,130,78,225,109,226,7,12,197,55,48,113,151,126,29,29,146,251,229,130,51,250,189,250,20,187,200,114,201,55,103,156,100,119,206,206,7,18,38]));

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

        const recipientBalanceBefore = await provider.connection.getBalance(recipient.publicKey);
        console.log(`Recipient balance before: ${recipientBalanceBefore / anchor.web3.LAMPORTS_PER_SOL} SOL`);
        const vaultPdaBalanceBefore = await provider.connection.getBalance(userVaultPda);
        console.log(`Vault PDA balance before: ${vaultPdaBalanceBefore / anchor.web3.LAMPORTS_PER_SOL} SOL`);


        // These are the accounts the *target* SystemProgram::transfer instruction expects
        const remainingAccountsMeta: anchor.web3.AccountMeta[] = [
            {
                pubkey: userVaultPda,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: recipient.publicKey,
                isSigner: false,
                isWritable: true,
            },
        ];

        const tx = await program.methods
            .executeAutomation()
            .accountsPartial({
                // Accounts for the execute_automation instruction itself
                executor: provider.wallet.publicKey, // Anyone can execute
                userVault: userVaultPda,
                automation: automationPda,
                supportedProtocol: supportedProtocolPda,
                targetProgram: anchor.web3.SystemProgram.programId, // The program being called (System Program)
                systemProgram: anchor.web3.SystemProgram.programId,
                clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            })
            .remainingAccounts(remainingAccountsMeta) // Pass the accounts needed by the *target* instruction
            .rpc({skipPreflight: true});

        console.log("Execute Automation successful, signature:", tx);

    })

    await udelay(1_000_000)
});

async function udelay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
