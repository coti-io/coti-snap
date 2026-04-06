import React from 'react';

import { PlusIcon, RefreshIcon, SyncIcon, EyeIcon, EyeOffIcon } from '../../../assets/icons';
import { MenuDropdown, MenuItem } from '../styles';

type MenuOptionsProps = {
  onImportTokens: () => void;
  onRefreshTokens: () => void;
  onSyncToSnap?: () => void;
  onTogglePublicTokens?: () => void;
  onTogglePrivateTokens?: () => void;
  showPublicTokens?: boolean;
  showPrivateTokens?: boolean;
  dropdownRef: React.RefObject<HTMLDivElement>;
  importLabel?: string;
};

export const MenuOptions: React.FC<MenuOptionsProps> = React.memo(
  ({
    onImportTokens,
    onRefreshTokens,
    onSyncToSnap,
    onTogglePublicTokens,
    onTogglePrivateTokens,
    showPublicTokens = true,
    showPrivateTokens = true,
    dropdownRef,
    importLabel = 'Import tokens',
  }) => (
    <MenuDropdown ref={dropdownRef}>
      <MenuItem onClick={onImportTokens} type="button">
        <PlusIcon /> {importLabel}
      </MenuItem>
      <MenuItem onClick={onRefreshTokens} type="button">
        <RefreshIcon /> Refresh list
      </MenuItem>
      {onTogglePublicTokens && (
        <MenuItem onClick={onTogglePublicTokens} type="button">
          {showPublicTokens ? <EyeOffIcon /> : <EyeIcon />}{' '}
          {showPublicTokens ? 'Hide' : 'Show'} Public
        </MenuItem>
      )}
      {onTogglePrivateTokens && (
        <MenuItem onClick={onTogglePrivateTokens} type="button">
          {showPrivateTokens ? <EyeOffIcon /> : <EyeIcon />}{' '}
          {showPrivateTokens ? 'Hide' : 'Show'} Private
        </MenuItem>
      )}
      {onSyncToSnap && (
        <MenuItem onClick={onSyncToSnap} type="button">
          <SyncIcon /> Sync to Snap
        </MenuItem>
      )}
    </MenuDropdown>
  ),
);

MenuOptions.displayName = 'MenuOptions';
