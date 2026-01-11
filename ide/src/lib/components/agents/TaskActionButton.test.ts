/**
 * TaskActionButton - handleResume Error Handling Tests
 *
 * Tests for the handleResume function to verify error toast behavior
 * for different failure scenarios (404, API errors, network errors).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================================================
// Mocks
// ============================================================================

// Mock the toasts store
const mockErrorToast = vi.fn();
const mockSuccessToast = vi.fn();

vi.mock('$lib/stores/toasts.svelte', () => ({
	errorToast: (...args: unknown[]) => mockErrorToast(...args),
	successToast: (...args: unknown[]) => mockSuccessToast(...args)
}));

// Mock the taskEvents store
const mockBroadcastTaskEvent = vi.fn();

vi.mock('$lib/stores/taskEvents', () => ({
	broadcastTaskEvent: (...args: unknown[]) => mockBroadcastTaskEvent(...args)
}));

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Simulates the handleResume function logic from TaskActionButton.svelte
 * This extracts the core logic so we can test it without mounting the component.
 */
async function handleResumeLogic(
	taskAssignee: string | undefined,
	mockFetch: typeof fetch
): Promise<{
	resumeError: string | null;
	success: boolean;
}> {
	if (!taskAssignee) {
		return { resumeError: null, success: false };
	}

	let resumeError: string | null = null;
	let success = false;

	try {
		const response = await mockFetch(`/api/sessions/${taskAssignee}/resume`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});

		if (!response.ok) {
			const data = await response.json();
			// Show user-friendly error - session files cleaned up is common after restart
			if (response.status === 404) {
				resumeError = 'Session expired - release task and restart';
				mockErrorToast('Resume failed', 'Session expired - release task and restart');
			} else {
				resumeError = data.message || data.error || 'Resume failed';
				mockErrorToast('Resume failed', data.message || data.error || 'Could not resume session');
			}
			console.error('Resume failed:', data.message || data.error);
		} else {
			// Show success toast
			mockSuccessToast('Session resumed', `Resuming ${taskAssignee}'s session`);
			// Broadcast event so pages refresh immediately
			mockBroadcastTaskEvent('session-resumed', taskAssignee);
			success = true;
		}
	} catch (err) {
		resumeError = 'Network error';
		mockErrorToast('Resume failed', 'Network error - check your connection');
		console.error('Resume error:', err);
	}

	return { resumeError, success };
}

// ============================================================================
// Tests: handleResume Error Scenarios
// ============================================================================

describe('handleResume', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// --------------------------------------------------------------------------
	// 404 Error - Session Expired
	// --------------------------------------------------------------------------

	describe('404 error (session expired)', () => {
		it('should show error toast with "Session expired" message', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				json: () => Promise.resolve({ error: 'Session not found' })
			});

			const result = await handleResumeLogic('TestAgent', mockFetch);

			expect(result.success).toBe(false);
			expect(result.resumeError).toBe('Session expired - release task and restart');
			expect(mockErrorToast).toHaveBeenCalledTimes(1);
			expect(mockErrorToast).toHaveBeenCalledWith(
				'Resume failed',
				'Session expired - release task and restart'
			);
		});

		it('should set resumeError state to "Session expired - release task and restart"', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				json: () => Promise.resolve({ message: 'No session file found' })
			});

			const result = await handleResumeLogic('TestAgent', mockFetch);

			expect(result.resumeError).toBe('Session expired - release task and restart');
		});

		it('should NOT call successToast on 404 error', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				json: () => Promise.resolve({})
			});

			await handleResumeLogic('TestAgent', mockFetch);

			expect(mockSuccessToast).not.toHaveBeenCalled();
		});

		it('should NOT broadcast task event on 404 error', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				json: () => Promise.resolve({})
			});

			await handleResumeLogic('TestAgent', mockFetch);

			expect(mockBroadcastTaskEvent).not.toHaveBeenCalled();
		});
	});

	// --------------------------------------------------------------------------
	// API Errors (non-404)
	// --------------------------------------------------------------------------

	describe('API errors (non-404)', () => {
		it('should show error toast with server message when provided', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: () => Promise.resolve({ message: 'Internal server error' })
			});

			const result = await handleResumeLogic('TestAgent', mockFetch);

			expect(result.success).toBe(false);
			expect(result.resumeError).toBe('Internal server error');
			expect(mockErrorToast).toHaveBeenCalledTimes(1);
			expect(mockErrorToast).toHaveBeenCalledWith('Resume failed', 'Internal server error');
		});

		it('should show error toast with error field when message is not provided', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 400,
				json: () => Promise.resolve({ error: 'Bad request - invalid agent name' })
			});

			const result = await handleResumeLogic('TestAgent', mockFetch);

			expect(result.resumeError).toBe('Bad request - invalid agent name');
			expect(mockErrorToast).toHaveBeenCalledWith('Resume failed', 'Bad request - invalid agent name');
		});

		it('should show fallback error toast when no message or error in response', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: () => Promise.resolve({})
			});

			const result = await handleResumeLogic('TestAgent', mockFetch);

			expect(result.resumeError).toBe('Resume failed');
			expect(mockErrorToast).toHaveBeenCalledWith('Resume failed', 'Could not resume session');
		});

		it('should handle 401 unauthorized error', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 401,
				json: () => Promise.resolve({ message: 'Unauthorized' })
			});

			const result = await handleResumeLogic('TestAgent', mockFetch);

			expect(result.success).toBe(false);
			expect(result.resumeError).toBe('Unauthorized');
			expect(mockErrorToast).toHaveBeenCalledWith('Resume failed', 'Unauthorized');
		});

		it('should handle 503 service unavailable error', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 503,
				json: () => Promise.resolve({ error: 'Service temporarily unavailable' })
			});

			const result = await handleResumeLogic('TestAgent', mockFetch);

			expect(result.resumeError).toBe('Service temporarily unavailable');
			expect(mockErrorToast).toHaveBeenCalledWith('Resume failed', 'Service temporarily unavailable');
		});
	});

	// --------------------------------------------------------------------------
	// Network Errors
	// --------------------------------------------------------------------------

	describe('network errors', () => {
		it('should show network error toast when fetch throws', async () => {
			const mockFetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

			const result = await handleResumeLogic('TestAgent', mockFetch);

			expect(result.success).toBe(false);
			expect(result.resumeError).toBe('Network error');
			expect(mockErrorToast).toHaveBeenCalledTimes(1);
			expect(mockErrorToast).toHaveBeenCalledWith(
				'Resume failed',
				'Network error - check your connection'
			);
		});

		it('should handle TypeError from fetch (common network error)', async () => {
			const mockFetch = vi.fn().mockRejectedValue(new TypeError('NetworkError when attempting to fetch resource'));

			const result = await handleResumeLogic('TestAgent', mockFetch);

			expect(result.resumeError).toBe('Network error');
			expect(mockErrorToast).toHaveBeenCalledWith(
				'Resume failed',
				'Network error - check your connection'
			);
		});

		it('should handle AbortError from fetch timeout', async () => {
			const abortError = new DOMException('The operation was aborted', 'AbortError');
			const mockFetch = vi.fn().mockRejectedValue(abortError);

			const result = await handleResumeLogic('TestAgent', mockFetch);

			expect(result.resumeError).toBe('Network error');
			expect(mockErrorToast).toHaveBeenCalledWith(
				'Resume failed',
				'Network error - check your connection'
			);
		});

		it('should NOT call successToast on network error', async () => {
			const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

			await handleResumeLogic('TestAgent', mockFetch);

			expect(mockSuccessToast).not.toHaveBeenCalled();
		});

		it('should NOT broadcast task event on network error', async () => {
			const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

			await handleResumeLogic('TestAgent', mockFetch);

			expect(mockBroadcastTaskEvent).not.toHaveBeenCalled();
		});
	});

	// --------------------------------------------------------------------------
	// Success Case
	// --------------------------------------------------------------------------

	describe('success case', () => {
		it('should show success toast on successful resume', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ success: true })
			});

			const result = await handleResumeLogic('TestAgent', mockFetch);

			expect(result.success).toBe(true);
			expect(result.resumeError).toBeNull();
			expect(mockSuccessToast).toHaveBeenCalledTimes(1);
			expect(mockSuccessToast).toHaveBeenCalledWith(
				'Session resumed',
				"Resuming TestAgent's session"
			);
		});

		it('should broadcast session-resumed event on success', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: () => Promise.resolve({})
			});

			await handleResumeLogic('TestAgent', mockFetch);

			expect(mockBroadcastTaskEvent).toHaveBeenCalledTimes(1);
			expect(mockBroadcastTaskEvent).toHaveBeenCalledWith('session-resumed', 'TestAgent');
		});

		it('should NOT call errorToast on success', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: () => Promise.resolve({})
			});

			await handleResumeLogic('TestAgent', mockFetch);

			expect(mockErrorToast).not.toHaveBeenCalled();
		});
	});

	// --------------------------------------------------------------------------
	// Edge Cases
	// --------------------------------------------------------------------------

	describe('edge cases', () => {
		it('should return early if assignee is undefined', async () => {
			const mockFetch = vi.fn();

			const result = await handleResumeLogic(undefined, mockFetch);

			expect(result.success).toBe(false);
			expect(mockFetch).not.toHaveBeenCalled();
			expect(mockErrorToast).not.toHaveBeenCalled();
			expect(mockSuccessToast).not.toHaveBeenCalled();
		});

		it('should call correct API endpoint with agent name', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: () => Promise.resolve({})
			});

			await handleResumeLogic('MySpecialAgent', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/sessions/MySpecialAgent/resume',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' }
				}
			);
		});

		it('should handle JSON parse error in error response', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: () => Promise.reject(new Error('Invalid JSON'))
			});

			// This would throw, but handleResume catches all errors
			const result = await handleResumeLogic('TestAgent', mockFetch);

			// The catch block should handle this as a network error
			expect(result.resumeError).toBe('Network error');
			expect(mockErrorToast).toHaveBeenCalledWith(
				'Resume failed',
				'Network error - check your connection'
			);
		});
	});
});
