# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Akos AI MES** — An AI-specialized Smart Factory Manufacturing Execution System being developed for 주식회사 아코스 (Akos Corp). The project is in early planning stage; no application source code exists yet.

The primary planning document is:
- `[사업계획서] 제조AI특화 스마트공장 사업계획서_주식회사 아코스_완성_JH Updated.pdf` — Korean business plan for the AI-specialized smart factory system.

## Project Status

- **Phase:** Planning (PDCA Phase 1)
- **Level:** Dynamic (fullstack with backend)
- **Language:** Korean business context; development language TBD

## Claude Code Framework

This project uses the **bkit** framework for structured development:
- `.bkit/` — agent orchestration state
- `.claude/` — Claude Code settings and permissions
- `.omc/` — OMC mission tracking state
- `docs/` — PDCA status and session memory

When starting work, check `docs/.pdca-status.json` for current PDCA phase and `docs/.bkit-memory.json` for session context.

## Development Conventions (to be established)

As implementation begins, update this file with:
- Build, lint, and test commands
- Technology stack choices (frontend framework, backend language, database)
- API design conventions
- Directory structure
