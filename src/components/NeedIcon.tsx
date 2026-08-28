import type { NeedType } from '../types';

interface Props {
  needType: NeedType;
  size?: number;
  className?: string;
}

// Hand-drawn SVG glyphs instead of emoji — renders identically everywhere,
// no dependency on a device's emoji font (which is what caused the "boxes
// with question marks" issue on some simulators).
export function NeedIcon({ needType, size = 18, className }: Props) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', className };

  switch (needType) {
    case 'food':
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="8" fill="#e74c3c" />
          <path d="M12 5c-1.2 0-2 1-2 2.2 0 .9.6 1.5 1.4 1.7" stroke="#c0392b" strokeWidth="1.2" fill="none" />
          <path d="M12 3c1.6 0 3 1 3.4 2.6-1.6.4-3-.2-3.6-1.4C11.4 3.5 11.6 3 12 3z" fill="#27ae60" />
        </svg>
      );
    case 'water':
      return (
        <svg {...common}>
          <path
            d="M12 2.5c-3.2 4.4-6 8.3-6 11.7a6 6 0 0012 0c0-3.4-2.8-7.3-6-11.7z"
            fill="#3498db"
          />
          <ellipse cx="10" cy="13.5" rx="1.4" ry="2" fill="#aed6f1" opacity="0.7" />
        </svg>
      );
    case 'shelter':
      return (
        <svg {...common}>
          <path d="M3 11 12 4l9 7" stroke="#8b5e3c" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="5.5" y="11" width="13" height="9" rx="1" fill="#f0c88a" />
          <rect x="10.5" y="14" width="3" height="6" fill="#8b5e3c" />
        </svg>
      );
    case 'weather':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="10" rx="7" ry="4.5" fill="#b0c4de" />
          <circle cx="8" cy="9" r="3.5" fill="#cfd9e8" />
          <circle cx="15" cy="9.5" r="4" fill="#cfd9e8" />
          <path d="M9 16l-1.2 3M13 16l-1.2 3M17 16l-1.2 3" stroke="#5dade2" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'rest':
      return (
        <svg {...common}>
          <path d="M14.5 3.5A8 8 0 1020.5 15 6.5 6.5 0 0114.5 3.5z" fill="#8c7ae6" />
          <circle cx="18" cy="6" r="1" fill="#f5f0ff" />
          <circle cx="20" cy="9.5" r="0.6" fill="#f5f0ff" />
        </svg>
      );
    case 'health':
      return (
        <svg {...common}>
          <path
            d="M12 20.5s-7.5-4.6-7.5-10.2A4.8 4.8 0 0112 6.8a4.8 4.8 0 017.5 3.5c0 5.6-7.5 10.2-7.5 10.2z"
            fill="#ff6b81"
          />
        </svg>
      );
  }
}
