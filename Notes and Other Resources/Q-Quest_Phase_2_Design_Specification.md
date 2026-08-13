
# Q-Quest Phase 2 — Interactive Quantum Circuit Simulator
## Product Design Specification (v1.0)

> **Status:** Design Specification  
> **Project:** Q-Quest  
> **Phase:** 2 – Interactive Quantum Simulator & Learning Environment

---

# Vision

Q-Quest is not intended to be another quantum circuit editor.

Its objective is to become the **most intuitive educational quantum development environment**, combining the familiarity of IBM Quantum Composer with interactive visualization, guided learning, mascot-driven AI tutoring, mathematical transparency, and professional project management.

The experience should feel like:

- IBM Quantum Composer (professional workflow)
- 3Blue1Brown (visual intuition)
- Desmos (interactive mathematics)
- Figma (polished UX)
- Duolingo (guided learning)
- VS Code (developer workflow)

---

# Design Goals

The simulator must answer four questions after every gate:

1. What gate was applied?
2. What changed in the quantum state?
3. Why did the mathematics change?
4. What is the physical intuition behind the change?

Every component updates simultaneously.

---

# Simulator Scope

- Maximum qubits: **4**
- Pure State Simulator
- OpenQASM 2.0
- Browser-based simulation
- Educational focus
- Real-time visualization

---

# Workspace Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Navbar                                                       │
├──────────────┬──────────────────────────┬────────────────────┤
│ Gate Library │ Circuit Builder          │ OpenQASM           │
├──────────────┴──────────────────────────┴────────────────────┤
│ Bloch Spheres               Probability Histogram            │
├──────────────────────────────────────────────────────────────┤
│ Scroll ↓                                                │
├──────────────────────────────────────────────────────────────┤
│ Linear Algebra Explorer                                  │
├──────────────────────────────────────────────────────────────┤
│ Mascot Guided Explanation                               │
└──────────────────────────────────────────────────────────────┘
```

---

# Feature Modules

## 1. Navigation

- Project name
- New/Open/Save
- Save As
- Export
- Undo/Redo
- Theme
- Settings

## 2. Gate Library

Categories:

- Identity
- Pauli (X,Y,Z)
- Hadamard
- Phase (S,T,S†,T†)
- Rotations (Rx,Ry,Rz)
- Controlled (CX,CY,CZ,SWAP,CCX)
- Measurement
- Reset
- Barrier

Each gate contains:

- Symbol
- Name
- Matrix
- Description
- Tooltip
- Keyboard shortcut

---

## 3. Circuit Builder

Supports:

- 4 quantum wires
- Drag & Drop
- Move
- Delete
- Undo
- Redo
- Zoom
- Pan
- Gate editing
- Parameter editing
- Multi-selection

---

## 4. OpenQASM Panel

Real-time generation.

Functions:

- Syntax highlighting
- Copy
- Download
- Future edit mode

---

## 5. Bloch Sphere Panel

One Bloch sphere per qubit.

Capabilities:

- Rotation animation
- Axis labels
- Phase
- Rotation trail
- Previous state ghost
- Entanglement indicator

---

## 6. Probability Histogram

Displays all 16 computational basis states.

Modes:

- Probability
- Measurement counts
- State amplitudes

---

## 7. Linear Algebra Explorer

One expandable card per gate.

Each card contains:

1. Current state vector
2. Applied gate matrix
3. Tensor expansion (when applicable)
4. Matrix multiplication
5. Updated state vector
6. Probability update
7. Physical interpretation
8. Beginner explanation
9. Advanced explanation

Cards are synchronized with the circuit.

---

# Synchronization

Selecting any gate updates:

- Circuit highlight
- Bloch spheres
- Histogram
- OpenQASM
- Linear Algebra
- Timeline
- AI explanation

---

# Timeline

Every gate becomes a checkpoint.

Selecting any checkpoint restores that simulator state.

---

# Save & Export System

## Save Project (.qqp)

Contains:

- circuit.json
- circuit.qasm
- metadata.json
- circuit_snapshot.png
- preview.png

## Export Options

- .qqp
- .png
- .qasm
- .json
- PDF Report

## Auto Save

Status:

- Saved
- Unsaved Changes

---

# PDF Report

Includes:

- Circuit image
- OpenQASM
- State evolution
- Matrix derivations
- Bloch sphere snapshots
- Histogram
- Metadata

---

# Mascot-Driven AI Learning System

## Core Philosophy

The user never interacts directly with Gemini.

Instead:

> **The mascots are the teachers. Gemini is their intelligence engine.**

---

## Nova — Quantum Guide

Responsibilities:

- Superposition
- Measurement
- Entanglement
- Intuition
- Guided lessons
- Beginner explanations

Example:

> "Great! Your Hadamard gate has placed the qubit into superposition."

---

## Pixel — Circuit Engineer

Responsibilities:

- Circuit construction
- Debugging
- Gate optimization
- OpenQASM explanation
- Performance suggestions

---

## Orbit — Mathematics Expert

Responsibilities:

- Linear algebra
- Matrix multiplication
- Tensor products
- State vectors
- Unitary operations

---

## Echo (Future)

Responsibilities:

- History
- Algorithms
- Research
- Applications

---

# Guided Walkthrough Mode

The mascots teach interactively.

Example:

Nova:
> "Let's build our first Bell State."

Highlights the H gate.

User clicks.

Orbit automatically explains the matrix multiplication.

Pixel explains why CNOT creates entanglement.

Every lesson is fully interactive.

---

# AI Modes

- Ask Nova
- Ask Pixel
- Ask Orbit

Gemini receives:

- Circuit
- OpenQASM
- State vector
- Current lesson
- User level
- Selected gate

The response is rewritten in the chosen mascot's personality before display.

---

# Adaptive Learning Levels

## Beginner

Simple analogies.

## Intermediate

Quantum intuition + mathematics.

## Advanced

Formal linear algebra and quantum mechanics.

---

# Future Lessons

- Single-qubit gates
- Bell States
- Deutsch Algorithm
- Grover Search
- Quantum Fourier Transform
- Teleportation
- Error Correction

---

# Technical Stack

| Layer | Technology |
|--------|------------|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| 3D | React Three Fiber |
| Animation | Framer Motion |
| Circuit | SVG / React Flow |
| Math | KaTeX / MathJax |
| Code Editor | Monaco |
| Charts | Recharts / D3 |
| Export | jsPDF |
| Simulator | Custom 4-Qubit State Vector Engine |

---

# Product Vision

Q-Quest should feel less like a simulator and more like a **living quantum classroom**.

Every interaction should synchronize:

- Circuit
- OpenQASM
- Bloch spheres
- Probability histogram
- Linear algebra
- State evolution
- Mascot explanations

This synchronization is the defining feature of the platform and the primary differentiator from existing quantum circuit editors.
