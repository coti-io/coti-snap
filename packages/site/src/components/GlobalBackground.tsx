import styled from 'styled-components';
import backgroundImage from '../assets/images/bg.png';

const BackgroundWrapper = styled.div`
  background-color: #1E29F6;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  
  ${({ theme }) => theme.mediaQueries.small} {
    background-attachment: scroll;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
`;

export const GlobalBackground = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <BackgroundWrapper />
            <ContentWrapper>{children}</ContentWrapper>
        </>
    );
};
