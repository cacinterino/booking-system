# Phase 0: AI-Accelerated Dev Setup

Do this before you scaffold anything. It costs an hour and pays it back many times over across
14 days of solo development. Updated for your actual stack: **OpenCode**, running **Nemotron 3**
and **DeepSeek** as the underlying models.

## 0.1 Development environment — OpenCode

[OpenCode](https://opencode.ai) is a terminal-based (also desktop app / IDE extension) open-source
coding agent that's model-agnostic — it'll happily drive Nemotron 3 or DeepSeek instead of a
hosted model, which is exactly your setup. It works directly in your repo, runs your build/test
commands, and supports MCP natively.

**Set this up first:**
1. Point OpenCode at your local/self-hosted endpoint. If you're serving Nemotron or DeepSeek via
   an OpenAI-compatible endpoint (Ollama, vLLM, LM Studio, etc.), set the `LOCAL_ENDPOINT`
   environment variable, or configure the model under `provider` in `opencode.json`.
2. Create an **`AGENTS.md`** at the repo root — this is OpenCode's equivalent of Claude Code's
   `CLAUDE.md`, read automatically every session. Put in it: the tech stack, folder structure,
   naming conventions (CQRS command naming, DTO suffixes), and "always write a test for the
   availability engine when touching it." Drop `PLAN_REVIEW_AND_IMPROVEMENTS.md` alongside it so
   the agent has the full context. This one file is the highest-leverage thing you can do.
3. Config lives in `opencode.json` (project root) or `~/.config/opencode/opencode.json` (global).
   Configs merge, not replace — global settings apply everywhere, project settings layer on top.
4. Work in small, reviewed chunks: scaffold → generate → run tests → commit. Don't let a single
   session generate more than one feature slice unreviewed — this matters more with open-weight
   models than with frontier models, since tool-calling reliability varies more by model.

## 0.2 MCP servers worth connecting

OpenCode supports both local (stdio) and remote (HTTP) MCP servers directly in `opencode.json`,
with per-agent enable/disable so you're not loading every tool into every session's context.
For this project, in priority order:

| MCP Server | What it buys you | When to connect |
|---|---|---|
| **GitHub** | Open PRs, read issues, check CI status without leaving the terminal | Day 1, right after `gh repo create` |
| **Postgres / database** | Inspect your actual schema and data instead of the model guessing column names — big win for the EF Core migration + availability engine work | Day 3, once the DB is running |
| **Filesystem** | Local file read/write — built into OpenCode already | Automatic |
| **Playwright** | Drive a real browser to write and debug your Phase 7.3 E2E tests (book → confirm → cancel) against the actual running app | Week 2, once the booking wizard is functional |
| **Context7** | Pulls current, version-correct docs for fast-moving libraries (Tailwind v4, EF Core 9, PayMongo API) straight into context — genuinely useful with open-weight models, whose training data can be older | As needed |
| **Trello** (or your PM tool) | Update your Trello board from the agent instead of switching tabs — optional, the board file works fine manually too | Optional |

Example `opencode.json` snippet for a local MCP server:
```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "github": { "type": "local", "command": ["npx", "-y", "@modelcontextprotocol/server-github"] },
    "postgres": { "type": "local", "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"] }
  }
}
```
You don't need all of these on day one — GitHub + Postgres cover most of the day-to-day value.
Add Playwright and Context7 once you're past scaffolding.

## 0.3 Design/frontend "taste" skills — free and open source

OpenCode has native support for **Agent Skills** (a `skills/` folder alongside `agents/`,
`commands/`, etc. in its config directories), and the two most-used design skill packs both
explicitly support OpenCode. These matter for Phase 4 (React client) — they stop the agent from
defaulting to the generic "Inter font + purple gradient + nested cards" look every model
produces without guidance.

| Skill | What it does | Install |
|---|---|---|
| **[Impeccable](https://impeccable.style)** | The most widely adopted design skill pack — 23 invocable commands (`/audit`, `/polish`, `/normalize`), a 60-rule deterministic "AI slop" detector, and a `PRODUCT.md`/`DESIGN.md` system that scans your actual Tailwind config and components so it works *with* your existing design system rather than inventing a new one each session. Free, open source (Apache 2.0). Explicitly supports OpenCode. | `npx impeccable install`, then `/impeccable init` inside OpenCode |
| **[Taste Skill](https://www.tasteskill.dev)** | Lighter-weight, more dial-driven — numeric controls like `DESIGN_VARIANCE` and `TYPOGRAPHY_QUALITY` instead of a full workflow. Good if you want fine control without loading a whole system. Also has a GSAP-animation-focused variant. Free, open source. | `npx skills add https://github.com/tasteskill/tasteskill` |

**Recommendation for this project:** install Impeccable before Phase 4. Run `/impeccable init`
once your Tailwind config exists so it learns your tokens, then use `/impeccable audit` on the
booking wizard and staff calendar before you consider the frontend "done" — that's the pass that
catches the generic-SaaS-template look and pushes it toward something that reads as intentional
in a portfolio review.

## 0.4 Where AI genuinely speeds this specific project up

Being concrete about *where*, not just *that*, AI helps — this is also good material for your
case study's "how I worked" section:

- **Boilerplate layers** (Domain entities, EF configurations, MediatR command/handler pairs,
  Mapster profiles): high AI leverage, low risk. Generate, skim, commit.
- **The availability engine**: medium leverage. Good for drafting the algorithm shape and edge
  cases (overrides, timezone conversion, double-booking) — but read every line here, this is the
  one piece of logic you should be able to explain in an interview without notes.
- **React feature scaffolding** (forms, TanStack Query hooks, route wiring): high leverage, this
  is where an agentic tool with filesystem + Playwright access saves the most real time, since it
  can write the component *and* verify it renders correctly in a real browser.
- **CI/CD YAML, Dockerfiles, docs**: high leverage, low risk, exactly the kind of thing worth
  fully delegating.
- **Auth/security code**: low leverage — write and review this yourself line by line, or at
  minimum treat AI output here as a first draft that needs a real security pass, not a final
  answer. Open-weight models are no exception here — if anything, verify more, not less.

## 0.5 A note on open-weight models specifically

Nemotron 3 and DeepSeek are strong models, but two things are worth checking early rather than
discovering mid-sprint:

- **Tool-calling reliability.** MCP leans on the model reliably emitting well-formed tool calls.
  Run a throwaway task (e.g. "list open issues via the GitHub MCP server") on day one and confirm
  it works cleanly before you build a workflow that depends on it.
- **Context window budget.** If you're self-hosting, check your actual served context length —
  it's sometimes lower than the model's advertised max depending on how it's deployed. This
  affects how much of `AGENTS.md` + MCP tool schemas + the plan you can keep resident at once.

## 0.6 Fast setup checklist

- [ ] Install OpenCode and point it at your Nemotron/DeepSeek endpoint
- [ ] Add `AGENTS.md` to repo root with stack, structure, and conventions
- [ ] Test tool-calling reliability with a throwaway MCP task
- [ ] Connect GitHub MCP
- [ ] Connect Postgres MCP once `docker compose up` is running
- [ ] Connect Playwright MCP before starting Phase 7.3
- [ ] Install Impeccable (`npx impeccable install` → `/impeccable init`) before Phase 4
- [ ] Keep sessions scoped to one feature slice at a time; commit after each
