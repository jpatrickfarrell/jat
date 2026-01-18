/**
 * Types for the Files components
 */

export interface OpenFile {
	path: string;
	content: string;
	dirty: boolean;
	originalContent: string;
	/** True if file is a media file (image, video, audio, pdf) */
	isMedia?: boolean;
	/** True if the file on disk differs from originalContent (external change detected) */
	hasDiskChanges?: boolean;
	/** Content from disk when hasDiskChanges is true (for diff view) */
	diskContent?: string;
}

export interface FileNode {
	name: string;
	path: string;
	isDirectory: boolean;
	children?: FileNode[];
}

/**
 * Git status for a file
 */
export type GitFileStatus =
	| 'modified'     // M - File has been modified
	| 'staged'       // S - File is staged for commit
	| 'added'        // A - New file (untracked or staged)
	| 'deleted'      // D - File has been deleted
	| 'renamed'      // R - File has been renamed
	| 'conflicted'   // C - File has merge conflicts
	| 'untracked';   // ? - File is not tracked by git

/**
 * Git status information for the repository
 */
export interface GitStatusInfo {
	/** Number of commits ahead of remote */
	ahead: number;
	/** Number of commits behind remote */
	behind: number;
	/** Current branch name */
	branch: string | null;
	/** Whether the repo is clean (no changes) */
	isClean: boolean;
	/** Map of file path to git status */
	fileStatuses: Map<string, GitFileStatus>;
}

/**
 * Visual configuration for git status indicators
 */
export const GIT_STATUS_VISUALS: Record<GitFileStatus, { letter: string; color: string; label: string }> = {
	modified: { letter: 'M', color: 'oklch(0.65 0.15 85)', label: 'Modified' },      // Yellow/amber
	staged: { letter: 'S', color: 'oklch(0.65 0.15 145)', label: 'Staged' },         // Green
	added: { letter: 'A', color: 'oklch(0.65 0.15 145)', label: 'Added' },           // Green
	deleted: { letter: 'D', color: 'oklch(0.65 0.15 25)', label: 'Deleted' },        // Red
	renamed: { letter: 'R', color: 'oklch(0.65 0.15 200)', label: 'Renamed' },       // Blue
	conflicted: { letter: 'C', color: 'oklch(0.65 0.18 25)', label: 'Conflicted' },  // Bright red
	untracked: { letter: '?', color: 'oklch(0.55 0.08 250)', label: 'Untracked' }    // Gray
};
