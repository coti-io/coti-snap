import { useCallback, useEffect } from 'react';

interface UseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset?: () => void;
}

export const useModal = ({ isOpen, onClose, onReset }: UseModalProps) => {
  const handleClose = useCallback(() => {
    if (onReset) {
      onReset();
    }
    onClose();
  }, [onReset, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  useEffect(() => {
    if (isOpen) {
      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };

      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, handleClose]);

  return {
    handleClose,
    handleBackdropClick,
    handleKeyDown
  };
};