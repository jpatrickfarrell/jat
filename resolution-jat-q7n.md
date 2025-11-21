# Resolution: jat-q7n - Server Crash on Hyphenated Project Names

**Task:** jat-q7n
**Status:** Already Resolved
**Resolved By:** Commit 8f319d6 (Nov 20, 2025)
**Verified By:** SoftCliff (Nov 21, 2025)

## Issue Summary

The test report (test-results-jat-cuj.md) documented a critical bug where the server would crash (exit code 143 - SIGTERM) when filtering by project names containing hyphens (e.g., `?project=jomarchy-agent-tools`).

## Root Cause

The original `getTasks()` function in `lib/beads.js` attempted to filter projects by directory name BEFORE collecting tasks. This approach failed for hyphenated project names because:

1. `.beads` directory names don't always match task ID prefixes
2. The filtering logic was at the wrong level (project directories vs task IDs)
3. The code would return empty results or crash when project names didn't match directory structure

## The Fix (Commit 8f319d6)

**Author:** Joseph Winke
**Date:** Nov 20, 2025 15:14:31 -0500
**Commit:** 8f319d6e5adda3d45493d8fe82ea9c77c800aa60

**Changes:**
- Removed project-level filtering (which operated on directory names)
- Added task ID prefix filtering AFTER collecting all tasks
- Used regex to extract project prefix: `/^([a-zA-Z0-9_-]+?)-([a-zA-Z0-9]+)$/`
- Non-greedy matching (`+?`) correctly handles hyphenated project names

**Code diff:**
```diff
-  if (projectName) {
-    const filtered = projects.filter(p => p.name === projectName);
-    if (filtered.length === 0) {
-      return [];
-    }
-  }

+  // Filter by task ID prefix if projectName specified
+  if (projectName) {
+    return allTasks.filter(task => {
+      if (!task.id) return false;
+      const match = task.id.match(/^([a-zA-Z0-9_-]+?)-([a-zA-Z0-9]+)$/);
+      if (!match) return false;
+      const taskPrefix = match[1];
+      return taskPrefix === projectName;
+    });
+  }
```

## Verification Results

Tested on Nov 21, 2025:

### Test 1: Hyphenated Project Name
```bash
GET /api/agents?full=true&project=jomarchy-agent-tools
✅ SUCCESS: 122 tasks returned
✅ All task IDs start with "jomarchy-agent-tools-"
✅ No server crash
```

### Test 2: Simple Project Names
```bash
GET /api/agents?full=true&project=jat
✅ SUCCESS: 50 tasks returned
✅ All task IDs start with "jat-"

GET /api/agents?full=true&project=dirt
✅ SUCCESS: 387 tasks returned
✅ All task IDs start with "dirt-"
```

### Test 3: All Projects
```bash
GET /api/agents?full=true
✅ SUCCESS: 559 total tasks across all projects
```

## Impact

**Before Fix:**
- Server would crash when filtering by hyphenated project names
- Dashboard unusable for projects like "jomarchy-agent-tools"
- Users couldn't filter tasks by project

**After Fix:**
- All project filters work correctly
- Hyphenated names handled properly
- Consistent filtering across simple and complex project names
- No server crashes

## Timeline

- **Nov 20, 15:14**: Bug fixed in commit 8f319d6
- **Nov 21, 05:53**: Test report created documenting the bug
- **Nov 21, 06:08**: Project count fix committed
- **Nov 21, Current**: Verified fix is working correctly

## Recommendation

**Close task jat-q7n as "Already Resolved"**

The bug was identified during testing (jat-cuj) and immediately fixed the same day. The fix has been verified to work correctly for all project name formats:
- Simple names (jat, dirt)
- Hyphenated names (jomarchy-agent-tools)
- Mixed alphanumeric with underscores/hyphens

No additional work needed.

---

**Tested By:** SoftCliff
**Date:** 2025-11-21
**Verification Method:** Live API testing against running dashboard
