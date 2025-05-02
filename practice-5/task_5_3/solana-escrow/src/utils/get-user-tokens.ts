import { Connection, PublicKey } from "@solana/web3.js";

export async function getUserTokens(
  connection: Connection,
  publicKey: PublicKey,
  tokenProgram: PublicKey,
) {
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    publicKey,
    { programId: tokenProgram, }
  );

  return tokenAccounts.value
    .map(({ account }) => {
      const data = account.data.parsed.info;

      return {
        mint: data.mint,
        amount: Number(data.tokenAmount.amount),
        decimals: data.tokenAmount.decimals,
      };
    })
    .filter((t) => t.amount > 0);
}
