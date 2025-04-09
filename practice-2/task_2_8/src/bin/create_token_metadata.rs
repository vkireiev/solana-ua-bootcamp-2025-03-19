use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig,
    pubkey::Pubkey,
    signature::Signer,
    transaction::Transaction,
};
use mpl_token_metadata;
use std::str::FromStr;
use task_2_8::utils::load_keypair_from_env;

fn main() {
    let url = "https://api.devnet.solana.com";
    let connection = RpcClient::new_with_commitment(url.to_string(), CommitmentConfig::confirmed());
    println!("Connected to devnet");

    let payer = load_keypair_from_env();
    println!("Our public key is: {}", payer.pubkey());

    let token_mint_account = Pubkey::from_str("HFS8pNdgUVKe7XfrQ2m4WLgcjz5a1214smwF35brSnmH").unwrap();
    let metadata_program_id = Pubkey::from_str("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").unwrap();

    let metadata_data = mpl_token_metadata::types::DataV2 {
        name: "Token Solana Bootcamp #3 (Rust)".to_string(),
        symbol: "TSBCr".to_string(),
        uri: "https://devnet.bundlr.network/6FBFQ4oadyXTEipgMbuov4vdDh9SZLuDieEbVaxwmPtU".to_string(),
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,  
        uses: None
    };
    let (metadata_pda, _metadata_bump) = Pubkey::find_program_address(
        &[
            &"metadata".as_bytes(),
            &metadata_program_id.to_bytes(),
            &token_mint_account.to_bytes(),
        ],
        &metadata_program_id,
    );
    let create_metadata_instruction =  mpl_token_metadata::instructions::CreateMetadataAccountV3{
        metadata: metadata_pda,
        mint: token_mint_account,
        mint_authority: payer.pubkey(),
        payer: payer.pubkey(),
        update_authority: (payer.pubkey(), true),
        system_program: solana_sdk::system_program::id(),
        rent: Some(solana_sdk::sysvar::rent::id())
    }.instruction(mpl_token_metadata::instructions::CreateMetadataAccountV3InstructionArgs{
        data: metadata_data,
        is_mutable: true, 
        collection_details: None
    });
    let mut transaction = Transaction::new_with_payer(
        &[create_metadata_instruction],
        Some(&payer.pubkey()),
    );

    let recent_blockhash = connection.get_latest_blockhash().unwrap();
    transaction.sign(
        &[&payer], 
        recent_blockhash
    );
    let signature = connection.send_and_confirm_transaction(&transaction).unwrap();

    println!("Signature: {}", &signature);
    println!("Transaction: https://explorer.solana.com/tx/{}?cluster=devnet", &signature);
    println!("✅ Look at the Token again: https://explorer.solana.com/address/{}?cluster=devnet", &token_mint_account);  
}
