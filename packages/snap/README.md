# COTI AES Key Manager Snap

A MetaMask Snap for managing AES keys and confidential tokens on the COTI network.

## Features

- 🔐 **AES Key Management**: Securely store and manage AES keys in MetaMask
- 🪙 **Confidential Tokens**: View and manage confidential ERC-20 tokens
- 🖼️ **NFT Support**: Handle confidential NFTs with metadata
- 🔄 **Token Operations**: Transfer and deposit tokens
- 🛡️ **Secure Storage**: Encrypted storage within MetaMask's secure environment
- 🔗 **COTI Network**: Native support for COTI's confidential blockchain

## Installation

### For Users

1. **Install MetaMask** if you haven't already
2. **Visit the companion dapp**: [https://metamask.coti.io](https://snap.coti.io)
3. **Connect your wallet** and follow the installation prompts
4. **Generate your AES key** to start managing confidential tokens

### For Developers

```bash
# Clone the repository
git clone https://github.com/coti-io/coti-snap.git
cd coti-snap

# Install dependencies
yarn install

# Build the snap
yarn workspace @coti-io/coti-snap build

# Run tests
yarn workspace @coti-io/coti-snap test

# Start development server
yarn workspace @coti-io/coti-snap start
```

## Usage

### AES Key Management

```typescript
// Check if user has AES key
const hasKey = await invokeSnap({ method: 'has-aes-key' });

// Get AES key (requires user confirmation)
const aesKey = await invokeSnap({ method: 'get-aes-key' });

// Set AES key
await invokeSnap({
  method: 'set-aes-key',
  params: { newUserAesKey: 'your-aes-key' }
});

// Delete AES key
await invokeSnap({ method: 'delete-aes-key' });
```

### Encryption/Decryption

```typescript
// Encrypt data
const encrypted = await invokeSnap({
  method: 'encrypt',
  params: { value: 'data-to-encrypt' }
});

// Decrypt data
const decrypted = await invokeSnap({
  method: 'decrypt',
  params: { value: encryptedData }
});
```

## API Reference

### RPC Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `has-aes-key` | Check if AES key exists | None |
| `get-aes-key` | Retrieve AES key | None |
| `set-aes-key` | Store AES key | `{ newUserAesKey: string }` |
| `delete-aes-key` | Remove AES key | None |
| `encrypt` | Encrypt data | `{ value: string }` |
| `decrypt` | Decrypt data | `{ value: string }` |
| `connect-to-wallet` | Connect to MetaMask | None |
| `get-permissions` | Get wallet permissions | None |

### Permissions

The snap requires the following permissions:

- `snap_dialog`: For user confirmations
- `snap_manageState`: For secure state storage
- `endowment:ethereum-provider`: For blockchain interactions
- `endowment:network-access`: For API calls
- `endowment:rpc`: For dapp communication

## Security

- **AES keys are stored securely** in MetaMask's encrypted storage
- **All operations require user confirmation** through MetaMask dialogs
- **State is isolated** per chain and address
- **No sensitive data is logged** or exposed

## Development

### Project Structure

```
packages/snap/
├── src/
│   ├── components/     # Snap UI components
│   ├── config/        # Configuration files
│   ├── utils/         # Utility functions
│   ├── test/          # Test files
│   └── index.tsx      # Main snap entry point
├── images/            # Snap icons
├── snap.manifest.json # Snap manifest
└── package.json       # Package configuration
```

### Building

```bash
# Development build with watch mode
yarn workspace @coti-io/coti-snap start

# Production build
yarn workspace @coti-io/coti-snap build

# Clean build
yarn workspace @coti-io/coti-snap build:clean
```

### Testing

```bash
# Run all tests
yarn workspace @coti-io/coti-snap test

# Run tests in watch mode
yarn workspace @coti-io/coti-snap test --watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see [LICENSE](../../LICENSE) for details.

## Support

- **Documentation**: [https://docs.coti.io](https://docs.coti.io)
- **Discord**: [COTI Community](https://discord.gg/coti)
- **GitHub Issues**: [Report bugs here](https://github.com/coti-io/coti-snap/issues)

## Version History

- **v1.0.0**: Initial production release with AES key management and confidential token support
