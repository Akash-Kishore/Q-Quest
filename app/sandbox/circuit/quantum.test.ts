import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GATES,
  GATE_MAP,
  SAMPLE_CIRCUITS,
  applyMatrixToState,
  blochCoordinates,
  expandedMatrix,
  identity,
  magnitudeSquared,
  multiplyMatrices,
  simulateCircuit,
  toQasm,
  type Complex,
  type Matrix,
  type PlacedGate,
} from './quantum.ts';

const EPSILON = 1e-9;
const complex = (re: number, im = 0): Complex => ({ re, im });

function assertClose(actual: number, expected: number, message?: string) {
  assert.ok(
    Math.abs(actual - expected) <= EPSILON,
    message ?? `Expected ${actual} to be within ${EPSILON} of ${expected}`
  );
}

function assertComplexClose(actual: Complex, expected: Complex, message?: string) {
  assertClose(actual.re, expected.re, `${message ?? 'Complex value'} real component`);
  assertClose(actual.im, expected.im, `${message ?? 'Complex value'} imaginary component`);
}

function assertMatrixClose(actual: Matrix, expected: Matrix, message?: string) {
  assert.equal(actual.length, expected.length, `${message ?? 'Matrix'} row count`);
  actual.forEach((row, rowIndex) => {
    assert.equal(row.length, expected[rowIndex].length, `${message ?? 'Matrix'} column count`);
    row.forEach((value, columnIndex) => {
      assertComplexClose(value, expected[rowIndex][columnIndex], `${message ?? 'Matrix'} [${rowIndex}, ${columnIndex}]`);
    });
  });
}

function conjugateTranspose(matrix: Matrix): Matrix {
  return matrix[0].map((_, column) =>
    matrix.map((row) => ({ re: row[column].re, im: -row[column].im }))
  );
}

function assertUnitary(matrix: Matrix, message?: string) {
  assertMatrixClose(
    multiplyMatrices(conjugateTranspose(matrix), matrix),
    identity(matrix.length),
    message
  );
}

function gate(id: string) {
  const definition = GATE_MAP.get(id);
  assert.ok(definition, `Gate ${id} exists`);
  return definition;
}

function placed(
  gateId: string,
  column: number,
  targets: number[],
  parameter?: number
): PlacedGate {
  return { id: `${gateId}-${column}-${targets.join('-')}`, gateId, column, targets, parameter };
}

function matrixForSequence(gates: PlacedGate[], qubits = 2) {
  return simulateCircuit(gates, qubits).finalMatrix;
}

test('all 28 gate definitions have valid dimensions and unitary matrices', () => {
  assert.equal(GATES.length, 28);
  GATES.forEach((definition) => {
    const kind = definition.kind ?? 'unitary';
    const matrix = definition.matrix(definition.defaultParameter);
    if (kind !== 'unitary') {
      assert.deepEqual(matrix, [], `${definition.id} is a marker rather than a unitary`);
      return;
    }
    const size = 2 ** definition.arity;
    assert.equal(matrix.length, size, `${definition.id} row count`);
    matrix.forEach((row) => {
      assert.equal(row.length, size, `${definition.id} column count`);
      row.forEach((value) => {
        assert.ok(Number.isFinite(value.re) && Number.isFinite(value.im), `${definition.id} contains finite values`);
      });
    });
    assertUnitary(matrix, `${definition.id} is unitary`);
  });
});

test('parameterized gates remain unitary and invert at the negative angle', () => {
  const angles = [-Math.PI, -0.731, 0, 0.418, Math.PI];
  GATES.filter((definition) => definition.parameter).forEach((definition) => {
    angles.forEach((angle) => {
      const forward = definition.matrix(angle);
      const inverse = definition.matrix(-angle);
      assertUnitary(forward, `${definition.id}(${angle}) is unitary`);
      assertMatrixClose(
        multiplyMatrices(inverse, forward),
        identity(forward.length),
        `${definition.id}(${angle}) inverse`
      );
    });
  });
});

test('fixed inverse pairs and self-inverse gates compose to identity', () => {
  ['h', 'x', 'y', 'z', 'id', 'swap', 'cx', 'cz'].forEach((id) => {
    const matrix = gate(id).matrix();
    assertMatrixClose(multiplyMatrices(matrix, matrix), identity(matrix.length), `${id} squared`);
  });
  [['s', 'sdg'], ['t', 'tdg'], ['sx', 'sxdg']].forEach(([forwardId, inverseId]) => {
    const forward = gate(forwardId).matrix();
    const inverse = gate(inverseId).matrix();
    assertMatrixClose(multiplyMatrices(inverse, forward), identity(forward.length), `${forwardId}/${inverseId}`);
  });
});

test('qubit ordering uses q[0] as the most-significant basis bit', () => {
  const initial = [complex(1), complex(0), complex(0), complex(0)];
  const x = gate('x').matrix();
  assert.deepEqual(applyMatrixToState(initial, x, [0], 2), [complex(0), complex(0), complex(1), complex(0)]);
  assert.deepEqual(applyMatrixToState(initial, x, [1], 2), [complex(0), complex(1), complex(0), complex(0)]);

  const q0Control = simulateCircuit([
    placed('x', 0, [0]),
    placed('cx', 1, [0, 1]),
  ], 2).state;
  assert.deepEqual(q0Control, [complex(0), complex(0), complex(0), complex(1)]);

  const q1Control = simulateCircuit([
    placed('x', 0, [1]),
    placed('cx', 1, [1, 0]),
  ], 2).state;
  assert.deepEqual(q1Control, [complex(0), complex(0), complex(0), complex(1)]);
});

test('expanded matrices act identically to direct local application', () => {
  const input = [complex(0.5), complex(0, 0.5), complex(-0.5), complex(0, -0.5)];
  GATES.filter((definition) => (definition.kind ?? 'unitary') === 'unitary').forEach((definition) => {
    const targets = definition.arity === 1 ? [1] : [1, 0];
    const local = definition.matrix(definition.defaultParameter);
    const direct = applyMatrixToState(input, local, targets, 2);
    const system = applyMatrixToState(input, expandedMatrix(local, targets, 2), [0, 1], 2);
    direct.forEach((value, index) => assertComplexClose(value, system[index], `${definition.id} expanded state ${index}`));
  });
});

test('Bell and GHZ samples produce the expected entangled states', () => {
  const bell = simulateCircuit(
    SAMPLE_CIRCUITS.bell.gates.map((item, index) => ({ ...item, id: `bell-${index}` })),
    SAMPLE_CIRCUITS.bell.qubits
  ).state;
  const half = 1 / Math.sqrt(2);
  [complex(half), complex(0), complex(0), complex(half)].forEach((value, index) => {
    assertComplexClose(bell[index], value, `Bell amplitude ${index}`);
  });

  const ghz = simulateCircuit(
    SAMPLE_CIRCUITS.ghz.gates.map((item, index) => ({ ...item, id: `ghz-${index}` })),
    SAMPLE_CIRCUITS.ghz.qubits
  ).state;
  ghz.forEach((value, index) => {
    assertComplexClose(value, index === 0 || index === 7 ? complex(half) : complex(0), `GHZ amplitude ${index}`);
  });
});

test('every sample stays normalized and its final matrix reproduces its state', () => {
  Object.entries(SAMPLE_CIRCUITS).forEach(([sampleId, sample]) => {
    const gates = sample.gates.map((item, index) => ({ ...item, id: `${sampleId}-${index}` }));
    const simulation = simulateCircuit(gates, sample.qubits);
    const probability = simulation.state.reduce((total, value) => total + magnitudeSquared(value), 0);
    assertClose(probability, 1, `${sampleId} probability`);
    assertUnitary(simulation.finalMatrix, `${sampleId} final matrix`);

    const initial = Array.from({ length: 2 ** sample.qubits }, (_, index) => index ? complex(0) : complex(1));
    const matrixState = applyMatrixToState(initial, simulation.finalMatrix, Array.from({ length: sample.qubits }, (_, index) => index), sample.qubits);
    simulation.state.forEach((value, index) => assertComplexClose(value, matrixState[index], `${sampleId} final state ${index}`));
  });
});

test('Bloch coordinates identify each qubit correctly', () => {
  assert.deepEqual(blochCoordinates([complex(1), complex(0), complex(0), complex(0)], 0), { x: 0, y: 0, z: 1, length: 1 });
  assert.deepEqual(blochCoordinates([complex(0), complex(0), complex(1), complex(0)], 0), { x: 0, y: 0, z: -1, length: 1 });
  assert.deepEqual(blochCoordinates([complex(0), complex(1), complex(0), complex(0)], 0), { x: 0, y: 0, z: 1, length: 1 });
  assert.deepEqual(blochCoordinates([complex(0), complex(1), complex(0), complex(0)], 1), { x: 0, y: 0, z: -1, length: 1 });

  const half = 1 / Math.sqrt(2);
  const plusOnQ0 = [complex(half), complex(0), complex(half), complex(0)];
  const plusCoordinates = blochCoordinates(plusOnQ0, 0);
  assertClose(plusCoordinates.x, 1);
  assertClose(plusCoordinates.y, 0);
  assertClose(plusCoordinates.z, 0);

  const plusIOnQ0 = [complex(half), complex(0), complex(0, half), complex(0)];
  assertClose(blochCoordinates(plusIOnQ0, 0).y, 1);

  const bell = [complex(half), complex(0), complex(0), complex(half)];
  assertClose(blochCoordinates(bell, 0).length, 0);
  assertClose(blochCoordinates(bell, 1).length, 0);
});

test('custom OpenQASM gate decompositions match the simulator matrices', () => {
  const angle = 0.713;
  const iswap = matrixForSequence([
    placed('s', 0, [0]), placed('s', 0, [1]),
    placed('swap', 1, [0, 1]), placed('cz', 2, [0, 1]),
  ]);
  assertMatrixClose(iswap, gate('iswap').matrix(), 'iSwap decomposition');

  const rzz = matrixForSequence([
    placed('cx', 0, [0, 1]), placed('rz', 1, [1], angle), placed('cx', 2, [0, 1]),
  ]);
  assertMatrixClose(rzz, gate('rzz').matrix(angle), 'Rzz decomposition');

  const rxx = matrixForSequence([
    placed('h', 0, [0]), placed('h', 0, [1]), placed('cx', 1, [0, 1]),
    placed('rz', 2, [1], angle), placed('cx', 3, [0, 1]),
    placed('h', 4, [0]), placed('h', 4, [1]),
  ]);
  assertMatrixClose(rxx, gate('rxx').matrix(angle), 'Rxx decomposition');

  const ryy = matrixForSequence([
    placed('rx', 0, [0], Math.PI / 2), placed('rx', 0, [1], Math.PI / 2),
    placed('cx', 1, [0, 1]), placed('rz', 2, [1], angle), placed('cx', 3, [0, 1]),
    placed('rx', 4, [0], -Math.PI / 2), placed('rx', 4, [1], -Math.PI / 2),
  ]);
  assertMatrixClose(ryy, gate('ryy').matrix(angle), 'Ryy decomposition');
});

test('OpenQASM output is ordered, complete, and defines non-standard gates', () => {
  const gates = [
    placed('h', 0, [0]), placed('cx', 1, [0, 1]), placed('sxdg', 2, [0]),
    placed('iswap', 3, [0, 1]), placed('rxx', 4, [0, 1], 0.25),
    placed('ryy', 5, [0, 1], -0.5), placed('rzz', 6, [0, 1], 0.75),
    placed('barrier', 7, [0]), placed('measure', 8, [0]),
  ];
  const qasm = toQasm(gates, 2);
  assert.match(qasm, /^OPENQASM 3\.0;\ninclude "stdgates\.inc";/);
  ['gate sxdg', 'gate iswap', 'gate rxx', 'gate ryy', 'gate rzz'].forEach((definition) => assert.match(qasm, new RegExp(definition)));
  assert.match(qasm, /rxx\(0\.250000\) q\[0\], q\[1\];/);
  assert.match(qasm, /ryy\(-0\.500000\) q\[0\], q\[1\];/);
  assert.match(qasm, /barrier q\[0\];/);
  assert.match(qasm, /c\[0\] = measure q\[0\];/);
  assert.ok(qasm.indexOf('h q[0];') < qasm.indexOf('cx q[0], q[1];'), 'instructions follow column order');

  const standardOnly = toQasm([placed('h', 0, [0]), placed('cx', 1, [0, 1])], 2);
  assert.doesNotMatch(standardOnly, /gate (sxdg|iswap|rxx|ryy|rzz)/);
});
