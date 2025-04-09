use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig,
    pubkey::Pubkey,
    signature:: Signer,
    transaction::Transaction,
};
use spl_token::{
    instruction::mint_to,
    ID as TOKEN_PROGRAM_ID,
};
use std::str::FromStr;
use task_2_8::utils::load_keypair_from_env;

fn main() {
    let url = "https://api.devnet.solana.com";
    let connection = RpcClient::new_with_commitment(url.to_string(), CommitmentConfig::confirmed());
    println!("Connected to devnet");

    let payer = load_keypair_from_env();
    println!("Our public key is: {}", payer.pubkey());

    let token_mint_account = Pubkey::from_str("HFS8pNdgUVKe7XfrQ2m4WLgcjz5a1214smwF35brSnmH").unwrap();
    let recipient_associated_token_account = Pubkey::from_str("GRwvWUSRDnrF2WAaeYeUn2znv25gaUXtEjNwECrCbJwj").unwrap();
    let decimals = 2u64;
    let amount_major_units = 50u64;
    let amount = amount_major_units * 10u64.pow(decimals as u32);

    let mint_ix = mint_to(
        &TOKEN_PROGRAM_ID,
        &token_mint_account,
        &recipient_associated_token_account,
        &payer.pubkey(), 
        &[], 
        amount,
    ).unwrap();

    let recent_blockhash = connection.get_latest_blockhash().unwrap();
    let mint_tx = Transaction::new_signed_with_payer(
        &[mint_ix],
        Some(&payer.pubkey()),
        &[&payer],
        recent_blockhash,
    );
    let signature  = connection.send_and_confirm_transaction(&mint_tx).unwrap();

    println!("Signature: {}", &signature);
    println!("Mint transaction: https://explorer.solana.com/tx/{}?cluster=devnet", &signature);
    println!("✅ Token mint: Success!");
}
