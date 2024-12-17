import { Box, Text, Button, Section, Selector, SelectorOption, Card, SnapComponent } from '@metamask/snaps-sdk/jsx';
import { formatEther } from 'ethers';
import { Tokens, TokenViewSelector } from '../types';

type HomeProps = {
  balance: bigint,
  tokenBalances: Tokens,
  tokenView?: TokenViewSelector
}

export const Home = ({ balance, tokenBalances, tokenView }: HomeProps) => {
  const formatedBalance = parseFloat(formatEther(balance)).toFixed(2);
  return (
    <Box alignment='center'>
      <Section>
        <Text alignment='center'>{formatedBalance} COTI</Text>
        <Selector name="selector-tokens-nft" title="Select Token type">
          <SelectorOption value={TokenViewSelector.ERC20}>
            <Card title="Tokens" value="" />
          </SelectorOption>
          <SelectorOption value={TokenViewSelector.NFT}>
            <Card title="NFT" value="" />
          </SelectorOption>
        </Selector>
        <Section>
          {tokenBalances.filter(token => token.type == tokenView).map(token => (
            <Card title={token.name} value={String(token.balance) || 'N/A'} />
          ))}
        </Section>
        <Button name="import-token-button">Import Token</Button>
      </Section>
    </Box>
  );
};