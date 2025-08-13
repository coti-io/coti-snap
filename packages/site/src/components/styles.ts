import styled from 'styled-components';

export const ContentBorderWrapper = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 9px;
  width: auto;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: left;
  padding: 50px;
  overflow-y: auto;
  gap: 30px;
  background-color: ${(props) => props.theme.colors.background?.content};
  border-radius: 24px;
  width: auto;
  ${({ theme }) => theme.mediaQueries.small} {
    flex-direction: column;
    gap: 16px;
    padding: 40px 24px;
  }
`;

export const ContentTitle = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
  color: black !important;
  text-align: center;
`;

export const ContentText = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  font-weight: medium;
  margin: 0;
  color: black !important;
  text-align: center;
`;

export const ContentTextInstall = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  font-weight: medium;
  margin: 0;
  color: black !important;
  text-align: left;
`;

export const HeaderBarCentered = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 0 12px 0;
`;
