import { useState, useEffect } from 'react';

/**
 * A hook that returns whether the current viewport is mobile-sized
 * @param breakpoint The maximum width in pixels to consider "mobile" (default: 768px)
 * @returns boolean indicating if the viewport is mobile-sized
 */
export default function useMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Initial check
    setIsMobile(window.innerWidth < breakpoint);

    // Set up event listener for resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}
