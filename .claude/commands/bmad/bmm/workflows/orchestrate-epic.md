---
description: 'Execute complete epic lifecycle: tech spec → all stories (create → context → develop → review → merge → deploy) → retrospective. Fully automated epic orchestration with context isolation.'
---

# orchestrate-epic

**EXECUTION CONTEXT**: This slash command is executed by the **main assistant**, not a subagent. You have full access to all tools including Task, Bash, Read, Edit, etc.

You are the **BMAD Epic Orchestrator**. Execute the complete epic lifecycle workflow: tech spec generation + all stories in sequence with strict context isolation.

## Mission

Execute the complete BMAD epic workflow:
1. **Epic Tech Spec** (if needed): Generate technical specification for the epic
2. **All Stories**: Execute complete story workflow (11 steps each) for every story in the epic
3. **Retrospective** (optional): Offer to run epic retrospective after completion

Each workflow step MUST run in complete isolation - no shared context between workflow invocations.

## Context Isolation Architecture

**CRITICAL**: All workflow executions (tech spec, story workflows) MUST use Task tool for context isolation:
- You (main assistant) invoke Task tool to launch general-purpose subagent
- Each subagent runs one workflow in complete isolation
- Subagent reads all inputs from disk (story files, context files, code files)
- Subagent writes all outputs to disk (updated files, new files)
- Subagent fully exits and context is destroyed
- Next workflow reads fresh state from disk - no memory inheritance

**Why**: This ensures each workflow reads the latest state from files and prevents context pollution.

## Pre-Flight Check: Epic Identification

**EXECUTE FIRST - BEFORE ANY OTHER STEPS:**

1. Read `docs/sprint-status.yaml` to analyze epic/story status
2. Find the first epic that has at least one story in "backlog" status
3. Extract epic number (e.g., "3-1-...", "3-2-..." → Epic 3)
4. Determine if epic needs tech context:
   - If epic status = "backlog" → needs tech spec (Step 0)
   - If epic status = "contexted" → skip to story execution
5. Count total stories in this epic that need execution (status: backlog, drafted, ready-for-dev, in-progress, review)
6. Report epic details to user:
   - Epic number
   - Epic status
   - Total stories to execute
   - Whether tech spec is needed

**Report Example:**
```
🎯 Epic Orchestration Plan

Epic: Epic 3 (User Interface & Interaction Layer)
Status: contexted (tech spec exists)
Stories to execute: 8 stories (3-2 through 3-9)
Tech spec needed: No

Ready to proceed?
```

**User Confirmation**: Ask user if they want to proceed with the epic orchestration.

---

## Step 0: Epic Tech Context (Conditional)

**Only execute if epic status = "backlog"**

```
Task(subagent_type="general-purpose",
     prompt="Execute the epic-tech-context workflow for Epic [N].
             Load bmad/core/tasks/workflow.xml and execute with
             workflow-config: bmad/bmm/workflows/3-epic-planning/epic-tech-context/workflow.yaml
             Generate comprehensive technical specification for the epic.
             Update sprint-status.yaml to mark epic as 'contexted'.")
```

**Wait**: Confirm subagent fully exited

**Verify**:
- Check `docs/epics/epic-[N]-tech-spec.md` exists
- Epic status = "contexted" in sprint-status.yaml

**Report**: "✅ Step 0: Epic tech spec created for Epic [N]"

---

## Story Execution Loop

**For each story in the epic (in sequential order):**

### Story Identification
- Read `docs/sprint-status.yaml` fresh from disk
- Find next story in epic with status: "backlog", "drafted", "ready-for-dev", "in-progress", or "review"
- If no stories need execution, exit loop
- Extract story ID (e.g., "3-2-create-location-input-field-with-validation")

### Story Pre-Flight Check
- If story status = "done", skip to next story
- Report: "📝 Starting Story [X.Y]: [Title]"

### Story Step 0: Create Safety Branch

```bash
# Verify clean working tree
git status --porcelain

# Create story branch (format: story/X-Y-description)
git checkout -b story/[X-Y]-[short-description]

# Verify branch created
git branch --show-current
```

**Report**: "✅ Story [X.Y] Step 0: Created branch story/[X-Y]-[description]"

---

### Story Step 1: Create Story File

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

**Report**: "✅ Story [X.Y] Step 1: Story file created"

---

### Story Step 2: Generate Story Context

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

**Report**: "✅ Story [X.Y] Step 2: Context file generated"

---

### Story Step 3: Develop Story (with Retry Loop)

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

**Report**: "✅ Story [X.Y] Step 3: Story implementation complete"

---

### Story Step 4: Code Review (with Auto-Retry)

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
  - Retry counter < 3: Re-run Story Step 3 (with retry context) → Story Step 4
  - Retry counter ≥ 3: STOP, report manual intervention needed
- If outcome = "APPROVE": Continue to Story Step 4a

**Report**: "✅ Story [X.Y] Step 4: Code review complete - [outcome]"

---

### Story Step 4a: Update Story File Status to Done

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

**Report**: "✅ Story [X.Y] Step 4a: Story file status updated to done"

---

### Story Step 5: Commit Changes

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

**Report**: "✅ Story [X.Y] Step 5: Changes committed to story branch"

---

### Story Step 6: Push Story Branch (Backup)

**Only if review = APPROVE:**

```bash
# Push story branch to remote as backup
git push -u origin story/[X-Y]-[description]
```

**Report**: "✅ Story [X.Y] Step 6: Story branch pushed to remote"

---

### Story Step 7: Merge to Main

**Only if review = APPROVE and Step 6 succeeded:**

```bash
# Checkout main
git checkout main

# Merge with no-ff to preserve branch history
git merge --no-ff story/[X-Y]-[description] -m "Merge story [X.Y]: [title]"

# Verify on main
git branch --show-current
```

**Report**: "✅ Story [X.Y] Step 7: Story branch merged to main"

---

### Story Step 8: Deploy to Remote

**Only if review = APPROVE and Step 7 succeeded:**

```bash
# Push main to remote
git push origin main
```

**Report**: "✅ Story [X.Y] Step 8: Main branch pushed to remote - Story deployed!"

---

### Story Step 9: Clean Up Background Processes

**Execute regardless of approval status:**

```bash
# Kill all background processes for clean slate
# Use KillShell tool for any running background bash processes
```

**Report**: "✅ Story [X.Y] Step 9: Background processes cleaned - Ready for next story"

---

### End of Story Loop

After completing all 10 steps for a story:
- Report story completion
- Update progress counter (e.g., "Story 2 of 8 complete")
- Loop back to Story Identification to process next story

---

## Final Step: Epic Retrospective (Manual Process)

**After all stories are complete:**

Report epic completion summary and provide guidance for running the retrospective manually:

```
🎉 Epic [N] Complete!

All [X] stories have been successfully implemented, reviewed, and deployed.

═══════════════════════════════════════════════════════════
NEXT STEP: Epic Retrospective (Optional but Recommended)
═══════════════════════════════════════════════════════════

The Epic Retrospective is an INTERACTIVE, CONVERSATIONAL workflow that
should NOT be run within this orchestration. It requires human input
and collaborative discussion between team personas.

To run the retrospective:

1. CLEAR YOUR CONTEXT (important for fresh perspective):
   - Use /clear command to reset conversation
   - Or start a new conversation

2. LOAD THE SCRUM MASTER AGENT:
   - Run: /bmad:bmm:agents:sm
   - This loads the SM (Scrum Master) persona

3. RUN THE RETROSPECTIVE WORKFLOW:
   - Run: /bmad:bmm:workflows:retrospective
   - The SM will facilitate an interactive retrospective session
   - You'll be prompted for input during the discussion
   - The workflow will create: docs/retrospectives/epic-[N]-retrospective.md
   - Sprint status will be updated to mark retrospective as "completed"

BENEFITS OF RUNNING RETROSPECTIVE:
- Capture learnings from Epic [N]
- Identify improvements for Epic [N+1]
- Document best practices and patterns
- Prepare for next epic with better context

═══════════════════════════════════════════════════════════
```

**IMPORTANT:** This workflow CANNOT clear context or run the retrospective for you.
The user must manually clear context and load the SM agent to run the retrospective.

**DO NOT offer to execute the retrospective automatically.**
**DO NOT execute the retrospective as a Task within this workflow.**

---

## Error Handling

### Epic Level Errors
- **No eligible epic found**: Report to user, exit gracefully
- **Epic tech spec fails**: Stop immediately, report error, preserve state

### Story Level Errors
- **Story creation fails**: Stop epic execution, report which story failed, preserve branch
- **Development fails**: Stop epic execution, report error, preserve branch for debugging
- **Review fails after max retries**: Stop epic execution, report which story needs manual intervention
- **Git conflicts on merge**: Stop epic execution, provide resolution instructions
- **Context isolation violation**: Stop immediately, re-read from disk

### Recovery Strategy
- All git branches are preserved (story branches on remote + local)
- Sprint status shows exact state of each story
- User can resume epic orchestration after manual fixes
- Suggest running orchestrate-story for individual story fixes

---

## Quality Assurance

After EACH workflow step:
- [ ] Verify expected artifacts exist on disk
- [ ] Confirm status transitions in sprint-status.yaml
- [ ] Report completion before proceeding
- [ ] Check for errors before continuing
- [ ] Verify context isolation (no cached knowledge)

After EACH story:
- [ ] All 10 story steps completed successfully
- [ ] Story status = "done" in sprint-status.yaml
- [ ] Story file shows "Status: done"
- [ ] Clean git state on main branch
- [ ] Background processes cleaned up

**Never skip steps. Never assume success. Always verify.**

---

## Progress Tracking

Use TodoWrite tool to track epic orchestration progress:

```
Epic [N] Orchestration:
[ ] Epic tech spec (if needed)
[ ] Story [X.1] (11 sub-steps)
[ ] Story [X.2] (11 sub-steps)
[ ] Story [X.3] (11 sub-steps)
...
[ ] Epic retrospective (optional)
```

Update todos as each story completes.

---

## Final Summary Report

Upon successful completion of entire epic:

```
🎉 BMAD Epic Workflow Complete - Epic [N]

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

Retrospective: [completed/optional]

Next Epic: Epic [N+1]
Next Stories: [count] stories pending
```

---

## Context Isolation Verification

After EACH workflow step, verify:
- [ ] Previous Task subagent has fully exited (you see its final return message)
- [ ] Expected files were written to disk by the subagent
- [ ] You are about to read from disk, not from any cached context
- [ ] Next Task invocation will be a fresh subagent with zero inherited state

**Never:**
- Assume file contents without reading from disk
- Pass information between workflows via conversation context
- Skip verification that artifacts exist on disk
- Continue to next story if current story has errors
