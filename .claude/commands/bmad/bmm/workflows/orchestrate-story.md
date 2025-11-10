---
description: 'Execute the complete BMAD story workflow: create → context → develop → review → merge → deploy. Handles all git operations and workflow orchestration automatically.'
---

# orchestrate-story

**EXECUTION CONTEXT**: This slash command is executed by the **main assistant**, not a subagent. You have full access to all tools including Task, Bash, Read, Edit, etc.

You are the **BMAD Story Orchestrator**. Execute the complete story lifecycle workflow with strict sequential execution, context isolation, and proper git safety.

## Mission

Execute all 11 steps of the BMAD story workflow in sequence:
- **Git operations** (Steps 0, 4a, 5-9): Execute directly using Bash/Edit tools
- **Workflow steps** (Steps 1-4): Execute using Task tool for context isolation

Each workflow step MUST run in complete isolation - no shared context between workflow invocations.

## Context Isolation Architecture

**CRITICAL**: Steps 1-4 (workflow execution) MUST use Task tool for context isolation:
- You (main assistant) invoke Task tool to launch general-purpose subagent
- Each subagent runs one workflow in complete isolation
- Subagent reads all inputs from disk (story files, context files, code files)
- Subagent writes all outputs to disk (updated files, new files)
- Subagent fully exits and context is destroyed
- Next workflow reads fresh state from disk - no memory inheritance

**Why**: This ensures each workflow reads the latest state from files and prevents context pollution that could cause incorrect behavior.

## Pre-Flight Check: Epic Boundary Validation

**EXECUTE FIRST - BEFORE ANY OTHER STEPS:**

1. Read `docs/sprint-status.yaml` to find first story with status "backlog"
2. Extract epic number from that story (e.g., "3-1-..." → Epic 3)
3. Find most recent "done" story to determine current active epic
4. **If current epic ≠ next story epic:**
   - ❌ STOP - Report epic boundary detected
   - Inform user that epic transitions require manual preparation
   - Exit without creating any branches or executing workflows
5. **If current epic = next story epic:**
   - ✅ Continue to Step 0

## Execution Steps

### Step 0: Create Safety Branch

```bash
# Verify clean working tree
git status --porcelain

# Create story branch (format: story/X-Y-description)
git checkout -b story/[X-Y]-[short-description]

# Verify branch created
git branch --show-current
```

**Report**: "✅ Step 0: Created branch story/[X-Y]-[description]"

---

### Step 1: Create Story File

**Execute with Context Isolation**:
```
Task(subagent_type="general-purpose",
     prompt="Execute the create-story workflow for story [X.Y].
             Load bmad/core/tasks/workflow.xml and execute with
             workflow-config: bmad/bmm/workflows/4-implementation/create-story/workflow.yaml
             Create story file at docs/stories/[story-file].md with all required sections.
             Update sprint-status.yaml to mark story as 'drafted'.")
```

**Wait**: Confirm subagent fully exited

**Verify**:
- Check `docs/stories/[story-file].md` exists
- Story status = "drafted" in sprint-status.yaml

**Report**: "✅ Step 1: Story file created at docs/stories/[story-file].md"

---

### Step 2: Generate Story Context

**Execute with Context Isolation**:
```
Task(subagent_type="general-purpose",
     prompt="Execute the story-context workflow for story [X.Y].
             Load bmad/core/tasks/workflow.xml and execute with
             workflow-config: bmad/bmm/workflows/4-implementation/story-context/workflow.yaml
             Read story file and generate context.xml with all relevant project context.
             Update sprint-status.yaml to mark story as 'ready-for-dev'.")
```

**Wait**: Confirm subagent fully exited

**Verify**:
- Check `docs/stories/[story-file].context.xml` exists
- Story status = "ready-for-dev"

**Report**: "✅ Step 2: Context file generated"

---

### Step 3: Develop Story (with Retry Loop)

**Execute with Context Isolation**:
```
Task(subagent_type="general-purpose",
     prompt="Execute the dev-story workflow for story [X.Y].
             Load bmad/core/tasks/workflow.xml and execute with
             workflow-config: bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml
             Read story file and context.xml, implement required changes.
             Update story file with implementation details.
             Update sprint-status.yaml to 'in-progress' then 'review'.")
```

**Wait**: Confirm subagent fully exited

**Verify**:
- Implementation files modified
- Story file updated with development section
- Story status = "review"

**Report**: "✅ Step 3: Story implementation complete"

---

### Step 4: Code Review (with Auto-Retry)

**Execute with Context Isolation**:
```
Task(subagent_type="general-purpose",
     prompt="Execute the code-review workflow for story [X.Y].
             Load bmad/core/tasks/workflow.xml and execute with
             workflow-config: bmad/bmm/workflows/4-implementation/code-review/workflow.yaml
             Read story file and implementation changes.
             Perform comprehensive senior developer review.
             Append review section to story file with outcome: APPROVE / Changes Requested / Blocked.")
```

**Wait**: Confirm subagent fully exited

**Verify**:
- Story file contains "Senior Developer Review" section
- Parse review outcome from file

**Auto-Retry Logic** (max 3 attempts):
- If outcome = "Changes Requested" or "Blocked":
  - Retry counter < 3: Re-run Step 3 (with retry context) → Step 4
  - Retry counter ≥ 3: STOP, report manual intervention needed
- If outcome = "APPROVE": Continue to Step 4a

**Report**: "✅ Step 4: Code review complete - [outcome]"

---

### Step 4a: Update Story File Status to Done

**Only if review = APPROVE:**

**CRITICAL**: This step fixes the bug where story files remain at "Status: review" even after approval.

**Execute directly using Edit tool (not via Task):**

```
1. Read the story file: docs/stories/[story-file].md
2. Use Edit tool to update the Status line:
   old_string: "Status: review"
   new_string: "Status: done"
3. Verify the change was made successfully
```

**Verify**:
- Story file now shows "Status: done" (typically around line 3-5)
- Read the file again to confirm if needed

**Report**: "✅ Step 4a: Story file status updated to done"

---

### Step 5: Commit Changes

**Only if review = APPROVE:**

```bash
# Commit all changes
git add -A

# Create comprehensive commit message
git commit -m "Complete Story [X.Y]: [Title]

[Implementation summary from story file]

Code Review: APPROVED ✅
- [Key accomplishments]
- [Files modified]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Report**: "✅ Step 5: Changes committed to story branch"

---

### Step 6: Push Story Branch (Backup)

**Only if review = APPROVE:**

```bash
# Push story branch to remote as backup
git push -u origin story/[X-Y]-[description]
```

**Report**: "✅ Step 6: Story branch pushed to origin/story/[X-Y]-[description]"

---

### Step 7: Merge to Main

**Only if review = APPROVE and Step 6 succeeded:**

```bash
# Checkout main
git checkout main

# Merge with no-ff to preserve branch history
git merge --no-ff story/[X-Y]-[description] -m "Merge story [X.Y]: [title]"

# Verify on main
git branch --show-current
```

**Report**: "✅ Step 7: Story branch merged to main"

---

### Step 8: Deploy to Remote

**Only if review = APPROVE and Step 7 succeeded:**

```bash
# Push main to remote
git push origin main
```

**Report**: "✅ Step 8: Main branch pushed to origin/main - Story deployed!"

---

### Step 9: Clean Up Background Processes

**Execute regardless of approval status:**

```bash
# Kill all background processes for clean slate
# Use KillShell tool for any running background bash processes
```

**Report**: "✅ Step 9: Killed [N] background processes - Clean slate ready"

---

## Quality Assurance - Context Isolation Verification

After EACH workflow step (Steps 1-4), verify:
- [ ] Previous Task subagent has fully exited (you see its final return message)
- [ ] Expected files were written to disk by the subagent
- [ ] You are about to read from disk, not from any cached context
- [ ] Next Task invocation will be a fresh subagent with zero inherited state

**Never:**
- Assume file contents without reading from disk
- Pass information between workflows via conversation context
- Skip verification that artifacts exist on disk

## Error Handling

- **Epic Boundary**: Stop at pre-flight check, report manual preparation needed
- **Step Failure**: Stop immediately, preserve branch, report specific error
- **Review Not Approved**: After max retries, preserve branch for manual fixes
- **Git Conflicts**: Report conflict, provide resolution instructions
- **Context Isolation Violation**: If you catch yourself using cached knowledge instead of reading files, STOP and re-read from disk

## Final Summary Report

Upon successful completion of all 11 steps:

```
🎉 BMAD Story Workflow Complete - Story [X.Y]

Steps Executed:
✅ 0. Safety branch created: story/[X-Y]-[description]
✅ 1. Story file created (context-isolated workflow)
✅ 2. Story context generated (context-isolated workflow)
✅ 3. Story implementation complete (context-isolated workflow)
✅ 4. Code review - APPROVED (context-isolated workflow)
✅ 4a. Story file status updated to done
✅ 5. Changes committed to story branch
✅ 6. Story branch backed up to remote
✅ 7. Merged to main
✅ 8. Deployed to origin/main
✅ 9. Background processes cleaned

Files Modified:
- [list all files from git diff]

Story File: docs/stories/[story-file].md
Branch: story/[X-Y]-[description] (preserved locally and on remote)
Status: done ✅

Next Story: [next-backlog-story] from Epic [N]
```

---

## Quality Assurance

After EACH step:
- [ ] Verify expected artifacts exist on disk
- [ ] Confirm status transitions in sprint-status.yaml
- [ ] Report completion before proceeding
- [ ] Check for errors before continuing

**Never skip steps. Never assume success. Always verify.**
