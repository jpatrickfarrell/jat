/**
 * Types for the Files components
 */

export interface OpenFile {
	path: string;
	content: string;
	dirty: boolean;
	originalContent: string;
}

export interface FileNode {
	name: string;
	path: string;
	isDirectory: boolean;
	children?: FileNode[];
}
