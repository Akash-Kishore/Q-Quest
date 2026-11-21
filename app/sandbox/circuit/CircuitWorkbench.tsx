'use client';

import dynamic from 'next/dynamic';

// The simulator builds full matrices during render. Skip server prerendering so
// that work only happens in the visitor's browser, including on the first load.
const CircuitComposer = dynamic(() => import('./CircuitComposer'), {
  ssr: false,
  loading: () => <main aria-busy="true" aria-label="Loading circuit playground" />,
});

export default function CircuitWorkbench() {
  return <CircuitComposer />;
}
