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
 *  - Built-in functions: round, floor, ceil, abs, min, max, len, upper, lower, trim,
 *    concat, if, and, or, not, switch, switchif, ifblank, isblank, isnotblank,
 *    isnumber, tonumber, totext, formatcurrency, formatnumber, formatpercent
 *
 *  - Date/time functions: Now, Today, Date, Year, Month, Day, Hour, Minute, Second,
 *    Weekday, WeekdayName, MonthName, WeekNumber, DateToEpoch, EpochToDate,
 *    RelativeDate, EndOfMonth, ToDate, ToDateTime
 *  - Duration functions: Days, Hours, Minutes, Seconds, ToDays, ToHours, ToMinutes, ToSeconds
 *  - Date arithmetic: Date + Duration = Date, Date - Date = Duration, Date - Duration = Date
 *
 * No eval() — uses a simple recursive descent parser.
 */

// ---------------------------------------------------------------------------
// Duration wrapper — distinguishes durations (ms) from plain numbers
// ---------------------------------------------------------------------------

export class Duration {
	readonly _ms: number;
	constructor(ms: number) {
		this._ms = ms;
	}
	valueOf() {
		return this._ms;
	}
}

/** Check if a value is a Duration instance */
export function isDuration(v: any): v is Duration {
	return v instanceof Duration;
}

/** Check if a value is a valid Date instance */
function isDate(v: any): v is Date {
	return v instanceof Date && !isNaN(v.getTime());
}

// ISO date detection — matches YYYY-MM-DD with optional time component
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

/** Try to parse a string as an ISO date. Returns Date or null. */
function tryParseDate(val: string): Date | null {
	if (!ISO_DATE_RE.test(val)) return null;
	const d = new Date(val);
	return isNaN(d.getTime()) ? null : d;
}

/** Coerce value to Date for date functions */
function toDateVal(v: any): Date | null {
	if (isDate(v)) return v;
	if (typeof v === 'number') return new Date(v);
	if (typeof v === 'string') return tryParseDate(v);
	return null;
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Duration constants (milliseconds)
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

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

// Safe regex helper — rejects patterns >100 chars and wraps in try/catch
function safeRegex(pattern: string, flags = ''): RegExp | null {
	if (typeof pattern !== 'string' || pattern.length > 100) return null;
	try {
		return new RegExp(pattern, flags);
	} catch {
		return null;
	}
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

	// Math functions
	sum: (...args: number[]) => args.reduce((a, b) => (a ?? 0) + (b ?? 0), 0),
	average: (...args: number[]) => {
		if (args.length === 0) return 0;
		return args.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) / args.length;
	},
	product: (...args: number[]) => args.reduce((a, b) => (a ?? 0) * (b ?? 0), 1),
	power: (base: number, exp: number) => Math.pow(base ?? 0, exp ?? 0),
	squareroot: (n: number) => Math.sqrt(n ?? 0),
	sign: (n: number) => Math.sign(n ?? 0),
	log: (n: number, base?: number) => {
		if (base != null) return Math.log(n ?? 0) / Math.log(base);
		return Math.log(n ?? 0);
	},
	log10: (n: number) => Math.log10(n ?? 0),
	ln: (n: number) => Math.log(n ?? 0),
	pi: () => Math.PI,
	random: () => Math.random(),
	randominteger: (min: number, max: number) => {
		min = Math.ceil(min ?? 0);
		max = Math.floor(max ?? 0);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	even: (n: number) => {
		const v = Math.ceil(n ?? 0);
		return v % 2 === 0 ? v : v + 1;
	},
	odd: (n: number) => {
		const v = Math.ceil(n ?? 0);
		return v % 2 !== 0 ? v : v + 1;
	},
	iseven: (n: number) => ((n ?? 0) % 2 === 0 ? 1 : 0),
	isodd: (n: number) => ((n ?? 0) % 2 !== 0 ? 1 : 0),
	truncate: (n: number) => Math.trunc(n ?? 0),
	rounddown: (n: number, places = 0) => {
		const f = Math.pow(10, places);
		return Math.floor((n ?? 0) * f) / f;
	},
	roundup: (n: number, places = 0) => {
		const f = Math.pow(10, places);
		return Math.ceil((n ?? 0) * f) / f;
	},
	remainder: (a: number, b: number) => (b === 0 ? NaN : (a ?? 0) % (b ?? 0)),
	factorial: (n: number) => {
		n = Math.trunc(n ?? 0);
		if (n < 0) return NaN;
		if (n <= 1) return 1;
		if (n > 170) return Infinity;
		let result = 1;
		for (let i = 2; i <= n; i++) result *= i;
		return result;
	},
	exponent: (n: number) => Math.exp(n ?? 0),

	// Logic functions
	and: (...args: any[]) => (args.every(Boolean) ? 1 : 0),
	or: (...args: any[]) => (args.some(Boolean) ? 1 : 0),
	not: (val: any) => (val ? 0 : 1),
	switch: (...args: any[]) => {
		const expr = args[0];
		for (let i = 1; i < args.length - 1; i += 2) {
			if (expr == args[i]) return args[i + 1];
		}
		// Default value if odd number of remaining args
		return args.length % 2 === 0 ? args[args.length - 1] : null;
	},
	switchif: (...args: any[]) => {
		for (let i = 0; i < args.length - 1; i += 2) {
			if (args[i]) return args[i + 1];
		}
		// Default value if odd number of args
		return args.length % 2 === 1 ? args[args.length - 1] : null;
	},
	ifblank: (value: any, fallback: any) =>
		value === null || value === undefined || value === '' ? fallback : value,

	// Type-checking functions
	isblank: (val: any) => (val === null || val === undefined || val === '' ? 1 : 0),
	isnotblank: (val: any) => (val !== null && val !== undefined && val !== '' ? 1 : 0),
	isnumber: (val: any) => {
		if (typeof val === 'number') return isNaN(val) ? 0 : 1;
		if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) return 1;
		return 0;
	},
	tonumber: (val: any) => {
		const n = Number(val);
		return isNaN(n) ? 0 : n;
	},
	totext: (val: any) => (val == null ? '' : String(val)),

	// Format functions
	formatcurrency: (n: number, currency = 'USD', decimals = 2) => {
		try {
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: String(currency),
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals
			}).format(Number(n) || 0);
		} catch {
			return String(n);
		}
	},
	formatnumber: (n: number, decimals = 0, separator = ',') => {
		const num = Number(n) || 0;
		const fixed = num.toFixed(decimals);
		if (separator === ',') {
			return new Intl.NumberFormat('en-US', {
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals
			}).format(num);
		}
		return fixed;
	},
	formatpercent: (n: number, decimals = 0) => {
		const num = Number(n) || 0;
		return (num * 100).toFixed(decimals) + '%';
	},

	// String functions
	left: (s: string, n: number) => (s == null ? '' : String(s).slice(0, n)),
	right: (s: string, n: number) => (s == null ? '' : String(s).slice(-n)),
	middle: (s: string, start: number, count: number) =>
		s == null ? '' : String(s).slice(start, start + count),
	replace: (s: string, start: number, count: number, newText: string) => {
		if (s == null) return '';
		const str = String(s);
		return str.slice(0, start) + String(newText ?? '') + str.slice(start + count);
	},
	substitute: (s: string, old: string, rep: string) =>
		s == null ? '' : String(s).replace(String(old), String(rep ?? '')),
	substituteall: (s: string, old: string, rep: string) =>
		s == null ? '' : String(s).split(String(old)).join(String(rep ?? '')),
	split: (s: string, delim: string) =>
		s == null ? '' : String(s).split(String(delim ?? ',')).join(', '),
	join: (s: string, delim: string) =>
		s == null
			? ''
			: String(s)
					.split(',')
					.map((v) => v.trim())
					.join(String(delim ?? ', ')),
	repeat: (s: string, n: number) =>
		s == null ? '' : String(s).repeat(Math.max(0, Math.min(n || 0, 1000))),
	startswith: (s: string, prefix: string) =>
		s == null || prefix == null ? 0 : String(s).startsWith(String(prefix)) ? 1 : 0,
	endswith: (s: string, suffix: string) =>
		s == null || suffix == null ? 0 : String(s).endsWith(String(suffix)) ? 1 : 0,
	containstext: (s: string, search: string) =>
		s == null || search == null
			? 0
			: String(s).toLowerCase().includes(String(search).toLowerCase())
				? 1
				: 0,
	character: (code: number) => String.fromCharCode(code || 0),
	leftpad: (s: string, len: number, pad?: string) =>
		s == null ? '' : String(s).padStart(len || 0, pad ?? ' '),
	rightpad: (s: string, len: number, pad?: string) =>
		s == null ? '' : String(s).padEnd(len || 0, pad ?? ' '),

	// Regex functions (with safety guards — patterns >100 chars rejected)
	regexmatch: (s: string, pattern: string) => {
		if (s == null || pattern == null) return 0;
		const re = safeRegex(String(pattern));
		return re && re.test(String(s)) ? 1 : 0;
	},
	regexextract: (s: string, pattern: string) => {
		if (s == null || pattern == null) return '';
		const re = safeRegex(String(pattern));
		if (!re) return '';
		const match = String(s).match(re);
		return match ? match[0] : '';
	},
	regexreplace: (s: string, pattern: string, replacement: string) => {
		if (s == null || pattern == null) return s == null ? '' : String(s);
		const re = safeRegex(String(pattern), 'g');
		if (!re) return String(s);
		return String(s).replace(re, String(replacement ?? ''));
	},

	// -----------------------------------------------------------------------
	// Date/time functions
	// -----------------------------------------------------------------------

	now: () => new Date(),
	today: () => {
		const d = new Date();
		return new Date(d.getFullYear(), d.getMonth(), d.getDate());
	},
	date: (year: number, month: number, day: number) =>
		new Date(year, (month ?? 1) - 1, day ?? 1),
	year: (v: any) => {
		const d = toDateVal(v);
		return d ? d.getFullYear() : NaN;
	},
	month: (v: any) => {
		const d = toDateVal(v);
		return d ? d.getMonth() + 1 : NaN;
	},
	day: (v: any) => {
		const d = toDateVal(v);
		return d ? d.getDate() : NaN;
	},
	hour: (v: any) => {
		const d = toDateVal(v);
		return d ? d.getHours() : NaN;
	},
	minute: (v: any) => {
		const d = toDateVal(v);
		return d ? d.getMinutes() : NaN;
	},
	second: (v: any) => {
		const d = toDateVal(v);
		return d ? d.getSeconds() : NaN;
	},
	weekday: (v: any) => {
		const d = toDateVal(v);
		return d ? d.getDay() : NaN;
	},
	weekdayname: (v: any) => {
		const d = toDateVal(v);
		return d ? WEEKDAY_NAMES[d.getDay()] : '';
	},
	monthname: (v: any) => {
		const d = toDateVal(v);
		return d ? MONTH_NAMES[d.getMonth()] : '';
	},
	weeknumber: (v: any) => {
		const d = toDateVal(v);
		if (!d) return NaN;
		// ISO 8601 week number
		const target = new Date(d.getTime());
		target.setHours(0, 0, 0, 0);
		target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
		const jan4 = new Date(target.getFullYear(), 0, 4);
		return 1 + Math.round(((target.getTime() - jan4.getTime()) / MS_PER_DAY - 3 + ((jan4.getDay() + 6) % 7)) / 7);
	},
	datetoepoch: (v: any) => {
		const d = toDateVal(v);
		return d ? Math.floor(d.getTime() / 1000) : NaN;
	},
	epochtodate: (epoch: number) => new Date((epoch ?? 0) * 1000),
	relativedate: (v: any, days: number) => {
		const d = toDateVal(v);
		if (!d) return null;
		return new Date(d.getTime() + (days ?? 0) * MS_PER_DAY);
	},
	endofmonth: (v: any) => {
		const d = toDateVal(v);
		if (!d) return null;
		return new Date(d.getFullYear(), d.getMonth() + 1, 0);
	},
	todate: (v: any) => {
		const d = toDateVal(v);
		if (!d) return null;
		return new Date(d.getFullYear(), d.getMonth(), d.getDate());
	},
	todatetime: (v: any) => {
		const d = toDateVal(v);
		return d ?? null;
	},

	// -----------------------------------------------------------------------
	// Duration functions — durations are represented as milliseconds internally
	// -----------------------------------------------------------------------

	days: (n: number) => new Duration((n ?? 0) * MS_PER_DAY),
	hours: (n: number) => new Duration((n ?? 0) * MS_PER_HOUR),
	minutes: (n: number) => new Duration((n ?? 0) * MS_PER_MINUTE),
	seconds: (n: number) => new Duration((n ?? 0) * MS_PER_SECOND),
	todays: (v: any) => (isDuration(v) ? v._ms / MS_PER_DAY : (Number(v) || 0) / MS_PER_DAY),
	tohours: (v: any) => (isDuration(v) ? v._ms / MS_PER_HOUR : (Number(v) || 0) / MS_PER_HOUR),
	tominutes: (v: any) => (isDuration(v) ? v._ms / MS_PER_MINUTE : (Number(v) || 0) / MS_PER_MINUTE),
	toseconds: (v: any) => (isDuration(v) ? v._ms / MS_PER_SECOND : (Number(v) || 0) / MS_PER_SECOND),
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
				// Date + Duration = Date
				if (isDate(left) && isDuration(right)) {
					left = new Date(left.getTime() + right._ms);
				} else if (isDuration(left) && isDate(right)) {
					left = new Date(right.getTime() + left._ms);
				} else if (isDuration(left) && isDuration(right)) {
					left = new Duration(left._ms + right._ms);
				// String concatenation if either operand is a string
				} else if (typeof left === 'string' || typeof right === 'string') {
					left = String(left ?? '') + String(right ?? '');
				} else {
					left = (left ?? 0) + (right ?? 0);
				}
			} else {
				// Date - Duration = Date
				if (isDate(left) && isDuration(right)) {
					left = new Date(left.getTime() - right._ms);
				// Date - Date = Duration
				} else if (isDate(left) && isDate(right)) {
					left = new Duration(left.getTime() - right.getTime());
				} else if (isDuration(left) && isDuration(right)) {
					left = new Duration(left._ms - right._ms);
				} else {
					left = (left ?? 0) - (right ?? 0);
				}
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

		// Resolve column references — detect dates, numbers, and strings
		for (const token of tokens) {
			if (token.type === 'COLUMN_REF') {
				const colName = token.value as string;
				const val = row[colName];
				if (val === null || val === undefined || val === '') {
					token.value = null as any;
					token.type = 'NUMBER';
				} else if (val instanceof Date) {
					// Already a Date object (from function return)
					token.value = val as any;
					token.type = 'STRING'; // sentinel — parser returns the value directly
				} else if (typeof val === 'string' && ISO_DATE_RE.test(val)) {
					// ISO date string — parse to Date for date-aware operations
					const parsed = new Date(val);
					if (!isNaN(parsed.getTime())) {
						token.value = parsed as any;
						token.type = 'STRING'; // sentinel
					} else {
						token.value = val;
						token.type = 'STRING';
					}
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

		// Date and Duration pass through as-is — FormulaCell handles formatting
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
