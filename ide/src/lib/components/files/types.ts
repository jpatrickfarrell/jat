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

// ─── File icon definitions ────────────────────────────────────────────────────

export interface FileIconDef {
	d: string;
	color: string;
}

// Heroicons outline paths (24px viewBox)
const P_CODE     = 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5';
const P_DOC      = 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z';
const P_CONFIG   = 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75';
const P_IMAGE    = 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z';
const P_TERMINAL = 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z';
const P_LOCK     = 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z';
const P_KEY      = 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z';
const P_DB       = 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125';
const P_PACKAGE  = 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9';

const FILE_ICON_MAP: Record<string, FileIconDef> = {
	// TypeScript
	ts:     { d: P_CODE,     color: 'oklch(0.65 0.16 240)' },
	tsx:    { d: P_CODE,     color: 'oklch(0.65 0.16 200)' },
	mts:    { d: P_CODE,     color: 'oklch(0.65 0.16 240)' },
	cts:    { d: P_CODE,     color: 'oklch(0.65 0.16 240)' },
	// JavaScript
	js:     { d: P_CODE,     color: 'oklch(0.72 0.15 85)'  },
	jsx:    { d: P_CODE,     color: 'oklch(0.72 0.15 200)' },
	mjs:    { d: P_CODE,     color: 'oklch(0.72 0.15 85)'  },
	cjs:    { d: P_CODE,     color: 'oklch(0.72 0.15 85)'  },
	// Web frameworks
	svelte: { d: P_CODE,     color: 'oklch(0.65 0.15 45)'  },
	vue:    { d: P_CODE,     color: 'oklch(0.65 0.15 145)' },
	html:   { d: P_CODE,     color: 'oklch(0.65 0.12 30)'  },
	htm:    { d: P_CODE,     color: 'oklch(0.65 0.12 30)'  },
	// Styles
	css:    { d: P_CODE,     color: 'oklch(0.65 0.14 290)' },
	scss:   { d: P_CODE,     color: 'oklch(0.65 0.14 310)' },
	less:   { d: P_CODE,     color: 'oklch(0.65 0.14 270)' },
	// Data / config
	json:   { d: P_CONFIG,   color: 'oklch(0.68 0.10 200)' },
	yaml:   { d: P_CONFIG,   color: 'oklch(0.65 0.10 145)' },
	yml:    { d: P_CONFIG,   color: 'oklch(0.65 0.10 145)' },
	toml:   { d: P_CONFIG,   color: 'oklch(0.65 0.10 30)'  },
	xml:    { d: P_CONFIG,   color: 'oklch(0.60 0.08 250)' },
	// Docs
	md:     { d: P_DOC,      color: 'oklch(0.65 0.08 200)' },
	mdx:    { d: P_DOC,      color: 'oklch(0.65 0.08 200)' },
	txt:    { d: P_DOC,      color: 'oklch(0.55 0.03 250)' },
	// Shell
	sh:     { d: P_TERMINAL, color: 'oklch(0.65 0.14 145)' },
	bash:   { d: P_TERMINAL, color: 'oklch(0.65 0.14 145)' },
	zsh:    { d: P_TERMINAL, color: 'oklch(0.65 0.14 145)' },
	fish:   { d: P_TERMINAL, color: 'oklch(0.65 0.14 145)' },
	// Languages
	py:     { d: P_CODE,     color: 'oklch(0.65 0.14 220)' },
	go:     { d: P_CODE,     color: 'oklch(0.65 0.14 200)' },
	rs:     { d: P_CODE,     color: 'oklch(0.65 0.12 30)'  },
	rb:     { d: P_CODE,     color: 'oklch(0.65 0.15 10)'  },
	php:    { d: P_CODE,     color: 'oklch(0.60 0.10 280)' },
	java:   { d: P_CODE,     color: 'oklch(0.65 0.12 30)'  },
	kt:     { d: P_CODE,     color: 'oklch(0.65 0.14 280)' },
	swift:  { d: P_CODE,     color: 'oklch(0.68 0.14 25)'  },
	c:      { d: P_CODE,     color: 'oklch(0.60 0.10 240)' },
	cpp:    { d: P_CODE,     color: 'oklch(0.60 0.10 240)' },
	h:      { d: P_CODE,     color: 'oklch(0.60 0.08 240)' },
	cs:     { d: P_CODE,     color: 'oklch(0.60 0.12 280)' },
	// Config / lock
	lock:   { d: P_LOCK,     color: 'oklch(0.62 0.10 85)'  },
	// Images
	png:    { d: P_IMAGE,    color: 'oklch(0.65 0.10 280)' },
	jpg:    { d: P_IMAGE,    color: 'oklch(0.65 0.10 280)' },
	jpeg:   { d: P_IMAGE,    color: 'oklch(0.65 0.10 280)' },
	gif:    { d: P_IMAGE,    color: 'oklch(0.65 0.10 280)' },
	svg:    { d: P_IMAGE,    color: 'oklch(0.65 0.12 45)'  },
	ico:    { d: P_IMAGE,    color: 'oklch(0.65 0.10 280)' },
	webp:   { d: P_IMAGE,    color: 'oklch(0.65 0.10 280)' },
	avif:   { d: P_IMAGE,    color: 'oklch(0.65 0.10 280)' },
	// Data
	sql:    { d: P_DB,       color: 'oklch(0.62 0.10 200)' },
	db:     { d: P_DB,       color: 'oklch(0.62 0.10 200)' },
	// Misc
	log:    { d: P_DOC,      color: 'oklch(0.50 0.04 250)' },
	pdf:    { d: P_DOC,      color: 'oklch(0.65 0.15 25)'  },
	env:    { d: P_KEY,      color: 'oklch(0.65 0.15 25)'  },
};

const SPECIAL_FILE_ICONS: Array<[RegExp | string, FileIconDef]> = [
	['package.json',     { d: P_PACKAGE,  color: 'oklch(0.68 0.14 85)'  }],
	['package-lock.json',{ d: P_PACKAGE,  color: 'oklch(0.68 0.14 85)'  }],
	['tsconfig.json',    { d: P_CONFIG,   color: 'oklch(0.60 0.08 250)' }],
	['.eslintrc',        { d: P_CONFIG,   color: 'oklch(0.60 0.08 250)' }],
	['.eslintrc.json',   { d: P_CONFIG,   color: 'oklch(0.60 0.08 250)' }],
	['.prettierrc',      { d: P_CONFIG,   color: 'oklch(0.60 0.08 250)' }],
	['vite.config.ts',   { d: P_CONFIG,   color: 'oklch(0.60 0.08 250)' }],
	['vite.config.js',   { d: P_CONFIG,   color: 'oklch(0.60 0.08 250)' }],
	['.gitignore',       { d: P_DOC,      color: 'oklch(0.55 0.06 30)'  }],
	['.gitattributes',   { d: P_DOC,      color: 'oklch(0.55 0.06 30)'  }],
	['readme.md',        { d: P_DOC,      color: 'oklch(0.65 0.10 200)' }],
	['claude.md',        { d: P_DOC,      color: 'oklch(0.65 0.10 200)' }],
	['agents.md',        { d: P_DOC,      color: 'oklch(0.65 0.10 200)' }],
	['license',          { d: P_DOC,      color: 'oklch(0.55 0.05 250)' }],
	['license.md',       { d: P_DOC,      color: 'oklch(0.55 0.05 250)' }],
	['license.txt',      { d: P_DOC,      color: 'oklch(0.55 0.05 250)' }],
	[/^dockerfile/i,     { d: P_TERMINAL, color: 'oklch(0.60 0.12 220)' }],
	[/^\.env/,           { d: P_KEY,      color: 'oklch(0.65 0.15 25)'  }],
];

const FILE_ICON_FALLBACK: FileIconDef = { d: P_DOC, color: 'oklch(0.50 0.03 250)' };

export function getFileIconDef(filename: string): FileIconDef {
	const lower = filename.toLowerCase();
	for (const [matcher, def] of SPECIAL_FILE_ICONS) {
		if (typeof matcher === 'string' ? lower === matcher : matcher.test(lower)) return def;
	}
	const ext = lower.split('.').pop() ?? '';
	return FILE_ICON_MAP[ext] ?? FILE_ICON_FALLBACK;
}

// ─── Git status visuals ───────────────────────────────────────────────────────

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
