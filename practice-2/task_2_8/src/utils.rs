use std::env;
use serde_json;
use solana_sdk::signature::Keypair;

pub fn load_keypair_from_env() -> Keypair {
    dotenv::dotenv().ok();

    let private_key_string = env::var("SECRET_KEY").expect("Add SECRET_KEY to .env!");
    let bytes: Vec<u8> = serde_json::from_str(&private_key_string).expect("Failed to parse SECRET_KEY as JSON");

    Keypair::from_bytes(&bytes).expect("Failed to create Keypair from bytes")
}
