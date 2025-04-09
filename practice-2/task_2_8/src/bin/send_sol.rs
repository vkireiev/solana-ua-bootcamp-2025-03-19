use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig,
    signature::Signer,
    pubkey::Pubkey,
    system_instruction,
    transaction::Transaction,
    instruction::Instruction,
    message::Message,
};
use std::str::FromStr;
use task_2_8::utils::load_keypair_from_env;

fn main() {
    let url = "https://api.devnet.solana.com";
    let connection = RpcClient::new_with_commitment(url.to_string(), CommitmentConfig::confirmed());
    println!("Connected to devnet");

    let sender = load_keypair_from_env();
    let sender_balance_before = connection.get_balance(&sender.pubkey()).unwrap() as f64 / 1_000_000_000.0;
    println!("SENDER:    {} with balance: {}", sender.pubkey(), sender_balance_before);

    let recipient = Pubkey::from_str("AU5V38Utk5BG3uFzCEPqnCeQGfR75YNBmta88AJZY7rZ").unwrap();
    let recipient_balance_before = connection.get_balance(&recipient).unwrap() as f64 / 1_000_000_000.0;
    println!("RECIPIENT: {} with balance: {}", recipient, recipient_balance_before);
    println!();

    let lamports = 5_000_000;
    let transfer_ix = system_instruction::transfer(&sender.pubkey(), &recipient, lamports);

    // Memo
    let memo_program_id = Pubkey::from_str("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr").unwrap();
    let memo_data = "Task 2.8 / send_sol.rs with Memo";
    let memo_ix = Instruction {
        program_id: memo_program_id,
        accounts: vec![solana_sdk::instruction::AccountMeta::new(sender.pubkey(), true)],
        data: memo_data.as_bytes().to_vec(),
    };

    let message = Message::new(&[transfer_ix, memo_ix], Some(&sender.pubkey()));
    let mut tx = Transaction::new_unsigned(message);

    let recent_blockhash = connection.get_latest_blockhash().unwrap();
    tx.sign(&[&sender], recent_blockhash);
    let signature = connection.send_and_confirm_transaction(&tx).unwrap();
    println!("Signature: https://explorer.solana.com/tx/{}?cluster=devnet", signature);
    println!();

    let sender_balance_after = connection.get_balance(&sender.pubkey()).unwrap() as f64 / 1_000_000_000.0;
    let recipient_balance_after = connection.get_balance(&recipient).unwrap() as f64 / 1_000_000_000.0;
    println!("SENDER:    {} with balance: {}", sender.pubkey(), sender_balance_after);
    println!("RECIPIENT: {} with balance: {}", recipient, recipient_balance_after);
}
