import { memo } from 'react';
import styled from 'styled-components';

import { truncateString } from '../../utils';
import { JazziconComponent } from '../common/JazziconComponent';
import ArrowDownIcon from '../../assets/icons/arrowDown.svg';
import UpArrowIcon from '../../assets/icons/up-arrow.svg';

const AddressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.2;
  font-weight: 400;
  color: #FFFFFF;
  font-family: ${({ theme }) => theme.fonts.default};
`;

const AddressText = styled.span`
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
  user-select: none;
`;

const ArrowIconWrapper = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 16px;
  height: 16px;

  svg {
    position: absolute;
    width: 16px;
    height: 16px;
    transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  }

  svg:first-child {
    opacity: ${(props) => props.$isOpen ? '0' : '1'};
    transform: ${(props) => props.$isOpen ? 'translateY(3px)' : 'translateY(0)'};
  }

  svg:last-child {
    opacity: ${(props) => props.$isOpen ? '1' : '0'};
    transform: ${(props) => props.$isOpen ? 'translateY(0)' : 'translateY(-3px)'};
  }
`;

interface AddressDisplayProps {
  readonly address: string;
  readonly iconSize?: number;
  readonly truncate?: boolean;
  readonly isOpen?: boolean;
}

export const AddressDisplay = memo<AddressDisplayProps>(({
  address,
  iconSize = 28,
  truncate = true,
  isOpen = false
}) => {
  const displayAddress = truncate && address ? truncateString(address) : address || 'no address';

  return (
    <AddressContainer>
      <JazziconComponent address={address || ''} type="from" size={iconSize} />
      <AddressText>{displayAddress}</AddressText>
      <ArrowIconWrapper $isOpen={isOpen}>
        <ArrowDownIcon />
        <UpArrowIcon />
      </ArrowIconWrapper>
    </AddressContainer>
  );
});

AddressDisplay.displayName = 'AddressDisplay';
