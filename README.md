# Solana NFT Minter

A minimal free project to mint NFTs on Solana using devnet and Phantom wallet.

## What this project does
- Connects to `devnet` so you can test for free
- Lets you connect a Phantom wallet
- Creates a new mint and NFT metadata on Solana
- Uses only free Solana RPC and no paid APIs

## Setup
1. Install Node.js 18+.
2. Open a terminal in `d:\Work\NFT`.
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the local URL shown by Vite.
5. Install Phantom wallet if you do not already have it.
6. Fund your wallet with devnet SOL from the faucet:
   https://solfaucet.com/

## How to use
1. Click **Connect Phantom Wallet**.
2. Enter a name, symbol, and metadata URI.
   - The metadata URI should point to a JSON file with NFT metadata.
   - Example metadata JSON structure:
     ```json
     {
       "name": "My Devnet NFT",
       "symbol": "DEV",
       "description": "A sample NFT minted on Solana devnet.",
       "image": "https://example.com/image.png"
     }
     ```
3. Click **Mint NFT**.
4. After confirmation, open the Solana Explorer devnet link shown in the app.

## Notes
- This example is designed for learning and testing on devnet.
- For a production platform on mainnet, you need real SOL and a proper metadata host like Arweave or IPFS.
- No paid API or subscription is required for devnet.
