import type { Metadata } from 'next';
import CircuitComposer from './CircuitComposer';

export const metadata: Metadata = {
  title: 'Quantum Circuit Playground · Q-Quest',
  description: 'Build quantum circuits gate by gate, then inspect every state, matrix, and local simulation.',
};

export default function CircuitSandboxPage() {
  return <CircuitComposer />;
}
