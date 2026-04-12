# Release notes: `v1.0.46-0a9f13` → `v1.0.52-eeccdb`

**Snap / dApp versions in this range:** **1.0.47** through **1.0.52** (per `chore: bump snap version` commits in git).

**Security audit:** The Snap work in this range was reviewed under **Sayfer**’s MetaMask Snap security audit for COTI. The report is available alongside this file: [Sayfer-2026-03-Metamask-Snap-Audit-for-Coti.pdf](Sayfer-2026-03-Metamask-Snap-Audit-for-Coti.pdf).

---

## Major changes

### Snap RPC, confirmations, and validation

The **SAY-** items below align with remediation and follow-up from that **Sayfer** audit (see the [audit PDF](Sayfer-2026-03-Metamask-Snap-Audit-for-Coti.pdf)).

- **SAY-01**: AES key validation and **origin checks** in `onRpcRequest`.
- **SAY-02**: **Confirmation dialogs** for token import and hide actions in `onRpcRequest`.
- **SAY-03**: Confirmation copy updated to **clarify sharing of the raw AES encryption key** in `onRpcRequest`.
- **SAY-04**: **Context validation** in `onRpcRequest` and support for **confidential ERC-20 transfers**.
- **SAY-07**: **ERC-20 address validation** in `onUserInput` updated to use **`ethers.isAddress`**.
- **SAY-08**: **Parsing and validation** for encrypted payloads in `onRpcRequest` (structure and data types).
- **Tests & crypto**: `onRpcRequest` tests extended for AES key confirmation flows; **encryption/decryption logic** refined.

### Networking & URL safety

- **SAY-05**: **URL validation** in image utilities to **block private and local hostnames** (SSRF-style risk reduction).

### Tooling, CI, and dependencies

- **Node.js 20**: set in **GitHub Actions**, **`.nvmrc`**, and **`package.json` / workspace packages** (replacing older Node lines).
- **GitHub Actions**: workflows updated to **current major versions** of core actions and aligned with Node 20.
- **Dependencies**: repeated **`package.json` / `yarn.lock` updates** across the range (transitive and direct bumps).
- **`minimatch`**: explicitly bumped to **3.1.5** and **9.0.9** in `package.json` / `yarn.lock` (dual lines as pulled by tooling).

### Documentation & repository

- Added **release notes** for earlier tag ranges (`v1.0.10`→`v1.0.46` and related).
- Added **Sayfer**’s MetaMask Snap audit report for COTI in this directory: [Sayfer-2026-03-Metamask-Snap-Audit-for-Coti.pdf](Sayfer-2026-03-Metamask-Snap-Audit-for-Coti.pdf).
- **README** updated with **screenshots**; later commit **removed the logo** and streamlined README content.

### Versioning & published artifacts

- Snap version bumps through **1.0.47**, **1.0.48**, **1.0.49**, **1.0.50**, **1.0.51**, and **1.0.52** (with `[skip ci]` bump commits where noted).
- **Snap bundle hash / checksum** updates to match rebuilt bundles.

---

## Notable changes (by area)

| Area | Highlights |
|------|------------|
| **Snap RPC & wallet UI** | Origin/AES checks; confirmations for import/hide and raw key sharing; encrypted payload validation; confidential ERC-20 path; `ethers.isAddress` for ERC-20 input |
| **Security / networking** | Image/metadata URLs blocked for private/local hosts |
| **CI & developer setup** | Node 20 everywhere relevant; Actions refreshed; lockfile-driven dependency updates including `minimatch` pins |
| **Docs & compliance** | Sayfer audit ([PDF](Sayfer-2026-03-Metamask-Snap-Audit-for-Coti.pdf)); README/screenshots; release-note docs for prior tags |

---

## Upgrade notes

- **Node 20**: use Node 20+ locally and in CI to match `.nvmrc` and `engines` expectations.
- **Snap users**: reinstall or update the Snap so the installed bundle matches published **manifest / shasum** (bundle hash commits in this range).
- **dApps**: expect **stricter validation**, **extra confirmations**, and **clearer messaging** around sensitive RPC paths (keys, import/hide, confidential transfers).

---

*Derived from git history: `v1.0.46-0a9f13..v1.0.52-eeccdb` (`git log` between these tags).*
