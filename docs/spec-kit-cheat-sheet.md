# Spec Kit Cheat Sheet

Quick reference for the Spec Kit command set and how to drive it from OpenCode.
Skills live in `.claude/skills/` and auto-load — invoke one by typing its name
(give the feature/input alongside it).

## Core pipeline (the main cycle)

| Command | What it does | Output |
|---------|--------------|--------|
| `speckit-specify` | Turn a plain-English feature description into a structured WHAT/WHY spec. Makes informed guesses, documents assumptions, flags only genuinely forking decisions. | `specs/NNN-feature/spec.md` + `checklists/requirements.md` |
| `speckit-clarify` | Resolves the open questions the spec flagged (max 3, picked by impact: scope > security > UX > tech). | Answers merged back into `spec.md` |
| `speckit-plan` | Designs the spec: records the stack/API decisions and any departures from the design. | `plan.md` + design artifacts |
| `speckit-tasks` | Turns the plan into a dependency-ordered, work-tracked task list. | `tasks.md` (T0xx) |
| `speckit-implement` | Executes the tasks in order, writing code and running tests. | Working, tested feature |

## Quality gates (optional, any time)

| Command | What it does |
|---------|--------------|
| `speckit-analyze` | Non-destructive consistency check across spec, plan, and tasks. |
| `speckit-checklist` | Builds a test/acceptance checklist tailored to the current work. |
| `speckit-taskstoissues` | Converts `tasks.md` into dependency-ordered GitHub issues (needs `gh`). |

## Project scaffolding & git

| Command | What it does | Status here |
|---------|--------------|-------------|
| `speckit-constitution` | Creates/updates the project principles, keeps dependent templates in sync. | One-time setup |
| `speckit-git-initialize` | Git init for a new repo. | Bootstrap only |
| `speckit-git-feature` | Creates a feature branch. | **Disabled** — trunk-based on `main` |
| `speckit-git-commit` | Auto-commits at each stage (wired as hooks). Staged explicitly, never `git add -A`. | Active |
| `speckit-git-validate` | Checks the branch follows the naming convention. | Inactive on `main` |

## How to invoke

- **By name:** type the skill name plus your feature, e.g. `use speckit-specify for X`.
- **Chain:** name the sequence, e.g. `speckit-specify, then clarify, plan, tasks, implement` — pauses at each gate for your input.

---

## Replicating Spec Kit on a personal project

The whole machinery lives in two directories. To use Spec Kit elsewhere, bring
these across (keep paths identical):

### Required — the skills that OpenCode auto-loads

`.claude/skills/` — one `SKILL.md` per command. Copy every folder as-is:

```
.claude/skills/
├── speckit-specify/SKILL.md
├── speckit-clarify/SKILL.md
├── speckit-plan/SKILL.md
├── speckit-tasks/SKILL.md
├── speckit-implement/SKILL.md
├── speckit-analyze/SKILL.md
├── speckit-checklist/SKILL.md
├── speckit-taskstoissues/SKILL.md
├── speckit-constitution/SKILL.md
├── speckit-git-commit/SKILL.md
├── speckit-git-feature/SKILL.md
├── speckit-git-initialize/SKILL.md
├── speckit-git-remote/SKILL.md
└── speckit-git-validate/SKILL.md
```

`*SKILL.md` generated from the templates/commands in the spec-kit tool — no
hand-editing needed.

### Required — the config + engine

```
.specify/
├── init-options.json        → ai, branch_numbering, context_file, integration, script, version
├── extensions.yml           # hook wiring (git branch/commit), auto_execute_hooks
├── feature.json             # points to the active feat/ dir (created at first invoke)
├── integration.json         # which integration manifest is installed
├── workflows/
│   ├── workflow-registry.json   # declares the "speckit" full-cycle workflow
│   └── speckit/workflow.yml      # the cycle definition (specify→plan→tasks→implement)
├── templates/               # base templates used to stamp artifacts
│   ├── spec-template.md
│   ├── plan-template.md
│   ├── tasks-template.md
│   ├── checklist-template.md
│   └── constitution-template.md
├── memory/
│   └── constitution.md      # project principles — outranks convenience
├── integrations/
│   ├── specKit.manifest.json
│   ├── claude.manifest.json
│   └── gemini.manifest.json
└── extensions/git/          # the git extension
    ├── extension.yml
    ├── config-template.yml
    ├── git-config.yml       # branch_numbering, branch naming
    ├── commands/*.md
    ├── README.md
    └── scripts/{bash,powershell}/
        ├── auto-commit.sh / .ps1
        ├── create-new-feature.sh / .ps1
        ├── initialize-repo.sh / .ps1
        └── git-common.sh / .ps1
```

### Notes for a fresh project

- `scripts/bash/*` — optional helper scripts the skills may reference; Bash or
  PowerShell set chosen by `init-options.json` (this repo uses `sh`).
- `extensions.yml` — trim the hook list if you don't want auto-commit/auto-branch:
  set `enabled: false` on any you want to retire.
- `feature.json` is written automatically on first `/speckit-specify` — no need
  to create it by hand.
- `init-options.json` sets `here: true` (run in place, no copy) and
  `integration` — change to match your target AI tool if needed.
- If you skip branch work (trunk-based), make `speckit.git.feature` `enabled:
  false` and rely on `speckit-git-commit` for staged commits.

---

## Example scenario

**Prompt**
> use speckit-specify to define admin bulk-import of directory listings via CSV
> upload with validation, field-mapping preview, and per-row error reporting.
> Imports are staged and require admin approval before any listing goes live.

**What happens**

1. Short name / directory → `specs/002-bulk-import-listings/`.
2. `spec.md` written as WHAT/WHY — no Laravel/Vite implementation detail.
3. Quality checklist generated at `checklists/requirements.md`.
4. Up to 3 clarifying questions surfaced where scope forks, e.g.:

   | # | Question | Options |
   |---|----------|---------|
   | Q1 | CSV source? | File upload / cloud drive / both |
   | Q2 | Duplicate handling on re-import? | Skip / update / error |
   | Q3 | Who approves staged imports? | Single admin / multi-role |

5. After you answer, run `speckit-plan`, `speckit-tasks`, `speckit-implement` to ship it.