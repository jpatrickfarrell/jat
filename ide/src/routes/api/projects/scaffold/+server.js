/**
 * Projects Scaffold API
 * POST /api/projects/scaffold - Scaffold a new project from the JST template
 *
 * Request body:
 *   { idea?: string, prdContent?: string, targetPath: string, projectName: string }
 *
 * Response:
 *   { success: true, path: string, projectName: string, steps: string[] }
 *   or { error: true, message: string, type: string }
 *
 * Behavior:
 *   1. Copy JST template from ~/code/jst to targetPath (cp -r, fresh start)
 *   2. Remove .git and node_modules from the copy
 *   3. Run git init in the new directory
 *   4. Update package.json name field
 *   5. Update src/config.ts with project name
 *   6. Run npm install
 *   7. Store the app idea/PRD in .jat/idea.md for agent reference
 *   8. Return success with path and steps taken
 */

import { json } from '@sveltejs/kit';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { resolve, normalize, join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const JST_TEMPLATE_PATH = join(homedir(), 'code', 'jst');
const SCAFFOLD_TIMEOUT = 120000; // 2 minutes (npm install can be slow)

/**
 * Expand ~ to home directory and resolve to absolute path
 * @param {string} inputPath
 * @returns {string}
 */
function expandPath(inputPath) {
	const expanded = inputPath.replace(/^~/, homedir());
	return resolve(expanded);
}

/**
 * Check if path is safe (under home directory)
 * @param {string} absolutePath
 * @returns {boolean}
 */
function isPathAllowed(absolutePath) {
	const home = homedir();
	const normalized = normalize(absolutePath);
	return normalized.toLowerCase().startsWith(home.toLowerCase());
}

/**
 * Derive a kebab-case name from an app idea string
 * @param {string} idea
 * @returns {string}
 */
function deriveNameFromIdea(idea) {
	// Take first few meaningful words, kebab-case them
	const words = idea
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.split(/\s+/)
		.filter(w => w.length > 1 && !['a', 'an', 'the', 'for', 'and', 'or', 'with', 'that', 'this', 'from'].includes(w))
		.slice(0, 3);

	return words.join('-') || 'new-project';
}

/**
 * POST /api/projects/scaffold
 * Scaffold a new project from the JST template
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const steps = [];

		// Validate inputs
		const idea = (body.idea && typeof body.idea === 'string') ? body.idea.trim() : '';
		const prdContent = (body.prdContent && typeof body.prdContent === 'string') ? body.prdContent.trim() : '';
		const projectName = (body.projectName && typeof body.projectName === 'string') ? body.projectName.trim() : '';

		if (!idea && !prdContent) {
			return json(
				{ error: true, message: 'An app idea or PRD content is required', type: 'validation_error' },
				{ status: 400 }
			);
		}

		// Determine target path
		if (!body.targetPath || typeof body.targetPath !== 'string' || !body.targetPath.trim()) {
			return json(
				{ error: true, message: 'Target path is required', type: 'validation_error' },
				{ status: 400 }
			);
		}

		const absolutePath = expandPath(body.targetPath.trim());

		// Security check
		if (!isPathAllowed(absolutePath)) {
			return json(
				{ error: true, message: 'Target path must be under your home directory', type: 'security_error' },
				{ status: 403 }
			);
		}

		// Check target doesn't already exist
		if (existsSync(absolutePath)) {
			return json(
				{ error: true, message: `Target directory already exists: ${body.targetPath.trim()}`, type: 'conflict' },
				{ status: 409 }
			);
		}

		// Check JST template exists
		if (!existsSync(JST_TEMPLATE_PATH)) {
			return json(
				{ error: true, message: 'JST template not found at ~/code/jst. Please clone it first.', type: 'template_missing' },
				{ status: 404 }
			);
		}

		// Step 1: Copy template
		try {
			await execAsync(`cp -r ${JSON.stringify(JST_TEMPLATE_PATH)} ${JSON.stringify(absolutePath)}`, { timeout: 30000 });
			steps.push('Copied JST template');
		} catch (copyError) {
			const err = /** @type {{ message?: string }} */ (copyError);
			return json(
				{ error: true, message: `Failed to copy template: ${err.message}`, type: 'copy_failed' },
				{ status: 500 }
			);
		}

		// Step 2: Remove .git and node_modules from the copy
		try {
			await execAsync(`rm -rf ${JSON.stringify(join(absolutePath, '.git'))} ${JSON.stringify(join(absolutePath, 'node_modules'))}`, { timeout: 15000 });
			steps.push('Cleaned template artifacts');
		} catch { /* best effort */ }

		// Step 3: git init
		try {
			await execAsync('git init', { cwd: absolutePath, timeout: 10000 });
			steps.push('Initialized git repository');

			// Update .gitignore to include .jat patterns
			const gitignorePath = join(absolutePath, '.gitignore');
			if (existsSync(gitignorePath)) {
				let gitignore = readFileSync(gitignorePath, 'utf-8');
				if (!gitignore.includes('.jat/')) {
					gitignore += '\n# JAT\n.jat/\n.claude/\n';
					writeFileSync(gitignorePath, gitignore);
				}
			}
		} catch (gitError) {
			const err = /** @type {{ message?: string }} */ (gitError);
			return json(
				{ error: true, message: `Failed to initialize git: ${err.message}`, type: 'git_init_failed', steps },
				{ status: 500 }
			);
		}

		// Step 4: Update package.json name
		const displayName = projectName || deriveNameFromIdea(idea || prdContent);
		const kebabName = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

		try {
			const pkgPath = join(absolutePath, 'package.json');
			if (existsSync(pkgPath)) {
				const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
				pkg.name = kebabName;
				writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
				steps.push(`Updated package.json name to "${kebabName}"`);
			}
		} catch { /* best effort */ }

		// Step 5: Update src/config.ts with project name
		try {
			const configPath = join(absolutePath, 'src', 'config.ts');
			if (existsSync(configPath)) {
				let config = readFileSync(configPath, 'utf-8');
				config = config.replace(/export const WebsiteName: string = ".*"/, `export const WebsiteName: string = "${displayName.replace(/"/g, '\\"')}"`);
				config = config.replace(/export const WebsiteTitle: string = ".*"/, `export const WebsiteTitle: string = "${displayName.replace(/"/g, '\\"')}"`);
				config = config.replace(/export const WebsiteDescription: string =\s*".*"/, `export const WebsiteDescription: string = "${(idea || prdContent).slice(0, 200).replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
				writeFileSync(configPath, config);
				steps.push('Updated src/config.ts');
			}
		} catch { /* best effort */ }

		// Step 6: npm install
		try {
			await execAsync('npm install', { cwd: absolutePath, timeout: SCAFFOLD_TIMEOUT });
			steps.push('Installed dependencies');
		} catch (npmError) {
			// Don't fail the whole flow — user can npm install later
			const err = /** @type {{ message?: string }} */ (npmError);
			steps.push(`npm install failed (can retry later): ${err.message?.slice(0, 100)}`);
		}

		// Step 7: Store app idea/PRD in .jat/
		try {
			const jatDir = join(absolutePath, '.jat');
			if (!existsSync(jatDir)) {
				await execAsync(`mkdir -p ${JSON.stringify(jatDir)}`, { timeout: 5000 });
			}

			const ideaContent = idea
				? `# App Idea\n\n${idea}\n`
				: `# Product Requirements Document\n\n${prdContent}\n`;

			writeFileSync(join(jatDir, 'idea.md'), ideaContent);
			steps.push('Stored app idea for agent reference');
		} catch { /* best effort */ }

		return json({
			success: true,
			path: absolutePath,
			projectName: displayName,
			kebabName,
			steps
		}, { status: 200 });

	} catch (error) {
		console.error('Error in projects/scaffold:', error);
		return json(
			{
				error: true,
				message: error instanceof Error ? error.message : 'Internal server error',
				type: 'server_error'
			},
			{ status: 500 }
		);
	}
}
