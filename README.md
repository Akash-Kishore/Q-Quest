# Q-QUEST

**Quantum computing, made visible.**

Q-QUEST is an interactive, beginner-friendly quantum computing learning environment. It pairs a visually rich, animated website with a browser-based quantum circuit workbench so learners can explore gates, circuits, state vectors, probabilities, and the mathematics behind quantum operations.

> **Project status:** Actively developed. This README describes features present in the repository; additional ideas in the design specifications are not necessarily implemented.

## Explore the application

| Route | What you'll find |
| --- | --- |
| `/` | Cinematic landing experience |
| `/loading` | Animated transition into the main site |
| `/home` | Interactive homepage, 3D visuals, and exploration links |
| `/sandbox/circuit` | Quantum circuit builder and simulator |
| `/sandbox/research` | Quantum learning resources sourced from *Beyond the Bit* |
| `/about` | Project and creator information |
| `/website-resources` | Links to the project source |

## Current features

### Quantum circuit playground
- Place gates into an editable multi-qubit circuit using the gate library and canvas.
- Explore essential, phase, rotation, controlled, interaction, and utility operations.
- Run local state-vector simulation and sample measurement outcomes.
- Inspect a selected qubit's Bloch-vector coordinates, measurement probabilities, gate matrices, and circuit evolution.
- Generate and copy OpenQASM 3 text from a circuit.
- Use sample circuits, the guided interface tour, and editing controls.
- Save circuit drafts in the browser and export/import portable JSON files.

The simulator is educational software running in the browser, **not a connection to a physical quantum processor**. It should not be represented as a general-purpose or noise-aware quantum computer.

### Website and learning resources
- Cinematic transitions, scrolling interactions, 3D scenes, and motion effects.
- Responsive pages and a configurable theme in supported sections.
- Research resources that retrieve recent posts from the [Beyond the Bit](https://beyond-the-bit.hashnode.dev/) RSS feed. Feed availability and external images depend on the external source.
- An About page and links to the source repository.

## Tech stack

| Area | Technology |
| --- | --- |
| Application | Next.js 16 (App Router), React 19, TypeScript |
| Styles | Tailwind CSS, CSS Modules |
| Motion | GSAP, Framer Motion, Lenis |
| 3D | Three.js |
| Quantum logic | Custom TypeScript state-vector simulation |
| Quality checks | TypeScript, oxlint, Node.js test runner |
| Package manager | npm (`package-lock.json`) |

The repository does not currently declare a database or external authentication service in `package.json`. Browser-saved circuits remain local to that browser unless exported.

## Getting started

### Prerequisites
- Node.js compatible with the installed Next.js 16 release (Node.js 20.9+)
- npm

### Installation

```bash
git clone https://github.com/Akash-Kishore/Q-Quest.git
cd Q-Quest
npm ci
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

### Quality checks

```bash
npm run typecheck
npm run lint
npm run test:quantum
```

These commands are defined in `package.json`. The test command uses Node's TypeScript stripping support; use a recent compatible Node.js release. A successful build and passing tests should be verified before publishing a deployment.

## Repository map

```text
app/
  page.tsx                 # Landing page
  loading/                 # Animated loading experience
  home/                    # Homepage and interactive scenes
  sandbox/
    circuit/
      CircuitComposer.tsx  # Circuit workbench UI
      quantum.ts           # Quantum operations / simulation
      quantum.test.ts      # Simulator tests
    research/              # Learning resource feed
  about/                   # Project / creator
  website-resources/       # Source links
components/                # Shared UI and visual components
public/                    # Static assets
Designs/                   # Design references
Images/                    # Design imagery
Notes and Other Resources/ # Project planning and specifications
```

The `Prompts/` and `temp_designs/` directories contain development/design material and are not required as application routes.

## Deployment

**Recommended for this Next.js app: [Vercel](https://vercel.com/new)**, which supports Next.js, server-side rendering/revalidation, and GitHub-based automatic deployments.

1. Sign in to Vercel with GitHub.
2. Import [Akash-Kishore/Q-Quest](https://github.com/Akash-Kishore/Q-Quest).
3. Choose the `main` branch and the repository root (`./`).
4. Keep the automatically detected **Next.js** framework preset.
5. Use the default build settings (`npm run build`) and deploy.
6. After deployment, verify the landing page, circuit workbench, and RSS-backed research section.

The research route uses Next.js server-side data fetching with revalidation, so **do not switch to a static export without checking that feature**. Vercel's Hobby plan is free for qualifying **personal, non-commercial** projects, subject to usage limits. Other use cases may need a different plan or host.

No site URL is claimed here until a deployment has actually succeeded.

## Development notes

- The circuit simulator is implemented in `app/sandbox/circuit/quantum.ts`; its tests live alongside it.
- The research feed relies on the external Beyond the Bit RSS endpoint. If that source cannot be fetched, the UI falls back to a publication link.
- `next.config.ts` includes image-host allowlisting for remote imagery and a local development origin.
- Protect secrets: use environment variables for future integrations and never commit `.env` credentials.
- The Phase 2 document under `Notes and Other Resources/` is a **design roadmap**, not a guarantee that AI tutors, cloud persistence, or every proposed export format is already available.

## Contributing

Issues and pull requests are welcome. For a code change, create a branch, keep the change focused, and run the quality checks above before submitting a PR. Explain any impact on simulator correctness, accessibility, or performance.

## License

**No open-source license has been declared in this repository.** Public GitHub visibility does not itself grant permission to reuse or redistribute the code. A license can be added by the project owner when ready.

## Creator

Developed by [Akash Kishore](https://github.com/Akash-Kishore).

- [Beyond the Bit](https://beyond-the-bit.hashnode.dev/)
- [LinkedIn](https://www.linkedin.com/in/akashkishore/)

---

*Q-QUEST — learn quantum computing by seeing, building, and experimenting.*
