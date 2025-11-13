# SolFin - Solana File Storage Frontend

A modern Next.js frontend for uploading and managing encrypted file storage on Solana blockchain.

## Features

- 🔐 **Wallet Connection** - Connect with Phantom, Solflare, and other Solana wallets
- 📤 **Upload Public Key Files** - Store public key files (up to 10 KB) with usernames
- 🔒 **Upload Encrypted Data** - Store encrypted data with ephemeral keys, nonces, and ciphertext
- 🔍 **Search & Browse** - Search through usernames, public keys, and encrypted data
- 📊 **View All Data** - Display all usernames with their public key bytes and all encrypted data entries

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Solana wallet (Phantom, Solflare, etc.)
- The Solana program deployed at: `CcoCz8T5pShf5CYHNJHNngWLan2Z6Dz1nbeBWXRyS1VZ`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
solfin/
├── app/
│   ├── layout.tsx          # Root layout with wallet provider
│   ├── page.tsx            # Main landing page
│   └── globals.css         # Global styles
├── components/
│   ├── UploadPubKeyFile.tsx    # Component for uploading pubkey files
│   ├── UploadEncryptedData.tsx # Component for uploading encrypted data
│   ├── UsernameList.tsx        # Component displaying all usernames
│   └── EncryptedDataList.tsx   # Component displaying all encrypted data
├── contexts/
│   └── WalletProvider.tsx  # Solana wallet adapter provider
├── utils/
│   └── program.ts          # Anchor program utilities and PDAs
└── idl/
    └── hello_anchor.json   # Anchor IDL file
```

## Usage

1. **Connect Wallet**: Click the "Select Wallet" button and connect your Solana wallet
2. **Upload Public Key File**: 
   - Enter a username
   - Select a file (max 10 KB)
   - Click "Upload Public Key File"
3. **Upload Encrypted Data**:
   - Fill in all required fields (ephemeral pub, nonce, ciphertext, data type, file ID, user permit)
   - Click "Upload Encrypted Data"
4. **Browse Data**:
   - Use the search bars to filter usernames or encrypted data
   - Click "Refresh" to reload data from the blockchain

## Configuration

The app is currently configured for Solana Devnet. To change networks, edit:
- `contexts/WalletProvider.tsx` - Change `WalletAdapterNetwork.Devnet`
- `utils/program.ts` - Update connection endpoint

## Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **@solana/web3.js** - Solana blockchain interaction
- **@coral-xyz/anchor** - Anchor program client
- **@solana/wallet-adapter** - Wallet connection

## License

MIT
