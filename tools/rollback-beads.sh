#!/usr/bin/env bash
#
# rollback-beads.sh - Restore Beads database from backup
#
# Safely restores Beads and Agent Mail databases from a timestamped backup,
# with checksum verification for integrity.
#
# Usage:
#   ./rollback-beads.sh --backup PATH [--verify] [--force]
#
# Example:
#   ./rollback-beads.sh --backup ~/code/chimaro/.beads/backups/backup_20231124_123456
#

set -euo pipefail

# Script metadata
SCRIPT_NAME="rollback-beads.sh"
VERSION="1.0.0"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR=""
VERIFY_MODE=false
FORCE_MODE=false
AGENT_MAIL_DB="$HOME/.agent-mail.db"

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
${SCRIPT_NAME} v${VERSION} - Restore Beads database from backup

USAGE:
    $SCRIPT_NAME --backup PATH [OPTIONS]

OPTIONS:
    --backup PATH       Path to backup directory (required)
    --verify            Verify backup integrity before restoring
    --force             Skip confirmation prompt
    --help              Show this help message
    --version           Show version information

DESCRIPTION:
    Restores Beads and Agent Mail databases from a backup created by:
    - backup-beads.sh
    - beads-migrate-prefix.sh

    Safety features:
    - Checksum verification (optional with --verify)
    - Confirmation prompt (skip with --force)
    - Creates safety backup of current state before restoring
    - Validates metadata file exists

BACKUP DIRECTORY:
    Must contain:
    - beads.db.backup (required)
    - beads.db.sha256 (required for --verify)
    - agent-mail.db.backup (optional)
    - agent-mail.db.sha256 (optional, required for --verify)
    - metadata.txt (optional, but recommended)

EXAMPLES:
    # Restore with confirmation prompt
    $SCRIPT_NAME --backup ~/code/chimaro/.beads/backups/backup_20231124_123456

    # Restore with integrity check
    $SCRIPT_NAME --backup ~/code/chimaro/.beads/backups/backup_20231124_123456 --verify

    # Restore without confirmation (automated scripts)
    $SCRIPT_NAME --backup ~/code/chimaro/.beads/backups/backup_20231124_123456 --force

EXIT CODES:
    0   Success
    1   Invalid arguments or validation failed
    3   Rollback failed

SAFETY:
    This tool creates a safety backup of your current databases before
    restoring, stored in: <backup-dir>/pre-rollback_<timestamp>/

SEE ALSO:
    backup-beads.sh - Create backup
    beads-migrate-prefix.sh - Full migration tool

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
            --backup)
                BACKUP_DIR="$2"
                shift 2
                ;;
            --verify)
                VERIFY_MODE=true
                shift
                ;;
            --force)
                FORCE_MODE=true
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
    if [[ -z "$BACKUP_DIR" ]]; then
        log_error "Missing required argument: --backup"
        echo "Run with --help for usage information"
        exit 1
    fi

    # Expand tilde in path
    BACKUP_DIR="${BACKUP_DIR/#\~/$HOME}"
}

#
# Validation functions
#
validate_backup() {
    # Check backup directory exists
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_error "Backup directory does not exist: $BACKUP_DIR"
        return 1
    fi

    # Check required files exist
    if [[ ! -f "${BACKUP_DIR}/beads.db.backup" ]]; then
        log_error "Beads backup file not found: ${BACKUP_DIR}/beads.db.backup"
        return 1
    fi

    if [[ ! -f "${BACKUP_DIR}/beads.db.sha256" ]]; then
        log_warning "Checksum file not found: ${BACKUP_DIR}/beads.db.sha256"
        if [[ "$VERIFY_MODE" == true ]]; then
            log_error "Cannot verify without checksum file"
            return 1
        fi
    fi

    # Check metadata (optional but helpful)
    if [[ ! -f "${BACKUP_DIR}/metadata.txt" ]]; then
        log_warning "Metadata file not found: ${BACKUP_DIR}/metadata.txt"
        log_warning "This may not be a valid backup directory"
    fi

    return 0
}

#
# Verification functions
#
verify_backup() {
    log_info "Verifying backup integrity..."

    # Verify Beads backup checksum
    local stored_checksum
    stored_checksum=$(cat "${BACKUP_DIR}/beads.db.sha256")

    local backup_checksum
    backup_checksum=$(sha256sum "${BACKUP_DIR}/beads.db.backup" | awk '{print $1}')

    if [[ "$stored_checksum" != "$backup_checksum" ]]; then
        log_error "Beads backup checksum mismatch!"
        log_error "  Expected: $stored_checksum"
        log_error "  Got: $backup_checksum"
        log_error "Backup may be corrupted - aborting"
        return 1
    fi

    log_success "Beads backup integrity verified"

    # Verify Agent Mail backup if it exists
    if [[ -f "${BACKUP_DIR}/agent-mail.db.backup" ]]; then
        if [[ ! -f "${BACKUP_DIR}/agent-mail.db.sha256" ]]; then
            log_warning "Agent Mail backup exists but checksum missing"
            return 0
        fi

        local agent_stored_checksum
        agent_stored_checksum=$(cat "${BACKUP_DIR}/agent-mail.db.sha256")

        local agent_backup_checksum
        agent_backup_checksum=$(sha256sum "${BACKUP_DIR}/agent-mail.db.backup" | awk '{print $1}')

        if [[ "$agent_stored_checksum" != "$agent_backup_checksum" ]]; then
            log_error "Agent Mail backup checksum mismatch!"
            log_error "  Expected: $agent_stored_checksum"
            log_error "  Got: $agent_backup_checksum"
            log_error "Backup may be corrupted - aborting"
            return 1
        fi

        log_success "Agent Mail backup integrity verified"
    fi

    return 0
}

#
# Backup functions (safety backup before rollback)
#
create_safety_backup() {
    local beads_db="$1"

    log_info "Creating safety backup of current state..."

    # Create safety backup directory with timestamp
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local safety_dir="${BACKUP_DIR}/pre-rollback_${timestamp}"

    mkdir -p "$safety_dir"

    # Backup current Beads database
    if [[ -f "$beads_db" ]]; then
        cp "$beads_db" "${safety_dir}/beads.db.current"
        local beads_checksum
        beads_checksum=$(sha256sum "$beads_db" | awk '{print $1}')
        echo "$beads_checksum" > "${safety_dir}/beads.db.sha256"
        log_success "Current Beads database backed up"
    fi

    # Backup current Agent Mail database
    if [[ -f "$AGENT_MAIL_DB" ]]; then
        cp "$AGENT_MAIL_DB" "${safety_dir}/agent-mail.db.current"
        local agent_mail_checksum
        agent_mail_checksum=$(sha256sum "$AGENT_MAIL_DB" | awk '{print $1}')
        echo "$agent_mail_checksum" > "${safety_dir}/agent-mail.db.sha256"
        log_success "Current Agent Mail database backed up"
    fi

    # Create metadata
    cat > "${safety_dir}/metadata.txt" <<EOF
Safety Backup (Pre-Rollback)
Created: $(date)
Script: $SCRIPT_NAME v$VERSION
Restoring from: $BACKUP_DIR

This backup was created automatically before restoring from backup.
EOF

    log_success "Safety backup created: $safety_dir"
}

#
# Restore functions
#
restore_databases() {
    local beads_db="$1"

    log_info "Restoring databases..."

    # Restore Beads database
    log_info "Restoring Beads database..."
    cp "${BACKUP_DIR}/beads.db.backup" "$beads_db"
    log_success "Beads database restored: $beads_db"

    # Restore Agent Mail database if backup exists
    if [[ -f "${BACKUP_DIR}/agent-mail.db.backup" ]]; then
        log_info "Restoring Agent Mail database..."
        cp "${BACKUP_DIR}/agent-mail.db.backup" "$AGENT_MAIL_DB"
        log_success "Agent Mail database restored: $AGENT_MAIL_DB"
    else
        log_warning "Agent Mail backup not found - skipping"
    fi

    log_success "Database restoration complete"
}

#
# Display metadata
#
display_metadata() {
    if [[ -f "${BACKUP_DIR}/metadata.txt" ]]; then
        log_info "Backup metadata:"
        echo ""
        cat "${BACKUP_DIR}/metadata.txt" | sed 's/^/  /'
        echo ""
    fi
}

#
# Confirmation prompt
#
confirm_restore() {
    if [[ "$FORCE_MODE" == true ]]; then
        return 0
    fi

    echo ""
    log_warning "⚠️  WARNING: This will overwrite your current databases!"
    log_info "A safety backup will be created first."
    echo ""
    read -p "Are you sure you want to proceed? (yes/no): " -r
    echo ""

    if [[ ! "$REPLY" =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Rollback cancelled by user"
        exit 0
    fi
}

#
# Main execution
#
main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║                   Beads Database Rollback Tool v${VERSION}                  ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""

    # Parse arguments
    parse_args "$@"

    # Display configuration
    log_info "Configuration:"
    log_info "  Backup directory: $BACKUP_DIR"
    log_info "  Agent Mail DB: $AGENT_MAIL_DB"
    if [[ "$VERIFY_MODE" == true ]]; then
        log_info "  Verify: enabled"
    fi
    if [[ "$FORCE_MODE" == true ]]; then
        log_info "  Force: enabled (no confirmation)"
    fi
    echo ""

    # Display metadata
    display_metadata

    # Validate backup
    if ! validate_backup; then
        exit 1
    fi
    log_success "Backup directory validated"
    echo ""

    # Verify backup integrity if requested
    if [[ "$VERIFY_MODE" == true ]]; then
        if ! verify_backup; then
            exit 1
        fi
        echo ""
    fi

    # Determine Beads database path from backup metadata
    local beads_db=""
    if [[ -f "${BACKUP_DIR}/metadata.txt" ]]; then
        # Try to extract project path from metadata
        local project_path
        project_path=$(grep "^Project:" "${BACKUP_DIR}/metadata.txt" | cut -d' ' -f2-)
        if [[ -n "$project_path" ]]; then
            beads_db="${project_path}/.beads/beads.db"
        fi
    fi

    # If not found in metadata, try to infer from backup directory structure
    if [[ -z "$beads_db" ]]; then
        # Backup dir is usually: project/.beads/backups/backup_timestamp/
        # So go up 2 levels and append beads.db
        local parent_dir
        parent_dir=$(dirname "$(dirname "$BACKUP_DIR")")
        beads_db="${parent_dir}/beads.db"
    fi

    # Validate inferred path
    if [[ ! -f "$beads_db" ]] && [[ ! -d "$(dirname "$beads_db")" ]]; then
        log_error "Cannot determine Beads database location"
        log_error "Expected: $beads_db"
        log_error "Please check backup metadata or directory structure"
        exit 1
    fi

    log_info "Target Beads database: $beads_db"
    echo ""

    # Confirmation prompt
    confirm_restore

    # Create safety backup
    create_safety_backup "$beads_db"
    echo ""

    # Restore databases
    restore_databases "$beads_db"
    echo ""

    # Success!
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║                   ✓ ROLLBACK COMPLETED SUCCESSFULLY                      ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""

    log_success "Databases restored from: $BACKUP_DIR"
    echo ""

    log_info "Next steps:"
    log_info "  1. Verify database with: bd list --json | head -5"
    log_info "  2. Check task counts match expected values"
    log_info "  3. If rollback failed, safety backup is in:"
    log_info "     ${BACKUP_DIR}/pre-rollback_*/"
    echo ""
}

# Run main function
main "$@"
