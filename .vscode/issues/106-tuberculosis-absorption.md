# Issue 106: M. tuberculosis Specific Absorption

## Problem
`MycobacteriumTuberculosis` punya dinding asam mikolat (lilin) yang memfilter molekul masuk. Mekanisme ini spesifik TB, tidak berlaku untuk sel lain.

## Proposal
`MycobacteriumTuberculosis` override `absorb()` dengan aturan sendiri:

- **Lipids** → dissolve langsung lewat mycolic acid layer (like dissolves like)
- **Non-lipids** → harus lewat porin channels (size exclusion)
- **Drug lipophilic** → tembus → bind RNA polymerase → inhibit transcription
- **Non-lipid nutrition** → gradual viability decline
