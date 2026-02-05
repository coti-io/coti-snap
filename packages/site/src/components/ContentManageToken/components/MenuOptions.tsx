import React from 'react';
import { MenuDropdown, MenuItem } from '../styles';
import { PlusIcon, RefreshIcon, SyncIcon } from '../../../assets/icons';

interface MenuOptionsProps {
  onImportTokens: () => void;
  onRefreshTokens: () => void;
  onSyncToSnap?: () => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  importLabel?: string;
}

export const MenuOptions: React.FC<MenuOptionsProps> = React.memo(({
  onImportTokens,
  onRefreshTokens,
  onSyncToSnap,
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
    {onSyncToSnap && (
      <MenuItem onClick={onSyncToSnap} type="button">
        <SyncIcon /> Sync to Snap
      </MenuItem>
    )}
  </MenuDropdown>
));

MenuOptions.displayName = 'MenuOptions';