import React from 'react';
import { MenuDropdown, MenuItem } from '../styles';
import { PlusIcon, RefreshIcon } from '../../../assets/icons';

interface MenuOptionsProps {
  onImportTokens: () => void;
  onRefreshTokens: () => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  importLabel?: string;
}

export const MenuOptions: React.FC<MenuOptionsProps> = React.memo(({ 
  onImportTokens, 
  onRefreshTokens, 
  dropdownRef, 
  importLabel = 'Import tokens' 
}) => (
  <MenuDropdown ref={dropdownRef}>
    <MenuItem onClick={onImportTokens} type="button">
      <PlusIcon /> {importLabel}
    </MenuItem>
    <MenuItem onClick={onRefreshTokens} type="button">
      <RefreshIcon /> Refresh list
    </MenuItem>
  </MenuDropdown>
));

MenuOptions.displayName = 'MenuOptions';