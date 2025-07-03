import { useState, useCallback } from 'react';

interface UseCopyToClipboardOptions {
  successDuration?: number;
  onSuccess?: (() => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
}

interface UseCopyToClipboardReturn {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
  resetCopied: () => void;
}

export const useCopyToClipboard = (
  options: UseCopyToClipboardOptions = {}
): UseCopyToClipboardReturn => {
  const { successDuration = 1200, onSuccess, onError } = options;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onSuccess?.();
      
      setTimeout(() => setCopied(false), successDuration);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      
      try {
        const clipboardItem = new ClipboardItem({
          'text/plain': new Blob([text], { type: 'text/plain' })
        });
        await navigator.clipboard.write([clipboardItem]);
        setCopied(true);
        onSuccess?.();
        setTimeout(() => setCopied(false), successDuration);
      } catch (fallbackError) {
        console.error('Fallback clipboard method failed:', fallbackError);
        const copyError = fallbackError instanceof Error ? fallbackError : new Error('Failed to copy to clipboard');
        onError?.(copyError);
        
        alert('Failed to copy to clipboard. Please copy manually.');
      }
    }
  }, [successDuration, onSuccess, onError]);

  const resetCopied = useCallback(() => {
    setCopied(false);
  }, []);

  return {
    copied,
    copyToClipboard,
    resetCopied,
  };
};