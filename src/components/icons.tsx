export const Check = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className="shrink-0" aria-hidden>
    <circle cx="8" cy="8" r="8" fill="#75FF6F" />
    <path d="M4.5 8.2L7 10.5L11.5 5.8" fill="none" stroke="#0C1521" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Warn = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className="shrink-0" aria-hidden>
    <path d="M8 1.5L15 14H1L8 1.5Z" fill="#F5B400" />
    <path d="M8 6V9.5" fill="none" stroke="#0C1521" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="8" cy="11.8" r="0.9" fill="#0C1521" />
  </svg>
);

export const Chevron = ({ up = false }: { up?: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0" aria-hidden>
    <path d={up ? "M3 7.5L6 4.5L9 7.5" : "M3 4.5L6 7.5L9 4.5"} fill="none" stroke="#69727D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Search = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0" aria-hidden>
    <circle cx="6" cy="6" r="4.2" fill="none" stroke="#69727D" strokeWidth="1.5" />
    <path d="M9.2 9.2L12.5 12.5" fill="none" stroke="#69727D" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const Tick = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0" aria-hidden>
    <path d="M3 7.2L5.8 10L11 4.5" fill="none" stroke="#0036F3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Lock = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0" aria-hidden>
    <rect x="2.5" y="5.5" width="7" height="5" rx="1" fill="none" stroke="#69727D" strokeWidth="1.3" />
    <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" fill="none" stroke="#69727D" strokeWidth="1.3" />
  </svg>
);
