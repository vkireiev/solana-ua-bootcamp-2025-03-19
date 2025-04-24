import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Favorites } from "../target/types/favorites";
import {
  airdropIfRequired,
  getCustomErrorMessage,
} from "@solana-developers/helpers";
import { expect, describe, test } from "@jest/globals";
import { systemProgramErrors } from "./system-program-errors";

describe("favorites_v2", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  it("Writes FavoritesV2 to the blockchain (with Authority)", async () => {
    const user = web3.Keypair.generate();
    const authority = web3.Keypair.generate();
    const program = anchor.workspace.Favorites as Program<Favorites>;
    
    console.log(`WritesFavoritesV2 (with Authority) :: User public key: ${user.publicKey}`);

    const favoriteNumber = new anchor.BN(23);
    const favoriteColor = "red";
    const favoriteAuthority = authority.publicKey;

    await airdropSolToAccount({user: user.publicKey});

    let tx_create = await createFavoritesV2({
      program,
      user,
      authority: favoriteAuthority,
      number: favoriteNumber,
      color: favoriteColor,
    });
    console.log(`WritesFavoritesV2 (with Authority) :: Tx signature: ${tx_create}`);

    const [favoritesPda, _favoritesBump] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("favorites_v2"), user.publicKey.toBuffer()],
        program.programId
      );

    const dataFromPda = await program.account.favoritesV2.fetch(favoritesPda);
    expect(dataFromPda.color).toEqual(favoriteColor);
    expect(dataFromPda.number.toNumber()).toEqual(favoriteNumber.toNumber());
    expect(dataFromPda.authority).toEqual(favoriteAuthority);
    expect(dataFromPda.creator).toEqual(user.publicKey);

    console.log(`WritesFavoritesV2 (with Authority) :: Passed`);
  });

  it("Writes FavoritesV2 to the blockchain (without Authority)", async () => {
    const user = web3.Keypair.generate();
    const program = anchor.workspace.Favorites as Program<Favorites>;

    console.log(`WritesFavoritesV2 (without Authority) :: User public key: ${user.publicKey}`);

    const favoriteNumber = new anchor.BN(23);
    const favoriteColor = "red";

    await airdropSolToAccount({user: user.publicKey});

    let tx_create = await createFavoritesV2({
      program,
      user,
      authority: null,
      number: favoriteNumber,
      color: favoriteColor,
    });
    console.log(`WritesFavoritesV2 (without Authority) :: Tx signature: ${tx_create}`);

    const [favoritesPda, _favoritesBump] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("favorites_v2"), user.publicKey.toBuffer()],
        program.programId
      );

    const dataFromPda = await program.account.favoritesV2.fetch(favoritesPda);
    expect(dataFromPda.color).toEqual(favoriteColor);
    expect(dataFromPda.number.toNumber()).toEqual(favoriteNumber.toNumber());
    expect(dataFromPda.authority).toBeNull();

    console.log(`WritesFavoritesV2 (without Authority) :: Passed`);
  });  

  it("Updates FavoritesV2.Authority on an existing account", async () => {
    const user = web3.Keypair.generate();
    const initialAuthority = web3.Keypair.generate();
    const newAuthority = web3.Keypair.generate();
    const program = anchor.workspace.Favorites as Program<Favorites>;

    console.log(`Updates FavoritesV2.Authority (prepare stage) :: User pubkey: ${user.publicKey}`);

    const favoriteNumber = new anchor.BN(5);
    const favoriteColor = "blue";

    await airdropSolToAccount({user: user.publicKey});
     
    let tx_create = await createFavoritesV2({
      program,
      user,
      authority: initialAuthority.publicKey,
      number: favoriteNumber,
      color: favoriteColor,
    });
    console.log(`Updates FavoritesV2.Authority (create stage) :: Tx signature: ${tx_create}`);

    const [favoritesPda, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("favorites_v2"), user.publicKey.toBuffer()],
      program.programId
    );

    const dataFromPdaInitial = await program.account.favoritesV2.fetch(favoritesPda);
    expect(dataFromPdaInitial.color).toEqual(favoriteColor);
    expect(dataFromPdaInitial.number.toNumber()).toEqual(favoriteNumber.toNumber());
    expect(dataFromPdaInitial.authority).toEqual(initialAuthority.publicKey);

    console.log(
      `Updates FavoritesV2.Authority (create stage) :: Saved FavoritesV2 with ` +
      `Color: ${dataFromPdaInitial.color} and ` +
      `Number: ${dataFromPdaInitial.number.toNumber()} and ` + 
      `Authority: ${dataFromPdaInitial.authority}`
    );    

    let tx_update = await updateFavoritesV2Authority({
      program,
      user,
      authority: newAuthority.publicKey,
    });
    console.log(`Updates FavoritesV2.Authority (update stage) :: Tx signature: ${tx_update}`);

    const dataFromPdaAfterUpdate = await program.account.favoritesV2.fetch(favoritesPda);
    expect(dataFromPdaAfterUpdate.color).toEqual(favoriteColor);
    expect(dataFromPdaAfterUpdate.number.toNumber()).toEqual(favoriteNumber.toNumber());
    expect(dataFromPdaAfterUpdate.authority).toEqual(newAuthority.publicKey);

    console.log("Updates FavoritesV2.Authority :: Passed");
  });

  // it("Fails to update FavoritesV2.Authority from non-creator", async () => {
  //   const user = web3.Keypair.generate();
  //   const newAuthority = web3.Keypair.generate();
  //   const program = anchor.workspace.Favorites as Program<Favorites>;

  //   console.log(`Fails to update FavoritesV2.Authority (prepare stage) :: User pubkey: ${user.publicKey}`);

  //   const favoriteNumber = new anchor.BN(5);
  //   const favoriteColor = "blue";

  //   await airdropSolToAccount({user: user.publicKey});
     
  //   let tx_create = await createFavoritesV2({
  //     program,
  //     user,
  //     authority: null,
  //     number: favoriteNumber,
  //     color: favoriteColor,
  //   });
  //   console.log(`Fails to update FavoritesV2.Authority (create stage) :: Tx signature: ${tx_create}`);

  //   const [favoritesPda, _bump] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("favorites_v2"), user.publicKey.toBuffer()],
  //     program.programId
  //   );

  //   const dataFromPdaInitial = await program.account.favoritesV2.fetch(favoritesPda);
  //   expect(dataFromPdaInitial.color).toEqual(favoriteColor);
  //   expect(dataFromPdaInitial.number.toNumber()).toEqual(favoriteNumber.toNumber());
  //   expect(dataFromPdaInitial.authority).toBeNull();

  //   console.log(
  //     `Fails to update FavoritesV2.Authority (create stage) :: Saved FavoritesV2 with ` +
  //     `Color: ${dataFromPdaInitial.color} and ` +
  //     `Number: ${dataFromPdaInitial.number.toNumber()} and ` + 
  //     `Authority: ${dataFromPdaInitial.authority}`
  //   );    

  //   let thrownError = "";
  //   try {
  //     let tx_update = await program.methods
  //       .setFavoritesV2Authority(newAuthority.publicKey)
  //       .accounts({
  //         user: user.publicKey,
  //       })
  //       .signers([newAuthority])
  //       .rpc();
  //   } catch (thrownObject) {
  //     const rawError = thrownObject as Error;
  //     console.log(rawError.message);
  //     console.log(rawError.stack);
  //     thrownError = "yes";
  //   }
  //   expect(thrownError).toEqual("yes");

  //   const dataFromPdaAfterUpdate = await program.account.favoritesV2.fetch(favoritesPda);
  //   expect(dataFromPdaAfterUpdate.color).toEqual(favoriteColor);
  //   expect(dataFromPdaAfterUpdate.number.toNumber()).toEqual(favoriteNumber.toNumber());
  //   expect(dataFromPdaAfterUpdate.authority).toBeNull();

  //   console.log("Fails to update FavoritesV2.Authority :: Passed");
  // });
  
  it("Updates FavoritesV2 in the blockchain", async () => {
    const user = web3.Keypair.generate();
    const program = anchor.workspace.Favorites as Program<Favorites>;

    console.log(`UpdatesFavoritesV2 (prepare stage) :: User public key: ${user.publicKey}`);

    const favoriteNumber = new anchor.BN(5);
    const favoriteColor = "blue";

    await airdropSolToAccount({user: user.publicKey});
     
    let tx_create = await createFavoritesV2({
      program,
      user,
      number: favoriteNumber,
      color: favoriteColor,
    });
    console.log(`UpdatesFavoritesV2 (create stage) :: Tx signature: ${tx_create}`);

    const [favoritesPda, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("favorites_v2"), user.publicKey.toBuffer()],
      program.programId
    );
    const dataFromPdaAfterCreate = await program.account.favoritesV2.fetch(favoritesPda);
    console.log(
      `UpdatesFavoritesV2 (create stage) :: Saved FavoritesV2 with ` +
      `Color: ${dataFromPdaAfterCreate.color} and ` +
      `Number: ${dataFromPdaAfterCreate.number.toNumber()} and ` + 
      `Authority: ${dataFromPdaAfterCreate.authority}`
    ); 

    expect(dataFromPdaAfterCreate.color).toEqual(favoriteColor);
    expect(dataFromPdaAfterCreate.number.toNumber()).toEqual(favoriteNumber.toNumber());

    // Update stage
    const favoriteNumberUpdate = new anchor.BN(12);
    const favoriteColorUpdate = "green";

    expect(dataFromPdaAfterCreate.color).not.toEqual(favoriteColorUpdate);
    expect(dataFromPdaAfterCreate.number.toNumber()).not.toEqual(favoriteNumberUpdate.toNumber());

    let tx_update = await updateFavoritesV2({
      program,
      user: user,
      number: favoriteNumberUpdate,
      color: favoriteColorUpdate,
    });
    console.log(`UpdatesFavoritesV2 (update stage) :: Tx signature: ${tx_update}`);

    const dataFromPdaAfterUpdate = await program.account.favoritesV2.fetch(favoritesPda);
    console.log(
      `UpdatesFavoritesV2 (update stage) :: Update FavoritesV2 with `+ 
      `Color: ${dataFromPdaAfterUpdate.color} and ` +
      `Number: ${dataFromPdaAfterUpdate.number.toNumber()} and ` + 
      `Authority: ${dataFromPdaAfterUpdate.authority}`
    );

    expect(dataFromPdaAfterUpdate.color).toEqual(favoriteColorUpdate);
    expect(dataFromPdaAfterUpdate.number.toNumber()).toEqual(favoriteNumberUpdate.toNumber());

    console.log(`UpdatesFavoritesV2 :: Passed`);
  });

//   it("Updates FavoritesV2 (via Authority) in the blockchain", async () => {
//     const user = web3.Keypair.generate();
//     const authority = web3.Keypair.generate();
//     const newAuthority = web3.Keypair.generate();
//     const program = anchor.workspace.Favorites as Program<Favorites>;

//     console.log(`UpdatesFavoritesV2 (via Authority) (prepare stage) :: User public key: ${user.publicKey}`);

//     const favoriteNumber = new anchor.BN(5);
//     const favoriteColor = "blue";
//     const favoriteAuthority = authority.publicKey;

//     await airdropSolToAccount({user: user.publicKey});
//     await airdropSolToAccount({user: authority.publicKey});
     
//     let tx_create = await createFavoritesV2({
//       program,
//       user,
//       authority: favoriteAuthority,
//       number: favoriteNumber,
//       color: favoriteColor,
//     });
//     console.log(`UpdatesFavoritesV2 (via Authority) (create stage) :: Tx signature: ${tx_create}`);

//     const [favoritesPda, _bump] = web3.PublicKey.findProgramAddressSync(
//       [Buffer.from("favorites_v2"), user.publicKey.toBuffer()],
//       program.programId
//     );
//     const dataFromPdaAfterCreate = await program.account.favoritesV2.fetch(favoritesPda);
//     console.log(
//       `UpdatesFavoritesV2 (via Authority) (create stage) :: Saved FavoritesV2 with ` +
//       `Color: ${dataFromPdaAfterCreate.color} and ` +
//       `Number: ${dataFromPdaAfterCreate.number.toNumber()} and ` + 
//       `Authority: ${dataFromPdaAfterCreate.authority}`
//     ); 

//     expect(dataFromPdaAfterCreate.color).toEqual(favoriteColor);
//     expect(dataFromPdaAfterCreate.number.toNumber()).toEqual(favoriteNumber.toNumber());
//     expect(dataFromPdaAfterCreate.authority).toEqual(favoriteAuthority);

//     // Update stage
//     const favoriteNumberUpdate = new anchor.BN(12);
//     const favoriteColorUpdate = "green";
//     const favoriteAuthorityUpdate = newAuthority.publicKey;

//     expect(dataFromPdaAfterCreate.color).not.toEqual(favoriteColorUpdate);
//     expect(dataFromPdaAfterCreate.number.toNumber()).not.toEqual(favoriteNumberUpdate.toNumber());
//     expect(dataFromPdaAfterCreate.authority).not.toEqual(favoriteAuthorityUpdate);

//     let tx_update = await updateFavoritesV2({
//       program,
//       user: user,
//       signers: [authority],
//       authority: favoriteAuthorityUpdate,
//       number: favoriteNumberUpdate,
//       color: favoriteColorUpdate,
//     });
//     console.log(`UpdatesFavoritesV2 (via Authority) (update stage) :: Tx signature: ${tx_update}`);

//     const dataFromPdaAfterUpdate = await program.account.favoritesV2.fetch(favoritesPda);
//     console.log(
//       `UpdatesFavoritesV2 (via Authority) (update stage) :: Update FavoritesV2 with `+ 
//       `Color: ${dataFromPdaAfterUpdate.color} and ` +
//       `Number: ${dataFromPdaAfterUpdate.number.toNumber()} and ` + 
//       `Authority: ${dataFromPdaAfterUpdate.authority}`
//     );

//     expect(dataFromPdaAfterUpdate.color).toEqual(favoriteColorUpdate);
//     expect(dataFromPdaAfterUpdate.number.toNumber()).toEqual(favoriteNumberUpdate.toNumber());
//     expect(dataFromPdaAfterUpdate.authority).toEqual(favoriteAuthorityUpdate);

//     console.log(`UpdatesFavoritesV2 (via Authority) :: Passed`);
//   });
});

export async function airdropSolToAccount({
  user,
}: {
  user: web3.PublicKey;
}): Promise<number> {

  return await airdropIfRequired(
    anchor.getProvider().connection,
    user,
    0.5 * web3.LAMPORTS_PER_SOL,
    1 * web3.LAMPORTS_PER_SOL
  );
}

export async function createFavoritesV2({
  program,
  user,
  authority = null,
  number = new anchor.BN(23),
  color = "red",
}: {
  program: Program<Favorites>;
  user: web3.Keypair;
  authority?: web3.PublicKey | null;
  number?: anchor.BN;
  color?: string;
}): Promise<string> {

  let tx: string | null = null;
  try {
    tx = await program.methods
      .setFavoritesV2(number, color, authority)
      .accounts({
        user: user.publicKey,
      })
      .signers([user])
      .rpc();
  } catch (thrownObject) {
    const rawError = thrownObject as Error;
    console.log(rawError.message);
    console.log(rawError.stack);
    throw new Error(getCustomErrorMessage(systemProgramErrors, rawError.message));
  }

  return tx;
}

export async function updateFavoritesV2Authority({
  program,
  user,
  signers = [user],
  authority = null,
}: {
  program: Program<Favorites>;
  user: web3.Keypair;
  signers?: web3.Keypair[];
  authority?: web3.PublicKey | null;
}): Promise<string> {

  let tx_update: string | null = null;
  try {
    tx_update = await program.methods
    .setFavoritesV2Authority(authority)
      .accounts({
        user: user.publicKey,
      })
      .signers(signers)
      .rpc();
  } catch (thrownObject) {
    const rawError = thrownObject as Error;
    console.log(rawError.message);
    console.log(rawError.stack);
    throw new Error(getCustomErrorMessage(systemProgramErrors, rawError.message));
  }

  return tx_update;
}

export async function updateFavoritesV2({
  program,
  user,
  signers = [user],
  authority = null,
  number = new anchor.BN(23),
  color = "red",
}: {
  program: Program<Favorites>;
  user: web3.Keypair;
  signers?: web3.Keypair[];
  authority?: web3.PublicKey | null;
  number?: anchor.BN;
  color?: string;
}): Promise<string> {

  let tx_update: string | null = null;
  try {
    tx_update = await program.methods
    .updateFavoritesV2(number, color, authority)
      .accounts({
        user: user.publicKey,
      })
      .signers(signers)
      .rpc();
  } catch (thrownObject) {
    const rawError = thrownObject as Error;
    console.log(rawError.message);
    console.log(rawError.stack);
    throw new Error(getCustomErrorMessage(systemProgramErrors, rawError.message));
  }

  return tx_update;
}
