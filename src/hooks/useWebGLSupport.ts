import { useState, useEffect } from 'react';

export function useWebGLSupport(): boolean {
  const [supported, setSupported] = useState<boolean>(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl') ||
        canvas.getContext('webgl2');
      setSupported(Boolean(gl));
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
