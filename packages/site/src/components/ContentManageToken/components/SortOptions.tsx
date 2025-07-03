import React from 'react';
import { SortDropdown, SortOption } from '../styles';

export type SortType = 'az' | 'decline';

interface SortOptionsProps {
  sort: SortType;
  onSortChange: (sort: SortType) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export const SortOptions: React.FC<SortOptionsProps> = React.memo(({ 
  sort, 
  onSortChange, 
  dropdownRef 
}) => (
  <SortDropdown ref={dropdownRef}>
    <SortOption
      selected={sort === 'az'}
      onClick={() => onSortChange('az')}
    >
      A-Z
    </SortOption>
    <SortOption
      selected={sort === 'decline'}
      onClick={() => onSortChange('decline')}
    >
      Balance (High to Low)
    </SortOption>
  </SortDropdown>
));

SortOptions.displayName = 'SortOptions';