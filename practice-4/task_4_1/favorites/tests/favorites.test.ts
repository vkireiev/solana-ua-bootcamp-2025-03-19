import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Favorites } from "../target/types/favorites";
import {
  airdropIfRequired,
  getCustomErrorMessage,
} from "@solana-developers/helpers";
import { expect, describe, test } from "@jest/globals";
import { systemProgramErrors } from "./system-program-errors";

describe("favorites", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  it("Writes our favorites to the blockchain", async () => {
    const user = web3.Keypair.generate();
    const program = anchor.workspace.Favorites as Program<Favorites>;
    console.log(`WritesFavorites :: User public key: ${user.publicKey}`);

    await airdropIfRequired(
      anchor.getProvider().connection,
      user.publicKey,
      0.5 * web3.LAMPORTS_PER_SOL,
      1 * web3.LAMPORTS_PER_SOL
    );

    const favoriteNumber = new anchor.BN(23);
    const favoriteColor = "red";

    let tx: string | null = null;
    try {
      tx = await program.methods
        .setFavorites(favoriteNumber, favoriteColor)
        .accounts({
          user: user.publicKey,
        })
        .signers([user])
        .rpc();
    } catch (thrownObject) {
      const rawError = thrownObject as Error;
      throw new Error(
        getCustomErrorMessage(systemProgramErrors, rawError.message)
      );
    }

    console.log(`WritesFavorites :: Tx signature: ${tx}`);

    const [favoritesPda, _favoritesBump] =
      web3.PublicKey.findProgramAddressSync(
        [Buffer.from("favorites"), user.publicKey.toBuffer()],
        program.programId
      );

    const dataFromPda = await program.account.favorites.fetch(favoritesPda);
    expect(dataFromPda.color).toEqual(favoriteColor);
    expect(dataFromPda.number.toNumber()).toEqual(favoriteNumber.toNumber());

    console.log(`WritesFavorites :: Passed`);
  });

  it("Updates our favorites in the blockchain", async () => {
    const user = web3.Keypair.generate();
    const program = anchor.workspace.Favorites as Program<Favorites>;
    console.log(`UpdatesFavorites (prepare stage) :: User public key: ${user.publicKey}`);

    await airdropIfRequired(
      anchor.getProvider().connection,
      user.publicKey,
      0.5 * web3.LAMPORTS_PER_SOL,
      1 * web3.LAMPORTS_PER_SOL
    );

    const favoriteNumber = new anchor.BN(23);
    const favoriteColor = "red";

    let tx_write: string | null = null;
    try {
      tx_write = await program.methods
        .setFavorites(favoriteNumber, favoriteColor)
        .accounts({
          user: user.publicKey,
        })
        .signers([user])
        .rpc();
    } catch (thrownObject) {
      const rawError = thrownObject as Error;
      throw new Error(
        getCustomErrorMessage(systemProgramErrors, rawError.message)
      );
    }

    console.log(`UpdatesFavorites (write stage) :: Tx signature: ${tx_write}`);

    const [favoritesPda, _favoritesBump] =
      web3.PublicKey.findProgramAddressSync(
        [Buffer.from("favorites"), user.publicKey.toBuffer()],
        program.programId
      );

    const dataFromPdaAfterWrite = await program.account.favorites.fetch(favoritesPda);
    expect(dataFromPdaAfterWrite.color).toEqual(favoriteColor);
    expect(dataFromPdaAfterWrite.number.toNumber()).toEqual(favoriteNumber.toNumber());

    console.log(
      `UpdatesFavorites (write stage) :: Saved Favorites with ` +
      `Color: ${favoriteColor} and ` +
      `Number: ${favoriteNumber.toNumber()}`
    );

    // Update stage
    const favoriteNumberUpdate = new anchor.BN(12);
    const favoriteColorUpdate = "green";

    expect(dataFromPdaAfterWrite.color).not.toEqual(favoriteColorUpdate);
    expect(dataFromPdaAfterWrite.number.toNumber()).not.toEqual(favoriteNumberUpdate.toNumber());

    let tx_update: string | null = null;
    try {
      tx_update = await program.methods
        .updateFavorites(favoriteNumberUpdate, favoriteColorUpdate)
        .accounts({
          user: user.publicKey,
        })
        .signers([user])
        .rpc();
    } catch (thrownObject) {
      const rawError = thrownObject as Error;
      throw new Error(
        getCustomErrorMessage(systemProgramErrors, rawError.message)
      );
    }

    console.log(`UpdatesFavorites (update stage) :: Tx signature: ${tx_write}`);

    const dataFromPdaAfterUpdate = await program.account.favorites.fetch(favoritesPda);
    expect(dataFromPdaAfterUpdate.color).toEqual(favoriteColorUpdate);
    expect(dataFromPdaAfterUpdate.number.toNumber()).toEqual(favoriteNumberUpdate.toNumber());

    console.log(
      `UpdatesFavorites (update stage) :: Update Favorites with`+ 
      ` Color: ${favoriteColorUpdate} and` +
      ` Number: ${favoriteNumberUpdate.toNumber()}`
    );

    console.log(`UpdatesFavorites :: Passed`);
  });
});
