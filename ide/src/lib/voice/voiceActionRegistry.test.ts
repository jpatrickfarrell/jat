import { describe, it, expect, beforeEach } from 'vitest';
import {
	registerVoiceActionHandlers,
	addVoiceActionHandlers,
	getVoiceActionHandler,
	_resetVoiceActionRegistry
} from './voiceActionRegistry';

beforeEach(() => {
	_resetVoiceActionRegistry();
});

describe('registerVoiceActionHandlers', () => {
	it('replaces global handlers but leaves additive handlers intact', () => {
		const globalA = () => {};
		const globalB = () => {};
		const routeX = () => {};

		registerVoiceActionHandlers({ 'global-a': globalA, 'global-b': globalB });
		addVoiceActionHandlers({ 'route-x': routeX });

		registerVoiceActionHandlers({ 'global-c': () => {} });

		expect(getVoiceActionHandler('global-a')).toBeUndefined();
		expect(getVoiceActionHandler('global-b')).toBeUndefined();
		expect(getVoiceActionHandler('global-c')).toBeDefined();
		expect(getVoiceActionHandler('route-x')).toBe(routeX);
	});
});

describe('addVoiceActionHandlers', () => {
	it('merges new handlers without clobbering existing ones', () => {
		const existing = () => {};
		const added = () => {};

		registerVoiceActionHandlers({ existing });
		addVoiceActionHandlers({ added });

		expect(getVoiceActionHandler('existing')).toBe(existing);
		expect(getVoiceActionHandler('added')).toBe(added);
	});

	it('returns a cleanup that only removes keys this call added', () => {
		const layoutHandler = () => {};
		const routeHandler = () => {};

		registerVoiceActionHandlers({ layout: layoutHandler });
		const cleanup = addVoiceActionHandlers({ route: routeHandler });

		expect(getVoiceActionHandler('route')).toBe(routeHandler);
		cleanup();

		expect(getVoiceActionHandler('route')).toBeUndefined();
		expect(getVoiceActionHandler('layout')).toBe(layoutHandler);
	});

	it('cleanup does not remove a key that was overwritten by a later call', () => {
		const first = () => {};
		const second = () => {};

		const cleanupFirst = addVoiceActionHandlers({ shared: first });
		addVoiceActionHandlers({ shared: second });

		cleanupFirst();
		expect(getVoiceActionHandler('shared')).toBe(second);
	});
});
