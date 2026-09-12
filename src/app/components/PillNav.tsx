import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import gsap from 'gsap';
import './PillNav.css';

type PillItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  alwaysSolid?: boolean;
};

type PillNavProps = {
  logo?: string;
  logoAlt?: string;
  items: PillItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  initialLoadAnimation?: boolean;
  showLogo?: boolean;
  onItemClick?: (item: PillItem, event: MouseEvent<HTMLAnchorElement>) => void;
};

export default function PillNav({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  ease = 'power2.easeOut',
  baseColor = '#0d5d3a',
  pillColor = '#ffffff',
  hoveredPillTextColor = '#ffffff',
  pillTextColor = '#0d5d3a',
  initialLoadAnimation = true,
  showLogo = true,
  onItemClick,
}: PillNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLAnchorElement;
        if (pill.dataset.solid === 'true') {
          gsap.set(circle, { scale: 0 });
          return;
        }
        const rect = pill.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const r = ((w * w) / 4 + h * h) / (2 * h);
        const diameter = Math.ceil(2 * r) + 2;
        const delta = Math.ceil(r - Math.sqrt(Math.max(0, r * r - (w * w) / 4))) + 1;
        const originY = diameter - delta;

        circle.style.width = `${diameter}px`;
        circle.style.height = `${diameter}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector('.pill-label');
        const hoverLabel = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }
        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(hoverLabel, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();
    const onResize = () => layout();
    window.addEventListener('resize', onResize);
    if (document.fonts?.ready) document.fonts.ready.then(layout).catch(() => {});

    const menu = mobileMenuRef.current;
    if (menu) gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });

    if (initialLoadAnimation) {
      if (logoRef.current) {
        gsap.set(logoRef.current, { scale: 0 });
        gsap.to(logoRef.current, { scale: 1, duration: 0.6, ease });
      }
      if (navItemsRef.current) {
        gsap.set(navItemsRef.current, { width: 0, overflow: 'hidden' });
        gsap.to(navItemsRef.current, { width: 'auto', duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [ease, initialLoadAnimation, items]);

  const handleEnter = (index: number) => {
    if (items[index]?.alwaysSolid) return;
    const tl = tlRefs.current[index];
    if (!tl) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLeave = (index: number) => {
    if (items[index]?.alwaysSolid) return;
    const tl = tlRefs.current[index];
    if (!tl) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLogoEnter = () => {
    if (!logoImgRef.current) return;
    logoTweenRef.current?.kill();
    gsap.set(logoImgRef.current, { rotate: 0 });
    logoTweenRef.current = gsap.to(logoImgRef.current, {
      rotate: 360,
      duration: 0.25,
      ease,
      overwrite: 'auto',
    });
  };

  const toggleMobileMenu = () => {
    const nextState = !isMobileMenuOpen;
    setIsMobileMenuOpen(nextState);

    const lines = hamburgerRef.current?.querySelectorAll('.hamburger-line');
    if (lines) {
      if (nextState) {
        gsap.to(lines[0], { rotation: 45, y: 7, duration: 0.3, ease });
        gsap.to(lines[1], { opacity: 0, x: -8, duration: 0.2, ease });
        gsap.to(lines[2], { rotation: -45, y: -7, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { opacity: 1, x: 0, duration: 0.3, ease });
        gsap.to(lines[2], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (!mobileMenuRef.current) return;
    if (nextState) {
      gsap.set(mobileMenuRef.current, { visibility: 'visible' });
      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease, transformOrigin: 'top center' }
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.2,
        ease,
        onComplete: () => gsap.set(mobileMenuRef.current, { visibility: 'hidden' }),
      });
    }
  };

  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': pillTextColor,
  } as CSSProperties;

  return (
    <div className="pill-nav-container">
      <nav className={`pill-nav ${className}`.trim()} aria-label="Primary" style={cssVars}>
        {showLogo && logo ? (
          <a
            className="pill-logo"
            href="#"
            aria-label="ZenMind home"
            onMouseEnter={handleLogoEnter}
            ref={logoRef}
          >
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
          </a>
        ) : null}

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, index) => (
              <li key={item.href || `item-${index}`} role="none">
                <a
                  role="menuitem"
                  href={item.href}
                  className={`pill${item.alwaysSolid ? ' pill--solid' : ''}${activeHref === item.href ? ' is-active' : ''}`}
                  data-solid={item.alwaysSolid ? 'true' : 'false'}
                  aria-label={item.ariaLabel || item.label}
                  onMouseEnter={() => handleEnter(index)}
                  onMouseLeave={() => handleLeave(index)}
                  onClick={(event) => onItemClick?.(item, event)}
                >
                  <span
                    className="hover-circle"
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[index] = el;
                    }}
                  />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover" aria-hidden="true">
                      {item.label}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <button
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          ref={hamburgerRef}
          type="button"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
        <div className="mobile-menu-header">
          {logo && <img src={logo} alt={logoAlt} className="mobile-menu-logo" />}
          <span className="mobile-menu-brand">ZenMind</span>
        </div>
        <ul className="mobile-menu-list">
          {items.map((item, index) => (
            <li key={item.href || `mobile-item-${index}`}>
              <a
                href={item.href}
                className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`}
                onClick={(event) => {
                  onItemClick?.(item, event);
                  setIsMobileMenuOpen(false);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
