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
}

export interface FileNode {
	name: string;
	path: string;
	isDirectory: boolean;
	children?: FileNode[];
}
