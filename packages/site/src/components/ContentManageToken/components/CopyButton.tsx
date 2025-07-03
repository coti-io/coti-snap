import React from 'react';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import CopyIcon from '../../../assets/copy.svg';
import CopySuccessIcon from '../../../assets/copy-success.svg';

interface CopyButtonProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  successDuration?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  children,
  className,
  ariaLabel,
  successDuration = 1200,
  onSuccess,
  onError
}) => {
  const { copied, copyToClipboard } = useCopyToClipboard({
    successDuration,
    onSuccess,
    onError
  });

  const handleCopy = () => {
    copyToClipboard(text);
  };

  return (
    <button
      onClick={handleCopy}
      className={className}
      aria-label={ariaLabel || (copied ? "Copied" : "Copy")}
      type="button"
    >
      {children || (copied ? <CopySuccessIcon /> : <CopyIcon />)}
    </button>
  );
};