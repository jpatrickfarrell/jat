import { describe, it, expect, beforeEach } from 'vitest';
import {
	registerResolver,
	getResolver,
	resolveParameter,
	_resetParameterResolvers,
	type Resolver
} from './parameterResolver';

beforeEach(() => {
	_resetParameterResolvers();
});

describe('registerResolver', () => {
	it('registers a resolver for a parameter type', () => {
		const fn: Resolver = () => ({ status: 'resolved', value: 'X' });
		registerResolver('task-id', fn);
		expect(getResolver('task-id')).toBe(fn);
	});

	it('replaces an existing resolver for the same paramType (HMR-friendly)', () => {
		const first: Resolver = () => ({ status: 'resolved', value: 'first' });
		const second: Resolver = () => ({ status: 'resolved', value: 'second' });

		registerResolver('task-id', first);
		registerResolver('task-id', second);

		expect(getResolver('task-id')).toBe(second);

		const result = resolveParameter('task-id', 'anything', {});
		if (result.status !== 'resolved') throw new Error('expected resolved');
		expect(result.value).toBe('second');
	});

	it('keeps resolvers for different paramTypes independent', () => {
		const taskResolver: Resolver = () => ({ status: 'resolved', value: 'jat-1' });
		const sessionResolver: Resolver = () => ({ status: 'resolved', value: 'jat-Foo' });

		registerResolver('task-id', taskResolver);
		registerResolver('session-name', sessionResolver);

		expect(getResolver('task-id')).toBe(taskResolver);
		expect(getResolver('session-name')).toBe(sessionResolver);
	});
});

describe('resolveParameter', () => {
	it('returns not-found with diagnostic reason when paramType is unregistered', () => {
		const result = resolveParameter('contract-id', 'whatever', {});
		expect(result.status).toBe('not-found');
		if (result.status === 'not-found') {
			expect(result.reason).toContain('contract-id');
		}
	});

	it('passes text and ctx through to the registered resolver', () => {
		let receivedText = '';
		let receivedCtx: unknown = null;
		const fn: Resolver = (text, ctx) => {
			receivedText = text;
			receivedCtx = ctx;
			return { status: 'resolved', value: 'ok' };
		};

		registerResolver('task-id', fn);
		const ctx = { visibleTasks: [{ id: 'jat-1', title: 'X' }] };
		resolveParameter('task-id', 'the auth task', ctx);

		expect(receivedText).toBe('the auth task');
		expect(receivedCtx).toBe(ctx);
	});

	it('lets a test stub completely change framework behavior without framework changes', () => {
		// Acceptance criterion: swapping the resolver with a test stub changes
		// behavior without framework changes.
		const realResolver: Resolver = () => ({ status: 'resolved', value: 'real' });
		registerResolver('task-id', realResolver);
		expect(
			resolveParameter('task-id', 'x', {})
		).toEqual({ status: 'resolved', value: 'real' });

		const stub: Resolver = () => ({ status: 'not-found', reason: 'stubbed' });
		registerResolver('task-id', stub);
		const result = resolveParameter('task-id', 'x', {});
		expect(result.status).toBe('not-found');
		if (result.status === 'not-found') {
			expect(result.reason).toBe('stubbed');
		}
	});

	it('forwards ambiguous results unchanged', () => {
		const fn: Resolver = () => ({
			status: 'ambiguous',
			candidates: [
				{ value: 'jat-1', label: 'A' },
				{ value: 'jat-2', label: 'B' }
			]
		});
		registerResolver('task-id', fn);

		const result = resolveParameter('task-id', 'auth', {});
		expect(result.status).toBe('ambiguous');
		if (result.status === 'ambiguous') {
			expect(result.candidates).toHaveLength(2);
		}
	});
});
