use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig,
    pubkey::Pubkey,
    signature:: Signer,
    transaction::Transaction,
};
use std::str::FromStr;
use spl_associated_token_account::instruction::create_associated_token_account;
use task_2_8::utils::load_keypair_from_env;

fn main() {
    let url = "https://api.devnet.solana.com";
    let connection = RpcClient::new_with_commitment(url.to_string(), CommitmentConfig::confirmed());
    println!("Connected to devnet");

    let payer = load_keypair_from_env();
    println!("Our public key is: {}", payer.pubkey());

    let token_mint_account = Pubkey::from_str("HFS8pNdgUVKe7XfrQ2m4WLgcjz5a1214smwF35brSnmH").unwrap();
    let recipient = payer.pubkey();

    let associated_token_address = get_associated_token_address(
        &recipient, 
        &token_mint_account
    );
    let create_account_ix = create_associated_token_account(
        &payer.pubkey(), 
        &recipient, 
        &token_mint_account,
        &spl_token::id()
    );
    let mut transaction = Transaction::new_with_payer(
        &[create_account_ix], 
        Some(&payer.pubkey())
    );
    let recent_blockhash = connection.get_latest_blockhash().unwrap();
    transaction.sign(
        &[&payer], 
        recent_blockhash
    );
    let signature = connection.send_and_confirm_transaction(&transaction).unwrap();

    println!("Signature: {}", &signature);
    println!("Transaction: https://explorer.solana.com/tx/{}?cluster=devnet", &signature);
    println!("✅ Created Token account address: {}", &associated_token_address);
}

fn get_associated_token_address(owner: &Pubkey, mint: &Pubkey) -> Pubkey {
    let (address, _) = Pubkey::find_program_address(
        &[
            &owner.to_bytes(),
            &spl_token::id().to_bytes(),
            &mint.to_bytes(),
        ],
        &spl_associated_token_account::id(),
    );

    address
}
