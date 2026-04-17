/**
 * Converts HTML clipboard content to Markdown.
 * Handles common web formatting: headings, emphasis, links, lists, code, tables.
 */

function processNode(node: Node, listDepth = 0, listType: 'ul' | 'ol' | null = null): string {
	if (node.nodeType === Node.TEXT_NODE) {
		return node.textContent || '';
	}

	if (node.nodeType !== Node.ELEMENT_NODE) return '';

	const el = node as HTMLElement;
	const tag = el.tagName.toLowerCase();
	const children = () => Array.from(el.childNodes).map(c => processNode(c, listDepth, listType)).join('');

	switch (tag) {
		case 'h1': return `\n# ${children().trim()}\n\n`;
		case 'h2': return `\n## ${children().trim()}\n\n`;
		case 'h3': return `\n### ${children().trim()}\n\n`;
		case 'h4': return `\n#### ${children().trim()}\n\n`;
		case 'h5': return `\n##### ${children().trim()}\n\n`;
		case 'h6': return `\n###### ${children().trim()}\n\n`;

		case 'p': {
			const text = children().trim();
			return text ? `\n${text}\n\n` : '';
		}

		case 'br': return '\n';

		case 'strong':
		case 'b': {
			const text = children().trim();
			return text ? `**${text}**` : '';
		}

		case 'em':
		case 'i': {
			const text = children().trim();
			return text ? `*${text}*` : '';
		}

		case 's':
		case 'del':
		case 'strike': {
			const text = children().trim();
			return text ? `~~${text}~~` : '';
		}

		case 'a': {
			const href = el.getAttribute('href') || '';
			const text = children().trim();
			if (!text) return '';
			if (!href || href === text) return text;
			return `[${text}](${href})`;
		}

		case 'code': {
			const parent = el.parentElement;
			if (parent?.tagName.toLowerCase() === 'pre') {
				// Handled by 'pre' case
				return el.textContent || '';
			}
			const text = el.textContent || '';
			return text ? `\`${text}\`` : '';
		}

		case 'pre': {
			const codeEl = el.querySelector('code');
			const lang = codeEl?.className.match(/language-(\w+)/)?.[1] || '';
			const text = (codeEl || el).textContent || '';
			return `\n\`\`\`${lang}\n${text.trim()}\n\`\`\`\n\n`;
		}

		case 'blockquote': {
			const text = children().trim();
			return text
				? '\n' + text.split('\n').map(line => `> ${line}`).join('\n') + '\n\n'
				: '';
		}

		case 'hr': return '\n---\n\n';

		case 'ul': {
			const items = Array.from(el.childNodes)
				.map(c => processNode(c, listDepth + 1, 'ul'))
				.join('');
			return `\n${items}\n`;
		}

		case 'ol': {
			const items = Array.from(el.childNodes)
				.map(c => processNode(c, listDepth + 1, 'ol'))
				.join('');
			return `\n${items}\n`;
		}

		case 'li': {
			const indent = '  '.repeat(Math.max(0, listDepth - 1));
			const parent = el.parentElement;
			const isOrdered = parent?.tagName.toLowerCase() === 'ol';
			const siblings = parent ? Array.from(parent.children) : [];
			const index = siblings.indexOf(el) + 1;
			const bullet = isOrdered ? `${index}.` : '-';
			const text = children().trim();
			return text ? `${indent}${bullet} ${text}\n` : '';
		}

		case 'table': return processTable(el);

		case 'div':
		case 'section':
		case 'article':
		case 'main':
		case 'header':
		case 'footer':
		case 'aside':
		case 'nav': {
			const text = children().trim();
			return text ? `\n${text}\n` : '';
		}

		case 'span': return children();

		// Skip these
		case 'script':
		case 'style':
		case 'meta':
		case 'link':
		case 'head':
		case 'svg':
		case 'img':
			return '';

		default:
			return children();
	}
}

function processTable(table: HTMLElement): string {
	const rows = Array.from(table.querySelectorAll('tr'));
	if (!rows.length) return '';

	const tableData = rows.map(row =>
		Array.from(row.querySelectorAll('th, td')).map(cell =>
			(cell.textContent || '').trim().replace(/\|/g, '\\|')
		)
	);

	if (!tableData.length || !tableData[0].length) return '';

	const header = tableData[0];
	const separator = header.map(() => '---');
	const body = tableData.slice(1);

	const toRow = (cols: string[]) => `| ${cols.join(' | ')} |`;

	const lines = [
		toRow(header),
		toRow(separator),
		...body.map(toRow)
	];

	return `\n${lines.join('\n')}\n\n`;
}

/** Convert HTML string to Markdown */
export function htmlToMarkdown(html: string): string {
	const div = document.createElement('div');
	div.innerHTML = html;

	const raw = processNode(div);

	return raw
		.replace(/\n{3,}/g, '\n\n')   // Collapse 3+ newlines to 2
		.replace(/^\n+/, '')           // Strip leading newlines
		.replace(/\n+$/, '')           // Strip trailing newlines
		.trim();
}

/**
 * Returns true if the HTML contains meaningful formatting that would be
 * lost when pasting as plain text (i.e., worth converting to markdown).
 */
export function hasRichFormatting(html: string): boolean {
	const formattingTags = [
		/<h[1-6][\s>]/i,
		/<strong[\s>]/i,
		/<b[\s>]/i,
		/<em[\s>]/i,
		/<i[\s>]/i,
		/<a\s+href/i,
		/<ul[\s>]/i,
		/<ol[\s>]/i,
		/<li[\s>]/i,
		/<code[\s>]/i,
		/<pre[\s>]/i,
		/<blockquote[\s>]/i,
		/<table[\s>]/i,
		/<s[\s>]/i,
		/<del[\s>]/i,
		/<strike[\s>]/i,
	];
	return formattingTags.some(re => re.test(html));
}
