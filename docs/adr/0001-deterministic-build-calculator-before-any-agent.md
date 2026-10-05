# 1. Deterministic build calculator before any agent

Date: 2026-10-05

## Status

Accepted

## Context

The fork exists to add an inventory-aware build advisor. The owner considered
making the first version an in-product Claude agent that recommends builds.
Choosing the best eight of several hundred owned mods is arithmetic and search,
which a language model does unreliably, and its knowledge of exact game numbers
goes stale with each game update. An agent also adds an API key, per-use cost,
latency and behaviour unit tests cannot pin down.

## Decision

The first version is pure, tested logic in `services/buildAdvisor`: a stat
parser, a calculator and a build search. It returns plain structured data (the
mods, the computed stats, each mod's share of the damage, and what was not
modelled) so an agent can later call it as a tool and explain or steer the
result. No agent is built yet.

## Consequences

- Recommendations can be checked against the in-game arsenal before anyone
  relies on them.
- Fuzzy goals ("a status primer for Steel Path") are out of reach until an agent
  or weighting layer is added on top.
- The Builds view calls the advisor over IPC (`ipc/buildAdvisorIpc.ts`) and
  only displays what it returns; no build logic lives in the renderer.
