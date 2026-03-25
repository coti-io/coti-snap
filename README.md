[![image](https://img.shields.io/badge/Visit-COTI%20Website-green?style=for-the-badge&logo=internet-explorer)](https://coti.io/)
[![image](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://telegram.coti.io)
[![image](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.coti.io)
[![image](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://twitter.coti.io)
[![image](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.coti.io)

# COTI Snap

[![MetaMask Snap](https://img.shields.io/badge/MetaMask-Snap-orange?style=for-the-badge&logo=metamask&logoColor=white)](https://snaps.metamask.io/)
[![Install (Mainnet)](https://img.shields.io/badge/Install%20Snap-Mainnet-orange?style=for-the-badge&logo=metamask&logoColor=white)](https://metamask.coti.io/wallet)
[![Install (Dev/Testnet)](https://img.shields.io/badge/Install%20Snap-Dev%2FTestnet-orange?style=for-the-badge&logo=metamask&logoColor=white)](https://dev.metamask.coti.io)
[![Integration Guide](https://img.shields.io/badge/Docs-Integration%20Guide-1f6feb?style=for-the-badge&logo=gitbook&logoColor=white)](https://docs.coti.io/coti-documentation/build-on-coti/tools/coti-metamask-snap)

The COTI Snap allows users to onboard their COTI account, add and view balances for encrypted private tokens on the COTI network, and interact with COTI dapps.

## Major features

- **AES key management**: Generate, store, retrieve, and delete the user AES key in MetaMask’s secure storage.
- **Confidential tokens**: View and manage confidential ERC-20 token balances.
- **Confidential NFTs**: Display confidential NFTs (including safe fallbacks when metadata is missing).
- **Private transfers**: Sign and submit private transfers directly from the Snap (MetaMask no longer exposes `eth_sign`).
- **dApp integration**: Simple RPC interface for apps to check permissions, connect, encrypt/decrypt, and manage keys.

## Screenshots

> [!NOTE]
> The screenshots below should reflect the latest UI on `https://dev.metamask.coti.io`.

- **Companion dApp (Install / Connect)**

  ![Companion dApp (Install / Connect)](docs/screenshots/01-install.png)

- **Onboarding**

  ![Onboarding](docs/screenshots/02-onboard.png)

- **AES key setup**
  
  ![AES key setup](docs/screenshots/03-aes-key.png)

- **Token list / balances**
  
  ![Token list / balances](docs/screenshots/04-tokens.png)

- **Transfer flow**
  
  ![Transfer flow](docs/screenshots/05-transfer.png)

- **NFT view**
  
  ![NFT view](docs/screenshots/06-nft.png)

## Usage

Visit [docs.coti.io/coti-documentation/build-on-coti/tools/coti-metamask-snap](https://docs.coti.io/coti-documentation/build-on-coti/tools/coti-metamask-snap) for usage details.

## Development

### Metamask Flask

To interact with COTI Snap, you will need to install [MetaMask Flask](https://metamask.io/flask/), a canary distribution for developers that provides access to upcoming features.

> [!IMPORTANT]  
> You cannot have other versions of MetaMask installed

### Private 256-bit Transfers (MetaMask)

MetaMask no longer exposes `eth_sign`, so private 256-bit transfers are signed inside the COTI Snap. The first private transfer will prompt for key access (BIP-44 entropy) so the Snap can produce a raw 32-byte signature.

Steps:
1. Install/enable the COTI Snap.
2. Approve the key access prompt when asked.
3. Retry the transfer.

## 📋 Quick Setup

### For Development (Testnet)

```bash
# In packages/site/.env.local
VITE_NODE_ENV=local
VITE_SNAP_ENV=local
VITE_SNAP_VERSION=*
```

### For Production (Mainnet)

```bash
# In packages/site/.env.local
VITE_NODE_ENV=production
VITE_SNAP_ENV=production
VITE_SNAP_VERSION=latest
```

### Running

1. Clone the COTI-snap repository and set up the development environment:

   ```shell
   yarn install
   yarn start
   ```

   This will start the companion dapp on http://localhost:8000

2. To install the COTI snap and onboard your account, follow the prompts on the companion dapp GUI.

### Companion dApp URLs

- **Production**: `https://metamask.coti.io/wallet`
- **Testnet / dev**: `https://dev.metamask.coti.io`

### dApp Integration Guide

See [docs.coti.io/coti-documentation/build-on-coti/tools/coti-metamask-snap](https://docs.coti.io/coti-documentation/build-on-coti/tools/coti-metamask-snap) for a detailed integration guide.

### Testing and Linting

Run `yarn test` to run the tests once.

Run `yarn lint` to run the linter, or run `yarn lint:fix` to run the linter and

fix any automatically fixable issues.

## Support

Contact us on the [#developers](https://discord.com/channels/386571547508473876/1008682215619698708) channel in Discord for questions/support.
