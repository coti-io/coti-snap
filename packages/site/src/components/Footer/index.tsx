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
  padding: clamp(12px, 2vh, 24px) 16px;
  gap: clamp(4px, 1vh, 8px);
  height: clamp(96px, 12vh, 120px);
  box-sizing: border-box;
  contain: layout style;
  z-index: 1;

  @media screen and (max-width: 768px), screen and (max-height: 700px) {
    padding: clamp(10px, 2vh, 16px) 12px;
  }
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text?.default};
  line-height: 1.3;
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text?.muted};
  line-height: 1.4;
`;

const VersionInfo = styled.span`
  font-weight: 600;
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.text?.muted};
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text?.default};
  }
`;

/**
 *
 */
export function Footer() {
  return (
    <FooterContainer>
      <Title>
        Powered by MetaMask Snaps. MetaMask® is a trademark of ConsenSys.
      </Title>
      <Description>
        dApp{' '}
        <VersionInfo>
          {process.env.VITE_GIT_COMMIT?.slice(0, 6) || 'dev'}
        </VersionInfo>{' '}
        • Snap{' '}
        <VersionInfo>v{process.env.VITE_SNAP_VERSION || 'unknown'}</VersionInfo>{' '}
        •{' '}
        <Link
          href="https://docs.coti.io/coti-documentation/build-on-coti/tools/coti-metamask-snap"
          target="_blank"
          rel="noopener noreferrer"
        >
          Docs
        </Link>{' '}
        • © 2026 COTI •{' '}
        <Link
          href="https://coti.io/terms"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Use
        </Link>{' '}
        •{' '}
        <Link
          href="https://coti.io/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </Link>{' '}
      </Description>
    </FooterContainer>
  );
}
