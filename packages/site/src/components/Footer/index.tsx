import styled from 'styled-components';

const FooterContainer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px 16px;
  gap: 8px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text?.default};
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text?.muted};
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.text?.muted};
  text-decoration: underline;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text?.default};
  }
`;

export function Footer() {
  return (
    <FooterContainer>
      <Title>Powered by Metamask Snaps</Title>
      <Description>
        © 2025 COTI{' '}
        <Link href="https://coti.io/terms" target="_blank" rel="noopener noreferrer">
          Terms of Use
        </Link>{' '}
        <Link href="https://coti.io/privacy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </Link>
      </Description>
    </FooterContainer>
  );
}