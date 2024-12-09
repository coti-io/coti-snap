import { type OnRpcRequestHandler, type OnHomePageHandler, type OnUserInputHandler, UserInputEventType } from '@metamask/snaps-sdk';
import { Box, Text, Bold, Heading, Address, Divider, Button, Link, Row, Form, Input, Container, Footer } from '@metamask/snaps-sdk/jsx';
import {
  encodeString,
  encryptNumber,
  decrypt,
  decryptUint
} from "@coti-io/coti-sdk-typescript"

import { JsonRpcProvider, Contract, BrowserProvider, formatEther } from 'ethers';
import { getAccountBalance } from '@coti-io/coti-ethers';

const erc20Abi = [
  {
    "inputs": [],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }];


const tokens = [
  {
    name: 'PROTO',
    symbol: 'PRT',
    address: '0x0a4db7035284566f6f676991ed418140dc01a2aa',
  },
  {
    name: 'TEST',
    symbol: 'PRT',
    address: '0x0a4db7035284566f6f676991ed418140dc01a2aa',
  }
]

// should be stored in a secure storage after onboarding process
const testAESKey = '';

export const Home = ({balance, tokenBalances} :{
  balance: bigint,
  tokenBalances: { name: string, balance: bigint | null, symbol: string, address: string }[]
}) => {
  return (
    <Box>
    <Heading>{formatEther(balance)} ETH</Heading>
    <Button name="onboard-button">Onboard Account</Button>
    <Divider />
    <Heading>Tokens</Heading>
    {tokenBalances.map(token => (
      <Row label={token.name}>
        <Text>{String(token.balance) || 'unknown'}</Text>
      </Row>
    ))}
    <Button name="import-token-button">Import Token</Button>
  </Box>
  );
};

export const onHomePage: OnHomePageHandler = async () => {

  // TODO: move this calculation to a helper function and get tokens from state
  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const balance = await provider.getBalance(signerAddress);

  const tokenBalances = await Promise.all(tokens.map(async (token) => {
    const tokenContract = new Contract(token.address, erc20Abi, signer);
    const tok = (tokenContract.connect(signer) as Contract)
    const tokenBalance = tok.balanceOf ? await tok.balanceOf() : null;
    const decryptedBalance = tokenBalance ? decryptUint(tokenBalance, testAESKey) : null;
    return { ...token, balance: decryptedBalance };
  }));

  return { content: <Home balance={balance} tokenBalances={tokenBalances} /> };
};


export const onUserInput: OnUserInputHandler = async ({ id, event }) => {
  if (event.type === UserInputEventType.ButtonClickEvent) {
    switch (event.name) {
      case 'import-token-button':
        await snap.request({
          method: "snap_updateInterface",
          params: {
            id,
            ui: (
              <Container>
                <Form name="form-to-fill">
                  <Box>
                    <Heading>What is the token {id} address?</Heading>
                    <Text>Please enter the token address to be imported</Text>
                  </Box>
                  <Input name="token-address" placeholder="0x123..." />
                  <Box>
                    <Heading>What is the token name?</Heading>
                    <Text>Please enter the token name</Text>
                  </Box>
                  <Input name="token-name" placeholder="Token Name" />
                </Form>
                <Footer>
                  <Button name="token-submit">Submit</Button>
                  <Button name="token-cancel">Cancel</Button>
                </Footer>
              </Container>
            )
          },
        });
        break;
      case 'token-cancel':
        // TODO: get balances from state
        await snap.request({
          method: "snap_updateInterface",
          params: {
            id,
            ui: <Home balance={0n} tokenBalances={[]} />,
          },
        });
        break;
      case 'token-submit':
        // TODO: recalculate token balances
        await snap.request({
          method: "snap_updateInterface",
          params: {
            id,
            ui: <Home balance={0n} tokenBalances={[]} />,
          },
        });
        break;
    }
  }
}
