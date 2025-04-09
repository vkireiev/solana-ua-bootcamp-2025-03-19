use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig,
    program_pack::Pack,
    signature::{ Keypair, Signer },
    transaction::Transaction,
};
use spl_token::state::Mint;
use task_2_8::utils::load_keypair_from_env;

fn main() {
    let url = "https://api.devnet.solana.com";
    let connection = RpcClient::new_with_commitment(url.to_string(), CommitmentConfig::confirmed());
    println!("Connected to devnet");

    let payer = load_keypair_from_env();
    println!("Our public key is: {}", payer.pubkey());

    let rent = connection
        .get_minimum_balance_for_rent_exemption(Mint::LEN)
        .unwrap();
    let mint_account = Keypair::new();

    let create_account_instruction = solana_sdk::system_instruction::create_account(
        &payer.pubkey(),
        &mint_account.pubkey(),
        rent,
        Mint::LEN as u64,
        &spl_token::id(),
    );
    let init_mint_instruction = spl_token::instruction::initialize_mint(
        &spl_token::id(),
        &mint_account.pubkey(),
        &payer.pubkey(), 
        None,            
        2
    ).unwrap();
    let mut transaction: Transaction = Transaction::new_with_payer(
        &[create_account_instruction, init_mint_instruction], 
        Some(&payer.pubkey())
    );

    let recent_blockhash = connection.get_latest_blockhash().unwrap();
    transaction.sign(
        &[&payer, &mint_account], 
        recent_blockhash
    );
    let signature = connection.send_and_confirm_transaction(&transaction).unwrap();

    println!("Transaction: https://explorer.solana.com/tx/{}?cluster=devnet", signature);
    println!("✅ Token Mint: {}", &mint_account.pubkey());
    println!();
}
