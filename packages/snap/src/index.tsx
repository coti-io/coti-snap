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
    symbol: 'TST',
    address: '0x0a4db7035284566f6f676991ed418140dc01a2aa',
  }
]

type tokensType = { name: string, symbol: string, address: string, balance: string | null }[];

// should be stored in a secure storage after onboarding process
const testAESKey = '50764f856be3f636c09faf092be20d0c';

export const recalculateBalances = async () => {
  // TODO: tokens =  get token balances from state
  const state = await snap.request({
    method: "snap_manageState",
    params: { operation: "get" },
  })

  const tokens = state?.tokenBalances ? JSON.parse(state?.tokenBalances as string) as tokensType : [];

  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const balance = await provider.getBalance(signerAddress);

  const tokenBalances = await Promise.all(tokens.map(async (token) => {
    const tokenContract = new Contract(token.address, erc20Abi, signer);
    const tok = (tokenContract.connect(signer) as Contract)
    const tokenBalance = tok.balanceOf ? await tok.balanceOf() : null;
    const decryptedBalance = tokenBalance ? decryptUint(tokenBalance, testAESKey) : null;
    return { ...token, balance: decryptedBalance?.toString() || null };
  }));

  await snap.request({
    method: "snap_manageState",
    params: {
      operation: "update",
      newState: { balance: String(balance), tokenBalances: JSON.stringify(tokenBalances) },
    },
  })

  return { balance, tokenBalances };
}

export const importToken = async (address: string, name: string, symbol: string) => {
  const oldState = await snap.request({
    method: "snap_manageState",
    params: { operation: "get" },
  });

  const tokens = JSON.parse(oldState?.tokenBalances as string) as tokensType;
  tokens.push({ address, name, symbol, balance: null });

  await snap.request({
    method: "snap_manageState",
    params: {
      operation: "update",
      newState: { ...oldState, tokenBalances: JSON.stringify(tokens) },
    },
  })
}

export const Home = ({balance, tokenBalances} :{
  balance: bigint,
  tokenBalances: tokensType
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
  const {balance, tokenBalances} = await recalculateBalances();
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
        const persistedData = await snap.request({
          method: "snap_manageState",
          params: { operation: "get" },
        })
        const stateBalance = BigInt((persistedData?.balance as string) || 0);
        const stateTokenBalances = JSON.parse((persistedData?.tokenBalances as string) || "[]");
        await snap.request({
          method: "snap_updateInterface",
          params: {
            id,
            ui: <Home balance={stateBalance} tokenBalances={stateTokenBalances} />,
          },
        });
        break;
      case 'token-submit':
        // import token
        const state = await snap.request({
          method: "snap_getInterfaceState",
          params: {
            id,
          },
        })

        const formState = state['form-to-fill'] as Record<string, string | boolean | null>;
        if (formState && formState['token-address'] && formState['token-name']) {
          const address = formState['token-address'] as string;
          const name = formState['token-name'] as string;
          const symbol = name.slice(0, 3).toUpperCase();
          await importToken(address, name, symbol);
        } else {
          //add validation
          console.log('Invalid form state:', formState);
        }
        
        const {balance, tokenBalances} = await recalculateBalances();
        await snap.request({
          method: "snap_updateInterface",
          params: {
            id,
            ui: <Home balance={balance} tokenBalances={tokenBalances} />,
          },
        });
        break;
    }
  }
}
