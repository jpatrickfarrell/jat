/**
 * API endpoint to fetch project colors from ~/.config/jat/projects.json
 * Returns a map of project name -> hex color
 */

import { json } from '@sveltejs/kit';
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export async function GET() {
	try {
		const configPath = join(homedir(), '.config/jat/projects.json');

		if (!existsSync(configPath)) {
			return json({ colors: {} });
		}

		const configContent = readFileSync(configPath, 'utf-8');
		const config = JSON.parse(configContent);

		// Extract colors from projects
		/** @type {Record<string, string>} */
		const colors = {};

		if (config.projects) {
			for (const [projectName, projectConfig] of Object.entries(config.projects)) {
				// Convert rgb(rrggbb) format to #rrggbb hex format
				/** @type {any} */
				const pc = projectConfig;
				const activeColor = pc.active_color;
				if (activeColor) {
					const match = activeColor.match(/^rgb\(([0-9a-fA-F]{6})\)$/);
					if (match) {
						colors[projectName.toLowerCase()] = `#${match[1].toLowerCase()}`;
					} else if (activeColor.startsWith('#')) {
						colors[projectName.toLowerCase()] = activeColor.toLowerCase();
					}
				}
			}
		}

		return json({ colors });
	} catch (err) {
		console.error('Failed to fetch project colors:', err);
		return json({ colors: {} });
	}
}
