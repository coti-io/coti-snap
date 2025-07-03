import styled from 'styled-components';

export const FooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 10px;
  width: auto;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 10px;
  }
`;

export const ContentText = styled.p`
  font-size: 1.4rem;
  line-height: 1.2;
  font-weight: medium;
  margin: 0;
`;

export const ContentTextBold = styled.p`
  font-size: 1.4rem;
  line-height: 1.2;
  font-weight: bold;
  margin: 0;
`;

export const Link = styled.a`
  color: ${(props) => props.theme.colors.text?.default};
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
`;

export const LinkUnderlined = styled.a`
  color: ${(props) => props.theme.colors.text?.default};
  text-decoration: underline;
  font-weight: bold;
  cursor: pointer;
`;
