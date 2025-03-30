import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import * as fs from 'fs';

function saveKeyInfo(filePath: string, mnemonic: string, keypair: any) {
    const content = `
Seed phrase: ${mnemonic}
Public key: ${keypair.publicKey.toBase58()}
Secret key: ${Buffer.from(keypair.secretKey).toString("hex")}
SECRET_KEY="[${keypair.secretKey}]"
-----------------------------
`;

    fs.appendFileSync(filePath, content, "utf8");
    console.log("✅ Secret key saved successfully.");
}

var isFind = false;
var mnemonic : any ;
var seed : any;
var derivedSeed : any;
var keypair : any;

while (!isFind) {
    mnemonic = bip39.generateMnemonic();
    seed = bip39.mnemonicToSeedSync(mnemonic);
    derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString("hex")).key;
    keypair = Keypair.fromSecretKey(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
    if (keypair.publicKey.toBase58().toLowerCase().startsWith('vk85ua')) {
        isFind = true;
    } else if (keypair.publicKey.toBase58().toLowerCase().startsWith('vk85') 
        || keypair.publicKey.toBase58().toLowerCase().startsWith('vk')) {
        saveKeyInfo("kv85ua.txt", mnemonic, keypair);
    }
    if (keypair.publicKey.toBase58().toLowerCase().includes('vk85ua') 
        || keypair.publicKey.toBase58().toLowerCase().includes('vk85')) {
        saveKeyInfo("kv85ua.txt", mnemonic, keypair);
    }
}

console.log("Seed phrase: ", mnemonic);
console.log("Public key: ", keypair.publicKey.toBase58());
console.log("Secret key: ", Buffer.from(keypair.secretKey).toString("hex"));

saveKeyInfo("kv85ua.txt", mnemonic, keypair);
