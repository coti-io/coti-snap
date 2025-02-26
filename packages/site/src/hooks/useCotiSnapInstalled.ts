import { useState, useEffect } from 'react';

export const useCotiSnapInstalled = () => {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSnapInstalled = async () => {
      try {
        const snaps = await (window as any).ethereum.request({
          method: 'wallet_getSnaps',
        });

        const isMySnapInstalled = Object.keys(snaps).includes('npm:snap');
        setIsInstalled(isMySnapInstalled);
      } catch (error) {
        console.error('Error checking if snap is installed:', error);
        setIsInstalled(false);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    checkSnapInstalled();
  }, []);

  return { isInstalled };
};
