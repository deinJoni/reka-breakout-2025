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


    it("Adds a new protocol!", async () => {

        const id = "test"

        const [supportedProtocol, bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("reka"), Buffer.from(id)], program.programId)

        const tx = await program.methods.addSupportedProtocol(id, anchor.web3.Keypair.generate().publicKey, Buffer.from(Uint8Array.from([]))).accounts({
            supportedProtocol: supportedProtocol
        }).rpc();

        console.log("Your transaction signature", tx);
    });


    it("Adds a second new protocol!", async () => {

        const id = "test2"

        const [supportedProtocol, bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("reka"), Buffer.from(id)], program.programId)

        const tx = await program.methods.addSupportedProtocol(id, anchor.web3.Keypair.generate().publicKey, Buffer.from(Uint8Array.from([]))).accounts({
            supportedProtocol: supportedProtocol
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

        const tx = await program.methods.depositSol(new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL)).accounts({}).rpc({skipPreflight: true});

        const tx2 = await program.methods.depositSol(new anchor.BN(1.5 * anchor.web3.LAMPORTS_PER_SOL)).accounts({}).rpc({skipPreflight: true});

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
        }).rpc({skipPreflight: true});

        const tx2 = await program.methods.depositToken(new anchor.BN(2_000)).accountsPartial({
            userTokenAccount: userTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            mint: mint
        }).rpc({skipPreflight: true});

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
        }).rpc({skipPreflight: true});

        const tx2 = await program.methods.depositToken(new anchor.BN(2_000)).accountsPartial({
            userTokenAccount: userTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            mint: mint
        }).rpc({skipPreflight: true});

        const tx3 = await program.methods.depositToken(new anchor.BN(3_000)).accountsPartial({
            userTokenAccount: userTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            mint: mint
        }).rpc({skipPreflight: true});

        console.log("Your transaction signatures", tx, tx2, tx3);
    });

    await udelay(1_000_000)
});

async function udelay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
