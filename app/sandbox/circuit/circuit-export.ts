import { GATE_MAP, type PlacedGate } from './quantum';

export type SavedCircuit = { name: string; qubits: number; columns: number; gates: PlacedGate[] };
const CONTROLLED_GATES = new Set(['cx', 'cz', 'cp', 'crx', 'cry', 'crz']);

export function toQiskit(circuit: SavedCircuit) {
  const lines = [
    '"""Q-Quest circuit. Requires qiskit (pip install qiskit)."""',
    'from qiskit import QuantumCircuit',
    '',
    `circuit = QuantumCircuit(${circuit.qubits}, ${circuit.qubits})`,
  ];

  [...circuit.gates]
    .sort((a, b) => a.column - b.column || Math.min(...a.targets) - Math.min(...b.targets))
    .forEach((gate) => {
      const definition = GATE_MAP.get(gate.gateId);
      if (!definition) throw new Error(`Unknown gate: ${gate.gateId}`);
      const targets = gate.targets.join(', ');
      if (gate.gateId === 'measure') {
        lines.push(`circuit.measure(${gate.targets[0]}, ${gate.targets[0]})`);
      } else {
        const angle = definition.parameter ? `${(gate.parameter ?? definition.defaultParameter ?? 0).toPrecision(17)}, ` : '';
        lines.push(`circuit.${gate.gateId}(${angle}${targets})`);
      }
    });

  lines.push('', 'if __name__ == "__main__":', '    print(circuit.draw(output="text"))', '');
  return lines.join('\n');
}

export async function circuitPng(circuit: SavedCircuit): Promise<Blob> {
  const scale = 2;
  const labelWidth = 120;
  const cellWidth = 92;
  const left = 36;
  const top = 110;
  const rowHeight = 88;
  const width = left + labelWidth + circuit.columns * cellWidth + 42;
  const height = top + circuit.qubits * rowHeight + 58;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');
  context.scale(scale, scale);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#17151e';
  context.font = 'bold 22px Arial, sans-serif';
  context.fillText(circuit.name, left, 42, width - 2 * left);
  context.fillStyle = '#6f6b7a';
  context.font = '13px Arial, sans-serif';
  context.fillText(`${circuit.qubits} qubits · ${circuit.gates.length} gates · Q-Quest`, left, 68);

  const xAt = (column: number) => left + labelWidth + (column + 0.5) * cellWidth;
  const yAt = (qubit: number) => top + qubit * rowHeight;
  context.textAlign = 'center';
  context.font = 'bold 12px Arial, sans-serif';
  for (let column = 0; column < circuit.columns; column += 1) {
    context.fillStyle = '#777080';
    context.fillText(String(column + 1).padStart(2, '0'), xAt(column), top - 46);
  }
  for (let qubit = 0; qubit < circuit.qubits; qubit += 1) {
    const y = yAt(qubit);
    context.fillStyle = '#17151e';
    context.textAlign = 'left';
    context.font = 'bold 15px Arial, sans-serif';
    context.fillText(`q[${qubit}]  |0⟩`, left, y + 5);
    context.strokeStyle = '#a9a2b5';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(left + labelWidth, y);
    context.lineTo(width - 36, y);
    context.stroke();
  }

  [...circuit.gates]
    .sort((a, b) => a.column - b.column)
    .forEach((gate) => {
      const definition = GATE_MAP.get(gate.gateId);
      if (!definition) throw new Error(`Unknown gate: ${gate.gateId}`);
      const x = xAt(gate.column);
      if (gate.targets.length === 2) {
        context.strokeStyle = '#5636c8';
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(x, yAt(Math.min(...gate.targets)));
        context.lineTo(x, yAt(Math.max(...gate.targets)));
        context.stroke();
      }
      gate.targets.forEach((target, index) => {
        const y = yAt(target);
        if (CONTROLLED_GATES.has(gate.gateId) && index === 0) {
          context.fillStyle = '#5636c8';
          context.beginPath();
          context.arc(x, y, 7, 0, Math.PI * 2);
          context.fill();
          return;
        }
        context.fillStyle = '#5636c8';
        context.fillRect(x - 22, y - 22, 44, 44);
        context.fillStyle = '#ffffff';
        context.font = 'bold 15px Arial, sans-serif';
        context.textAlign = 'center';
        const symbol = gate.gateId === 'cx' && index === 1 ? '⊕' : gate.gateId === 'cz' && index === 1 ? 'Z' : definition.symbol;
        context.fillText(symbol, x, y + 5, 40);
      });
    });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG export failed')), 'image/png');
  });
}
