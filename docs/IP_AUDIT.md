# Q-Quest Intellectual Property and Source-Exposure Audit

**Audit date:** 21 November 2026  
**Baseline revision:** `72435e9`  
**Scope:** 175 tracked files at baseline, package manifests and lockfile, application routes, static assets, design/reference directories, Git history, ignore rules, and deployment-related configuration.

## Executive summary

Before this change, Q-Quest had no repository-level `LICENSE`, copyright file, notice file, third-party notice, package license field, or public copyright page. The README correctly stated that no open-source license had been declared, but it did not provide a complete proprietary license or permission process.

No evidence of a prior project-level open-source grant was found in the reachable repository history or current tracked files. Therefore, a prospective proprietary license can be added without silently replacing an identified license. This finding does not rule out permissions granted outside the repository or rights held by contributors or third parties.

The largest practical source-exposure issue is the public GitHub repository itself. Legal notices clarify permissions but cannot prevent copying, normal browser inspection, or independent development. Client-side code required for the interactive site is delivered to visitors by design.

## 1. Existing licensing and attribution findings

### Project-level status before remediation

- No `LICENSE`, `LICENSE.md`, `COPYRIGHT`, `NOTICE`, attribution file, or equivalent project-level legal text was present outside dependencies.
- `package.json` was already marked `"private": true` but did not declare an author, description, or license.
- The README stated that no open-source license had been declared and that public visibility did not grant reuse permission.
- No license badge or wording implying an MIT, Apache, GPL, Creative Commons, or other open-source project license was found.
- Git history contained no tags or formal release objects.

### Consequence

No earlier repository license was identified to preserve or analyze for irrevocable permissions. The new `LICENSE` applies prospectively to rights actually held by Akash Kishore and expressly preserves prior written permissions and third-party licenses. Any off-repository agreement, earlier distribution under different terms, employment/education ownership rule, co-authorship, or valid implied permission requires separate factual and legal review.

## 2. Dependency findings

The direct dependency set is recorded in `package.json`; resolved versions and declared license fields are in `package-lock.json`. Most direct dependencies use MIT terms. TypeScript uses Apache-2.0, JSZip offers MIT or GPL-3.0-or-later, and Q-Quest uses the MIT option.

GSAP and `@gsap/react` are the main non-standard item: the installed packages declare the [GSAP Standard License](https://gsap.com/standard-license/), not MIT. The deployment and any intended commercial use should be checked against the current GSAP terms.

The transitive lockfile contains packages with MIT, Apache-2.0, ISC, LGPL-3.0-or-later, MPL-2.0, CC-BY-4.0, BSD-3-Clause, 0BSD, Zlib, and compound declarations. No dependency was upgraded or removed during this work. See `THIRD_PARTY_NOTICES.md`.

## 3. Fonts, media, templates, and external content

### Loaded by the application

- The root layout loads Cabinet Grotesk and Satoshi from Fontshare.
- It loads JetBrains Mono, Outfit, Space Grotesk, Inter, Epilogue, and Material Symbols from Google Fonts.
- The research route displays RSS metadata and remote images from Beyond the Bit/Hashnode. That external publication content is not Q-Quest proprietary material.
- The live home and About pages use `public/images/akash-kishore-profile.jpg` and two local launch-pad images. Their source/creation evidence is not stored alongside them.

### Reference and development material

- `Designs/` and `temp_designs/` contain Google Stitch-style output, Google-hosted `aida-public` image references, CDN links, fonts, and a Transparent Textures reference.
- `Images/` contains files whose names indicate ChatGPT generation and Stitch screenshots, plus circuit and research imagery.
- `components/CardStack.tsx` references two Google-hosted `aida-public` images but is not imported by a current route.
- Default Next.js/Vercel-style SVGs remain under `public/` and appear unused.
- The origin of `app/favicon.ico` was not established.

These items are documented as third-party or unresolved-provenance material rather than claimed unconditionally. Before commercial reuse or redistribution, preserve provider terms, prompts, source files, photographer permissions, and creation/edit records, or replace uncertain assets with verified originals.

## 4. Git, GitHub, and deployment configuration

- The configured remote is the public GitHub URL `https://github.com/Akash-Kishore/Q-Quest.git`.
- The earliest reachable commit is `7c0cb8e`, dated 4 April 2026 and attributed to Akash Kishore.
- Git shortlog identified a single recorded author identity across 15 baseline commits. This is evidence, not conclusive proof.
- No `.github/workflows` directory, `vercel.json`, committed `.vercel` directory, or tracked build output was found.
- `.gitignore` excludes `.env*`, `.vercel`, `.next`, `out`, `build`, source-map build artifacts through ignored build directories, PEM files, logs, and generated Graphify/RAG data.
- Vercel/Next.js serves routes and files under `public`; repository-only documentation and design directories are not automatically public HTTP paths. They remain visible through the public GitHub repository.

## 5. Security and source-exposure findings

### Checks completed

- A pattern scan found no hardcoded API keys, passwords, private keys, or committed environment files in tracked application/configuration files.
- No application `process.env` or `NEXT_PUBLIC_*` variable is currently used.
- The only live external server request is the server-rendered Beyond the Bit RSS fetch; it uses no credential and fails closed to an empty state.
- Circuit drafts and theme preferences use browser `localStorage`; they contain user circuit/theme data, not authentication secrets.
- Static inline CSS passed through `dangerouslySetInnerHTML` on the landing/loading pages is repository-authored constant content, not user input.
- Quantum simulation and export logic intentionally execute in the browser. Moving them server-side would conflict with the product’s local-execution requirement and would not prevent client UI code inspection.

### Safe remediation applied

- `productionBrowserSourceMaps: false` explicitly preserves Next.js’s production default, preventing production browser source-map publication unless this setting is later changed.
- `poweredByHeader: false` removes the default `X-Powered-By` response header.
- The package remains `private`; `license: "UNLICENSED"`, author, and description metadata were added.
- A public `/copyright` route and footer notice provide a visible permission/reporting path without restricting legitimate visitors.

### Residual exposure

- All source and history in a public GitHub repository can be downloaded, forked, indexed, and inspected. Notices govern permission but are not access controls.
- Browser-delivered JavaScript and assets remain inspectable and reproducible at a technical level. Obfuscation and anti-developer-tools scripts were intentionally not introduced.
- Prototype, prompt, note, `.opencode`, and design directories are public in GitHub even though Vercel does not directly serve them.
- External font and image requests disclose visitor IP addresses and request metadata to those providers under their policies. Self-hosting verified, properly licensed assets would reduce that dependency but requires license/provenance review.

## 6. Changes implemented

- Added `LICENSE`, `COPYRIGHT.md`, `NOTICE.md`, and `THIRD_PARTY_NOTICES.md`.
- Added this audit, `docs/IP_POLICY.md`, and `docs/AUTHORSHIP_RECORD.md`.
- Replaced the README’s placeholder license section with a copyright/licensing section and links.
- Added package and site author/description metadata.
- Added a minimal linked footer notice and public `/copyright` page.
- Explicitly disabled production browser source maps and the framework-identifying response header.

## 7. Recommendations and unresolved questions

1. **Confirm asset provenance:** identify the photographer/permission for the profile photo; document generation/edit history for launch-pad and `Images/` assets; identify the favicon source.
2. **Review GSAP use:** confirm that the deployment and any future commercial activity comply with the GSAP Standard License in force for the relevant version and use case.
3. **Review Fontshare terms:** preserve the applicable license version for Cabinet Grotesk and Satoshi and confirm CDN/self-hosting rights for the production model.
4. **Decide repository visibility:** if source confidentiality is a priority, manually make the GitHub repository private after reviewing Vercel access, collaborators, forks, and any public links. Visibility changes cannot retract copies already obtained or permissions validly granted.
5. **Separate deploy inputs if desired:** keep reference/prototype materials in a private archival repository or documented artifact store if they are not needed for public collaboration. Move only after preserving history and provenance; no material was deleted in this change.
6. **Adopt contribution terms:** establish a contributor license agreement or signed contribution policy before accepting substantive outside code or content.
7. **Create release evidence:** use signed/annotated release tags and retain build/deployment identifiers, test results, permissions, and original source artifacts.
8. **Get qualified advice:** an Indian intellectual-property lawyer should review ownership, educational/employment context, external-service terms, contributor arrangements, commercial plans, trademark clearance for “Q-Quest,” and any potentially patentable invention before reliance or enforcement.

## 8. Legal limits

The Government of India’s [Copyright Handbook](https://copyright.gov.in/Documents/handbook.html) states that copyright is automatic, does not require formality, and protects expression rather than ideas. [WIPO](https://www.wipo.int/en/web/copyright/protection) similarly explains that copyright does not protect an underlying idea, method, process, or system. These notices do not register copyright, establish trademark or patent rights, prove ownership conclusively, or guarantee that misuse can be prevented.
