# Q-Quest Third-Party Notices

This file records third-party material identifiable in the repository as reviewed on 21 November 2026. It is an attribution and audit aid, not a substitute for the complete upstream license texts. Third-party material remains owned by its respective rights holders and is excluded from the Q-Quest proprietary claim.

## Direct JavaScript dependencies

Versions below are resolved in `package-lock.json`. The lockfile is the authoritative dependency inventory for this revision.

| Component | Resolved version | Declared license / terms |
| --- | ---: | --- |
| `@gsap/react` | 2.1.2 | [GSAP Standard License](https://gsap.com/standard-license/) |
| `@tailwindcss/postcss` | 4.3.3 | MIT |
| `@types/three` | 0.185.4 | MIT |
| `framer-motion` | 13.0.0 | MIT |
| `gsap` | 3.15.0 | [GSAP Standard “no charge” license](https://gsap.com/standard-license/) |
| `jszip` | 3.10.2 | MIT OR GPL-3.0-or-later; Q-Quest uses it under the MIT option |
| `lenis` | 1.3.26 | MIT |
| `next` | 16.4.6 | MIT |
| `react` | 19.2.8 | MIT |
| `react-dom` | 19.2.8 | MIT |
| `three` | 0.185.1 | MIT |
| `@types/node` | 20.19.43 | MIT |
| `@types/react` | 19.2.18 | MIT |
| `@types/react-dom` | 19.2.4 | MIT |
| `autoprefixer` | 10.5.4 | MIT |
| `oxlint` | 1.94.0 | MIT |
| `postcss` | 8.5.26 | MIT |
| `tailwindcss` | 4.3.3 | MIT |
| `typescript` | 5.9.3 | Apache-2.0 |

The installed dependency graph also contains transitive packages under MIT, Apache-2.0, ISC, LGPL-3.0-or-later, MPL-2.0, BSD-3-Clause, 0BSD, CC-BY-4.0, Zlib, and compound license expressions. Their exact versions and declared license fields are recorded in `package-lock.json` and their full license texts are distributed in their installed package directories after `npm ci`. A release that redistributes dependency source or binaries should generate and review a complete software bill of materials and bundled notices for that release.

**Important compatibility item:** GSAP is not declared MIT in this installation. Its Standard License must be reviewed for the actual deployment and any future commercial use. The Q-Quest proprietary license does not replace or narrow GSAP’s terms.

## Web fonts and symbols

The root layout loads fonts from third-party CDNs rather than storing font files in this repository:

- Cabinet Grotesk and Satoshi are served by [Fontshare](https://www.fontshare.com/) and remain subject to Fontshare’s applicable font license and service terms.
- JetBrains Mono, Outfit, Space Grotesk, Inter, and Epilogue are served through [Google Fonts](https://fonts.google.com/) and remain subject to their upstream font licenses.
- Material Symbols is served through Google Fonts and is distributed upstream under the Apache License 2.0. See the [Material Symbols repository](https://github.com/google/material-design-icons).

Do not redistribute font files or self-host them without preserving the applicable license text and confirming that the chosen license permits the intended distribution.

## External publication content and images

The `/sandbox/research` route retrieves titles, descriptions, categories, dates, links, and image URLs from the [Beyond the Bit](https://beyond-the-bit.hashnode.dev/) RSS feed hosted by Hashnode. That publication content and its images retain their applicable rights. Q-Quest does not claim them as proprietary project content.

`components/CardStack.tsx` and several files under `Designs/` and `temp_designs/` reference Google-hosted `aida-public` images. Those assets are third-party or service-generated reference material with provenance and reuse terms not established in the repository. The component is not imported by a current application route, but the references remain in source and must not be treated as owner-created assets without further evidence.

Prototype HTML under `Designs/` and `temp_designs/` also references:

- Google Stitch assets and generated design output;
- the `natural-paper.png` texture from [Transparent Textures](https://www.transparenttextures.com/);
- CDN copies of Tailwind CSS and Three.js; and
- Google Fonts and Fontshare resources.

These prototype/reference materials are excluded from the proprietary claim unless authorship and license evidence establishes otherwise.

## Repository images and starter assets requiring provenance records

- `public/images/akash-kishore-profile.jpg`: used publicly; confirm the photographer, subject consent, and usage authorization, and retain the original evidence.
- `public/images/launchpad/*.png` and `Images/*.png`: several filenames indicate ChatGPT or Google Stitch generation/reference workflows. Retain prompts, service terms in effect on the creation date, source files, and edit history. Do not make an unqualified exclusive-ownership claim until provenance is confirmed.
- `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, and `public/window.svg`: appear to be Next.js starter/framework assets. They are currently unused by application routes and are not claimed as original Q-Quest artwork. Next.js is MIT-licensed; names and logos may also be subject to trademark rules.
- `app/favicon.ico`: provenance was not established during this audit and should be documented.

## Reporting an omission

If a required attribution or license has been omitted, email [dsce.akashkishore@gmail.com](mailto:dsce.akashkishore@gmail.com) with the file, upstream source, and supporting license information. The project should correct verified omissions without removing valid third-party notices.
