# Release notes: `v1.0.10-352de1` → `v1.0.46-0a9f13`

**Snap / dApp versions in this range:** approximately **1.0.11** through **1.0.46** (see individual tag bumps in git).

---

## Major changes

### Confidential tokens & 256-bit support

- **256-bit confidential ERC-20** (`ctUint256`): detection via `supportsInterface`, ABI updates, balance decryption (including positional `Result` access and normalization), and **private transfer** wired with `buildItUint256` / MPC-friendly signing.
- **Sync & compatibility**: Tokens aligned between 64- and 256-bit variants; snap balance recalculation hardened for chain/state and AES key handling.
- **Gas for private transfers**: **Gas estimation first**, with **buffer and fallback** when estimation is unreliable (addresses out-of-gas on long precompile chains).

### Transfers & send UX

- **Private ERC-20 transfer** from the site; **ERC-20 transfer** fixes and UI work (Send screen: focus, loading, self-transfer block, revert decoding).
- **Success / transaction UI**: Redesigned success flow; cancel disabled while sending; fee / gas UX improvements.

### Security & privacy (Snap)

- **`debug-state` removed** from `onRpcRequest` — no longer exposes full managed state (and thus sensitive material) to connected sites.
- **`build-it-uint256`**: **User confirmation** (`snap_dialog`) before using the AES-derived signing path for confidential amount proofs.
- **Site**: Restrictive **security headers** (CSP adjusted where needed for MetaMask Snap iframe/worker); **source maps** enabled and **minification disabled** in Vite for clearer debugging (open-source friendly).

### Multi-network & onboarding

- **Testnet + mainnet**: Independent storage, **AES key scoped per network**, network switching in the dApp, unified onboarding across environments.
- **Balances**: Sync between networks; fixes for wrong chain, stuck loading, and snap/site consistency.

### NFTs

- **Sync tokens and NFTs**; import and details; **private ERC-721** image/metadata (including **IPFS / CID JSON URI** handling and preview fixes).

### Tooling & dependencies

- **ESLint** config bump (e.g. `@metamask/eslint-config` 13.x), lint rule relaxations and fixes.
- **Dependencies**: e.g. `node-forge`, `fast-xml-parser`, **COTI SDK TypeScript** updates, yarn lock refresh.
- **CI / workflows**: Snap test workflows, shasum/manifest updates, deploy-testnet script.

### Branding & docs

- **COTI logo** updates (site/header/footer); companion dApp links in docs/config; favicon and footer/version display.

---

## Other notable improvements (grouped)

| Area | Highlights |
|------|------------|
| **UI / responsive** | Network control in menu, dropdown alignment, loading states, jazzicon/address truncation, z-index and layout fixes |
| **Snap** | Dynamic permissions fix; snagger-related fixes; logging cleanup; manifest/shasum maintenance |
| **Tokens / import** | Duplicate token/NFT messages; per-account imported token/NFT storage; symbol per token in snap |
| **Wallet / MetaMask** | Non-MetaMask detection; snap version pinning; same-origin snap index fix |
| **Mobile** | Explicit “not supported on mobile” messaging where applicable |
| **Testing** | Snap unit testing workflow; JsonRpcProvider-related test fixes |

---

## Upgrade notes

- **Snap**: Rebuild and reinstall so manifest/shasum match published artifacts; users may see **new confirmation** dialogs for confidential amount building (`build-it-uint256`).
- **Sites using the Snap**: Remove any reliance on removed RPC **`debug-state`**.
- **Private ERC-20**: Ensure clients use updated ABIs and flows for **64- vs 256-bit** contracts as applicable.

---

*Generated from git history: `v1.0.10-352de1..v1.0.46-0a9f13`.*
