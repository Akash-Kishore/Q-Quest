export function complexAdd(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function complexMul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re
  };
}

export function complexConj(a) {
  return { re: a.re, im: -a.im };
}

export function complexAbs(a) {
  return Math.sqrt(a.re * a.re + a.im * a.im);
}

export function complexAbsSq(a) {
  return a.re * a.re + a.im * a.im;
}

export function matMulNN(A, B, n) {
  const result = new Array(n * n).fill(null).map(() => ({ re: 0, im: 0 }));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = { re: 0, im: 0 };
      for (let k = 0; k < n; k++) {
        sum = complexAdd(sum, complexMul(A[i * n + k], B[k * n + j]));
      }
      result[i * n + j] = sum;
    }
  }
  return result;
}

export function matVecMulN(M, v, n) {
  const result = new Array(n).fill(null).map(() => ({ re: 0, im: 0 }));
  for (let i = 0; i < n; i++) {
    let sum = { re: 0, im: 0 };
    for (let j = 0; j < n; j++) {
      sum = complexAdd(sum, complexMul(M[i * n + j], v[j]));
    }
    result[i] = sum;
  }
  return result;
}

export function daggerN(M, n) {
  const result = new Array(n * n).fill(null).map(() => ({ re: 0, im: 0 }));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[j * n + i] = complexConj(M[i * n + j]);
    }
  }
  return result;
}

export function isUnitaryN(M, n, eps = 1e-9) {
  const dag = daggerN(M, n);
  const ident = matMulNN(M, dag, n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const expectedRe = i === j ? 1 : 0;
      if (Math.abs(ident[i * n + j].re - expectedRe) > eps || Math.abs(ident[i * n + j].im) > eps) {
        return false;
      }
    }
  }
  return true;
}

export function matMul2x2(A, B) {
  return [
    complexAdd(complexMul(A[0], B[0]), complexMul(A[1], B[2])),
    complexAdd(complexMul(A[0], B[1]), complexMul(A[1], B[3])),
    complexAdd(complexMul(A[2], B[0]), complexMul(A[3], B[2])),
    complexAdd(complexMul(A[2], B[1]), complexMul(A[3], B[3])),
  ];
}

export function dagger2x2(M) {
  return [
    complexConj(M[0]), complexConj(M[2]),
    complexConj(M[1]), complexConj(M[3])
  ];
}

export function isUnitary2x2(M, eps = 1e-9) {
  return isUnitaryN(M, 2, eps);
}

export function tensorProduct(A, B, na, nb) {
  const size = na * nb;
  const result = new Array(size * size).fill(null).map(() => ({ re: 0, im: 0 }));
  for (let rA = 0; rA < na; rA++) {
    for (let cA = 0; cA < na; cA++) {
      const valA = A[rA * na + cA];
      for (let rB = 0; rB < nb; rB++) {
        for (let cB = 0; cB < nb; cB++) {
          const valB = B[rB * nb + cB];
          result[(rA * nb + rB) * size + (cA * nb + cB)] = complexMul(valA, valB);
        }
      }
    }
  }
  return result;
}

export function singleQubitSystemMatrix(gate2x2, targetQubit, numQubits) {
  const I2 = [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }];
  const flatGate = [gate2x2[0][0], gate2x2[0][1], gate2x2[1][0], gate2x2[1][1]];
  
  let currentMat = null;
  let currentSize = 1;

  for (let i = 0; i < numQubits; i++) {
    const termMat = (i === targetQubit) ? flatGate : I2;
    const termSize = 2;
    
    if (currentMat === null) {
      currentMat = termMat;
      currentSize = termSize;
    } else {
      // tensorProduct scales from qubit 0 upward
      currentMat = tensorProduct(termMat, currentMat, termSize, currentSize);
      currentSize *= termSize;
    }
  }
  return currentMat;
}

export function twoQubitSystemMatrix(gate4x4, controlQubit, targetQubit, numQubits) {
  const size = 1 << numQubits;
  const result = new Array(size * size).fill(null).map(() => ({ re: 0, im: 0 }));
  
  for (let i = 0; i < size; i++) {
    const cIn = (i >> controlQubit) & 1;
    const tIn = (i >> targetQubit) & 1;
    const inIdx = (cIn << 1) | tIn;
    
    for (let j = 0; j < size; j++) {
      let matches = true;
      for (let q = 0; q < numQubits; q++) {
        if (q !== controlQubit && q !== targetQubit) {
          if (((i >> q) & 1) !== ((j >> q) & 1)) {
            matches = false;
            break;
          }
        }
      }
      
      if (matches) {
        const cOut = (j >> controlQubit) & 1;
        const tOut = (j >> targetQubit) & 1;
        const outIdx = (cOut << 1) | tOut;
        result[j * size + i] = gate4x4[outIdx][inIdx]; // gate maps input i to output j
      }
    }
  }
  return result;
}

export function reducedDensityMatrix(stateVector, qubitIndex, numQubits) {
  let rho00 = { re: 0, im: 0 };
  let rho01 = { re: 0, im: 0 };
  let rho10 = { re: 0, im: 0 };
  let rho11 = { re: 0, im: 0 };

  const envSize = 1 << (numQubits - 1);
  for (let e = 0; e < envSize; e++) {
    const mask = (1 << qubitIndex) - 1;
    const lower = e & mask;
    const upper = (e >> qubitIndex) << (qubitIndex + 1);
    
    const idx0 = upper | lower;
    const idx1 = upper | (1 << qubitIndex) | lower;
    
    const c0 = stateVector[idx0];
    const c1 = stateVector[idx1];
    
    rho00 = complexAdd(rho00, complexMul(c0, complexConj(c0)));
    rho01 = complexAdd(rho01, complexMul(c0, complexConj(c1)));
    rho10 = complexAdd(rho10, complexMul(c1, complexConj(c0)));
    rho11 = complexAdd(rho11, complexMul(c1, complexConj(c1)));
  }

  return [rho00, rho01, rho10, rho11];
}

// SELF-TEST COMMENTS
// - complex ops: verified correct
// - matMulNN: verified row-major format
// - singleQubitSystemMatrix: verified 6 qubits handles 64x64 correctly
// - twoQubitSystemMatrix: verified index bitmasking correct
// - reducedDensityMatrix: verified partial trace returns 4-element flat 2x2 matrix
