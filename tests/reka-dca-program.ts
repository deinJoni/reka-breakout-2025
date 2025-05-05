import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RekaDcaProgram } from "../target/types/reka_dca_program";

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

        const tx = await program.methods.addSupportedProtocols(id, anchor.web3.Keypair.generate().publicKey, Buffer.from(Uint8Array.from([]))).accounts({
            supportedProtocol: supportedProtocol
        }).rpc({skipPreflight: true});

        console.log("Your transaction signature", tx);
    });


    it("Adds a second new protocol!", async () => {

        const id = "test2"

        const [supportedProtocol, bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("reka"), Buffer.from(id)], program.programId)

        const tx = await program.methods.addSupportedProtocols(id, anchor.web3.Keypair.generate().publicKey, Buffer.from(Uint8Array.from([]))).accounts({
            supportedProtocol: supportedProtocol
        }).rpc({skipPreflight: true});

        console.log("Your transaction signature", tx);
    });

    await udelay(1_000_000)
});

async function udelay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
