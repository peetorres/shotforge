# Changelog

All notable changes to Shotforge are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [0.2.0] - Unreleased

### Added
- Canonical documentation system (14 documents)
- SYSTEM_START_HERE.md — entry point for all agents/developers
- Product truth system (SHOTFORGE_CANON.md) with 30+ business rules
- Formal state machine (STATE_MACHINE.md) with 20+ states
- API contracts for all 4 endpoints
- Design system with semantic tokens
- Persistence and restore architecture
- Test strategy with layered approach
- 10 formal regression guards
- Known failures registry
- Decision log (10 decisions recorded)
- Execution protocol for consistent development
- Implementation roadmap (10 phases)

### Changed
- Complete architectural redesign: flat slides[] → variant-aware Record<VariantId, Variant>
- New 4-step flow: Create → Generate → Choose → Refine (was: Brand → Upload → Builder)

### Removed
- V1 builder architecture (3-panel editor)
- V1 wizard (2-step brand + upload)

## [0.1.0] - 2026-03-22

### Added
- Initial V1 prototype
- 3-panel builder (slides, canvas, inspector)
- Hero, feature-single, feature-dual slide types
- AI copy generation via Claude Haiku
- Live preview with debounced rendering
- ZIP export for 6.7" and 6.1" sizes
- @appforge/screenshot-gen rendering engine
