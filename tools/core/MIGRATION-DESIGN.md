# Beads Prefix Migration Algorithm Design

**Task:** jat-625k
**Author:** GreenGrove
**Date:** 2025-11-24
**Status:** Design Complete

## Executive Summary

This document provides a comprehensive design for migrating Beads task ID prefixes across all related databases and systems. The migration handles Beads database (issues, dependencies, comments, events, labels, metadata), Agent Mail database (thread IDs, file reservation reasons), and maintains referential integrity throughout.

---

## 1. Affected Tables and Columns

### 1.1 Beads Database (`<project>/.beads/beads.db`)

| Table | Column(s) | Type | Notes |
|-------|-----------|------|-------|
| `issues` | `id` | PRIMARY KEY | Main task ID (dirt-abc → chimaro-abc) |
| `dependencies` | `issue_id` | FK → issues(id) | Task that has dependency |
| `dependencies` | `depends_on_id` | FK → issues(id) | Task being depended on |
| `labels` | `issue_id` | FK → issues(id) | Task labels |
| `comments` | `issue_id` | FK → issues(id) | Task comments |
| `events` | `issue_id` | FK → issues(id) | Audit trail events |
| `events` | `old_value` | TEXT | May contain task IDs in value changes |
| `events` | `new_value` | TEXT | May contain task IDs in value changes |
| `dirty_issues` | `issue_id` | FK → issues(id) | Dirty tracking |
| `export_hashes` | `issue_id` | FK → issues(id) | Export tracking |
| `child_counters` | `parent_id` | FK → issues(id) | Child task counters |
| `issue_snapshots` | `issue_id` | FK (likely) | Snapshot tracking |

**Total tables affected:** 9 tables in Beads DB

### 1.2 Agent Mail Database (`~/.agent-mail.db`)

| Table | Column(s) | Type | Notes |
|-------|-----------|------|-------|
| `messages` | `thread_id` | TEXT | Thread grouping (dirt-abc → chimaro-abc) |
| `messages` | `subject` | TEXT | May contain task IDs in text |
| `messages` | `body_md` | TEXT | May contain task IDs in markdown |
| `file_reservations` | `reason` | TEXT | Why reserved (e.g., "dirt-abc") |

**Total tables affected:** 2 tables in Agent Mail DB

### 1.3 Foreign Key Cascade Behavior

**Beads Database:**
- All FKs use `ON DELETE CASCADE`
- Updating `issues.id` (PRIMARY KEY) will automatically update dependent rows
- **Critical:** SQLite requires `PRAGMA foreign_keys = ON` for cascades to work

**Agent Mail Database:**
- `messages` → No FK to Beads (thread_id is just TEXT)
- `file_reservations` → No FK to Beads (reason is just TEXT)
- Updates must be explicit (no cascades)

---

## 2. ID Translation Map Design

### 2.1 Translation Function

```
Translation: f(old_id) → new_id

Where:
  old_id = prefix_old + "-" + suffix
  new_id = prefix_new + "-" + suffix

Example:
  f("dirt-abc") = "chimaro-abc"
  f("dirt-xyz") = "chimaro-xyz"
  f("dirt-123") = "chimaro-123"
```

### 2.2 ID Format Validation

**Prefix Rules:**
- Lowercase letters, numbers, hyphens only
- Must start with lowercase letter
- Pattern: `^[a-z][a-z0-9-]*$`

**Suffix Rules:**
- Beads uses base-62 encoding (0-9, a-z, A-Z)
- Typically 3-4 characters (e.g., "abc", "xyz", "123")
- Pattern: `^[a-z0-9]+$` (lowercase for current implementation)

**Full ID Pattern:**
```regex
^[a-z][a-z0-9-]*-[a-z0-9]+$
```

### 2.3 In-Memory Translation Map

For validation and rollback, build complete translation map:

```bash
# Example structure (bash associative array)
declare -A TRANSLATION_MAP

# Populate from database
while read old_id; do
  new_id=$(echo "$old_id" | sed "s/^${FROM_PREFIX}-/${TO_PREFIX}-/")
  TRANSLATION_MAP["$old_id"]="$new_id"
done < <(sqlite3 "$BEADS_DB" "SELECT id FROM issues WHERE id LIKE '${FROM_PREFIX}-%';")

# Example contents:
# TRANSLATION_MAP["dirt-abc"]="chimaro-abc"
# TRANSLATION_MAP["dirt-xyz"]="chimaro-xyz"
```

**Memory usage:** ~100 bytes per task × 389 tasks = ~39KB (negligible)

---

## 3. Collision Detection Strategy

### 3.1 Pre-Migration Collision Check

**Goal:** Ensure no target IDs already exist before migration

```sql
-- Check for collisions
SELECT COUNT(*) as collision_count
FROM issues
WHERE id LIKE '${FROM_PREFIX}-%'
AND REPLACE(id, '${FROM_PREFIX}-', '${TO_PREFIX}-') IN (
    SELECT id FROM issues
);
```

**If collision_count > 0:**
- ❌ ABORT migration
- Report conflicting IDs
- Suggest resolution:
  - Rename existing target IDs manually
  - Choose different target prefix
  - Delete duplicate tasks if appropriate

**Example collision:**
```
Source: dirt-abc → Target: chimaro-abc
Collision: chimaro-abc already exists!

Resolution options:
1. Rename existing chimaro-abc → chimaro-abc-old
2. Delete chimaro-abc (if duplicate)
3. Choose different target prefix (e.g., chimaro2)
```

### 3.2 Uniqueness Constraints

**Primary Key Constraints:**
- `issues.id` is PRIMARY KEY (ensures uniqueness)
- `dependencies(issue_id, depends_on_id)` is composite PRIMARY KEY
- No risk of duplicate rows after UPDATE

**Foreign Key Constraints:**
- All FKs reference `issues.id`
- CASCADE updates maintain referential integrity
- No orphaned rows possible

---

## 4. Transaction and Rollback Strategy

### 4.1 SQLite Transaction Isolation

**Transaction Type:** DEFERRED (default)
- Acquires read lock on BEGIN
- Upgrades to write lock on first write
- Exclusive lock during COMMIT

**Why DEFERRED?**
- Better concurrency (read lock first)
- Automatically upgrades when needed
- Suitable for migration (no concurrent writes expected)

### 4.2 Atomic Update Strategy

**Single Transaction Approach:**

```sql
BEGIN TRANSACTION;

-- Enable foreign key constraints (CRITICAL!)
PRAGMA foreign_keys = ON;

-- Step 1: Update primary key (cascades to all FKs)
UPDATE issues
SET id = REPLACE(id, '${FROM_PREFIX}-', '${TO_PREFIX}-')
WHERE id LIKE '${FROM_PREFIX}-%';

-- Step 2: Verify cascade updates (validation)
-- Check dependencies, labels, comments, events

-- Step 3: Update non-FK references
-- (events.old_value, events.new_value if they contain IDs)

COMMIT;
```

**Rollback Triggers:**
- Any SQL error → automatic rollback
- Validation failure → explicit `ROLLBACK`
- User interruption (Ctrl+C) → automatic rollback

### 4.3 Manual Rollback (From Backup)

**Backup Strategy:**
1. Copy entire database before migration
2. Calculate SHA256 checksum
3. Store in timestamped directory
4. Include metadata (prefixes, timestamp, checksums)

**Rollback Command:**
```bash
# Restore from backup
cp <backup-dir>/beads.db.backup <project>/.beads/beads.db
cp <backup-dir>/agent-mail.db.backup ~/.agent-mail.db

# Verify checksums
sha256sum <project>/.beads/beads.db
cat <backup-dir>/beads.db.sha256
```

---

## 5. Migration Algorithm (Step-by-Step)

### Phase 1: Pre-Flight Checks

```
1. Validate inputs
   ├─ Check prefix format (^[a-z][a-z0-9-]*$)
   ├─ Check prefixes are different
   └─ Verify prefixes don't contain special SQL chars

2. Validate project
   ├─ Check project directory exists
   ├─ Check .beads/beads.db exists
   ├─ Check database is readable/writable
   └─ Check database is not corrupted (PRAGMA integrity_check)

3. Validate Agent Mail DB
   ├─ Check ~/.agent-mail.db exists (optional)
   ├─ Check database is readable/writable
   └─ Check not corrupted

4. Analyze source data
   ├─ Count tasks with source prefix
   ├─ Count dependency references
   ├─ Count Agent Mail threads
   └─ Count file reservations

5. Detect collisions
   ├─ Build translation map
   ├─ Check for existing target IDs
   └─ If collisions found → ABORT with error report
```

### Phase 2: Backup

```
1. Create backup directory
   Format: <project>/.beads/backups/migration_<from>_to_<to>_<timestamp>

2. Backup Beads database
   ├─ Copy beads.db → beads.db.backup
   ├─ Calculate SHA256 checksum
   └─ Write checksum to beads.db.sha256

3. Backup Agent Mail database (if exists)
   ├─ Copy agent-mail.db → agent-mail.db.backup
   ├─ Calculate SHA256 checksum
   └─ Write checksum to agent-mail.db.sha256

4. Create metadata file
   ├─ Timestamp
   ├─ Source/target prefixes
   ├─ Database paths
   ├─ Checksums
   └─ Task counts
```

### Phase 3: Beads Database Migration

```sql
BEGIN TRANSACTION;

-- CRITICAL: Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- 1. Update primary key (issues.id)
UPDATE issues
SET id = REPLACE(id, '${FROM_PREFIX}-', '${TO_PREFIX}-')
WHERE id LIKE '${FROM_PREFIX}-%';
-- Cascades to: dependencies, labels, comments, events, dirty_issues,
--              export_hashes, child_counters, issue_snapshots

-- 2. Update event values (may contain task IDs)
UPDATE events
SET old_value = REPLACE(old_value, '${FROM_PREFIX}-', '${TO_PREFIX}-')
WHERE old_value LIKE '%${FROM_PREFIX}-%';

UPDATE events
SET new_value = REPLACE(new_value, '${FROM_PREFIX}-', '${TO_PREFIX}-')
WHERE new_value LIKE '%${FROM_PREFIX}-%';

-- 3. Validate counts
-- (Check row counts match before/after)

COMMIT;
```

**Foreign Key Cascade Flow:**

```
issues.id UPDATE
  ↓
  ├─→ dependencies.issue_id (CASCADE UPDATE)
  ├─→ dependencies.depends_on_id (CASCADE UPDATE)
  ├─→ labels.issue_id (CASCADE UPDATE)
  ├─→ comments.issue_id (CASCADE UPDATE)
  ├─→ events.issue_id (CASCADE UPDATE)
  ├─→ dirty_issues.issue_id (CASCADE UPDATE)
  ├─→ export_hashes.issue_id (CASCADE UPDATE)
  ├─→ child_counters.parent_id (CASCADE UPDATE)
  └─→ issue_snapshots.issue_id (CASCADE UPDATE)
```

### Phase 4: Agent Mail Database Migration

```sql
BEGIN TRANSACTION;

-- 1. Update message thread IDs
UPDATE messages
SET thread_id = REPLACE(thread_id, '${FROM_PREFIX}-', '${TO_PREFIX}-')
WHERE thread_id LIKE '${FROM_PREFIX}-%';

-- 2. Update message subjects (may mention task IDs)
-- OPTIONAL: Update subject lines for clarity
-- Disabled by default (preserve original subjects)

-- 3. Update file reservation reasons
UPDATE file_reservations
SET reason = REPLACE(reason, '${FROM_PREFIX}-', '${TO_PREFIX}-')
WHERE reason LIKE '%${FROM_PREFIX}-%';

COMMIT;
```

### Phase 5: Post-Migration Validation

```
1. Validate Beads DB
   ├─ Check no tasks remain with old prefix
   ├─ Check no dependencies with old prefix
   ├─ Check no labels/comments/events with old prefix
   ├─ Verify task count unchanged
   └─ Verify dependency count unchanged

2. Validate Agent Mail DB
   ├─ Check no thread_ids with old prefix
   ├─ Check no file reservation reasons with old prefix
   └─ Verify message count unchanged

3. Verify referential integrity
   ├─ Run PRAGMA foreign_key_check (Beads)
   └─ Check for orphaned rows

4. Smoke tests
   ├─ bd list --json | jq -r '.[].id' (should show new prefix)
   ├─ bd show <new-id> (should work)
   └─ bd dep tree <new-id> (should show updated deps)
```

---

## 6. Edge Cases and Error Handling

### 6.1 Collision Scenarios

| Scenario | Example | Detection | Resolution |
|----------|---------|-----------|------------|
| Exact ID exists | dirt-abc → chimaro-abc (already exists) | Pre-flight SQL query | ABORT migration |
| Partial prefix match | dirt-chimaro-abc exists | Prefix validation | Disallow "chimaro" as source prefix |
| Case sensitivity | DIRT-abc vs dirt-abc | SQLite is case-insensitive for TEXT | No issue (SQLite handles) |

### 6.2 Transaction Failures

| Error | Cause | Recovery |
|-------|-------|----------|
| SQLITE_BUSY | Database locked | Retry with exponential backoff |
| SQLITE_CONSTRAINT | FK violation | Rollback, check FKs enabled |
| SQLITE_CORRUPT | Database corrupted | Restore from backup |
| SQLITE_FULL | Disk full | Free space, retry |

### 6.3 Data Integrity Issues

| Issue | Detection | Prevention |
|-------|-----------|------------|
| Orphaned dependencies | Count deps before/after | Foreign key constraints |
| Orphaned labels | Count labels before/after | Foreign key constraints |
| Lost comments | Count comments before/after | Foreign key constraints |
| Broken thread refs | Check Agent Mail threads | No FKs (accept stale refs) |

### 6.4 Special Characters in IDs

**Current ID Format:**
- Prefix: lowercase letters/numbers/hyphens
- Separator: single hyphen (-)
- Suffix: base-62 (0-9, a-z, A-Z)

**Edge Cases:**
- Multiple hyphens in prefix: `my-project-name-abc` ✅ Valid
- Hyphen at end: `myproject--abc` ❌ Invalid (double hyphen)
- Special SQL chars: Single quote ('), double quote ("), backslash (\) ❌ Rejected by validation

**Escaping Strategy:**
- Use parameterized queries (not string concatenation)
- Validate prefixes with regex before use
- No special escaping needed (prefixes are alphanumeric+hyphen only)

### 6.5 Large Dataset Handling

**Current Dataset:** 389 tasks (chimaro project)

**Scalability Analysis:**

| Task Count | Memory Usage | Transaction Time | Risk Level |
|------------|--------------|------------------|------------|
| < 1,000 | < 100 KB | < 1 second | Low |
| 1,000 - 10,000 | < 1 MB | 1-5 seconds | Low |
| 10,000 - 100,000 | < 10 MB | 5-30 seconds | Medium |
| > 100,000 | > 10 MB | > 30 seconds | High |

**For datasets > 10,000 tasks:**
- Consider batch processing (1000 tasks per transaction)
- Monitor memory usage during translation map build
- Add progress reporting (every 1000 tasks)

**Current Implementation:**
- Single transaction (optimal for < 10,000 tasks)
- In-memory translation map (minimal memory)
- No batching needed for typical use case

### 6.6 Concurrent Access

**Scenario:** Another process accessing database during migration

**Detection:**
- `SQLITE_BUSY` error
- Transaction timeout

**Prevention:**
- Check for daemon: `bd daemon status`
- Recommend stopping daemon: `bd daemon stop`
- Acquire exclusive lock early in transaction

**Recovery:**
- Retry with exponential backoff
- Max retries: 5
- Max wait: 30 seconds
- If still busy → ABORT with clear error message

---

## 7. Validation Checks (Pre and Post)

### 7.1 Pre-Migration Validation

```bash
# Input validation
✓ FROM_PREFIX matches ^[a-z][a-z0-9-]*$
✓ TO_PREFIX matches ^[a-z][a-z0-9-]*$
✓ FROM_PREFIX ≠ TO_PREFIX
✓ Project directory exists
✓ Beads database exists and accessible
✓ Agent Mail database exists and accessible (or skip)

# Database validation
✓ PRAGMA integrity_check = 'ok'
✓ PRAGMA foreign_key_check returns 0 rows
✓ Database is writable (not read-only)

# Collision detection
✓ No target IDs already exist
✓ No target prefixes in messages/reservations (optional warning)

# Data analysis
✓ Task count > 0 (something to migrate)
✓ All task IDs match expected format
```

### 7.2 Post-Migration Validation

```bash
# Beads database
✓ SELECT COUNT(*) FROM issues WHERE id LIKE '${FROM_PREFIX}-%' = 0
✓ SELECT COUNT(*) FROM dependencies WHERE issue_id LIKE '${FROM_PREFIX}-%' = 0
✓ SELECT COUNT(*) FROM dependencies WHERE depends_on_id LIKE '${FROM_PREFIX}-%' = 0
✓ SELECT COUNT(*) FROM labels WHERE issue_id LIKE '${FROM_PREFIX}-%' = 0
✓ SELECT COUNT(*) FROM comments WHERE issue_id LIKE '${FROM_PREFIX}-%' = 0
✓ SELECT COUNT(*) FROM events WHERE issue_id LIKE '${FROM_PREFIX}-%' = 0

# Agent Mail database
✓ SELECT COUNT(DISTINCT thread_id) FROM messages WHERE thread_id LIKE '${FROM_PREFIX}-%' = 0
✓ SELECT COUNT(*) FROM file_reservations WHERE reason LIKE '%${FROM_PREFIX}-%' = 0

# Count validation
✓ Task count before = Task count after
✓ Dependency count before = Dependency count after
✓ Label count before = Label count after
✓ Comment count before = Comment count after

# Referential integrity
✓ PRAGMA foreign_key_check returns 0 rows
✓ No orphaned dependencies
✓ No orphaned labels
✓ No orphaned comments
```

### 7.3 Validation Error Handling

**If validation fails:**
1. Do NOT commit transaction
2. Rollback changes
3. Report specific validation errors
4. Provide rollback instructions
5. Exit with error code 2

**Example validation failure:**
```
❌ Validation failed: 5 tasks still have old prefix
   - dirt-abc
   - dirt-xyz
   - dirt-123
   - dirt-456
   - dirt-789

This indicates a migration error. Rolling back...
✓ Rolled back transaction
✓ Database restored to pre-migration state

Backup available at: <backup-dir>
To investigate: sqlite3 <backup-dir>/beads.db.backup
```

---

## 8. Algorithm Pseudocode

```python
def migrate_prefix(from_prefix, to_prefix, project_path, dry_run=False):
    """
    Migrate Beads task ID prefix from old to new.

    Args:
        from_prefix: Old prefix (e.g., "dirt")
        to_prefix: New prefix (e.g., "chimaro")
        project_path: Path to project directory
        dry_run: If True, show what would change without modifying

    Returns:
        0 on success, non-zero on failure
    """

    # PHASE 1: Pre-Flight Checks
    print("Validating inputs...")
    validate_prefix_format(from_prefix)
    validate_prefix_format(to_prefix)
    if from_prefix == to_prefix:
        error("Prefixes must be different")
        return 1

    validate_project(project_path)
    beads_db = f"{project_path}/.beads/beads.db"
    agent_mail_db = "~/.agent-mail.db"

    validate_database(beads_db)
    if exists(agent_mail_db):
        validate_database(agent_mail_db)

    print("Analyzing databases...")
    task_count = count_tasks_with_prefix(beads_db, from_prefix)
    dep_count = count_dependencies_with_prefix(beads_db, from_prefix)
    thread_count = count_threads_with_prefix(agent_mail_db, from_prefix)

    print(f"  Tasks with '{from_prefix}-' prefix: {task_count}")
    print(f"  Dependency references: {dep_count}")
    print(f"  Thread IDs with prefix: {thread_count}")

    print("Detecting collisions...")
    collision_count = detect_collisions(beads_db, from_prefix, to_prefix)
    if collision_count > 0:
        error(f"Collision detected: {collision_count} tasks would conflict")
        return 1
    print("✓ No collisions detected")

    if dry_run:
        print("[DRY RUN] Would update task IDs and dependencies")
        return 0

    # PHASE 2: Backup
    print("Creating backup...")
    backup_dir = create_backup(beads_db, agent_mail_db, from_prefix, to_prefix)
    print(f"✓ Backup created: {backup_dir}")

    # PHASE 3: Beads Database Migration
    print("Migrating Beads database...")
    try:
        with sqlite_transaction(beads_db) as db:
            db.execute("PRAGMA foreign_keys = ON")

            # Update primary key (cascades to FKs)
            db.execute("""
                UPDATE issues
                SET id = REPLACE(id, ?, ?)
                WHERE id LIKE ? || '-%'
            """, (from_prefix, to_prefix, from_prefix))

            # Update event values (may contain task IDs)
            db.execute("""
                UPDATE events
                SET old_value = REPLACE(old_value, ?, ?)
                WHERE old_value LIKE '%' || ? || '-%'
            """, (from_prefix, to_prefix, from_prefix))

            db.execute("""
                UPDATE events
                SET new_value = REPLACE(new_value, ?, ?)
                WHERE new_value LIKE '%' || ? || '-%'
            """, (from_prefix, to_prefix, from_prefix))

            # Transaction commits on context exit

        print("✓ Beads database migration complete")

    except Exception as e:
        error(f"Beads database migration failed: {e}")
        print(f"Backup available at: {backup_dir}")
        return 2

    # PHASE 4: Agent Mail Database Migration
    if exists(agent_mail_db):
        print("Migrating Agent Mail database...")
        try:
            with sqlite_transaction(agent_mail_db) as db:
                # Update thread IDs
                db.execute("""
                    UPDATE messages
                    SET thread_id = REPLACE(thread_id, ?, ?)
                    WHERE thread_id LIKE ? || '-%'
                """, (from_prefix, to_prefix, from_prefix))

                # Update file reservation reasons
                db.execute("""
                    UPDATE file_reservations
                    SET reason = REPLACE(reason, ?, ?)
                    WHERE reason LIKE '%' || ? || '-%'
                """, (from_prefix, to_prefix, from_prefix))

                # Transaction commits on context exit

            print("✓ Agent Mail database migration complete")

        except Exception as e:
            error(f"Agent Mail database migration failed: {e}")
            print(f"Backup available at: {backup_dir}")
            return 2

    # PHASE 5: Post-Migration Validation
    print("Validating migration...")

    remaining_tasks = count_tasks_with_prefix(beads_db, from_prefix)
    if remaining_tasks > 0:
        error(f"Validation failed: {remaining_tasks} tasks still have old prefix")
        print("Backup available at: {backup_dir}")
        print("To rollback: cp {backup_dir}/beads.db.backup {beads_db}")
        return 2

    remaining_deps = count_dependencies_with_prefix(beads_db, from_prefix)
    if remaining_deps > 0:
        error(f"Validation failed: {remaining_deps} dependency refs still have old prefix")
        return 2

    # Verify counts unchanged
    new_task_count = count_tasks_with_prefix(beads_db, to_prefix)
    if new_task_count != task_count:
        error(f"Validation failed: Task count mismatch ({task_count} → {new_task_count})")
        return 2

    print("✓ Validation passed")
    print("✓ Migration completed successfully")
    print(f"  All task IDs migrated from '{from_prefix}-' to '{to_prefix}-'")
    print(f"  Backup location: {backup_dir}")

    return 0


# Helper functions
def validate_prefix_format(prefix):
    """Validate prefix format (lowercase alphanumeric + hyphens)."""
    if not re.match(r'^[a-z][a-z0-9-]*$', prefix):
        raise ValueError(f"Invalid prefix: {prefix}")


def validate_project(project_path):
    """Validate project directory and structure."""
    if not os.path.exists(project_path):
        raise ValueError(f"Project directory not found: {project_path}")

    beads_dir = f"{project_path}/.beads"
    if not os.path.exists(beads_dir):
        raise ValueError(f"Beads directory not found: {beads_dir}")

    beads_db = f"{beads_dir}/beads.db"
    if not os.path.exists(beads_db):
        raise ValueError(f"Beads database not found: {beads_db}")


def validate_database(db_path):
    """Validate database integrity and accessibility."""
    if not os.access(db_path, os.R_OK | os.W_OK):
        raise ValueError(f"Database not readable/writable: {db_path}")

    # Check integrity
    result = sqlite3_exec(db_path, "PRAGMA integrity_check")
    if result != "ok":
        raise ValueError(f"Database corrupted: {db_path}")


def count_tasks_with_prefix(db_path, prefix):
    """Count tasks with given prefix."""
    return sqlite3_query(db_path,
        "SELECT COUNT(*) FROM issues WHERE id LIKE ? || '-%'",
        (prefix,))


def detect_collisions(db_path, from_prefix, to_prefix):
    """Detect ID collisions."""
    return sqlite3_query(db_path, """
        SELECT COUNT(*)
        FROM issues
        WHERE id LIKE ? || '-%'
        AND REPLACE(id, ? || '-', ? || '-') IN (SELECT id FROM issues)
    """, (from_prefix, from_prefix, to_prefix))


@contextmanager
def sqlite_transaction(db_path):
    """Context manager for SQLite transaction."""
    conn = sqlite3.connect(db_path)
    conn.execute("BEGIN TRANSACTION")
    try:
        yield conn
        conn.execute("COMMIT")
    except:
        conn.execute("ROLLBACK")
        raise
    finally:
        conn.close()
```

---

## 9. Implementation Notes

### 9.1 SQLite Version Requirements

**Minimum Version:** SQLite 3.6.19 (2009-10-14)
- Foreign key support introduced
- `PRAGMA foreign_keys` available

**Recommended Version:** SQLite 3.35.0+ (2021-03-12)
- Better transaction performance
- Improved foreign key handling

**Check Version:**
```bash
sqlite3 --version
# 3.46.1 2024-08-13 09:16:08 ...  (example)
```

### 9.2 Performance Optimization

**Index Usage:**
- `idx_issues_status` → Fast filtering by status
- `idx_dependencies_issue` → Fast dependency lookups
- `idx_dependencies_depends_on` → Fast reverse dependencies

**Transaction Optimization:**
- Use single transaction (avoid multiple BEGIN/COMMIT cycles)
- Disable journal sync for speed (already atomic on modern filesystems)
- Use WAL mode for better concurrency (optional)

**Batch Size:**
- For < 10,000 tasks: Single transaction (optimal)
- For > 10,000 tasks: Consider batching (1000 per transaction)

### 9.3 Testing Strategy

**Unit Tests:**
- ✓ Prefix validation (valid/invalid formats)
- ✓ Collision detection (various scenarios)
- ✓ Translation map generation
- ✓ SQL query construction

**Integration Tests:**
- ✓ Small dataset (10 tasks, 5 dependencies)
- ✓ Medium dataset (100 tasks, 50 dependencies)
- ✓ Large dataset (1000 tasks, 500 dependencies)
- ✓ Edge cases (special chars, multiple hyphens)

**System Tests:**
- ✓ Full chimaro migration (389 tasks)
- ✓ Rollback and restore
- ✓ Concurrent access handling
- ✓ Dry-run accuracy

---

## 10. Future Enhancements

### 10.1 Potential Improvements

1. **Progress Reporting:**
   - Show progress bar during migration
   - Report every 100 tasks processed
   - Estimate time remaining

2. **Parallel Processing:**
   - Migrate Beads and Agent Mail in parallel
   - Use multiple connections for large datasets
   - Coordinate with semaphores/mutexes

3. **Incremental Migration:**
   - Support migrating subset of tasks
   - Filter by status, priority, or labels
   - Useful for staged rollouts

4. **Migration History:**
   - Store migration metadata in database
   - Track all historical prefix changes
   - Support multiple migrations over time

5. **Automated Testing:**
   - Generate test databases with known structure
   - Verify migration correctness automatically
   - Regression test suite

### 10.2 Known Limitations

1. **No git history rewriting:**
   - Commit messages still reference old prefix
   - Intentional (preserves history)
   - Document mapping for reference

2. **No external system updates:**
   - JIRA, Linear, GitHub issues not updated
   - External references may break
   - Manual update required if needed

3. **No message body updates:**
   - Agent Mail message bodies unchanged
   - May contain old prefix in markdown text
   - Intentional (preserve original messages)

4. **No file content updates:**
   - Source code comments not updated
   - Documentation not updated
   - README/CHANGELOG not updated
   - Manual update recommended

---

## Appendix A: SQL Queries Reference

### Count Tasks by Prefix

```sql
SELECT COUNT(*) as task_count
FROM issues
WHERE id LIKE 'dirt-%';
```

### Find All Dependency References

```sql
SELECT issue_id, depends_on_id
FROM dependencies
WHERE issue_id LIKE 'dirt-%'
   OR depends_on_id LIKE 'dirt-%';
```

### Find Thread IDs

```sql
SELECT DISTINCT thread_id
FROM messages
WHERE thread_id LIKE 'dirt-%';
```

### Find File Reservations

```sql
SELECT id, agent_id, path_pattern, reason
FROM file_reservations
WHERE reason LIKE '%dirt-%';
```

### Collision Detection Query

```sql
SELECT
    old.id as old_id,
    REPLACE(old.id, 'dirt-', 'chimaro-') as new_id,
    new.id as existing_id
FROM issues old
LEFT JOIN issues new ON REPLACE(old.id, 'dirt-', 'chimaro-') = new.id
WHERE old.id LIKE 'dirt-%'
  AND new.id IS NOT NULL;
```

---

## Appendix B: Error Codes

| Code | Meaning | Recovery |
|------|---------|----------|
| 0 | Success | N/A |
| 1 | Invalid arguments or validation failed | Fix inputs, retry |
| 2 | Database error (migration or validation failed) | Restore from backup |
| 3 | Backup/restore failed | Check permissions, disk space |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Cascade Update** | Automatic update of dependent rows when parent row changes |
| **Collision** | When target ID already exists in database |
| **Dry-Run** | Preview mode that shows changes without modifying data |
| **Foreign Key** | Column that references primary key in another table |
| **Prefix** | First part of task ID (e.g., "dirt" in "dirt-abc") |
| **Referential Integrity** | Ensuring all foreign key references are valid |
| **Rollback** | Undoing transaction changes |
| **Suffix** | Last part of task ID (e.g., "abc" in "dirt-abc") |
| **Thread ID** | Grouping identifier for related messages |
| **Transaction** | Atomic unit of database operations (all-or-nothing) |
| **Translation Map** | Mapping from old IDs to new IDs |

---

**End of Design Document**

**Status:** ✅ Complete
**Next Steps:**
- Implementation in beads-migrate-prefix.sh (already done in jat-8f3x)
- Testing on isolated copy (jat-f9pa)
- Production migration (jat-y84z)
