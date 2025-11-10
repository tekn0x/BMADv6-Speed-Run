# BMAD Story & Epic Orchestration Workflows

Automated workflow orchestration for the BMAD (Build, Measure, Analyze, Deploy) methodology using Claude Code. These workflows provide fully automated story and epic execution with context isolation, git safety, and comprehensive error handling.

## Overview

This package contains two powerful Claude Code slash commands that automate the complete BMAD development lifecycle:

- **`orchestrate-story`** - Execute a single story from creation to deployment
- **`orchestrate-epic`** - Execute an entire epic with all its stories from planning to retrospective

## Key Features

### Context Isolation Architecture
Both workflows implement strict context isolation to ensure reliability and prevent state pollution:
- Each workflow step runs in an isolated subagent using the Task tool
- Subagents read all inputs from disk (story files, context files, code)
- Subagents write all outputs to disk (updated files, new files)
- Complete context destruction between steps ensures fresh state
- No memory inheritance between workflow invocations

### Git Safety & Automation
Comprehensive git workflow automation with safety checks:
- Automatic safety branch creation (`story/X-Y-description`)
- Clean working tree verification before branching
- Atomic commits with detailed commit messages
- Remote backup of story branches before merging
- No-fast-forward merges to preserve branch history
- Automatic deployment to remote after successful merge
- Full git history preservation for debugging

### Auto-Retry Logic
Intelligent retry mechanism for code reviews:
- Automatically retries development step if review requests changes
- Maximum 3 retry attempts to prevent infinite loops
- Preserves all branches and state for manual intervention if needed
- Clear error reporting when manual intervention is required

### Quality Assurance
Built-in verification at every step:
- Artifact existence validation after each workflow step
- Status transition confirmation in `sprint-status.yaml`
- Git state verification before critical operations
- Context isolation verification to prevent cached knowledge usage
- Comprehensive error handling with graceful failures

---

## `orchestrate-story` - Single Story Automation

Execute the complete lifecycle of a single BMAD story with 11 automated steps.

### What It Does

```
Story Lifecycle (11 Steps):
├─ Step 0: Create Safety Branch (story/X-Y-description)
├─ Step 1: Create Story File (context-isolated workflow)
├─ Step 2: Generate Story Context (context-isolated workflow)
├─ Step 3: Develop Story Implementation (context-isolated workflow)
├─ Step 4: Senior Developer Code Review (context-isolated workflow)
│          └─ Auto-retry on "Changes Requested" (max 3 attempts)
├─ Step 4a: Update Story File Status to Done
├─ Step 5: Commit Changes to Story Branch
├─ Step 6: Push Story Branch to Remote (backup)
├─ Step 7: Merge Story Branch to Main
├─ Step 8: Deploy Main to Remote
└─ Step 9: Clean Up Background Processes
```

### Key Features

- **Epic Boundary Validation**: Prevents accidental epic transitions by validating the next story belongs to the current active epic
- **Pre-Flight Checks**: Reads `docs/sprint-status.yaml` to identify the next backlog story
- **Automatic Status Updates**: Updates story status throughout lifecycle (backlog → drafted → ready-for-dev → in-progress → review → done)
- **Comprehensive Reporting**: Step-by-step progress reporting with file paths and git references
- **Error Recovery**: Preserves all branches and state if errors occur

### Usage

```bash
/bmad:bmm:workflows:orchestrate-story
```

The workflow will:
1. Identify the next story in backlog status
2. Validate it's in the current active epic
3. Execute all 11 steps automatically
4. Report comprehensive summary upon completion

### Prerequisites

- Clean git working tree
- `docs/sprint-status.yaml` must exist with story statuses
- Epic tech spec must exist for the current epic
- PRD and architecture documents in place

---

## `orchestrate-epic` - Full Epic Automation

Execute the complete lifecycle of an entire epic including tech spec generation, all stories, and optional retrospective.

### What It Does

```
Epic Lifecycle:
├─ Pre-Flight: Epic Identification & Planning
│   └─ Identify next epic with backlog stories
│   └─ Determine if tech spec is needed
│   └─ Count total stories to execute
│   └─ Request user confirmation
│
├─ Step 0: Epic Tech Context (conditional)
│   └─ Only if epic status = "backlog"
│   └─ Generate technical specification for epic
│   └─ Update epic status to "contexted"
│
├─ Story Execution Loop (for each story in epic):
│   ├─ Step 0: Create Safety Branch
│   ├─ Step 1: Create Story File
│   ├─ Step 2: Generate Story Context
│   ├─ Step 3: Develop Story (with retry)
│   ├─ Step 4: Code Review (with auto-retry)
│   ├─ Step 4a: Update Story File Status
│   ├─ Step 5: Commit Changes
│   ├─ Step 6: Push Story Branch
│   ├─ Step 7: Merge to Main
│   ├─ Step 8: Deploy to Remote
│   └─ Step 9: Clean Up Processes
│
└─ Final: Epic Retrospective (manual process)
    └─ Provides instructions for running interactive retrospective
```

### Key Features

- **Epic-Level Orchestration**: Handles multiple stories in sequence with progress tracking
- **Conditional Tech Spec**: Automatically generates epic technical specification if needed
- **Story-Level Isolation**: Each story executes in complete isolation with no shared context
- **Progress Tracking**: Real-time progress updates (e.g., "Story 3 of 8 complete")
- **Todo List Integration**: Automatic todo list creation for tracking epic and story progress
- **Epic Boundary Detection**: Stops at epic boundaries to prevent accidental transitions
- **Retrospective Guidance**: Provides clear instructions for running optional retrospective

### Usage

```bash
/bmad:bmm:workflows:orchestrate-epic
```

The workflow will:
1. Analyze `docs/sprint-status.yaml` to identify the next epic
2. Report epic details and story count
3. Ask for user confirmation before proceeding
4. Execute tech spec generation if needed
5. Execute all stories in sequence (11 steps each)
6. Provide retrospective instructions upon completion

### Epic Completion Report

After successful completion, you'll see:

```
🎉 Epic [N] Complete!

All [X] stories have been successfully implemented, reviewed, and deployed.

Epic: [Epic Title]
Stories Completed: [X] stories
Total Commits: [X] commits
Total Files Modified: [X] files

Stories:
✅ Story [X.1]: [Title] - deployed
✅ Story [X.2]: [Title] - deployed
✅ Story [X.3]: [Title] - deployed
...

Epic Tech Spec: docs/epics/epic-[N]-tech-spec.md
All Story Files: docs/stories/[N]-*.md
Epic Status: All stories done ✅

Retrospective: [instructions provided]
Next Epic: Epic [N+1]
```

---

## Installation

### Requirements

- Claude Code CLI installed and configured
- Git repository initialized
- BMAD project structure in place

### Installation Steps

1. **Clone or navigate to your project root:**
   ```bash
   cd your-project-root
   ```

2. **Create the workflow directory structure:**
   ```bash
   mkdir -p .claude/commands/bmad/bmm/workflows
   ```

3. **Copy the workflow files:**
   ```bash
   # Copy orchestrate-story.md to the workflows directory
   cp path/to/orchestrate-story.md .claude/commands/bmad/bmm/workflows/

   # Copy orchestrate-epic.md to the workflows directory
   cp path/to/orchestrate-epic.md .claude/commands/bmad/bmm/workflows/
   ```

4. **Verify installation:**
   ```bash
   # Start Claude Code
   claude-code

   # List available commands (should show both workflows)
   /help
   ```

### Directory Structure

After installation, your project should have:

```
your-project-root/
├── .claude/
│   └── commands/
│       └── bmad/
│           └── bmm/
│               └── workflows/
│                   ├── orchestrate-story.md
│                   └── orchestrate-epic.md
├── docs/
│   ├── sprint-status.yaml
│   ├── epics/
│   └── stories/
└── [your project files]
```

---

## Configuration

### Model Recommendation

**IMPORTANT**: Use **Sonnet 4.5** for reliable context isolation.

Haiku has been observed to ignore context isolation instructions, which can lead to:
- Cached knowledge being used instead of reading from disk
- Stale file contents being referenced
- Incorrect status transitions
- Workflow failures

To ensure Sonnet 4.5 is used:
```bash
# In Claude Code CLI, set your preferred model
claude-code --model sonnet-4-5
```

Or configure in your Claude Code settings file.

### Required Project Files

Both workflows expect the following project structure:

1. **`docs/sprint-status.yaml`** - YAML file tracking epic and story statuses
   ```yaml
   epics:
     - id: "1"
       status: "done"
     - id: "2"
       status: "contexted"
   stories:
     - id: "2-1-story-title"
       status: "done"
     - id: "2-2-next-story"
       status: "backlog"
   ```

2. **`docs/epics/epic-[N]-tech-spec.md`** - Epic technical specifications

3. **`docs/stories/`** - Directory for story files

4. **PRD and Architecture documents** - Referenced by workflows for context generation

---

## Usage Examples

### Example 1: Execute Next Story

```bash
# Start Claude Code in your project
claude-code

# Execute the next story in the backlog
/bmad:bmm:workflows:orchestrate-story

# Workflow will:
# - Find next backlog story
# - Validate epic boundary
# - Execute all 11 steps
# - Report completion
```

### Example 2: Execute Complete Epic

```bash
# Start Claude Code in your project
claude-code

# Execute the entire epic
/bmad:bmm:workflows:orchestrate-epic

# Workflow will:
# - Identify next epic with backlog stories
# - Show epic plan and request confirmation
# - Generate tech spec if needed
# - Execute all stories (11 steps each)
# - Provide retrospective instructions
```

### Example 3: Resume After Manual Fix

If a workflow stops due to an error:

```bash
# Fix the issue manually (e.g., resolve git conflict)

# Update sprint-status.yaml to reflect correct state

# Re-run the same workflow
/bmad:bmm:workflows:orchestrate-story
# OR
/bmad:bmm:workflows:orchestrate-epic

# Workflow will detect current state and continue
```

---

## Error Handling

### Common Errors

#### Epic Boundary Detection
```
❌ STOP - Epic boundary detected
Current epic: Epic 2 (all stories done)
Next story: 3-1-... (Epic 3)

Epic transitions require manual preparation.
```

**Resolution**: Run epic planning workflows before continuing.

#### Code Review Blocked After 3 Retries
```
❌ Story 3-5 requires manual intervention
Code review blocked after 3 retry attempts

Branch preserved: story/3-5-description
Status: review
```

**Resolution**: Manually review and fix code, then re-run workflow.

#### Git Conflict on Merge
```
❌ Git conflict detected during merge
Conflict in: src/components/Button.tsx

Branch preserved: story/3-5-description
```

**Resolution**:
1. Checkout story branch
2. Resolve conflicts manually
3. Complete merge manually
4. Update `sprint-status.yaml` to "done"

---

## Advanced Features

### Context Isolation Verification

Both workflows include built-in verification:
- Confirms subagent exit after each workflow step
- Verifies expected files exist on disk
- Prevents using cached knowledge
- Forces fresh file reads for each step

### Quality Assurance Checklist

After each workflow step:
- [x] Verify expected artifacts exist on disk
- [x] Confirm status transitions in sprint-status.yaml
- [x] Report completion before proceeding
- [x] Check for errors before continuing
- [x] Verify context isolation (no cached knowledge)

### Progress Tracking

Epic workflow automatically creates todo lists:
```
Epic 3 Orchestration:
[x] Epic tech spec
[x] Story 3.1 (11 sub-steps)
[x] Story 3.2 (11 sub-steps)
[ ] Story 3.3 (11 sub-steps) ← currently executing
[ ] Story 3.4 (11 sub-steps)
[ ] Epic retrospective (optional)
```

---

## Troubleshooting

### Workflow Not Found

**Issue**: `/bmad:bmm:workflows:orchestrate-story` command not recognized

**Solution**:
1. Verify files are in correct directory: `.claude/commands/bmad/bmm/workflows/`
2. Restart Claude Code CLI
3. Run `/help` to verify commands are loaded

### Context Isolation Failures

**Issue**: Workflow uses outdated file contents

**Solution**:
1. Ensure you're using Sonnet 4.5 (not Haiku)
2. Check that workflows are using Task tool for steps 1-4
3. Verify subagents fully exit before next step

### Git Branch Conflicts

**Issue**: Story branch already exists

**Solution**:
```bash
# Delete local branch
git branch -D story/3-5-description

# Delete remote branch if needed
git push origin --delete story/3-5-description

# Re-run workflow
```

---

## Best Practices

1. **Always use Sonnet 4.5** - Haiku ignores context isolation
2. **Clean working tree** - Commit or stash changes before running workflows
3. **Monitor progress** - Watch step-by-step reports to catch errors early
4. **Preserve branches** - Story branches are backed up remotely for recovery
5. **Run retrospectives** - After each epic for continuous improvement
6. **Validate epic boundaries** - Don't skip manual epic preparation steps

---

## Contributing

These workflows are part of the BMAD methodology. To contribute:

1. Fork the repository
2. Create a feature branch
3. Submit pull request with improvements
4. Include examples of workflow execution

---

## License

[Your License Here]

---

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/tekn0x/BMADv6-Speed-Run/issues
- Repository: https://github.com/tekn0x/BMADv6-Speed-Run

---

## Changelog

### v1.0.0 (Initial Release)
- `orchestrate-story`: Complete single story automation
- `orchestrate-epic`: Complete epic automation with all stories
- Context isolation architecture
- Auto-retry logic for code reviews
- Git safety and automation
- Comprehensive error handling

---

**Made with Claude Code** - Automated development workflows for the BMAD methodology
