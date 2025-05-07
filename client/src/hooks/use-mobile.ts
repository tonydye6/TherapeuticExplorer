import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the viewport is mobile-sized
 * @returns object with isMobile property indicating if the current viewport is mobile-sized
 */
export default function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if viewport width is mobile-sized
    const checkIfMobile = () => {
      const mobileWidth = 768; // Standard md breakpoint
      setIsMobile(window.innerWidth < mobileWidth);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return { isMobile };
}
