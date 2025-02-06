import { LINK_PRIVACY_POLICY, LINK_TERMS_OF_USE } from '../../config/links';
import { ContentText, FooterContainer, Link, LinkUnderlined } from './styles';

export const Footer = () => {
  return (
    <FooterContainer>
      <ContentText>
        Powered by <Link>MetaMask Snaps</Link>
      </ContentText>
      <ContentText>
        © 2025 COTI{' '}
        <LinkUnderlined target="_blank" href={LINK_TERMS_OF_USE}>
          Terms of Use
        </LinkUnderlined>{' '}
        <LinkUnderlined target="_blank" href={LINK_PRIVACY_POLICY}>
          Privacy Policy
        </LinkUnderlined>
      </ContentText>
    </FooterContainer>
  );
};
