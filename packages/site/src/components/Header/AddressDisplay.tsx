import { memo } from 'react';
import styled from 'styled-components';

import { truncateString } from '../../utils';
import { JazziconComponent } from '../common/JazziconComponent';

const AddressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

interface AddressDisplayProps {
  readonly address: string;
  readonly iconSize?: number;
  readonly truncate?: boolean;
}

export const AddressDisplay = memo<AddressDisplayProps>(({
  address,
  iconSize = 28,
  truncate = true
}) => {
  const displayAddress = truncate && address ? truncateString(address) : address || 'no address';

  return (
    <AddressContainer>
      <JazziconComponent address={address || ''} type="from" size={iconSize} />
      <AddressText>{displayAddress}</AddressText>
      
    </AddressContainer>
  );
});

AddressDisplay.displayName = 'AddressDisplay';
