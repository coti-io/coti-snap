import styled, { keyframes } from 'styled-components';
import LoaderIcon from '../assets/icons/loader.png';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerImage = styled.img`
  width: 40px;
  height: 40px;
  animation: ${spin} 2s linear infinite;
`;

const ContentText = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  font-weight: 300;
  margin: 0;
  color: #000000 !important;
`;

const ContentTitle = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
  text-align: center;
  color: #000000 !important;
`;

export const Loading = ({
  title,
  actionText,
}: {
  title: string;
  actionText: string;
}) => (
  <>
    <ContentTitle>{title}</ContentTitle>

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
      }}
    >
      <SpinnerImage
        src={LoaderIcon}
        alt="Loading"
      />
      <ContentText>{actionText}</ContentText>
    </div>
  </>
);
