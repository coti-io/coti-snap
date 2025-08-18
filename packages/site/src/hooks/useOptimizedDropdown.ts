import { useState, useCallback, useRef, useEffect } from 'react';

interface UseOptimizedDropdownOptions {
  closeOnOutsideClick?: boolean;
  closeDelay?: number;
}

export const useOptimizedDropdown = (options: UseOptimizedDropdownOptions = {}) => {
  const { closeOnOutsideClick = true, closeDelay = 0 } = options;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const open = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (closeDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        timeoutRef.current = null;
      }, closeDelay);
    } else {
      setIsOpen(false);
    }
  }, [closeDelay]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      closeOnOutsideClick &&
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      close();
    }
  }, [closeOnOutsideClick, close]);

  useEffect(() => {
    if (closeOnOutsideClick) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [closeOnOutsideClick, handleClickOutside]);

  return {
    isOpen,
    open,
    close,
    toggle,
    dropdownRef,
    buttonRef,
  };
};