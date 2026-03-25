# Release notes: `v1.0.46-0a9f13` → `v1.0.51-b6785c`

**Snap / dApp versions in this range:** approximately **1.0.47** through **1.0.51** (see version bumps in git).

---

## Major changes

### Security hardening (Snap RPC)

- **Origin & AES key protections**: strengthened `onRpcRequest` safety with **origin checks**, **AES key validation**, and **explicit user confirmations** before sensitive actions (import/hide tokens, raw key sharing, private-amount flows).
- **Encrypted payload parsing**: added parsing + validation for encrypted payloads (structure/type checks) to reduce foot-guns and malformed requests.

### Networking & URL safety

- **URL validation**: hardened image/metadata URL handling to **block private/local hostnames** and reduce SSRF-like risk.

### Tooling / CI / runtime policy

- **Node.js policy**: standardized on **Node 20+** (workflows + `.nvmrc` + package `engines`) to match modern dependency expectations.
- **GitHub Actions**: bumped core actions to current major versions (`checkout`/`setup-node`) and aligned CI to Node 20.

### Dependency security updates

- **Transitive dependency remediation** via Yarn `resolutions` / lock updates to address Dependabot alerts, including:
  - `h3` (SSE injection fix line)
  - `fast-xml-parser` (entity expansion bypass fix line)
  - `glob` (moved to fixed major line)
  - `minimatch` (patched `3.x` + patched `9.x` line where pulled in by tooling)
  - `tar`, `socket.io-parser`, `flatted`, `serialize-javascript` (lock-level upgrades)

---

## Notable changes (by area)

| Area | Highlights |
|------|------------|
| **Snap RPC & confirmations** | Multiple new confirmations for sensitive operations; stricter request validation; safer default behaviors |
| **Security / networking** | URL validation to block private/local endpoints; reduced attack surface from malformed inputs |
| **CI & developer experience** | Node 20+ alignment; workflows updated; dependency resolution stabilized under Yarn workspaces |

---

## Upgrade notes

- **Node 20+ required**: local development and CI are expected to use Node 20+ going forward.
- **Snap users**: reinstall/rebuild so manifest shasum and published bundle match.
- **Dapps integrating**: expect stricter validation and additional confirmation dialogs in the Snap RPC flows.

---

*Generated from git history: `v1.0.46-0a9f13..v1.0.51-b6785c` (see commits between these version bumps for details).*

