use std::str::FromStr;
use solana_client::rpc_client::RpcClient;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::native_token::LAMPORTS_PER_SOL;

fn main() {
    let rpc_url = "https://api.devnet.solana.com";
    let client = RpcClient::new(rpc_url.to_string());
    println!("⚡️ Connected to devnet");

    let pubkey_str = "8BQoTWKjXpgBjSdQVxYnJcSQ8dUHhjC7QouGdgs6R2pk";
    let pubkey = Pubkey::from_str(pubkey_str).expect("Invalid public key");
    let balance = client.get_balance(&pubkey).expect("Failed to get balance");
    let balance_sol = balance as f64 / LAMPORTS_PER_SOL as f64;
    println!("💰 The balance for the wallet at address {} is: {}", pubkey, balance_sol);
}
