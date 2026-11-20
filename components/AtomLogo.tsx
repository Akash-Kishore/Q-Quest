import type { SVGProps } from 'react';

export default function AtomLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <ellipse cx="24" cy="24" rx="20" ry="8.5" stroke="currentColor" strokeWidth="2.2" />
      <ellipse cx="24" cy="24" rx="20" ry="8.5" stroke="currentColor" strokeWidth="2.2" transform="rotate(60 24 24)" />
      <ellipse cx="24" cy="24" rx="20" ry="8.5" stroke="currentColor" strokeWidth="2.2" transform="rotate(120 24 24)" />
      <circle cx="24" cy="24" r="3.6" fill="currentColor" />
      <circle cx="42.8" cy="21.1" r="2.2" fill="currentColor" />
    </svg>
  );
}
