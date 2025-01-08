import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const Rotate = styled.div`
  display: inline-block;
  animation: ${rotate} 2s linear infinite;
  width: fit-content;
`;

const ContentText = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  font-weight: medium;
  margin: 0;
`;
const ContentTitle = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
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
      <Rotate>
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_573_421)">
            <path
              d="M39.9967 71.1631C31.8634 71.1631 24.0633 67.9322 18.3121 62.1811C12.561 56.43 9.33008 48.6298 9.33008 40.4965C9.33008 32.3631 12.561 24.563 18.3121 18.8119C24.0633 13.0607 31.8634 9.82979 39.9967 9.82979C40.34 9.81739 40.6823 9.8743 41.0031 9.99711C41.3239 10.1199 41.6167 10.3061 41.8639 10.5446C42.1112 10.7831 42.3078 11.0689 42.4422 11.3851C42.5765 11.7013 42.6457 12.0413 42.6457 12.3848C42.6457 12.7283 42.5765 13.0683 42.4422 13.3845C42.3078 13.7006 42.1112 13.9865 41.8639 14.225C41.6167 14.4634 41.3239 14.6497 41.0031 14.7725C40.6823 14.8953 40.34 14.9522 39.9967 14.9398C34.9415 14.9405 29.9999 16.4402 25.7969 19.2493C21.594 22.0584 18.3184 26.0508 16.3844 30.7215C14.4505 35.3922 13.945 40.5315 14.9319 45.4896C15.9187 50.4476 18.3537 55.0016 21.9288 58.5758C25.5039 62.15 30.0586 64.5837 35.0168 65.5693C39.9751 66.5549 45.1143 66.0481 49.7845 64.1129C54.4548 62.1777 58.4463 58.9011 61.2543 54.6974C64.0623 50.4937 65.5607 45.5517 65.5601 40.4965C65.5477 40.1532 65.6046 39.8109 65.7274 39.4901C65.8502 39.1693 66.0364 38.8765 66.2749 38.6293C66.5134 38.382 66.7992 38.1853 67.1154 38.051C67.4316 37.9167 67.7716 37.8475 68.1151 37.8475C68.4586 37.8475 68.7986 37.9167 69.1148 38.051C69.4309 38.1853 69.7168 38.382 69.9553 38.6293C70.1937 38.8765 70.3799 39.1693 70.5028 39.4901C70.6256 39.8109 70.6825 40.1532 70.6701 40.4965C70.6595 48.6277 67.4242 56.4227 61.674 62.1717C55.9237 67.9207 48.128 71.1543 39.9967 71.1631Z"
              fill="#658391"
            />
          </g>
          <defs>
            <clipPath id="clip0_573_421">
              <rect
                width="80"
                height="80"
                fill="white"
                transform="translate(0 0.5)"
              />
            </clipPath>
          </defs>
        </svg>
      </Rotate>
      <ContentText>{actionText}</ContentText>
    </div>
  </>
);
