# BMAD Orchestration Slash Commands

Two Claude Code slash commands for automating BMAD story and epic development workflows.

> **Note**: These slash commands have only been tested with **BMAD Alpha v6**. They rely on existing v6 workflows and might need to be updated for newer versions.

## What's Included

- **`orchestrate-story.md`** - Automates single story: create → develop → review → merge → deploy
- **`orchestrate-epic.md`** - Automates complete epic: tech spec → all stories → retrospective guidance

## Quick Start

### 1. Installation

```bash
# Navigate to your project with BMAD v6 installed
cd your-project

# Copy the slash command files
cp orchestrate-story.md .claude/commands/bmad/bmm/workflows/
cp orchestrate-epic.md .claude/commands/bmad/bmm/workflows/
```

### 2. Usage

```bash
# Launch Claude Code
claude

# Execute single story
/bmad:bmm:workflows:orchestrate-story

# Or execute complete epic
/bmad:bmm:workflows:orchestrate-epic
```

## Features

### orchestrate-story (11 automated steps)
- Creates safety branch
- Generates story file and context
- Implements requirements
- Performs senior developer code review with auto-retry (max 3 attempts)
- Commits, pushes, merges to main, and deploys
- Full git lifecycle management

### orchestrate-epic (Full epic automation)
- Generates epic tech spec if needed
- Executes all stories in sequence (11 steps each)
- Tracks progress across multiple stories
- Provides retrospective guidance
- Handles epic boundaries safely

## Key Benefits

**Context Isolation**
- Each step runs in isolated subagent
- Reads fresh state from disk
- No cached knowledge between steps
- Prevents state pollution

**Git Safety**
- Safety branches for all work
- Remote backup before merging
- Preserves history for debugging
- Clean working tree validation

**Auto-Retry**
- Retries failed code reviews automatically
- Max 3 attempts per story
- Preserves state for manual intervention

## Requirements

- Claude Code CLI installed
- Git repository initialized
- BMAD project structure:
  - `docs/sprint-status.yaml` - Story/epic status tracking
  - `docs/epics.md` - Epic definitions
  - `docs/tech-spec-epic-[N].md` - Epic tech specs
  - `docs/stories/` - Story files
  - PRD and architecture documents

## Important: Use Sonnet 4.5

**Critical**: These slash commands require **Sonnet 4.5** for proper context isolation.

Haiku ignores context isolation instructions and will cause failures:
- Uses cached knowledge instead of reading from disk
- References stale file contents
- Incorrect status transitions

## Project Structure After Installation

```
your-project/
├── .claude/
│   └── commands/
│       └── bmad/
│           └── bmm/
│               └── workflows/
│                   ├── orchestrate-story.md
│                   └── orchestrate-epic.md
├── docs/
│   ├── sprint-status.yaml
│   ├── epics.md
│   ├── tech-spec-epic-1.md
│   ├── tech-spec-epic-2.md
│   └── stories/
└── [your code]
```

## Example: Execute Story

```bash
# Launch Claude Code
claude

# Run the slash command
/bmad:bmm:workflows:orchestrate-story
```

The command will:
1. Find next backlog story in `sprint-status.yaml`
2. Validate epic boundary
3. Execute all 11 steps automatically
4. Report completion with summary

## Example: Execute Epic

```bash
# Launch Claude Code
claude

# Run the slash command
/bmad:bmm:workflows:orchestrate-epic
```

The command will:
1. Identify next epic with backlog stories
2. Show plan and request confirmation
3. Generate tech spec if needed
4. Execute all stories sequentially
5. Provide retrospective instructions

## Common Issues

**Slash command not found**
- Verify files in `.claude/commands/bmad/bmm/workflows/`
- Restart Claude Code
- Run `/help` to confirm commands loaded

**Context isolation failures**
- Ensure using Sonnet 4.5 (not Haiku)
- Check subagents exit completely between steps

**Git conflicts**
- Checkout story branch and resolve manually
- Complete merge manually
- Update `sprint-status.yaml` status

## What Gets Automated

### Story Workflow (11 Steps)
1. Create safety branch (`story/X-Y-description`)
2. Create story file from epic requirements
3. Generate story context from codebase
4. Implement story requirements
5. Senior developer code review (auto-retry)
6. Update story status to done
7. Commit with detailed message
8. Push story branch to remote
9. Merge to main (no-ff)
10. Deploy to remote
11. Clean up background processes

### Epic Workflow
- Tech spec generation (if needed)
- Story loop (executes story workflow for each story)
- Progress tracking with todo lists
- Epic boundary detection
- Retrospective guidance

## Support

- **Issues**: https://github.com/tekn0x/BMADv6-Speed-Run/issues
- **Repository**: https://github.com/tekn0x/BMADv6-Speed-Run

---

**Made with Claude Code** - BMAD methodology automation
