import React, {
  useCallback, useLayoutEffect, useRef, useState
} from 'react';
import { gsap } from 'gsap';
import './StaggeredMenu.css';

export interface StaggeredMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  items: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  colors?: string[];
  accentColor?: string;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onLogout?: () => void;
  onLogoDoubleClick?: () => void;
  logoUrl?: string;
  isScrolled?: boolean;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string | null;
  initials?: string;
}

const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  items = [],
  socialItems = [],
  displaySocials = false,
  displayItemNumbering = true,
  colors = ['#0d5d3a', '#1a8a5a'],
  accentColor = '#10b981',
  onMenuOpen,
  onMenuClose,
  onLogout,
  onLogoDoubleClick,
  logoUrl,
  isScrolled = false,
  userName,
  userEmail,
  avatarUrl,
  initials = 'ZM',
}) => {
  const [open, setOpen]         = useState(false);
  const lastTapRef              = useRef<number>(0);  // for touch double-tap
  const openRef                 = useRef(false);
  const panelRef                = useRef<HTMLElement>(null);
  const preLayersRef            = useRef<HTMLDivElement>(null);
  const preLayerElsRef          = useRef<HTMLElement[]>([]);
  const plusHRef                = useRef<HTMLSpanElement>(null);
  const plusVRef                = useRef<HTMLSpanElement>(null);
  const iconRef                 = useRef<HTMLSpanElement>(null);
  const textInnerRef            = useRef<HTMLSpanElement>(null);
  const [textLines, setTextLines] = useState(['Menu', 'Close']);

  const openTlRef               = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef           = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef            = useRef<gsap.core.Tween | null>(null);
  const textCycleAnimRef        = useRef<gsap.core.Tween | null>(null);
  const toggleBtnRef            = useRef<HTMLButtonElement>(null);
  const busyRef                 = useRef(false);
  const itemEntranceTweenRef    = useRef<gsap.core.Tween | null>(null);

  /* ── GSAP initial setup ── */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel     = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH     = plusHRef.current;
      const plusV     = plusVRef.current;
      const icon      = iconRef.current;
      const textInner = textInnerRef.current;
      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      const preLayers = preContainer
        ? Array.from(preContainer.querySelectorAll<HTMLElement>('.sm-prelayer'))
        : [];
      preLayerElsRef.current = preLayers;

      gsap.set([panel, ...preLayers], { xPercent: 100, opacity: 1 });
      gsap.set(plusH,  { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV,  { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon,   { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });
    });
    return () => ctx.revert();
  }, []);

  /* ── Open timeline builder ── */
  const buildOpenTimeline = useCallback(() => {
    const panel  = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    closeTweenRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const itemEls     = Array.from(panel.querySelectorAll<HTMLElement>('.sm-panel-itemLabel'));
    const numberEls   = Array.from(panel.querySelectorAll<HTMLElement>('.sm-panel-list[data-numbering] .sm-panel-item'));
    const socialTitle = panel.querySelector<HTMLElement>('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll<HTMLElement>('.sm-socials-link'));
    const userSection = panel.querySelector<HTMLElement>('.sm-user-section');
    const logoutBtn   = panel.querySelector<HTMLElement>('.sm-logout-btn');
    const dividers    = Array.from(panel.querySelectorAll<HTMLElement>('.sm-divider'));

    if (itemEls.length)   gsap.set(itemEls,   { yPercent: 140, rotate: 10 });
    if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 } as any);
    if (socialTitle)      gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
    if (userSection)      gsap.set(userSection, { y: 20, opacity: 0 });
    if (logoutBtn)        gsap.set(logoutBtn, { y: 12, opacity: 0 });
    if (dividers.length)  gsap.set(dividers,  { scaleX: 0, opacity: 0, transformOrigin: 'left center' });

    const tl = gsap.timeline({ paused: true });

    // Pre-layers stagger
    layers.forEach((el, i) => {
      tl.fromTo(el, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });

    const lastTime      = layers.length ? (layers.length - 1) * 0.07 : 0;
    const panelStart    = lastTime + (layers.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(panel,
      { xPercent: 100 },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelStart
    );

    const contentStart = panelStart + panelDuration * 0.15;

    // Nav items
    if (itemEls.length) {
      tl.to(itemEls, {
        yPercent: 0, rotate: 0, duration: 1,
        ease: 'power4.out',
        stagger: { each: 0.08, from: 'start' }
      }, contentStart);
    }
    if (numberEls.length) {
      tl.to(numberEls, {
        '--sm-num-opacity': 1, duration: 0.6, ease: 'power2.out',
        stagger: { each: 0.07, from: 'start' }
      } as any, contentStart + 0.1);
    }

    // Dividers
    if (dividers.length) {
      tl.to(dividers, { scaleX: 1, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.08 }, contentStart + 0.3);
    }

    // User section
    if (userSection) {
      tl.to(userSection, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, contentStart + 0.35);
    }
    if (logoutBtn) {
      tl.to(logoutBtn, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }, contentStart + 0.42);
    }

    // Socials
    if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.4, ease: 'power2.out' }, contentStart + 0.4);
    if (socialLinks.length) {
      tl.to(socialLinks, {
        y: 0, opacity: 1, duration: 0.45, ease: 'power3.out',
        stagger: { each: 0.07 }
      }, contentStart + 0.44);
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => { busyRef.current = false; });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel  = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    closeTweenRef.current?.kill();
    closeTweenRef.current = gsap.to([...layers, panel], {
      xPercent: 100, duration: 0.32, ease: 'power3.in', overwrite: 'auto',
      onComplete: () => { busyRef.current = false; }
    });
  }, []);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    if (!icon) return;
    spinTweenRef.current?.kill();
    spinTweenRef.current = opening
      ? gsap.to(icon, { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' })
      : gsap.to(icon, { rotate: 0,   duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
  }, []);

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current;
    if (!inner) return;
    textCycleAnimRef.current?.kill();

    const current = opening ? 'Menu' : 'Close';
    const target  = opening ? 'Close' : 'Menu';
    const cycles  = 3;
    const seq     = [current];
    let last      = current;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }
    if (last !== target) seq.push(target);
    seq.push(target);
    setTextLines(seq);

    gsap.set(inner, { yPercent: 0 });
    const finalShift = ((seq.length - 1) / seq.length) * 100;
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + seq.length * 0.07,
      ease: 'power4.out'
    });
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    if (target) { onMenuOpen?.(); playOpen(); }
    else         { onMenuClose?.(); playClose(); }
    animateIcon(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateText, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    onMenuClose?.();
    playClose();
    animateIcon(false);
    animateText(false);
  }, [playClose, animateIcon, animateText, onMenuClose]);

  /* ── Click-away ── */
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current    && !panelRef.current.contains(e.target as Node) &&
        toggleBtnRef.current && !toggleBtnRef.current.contains(e.target as Node)
      ) closeMenu();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeMenu]);

  /* Strip colour layers (max 2, remove middle duplicate like original) */
  const stripColors = (() => {
    const raw = colors && colors.length ? colors.slice(0, 4) : ['#0d5d3a', '#1a8a5a'];
    const arr = [...raw];
    if (arr.length >= 3) arr.splice(Math.floor(arr.length / 2), 1);
    return arr;
  })();

  return (
    <div
      className="staggered-menu-wrapper fixed-wrapper"
      style={{ '--sm-accent': accentColor } as React.CSSProperties}
      data-position="right"
      data-open={open || undefined}
    >
      {/* Pre-layers */}
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {stripColors.map((c, i) => (
          <div key={i} className="sm-prelayer" style={{ background: c }} />
        ))}
      </div>

      {/* Top bar — gets frosted bg when scrolled (and always when open) */}
      <header
        className="staggered-menu-header"
        aria-label="Mobile navigation header"
        style={{
          background: open
            ? 'transparent'
            : isScrolled
              ? 'rgba(255,255,255,0.95)'
              : 'transparent',
          backdropFilter: (!open && isScrolled) ? 'blur(12px)' : undefined,
          WebkitBackdropFilter: (!open && isScrolled) ? 'blur(12px)' : undefined,
          borderBottom: (!open && isScrolled) ? '1px solid rgba(13,93,58,0.12)' : 'none',
          borderRadius: (!open && isScrolled) ? '0 0 1.25rem 1.25rem' : undefined,
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        {/* Logo / wordmark */}
        <div
          className="sm-logo"
          aria-label="ZenMind"
          onDoubleClick={() => onLogoDoubleClick?.()}
          onTouchEnd={(e) => {
            const now = Date.now();
            if (now - lastTapRef.current < 350) {
              e.preventDefault();
              onLogoDoubleClick?.();
            }
            lastTapRef.current = now;
          }}
          title="Double-tap for admin access"
          style={{ cursor: onLogoDoubleClick ? 'pointer' : 'default', userSelect: 'none' }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="ZenMind Logo"
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="16" cy="16" r="15" stroke={open ? '#10b981' : '#0d5d3a'} strokeWidth="2" />
              <path d="M10 20C10 14 14 10 16 10C18 10 22 14 22 20" stroke={open ? '#10b981' : '#0d5d3a'} strokeWidth="2" strokeLinecap="round" />
              <circle cx="16" cy="10" r="2.5" fill={open ? '#10b981' : '#0d5d3a'} />
            </svg>
          )}
          <span className="sm-logo-wordmark">
            Zen<span style={{ color: open ? '#10b981' : '#0d5d3a' }}>Mind</span>
            <span className="sm-logo-dot" />
          </span>
        </div>

        {/* Toggle */}
        <button
          ref={toggleBtnRef}
          className="sm-toggle"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          onClick={toggleMenu}
          type="button"
        >
          <span className="sm-toggle-textWrap" aria-hidden="true">
            <span ref={textInnerRef} className="sm-toggle-textInner">
              {textLines.map((l, i) => (
                <span className="sm-toggle-line" key={i}>{l}</span>
              ))}
            </span>
          </span>
          <span ref={iconRef} className="sm-icon" aria-hidden="true">
            <span ref={plusHRef} className="sm-icon-line" />
            <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
          </span>
        </button>
      </header>

      {/* Slide-in panel */}
      <aside ref={panelRef} className="staggered-menu-panel" aria-hidden={!open} aria-label="Navigation menu">
        <div className="sm-panel-inner">
          {/* Nav items */}
          <ul
            className="sm-panel-list"
            role="list"
            {...(displayItemNumbering ? { 'data-numbering': true } : {})}
          >
            {items.map((it, idx) => (
              <li className="sm-panel-itemWrap" key={it.key}>
                <button
                  className="sm-panel-item"
                  data-index={idx + 1}
                  data-active={it.active || undefined}
                  onClick={() => { it.onClick(); closeMenu(); }}
                  type="button"
                  aria-current={it.active ? 'page' : undefined}
                >
                  <span className="sm-panel-itemLabel">{it.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className="sm-divider" />

          {/* User info */}
          {(userName || userEmail) && (
            <div className="sm-user-section">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="sm-user-avatar" />
              ) : (
                <div className="sm-user-initials">{initials}</div>
              )}
              <div className="sm-user-info">
                {userName  && <div className="sm-user-name">{userName}</div>}
                {userEmail && <div className="sm-user-email">{userEmail}</div>}
              </div>
            </div>
          )}

          {/* Logout */}
          {onLogout && (
            <button
              className="sm-logout-btn"
              onClick={() => { closeMenu(); onLogout(); }}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          )}

          {/* Socials */}
          {displaySocials && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Socials</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => (
                  <li key={i}>
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="sm-socials-link">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
