import { getOutfit } from '../data/outfits';

interface Props {
  outfitId: string;
}

// Small generic accessory drawings, positioned to sit reasonably on top of
// any of the three character appearances rather than being fitted to one.
export function OutfitOverlay({ outfitId }: Props) {
  const outfit = getOutfit(outfitId);
  if (!outfit) return null;

  switch (outfitId) {
    case 'party-hat':
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" className="absolute -top-3 left-1/2 -translate-x-1/2 rotate-[8deg]">
          <path d="M12 2 L19 19 H5 Z" fill="#e91e63" stroke="#141414" strokeWidth="1" />
          <circle cx="12" cy="2" r="2" fill="#ffd54f" stroke="#141414" strokeWidth="0.8" />
          <circle cx="9" cy="12" r="1.3" fill="#ffd54f" />
          <circle cx="14" cy="15" r="1.3" fill="#42a5f5" />
        </svg>
      );
    case 'crown':
      return (
        <svg width="36" height="24" viewBox="0 0 24 16" className="absolute -top-3 left-1/2 -translate-x-1/2">
          <path
            d="M2 14 L2 6 L7 10 L12 3 L17 10 L22 6 L22 14 Z"
            fill="#ffd54f"
            stroke="#141414"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="3" r="1.4" fill="#e91e63" />
        </svg>
      );
    case 'bow-tie':
      return (
        <svg width="26" height="18" viewBox="0 0 24 16" className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <path d="M2 2 L11 8 L2 14 Z" fill="#e53935" stroke="#141414" strokeWidth="1" strokeLinejoin="round" />
          <path d="M22 2 L13 8 L22 14 Z" fill="#e53935" stroke="#141414" strokeWidth="1" strokeLinejoin="round" />
          <circle cx="12" cy="8" r="2" fill="#b71c1c" stroke="#141414" strokeWidth="0.8" />
        </svg>
      );
    case 'scarf':
      return (
        <svg width="60" height="26" viewBox="0 0 48 20" className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <path d="M2 4 Q24 14 46 4 L46 10 Q24 20 2 10 Z" fill="#5c6bc0" stroke="#141414" strokeWidth="1" />
          <rect x="22" y="9" width="6" height="10" fill="#5c6bc0" stroke="#141414" strokeWidth="1" />
        </svg>
      );
    case 'sunglasses':
      return (
        <svg width="44" height="18" viewBox="0 0 40 16" className="absolute left-1/2 top-9 -translate-x-1/2">
          <rect x="1" y="2" width="15" height="11" rx="3" fill="#141414" />
          <rect x="24" y="2" width="15" height="11" rx="3" fill="#141414" />
          <path d="M16 6 H24" stroke="#141414" strokeWidth="2" />
        </svg>
      );
    case 'cape':
      return (
        <svg width="70" height="70" viewBox="0 0 60 60" className="absolute left-1/2 top-6 -z-10 -translate-x-1/2">
          <path d="M12 6 Q30 -2 48 6 L54 52 Q30 42 6 52 Z" fill="#7e57c2" stroke="#141414" strokeWidth="1.2" />
        </svg>
      );
    default:
      return null;
  }
}
