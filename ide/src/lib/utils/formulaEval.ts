/**
 * Safe formula evaluator for data table formula columns.
 *
 * Supports:
 *  - Column references: {column_name}
 *  - Arithmetic: +, -, *, /, % (mod), ** (power)
 *  - Parentheses for grouping
 *  - Number literals (including decimals and negatives)
 *  - String literals: "hello" or 'hello'
 *  - String concatenation via + when either operand is a string
 *  - Comparison: >, <, >=, <=, ==, !=
 *  - Ternary: condition ? trueVal : falseVal
 *  - Built-in functions: round, floor, ceil, abs, min, max, len, upper, lower, trim
 *
 * No eval() — uses a simple recursive descent parser.
 */

type TokenType =
	| 'NUMBER'
	| 'STRING'
	| 'COLUMN_REF'
	| 'OP'
	| 'LPAREN'
	| 'RPAREN'
	| 'COMMA'
	| 'QUESTION'
	| 'COLON'
	| 'FUNC'
	| 'EOF';

interface Token {
	type: TokenType;
	value: string | number;
}

// Built-in functions
const FUNCTIONS: Record<string, (...args: any[]) => any> = {
	round: (n: number, d = 0) => {
		const f = Math.pow(10, d);
		return Math.round(n * f) / f;
	},
	floor: Math.floor,
	ceil: Math.ceil,
	abs: Math.abs,
	min: (...args: number[]) => Math.min(...args),
	max: (...args: number[]) => Math.max(...args),
	len: (s: string) => (s == null ? 0 : String(s).length),
	upper: (s: string) => (s == null ? '' : String(s).toUpperCase()),
	lower: (s: string) => (s == null ? '' : String(s).toLowerCase()),
	trim: (s: string) => (s == null ? '' : String(s).trim()),
	concat: (...args: any[]) => args.map(a => (a == null ? '' : String(a))).join(''),
	if: (cond: any, t: any, f: any) => (cond ? t : f),
};

const FUNC_NAMES = new Set(Object.keys(FUNCTIONS));

function tokenize(expr: string): Token[] {
	const tokens: Token[] = [];
	let i = 0;

	while (i < expr.length) {
		const ch = expr[i];

		// Whitespace
		if (/\s/.test(ch)) {
			i++;
			continue;
		}

		// Column reference: {column_name}
		if (ch === '{') {
			const end = expr.indexOf('}', i + 1);
			if (end === -1) throw new Error('Unclosed column reference');
			tokens.push({ type: 'COLUMN_REF', value: expr.slice(i + 1, end) });
			i = end + 1;
			continue;
		}

		// String literal
		if (ch === '"' || ch === "'") {
			const quote = ch;
			let s = '';
			i++;
			while (i < expr.length && expr[i] !== quote) {
				if (expr[i] === '\\' && i + 1 < expr.length) {
					s += expr[i + 1];
					i += 2;
				} else {
					s += expr[i];
					i++;
				}
			}
			if (i >= expr.length) throw new Error('Unclosed string');
			i++; // skip closing quote
			tokens.push({ type: 'STRING', value: s });
			continue;
		}

		// Number
		if (/\d/.test(ch) || (ch === '.' && i + 1 < expr.length && /\d/.test(expr[i + 1]))) {
			let num = '';
			while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
				num += expr[i];
				i++;
			}
			tokens.push({ type: 'NUMBER', value: parseFloat(num) });
			continue;
		}

		// Two-character operators
		if (i + 1 < expr.length) {
			const two = expr.slice(i, i + 2);
			if (['**', '>=', '<=', '==', '!='].includes(two)) {
				tokens.push({ type: 'OP', value: two });
				i += 2;
				continue;
			}
		}

		// Single-character operators
		if ('+-*/%'.includes(ch)) {
			tokens.push({ type: 'OP', value: ch });
			i++;
			continue;
		}

		if (ch === '>' || ch === '<') {
			tokens.push({ type: 'OP', value: ch });
			i++;
			continue;
		}

		if (ch === '(') {
			tokens.push({ type: 'LPAREN', value: '(' });
			i++;
			continue;
		}
		if (ch === ')') {
			tokens.push({ type: 'RPAREN', value: ')' });
			i++;
			continue;
		}
		if (ch === ',') {
			tokens.push({ type: 'COMMA', value: ',' });
			i++;
			continue;
		}
		if (ch === '?') {
			tokens.push({ type: 'QUESTION', value: '?' });
			i++;
			continue;
		}
		if (ch === ':') {
			tokens.push({ type: 'COLON', value: ':' });
			i++;
			continue;
		}

		// Function name (alphabetic identifier)
		if (/[a-zA-Z_]/.test(ch)) {
			let name = '';
			while (i < expr.length && /[a-zA-Z_0-9]/.test(expr[i])) {
				name += expr[i];
				i++;
			}
			const lower = name.toLowerCase();
			if (FUNC_NAMES.has(lower)) {
				tokens.push({ type: 'FUNC', value: lower });
			} else if (lower === 'true') {
				tokens.push({ type: 'NUMBER', value: 1 });
			} else if (lower === 'false') {
				tokens.push({ type: 'NUMBER', value: 0 });
			} else {
				throw new Error(`Unknown identifier: ${name}`);
			}
			continue;
		}

		throw new Error(`Unexpected character: ${ch}`);
	}

	tokens.push({ type: 'EOF', value: '' });
	return tokens;
}

// Recursive descent parser
class Parser {
	private tokens: Token[];
	private pos = 0;

	constructor(tokens: Token[]) {
		this.tokens = tokens;
	}

	private peek(): Token {
		return this.tokens[this.pos];
	}

	private consume(type?: TokenType): Token {
		const t = this.tokens[this.pos];
		if (type && t.type !== type) {
			throw new Error(`Expected ${type} but got ${t.type}`);
		}
		this.pos++;
		return t;
	}

	parse(): any {
		const result = this.parseTernary();
		if (this.peek().type !== 'EOF') {
			throw new Error(`Unexpected token: ${this.peek().value}`);
		}
		return result;
	}

	private parseTernary(): any {
		let result = this.parseComparison();
		if (this.peek().type === 'QUESTION') {
			this.consume(); // ?
			const trueVal = this.parseTernary();
			this.consume('COLON');
			const falseVal = this.parseTernary();
			return result ? trueVal : falseVal;
		}
		return result;
	}

	private parseComparison(): any {
		let left = this.parseAddSub();
		while (
			this.peek().type === 'OP' &&
			['>', '<', '>=', '<=', '==', '!='].includes(this.peek().value as string)
		) {
			const op = this.consume().value as string;
			const right = this.parseAddSub();
			switch (op) {
				case '>':
					left = left > right ? 1 : 0;
					break;
				case '<':
					left = left < right ? 1 : 0;
					break;
				case '>=':
					left = left >= right ? 1 : 0;
					break;
				case '<=':
					left = left <= right ? 1 : 0;
					break;
				case '==':
					left = left == right ? 1 : 0;
					break;
				case '!=':
					left = left != right ? 1 : 0;
					break;
			}
		}
		return left;
	}

	private parseAddSub(): any {
		let left = this.parseMulDiv();
		while (this.peek().type === 'OP' && (this.peek().value === '+' || this.peek().value === '-')) {
			const op = this.consume().value as string;
			const right = this.parseMulDiv();
			if (op === '+') {
				// String concatenation if either operand is a string
				if (typeof left === 'string' || typeof right === 'string') {
					left = String(left ?? '') + String(right ?? '');
				} else {
					left = (left ?? 0) + (right ?? 0);
				}
			} else {
				left = (left ?? 0) - (right ?? 0);
			}
		}
		return left;
	}

	private parseMulDiv(): any {
		let left = this.parseUnary();
		while (
			this.peek().type === 'OP' &&
			['*', '/', '%', '**'].includes(this.peek().value as string)
		) {
			const op = this.consume().value as string;
			const right = this.parseUnary();
			switch (op) {
				case '*':
					left = (left ?? 0) * (right ?? 0);
					break;
				case '/':
					left = right === 0 ? NaN : (left ?? 0) / (right ?? 0);
					break;
				case '%':
					left = right === 0 ? NaN : (left ?? 0) % (right ?? 0);
					break;
				case '**':
					left = Math.pow(left ?? 0, right ?? 0);
					break;
			}
		}
		return left;
	}

	private parseUnary(): any {
		if (this.peek().type === 'OP' && this.peek().value === '-') {
			this.consume();
			return -(this.parsePrimary() ?? 0);
		}
		if (this.peek().type === 'OP' && this.peek().value === '+') {
			this.consume();
			return +(this.parsePrimary() ?? 0);
		}
		return this.parsePrimary();
	}

	private parsePrimary(): any {
		const t = this.peek();

		if (t.type === 'NUMBER') {
			this.consume();
			return t.value;
		}

		if (t.type === 'STRING') {
			this.consume();
			return t.value;
		}

		if (t.type === 'COLUMN_REF') {
			this.consume();
			// Value should be pre-substituted; this is a sentinel
			return t.value;
		}

		if (t.type === 'FUNC') {
			const funcName = this.consume().value as string;
			this.consume('LPAREN');
			const args: any[] = [];
			if (this.peek().type !== 'RPAREN') {
				args.push(this.parseTernary());
				while (this.peek().type === 'COMMA') {
					this.consume();
					args.push(this.parseTernary());
				}
			}
			this.consume('RPAREN');
			const fn = FUNCTIONS[funcName];
			if (!fn) throw new Error(`Unknown function: ${funcName}`);
			return fn(...args);
		}

		if (t.type === 'LPAREN') {
			this.consume();
			const result = this.parseTernary();
			this.consume('RPAREN');
			return result;
		}

		throw new Error(`Unexpected: ${t.value}`);
	}
}

/**
 * Evaluate a formula expression against a row of data.
 *
 * @param expression - Formula like "{price} * {quantity}"
 * @param row - Row data object like { price: 10, quantity: 5 }
 * @returns Computed value, or an error string prefixed with '#'
 */
export function evaluateFormula(expression: string, row: Record<string, any>): any {
	if (!expression || !expression.trim()) return null;

	try {
		// First, substitute column references with their values and tokenize
		// We need to handle this at the token level so the parser sees resolved values
		const tokens = tokenize(expression);

		// Resolve column references
		for (const token of tokens) {
			if (token.type === 'COLUMN_REF') {
				const colName = token.value as string;
				const val = row[colName];
				if (val === null || val === undefined || val === '') {
					// Treat as 0 for numeric context, '' for string
					token.value = null as any;
					token.type = 'NUMBER';
				} else if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '')) {
					token.value = Number(val);
					token.type = 'NUMBER';
				} else {
					token.value = String(val);
					token.type = 'STRING';
				}
			}
		}

		const parser = new Parser(tokens);
		const result = parser.parse();

		if (typeof result === 'number' && isNaN(result)) return '#ERR';
		if (result === Infinity || result === -Infinity) return '#DIV/0';

		return result;
	} catch (e: any) {
		return `#ERR: ${e.message}`;
	}
}

/**
 * Extract column names referenced in a formula expression.
 * Used for showing dependencies in the UI.
 */
export function extractColumnRefs(expression: string): string[] {
	const refs: string[] = [];
	const re = /\{([^}]+)\}/g;
	let match;
	while ((match = re.exec(expression)) !== null) {
		if (!refs.includes(match[1])) refs.push(match[1]);
	}
	return refs;
}

/**
 * Validate a formula expression without evaluating it.
 * Returns null if valid, or an error message string.
 */
export function validateFormula(expression: string): string | null {
	if (!expression || !expression.trim()) return 'Expression is empty';
	try {
		// Tokenize with dummy column values
		const tokens = tokenize(expression);
		// Replace column refs with dummy number values for validation
		for (const token of tokens) {
			if (token.type === 'COLUMN_REF') {
				token.value = 0;
				token.type = 'NUMBER';
			}
		}
		const parser = new Parser(tokens);
		parser.parse();
		return null;
	} catch (e: any) {
		return e.message;
	}
}
