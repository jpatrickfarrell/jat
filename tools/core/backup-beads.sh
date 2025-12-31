#!/usr/bin/env bash
#
# backup-beads.sh - Standalone Beads database backup utility
#
# Creates timestamped backups of Beads and Agent Mail databases with
# SHA256 checksums for integrity verification.
#
# Usage:
#   ./backup-beads.sh --project PATH [--label LABEL] [--verify]
#
# Example:
#   ./backup-beads.sh --project ~/code/chimaro --label "before-migration"
#

set -euo pipefail

# Script metadata
SCRIPT_NAME="backup-beads.sh"
VERSION="1.0.0"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_PATH=""
BACKUP_LABEL=""
VERIFY_MODE=false
AGENT_MAIL_DB="$HOME/.agent-mail.db"
BACKUP_DIR_RESULT=""

#
# Logging functions
#
log_error() {
    echo -e "${RED}✗${NC}  $1" >&2
}

log_success() {
    echo -e "${GREEN}✓${NC}  $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

log_info() {
    echo -e "${CYAN}ℹ${NC}  $1"
}

#
# Help text
#
show_help() {
    cat <<EOF
${SCRIPT_NAME} v${VERSION} - Standalone Beads database backup utility

USAGE:
    $SCRIPT_NAME --project PATH [OPTIONS]

OPTIONS:
    --project PATH      Path to Beads project directory (required)
    --label LABEL       Optional label for backup (e.g., "before-migration")
    --verify            Verify backup integrity after creation
    --help              Show this help message
    --version           Show version information

DESCRIPTION:
    Creates timestamped backups of:
    - Beads database (.beads/beads.db)
    - Agent Mail database (~/.agent-mail.db, if exists)

    Each backup includes:
    - Timestamped directory
    - SHA256 checksums
    - Metadata file with backup details

BACKUP LOCATION:
    <project>/.beads/backups/backup_<timestamp>[_<label>]/

EXAMPLES:
    # Basic backup
    $SCRIPT_NAME --project ~/code/chimaro

    # Labeled backup (for specific purpose)
    $SCRIPT_NAME --project ~/code/chimaro --label "before-migration"

    # Backup with verification
    $SCRIPT_NAME --project ~/code/chimaro --verify

EXIT CODES:
    0   Success
    1   Invalid arguments or validation failed
    3   Backup/verification failed

SEE ALSO:
    rollback-beads.sh - Restore from backup
    beads-migrate-prefix.sh - Full migration tool with integrated backup

EOF
}

show_version() {
    echo "${SCRIPT_NAME} v${VERSION}"
}

#
# Argument parsing
#
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --project)
                PROJECT_PATH="$2"
                shift 2
                ;;
            --label)
                BACKUP_LABEL="$2"
                shift 2
                ;;
            --verify)
                VERIFY_MODE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            --version)
                show_version
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Run with --help for usage information"
                exit 1
                ;;
        esac
    done

    # Validate required arguments
    if [[ -z "$PROJECT_PATH" ]]; then
        log_error "Missing required argument: --project"
        echo "Run with --help for usage information"
        exit 1
    fi

    # Expand tilde in path
    PROJECT_PATH="${PROJECT_PATH/#\~/$HOME}"
}

#
# Validation functions
#
validate_project() {
    # Check project directory exists
    if [[ ! -d "$PROJECT_PATH" ]]; then
        log_error "Project directory does not exist: $PROJECT_PATH"
        return 1
    fi

    # Check .beads directory exists
    if [[ ! -d "${PROJECT_PATH}/.beads" ]]; then
        log_error "Beads directory not found: ${PROJECT_PATH}/.beads"
        log_error "This does not appear to be a Beads project"
        return 1
    fi

    local beads_db="${PROJECT_PATH}/.beads/beads.db"

    # Check beads.db exists
    if [[ ! -f "$beads_db" ]]; then
        log_error "Beads database not found: $beads_db"
        return 1
    fi

    # Check database is readable
    if [[ ! -r "$beads_db" ]]; then
        log_error "Beads database is not readable: $beads_db"
        return 1
    fi

    return 0
}

#
# Backup functions
#
create_backup() {
    local beads_db="${PROJECT_PATH}/.beads/beads.db"

    log_info "Creating backup..."

    # Create backup directory with timestamp
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)

    local backup_dir_name="backup_${timestamp}"
    if [[ -n "$BACKUP_LABEL" ]]; then
        backup_dir_name="${backup_dir_name}_${BACKUP_LABEL}"
    fi

    local backup_dir="${PROJECT_PATH}/.beads/backups/${backup_dir_name}"

    mkdir -p "$backup_dir"

    # Backup Beads database
    log_info "Backing up Beads database..."
    cp "$beads_db" "${backup_dir}/beads.db.backup"

    # Create checksum
    local beads_checksum
    beads_checksum=$(sha256sum "$beads_db" | awk '{print $1}')
    echo "$beads_checksum" > "${backup_dir}/beads.db.sha256"

    log_success "Beads database backed up"
    log_info "  Location: ${backup_dir}/beads.db.backup"
    log_info "  Checksum: $beads_checksum"

    # Backup Agent Mail database if it exists
    local agent_mail_backed_up=false
    if [[ -f "$AGENT_MAIL_DB" ]]; then
        log_info "Backing up Agent Mail database..."
        cp "$AGENT_MAIL_DB" "${backup_dir}/agent-mail.db.backup"

        # Create checksum
        local agent_mail_checksum
        agent_mail_checksum=$(sha256sum "$AGENT_MAIL_DB" | awk '{print $1}')
        echo "$agent_mail_checksum" > "${backup_dir}/agent-mail.db.sha256"

        log_success "Agent Mail database backed up"
        log_info "  Location: ${backup_dir}/agent-mail.db.backup"
        log_info "  Checksum: $agent_mail_checksum"
        agent_mail_backed_up=true
    else
        log_warning "Agent Mail database not found: $AGENT_MAIL_DB"
        log_warning "Skipping Agent Mail backup"
    fi

    # Create backup metadata
    cat > "${backup_dir}/metadata.txt" <<EOF
Beads Backup
Created: $(date)
Script: $SCRIPT_NAME v$VERSION
Project: $PROJECT_PATH
Label: ${BACKUP_LABEL:-none}

Beads DB: $beads_db
Beads Checksum: $beads_checksum

EOF

    if [[ "$agent_mail_backed_up" == true ]]; then
        cat >> "${backup_dir}/metadata.txt" <<EOF
Agent Mail DB: $AGENT_MAIL_DB
Agent Mail Checksum: $agent_mail_checksum
EOF
    fi

    log_success "Backup created: $backup_dir"

    # Store backup directory path in global variable for verification
    BACKUP_DIR_RESULT="$backup_dir"
}

#
# Verification functions
#
verify_backup() {
    local backup_dir="$1"
    local beads_db="${PROJECT_PATH}/.beads/beads.db"

    log_info "Verifying backup integrity..."

    # Verify Beads backup exists
    if [[ ! -f "${backup_dir}/beads.db.backup" ]]; then
        log_error "Beads backup file not found: ${backup_dir}/beads.db.backup"
        return 1
    fi

    # Verify Beads checksum
    local stored_checksum
    stored_checksum=$(cat "${backup_dir}/beads.db.sha256")

    local backup_checksum
    backup_checksum=$(sha256sum "${backup_dir}/beads.db.backup" | awk '{print $1}')

    if [[ "$stored_checksum" != "$backup_checksum" ]]; then
        log_error "Beads backup checksum mismatch!"
        log_error "  Expected: $stored_checksum"
        log_error "  Got: $backup_checksum"
        return 1
    fi

    log_success "Beads backup integrity verified"

    # Verify Agent Mail backup if it exists
    if [[ -f "${backup_dir}/agent-mail.db.backup" ]]; then
        local agent_stored_checksum
        agent_stored_checksum=$(cat "${backup_dir}/agent-mail.db.sha256")

        local agent_backup_checksum
        agent_backup_checksum=$(sha256sum "${backup_dir}/agent-mail.db.backup" | awk '{print $1}')

        if [[ "$agent_stored_checksum" != "$agent_backup_checksum" ]]; then
            log_error "Agent Mail backup checksum mismatch!"
            log_error "  Expected: $agent_stored_checksum"
            log_error "  Got: $agent_backup_checksum"
            return 1
        fi

        log_success "Agent Mail backup integrity verified"
    fi

    # Compare record counts (sanity check)
    log_info "Verifying record counts..."

    local original_count
    original_count=$(sqlite3 "$beads_db" "SELECT COUNT(*) FROM issues;")

    local backup_count
    backup_count=$(sqlite3 "${backup_dir}/beads.db.backup" "SELECT COUNT(*) FROM issues;")

    if [[ "$original_count" != "$backup_count" ]]; then
        log_error "Record count mismatch!"
        log_error "  Original: $original_count"
        log_error "  Backup: $backup_count"
        return 1
    fi

    log_success "Record count verified: $original_count tasks"
    log_success "Backup verification complete"

    return 0
}

#
# Main execution
#
main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║                    Beads Database Backup Tool v${VERSION}                   ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""

    # Parse arguments
    parse_args "$@"

    # Display configuration
    log_info "Configuration:"
    log_info "  Project: $PROJECT_PATH"
    log_info "  Beads DB: ${PROJECT_PATH}/.beads/beads.db"
    log_info "  Agent Mail DB: $AGENT_MAIL_DB"
    if [[ -n "$BACKUP_LABEL" ]]; then
        log_info "  Label: $BACKUP_LABEL"
    fi
    if [[ "$VERIFY_MODE" == true ]]; then
        log_info "  Verify: enabled"
    fi
    echo ""

    # Validate inputs
    if ! validate_project; then
        exit 1
    fi
    echo ""

    # Create backup
    create_backup
    echo ""

    # Verify backup if requested
    if [[ "$VERIFY_MODE" == true ]]; then
        if ! verify_backup "$BACKUP_DIR_RESULT"; then
            log_error "Backup verification failed"
            exit 3
        fi
        echo ""
    fi

    # Success!
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║                    ✓ BACKUP COMPLETED SUCCESSFULLY                       ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""

    log_success "Backup location: $BACKUP_DIR_RESULT"
    echo ""

    log_info "To restore from this backup, run:"
    log_info "  ./rollback-beads.sh --backup \"$BACKUP_DIR_RESULT\""
    echo ""
}

# Run main function
main "$@"
