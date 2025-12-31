/**
 * Unit Tests for fileUtils.ts
 *
 * Tests file type detection, icon mapping, and display utilities
 * for the file explorer and file attachment features.
 */

import { describe, it, expect } from 'vitest';
import {
	getCategoryFromMimeType,
	getCategoryFromExtension,
	getFileTypeInfo,
	getFileTypeInfoFromPath,
	formatFileSize,
	getExtensionLabel,
	canPreviewFile,
	canPreviewPath,
	getContentType,
	ALLOWED_FILE_TYPES,
	getAcceptAttribute,
	type FileCategory
} from './fileUtils';

// ============================================================================
// getCategoryFromMimeType Tests
// ============================================================================

describe('getCategoryFromMimeType', () => {
	describe('Image types', () => {
		it('should detect PNG as image', () => {
			expect(getCategoryFromMimeType('image/png')).toBe('image');
		});

		it('should detect JPEG as image', () => {
			expect(getCategoryFromMimeType('image/jpeg')).toBe('image');
		});

		it('should detect GIF as image', () => {
			expect(getCategoryFromMimeType('image/gif')).toBe('image');
		});

		it('should detect WebP as image', () => {
			expect(getCategoryFromMimeType('image/webp')).toBe('image');
		});

		it('should detect SVG as image', () => {
			expect(getCategoryFromMimeType('image/svg+xml')).toBe('image');
		});

		it('should detect unknown image/* types as image', () => {
			expect(getCategoryFromMimeType('image/unknown')).toBe('image');
		});
	});

	describe('PDF type', () => {
		it('should detect PDF', () => {
			expect(getCategoryFromMimeType('application/pdf')).toBe('pdf');
		});
	});

	describe('Text types', () => {
		it('should detect plain text', () => {
			expect(getCategoryFromMimeType('text/plain')).toBe('text');
		});

		it('should detect markdown', () => {
			expect(getCategoryFromMimeType('text/markdown')).toBe('text');
		});

		it('should detect x-markdown', () => {
			expect(getCategoryFromMimeType('text/x-markdown')).toBe('text');
		});
	});

	describe('Code types', () => {
		it('should detect JavaScript', () => {
			expect(getCategoryFromMimeType('text/javascript')).toBe('code');
		});

		it('should detect application/javascript', () => {
			expect(getCategoryFromMimeType('application/javascript')).toBe('code');
		});

		it('should detect TypeScript', () => {
			expect(getCategoryFromMimeType('text/typescript')).toBe('code');
		});

		it('should detect HTML', () => {
			expect(getCategoryFromMimeType('text/html')).toBe('code');
		});

		it('should detect CSS', () => {
			expect(getCategoryFromMimeType('text/css')).toBe('code');
		});

		it('should detect Python', () => {
			expect(getCategoryFromMimeType('text/x-python')).toBe('code');
		});

		it('should detect shell scripts', () => {
			expect(getCategoryFromMimeType('application/x-sh')).toBe('code');
		});
	});

	describe('Data types', () => {
		it('should detect JSON', () => {
			expect(getCategoryFromMimeType('application/json')).toBe('data');
		});

		it('should detect CSV', () => {
			expect(getCategoryFromMimeType('text/csv')).toBe('data');
		});

		it('should detect XML', () => {
			expect(getCategoryFromMimeType('application/xml')).toBe('data');
		});

		it('should detect YAML', () => {
			expect(getCategoryFromMimeType('application/x-yaml')).toBe('data');
		});
	});

	describe('Document types', () => {
		it('should detect Word documents', () => {
			expect(getCategoryFromMimeType('application/msword')).toBe('document');
		});

		it('should detect DOCX', () => {
			expect(
				getCategoryFromMimeType(
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
				)
			).toBe('document');
		});

		it('should detect Excel', () => {
			expect(getCategoryFromMimeType('application/vnd.ms-excel')).toBe('document');
		});

		it('should detect PowerPoint', () => {
			expect(getCategoryFromMimeType('application/vnd.ms-powerpoint')).toBe('document');
		});
	});

	describe('Fallback behavior', () => {
		it('should return file for unknown mime types', () => {
			expect(getCategoryFromMimeType('application/unknown')).toBe('file');
		});

		it('should return file for video types', () => {
			expect(getCategoryFromMimeType('video/mp4')).toBe('file');
		});

		it('should return file for audio types', () => {
			expect(getCategoryFromMimeType('audio/mpeg')).toBe('file');
		});

		it('should fallback text/* to text', () => {
			expect(getCategoryFromMimeType('text/some-unknown-type')).toBe('text');
		});
	});
});

// ============================================================================
// getCategoryFromExtension Tests
// ============================================================================

describe('getCategoryFromExtension', () => {
	describe('Image extensions', () => {
		it('should detect .png', () => {
			expect(getCategoryFromExtension('photo.png')).toBe('image');
		});

		it('should detect .jpg', () => {
			expect(getCategoryFromExtension('photo.jpg')).toBe('image');
		});

		it('should detect .jpeg', () => {
			expect(getCategoryFromExtension('photo.jpeg')).toBe('image');
		});

		it('should detect .gif', () => {
			expect(getCategoryFromExtension('animation.gif')).toBe('image');
		});

		it('should detect .webp', () => {
			expect(getCategoryFromExtension('image.webp')).toBe('image');
		});

		it('should detect .svg', () => {
			expect(getCategoryFromExtension('icon.svg')).toBe('image');
		});

		it('should detect .ico', () => {
			expect(getCategoryFromExtension('favicon.ico')).toBe('image');
		});
	});

	describe('PDF extension', () => {
		it('should detect .pdf', () => {
			expect(getCategoryFromExtension('document.pdf')).toBe('pdf');
		});
	});

	describe('Text extensions', () => {
		it('should detect .txt', () => {
			expect(getCategoryFromExtension('readme.txt')).toBe('text');
		});

		it('should detect .md', () => {
			expect(getCategoryFromExtension('README.md')).toBe('text');
		});

		it('should detect .markdown', () => {
			expect(getCategoryFromExtension('docs.markdown')).toBe('text');
		});

		it('should detect .rst', () => {
			expect(getCategoryFromExtension('docs.rst')).toBe('text');
		});

		it('should detect .log', () => {
			expect(getCategoryFromExtension('server.log')).toBe('text');
		});
	});

	describe('Code extensions', () => {
		it('should detect .js', () => {
			expect(getCategoryFromExtension('app.js')).toBe('code');
		});

		it('should detect .mjs', () => {
			expect(getCategoryFromExtension('module.mjs')).toBe('code');
		});

		it('should detect .cjs', () => {
			expect(getCategoryFromExtension('config.cjs')).toBe('code');
		});

		it('should detect .ts', () => {
			expect(getCategoryFromExtension('app.ts')).toBe('code');
		});

		it('should detect .tsx', () => {
			expect(getCategoryFromExtension('Component.tsx')).toBe('code');
		});

		it('should detect .jsx', () => {
			expect(getCategoryFromExtension('Component.jsx')).toBe('code');
		});

		it('should detect .html', () => {
			expect(getCategoryFromExtension('index.html')).toBe('code');
		});

		it('should detect .css', () => {
			expect(getCategoryFromExtension('styles.css')).toBe('code');
		});

		it('should detect .scss', () => {
			expect(getCategoryFromExtension('styles.scss')).toBe('code');
		});

		it('should detect .py', () => {
			expect(getCategoryFromExtension('script.py')).toBe('code');
		});

		it('should detect .go', () => {
			expect(getCategoryFromExtension('main.go')).toBe('code');
		});

		it('should detect .rs', () => {
			expect(getCategoryFromExtension('lib.rs')).toBe('code');
		});

		it('should detect .svelte', () => {
			expect(getCategoryFromExtension('Component.svelte')).toBe('code');
		});

		it('should detect .vue', () => {
			expect(getCategoryFromExtension('Component.vue')).toBe('code');
		});

		it('should detect .sql', () => {
			expect(getCategoryFromExtension('query.sql')).toBe('code');
		});
	});

	describe('Data extensions', () => {
		it('should detect .json', () => {
			expect(getCategoryFromExtension('config.json')).toBe('data');
		});

		it('should detect .csv', () => {
			expect(getCategoryFromExtension('data.csv')).toBe('data');
		});

		it('should detect .xml', () => {
			expect(getCategoryFromExtension('config.xml')).toBe('data');
		});

		it('should detect .yaml', () => {
			expect(getCategoryFromExtension('config.yaml')).toBe('data');
		});

		it('should detect .yml', () => {
			expect(getCategoryFromExtension('config.yml')).toBe('data');
		});

		it('should detect .toml', () => {
			expect(getCategoryFromExtension('Cargo.toml')).toBe('data');
		});
	});

	describe('Document extensions', () => {
		it('should detect .doc', () => {
			expect(getCategoryFromExtension('document.doc')).toBe('document');
		});

		it('should detect .docx', () => {
			expect(getCategoryFromExtension('document.docx')).toBe('document');
		});

		it('should detect .xls', () => {
			expect(getCategoryFromExtension('spreadsheet.xls')).toBe('document');
		});

		it('should detect .xlsx', () => {
			expect(getCategoryFromExtension('spreadsheet.xlsx')).toBe('document');
		});

		it('should detect .ppt', () => {
			expect(getCategoryFromExtension('presentation.ppt')).toBe('document');
		});

		it('should detect .pptx', () => {
			expect(getCategoryFromExtension('presentation.pptx')).toBe('document');
		});
	});

	describe('Fallback behavior', () => {
		it('should return file for unknown extensions', () => {
			expect(getCategoryFromExtension('file.xyz')).toBe('file');
		});

		it('should return file for files without extension', () => {
			expect(getCategoryFromExtension('Makefile')).toBe('file');
		});
	});
});

// ============================================================================
// getFileTypeInfo Tests
// ============================================================================

describe('getFileTypeInfo', () => {
	// Helper to create mock File objects
	function createMockFile(name: string, type: string): File {
		return new File(['content'], name, { type });
	}

	it('should return correct info for PNG image', () => {
		const file = createMockFile('photo.png', 'image/png');
		const info = getFileTypeInfo(file);

		expect(info.category).toBe('image');
		expect(info.label).toBe('Image');
		expect(info.previewable).toBe(true);
		expect(info.icon).toBeDefined();
		expect(info.color).toBeDefined();
	});

	it('should return correct info for PDF', () => {
		const file = createMockFile('document.pdf', 'application/pdf');
		const info = getFileTypeInfo(file);

		expect(info.category).toBe('pdf');
		expect(info.label).toBe('PDF');
		expect(info.previewable).toBe(false);
	});

	it('should return correct info for JSON', () => {
		const file = createMockFile('config.json', 'application/json');
		const info = getFileTypeInfo(file);

		expect(info.category).toBe('data');
		expect(info.label).toBe('Data');
		expect(info.previewable).toBe(false);
	});

	it('should fallback to extension when MIME type is generic', () => {
		const file = createMockFile('script.py', 'application/octet-stream');
		const info = getFileTypeInfo(file);

		expect(info.category).toBe('code');
		expect(info.label).toBe('Code');
	});

	it('should return file category for unknown types', () => {
		const file = createMockFile('unknown.xyz', 'application/octet-stream');
		const info = getFileTypeInfo(file);

		expect(info.category).toBe('file');
		expect(info.label).toBe('File');
		expect(info.previewable).toBe(false);
	});
});

// ============================================================================
// getFileTypeInfoFromPath Tests
// ============================================================================

describe('getFileTypeInfoFromPath', () => {
	it('should detect TypeScript file', () => {
		const info = getFileTypeInfoFromPath('/src/app.ts');

		expect(info.category).toBe('code');
		expect(info.label).toBe('Code');
	});

	it('should detect image file', () => {
		const info = getFileTypeInfoFromPath('/assets/logo.png');

		expect(info.category).toBe('image');
		expect(info.previewable).toBe(true);
	});

	it('should detect JSON file', () => {
		const info = getFileTypeInfoFromPath('package.json');

		expect(info.category).toBe('data');
	});

	it('should handle nested paths', () => {
		const info = getFileTypeInfoFromPath('/path/to/deep/file.svelte');

		expect(info.category).toBe('code');
	});

	it('should handle files with multiple dots', () => {
		const info = getFileTypeInfoFromPath('file.test.ts');

		expect(info.category).toBe('code');
	});
});

// ============================================================================
// formatFileSize Tests
// ============================================================================

describe('formatFileSize', () => {
	it('should format bytes', () => {
		expect(formatFileSize(500)).toBe('500 B');
	});

	it('should format exact 1KB boundary', () => {
		expect(formatFileSize(1024)).toBe('1.0 KB');
	});

	it('should format kilobytes', () => {
		expect(formatFileSize(1536)).toBe('1.5 KB');
	});

	it('should format megabytes', () => {
		expect(formatFileSize(1048576)).toBe('1.0 MB');
	});

	it('should format fractional megabytes', () => {
		expect(formatFileSize(1572864)).toBe('1.5 MB');
	});

	it('should format gigabytes', () => {
		expect(formatFileSize(1073741824)).toBe('1.0 GB');
	});

	it('should handle zero bytes', () => {
		expect(formatFileSize(0)).toBe('0 B');
	});

	it('should handle large files', () => {
		expect(formatFileSize(5368709120)).toBe('5.0 GB');
	});
});

// ============================================================================
// getExtensionLabel Tests
// ============================================================================

describe('getExtensionLabel', () => {
	it('should return uppercase extension', () => {
		expect(getExtensionLabel('file.pdf')).toBe('PDF');
	});

	it('should handle multiple dots', () => {
		expect(getExtensionLabel('file.test.ts')).toBe('TS');
	});

	it('should return filename as extension for files without dots', () => {
		// Files without dots treat the whole filename as the extension
		expect(getExtensionLabel('Makefile')).toBe('MAKEFILE');
	});

	it('should handle lowercase extensions', () => {
		expect(getExtensionLabel('image.png')).toBe('PNG');
	});

	it('should handle uppercase extensions', () => {
		expect(getExtensionLabel('image.PNG')).toBe('PNG');
	});

	it('should handle mixed case extensions', () => {
		expect(getExtensionLabel('image.Png')).toBe('PNG');
	});
});

// ============================================================================
// canPreviewFile / canPreviewPath Tests
// ============================================================================

describe('canPreviewFile', () => {
	function createMockFile(name: string, type: string): File {
		return new File(['content'], name, { type });
	}

	it('should return true for images', () => {
		const file = createMockFile('photo.png', 'image/png');
		expect(canPreviewFile(file)).toBe(true);
	});

	it('should return false for PDFs', () => {
		const file = createMockFile('doc.pdf', 'application/pdf');
		expect(canPreviewFile(file)).toBe(false);
	});

	it('should return false for text files', () => {
		const file = createMockFile('readme.txt', 'text/plain');
		expect(canPreviewFile(file)).toBe(false);
	});

	it('should return false for code files', () => {
		const file = createMockFile('app.ts', 'text/typescript');
		expect(canPreviewFile(file)).toBe(false);
	});
});

describe('canPreviewPath', () => {
	it('should return true for PNG path', () => {
		expect(canPreviewPath('/images/photo.png')).toBe(true);
	});

	it('should return true for JPEG path', () => {
		expect(canPreviewPath('/images/photo.jpg')).toBe(true);
	});

	it('should return true for GIF path', () => {
		expect(canPreviewPath('/images/animation.gif')).toBe(true);
	});

	it('should return false for PDF path', () => {
		expect(canPreviewPath('/docs/document.pdf')).toBe(false);
	});

	it('should return false for code path', () => {
		expect(canPreviewPath('/src/app.ts')).toBe(false);
	});
});

// ============================================================================
// getContentType Tests
// ============================================================================

describe('getContentType', () => {
	describe('Image content types', () => {
		it('should return correct type for PNG', () => {
			expect(getContentType('image.png')).toBe('image/png');
		});

		it('should return correct type for JPEG', () => {
			expect(getContentType('image.jpg')).toBe('image/jpeg');
			expect(getContentType('image.jpeg')).toBe('image/jpeg');
		});

		it('should return correct type for GIF', () => {
			expect(getContentType('animation.gif')).toBe('image/gif');
		});

		it('should return correct type for WebP', () => {
			expect(getContentType('image.webp')).toBe('image/webp');
		});

		it('should return correct type for SVG', () => {
			expect(getContentType('icon.svg')).toBe('image/svg+xml');
		});

		it('should return correct type for ICO', () => {
			expect(getContentType('favicon.ico')).toBe('image/x-icon');
		});
	});

	describe('Code content types', () => {
		it('should return correct type for JavaScript', () => {
			expect(getContentType('app.js')).toBe('text/javascript');
			expect(getContentType('module.mjs')).toBe('text/javascript');
		});

		it('should return correct type for TypeScript', () => {
			expect(getContentType('app.ts')).toBe('text/typescript');
			expect(getContentType('Component.tsx')).toBe('text/typescript');
		});

		it('should return correct type for HTML', () => {
			expect(getContentType('index.html')).toBe('text/html');
			expect(getContentType('page.htm')).toBe('text/html');
		});

		it('should return correct type for CSS', () => {
			expect(getContentType('styles.css')).toBe('text/css');
		});

		it('should return correct type for Python', () => {
			expect(getContentType('script.py')).toBe('text/x-python');
		});
	});

	describe('Data content types', () => {
		it('should return correct type for JSON', () => {
			expect(getContentType('config.json')).toBe('application/json');
		});

		it('should return correct type for CSV', () => {
			expect(getContentType('data.csv')).toBe('text/csv');
		});

		it('should return correct type for XML', () => {
			expect(getContentType('config.xml')).toBe('application/xml');
		});

		it('should return correct type for YAML', () => {
			expect(getContentType('config.yaml')).toBe('text/yaml');
			expect(getContentType('config.yml')).toBe('text/yaml');
		});
	});

	describe('Document content types', () => {
		it('should return correct type for PDF', () => {
			expect(getContentType('document.pdf')).toBe('application/pdf');
		});

		it('should return correct type for Word documents', () => {
			expect(getContentType('document.doc')).toBe('application/msword');
			expect(getContentType('document.docx')).toBe(
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
			);
		});

		it('should return correct type for Excel', () => {
			expect(getContentType('spreadsheet.xls')).toBe('application/vnd.ms-excel');
			expect(getContentType('spreadsheet.xlsx')).toBe(
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			);
		});

		it('should return correct type for PowerPoint', () => {
			expect(getContentType('presentation.ppt')).toBe('application/vnd.ms-powerpoint');
			expect(getContentType('presentation.pptx')).toBe(
				'application/vnd.openxmlformats-officedocument.presentationml.presentation'
			);
		});
	});

	describe('Text content types', () => {
		it('should return correct type for plain text', () => {
			expect(getContentType('readme.txt')).toBe('text/plain');
		});

		it('should return correct type for Markdown', () => {
			expect(getContentType('README.md')).toBe('text/markdown');
			expect(getContentType('docs.markdown')).toBe('text/markdown');
		});
	});

	describe('Fallback behavior', () => {
		it('should return octet-stream for unknown extensions', () => {
			expect(getContentType('file.xyz')).toBe('application/octet-stream');
		});

		it('should return octet-stream for no extension', () => {
			expect(getContentType('Makefile')).toBe('application/octet-stream');
		});
	});
});

// ============================================================================
// ALLOWED_FILE_TYPES Tests
// ============================================================================

describe('ALLOWED_FILE_TYPES', () => {
	it('should include image wildcard', () => {
		expect(ALLOWED_FILE_TYPES).toContain('image/*');
	});

	it('should include PDF', () => {
		expect(ALLOWED_FILE_TYPES).toContain('.pdf');
	});

	it('should include text files', () => {
		expect(ALLOWED_FILE_TYPES).toContain('.txt');
		expect(ALLOWED_FILE_TYPES).toContain('.md');
	});

	it('should include code files', () => {
		expect(ALLOWED_FILE_TYPES).toContain('.js');
		expect(ALLOWED_FILE_TYPES).toContain('.ts');
		expect(ALLOWED_FILE_TYPES).toContain('.tsx');
		expect(ALLOWED_FILE_TYPES).toContain('.svelte');
		expect(ALLOWED_FILE_TYPES).toContain('.py');
	});

	it('should include data files', () => {
		expect(ALLOWED_FILE_TYPES).toContain('.json');
		expect(ALLOWED_FILE_TYPES).toContain('.csv');
		expect(ALLOWED_FILE_TYPES).toContain('.yaml');
		expect(ALLOWED_FILE_TYPES).toContain('.yml');
	});
});

describe('getAcceptAttribute', () => {
	it('should return comma-separated list', () => {
		const accept = getAcceptAttribute();
		expect(accept).toContain('image/*');
		expect(accept).toContain('.pdf');
		expect(accept.includes(',')).toBe(true);
	});

	it('should match ALLOWED_FILE_TYPES length', () => {
		const accept = getAcceptAttribute();
		const parts = accept.split(',');
		expect(parts.length).toBe(ALLOWED_FILE_TYPES.length);
	});
});

// ============================================================================
// Error Handling Tests
// ============================================================================

describe('getCategoryFromMimeType - Error Handling', () => {
	describe('Empty and whitespace inputs', () => {
		it('should return file for empty string', () => {
			expect(getCategoryFromMimeType('')).toBe('file');
		});

		it('should return file for whitespace-only string', () => {
			expect(getCategoryFromMimeType('   ')).toBe('file');
		});

		it('should return file for tab and newline characters', () => {
			expect(getCategoryFromMimeType('\t\n')).toBe('file');
		});
	});

	describe('Malformed MIME types', () => {
		it('should handle MIME type without subtype', () => {
			expect(getCategoryFromMimeType('image')).toBe('file');
		});

		it('should handle MIME type with empty subtype', () => {
			expect(getCategoryFromMimeType('image/')).toBe('image');
		});

		it('should handle MIME type with multiple slashes', () => {
			// startsWith('image/') still matches, so returns 'image'
			expect(getCategoryFromMimeType('image/png/extra')).toBe('image');
		});

		it('should handle MIME type with leading slash', () => {
			expect(getCategoryFromMimeType('/png')).toBe('file');
		});

		it('should handle MIME type with trailing slash', () => {
			expect(getCategoryFromMimeType('application/pdf/')).toBe('file');
		});

		it('should handle MIME type with special characters', () => {
			expect(getCategoryFromMimeType('image/!@#$%')).toBe('image');
		});

		it('should handle MIME type with unicode characters', () => {
			expect(getCategoryFromMimeType('text/日本語')).toBe('text');
		});
	});

	describe('Case sensitivity', () => {
		it('should not match uppercase MIME types', () => {
			expect(getCategoryFromMimeType('IMAGE/PNG')).toBe('file');
		});

		it('should not match mixed case MIME types', () => {
			expect(getCategoryFromMimeType('Image/Png')).toBe('file');
		});

		it('should match image prefix even with uppercase subtype', () => {
			// startsWith('image/') will still work
			expect(getCategoryFromMimeType('image/PNG')).toBe('image');
		});
	});

	describe('Numeric and special MIME types', () => {
		it('should handle numeric MIME type', () => {
			expect(getCategoryFromMimeType('12345/67890')).toBe('file');
		});

		it('should handle MIME type starting with number', () => {
			expect(getCategoryFromMimeType('3gpp/video')).toBe('file');
		});
	});
});

describe('getCategoryFromExtension - Error Handling', () => {
	describe('Empty and unusual filenames', () => {
		it('should return file for empty string', () => {
			expect(getCategoryFromExtension('')).toBe('file');
		});

		it('should return file for whitespace-only string', () => {
			expect(getCategoryFromExtension('   ')).toBe('file');
		});

		it('should return file for just a dot', () => {
			expect(getCategoryFromExtension('.')).toBe('file');
		});

		it('should return file for multiple dots without extension', () => {
			expect(getCategoryFromExtension('...')).toBe('file');
		});

		it('should return file for hidden file without extension', () => {
			expect(getCategoryFromExtension('.gitignore')).toBe('file');
		});

		it('should return file for hidden file with dot only', () => {
			expect(getCategoryFromExtension('..')).toBe('file');
		});
	});

	describe('Special characters in filenames', () => {
		it('should handle filename with spaces', () => {
			expect(getCategoryFromExtension('my file.ts')).toBe('code');
		});

		it('should handle filename with unicode characters', () => {
			expect(getCategoryFromExtension('文件.json')).toBe('data');
		});

		it('should handle filename with emoji', () => {
			expect(getCategoryFromExtension('🎉party.js')).toBe('code');
		});

		it('should handle filename with special characters', () => {
			expect(getCategoryFromExtension('file@#$.ts')).toBe('code');
		});

		it('should handle filename with parentheses', () => {
			expect(getCategoryFromExtension('file (1).pdf')).toBe('pdf');
		});

		it('should handle filename with brackets', () => {
			expect(getCategoryFromExtension('file[2].json')).toBe('data');
		});
	});

	describe('Path handling', () => {
		it('should extract extension from full path', () => {
			expect(getCategoryFromExtension('/home/user/documents/file.ts')).toBe('code');
		});

		it('should extract extension from Windows-style path', () => {
			expect(getCategoryFromExtension('C:\\Users\\file.json')).toBe('data');
		});

		it('should handle path with dots in directory names', () => {
			expect(getCategoryFromExtension('/home/user.name/project.v2/file.ts')).toBe('code');
		});

		it('should return file for path ending in directory', () => {
			expect(getCategoryFromExtension('/home/user/documents/')).toBe('file');
		});
	});

	describe('Extension edge cases', () => {
		it('should handle very long extension', () => {
			const longExt = 'a'.repeat(100);
			expect(getCategoryFromExtension(`file.${longExt}`)).toBe('file');
		});

		it('should handle extension with numbers', () => {
			expect(getCategoryFromExtension('file.mp3')).toBe('file');
		});

		it('should handle uppercase extension', () => {
			expect(getCategoryFromExtension('file.TS')).toBe('code');
		});

		it('should handle mixed case extension', () => {
			expect(getCategoryFromExtension('file.TsX')).toBe('code');
		});
	});
});

describe('getFileTypeInfo - Error Handling', () => {
	function createMockFile(name: string, type: string): File {
		return new File(['content'], name, { type });
	}

	describe('Empty and invalid File objects', () => {
		it('should handle empty filename', () => {
			const file = createMockFile('', 'application/octet-stream');
			const info = getFileTypeInfo(file);
			expect(info.category).toBe('file');
		});

		it('should handle empty MIME type', () => {
			const file = createMockFile('test.ts', '');
			const info = getFileTypeInfo(file);
			expect(info.category).toBe('code');
		});

		it('should handle both empty filename and MIME type', () => {
			const file = createMockFile('', '');
			const info = getFileTypeInfo(file);
			expect(info.category).toBe('file');
		});
	});

	describe('Conflicting MIME type and extension', () => {
		it('should prioritize MIME type over extension', () => {
			const file = createMockFile('image.ts', 'image/png');
			const info = getFileTypeInfo(file);
			expect(info.category).toBe('image');
		});

		it('should fall back to extension when MIME is generic', () => {
			const file = createMockFile('script.py', 'application/octet-stream');
			const info = getFileTypeInfo(file);
			expect(info.category).toBe('code');
		});

		it('should use extension when MIME type is completely wrong', () => {
			const file = createMockFile('data.json', 'application/octet-stream');
			const info = getFileTypeInfo(file);
			expect(info.category).toBe('data');
		});
	});

	describe('All returned properties are valid', () => {
		it('should always return all required properties', () => {
			const file = createMockFile('unknown.xyz', 'application/unknown');
			const info = getFileTypeInfo(file);

			expect(info).toHaveProperty('category');
			expect(info).toHaveProperty('label');
			expect(info).toHaveProperty('icon');
			expect(info).toHaveProperty('color');
			expect(info).toHaveProperty('previewable');

			expect(typeof info.category).toBe('string');
			expect(typeof info.label).toBe('string');
			expect(typeof info.icon).toBe('string');
			expect(typeof info.color).toBe('string');
			expect(typeof info.previewable).toBe('boolean');
		});
	});
});

describe('getFileTypeInfoFromPath - Error Handling', () => {
	describe('Path edge cases', () => {
		it('should handle empty path', () => {
			const info = getFileTypeInfoFromPath('');
			expect(info.category).toBe('file');
		});

		it('should handle path with only slashes', () => {
			const info = getFileTypeInfoFromPath('///');
			expect(info.category).toBe('file');
		});

		it('should handle relative path with dots', () => {
			const info = getFileTypeInfoFromPath('../../../file.ts');
			expect(info.category).toBe('code');
		});

		it('should handle URL-like path', () => {
			const info = getFileTypeInfoFromPath('https://example.com/file.json');
			expect(info.category).toBe('data');
		});

		it('should handle path with query parameters', () => {
			const info = getFileTypeInfoFromPath('/file.ts?v=123');
			// The extension extraction will get "ts?v=123" which won't match
			expect(info.category).toBe('file');
		});

		it('should handle path with hash', () => {
			const info = getFileTypeInfoFromPath('/file.ts#section');
			expect(info.category).toBe('file');
		});
	});

	describe('Very long paths', () => {
		it('should handle extremely long filename', () => {
			const longName = 'a'.repeat(1000);
			const info = getFileTypeInfoFromPath(`/path/to/${longName}.ts`);
			expect(info.category).toBe('code');
		});

		it('should handle deeply nested path', () => {
			const deepPath = '/a'.repeat(100) + '/file.json';
			const info = getFileTypeInfoFromPath(deepPath);
			expect(info.category).toBe('data');
		});
	});
});

describe('formatFileSize - Error Handling', () => {
	describe('Edge case values', () => {
		it('should handle negative bytes', () => {
			// Function does not handle negative, returns as-is
			expect(formatFileSize(-100)).toBe('-100 B');
		});

		it('should handle negative KB range', () => {
			expect(formatFileSize(-2048)).toBe('-2048 B');
		});

		it('should handle very small decimal', () => {
			expect(formatFileSize(0.5)).toBe('0.5 B');
		});

		it('should handle NaN', () => {
			// NaN comparisons return false, so falls through to GB case
			expect(formatFileSize(NaN)).toBe('NaN GB');
		});

		it('should handle Infinity', () => {
			expect(formatFileSize(Infinity)).toBe('Infinity GB');
		});

		it('should handle negative Infinity', () => {
			expect(formatFileSize(-Infinity)).toBe('-Infinity B');
		});
	});

	describe('Boundary values', () => {
		it('should handle exactly 1023 bytes (just under KB)', () => {
			expect(formatFileSize(1023)).toBe('1023 B');
		});

		it('should handle exactly 1024 bytes (exactly 1 KB)', () => {
			expect(formatFileSize(1024)).toBe('1.0 KB');
		});

		it('should handle exactly 1025 bytes (just over KB)', () => {
			expect(formatFileSize(1025)).toBe('1.0 KB');
		});

		it('should handle exactly 1 MB minus 1 byte', () => {
			expect(formatFileSize(1024 * 1024 - 1)).toBe('1024.0 KB');
		});

		it('should handle exactly 1 GB minus 1 byte', () => {
			expect(formatFileSize(1024 * 1024 * 1024 - 1)).toBe('1024.0 MB');
		});
	});

	describe('Very large values', () => {
		it('should handle terabyte range', () => {
			const terabyte = 1024 * 1024 * 1024 * 1024;
			expect(formatFileSize(terabyte)).toBe('1024.0 GB');
		});

		it('should handle petabyte range', () => {
			const petabyte = 1024 * 1024 * 1024 * 1024 * 1024;
			expect(formatFileSize(petabyte)).toBe('1048576.0 GB');
		});

		it('should handle Number.MAX_SAFE_INTEGER', () => {
			const result = formatFileSize(Number.MAX_SAFE_INTEGER);
			expect(result).toContain('GB');
		});
	});

	describe('Decimal precision', () => {
		it('should round to 1 decimal place for KB', () => {
			expect(formatFileSize(1536)).toBe('1.5 KB');
		});

		it('should round correctly at .05', () => {
			// 1024 + 51.2 = 1075.2 bytes = 1.05 KB
			expect(formatFileSize(1075)).toBe('1.0 KB');
		});

		it('should round correctly at .95', () => {
			// ~1996.8 bytes = ~1.95 KB
			expect(formatFileSize(1997)).toBe('2.0 KB');
		});
	});
});

describe('getExtensionLabel - Error Handling', () => {
	describe('Edge cases', () => {
		it('should handle empty filename', () => {
			expect(getExtensionLabel('')).toBe('');
		});

		it('should handle filename with only dots', () => {
			expect(getExtensionLabel('...')).toBe('');
		});

		it('should handle filename ending with dot', () => {
			expect(getExtensionLabel('file.')).toBe('');
		});

		it('should handle hidden file', () => {
			expect(getExtensionLabel('.bashrc')).toBe('BASHRC');
		});

		it('should handle hidden file with extension', () => {
			expect(getExtensionLabel('.config.json')).toBe('JSON');
		});
	});

	describe('Special characters in extension', () => {
		it('should handle extension with numbers', () => {
			expect(getExtensionLabel('file.mp3')).toBe('MP3');
		});

		it('should handle extension with special chars', () => {
			expect(getExtensionLabel('file.tar.gz')).toBe('GZ');
		});

		it('should uppercase unicode extensions', () => {
			expect(getExtensionLabel('file.日本語')).toBe('日本語');
		});
	});
});

describe('getContentType - Error Handling', () => {
	describe('Edge cases', () => {
		it('should return octet-stream for empty filename', () => {
			expect(getContentType('')).toBe('application/octet-stream');
		});

		it('should return octet-stream for whitespace filename', () => {
			expect(getContentType('   ')).toBe('application/octet-stream');
		});

		it('should return octet-stream for just a dot', () => {
			expect(getContentType('.')).toBe('application/octet-stream');
		});

		it('should return octet-stream for filename ending with dot', () => {
			expect(getContentType('file.')).toBe('application/octet-stream');
		});
	});

	describe('Case handling', () => {
		it('should handle uppercase extensions', () => {
			expect(getContentType('file.PNG')).toBe('image/png');
		});

		it('should handle mixed case extensions', () => {
			expect(getContentType('file.JpEg')).toBe('image/jpeg');
		});
	});

	describe('Double extensions', () => {
		it('should use last extension for tar.gz', () => {
			expect(getContentType('archive.tar.gz')).toBe('application/octet-stream');
		});

		it('should use last extension for test.spec.ts', () => {
			expect(getContentType('file.test.spec.ts')).toBe('text/typescript');
		});
	});
});

describe('canPreviewFile - Error Handling', () => {
	function createMockFile(name: string, type: string): File {
		return new File(['content'], name, { type });
	}

	it('should return false for unknown file types', () => {
		const file = createMockFile('unknown.xyz', 'application/octet-stream');
		expect(canPreviewFile(file)).toBe(false);
	});

	it('should return true for images with wrong extension', () => {
		const file = createMockFile('notanimage.txt', 'image/png');
		expect(canPreviewFile(file)).toBe(true);
	});

	it('should return false for SVG (treated as image but previewable)', () => {
		const file = createMockFile('icon.svg', 'image/svg+xml');
		expect(canPreviewFile(file)).toBe(true);
	});
});

describe('canPreviewPath - Error Handling', () => {
	it('should return false for empty path', () => {
		expect(canPreviewPath('')).toBe(false);
	});

	it('should return false for directory path', () => {
		expect(canPreviewPath('/path/to/directory/')).toBe(false);
	});

	it('should return true for image with complex path', () => {
		expect(canPreviewPath('/path/to/some.file/image.png')).toBe(true);
	});

	it('should return false for path with image-like directory name', () => {
		expect(canPreviewPath('/images.png/file.txt')).toBe(false);
	});
});
