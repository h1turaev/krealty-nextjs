import React, { useEffect, useState } from 'react';
import styles from '../../../scss/pc/homepage/BrandMarquee.module.scss';

interface BrandMarqueeProps {
  speed?: number; // Animation duration in seconds (default: 20s)
  direction?: 'left' | 'right'; // Animation direction (default: 'left')
  itemSize?: 'small' | 'medium' | 'large'; // Logo size (default: 'medium')
  pauseOnHover?: boolean; // Pause animation on hover (default: true)
}

// Premium American Construction Brands with their websites
const CONSTRUCTION_BRANDS = [
  { name: 'Caterpillar', url: 'https://www.caterpillar.com' },
  { name: 'John Deere', url: 'https://www.deere.com' },
  { name: 'Komatsu', url: 'https://www.komatsu.com' },
  { name: 'Volvo CE', url: 'https://www.volvoce.com' },
  { name: 'Case', url: 'https://www.casece.com' },
  { name: 'JCB', url: 'https://www.jcb.com' },
  { name: 'Bobcat', url: 'https://www.bobcat.com' },
  { name: 'Hitachi', url: 'https://www.hitachicm.com' },
  { name: 'Liebherr', url: 'https://www.liebherr.com' },
  { name: 'Terex', url: 'https://www.terex.com' },
  { name: 'Manitou', url: 'https://www.manitou.com' },
  { name: 'New Holland', url: 'https://www.newholland.com' },
  { name: 'Wacker Neuson', url: 'https://www.wackerneuson.com' },
  { name: 'Genie', url: 'https://www.genielift.com' },
  { name: 'Home Depot', url: 'https://www.homedepot.com' },
  { name: "Lowe's", url: 'https://www.lowes.com' },
];

const BrandMarquee: React.FC<BrandMarqueeProps> = ({
  speed = 20,
  direction = 'left',
  itemSize = 'medium',
  pauseOnHover = true,
}) => {
  // Check for reduced motion preference (client-side only)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      // Listen for changes
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return (
    <section className={`${styles.brandMarquee} ${styles[`brandMarquee--${itemSize}`]}`}>
      <div className={styles.brandMarquee__container}>
        {/* Fade masks for smooth edges */}
        <div className={`${styles.brandMarquee__fade} ${styles['brandMarquee__fade--left']}`}></div>
        <div className={`${styles.brandMarquee__fade} ${styles['brandMarquee__fade--right']}`}></div>

        {/* Marquee wrapper */}
        <div
          className={`${styles.brandMarquee__track} ${
            pauseOnHover ? styles['brandMarquee__track--pauseOnHover'] : ''
          } ${prefersReducedMotion ? styles['brandMarquee__track--reducedMotion'] : ''}`}
          style={
            !prefersReducedMotion
              ? ({
                  animation: `marqueeScroll ${speed}s linear infinite`,
                  animationDirection: direction === 'left' ? 'normal' : 'reverse',
                } as React.CSSProperties)
              : undefined
          }
        >
          {/* First set of brands */}
          <div className={styles.brandMarquee__list}>
            {CONSTRUCTION_BRANDS.map((brand, index) => (
              <div key={`brand-1-${index}`} className={styles.brandMarquee__item}>
                <a
                  href={brand.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.brandMarquee__brand}
                >
                  {brand.name}
                </a>
              </div>
            ))}
          </div>

          {/* Duplicate set for seamless loop */}
          <div className={styles.brandMarquee__list} aria-hidden="true">
            {CONSTRUCTION_BRANDS.map((brand, index) => (
              <div key={`brand-2-${index}`} className={styles.brandMarquee__item}>
                <a
                  href={brand.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.brandMarquee__brand}
                >
                  {brand.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandMarquee;
