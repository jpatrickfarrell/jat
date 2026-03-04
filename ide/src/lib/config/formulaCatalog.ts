/**
 * Static catalog of formula function metadata.
 * Single source of truth for autocomplete content.
 */

export interface FormulaEntry {
	name: string;
	signature: string;
	description: string;
	example: string;
	category: string;
	insertText: string;
}

export const FORMULA_CATALOG: FormulaEntry[] = [
	// ─── Math ───────────────────────────────────────────────────────────────
	{ name: 'round', signature: 'round(number, decimals?)', description: 'Round to N decimal places', example: 'round({price} * 1.1, 2) → 22.11', category: 'Math', insertText: 'round(' },
	{ name: 'floor', signature: 'floor(number)', description: 'Round down to nearest integer', example: 'floor(3.7) → 3', category: 'Math', insertText: 'floor(' },
	{ name: 'ceil', signature: 'ceil(number)', description: 'Round up to nearest integer', example: 'ceil(3.2) → 4', category: 'Math', insertText: 'ceil(' },
	{ name: 'abs', signature: 'abs(number)', description: 'Absolute value', example: 'abs(-5) → 5', category: 'Math', insertText: 'abs(' },
	{ name: 'min', signature: 'min(a, b, ...)', description: 'Smallest of given values', example: 'min({a}, {b}, {c}) → 1', category: 'Math', insertText: 'min(' },
	{ name: 'max', signature: 'max(a, b, ...)', description: 'Largest of given values', example: 'max({a}, {b}, {c}) → 10', category: 'Math', insertText: 'max(' },
	{ name: 'sum', signature: 'sum(a, b, ...)', description: 'Sum of all arguments', example: 'sum({a}, {b}, {c}) → 15', category: 'Math', insertText: 'sum(' },
	{ name: 'average', signature: 'average(a, b, ...)', description: 'Mean of all arguments', example: 'average(10, 20, 30) → 20', category: 'Math', insertText: 'average(' },
	{ name: 'product', signature: 'product(a, b, ...)', description: 'Multiply all arguments', example: 'product(2, 3, 4) → 24', category: 'Math', insertText: 'product(' },
	{ name: 'power', signature: 'power(base, exp)', description: 'Base raised to exponent', example: 'power(2, 8) → 256', category: 'Math', insertText: 'power(' },
	{ name: 'squareroot', signature: 'squareroot(number)', description: 'Square root', example: 'squareroot(144) → 12', category: 'Math', insertText: 'squareroot(' },
	{ name: 'sign', signature: 'sign(number)', description: 'Sign of number (-1, 0, or 1)', example: 'sign(-42) → -1', category: 'Math', insertText: 'sign(' },
	{ name: 'log', signature: 'log(number, base?)', description: 'Logarithm (natural if no base)', example: 'log(100, 10) → 2', category: 'Math', insertText: 'log(' },
	{ name: 'log10', signature: 'log10(number)', description: 'Base-10 logarithm', example: 'log10(1000) → 3', category: 'Math', insertText: 'log10(' },
	{ name: 'ln', signature: 'ln(number)', description: 'Natural logarithm', example: 'ln(2.718) → 1', category: 'Math', insertText: 'ln(' },
	{ name: 'pi', signature: 'pi()', description: 'The constant π', example: 'pi() → 3.14159…', category: 'Math', insertText: 'pi(' },
	{ name: 'random', signature: 'random()', description: 'Random number between 0 and 1', example: 'random() → 0.473…', category: 'Math', insertText: 'random(' },
	{ name: 'randominteger', signature: 'randominteger(min, max)', description: 'Random integer in range', example: 'randominteger(1, 10) → 7', category: 'Math', insertText: 'randominteger(' },
	{ name: 'even', signature: 'even(number)', description: 'Round up to nearest even integer', example: 'even(3) → 4', category: 'Math', insertText: 'even(' },
	{ name: 'odd', signature: 'odd(number)', description: 'Round up to nearest odd integer', example: 'odd(4) → 5', category: 'Math', insertText: 'odd(' },
	{ name: 'iseven', signature: 'iseven(number)', description: 'Is even? Returns 1 or 0', example: 'iseven(4) → 1', category: 'Math', insertText: 'iseven(' },
	{ name: 'isodd', signature: 'isodd(number)', description: 'Is odd? Returns 1 or 0', example: 'isodd(3) → 1', category: 'Math', insertText: 'isodd(' },
	{ name: 'truncate', signature: 'truncate(number)', description: 'Remove decimal part', example: 'truncate(3.9) → 3', category: 'Math', insertText: 'truncate(' },
	{ name: 'rounddown', signature: 'rounddown(number, places?)', description: 'Round towards zero', example: 'rounddown(3.78, 1) → 3.7', category: 'Math', insertText: 'rounddown(' },
	{ name: 'roundup', signature: 'roundup(number, places?)', description: 'Round away from zero', example: 'roundup(3.21, 1) → 3.3', category: 'Math', insertText: 'roundup(' },
	{ name: 'remainder', signature: 'remainder(a, b)', description: 'Modulo / remainder', example: 'remainder(10, 3) → 1', category: 'Math', insertText: 'remainder(' },
	{ name: 'factorial', signature: 'factorial(n)', description: 'Factorial (n!)', example: 'factorial(5) → 120', category: 'Math', insertText: 'factorial(' },
	{ name: 'exponent', signature: 'exponent(n)', description: 'e raised to n', example: 'exponent(1) → 2.718…', category: 'Math', insertText: 'exponent(' },

	// ─── String ─────────────────────────────────────────────────────────────
	{ name: 'len', signature: 'len(text)', description: 'Length of text', example: 'len("hello") → 5', category: 'String', insertText: 'len(' },
	{ name: 'upper', signature: 'upper(text)', description: 'Convert to uppercase', example: '{name}.upper() → "ALICE"', category: 'String', insertText: 'upper(' },
	{ name: 'lower', signature: 'lower(text)', description: 'Convert to lowercase', example: '{name}.lower() → "alice"', category: 'String', insertText: 'lower(' },
	{ name: 'trim', signature: 'trim(text)', description: 'Remove leading/trailing whitespace', example: 'trim("  hi  ") → "hi"', category: 'String', insertText: 'trim(' },
	{ name: 'concat', signature: 'concat(a, b, ...)', description: 'Join strings together', example: 'concat({first}, " ", {last})', category: 'String', insertText: 'concat(' },
	{ name: 'left', signature: 'left(text, n)', description: 'First N characters', example: '{name}.left(3) → "Ali"', category: 'String', insertText: 'left(' },
	{ name: 'right', signature: 'right(text, n)', description: 'Last N characters', example: '{name}.right(3) → "ice"', category: 'String', insertText: 'right(' },
	{ name: 'middle', signature: 'middle(text, start, count)', description: 'Substring from position', example: 'middle("hello", 1, 3) → "ell"', category: 'String', insertText: 'middle(' },
	{ name: 'replace', signature: 'replace(text, start, count, new)', description: 'Replace characters at position', example: 'replace("hello", 0, 2, "HE") → "HEllo"', category: 'String', insertText: 'replace(' },
	{ name: 'substitute', signature: 'substitute(text, old, new)', description: 'Replace first occurrence', example: 'substitute("hello", "l", "L") → "heLlo"', category: 'String', insertText: 'substitute(' },
	{ name: 'substituteall', signature: 'substituteall(text, old, new)', description: 'Replace all occurrences', example: 'substituteall("hello", "l", "L") → "heLLo"', category: 'String', insertText: 'substituteall(' },
	{ name: 'split', signature: 'split(text, delimiter)', description: 'Split text and join with commas', example: 'split("a-b-c", "-") → "a, b, c"', category: 'String', insertText: 'split(' },
	{ name: 'join', signature: 'join(text, delimiter)', description: 'Re-join comma-separated values', example: 'join("a,b,c", " | ") → "a | b | c"', category: 'String', insertText: 'join(' },
	{ name: 'repeat', signature: 'repeat(text, n)', description: 'Repeat text N times', example: 'repeat("ha", 3) → "hahaha"', category: 'String', insertText: 'repeat(' },
	{ name: 'startswith', signature: 'startswith(text, prefix)', description: 'Starts with prefix? 1 or 0', example: 'startswith("hello", "he") → 1', category: 'String', insertText: 'startswith(' },
	{ name: 'endswith', signature: 'endswith(text, suffix)', description: 'Ends with suffix? 1 or 0', example: 'endswith("hello", "lo") → 1', category: 'String', insertText: 'endswith(' },
	{ name: 'containstext', signature: 'containstext(text, search)', description: 'Contains substring? (case-insensitive)', example: 'containstext("Hello", "ell") → 1', category: 'String', insertText: 'containstext(' },
	{ name: 'character', signature: 'character(code)', description: 'Character from char code', example: 'character(65) → "A"', category: 'String', insertText: 'character(' },
	{ name: 'leftpad', signature: 'leftpad(text, len, pad?)', description: 'Pad text on the left', example: 'leftpad("42", 5, "0") → "00042"', category: 'String', insertText: 'leftpad(' },
	{ name: 'rightpad', signature: 'rightpad(text, len, pad?)', description: 'Pad text on the right', example: 'rightpad("hi", 5, ".") → "hi..."', category: 'String', insertText: 'rightpad(' },
	{ name: 'regexmatch', signature: 'regexmatch(text, pattern)', description: 'Regex test (1 if match, 0 if not)', example: 'regexmatch("abc123", "\\d+") → 1', category: 'String', insertText: 'regexmatch(' },
	{ name: 'regexextract', signature: 'regexextract(text, pattern)', description: 'Extract first regex match', example: 'regexextract("abc123", "\\d+") → "123"', category: 'String', insertText: 'regexextract(' },
	{ name: 'regexreplace', signature: 'regexreplace(text, pattern, rep)', description: 'Replace all regex matches', example: 'regexreplace("a1b2", "\\d", "X") → "aXbX"', category: 'String', insertText: 'regexreplace(' },

	// ─── Logic ──────────────────────────────────────────────────────────────
	{ name: 'if', signature: 'if(cond, trueVal, falseVal)', description: 'Conditional value', example: 'if({qty} > 10, "bulk", "single")', category: 'Logic', insertText: 'if(' },
	{ name: 'and', signature: 'and(a, b, ...)', description: 'All truthy? Returns 1 or 0', example: 'and({a} > 0, {b} > 0) → 1', category: 'Logic', insertText: 'and(' },
	{ name: 'or', signature: 'or(a, b, ...)', description: 'Any truthy? Returns 1 or 0', example: 'or({a} > 0, {b} > 0) → 1', category: 'Logic', insertText: 'or(' },
	{ name: 'not', signature: 'not(value)', description: 'Invert truthy/falsy', example: 'not(0) → 1', category: 'Logic', insertText: 'not(' },
	{ name: 'switch', signature: 'switch(expr, val1, res1, ...default)', description: 'Match expression to value pairs', example: 'switch({status}, "a", 1, "b", 2, 0)', category: 'Logic', insertText: 'switch(' },
	{ name: 'switchif', signature: 'switchif(cond1, res1, ...default)', description: 'First true condition wins', example: 'switchif({x}>10, "high", {x}>5, "mid", "low")', category: 'Logic', insertText: 'switchif(' },
	{ name: 'ifblank', signature: 'ifblank(value, fallback)', description: 'Return fallback if blank/null', example: 'ifblank({note}, "N/A") → "N/A"', category: 'Logic', insertText: 'ifblank(' },
	{ name: 'isblank', signature: 'isblank(value)', description: 'Is null/empty? Returns 1 or 0', example: 'isblank("") → 1', category: 'Logic', insertText: 'isblank(' },
	{ name: 'isnotblank', signature: 'isnotblank(value)', description: 'Has a value? Returns 1 or 0', example: 'isnotblank("hi") → 1', category: 'Logic', insertText: 'isnotblank(' },
	{ name: 'isnumber', signature: 'isnumber(value)', description: 'Is numeric? Returns 1 or 0', example: 'isnumber("42") → 1', category: 'Logic', insertText: 'isnumber(' },

	// ─── Format ─────────────────────────────────────────────────────────────
	{ name: 'tonumber', signature: 'tonumber(value)', description: 'Convert to number', example: 'tonumber("42") → 42', category: 'Format', insertText: 'tonumber(' },
	{ name: 'totext', signature: 'totext(value)', description: 'Convert to text string', example: 'totext(42) → "42"', category: 'Format', insertText: 'totext(' },
	{ name: 'formatcurrency', signature: 'formatcurrency(n, currency?, dec?)', description: 'Format as currency string', example: 'formatcurrency(1234.5, "USD", 2) → "$1,234.50"', category: 'Format', insertText: 'formatcurrency(' },
	{ name: 'formatnumber', signature: 'formatnumber(n, decimals?, sep?)', description: 'Format number with separators', example: 'formatnumber(1234567, 0) → "1,234,567"', category: 'Format', insertText: 'formatnumber(' },
	{ name: 'formatpercent', signature: 'formatpercent(n, decimals?)', description: 'Format as percentage', example: 'formatpercent(0.856, 1) → "85.6%"', category: 'Format', insertText: 'formatpercent(' },

	// ─── Date ───────────────────────────────────────────────────────────────
	{ name: 'now', signature: 'now()', description: 'Current date and time', example: 'now() → 2026-03-04T15:30:00', category: 'Date', insertText: 'now(' },
	{ name: 'today', signature: 'today()', description: 'Current date (midnight)', example: 'today() → 2026-03-04', category: 'Date', insertText: 'today(' },
	{ name: 'date', signature: 'date(year, month, day)', description: 'Create a date', example: 'date(2026, 3, 15)', category: 'Date', insertText: 'date(' },
	{ name: 'year', signature: 'year(date)', description: 'Extract year from date', example: 'year({created}) → 2026', category: 'Date', insertText: 'year(' },
	{ name: 'month', signature: 'month(date)', description: 'Extract month (1-12)', example: 'month({created}) → 3', category: 'Date', insertText: 'month(' },
	{ name: 'day', signature: 'day(date)', description: 'Extract day of month', example: 'day({created}) → 15', category: 'Date', insertText: 'day(' },
	{ name: 'hour', signature: 'hour(date)', description: 'Extract hour (0-23)', example: 'hour({timestamp}) → 14', category: 'Date', insertText: 'hour(' },
	{ name: 'minute', signature: 'minute(date)', description: 'Extract minutes (0-59)', example: 'minute({timestamp}) → 30', category: 'Date', insertText: 'minute(' },
	{ name: 'second', signature: 'second(date)', description: 'Extract seconds (0-59)', example: 'second({timestamp}) → 45', category: 'Date', insertText: 'second(' },
	{ name: 'weekday', signature: 'weekday(date)', description: 'Day of week (0=Sun, 6=Sat)', example: 'weekday({created}) → 2', category: 'Date', insertText: 'weekday(' },
	{ name: 'weekdayname', signature: 'weekdayname(date)', description: 'Name of day of week', example: 'weekdayname({created}) → "Tuesday"', category: 'Date', insertText: 'weekdayname(' },
	{ name: 'monthname', signature: 'monthname(date)', description: 'Name of month', example: 'monthname({created}) → "March"', category: 'Date', insertText: 'monthname(' },
	{ name: 'weeknumber', signature: 'weeknumber(date)', description: 'ISO week number', example: 'weeknumber({created}) → 11', category: 'Date', insertText: 'weeknumber(' },
	{ name: 'datetoepoch', signature: 'datetoepoch(date)', description: 'Convert date to Unix timestamp', example: 'datetoepoch({created}) → 1772668800', category: 'Date', insertText: 'datetoepoch(' },
	{ name: 'epochtodate', signature: 'epochtodate(epoch)', description: 'Convert Unix timestamp to date', example: 'epochtodate(1772668800)', category: 'Date', insertText: 'epochtodate(' },
	{ name: 'relativedate', signature: 'relativedate(date, days)', description: 'Add/subtract days from date', example: 'relativedate({due}, -7) → one week before', category: 'Date', insertText: 'relativedate(' },
	{ name: 'endofmonth', signature: 'endofmonth(date)', description: 'Last day of the month', example: 'endofmonth({created}) → 2026-03-31', category: 'Date', insertText: 'endofmonth(' },
	{ name: 'todate', signature: 'todate(value)', description: 'Convert to date (strip time)', example: 'todate({timestamp})', category: 'Date', insertText: 'todate(' },
	{ name: 'todatetime', signature: 'todatetime(value)', description: 'Convert to date with time', example: 'todatetime("2026-03-04")', category: 'Date', insertText: 'todatetime(' },

	// ─── Duration ───────────────────────────────────────────────────────────
	{ name: 'days', signature: 'days(n)', description: 'Create N-day duration', example: '{due} + days(7) → one week later', category: 'Duration', insertText: 'days(' },
	{ name: 'hours', signature: 'hours(n)', description: 'Create N-hour duration', example: '{start} + hours(2)', category: 'Duration', insertText: 'hours(' },
	{ name: 'minutes', signature: 'minutes(n)', description: 'Create N-minute duration', example: '{start} + minutes(30)', category: 'Duration', insertText: 'minutes(' },
	{ name: 'seconds', signature: 'seconds(n)', description: 'Create N-second duration', example: '{start} + seconds(90)', category: 'Duration', insertText: 'seconds(' },
	{ name: 'todays', signature: 'todays(duration)', description: 'Convert duration to days', example: 'todays({end} - {start}) → 5', category: 'Duration', insertText: 'todays(' },
	{ name: 'tohours', signature: 'tohours(duration)', description: 'Convert duration to hours', example: 'tohours({end} - {start}) → 120', category: 'Duration', insertText: 'tohours(' },
	{ name: 'tominutes', signature: 'tominutes(duration)', description: 'Convert duration to minutes', example: 'tominutes({end} - {start}) → 7200', category: 'Duration', insertText: 'tominutes(' },
	{ name: 'toseconds', signature: 'toseconds(duration)', description: 'Convert duration to seconds', example: 'toseconds({end} - {start}) → 432000', category: 'Duration', insertText: 'toseconds(' },

	// ─── Aggregate ──────────────────────────────────────────────────────────
	{ name: 'countif', signature: 'countif({col}, condition)', description: 'Count rows matching condition', example: 'countif({status}, "done") → 12', category: 'Aggregate', insertText: 'countif(' },
	{ name: 'sumif', signature: 'sumif({sumCol}, {condCol}, cond)', description: 'Sum rows where condition matches', example: 'sumif({amount}, {status}, "paid") → 450', category: 'Aggregate', insertText: 'sumif(' },
	{ name: 'averageif', signature: 'averageif({avgCol}, {condCol}, cond)', description: 'Average rows where condition matches', example: 'averageif({score}, {grade}, "A") → 95', category: 'Aggregate', insertText: 'averageif(' },
	{ name: 'median', signature: 'median({col})', description: 'Median value across all rows', example: 'median({score}) → 75', category: 'Aggregate', insertText: 'median(' },
	{ name: 'mode', signature: 'mode({col})', description: 'Most frequent value across rows', example: 'mode({category}) → "Electronics"', category: 'Aggregate', insertText: 'mode(' },
	{ name: 'percentile', signature: 'percentile({col}, p)', description: 'Percentile value (p = 0–100)', example: 'percentile({score}, 90) → 95', category: 'Aggregate', insertText: 'percentile(' },
	{ name: 'rank', signature: 'rank(value, {col}, order?)', description: 'Rank of value in column', example: 'rank({score}, {score}) → 3', category: 'Aggregate', insertText: 'rank(' },
	{ name: 'standarddeviation', signature: 'standarddeviation({col})', description: 'Standard deviation of column', example: 'standarddeviation({score}) → 12.5', category: 'Aggregate', insertText: 'standarddeviation(' },
	{ name: 'filter', signature: 'filter({col}, condition)', description: 'Comma-separated matching values', example: 'filter({name}, "active") → "A, B, C"', category: 'Aggregate', insertText: 'filter(' },
	{ name: 'filterby', signature: 'filterby({returnCol}, {condCol}, cond)', description: 'Values from one column where another matches', example: 'filterby({amount}, {dept}, "Sales") → "100, 250"', category: 'Aggregate', insertText: 'filterby(' },
	{ name: 'lookup', signature: 'lookup({searchCol}, val, {returnCol})', description: 'Find row and return column value', example: 'lookup({id}, "A1", {name}) → "Alice"', category: 'Aggregate', insertText: 'lookup(' },
];

/** Quick lookup: name → entry */
export const FORMULA_CATALOG_MAP: Map<string, FormulaEntry> = new Map(
	FORMULA_CATALOG.map(e => [e.name, e])
);
