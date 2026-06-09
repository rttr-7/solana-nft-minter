import { Buffer } from "buffer";
window.Buffer = Buffer;
globalThis.Buffer = Buffer;

import { Connection, clusterApiUrl, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const connectButton = document.getElementById("connectButton");
const requestSolButton = document.getElementById("requestSolButton");
const mintButton = document.getElementById("mintButton");
const status = document.getElementById("status");
const walletAddress = document.getElementById("walletAddress");

let provider = null;
let walletPublicKey = null;

function log(message) {
  status.textContent += `${message}\n`;
}

function setLoading(isLoading) {
  mintButton.disabled = isLoading || !walletPublicKey;
  connectButton.disabled = isLoading;
}

function getProvider() {
  if (window.solana && window.solana.isPhantom) {
    return window.solana;
  }
  return null;
}

async function connectWallet() {
  provider = getProvider();
  if (!provider) {
    alert("Please install Phantom wallet to use this example.");
    return;
  }

  const resp = await provider.connect();
  walletPublicKey = resp.publicKey;
  walletAddress.textContent = `Connected wallet: ${walletPublicKey.toString()}`;
  mintButton.disabled = false;
  requestSolButton.disabled = false;
}

async function requestSol() {
  if (!walletPublicKey) {
    alert("Connect wallet first.");
    return;
  }

  requestSolButton.disabled = true;
  log("Requesting 1 SOL from faucet...");

  try {
    const airdropSignature = await connection.requestAirdrop(walletPublicKey, 1e9); // 1 SOL
    log("Airdrop sent, waiting for confirmation...");
    await connection.confirmTransaction(airdropSignature, "confirmed");
    log("✅ You received 1 SOL! You can now mint your NFT.");
  } catch (error) {
    log(`⚠️ Faucet request failed: ${error.message || error}`);
    log(`\n📌 Try these alternative faucets (copy your address first):`);
    log(`\n1️⃣ Official Solana Faucet:`);
    log(`   https://faucet.solana.com/`);
    log(`\n2️⃣ QuickNode Faucet:`);
    log(`   https://faucet.quicknode.com/solana/devnet`);
    log(`\n3️⃣ Alchemy Faucet:`);
    log(`   https://www.alchemy.com/faucets/solana-devnet`);
    log(`\n📋 Your wallet address:`);
    log(`${walletPublicKey.toString()}`);
    log(`\nOnce you get SOL, come back and click "Mint NFT"`);
    console.error(error);
  } finally {
    requestSolButton.disabled = false;
  }
}

async function mintNft() {
  if (!provider || !walletPublicKey) {
    alert("Connect wallet first.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const symbol = document.getElementById("symbol").value.trim();
  const uri = document.getElementById("uri").value.trim();

  if (!name || !symbol || !uri) {
    alert("Fill in name, symbol, and URI first.");
    return;
  }

  setLoading(true);
  status.textContent = "Starting mint flow...\n";

  try {
    log("Creating mint keypair...");
    const mintKeypair = Keypair.generate();
    const mintPublicKey = mintKeypair.publicKey;

    log("Getting associated token account...");
    const associatedTokenAccount = await getAssociatedTokenAddress(mintPublicKey, walletPublicKey);

    log("Getting rent exemption amount...");
    const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

    log("Building transaction...");
    const transaction = new Transaction().add(
      // Create the mint account
      SystemProgram.createAccount({
        fromPubkey: walletPublicKey,
        newAccountPubkey: mintPublicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      // Initialize the mint (0 decimals = NFT)
      createInitializeMintInstruction(
        mintPublicKey,
        0,
        walletPublicKey,
        walletPublicKey,
        TOKEN_PROGRAM_ID
      ),
      // Create associated token account
      createAssociatedTokenAccountInstruction(
        walletPublicKey,
        associatedTokenAccount,
        walletPublicKey,
        mintPublicKey
      ),
      // Mint 1 token (the NFT)
      createMintToInstruction(
        mintPublicKey,
        associatedTokenAccount,
        walletPublicKey,
        1,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    transaction.feePayer = walletPublicKey;
    log("Getting latest blockhash...");
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(mintKeypair);

    log("Requesting signature from Phantom...");
    const signedTransaction = await provider.signTransaction(transaction);
    
    log("Sending transaction...");
    const txid = await connection.sendRawTransaction(signedTransaction.serialize());

    log(`Transaction sent: ${txid}`);
    log("Waiting for confirmation...");
    await connection.confirmTransaction(txid, "confirmed");
    
    log("\n✅ NFT minted successfully!");
    log(`Mint address: ${mintPublicKey.toString()}`);
    log(`Token account: ${associatedTokenAccount.toString()}`);
    log(`\nView on Explorer:`);
    log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
  } catch (error) {
    log(`❌ Error: ${error.message || error}`);
    console.error(error);
  } finally {
    setLoading(false);
  }
}

connectButton.addEventListener("click", connectWallet);
requestSolButton.addEventListener("click", requestSol);
mintButton.addEventListener("click", mintNft);
