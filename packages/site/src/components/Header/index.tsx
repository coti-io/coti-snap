import styled from 'styled-components';

import { getThemePreference } from '../../utils';
import { Toggle } from '../Generals/Toggle';
import { HeaderButtons } from './Buttons';

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  width: 100%;
  background-color: ${(props) => props.theme.colors.background?.content};
  box-shadow: ${({ theme }) => theme.shadows.default};
  border-radius: ${({ theme }) => theme.radii.default};
`;

const Title = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
  margin-left: 1.2rem;
  ${({ theme }) => theme.mediaQueries.small} {
    display: none;
  }
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const Header = ({
  handleToggleClick,
}: {
  handleToggleClick?: () => void;
}) => {
  return (
    <HeaderWrapper>
      <Title>COTI</Title>
      <RightContainer>
        {handleToggleClick && (
          <Toggle
            onToggle={handleToggleClick}
            defaultChecked={getThemePreference()}
          />
        )}
        <HeaderButtons />
      </RightContainer>
    </HeaderWrapper>
  );
};
