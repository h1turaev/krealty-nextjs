import { useEffect, useState } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

const HighlandLogo = () => {
  const { isDarkMode } = useDarkMode();
  const [logoColor, setLogoColor] = useState('#000000');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkDarkMode = () => {
      // Always check DOM first, as it's the source of truth
      const hasDarkClass =
        document.documentElement.classList.contains('dark-mode') ||
        document.body.classList.contains('dark-mode');
      setLogoColor(hasDarkClass ? '#ffffff' : '#000000');
    };

    // Check immediately
    checkDarkMode();

    // Watch for dark mode class changes on document (real-time)
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Also listen to isDarkMode changes from hook
    const timeoutId = setTimeout(checkDarkMode, 0);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [isDarkMode, mounted]);

  return (
    <svg
      width="200"
      height="40"
      viewBox="0 0 280 60"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transition: 'all 0.3s ease' }}
      className="highland-logo"
    >
      {/* Minimal skyscraper lines */}
      <line
        x1="0"
        y1="50"
        x2="0"
        y2="10"
        stroke={logoColor}
        strokeWidth="3"
        opacity="0.75"
        style={{ transition: 'stroke 0.3s ease' }}
      />
      <line
        x1="10"
        y1="50"
        x2="10"
        y2="0"
        stroke={logoColor}
        strokeWidth="3"
        style={{ transition: 'stroke 0.3s ease' }}
      />
      <line
        x1="20"
        y1="50"
        x2="20"
        y2="18"
        stroke={logoColor}
        strokeWidth="3"
        opacity="0.5"
        style={{ transition: 'stroke 0.3s ease' }}
      />
      <text
        x="40"
        y="32"
        fontFamily="Playfair Display, serif"
        fontSize="24"
        letterSpacing="0.18em"
        fill={logoColor}
        dominantBaseline="middle"
        style={{ transition: 'fill 0.3s ease' }}
      >
        HIGHLAND
      </text>
    </svg>
  );
};

export default HighlandLogo;
