# StickyPay Anchor Program

This is the Solana smart contract for StickyPay, a payment platform that enables businesses to accept payments in various SPL tokens.

## Features

- Merchant account initialization
- Payment session creation
- Payment processing with fee handling
- Payment cancellation
- Transaction verification

## Prerequisites

- Solana CLI
- Anchor Framework
- Rust
- Node.js and npm/yarn

## Installation

1. Install dependencies:

\`\`\`bash
yarn install
\`\`\`

2. Build the program:

\`\`\`bash
anchor build
\`\`\`

3. Get the program ID:

\`\`\`bash
solana address -k target/deploy/stickypay-keypair.json
\`\`\`

4. Update the program ID in `lib.rs` and `Anchor.toml`.

## Deployment

### Local Development

1. Start a local Solana validator:

\`\`\`bash
solana-test-validator
\`\`\`

2. Deploy the program:

\`\`\`bash
anchor deploy
\`\`\`

### Testnet/Devnet Deployment

1. Configure Solana CLI to use testnet:

\`\`\`bash
solana config set --url https://api.testnet.solana.com
\`\`\`

2. Create a keypair for deployment (if you don't have one):

\`\`\`bash
solana-keygen new -o ~/.config/solana/id.json
\`\`\`

3. Request airdrop (for testnet/devnet):

\`\`\`bash
solana airdrop 2
\`\`\`

4. Deploy the program:

\`\`\`bash
anchor deploy
\`\`\`

### Mainnet Deployment

1. Configure Solana CLI to use mainnet:

\`\`\`bash
solana config set --url https://api.mainnet-beta.solana.com
\`\`\`

2. Make sure you have enough SOL for deployment.

3. Deploy the program:

\`\`\`bash
anchor deploy
\`\`\`

## Testing

Run the tests:

\`\`\`bash
anchor test
\`\`\`

## Client Integration

To integrate with the StickyPay smart contract, use the provided client library in `lib/anchor-client.ts`.

## License

MIT
