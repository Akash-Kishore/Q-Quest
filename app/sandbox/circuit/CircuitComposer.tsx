'use client';

import { createPortal } from 'react-dom';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
} from 'react';
import AtomLogo from '@/components/AtomLogo';
import InteractiveBrand from '@/components/InteractiveBrand';
import ThemeToggle from '@/components/ThemeToggle';
import styles from './circuit.module.css';
import { circuitPng, toQiskit, type SavedCircuit } from './circuit-export';
import {
  GATES,
  GATE_MAP,
  SAMPLE_CIRCUITS,
  basisLabel,
  blochCoordinates,
  formatComplex,
  magnitudeSquared,
  simulateCircuit,
  toQasm,
  type Complex,
  type GateDefinition,
  type Matrix,
  type PlacedGate,
} from './quantum';

type Circuit = { qubits: number; columns: number; gates: PlacedGate[] };
type ResultTab = 'code' | 'runs';
type FocusRect = { top: number; left: number; width: number; height: number };
type GateTooltipState = {
  gate: GateDefinition;
  top: number;
  left: number;
  width: number;
};

const INITIAL_CIRCUIT: Circuit = { qubits: 2, columns: 8, gates: [] };
const MAX_QUBITS = 5;
const MAX_COLUMNS = 16;
const MAX_GATES = 40;
const GROUPS = ['Essentials', 'Phase', 'Rotations', 'Controlled', 'Interactions', 'Utility'] as const;
const CONTROLLED_GATES = new Set(['cx', 'cz', 'cp', 'crx', 'cry', 'crz']);
const TUTORIAL_STEPS = [
  {
    target: 'header',
    eyebrow: 'Welcome to the workbench',
    title: 'Your circuit, your way.',
    copy: 'Open this guided tour whenever you need a refresher. Rename the circuit by clicking its title, switch themes, undo edits, restore a saved draft, or download a ZIP from this bar.',
  },
  {
    target: 'gates',
    eyebrow: 'Gate library',
    title: 'Choose a quantum operation.',
    copy: 'Search or browse the complete gate set. Hover any gate for its purpose, arity, and matrix size. Click a gate and then an empty time slot, or drag it directly onto a wire.',
  },
  {
    target: 'canvas',
    eyebrow: 'Circuit canvas',
    title: 'Build from left to right.',
    copy: 'Each horizontal line is a qubit and each numbered column is a time slice. The circuit starts empty with two qubits. Two-qubit gates ask you to choose a control and a target.',
  },
  {
    target: 'controls',
    eyebrow: 'Circuit controls',
    title: 'Shape the experiment.',
    copy: 'Add qubits, expand the timeline, load an optional example, clear the circuit, or run a local shot simulation. Two qubits is the minimum so the playground always opens ready for entanglement.',
  },
  {
    target: 'inspector',
    eyebrow: 'Operation studio',
    title: 'Edit with precision.',
    copy: 'Select a placed gate to change its time slice, target qubit, or rotation angle. The selected gate card explains exactly what that operation does.',
  },
  {
    target: 'execution',
    eyebrow: 'Code and runs',
    title: 'Inspect or execute.',
    copy: 'The Code tab produces OpenQASM 3 that you can copy. The Runs tab samples the state vector locally and turns repeated measurements into outcome counts.',
  },
  {
    target: 'sphere',
    eyebrow: 'State sphere',
    title: 'See the qubit in three dimensions.',
    copy: 'Choose a qubit to inspect its reduced Bloch vector. Hover the state point for exact X, Y, and Z coordinates. A shorter vector means that qubit is entangled or mixed.',
  },
  {
    target: 'matrix',
    eyebrow: 'Matrix explorer',
    title: 'Follow every transformation.',
    copy: 'Move through individual gates or jump to the final circuit matrix. Row and column labels use computational-basis ordering. Open Matrix guide for a detailed explanation.',
  },
  {
    target: 'files',
    eyebrow: 'Keep your work',
    title: 'Save, move, and return.',
    copy: 'Save a ZIP with a circuit PNG, OpenQASM 3, JSON, and Qiskit Python code. Restore your last saved draft in this browser or import the JSON later.',
  },
] as const;

function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

function readCircuit(value: unknown): SavedCircuit {
  if (!value || typeof value !== 'object') throw new Error('Invalid circuit');
  const candidate = value as Partial<SavedCircuit>;
  if (!Number.isInteger(candidate.qubits) || candidate.qubits! < 2 || candidate.qubits! > MAX_QUBITS ||
      !Number.isInteger(candidate.columns) || candidate.columns! < 4 || candidate.columns! > MAX_COLUMNS ||
      !Array.isArray(candidate.gates) || candidate.gates.length > MAX_GATES) throw new Error('Invalid circuit');
  const occupied = new Set<string>();
  for (const gate of candidate.gates) {
    const definition = GATE_MAP.get(gate.gateId);
    if (!definition || typeof gate.id !== 'string' || !Number.isInteger(gate.column) ||
        gate.column < 0 || gate.column >= candidate.columns! ||
        !Array.isArray(gate.targets) || gate.targets.length !== definition.arity ||
        gate.targets.some((target) => !Number.isInteger(target) || target < 0 || target >= candidate.qubits!) ||
        new Set(gate.targets).size !== gate.targets.length ||
        (definition.parameter && (gate.parameter !== undefined && !Number.isFinite(gate.parameter)))) {
      throw new Error('Invalid circuit');
    }
    for (const target of gate.targets) {
      const slot = `${gate.column}:${target}`;
      if (occupied.has(slot)) throw new Error('Invalid circuit');
      occupied.add(slot);
    }
  }
  return {
    name: typeof candidate.name === 'string' ? candidate.name.trim().slice(0, 64) || 'Untitled circuit' : 'Untitled circuit',
    qubits: candidate.qubits!,
    columns: candidate.columns!,
    gates: candidate.gates,
  };
}

function MatrixView({ matrix, label }: { matrix: Matrix; label: string }) {
  const qubitCount = Math.max(1, Math.round(Math.log2(matrix.length)));
  const labels = Array.from({ length: matrix.length }, (_, index) => basisLabel(index, qubitCount));
  return (
    <div className={styles.matrixBlock}>
      <div className={styles.matrixLabel}><span>{label}</span><span>{matrix.length} × {matrix.length}</span></div>
      <div className={styles.matrixScroll} aria-label={`${label} matrix`}>
        <div className={styles.matrixBracket}>
          <table className={styles.matrixTable}>
            <thead>
              <tr><th aria-hidden="true" />{labels.map((basis) => <th scope="col" key={basis}>{basis}</th>)}</tr>
            </thead>
            <tbody>
              {matrix.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <th scope="row">{labels[rowIndex]}</th>
                  {row.map((value, columnIndex) => <td key={columnIndex}>{formatComplex(value)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BlochSphere({ state, qubit }: { state: Complex[]; qubit: number }) {
  const coordinate = useMemo(() => blochCoordinates(state, qubit), [qubit, state]);
  return (
    <div className={styles.blochWrap}>
      <div className={styles.blochSphere} aria-label={`Bloch sphere for qubit ${qubit}`}>
        <span className={`${styles.axis} ${styles.axisX}`}><i>X</i></span>
        <span className={`${styles.axis} ${styles.axisY}`}><i>Y</i></span>
        <span className={`${styles.axis} ${styles.axisZ}`}><i>Z</i></span>
        <span className={`${styles.sphereRing} ${styles.ringOne}`} />
        <span className={`${styles.sphereRing} ${styles.ringTwo}`} />
        <span className={`${styles.sphereRing} ${styles.ringThree}`} />
        <span className={styles.stateVector} style={{
          '--vector-angle': `${Math.atan2(-coordinate.z, coordinate.x || 0.00001)}rad`,
          '--vector-length': `${Math.max(3, coordinate.length * 35)}%`,
        } as CSSProperties} />
        <button
          type="button"
          className={styles.statePoint}
          style={{
            '--point-x': `${50 + coordinate.x * 35 + coordinate.y * 8}%`,
            '--point-y': `${50 - coordinate.z * 35 - coordinate.y * 5}%`,
            '--point-scale': `${0.82 + (coordinate.y + 1) * 0.12}`,
          } as CSSProperties}
          aria-label={`State coordinates X ${coordinate.x.toFixed(3)}, Y ${coordinate.y.toFixed(3)}, Z ${coordinate.z.toFixed(3)}`}
        >
          <span role="tooltip">
            <strong>q[{qubit}] coordinates</strong>
            <code>X {coordinate.x.toFixed(4)}</code>
            <code>Y {coordinate.y.toFixed(4)}</code>
            <code>Z {coordinate.z.toFixed(4)}</code>
          </span>
        </button>
      </div>
      <div className={styles.coordinateStrip}>
        <span><i>X</i>{coordinate.x.toFixed(3)}</span>
        <span><i>Y</i>{coordinate.y.toFixed(3)}</span>
        <span><i>Z</i>{coordinate.z.toFixed(3)}</span>
        <span><i>R</i>{coordinate.length.toFixed(3)}</span>
      </div>
    </div>
  );
}

export default function CircuitComposer() {
  const [circuit, setCircuit] = useState<Circuit>(INITIAL_CIRCUIT);
  const [past, setPast] = useState<Circuit[]>([]);
  const [future, setFuture] = useState<Circuit[]>([]);
  const [circuitName, setCircuitName] = useState('Untitled circuit');
  const [isRenaming, setIsRenaming] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTool, setSelectedTool] = useState('h');
  const [selectedGateId, setSelectedGateId] = useState<string | null>(null);
  const [pendingPair, setPendingPair] = useState<{ gateId: string; column: number; first: number } | null>(null);
  const [resultTab, setResultTab] = useState<ResultTab>('code');
  const [selectedStep, setSelectedStep] = useState(0);
  const [sphereQubit, setSphereQubit] = useState(0);
  const [shots, setShots] = useState(1024);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [toast, setToast] = useState('Empty two-qubit circuit ready');
  const [limitError, setLimitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialNoticeOpen, setTutorialNoticeOpen] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [focusRect, setFocusRect] = useState<FocusRect | null>(null);
  const [gateTooltip, setGateTooltip] = useState<GateTooltipState | null>(null);
  const [matrixInfoOpen, setMatrixInfoOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const limitCloseRef = useRef<HTMLButtonElement>(null);

  const simulation = useMemo(() => simulateCircuit(circuit.gates, circuit.qubits), [circuit]);
  const qasm = useMemo(() => toQasm(circuit.gates, circuit.qubits), [circuit]);
  const selectedGate = circuit.gates.find((gate) => gate.id === selectedGateId) ?? null;
  const selectedDefinition = GATE_MAP.get(selectedGate?.gateId ?? selectedTool) ?? GATES[0];
  const activeStep = simulation.steps[Math.min(selectedStep, simulation.steps.length - 1)] ?? null;

  const showGateTooltip = useCallback((gate: GateDefinition, anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect();
    const viewportGap = 12;
    const tooltipGap = 12;
    const estimatedHeight = 126;
    const width = Math.min(270, window.innerWidth - viewportGap * 2);
    let left = rect.right + tooltipGap;
    let top = rect.top + (rect.height - estimatedHeight) / 2;

    if (window.innerWidth < 720) {
      left = rect.left + (rect.width - width) / 2;
      top = rect.bottom + tooltipGap;
      if (top + estimatedHeight > window.innerHeight - viewportGap) {
        top = rect.top - estimatedHeight - tooltipGap;
      }
    } else if (left + width > window.innerWidth - viewportGap) {
      left = rect.left - width - tooltipGap;
    }

    setGateTooltip({
      gate,
      width,
      left: Math.max(viewportGap, Math.min(left, window.innerWidth - width - viewportGap)),
      top: Math.max(viewportGap, Math.min(top, window.innerHeight - estimatedHeight - viewportGap)),
    });
  }, []);

  useEffect(() => {
    const dismissGateTooltip = () => setGateTooltip(null);
    window.addEventListener('resize', dismissGateTooltip);
    document.addEventListener('scroll', dismissGateTooltip, { capture: true, passive: true });
    return () => {
      window.removeEventListener('resize', dismissGateTooltip);
      document.removeEventListener('scroll', dismissGateTooltip, true);
    };
  }, []);

  const commit = useCallback((next: Circuit, message?: string) => {
    setPast((history) => [...history.slice(-39), circuit]);
    setCircuit(next);
    setFuture([]);
    setLimitError(null);
    if (message) setToast(message);
  }, [circuit]);

  const undo = useCallback(() => {
    if (!past.length) return;
    const previous = past[past.length - 1];
    setPast(past.slice(0, -1));
    setFuture([circuit, ...future].slice(0, 40));
    setCircuit(previous);
    setSelectedGateId(null);
    setPendingPair(null);
    setToast('Undid last edit');
  }, [circuit, future, past]);

  const redo = useCallback(() => {
    if (!future.length) return;
    const next = future[0];
    setFuture(future.slice(1));
    setPast([...past, circuit].slice(-40));
    setCircuit(next);
    setSelectedGateId(null);
    setToast('Redid edit');
  }, [circuit, future, past]);

  const removeGate = useCallback((gateId: string) => {
    commit({ ...circuit, gates: circuit.gates.filter((gate) => gate.id !== gateId) }, 'Gate removed');
    setSelectedGateId(null);
  }, [circuit, commit]);

  useEffect(() => {
    if (!limitError) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    limitCloseRef.current?.focus();
    return () => previousFocus?.focus();
  }, [limitError]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (limitError) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setLimitError(null);
        } else if (event.key === 'Tab') {
          event.preventDefault();
          limitCloseRef.current?.focus();
        }
        return;
      }
      const target = event.target as HTMLElement;
      if (target.matches('input, textarea, select')) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedGateId) {
        event.preventDefault();
        removeGate(selectedGateId);
      }
      if (event.key === 'Escape') {
        setMatrixInfoOpen(false);
        setTutorialOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [limitError, redo, removeGate, selectedGateId, undo]);

  useEffect(() => {
    if (!tutorialOpen) return;
    const step = TUTORIAL_STEPS[tutorialStep];
    const target = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!target) return;

    let focusFrame = 0;
    const updateFocus = () => {
      focusFrame = 0;
      const rect = target.getBoundingClientRect();
      const padding = 10;
      const viewportGap = 8;
      const stickyHeader = document.querySelector<HTMLElement>('[data-tour="header"]');
      const stickyHeaderBottom = stickyHeader?.getBoundingClientRect().bottom ?? 0;
      const visibleTop = step.target === 'header'
        ? viewportGap
        : Math.max(viewportGap, stickyHeaderBottom + viewportGap);
      const visibleRight = window.innerWidth - viewportGap;
      const visibleBottom = window.innerHeight - viewportGap;
      const left = Math.max(viewportGap, rect.left - padding);
      const top = Math.max(visibleTop, rect.top - padding);
      const right = Math.min(visibleRight, rect.right + padding);
      const bottom = Math.min(visibleBottom, rect.bottom + padding);

      // Sticky chrome can cover a target while the document continues to
      // scroll. Only outline the portion that is genuinely visible instead
      // of leaving an oversized rectangle across the header or viewport.
      if (right <= left || bottom <= top) {
        setFocusRect(null);
        return;
      }
      setFocusRect({
        top,
        left,
        width: right - left,
        height: bottom - top,
      });
    };
    const scheduleFocusUpdate = () => {
      if (focusFrame) return;
      focusFrame = requestAnimationFrame(updateFocus);
    };

    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    scheduleFocusUpdate();
    const settleTimers = [160, 420, 760, 1100].map((delay) =>
      window.setTimeout(scheduleFocusUpdate, delay)
    );
    const resizeObserver = new ResizeObserver(scheduleFocusUpdate);
    resizeObserver.observe(target);
    window.addEventListener('resize', scheduleFocusUpdate);
    document.addEventListener('scroll', scheduleFocusUpdate, { capture: true, passive: true });
    return () => {
      if (focusFrame) cancelAnimationFrame(focusFrame);
      settleTimers.forEach((timer) => window.clearTimeout(timer));
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleFocusUpdate);
      document.removeEventListener('scroll', scheduleFocusUpdate, true);
      setFocusRect(null);
    };
  }, [tutorialOpen, tutorialStep]);

  const isOccupied = (column: number, qubits: number[], ignoredId?: string) =>
    circuit.gates.some(
      (gate) => gate.id !== ignoredId && gate.column === column && gate.targets.some((target) => qubits.includes(target))
    );

  const placeGate = (gateId: string, column: number, qubit: number) => {
    const definition = GATE_MAP.get(gateId);
    if (!definition) return;
    if (circuit.gates.length >= MAX_GATES) {
      setLimitError(`Gate limit reached: a circuit can contain up to ${MAX_GATES} gates.`);
      return;
    }
    if (definition.arity === 2) {
      if (!pendingPair || pendingPair.gateId !== gateId || pendingPair.column !== column) {
        if (isOccupied(column, [qubit])) return setToast('That time slot is occupied');
        setPendingPair({ gateId, column, first: qubit });
        setToast(`Choose a second qubit in time slice ${column + 1}`);
        return;
      }
      if (pendingPair.first === qubit) return setToast('Choose a different qubit');
      if (isOccupied(column, [pendingPair.first, qubit])) return setToast('One of those qubits is occupied');
      const gate: PlacedGate = {
        id: createId(), gateId, column, targets: [pendingPair.first, qubit],
        parameter: definition.defaultParameter,
      };
      commit({ ...circuit, gates: [...circuit.gates, gate] }, `${definition.label} connected`);
      if (circuit.gates.length + 1 === MAX_GATES) setLimitError(`Gate limit reached: a circuit can contain up to ${MAX_GATES} gates.`);
      setSelectedGateId(gate.id);
      setPendingPair(null);
      setSelectedStep(simulation.steps.length);
      return;
    }
    if (isOccupied(column, [qubit])) return setToast('That time slot is occupied');
    const gate: PlacedGate = {
      id: createId(), gateId, column, targets: [qubit], parameter: definition.defaultParameter,
    };
    commit({ ...circuit, gates: [...circuit.gates, gate] }, `${definition.label} added`);
    if (circuit.gates.length + 1 === MAX_GATES) setLimitError(`Gate limit reached: a circuit can contain up to ${MAX_GATES} gates.`);
    setSelectedGateId(gate.id);
    setPendingPair(null);
    setSelectedStep(simulation.steps.length);
  };

  const updateSelectedGate = (updates: Partial<PlacedGate>) => {
    if (!selectedGate) return;
    const nextGate = { ...selectedGate, ...updates };
    if (isOccupied(nextGate.column, nextGate.targets, selectedGate.id)) return setToast('Target position is already occupied');
    commit({
      ...circuit,
      gates: circuit.gates.map((gate) => gate.id === selectedGate.id ? nextGate : gate),
    }, 'Gate updated');
  };

  const resizeQubits = (delta: number) => {
    const nextCount = Math.max(2, Math.min(MAX_QUBITS, circuit.qubits + delta));
    if (nextCount === circuit.qubits) {
      if (delta > 0) setLimitError(`Qubit limit reached: a circuit can contain up to ${MAX_QUBITS} qubits.`);
      else setToast('The playground keeps at least two qubits');
      return;
    }
    commit({
      ...circuit,
      qubits: nextCount,
      gates: circuit.gates.filter((gate) => gate.targets.every((target) => target < nextCount)),
    }, `${nextCount} qubits active`);
    if (nextCount === MAX_QUBITS) setLimitError(`Qubit limit reached: a circuit can contain up to ${MAX_QUBITS} qubits.`);
    setSphereQubit((current) => Math.min(current, nextCount - 1));
    setSelectedGateId(null);
  };

  const loadSample = (key: string) => {
    const sample = SAMPLE_CIRCUITS[key];
    if (!sample) return;
    commit({
      qubits: Math.max(2, sample.qubits),
      columns: 8,
      gates: sample.gates.map((gate) => ({ ...gate, id: createId() })),
    }, `${sample.label} loaded`);
    setSphereQubit(0);
    setSelectedGateId(null);
    setSelectedStep(0);
    setCounts({});
  };

  const clearCircuit = () => {
    commit({ ...circuit, gates: [] }, 'Circuit cleared');
    setSelectedGateId(null);
    setSelectedStep(0);
    setCounts({});
  };

  const saveCircuit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const saved: SavedCircuit = { name: circuitName.trim() || 'Untitled circuit', ...circuit };
      const basename = saved.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'q-quest-circuit';
      const [png, { default: JSZip }] = await Promise.all([circuitPng(saved), import('jszip')]);
      const zip = new JSZip();
      zip.file(`${basename}.png`, png);
      zip.file(`${basename}.qasm`, toQasm(circuit.gates, circuit.qubits));
      zip.file(`${basename}.json`, JSON.stringify(saved, null, 2));
      zip.file(`${basename}.py`, toQiskit(saved));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${basename}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      try { localStorage.setItem('qquest-circuit', JSON.stringify(saved)); } catch { /* Download remains available when storage is disabled. */ }
      setLimitError(null);
      setToast('ZIP downloaded with PNG, QASM, JSON, and Qiskit code');
    } catch {
      setLimitError('Could not create the circuit ZIP. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const loadSavedCircuit = () => {
    try {
      const saved = localStorage.getItem('qquest-circuit');
      if (!saved) return setToast('No local circuit found');
      const parsed = readCircuit(JSON.parse(saved));
      commit({ qubits: parsed.qubits, columns: parsed.columns, gates: parsed.gates }, 'Local circuit restored');
      setCircuitName(parsed.name);
      setSelectedGateId(null);
      setPendingPair(null);
      setSphereQubit(0);
      setSelectedStep(0);
      setCounts({});
    } catch {
      setToast('Saved circuit could not be read');
    }
  };

  const importCircuit = async (file: File | undefined) => {
    if (!file) return;
    try {
      const next = readCircuit(JSON.parse(await file.text()));
      commit({ qubits: next.qubits, columns: next.columns, gates: next.gates }, 'Circuit imported');
      setCircuitName(next.name || file.name.replace(/\.json$/i, '') || 'Imported circuit');
      setSelectedGateId(null);
      setPendingPair(null);
      setSphereQubit(0);
      setSelectedStep(0);
      setCounts({});
    } catch {
      setToast('That file is not a valid Q-Quest circuit');
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  };

  const runShots = () => {
    const shotCount = Number.isFinite(shots) ? Math.max(1, shots) : 1024;
    const values = simulation.state.map(magnitudeSquared);
    const nextCounts: Record<string, number> = {};
    for (let shot = 0; shot < shotCount; shot += 1) {
      const random = Math.random();
      let cumulative = 0;
      let outcome = values.length - 1;
      for (let index = 0; index < values.length; index += 1) {
        cumulative += values[index];
        if (random <= cumulative) { outcome = index; break; }
      }
      const label = outcome.toString(2).padStart(circuit.qubits, '0');
      nextCounts[label] = (nextCounts[label] ?? 0) + 1;
    }
    setShots(shotCount);
    setCounts(nextCounts);
    setResultTab('runs');
    setToast(`${shotCount.toLocaleString()} local shots completed`);
  };

  const finishRename = () => {
    setCircuitName((name) => name.trim() || 'Untitled circuit');
    setIsRenaming(false);
  };

  const filteredGates = GATES.filter((gate) =>
    `${gate.label} ${gate.symbol} ${gate.group}`.toLowerCase().includes(search.toLowerCase())
  );
  const probabilities = simulation.state
    .map((value, index) => ({
      index, label: basisLabel(index, circuit.qubits), probability: magnitudeSquared(value),
      amplitude: value, phase: Math.atan2(value.im, value.re),
    }))
    .filter((item) => item.probability > 0.000001)
    .sort((a, b) => b.probability - a.probability);

  return (
    <main className={styles.shell} data-theme-root>
      <div className={styles.ambient} aria-hidden="true"><span /><span /><span /></div>

      <header className={styles.topbar} data-tour="header">
        <InteractiveBrand
          className={styles.brand}
          markClassName={styles.brandMark}
          labelClassName={styles.brandLabel}
        />
        <div className={styles.workbenchMeta}>
          <span className={styles.workbenchLabel}>QUANTUM WORKBENCH</span>
          <span className={styles.savedDot}>LOCAL</span>
        </div>
        <div className={styles.projectTitle}>
          {isRenaming ? (
            <input
              value={circuitName}
              onChange={(event) => setCircuitName(event.target.value)}
              onBlur={finishRename}
              onKeyDown={(event) => {
                if (event.key === 'Enter') finishRename();
                if (event.key === 'Escape') setIsRenaming(false);
              }}
              maxLength={64}
              ref={(input) => input?.focus()}
              aria-label="Circuit name"
            />
          ) : (
            <button type="button" className={styles.nameButton} onClick={() => setIsRenaming(true)} title="Rename circuit">
              {circuitName}<span aria-hidden="true">✎</span>
            </button>
          )}
        </div>
        <div className={styles.topActions}>
          <span className={styles.tutorialHint}>Tutorial available anytime</span>
          <div className={styles.tutorialEntry}>
            <button
              type="button"
              className={styles.tutorialButton}
              onClick={() => {
                setTutorialNoticeOpen(false);
                setTutorialStep(0);
                setTutorialOpen(true);
              }}
            >
              <span aria-hidden="true">?</span><span>Tutorial</span>
            </button>
            {tutorialNoticeOpen && (
              <aside className={styles.tutorialNotice} aria-label="Tutorial available">
                <div className={styles.tutorialNoticeTopline}>
                  <span>GUIDED TOUR</span>
                  <button
                    type="button"
                    className={styles.tutorialNoticeDismiss}
                    onClick={() => setTutorialNoticeOpen(false)}
                  >
                    Dismiss
                  </button>
                </div>
                <strong>New to the Circuit Playground?</strong>
                <p>Use the tutorial to learn the gate library, circuit canvas, simulations, and matrix tools.</p>
              </aside>
            )}
          </div>
          <ThemeToggle className={styles.themeToggle} />
          <button type="button" onClick={undo} disabled={!past.length} aria-label="Undo">↶</button>
          <button type="button" onClick={redo} disabled={!future.length} aria-label="Redo">↷</button>
          <button type="button" onClick={loadSavedCircuit}>Restore</button>
          <button type="button" className={styles.saveButton} onClick={saveCircuit} disabled={saving}>{saving ? 'Creating ZIP…' : 'Save ZIP'}</button>
        </div>
      </header>

      <section className={styles.workspace}>
        <aside className={styles.toolbox} aria-label="Gate toolbox" data-tour="gates">
          <div className={styles.panelHeading}>
            <div><span className={styles.kicker}>01 / OPERATIONS</span><h2>Gate library</h2></div>
            <span className={styles.countBadge}>{GATES.length}</span>
          </div>
          <label className={styles.searchBox}>
            <span aria-hidden="true">⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search gates" />
          </label>
          <p className={styles.helper}>Choose a gate, then an empty slot. Hover any operation to learn what it does.</p>
          <div className={styles.gateGroups}>
            {GROUPS.map((group) => {
              const gates = filteredGates.filter((gate) => gate.group === group);
              if (!gates.length) return null;
              return (
                <section key={group} className={styles.gateGroup}>
                  <h3>{group}</h3>
                  <div className={styles.gateGrid}>
                    {gates.map((gate) => (
                      <button
                        type="button" key={gate.id} draggable
                        onDragStart={(event) => {
                          setGateTooltip(null);
                          event.dataTransfer.setData('application/qquest-gate', gate.id);
                        }}
                        onPointerEnter={(event) => showGateTooltip(gate, event.currentTarget)}
                        onPointerLeave={() => setGateTooltip(null)}
                        onFocus={(event) => showGateTooltip(gate, event.currentTarget)}
                        onBlur={() => setGateTooltip(null)}
                        onClick={() => {
                          setSelectedTool(gate.id);
                          setSelectedGateId(null);
                          setPendingPair(null);
                          setToast(`${gate.label} armed`);
                        }}
                        className={`${styles.gateTool} ${selectedTool === gate.id && !selectedGate ? styles.gateToolActive : ''}`}
                        aria-label={`${gate.label}: ${gate.description}`}
                        aria-describedby={gateTooltip?.gate.id === gate.id ? 'gate-description-tooltip' : undefined}
                      >
                        <span className={styles.gateGlyph}>{gate.symbol}</span><small>{gate.label}</small>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </aside>

        <section className={styles.composer}>
          <div className={styles.composerIntro}>
            <div><span className={styles.kicker}>02 / COMPOSE</span><h1>Make quantum states tangible.</h1></div>
            <div className={styles.samplePicker}>
              <select aria-label="Load an example circuit" id="sample" defaultValue="" onChange={(event) => { loadSample(event.target.value); event.currentTarget.value = ''; }}>
                <option value="" disabled>Load an example…</option>
                {Object.entries(SAMPLE_CIRCUITS).map(([key, sample]) => <option key={key} value={key}>{sample.label}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.circuitStage}>
            <div className={styles.circuitToolbar} data-tour="controls">
              <div className={styles.segmented}>
                <button type="button" onClick={() => resizeQubits(-1)} aria-label="Remove qubit">−</button>
                <span>{circuit.qubits} QUBITS</span>
                <button type="button" onClick={() => resizeQubits(1)} aria-label="Add qubit">+</button>
              </div>
              <div className={styles.toolbarStatus}>
                <span className={styles.liveDot} />
                {pendingPair ? `SELECT PARTNER · T${pendingPair.column + 1}` : `${selectedDefinition.symbol} · ${selectedDefinition.label}`}
              </div>
              <div className={styles.toolbarButtons}>
                <button type="button" onClick={() => {
                  const lastGateColumn = Math.max(-1, ...circuit.gates.map((gate) => gate.column));
                  if (circuit.columns <= 4 || lastGateColumn >= circuit.columns - 1) return setToast('Remove gates from the last time slice first');
                  commit({ ...circuit, columns: circuit.columns - 1 }, 'Time slice removed');
                }}>− slice</button>
                <button type="button" onClick={() => {
                  if (circuit.columns >= MAX_COLUMNS) return setLimitError(`Timeline limit reached: up to ${MAX_COLUMNS} gate columns are available.`);
                  commit({ ...circuit, columns: circuit.columns + 1 }, 'Time slice added');
                  if (circuit.columns + 1 === MAX_COLUMNS) setLimitError(`Timeline limit reached: up to ${MAX_COLUMNS} gate columns are available.`);
                }}>+ slice</button>
                <button type="button" className={styles.dangerButton} onClick={clearCircuit}>Clear</button>
              </div>
            </div>
            <div className={styles.circuitFrame} data-tour="canvas">
              <div className={styles.circuitTexture} aria-hidden="true" />
              <div className={styles.circuitCanvas} style={{ '--columns': circuit.columns } as CSSProperties}>
                <div className={styles.timelineCorner}>TIME</div>
                {Array.from({ length: circuit.columns }, (_, column) => (
                  <div className={styles.timeLabel} key={`time-${column}`} style={{ '--index': column } as CSSProperties}>
                    {String(column + 1).padStart(2, '0')}
                  </div>
                ))}
                {Array.from({ length: circuit.qubits }, (_, qubit) => (
                  <div className={styles.circuitRow} key={`row-${qubit}`}>
                    <div className={styles.qubitLabel}><span>q[{qubit}]</span><small>|0⟩</small></div>
                    {Array.from({ length: circuit.columns }, (__, column) => {
                      const gate = circuit.gates.find((item) => item.column === column && item.targets.includes(qubit));
                      const definition = gate ? GATE_MAP.get(gate.gateId) : null;
                      const targetIndex = gate?.targets.indexOf(qubit) ?? -1;
                      const isPending = pendingPair?.column === column && pendingPair.first === qubit;
                      return (
                        <button
                          type="button" key={`${qubit}-${column}`}
                          className={`${styles.circuitCell} ${isPending ? styles.pendingCell : ''}`}
                          aria-label={gate ? `${definition?.label} on qubit ${qubit}` : `Place gate at qubit ${qubit}, time ${column + 1}`}
                          onClick={() => gate ? setSelectedGateId(gate.id) : placeGate(selectedTool, column, qubit)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event: DragEvent<HTMLButtonElement>) => {
                            event.preventDefault();
                            const gateId = event.dataTransfer.getData('application/qquest-gate');
                            if (gateId) { setSelectedTool(gateId); placeGate(gateId, column, qubit); }
                          }}
                        >
                          {gate && definition && (
                            <span className={`${styles.placedGate} ${selectedGateId === gate.id ? styles.placedGateSelected : ''} ${definition.kind === 'measurement' ? styles.measureGate : ''}`}>
                              <span className={styles.gateMark}>
                                {CONTROLLED_GATES.has(gate.gateId) && targetIndex === 0
                                  ? <span className={styles.controlDot} />
                                  : gate.gateId === 'cx' && targetIndex === 1 ? '⊕'
                                    : gate.gateId === 'cz' && targetIndex === 1 ? 'Z' : definition.symbol}
                              </span>
                            </span>
                          )}
                          {isPending && <span className={styles.pendingPulse} />}
                        </button>
                      );
                    })}
                  </div>
                ))}
                {circuit.gates.filter((gate) => gate.targets.length === 2).map((gate) => {
                  const top = Math.min(...gate.targets);
                  const bottom = Math.max(...gate.targets);
                  return (
                    <span key={`line-${gate.id}`} className={styles.controlLine} style={{
                      '--column': gate.column, '--top-qubit': top, '--span-qubits': bottom - top,
                    } as CSSProperties} />
                  );
                })}
              </div>
              {!circuit.gates.length && (
                <div className={styles.emptyCircuitHint}>
                  <AtomLogo /><strong>Your circuit is empty.</strong><span>Choose a gate, then place it on either qubit.</span>
                </div>
              )}
            </div>

            <div className={styles.composerFooter} data-tour="files">
              <output><i />{toast}</output>
              <div>
                <button type="button" onClick={() => importRef.current?.click()}>Import</button>
                <button type="button" onClick={saveCircuit} disabled={saving}>{saving ? 'Creating ZIP…' : 'Download ZIP'}</button>
                <input ref={importRef} className={styles.hiddenInput} type="file" accept="application/json,.json" onChange={(event) => importCircuit(event.target.files?.[0])} />
                <button type="button" className={styles.runButton} onClick={runShots}>Run simulation</button>
              </div>
            </div>
          </div>

          <div className={styles.analysisDeck}>
            <section className={styles.stateCard} data-tour="sphere">
              <div className={styles.analysisHeading}>
                <div><span className={styles.kicker}>04 / STATE</span><h2>Bloch sphere</h2></div>
                <label>Inspect
                  <select value={sphereQubit} onChange={(event) => setSphereQubit(Number(event.target.value))}>
                    {Array.from({ length: circuit.qubits }, (_, index) => <option key={index} value={index}>q[{index}]</option>)}
                  </select>
                </label>
              </div>
              <p className={styles.analysisCopy}>Reduced single-qubit state. Hover the point for exact coordinates.</p>
              <BlochSphere state={simulation.state} qubit={sphereQubit} />
              <div className={styles.probabilityList}>
                {probabilities.slice(0, 4).map((item) => (
                  <div className={styles.probabilityRow} key={item.index}>
                    <span>{item.label}</span><div><i style={{ width: `${item.probability * 100}%` }} /></div>
                    <strong>{(item.probability * 100).toFixed(1)}%</strong><code>{formatComplex(item.amplitude, 3)}</code>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.matrixCard} data-tour="matrix">
              <div className={styles.analysisHeading}>
                <div><span className={styles.kicker}>05 / TRANSFORM</span><h2>Matrix explorer</h2></div>
                <button type="button" className={styles.infoButton} onClick={() => setMatrixInfoOpen(true)}>Matrix guide</button>
              </div>
              <div className={styles.stepRail}>
                {simulation.steps.map((step, index) => (
                  <button type="button" key={step.gate.id} className={selectedStep === index ? styles.activeStep : ''} onClick={() => setSelectedStep(index)} title={`${index + 1}. ${step.definition.label}`}>{index + 1}<span>{step.definition.symbol}</span></button>
                ))}
                <button type="button" className={selectedStep >= simulation.steps.length ? styles.activeStep : ''} onClick={() => setSelectedStep(simulation.steps.length)}>Σ<span>Final</span></button>
              </div>
              {activeStep && selectedStep < simulation.steps.length ? (
                <>
                  <p className={styles.matrixNote}>Step {selectedStep + 1}: {activeStep.definition.symbol} acts on {activeStep.gate.targets.map((target) => `q[${target}]`).join(' + ')}. The cumulative matrix includes every operation through this step.</p>
                  {activeStep.localMatrix && <MatrixView matrix={activeStep.localMatrix} label="Gate matrix" />}
                  {activeStep.systemMatrix && <MatrixView matrix={activeStep.systemMatrix} label={`Expanded ${2 ** circuit.qubits}-state matrix`} />}
                  <MatrixView matrix={activeStep.cumulativeMatrix} label="Cumulative matrix" />
                </>
              ) : (
                <>
                  <p className={styles.matrixNote}>The complete circuit transformation. Gates are multiplied in execution order, so the rightmost matrix acts first on the input state.</p>
                  <MatrixView matrix={simulation.finalMatrix} label="Final circuit matrix" />
                </>
              )}
            </section>
          </div>
        </section>

        <aside className={styles.inspector} data-tour="inspector">
          <div className={styles.panelHeading}>
            <div><span className={styles.kicker}>03 / INSPECT</span><h2>Operation studio</h2></div>
            <span className={styles.countBadge}>{simulation.steps.length} STEP{simulation.steps.length === 1 ? '' : 'S'}</span>
          </div>
          <div className={styles.gateIdentity}>
            <span className={styles.gateAvatar}>{selectedDefinition.symbol}</span>
            <div><strong>{selectedDefinition.label}</strong><p>{selectedDefinition.description}</p><small>{selectedDefinition.arity} QUBIT OPERATION</small></div>
          </div>
          {selectedGate ? (
            <div className={styles.editorGrid}>
              <label>Time slice
                <select value={selectedGate.column} onChange={(event) => updateSelectedGate({ column: Number(event.target.value) })}>
                  {Array.from({ length: circuit.columns }, (_, index) => <option key={index} value={index}>{index + 1}</option>)}
                </select>
              </label>
              {selectedGate.targets.map((target, targetIndex) => (
                <label key={targetIndex}>{selectedGate.targets.length === 2 ? (targetIndex === 0 ? 'Control' : 'Target') : 'Qubit'}
                  <select value={target} onChange={(event) => {
                    const targets = [...selectedGate.targets];
                    targets[targetIndex] = Number(event.target.value);
                    if (new Set(targets).size === targets.length) updateSelectedGate({ targets });
                  }}>
                    {Array.from({ length: circuit.qubits }, (_, index) => <option key={index} value={index}>q[{index}]</option>)}
                  </select>
                </label>
              ))}
              {selectedDefinition.parameter && (
                <label className={styles.fullField}>Angle · degrees
                  <input type="number" value={Math.round(((selectedGate.parameter ?? 0) * 180) / Math.PI)} onChange={(event) => updateSelectedGate({ parameter: (Number(event.target.value) * Math.PI) / 180 })} />
                </label>
              )}
              <button type="button" className={styles.deleteGate} onClick={() => removeGate(selectedGate.id)}>Delete operation</button>
            </div>
          ) : (
            <p className={styles.inspectorHint}>Select a gate in the library or on the circuit to inspect and edit it here.</p>
          )}

          <div className={styles.executionStudio} data-tour="execution">
            <div className={styles.tabs} role="tablist" aria-label="Circuit execution">
              {(['code', 'runs'] as ResultTab[]).map((tab) => (
                <button type="button" role="tab" aria-selected={resultTab === tab} key={tab} onClick={() => setResultTab(tab)} className={resultTab === tab ? styles.activeTab : ''}>{tab}</button>
              ))}
            </div>
            <div className={styles.resultPanel}>
              {resultTab === 'code' && (
                <div className={styles.codeView}>
                  <div><span>OPENQASM 3</span><button type="button" onClick={() => navigator.clipboard.writeText(qasm).then(() => setToast('OpenQASM copied'))}>Copy</button></div>
                  <pre>{qasm}</pre>
                </div>
              )}
              {resultTab === 'runs' && (
                <div className={styles.runsView}>
                  <div className={styles.shotControl}>
                    <label>Shots<input type="number" min="1" max="100000" value={shots} onChange={(event) => setShots(Math.max(1, Math.min(100000, Number(event.target.value))))} /></label>
                    <button type="button" onClick={runShots}>Run again</button>
                  </div>
                  {Object.keys(counts).length ? Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([outcome, count]) => (
                    <div className={styles.countRow} key={outcome}>
                      <code>|{outcome}⟩</code><div><i style={{ width: `${(count / shots) * 100}%` }} /></div><strong>{count}</strong>
                    </div>
                  )) : <p className={styles.emptyState}>Run the circuit to sample measurement outcomes.</p>}
                </div>
              )}
            </div>
          </div>
        </aside>
      </section>

      {gateTooltip && typeof document !== 'undefined' && createPortal(
        <div
          id="gate-description-tooltip"
          className={styles.gateTooltip}
          role="tooltip"
          style={{ top: gateTooltip.top, left: gateTooltip.left, width: gateTooltip.width }}
        >
          <strong>{gateTooltip.gate.label}</strong>
          <span>{gateTooltip.gate.description}</span>
          <em>
            {gateTooltip.gate.arity} QUBIT · {2 ** gateTooltip.gate.arity} × {2 ** gateTooltip.gate.arity} MATRIX
          </em>
        </div>,
        document.body
      )}

      {limitError && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setLimitError(null);
        }}>
          <dialog open role="alertdialog" aria-modal="true" aria-labelledby="limit-title" aria-describedby="limit-description" className={styles.limitDialog}>
            <span className={styles.limitIcon} aria-hidden="true">!</span>
            <span className={styles.kicker}>CIRCUIT LIMIT</span>
            <h2 id="limit-title">Limit reached</h2>
            <p id="limit-description">{limitError}</p>
            <button ref={limitCloseRef} type="button" onClick={() => setLimitError(null)}>Got it</button>
          </dialog>
        </div>
      )}

      {tutorialOpen && (
        <>
          {focusRect && (
            <div className={styles.tutorialFocus} style={{
              top: focusRect.top, left: focusRect.left, width: focusRect.width, height: focusRect.height,
            }} />
          )}
          <dialog open className={styles.tutorialCard} aria-labelledby="tutorial-title">
            <div className={styles.tutorialProgress} aria-label={`Tutorial step ${tutorialStep + 1} of ${TUTORIAL_STEPS.length}`}>
              {TUTORIAL_STEPS.map((_, index) => <span key={index} className={index <= tutorialStep ? styles.progressDone : ''} />)}
            </div>
            <span className={styles.kicker}>{TUTORIAL_STEPS[tutorialStep].eyebrow} · {tutorialStep + 1}/{TUTORIAL_STEPS.length}</span>
            <h2 id="tutorial-title">{TUTORIAL_STEPS[tutorialStep].title}</h2>
            <p>{TUTORIAL_STEPS[tutorialStep].copy}</p>
            <div className={styles.tutorialActions}>
              <button type="button" className={styles.skipTutorial} onClick={() => setTutorialOpen(false)}>Skip tutorial</button>
              <div>
                <button type="button" onClick={() => setTutorialStep((step) => Math.max(0, step - 1))} disabled={tutorialStep === 0}>Back</button>
                <button
                  type="button"
                  className={styles.nextTutorial}
                  onClick={() => {
                    if (tutorialStep === TUTORIAL_STEPS.length - 1) setTutorialOpen(false);
                    else setTutorialStep((step) => step + 1);
                  }}
                >
                  {tutorialStep === TUTORIAL_STEPS.length - 1 ? 'Start building' : 'Next'}
                </button>
              </div>
            </div>
          </dialog>
        </>
      )}

      {matrixInfoOpen && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setMatrixInfoOpen(false);
        }}>
          <dialog open className={styles.matrixGuide} aria-labelledby="matrix-guide-title">
            <button type="button" className={styles.modalClose} onClick={() => setMatrixInfoOpen(false)} aria-label="Close matrix guide">×</button>
            <span className={styles.kicker}>MATRIX GUIDE / COMPUTATIONAL BASIS</span>
            <h2 id="matrix-guide-title">How to read the circuit matrix.</h2>
            <p className={styles.guideLead}>A quantum circuit is a linear transformation. Its matrix tells you how every possible input basis state contributes to every possible output basis state.</p>
            <div className={styles.guideGrid}>
              <article><span>01</span><h3>Columns are inputs</h3><p>Choose a column such as |01⟩. Every value down that column is the amplitude contributed to each output after the operation.</p></article>
              <article><span>02</span><h3>Rows are outputs</h3><p>Choose a row such as |10⟩. Read across it to see which inputs can arrive at that output and with what complex amplitude.</p></article>
              <article><span>03</span><h3>Complex entries</h3><p>Magnitude controls probability weight; the real and imaginary parts encode phase. “i” means a quarter-turn in the complex plane.</p></article>
              <article><span>04</span><h3>Gate vs system</h3><p>A gate matrix describes only its target qubit(s). The expanded system matrix embeds that gate into the full {2 ** circuit.qubits}-state space.</p></article>
              <article><span>05</span><h3>Cumulative order</h3><p>If gates execute A, then B, the combined matrix is B × A. Matrix multiplication reads right to left because A touches the state first.</p></article>
              <article><span>06</span><h3>Final transformation</h3><p>The final circuit matrix combines every unitary gate. Multiplying it by the initial |{'0'.repeat(circuit.qubits)}⟩ state yields the displayed state vector.</p></article>
            </div>
            <div className={styles.guideFormula}><code>|ψout⟩ = Ucircuit |ψin⟩</code><span>Rows → output · Columns → input</span></div>
          </dialog>
        </div>
      )}
    </main>
  );
}
