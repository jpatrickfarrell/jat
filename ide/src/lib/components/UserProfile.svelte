<script lang="ts">
	/**
	 * UserProfile Component
	 *
	 * User profile dropdown with theme selector, sound settings, and terminal settings.
	 * Shows avatar with user info, theme picker, sound toggle, and terminal height slider.
	 * Uses DaisyUI dropdown component.
	 */

	import { onMount, tick } from 'svelte';
	import ThemeSelector from './ThemeSelector.svelte';
	import { listNav } from '$lib/actions/listNav';
	import {
		enableSounds,
		disableSounds,
		playSuccessChime
	} from '$lib/utils/soundEffects';
	import { getSoundsEnabled } from '$lib/stores/preferences.svelte';
	import {
		requestNotificationPermission,
		getNotificationPermission,
		areBrowserNotificationsSupported,
		getNotificationsEnabled,
		setNotificationsEnabled,
		getFaviconBadgeEnabled,
		setFaviconBadgeEnabled,
		getTitleBadgeEnabled,
		setTitleBadgeEnabled
	} from '$lib/utils/pushNotifications';
	import { getVersionString } from '$lib/version';
	import { successToast, errorToast } from '$lib/stores/toasts.svelte';
	import {
		getSparklineVisible,
		setSparklineVisible,
		getTerminalHeight,
		setTerminalHeight,
		getSessionMaximizeHeight,
		setSessionMaximizeHeight,
		getCtrlCIntercept,
		setCtrlCIntercept,
		getTerminalFontFamily,
		setTerminalFontFamily,
		getTerminalFontSize,
		setTerminalFontSize,
		getTerminalScrollback,
		setTerminalScrollback,
		getEpicCelebration,
		setEpicCelebration,
		getEpicAutoClose,
		setEpicAutoClose,
		getMaxSessions,
		setMaxSessions,
		getToastNeedsInput,
		setToastNeedsInput,
		getToastReview,
		setToastReview,
		getToastComplete,
		setToastComplete,
		getDebugMode,
		setDebugMode,
		TERMINAL_FONT_OPTIONS,
		TERMINAL_FONT_SIZE_OPTIONS,
		TERMINAL_SCROLLBACK_OPTIONS,
		MAX_SESSIONS_OPTIONS,
		SESSION_MAXIMIZE_HEIGHT_OPTIONS,
		type TerminalFontFamily,
		type TerminalFontSize,
		type TerminalScrollback,
		type MaxSessions,
		type SessionMaximizeHeight
	} from '$lib/stores/preferences.svelte';

	// User identity — resolved by /api/config/user: JAT override first, git fallback.
	let userName = $state('');
	let userInitials = $state('');
	let userEmail = $state('');
	// `jat` means set via JAT override, `git` means from git config, `none` means empty.
	let nameSource = $state<'jat' | 'git' | 'none'>('none');
	let emailSource = $state<'jat' | 'git' | 'none'>('none');

	// Identity loading state
	let identityLoading = $state(true);

	// Identity edit state
	let editingIdentity = $state(false);
	let editName = $state('');
	let editEmail = $state('');
	let identitySaving = $state(false);
	let identityError = $state<string | null>(null);
	let editNameInputEl = $state<HTMLInputElement | null>(null);

	async function loadIdentity() {
		identityLoading = true;
		try {
			const res = await fetch('/api/config/user');
			const data = await res.json();
			userName = data.name || '';
			userInitials = data.initials || '';
			userEmail = data.email || '';
			nameSource = data.source?.name ?? 'none';
			emailSource = data.source?.email ?? 'none';
		} catch {
			// keep defaults
		} finally {
			identityLoading = false;
		}
	}

	onMount(loadIdentity);

	async function openIdentityEditor() {
		// Pre-fill with current effective values, not override-only. Saving with
		// the same values the git config already provides is harmless — the
		// backend stores them as an override and falls back if cleared.
		editName = userName;
		editEmail = userEmail;
		identityError = null;
		editingIdentity = true;
		// DaisyUI dropdowns close when `:focus-within` goes false. Swapping the
		// {#if}/{:else} branch destroys the Edit button (which was focused by
		// the click), so focus escapes the dropdown and it closes. Immediately
		// focus the new Name input to keep `:focus-within` true.
		await tick();
		editNameInputEl?.focus();
	}

	async function saveIdentity() {
		identitySaving = true;
		identityError = null;
		try {
			const res = await fetch('/api/config/user', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: editName.trim(),
					email: editEmail.trim()
				})
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.error || `HTTP ${res.status}`);
			}
			const data = await res.json();
			userName = data.name || '';
			userInitials = data.initials || '';
			userEmail = data.email || '';
			nameSource = data.source?.name ?? 'none';
			emailSource = data.source?.email ?? 'none';
			editingIdentity = false;
		} catch (e: any) {
			identityError = e?.message || 'Failed to save identity';
		} finally {
			identitySaving = false;
		}
	}

	async function resetIdentityToGit() {
		if (!confirm('Clear JAT override and fall back to git config user.name / user.email?')) return;
		identitySaving = true;
		identityError = null;
		try {
			const res = await fetch('/api/config/user', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: '', email: '' })
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			await loadIdentity();
			editingIdentity = false;
		} catch (e: any) {
			identityError = e?.message || 'Failed to reset';
		} finally {
			identitySaving = false;
		}
	}

	// User icon SVG path
	const userIcon =
		'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z';

	// Sound icon paths
	const soundOnIcon = 'M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z';
	const soundOffIcon = 'M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z';

	// Sound settings (reactive from preferences store)
	const soundsEnabled = $derived(getSoundsEnabled());
	let isSoundAnimating = $state(false);

	// Sparkline visibility (reactive from preferences store)
	const sparklineVisible = $derived(getSparklineVisible());
	let isSparklineAnimating = $state(false);

	// Debug mode (reactive from preferences store)
	const debugModeEnabled = $derived(getDebugMode());
	let isDebugModeAnimating = $state(false);

	// Ctrl+C intercept (reactive from preferences store)
	const ctrlCIntercept = $derived(getCtrlCIntercept());
	let isCtrlCAnimating = $state(false);

	// Epic celebration settings (reactive from preferences store)
	const epicCelebration = $derived(getEpicCelebration());
	const epicAutoClose = $derived(getEpicAutoClose());
	let isEpicCelebrationAnimating = $state(false);
	let isEpicAutoCloseAnimating = $state(false);

	// Notification settings (reactive from preferences store)
	const browserNotificationsSupported = areBrowserNotificationsSupported();
	const browserNotificationsEnabled = $derived(getNotificationsEnabled());
	const faviconBadgeEnabled = $derived(getFaviconBadgeEnabled());
	const titleBadgeEnabled = $derived(getTitleBadgeEnabled());
	let browserNotificationPermission = $state<NotificationPermission>(getNotificationPermission());
	let isBrowserNotificationsAnimating = $state(false);
	let isFaviconBadgeAnimating = $state(false);
	let isTitleBadgeAnimating = $state(false);

	// Signal toast notification settings (reactive from preferences store)
	const toastNeedsInput = $derived(getToastNeedsInput());
	const toastReview = $derived(getToastReview());
	const toastComplete = $derived(getToastComplete());
	let isToastNeedsInputAnimating = $state(false);
	let isToastReviewAnimating = $state(false);
	let isToastCompleteAnimating = $state(false);

	// Collapsible section state — default all collapsed, persist per-section in localStorage
	function loadExpandedSections(): Set<string> {
		if (typeof localStorage !== 'undefined') {
			try {
				const stored = localStorage.getItem('userprofile-expanded-sections');
				if (stored) return new Set(JSON.parse(stored) as string[]);
			} catch {}
		}
		return new Set();
	}
	let expandedSections = $state<Set<string>>(loadExpandedSections());

	// Help modal
	let showHelpModal = $state(false);

	// Update JAT state
	let isUpdating = $state(false);

	// Keyboard nav
	let avatarButtonRef = $state<HTMLButtonElement | null>(null);

	function handleNavSelect(el: HTMLElement) {
		const firstFocusable = el.querySelector<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])');
		if (firstFocusable && firstFocusable !== el) {
			firstFocusable.focus();
		} else {
			el.click();
		}
	}

	function closeDropdown() {
		(document.activeElement as HTMLElement)?.blur();
		avatarButtonRef?.focus();
	}
	const questionIcon = 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z';

	// Chart/sparkline icon path
	const chartIcon = 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6';

	// Terminal height settings (global user preference)
	const MIN_TERMINAL_HEIGHT = 20;
	const MAX_TERMINAL_HEIGHT = 150;
	const terminalHeight = $derived(getTerminalHeight());

	// Session maximize height (click-to-expand height)
	const sessionMaximizeHeight = $derived(getSessionMaximizeHeight());

	// Terminal font settings (reactive from preferences store)
	const terminalFontFamily = $derived(getTerminalFontFamily());
	const terminalFontSize = $derived(getTerminalFontSize());
	const terminalScrollback = $derived(getTerminalScrollback());

	// Swarm settings (reactive from preferences store)
	const maxSessions = $derived(getMaxSessions());

	function handleSoundToggle() {
		// Trigger animation
		isSoundAnimating = true;

		// Toggle sound after brief delay to let animation start
		// (soundsEnabled is derived from preferences store, so we call enable/disable which update the store)
		setTimeout(() => {
			if (soundsEnabled) {
				disableSounds();
			} else {
				enableSounds();
				// Play a test sound so user knows it works
				setTimeout(() => playSuccessChime(), 100);
			}
		}, 100);

		// Reset animation state
		setTimeout(() => {
			isSoundAnimating = false;
		}, 400);
	}

	function handleSparklineToggle() {
		// Trigger animation
		isSparklineAnimating = true;

		// Toggle after brief delay (store is reactive, UI updates automatically)
		setTimeout(() => {
			setSparklineVisible(!sparklineVisible);
		}, 100);

		// Reset animation state
		setTimeout(() => {
			isSparklineAnimating = false;
		}, 400);
	}

	function handleDebugModeToggle() {
		isDebugModeAnimating = true;
		setTimeout(() => {
			setDebugMode(!debugModeEnabled);
		}, 100);
		setTimeout(() => {
			isDebugModeAnimating = false;
		}, 400);
	}

	function handleCtrlCToggle() {
		// Trigger animation
		isCtrlCAnimating = true;

		// Toggle after brief delay (store is reactive, UI updates automatically)
		setTimeout(() => {
			setCtrlCIntercept(!ctrlCIntercept);
		}, 100);

		// Reset animation state
		setTimeout(() => {
			isCtrlCAnimating = false;
		}, 400);
	}

	function handleEpicCelebrationToggle() {
		// Trigger animation
		isEpicCelebrationAnimating = true;

		// Toggle after brief delay (store is reactive, UI updates automatically)
		setTimeout(() => {
			setEpicCelebration(!epicCelebration);
		}, 100);

		// Reset animation state
		setTimeout(() => {
			isEpicCelebrationAnimating = false;
		}, 400);
	}

	function handleEpicAutoCloseToggle() {
		// Trigger animation
		isEpicAutoCloseAnimating = true;

		// Toggle after brief delay (store is reactive, UI updates automatically)
		setTimeout(() => {
			setEpicAutoClose(!epicAutoClose);
		}, 100);

		// Reset animation state
		setTimeout(() => {
			isEpicAutoCloseAnimating = false;
		}, 400);
	}

	async function handleBrowserNotificationsToggle() {
		// Trigger animation
		isBrowserNotificationsAnimating = true;

		// If enabling and permission not granted, request it
		if (!browserNotificationsEnabled) {
			if (browserNotificationPermission !== 'granted') {
				const permission = await requestNotificationPermission();
				browserNotificationPermission = permission;
				if (permission !== 'granted') {
					// Permission denied, don't enable
					isBrowserNotificationsAnimating = false;
					return;
				}
			}
		}

		// Toggle after brief delay
		setTimeout(() => {
			setNotificationsEnabled(!browserNotificationsEnabled);
		}, 100);

		// Reset animation state
		setTimeout(() => {
			isBrowserNotificationsAnimating = false;
		}, 400);
	}

	function handleFaviconBadgeToggle() {
		// Trigger animation
		isFaviconBadgeAnimating = true;

		// Toggle after brief delay
		setTimeout(() => {
			setFaviconBadgeEnabled(!faviconBadgeEnabled);
		}, 100);

		// Reset animation state
		setTimeout(() => {
			isFaviconBadgeAnimating = false;
		}, 400);
	}

	function handleTitleBadgeToggle() {
		// Trigger animation
		isTitleBadgeAnimating = true;

		// Toggle after brief delay
		setTimeout(() => {
			setTitleBadgeEnabled(!titleBadgeEnabled);
		}, 100);

		// Reset animation state
		setTimeout(() => {
			isTitleBadgeAnimating = false;
		}, 400);
	}

	function toggleSection(section: string) {
		if (expandedSections.has(section)) {
			expandedSections.delete(section);
		} else {
			expandedSections.add(section);
		}
		expandedSections = new Set(expandedSections);
		try {
			localStorage.setItem('userprofile-expanded-sections', JSON.stringify([...expandedSections]));
		} catch {}
	}

	function handleToastNeedsInputToggle() {
		isToastNeedsInputAnimating = true;
		setTimeout(() => { setToastNeedsInput(!toastNeedsInput); }, 100);
		setTimeout(() => { isToastNeedsInputAnimating = false; }, 400);
	}

	function handleToastReviewToggle() {
		isToastReviewAnimating = true;
		setTimeout(() => { setToastReview(!toastReview); }, 100);
		setTimeout(() => { isToastReviewAnimating = false; }, 400);
	}

	function handleToastCompleteToggle() {
		isToastCompleteAnimating = true;
		setTimeout(() => { setToastComplete(!toastComplete); }, 100);
		setTimeout(() => { isToastCompleteAnimating = false; }, 400);
	}

	function handleHeightChange(newHeight: number) {
		// Store handles persistence and reactivity automatically
		setTerminalHeight(newHeight);
	}

	function handleSessionMaxHeightChange(value: SessionMaximizeHeight) {
		setSessionMaximizeHeight(value);
	}

	function handleFontFamilyChange(value: TerminalFontFamily) {
		setTerminalFontFamily(value);
	}

	function handleFontSizeChange(value: TerminalFontSize) {
		setTerminalFontSize(value);
	}

	function handleScrollbackChange(value: TerminalScrollback) {
		setTerminalScrollback(value);
	}

	function handleMaxSessionsChange(value: MaxSessions) {
		setMaxSessions(value);
	}

	async function handleUpdate() {
		if (!confirm('Pull latest from git and run install.sh?')) return;
		isUpdating = true;

		try {
			const response = await fetch('/api/jat/update', { method: 'POST' });
			const data = await response.json();

			if (response.ok && data.success) {
				successToast(data.message || 'JAT updated successfully!', data.details?.gitPull);
			} else {
				errorToast(data.error || 'Update failed');
			}
		} catch (err) {
			errorToast('Network error during update');
		} finally {
			isUpdating = false;
		}
	}
</script>

<div
	class="dropdown dropdown-end"
	use:listNav={{
		global: false,
		itemSelector: '[data-nav-id]',
		onSelect: handleNavSelect,
		onEscape: closeDropdown,
	}}
	onkeydown={(e) => {
		if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
			const t = e.target as HTMLElement;
			if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA' && !t.isContentEditable) {
				e.preventDefault();
				closeDropdown();
				showHelpModal = !showHelpModal;
			}
		}
	}}
>
	<!-- Avatar Button - Industrial -->
	<button
		bind:this={avatarButtonRef}
		tabindex="0"
		class="flex items-center justify-center w-7 h-7 rounded transition-all hover:scale-105 bg-base-300 border border-base-content/20"
		aria-label="User profile menu"
	>
		{#if userInitials}
			<span class="text-[10px] font-bold text-primary leading-none">{userInitials}</span>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-4 h-4 text-primary"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d={userIcon} />
			</svg>
		{/if}
	</button>

	<!-- Dropdown Menu - Industrial -->
	<ul
		tabindex="0"
		role="menu"
		data-peek="false"
		class="dropdown-content mt-3 z-[60] p-2 shadow-lg rounded w-72 max-h-[80vh] overflow-y-auto bg-base-300 border border-base-content/20"
	>
		<!-- User Identity -->
		<li class="px-2 py-1.5">
			{#if identityLoading}
				<div class="flex flex-col gap-1.5">
					<div class="skeleton h-3 w-24 rounded"></div>
					<div class="skeleton h-2.5 w-36 rounded"></div>
					<div class="skeleton h-2 w-20 rounded"></div>
				</div>
			{:else if !editingIdentity}
				<div class="flex items-start justify-between gap-2">
					<div class="flex flex-col gap-0.5 min-w-0">
						{#if userName}
							<span class="text-xs font-medium text-base-content/80 truncate">{userName}</span>
						{:else}
							<span class="text-xs italic text-base-content/40">no name set</span>
						{/if}
						{#if userEmail}
							<span
								class="text-[11px] font-mono text-base-content/50 truncate"
								title="Email used to match your identity in each project's profiles table. Different Supabase projects can have different UUIDs for the same email."
							>{userEmail}</span>
						{/if}
						<span class="text-[11px] text-base-content/40 mt-0.5">
							{#if emailSource === 'jat'}
								source: JAT override
							{:else if emailSource === 'git'}
								source: git config
							{:else}
								no identity set
							{/if}
						</span>
					</div>
					<button
						type="button"
						class="btn btn-xs btn-ghost shrink-0"
						onclick={openIdentityEditor}
						title="Edit identity — lets you use a different email here than your git config"
						data-nav-id="edit-identity"
					>
						Edit
					</button>
				</div>
			{:else}
				<div class="flex flex-col gap-1.5">
					<label class="flex flex-col gap-0.5">
						<span class="text-[11px] uppercase tracking-wide text-base-content/60">Name</span>
						<input
							type="text"
							class="input input-xs input-bordered font-mono text-xs"
							bind:this={editNameInputEl}
							bind:value={editName}
							placeholder="Your display name"
							disabled={identitySaving}
						/>
					</label>
					<label class="flex flex-col gap-0.5">
						<span class="text-[11px] uppercase tracking-wide text-base-content/60">Email</span>
						<input
							type="email"
							class="input input-xs input-bordered font-mono text-xs"
							bind:value={editEmail}
							placeholder="you@example.com"
							disabled={identitySaving}
						/>
					</label>
					{#if identityError}
						<p class="text-[11px] text-error" role="alert">{identityError}. Try again or cancel.</p>
					{/if}
					<p class="text-[11px] text-base-content/50 leading-snug">
						Used as the comment author on tasks. Each Supabase-backed project
						resolves this email to its own <code>profiles.id</code>, so you don't
						need to match UUIDs across apps — just use the same email.
					</p>
					<div class="flex items-center justify-between gap-1">
						<button
							type="button"
							class="btn btn-xs btn-ghost"
							disabled={identitySaving}
							onclick={resetIdentityToGit}
							title="Clear the JAT override and fall back to git config --global user.name / user.email"
						>
							Use git config
						</button>
						<div class="flex gap-1">
							<button
								type="button"
								class="btn btn-xs btn-ghost"
								disabled={identitySaving}
								onclick={() => { editingIdentity = false; identityError = null; }}
							>
								Cancel
							</button>
							<button
								type="button"
								class="btn btn-xs btn-primary"
								disabled={identitySaving}
								onclick={saveIdentity}
							>
								{identitySaving ? 'Saving…' : 'Save'}
							</button>
						</div>
					</div>
				</div>
			{/if}
		</li>
		<li aria-hidden="true" class="my-1 h-px bg-base-content/20 mx-1"></li>

		<!-- Help & Shortcuts -->
		<li>
			<button
				onclick={() => showHelpModal = true}
				class="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors hover:bg-base-200"
				data-nav-id="help"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-4 h-4 text-primary"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d={questionIcon} />
				</svg>
				<span class="text-xs flex-1 text-left text-base-content/70">
					Help & Shortcuts
				</span>
				<kbd class="kbd kbd-xs bg-base-200 text-base-content/60">?</kbd>
			</button>
		</li>

		<li aria-hidden="true" class="my-1 h-px bg-base-content/20 mx-1"></li>

		<!-- ═══════════════════════════════════════════ -->
		<!-- APPEARANCE -->
		<!-- ═══════════════════════════════════════════ -->
		<li class="menu-title mt-2">
			<span class="text-xs text-base-content/50 uppercase tracking-wider">Appearance</span>
		</li>

		<li data-nav-id="theme">
			<ThemeSelector inline={true} />
		</li>

		<li>
			<button
				onclick={handleSoundToggle}
				class="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors hover:bg-base-200/50"
				data-nav-id="toggle-sound"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-4 h-4 transition-transform duration-300 {soundsEnabled ? 'text-success' : 'text-base-content/50'}"
					class:sound-icon-pulse={isSoundAnimating}
				>
					<path stroke-linecap="round" stroke-linejoin="round" d={soundsEnabled ? soundOnIcon : soundOffIcon} />
				</svg>
				<span class="flex-1 text-left">
					<span class="text-xs text-base-content/70 block">Sound Effects</span>
					<span class="text-[11px] text-base-content/40 leading-tight block">Plays a test chime when enabled</span>
				</span>
				<span
					class="text-[10px] font-mono px-1.5 py-0.5 rounded transition-transform duration-300 {soundsEnabled ? 'bg-success/40 text-success' : 'bg-base-200 text-base-content/50'}"
					class:sound-badge-bounce={isSoundAnimating}
				>
					{soundsEnabled ? 'ON' : 'OFF'}
				</span>
			</button>
		</li>

		<li>
			<button
				onclick={handleSparklineToggle}
				class="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors hover:bg-base-200/50"
				data-nav-id="toggle-sparkline"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-4 h-4 transition-transform duration-300 {sparklineVisible ? 'text-info' : 'text-base-content/50'}"
					class:toggle-icon-pulse={isSparklineAnimating}
				>
					<path stroke-linecap="round" stroke-linejoin="round" d={chartIcon} />
				</svg>
				<span class="flex-1 text-left">
					<span class="text-xs text-base-content/70 block">Sparkline</span>
					<span class="text-[11px] text-base-content/40 leading-tight block">Activity history in session cards</span>
				</span>
				<span
					class="text-[10px] font-mono px-1.5 py-0.5 rounded transition-transform duration-300 {sparklineVisible ? 'bg-info/40 text-info' : 'bg-base-200 text-base-content/50'}"
					class:toggle-badge-bounce={isSparklineAnimating}
				>
					{sparklineVisible ? 'ON' : 'OFF'}
				</span>
			</button>
		</li>

		<li>
			<button
				onclick={handleDebugModeToggle}
				class="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors hover:bg-base-200/50"
				data-nav-id="toggle-debug"
				title={debugModeEnabled
					? 'Debug mode enabled (feedback widget visible)'
					: 'Enable debug mode to show feedback widget and dev tools'}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-4 h-4 transition-transform duration-300 {debugModeEnabled ? 'text-secondary' : 'text-base-content/50'}"
					class:toggle-icon-pulse={isDebugModeAnimating}
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
				</svg>
				<span class="flex-1 text-left">
					<span class="text-xs text-base-content/70 block">Debug Mode</span>
					<span class="text-[11px] text-base-content/40 leading-tight block">Shows feedback widget &amp; dev tools</span>
				</span>
				<span
					class="text-[10px] font-mono px-1.5 py-0.5 rounded transition-transform duration-300 {debugModeEnabled ? 'bg-secondary/40 text-secondary' : 'bg-base-200 text-base-content/50'}"
					class:toggle-badge-bounce={isDebugModeAnimating}
				>
					{debugModeEnabled ? 'ON' : 'OFF'}
				</span>
			</button>
		</li>

		<!-- ═══════════════════════════════════════════ -->
		<!-- NOTIFICATIONS (collapsible) -->
		<!-- ═══════════════════════════════════════════ -->
		<li aria-hidden="true" class="my-1 h-px bg-base-content/20 mx-1"></li>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<li class="menu-title mt-1 cursor-pointer select-none rounded hover:bg-base-200/40 transition-colors" onclick={() => toggleSection('notifications')} data-nav-id="section-notifications">
			<span class="text-xs text-base-content/50 uppercase tracking-wider flex items-center gap-1">
				<svg class="w-3 h-3 transition-transform duration-200 {expandedSections.has('notifications') ? 'rotate-90' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
				</svg>
				Notifications
				{#if !expandedSections.has('notifications')}
					{@const activeCount = [browserNotificationsEnabled && browserNotificationPermission === 'granted', faviconBadgeEnabled, titleBadgeEnabled, toastNeedsInput, toastReview, toastComplete].filter(Boolean).length}
					{#if activeCount > 0}<span class="text-[10px] text-base-content/30 font-mono normal-case tracking-normal ml-1">{activeCount}/6 on</span>{/if}
				{/if}
			</span>
		</li>

		{#if expandedSections.has('notifications')}
			<!-- Browser Alerts -->
			{#if browserNotificationsSupported}
				<li>
					<button
						onclick={handleBrowserNotificationsToggle}
						class="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors hover:bg-base-200/50"
						data-nav-id="toggle-browser-alerts"
						title={browserNotificationPermission === 'denied'
							? 'Browser notifications blocked - check browser settings'
							: browserNotificationsEnabled
								? 'Show browser notifications when agents need attention'
								: 'Enable browser notifications'}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-4 h-4 transition-transform duration-300 {browserNotificationsEnabled && browserNotificationPermission === 'granted' ? 'text-info' : 'text-base-content/50'}"
							class:toggle-icon-pulse={isBrowserNotificationsAnimating}
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
						</svg>
						<span class="flex-1 text-left">
							<span class="text-xs text-base-content/70 block">Browser Alerts</span>
							<span class="text-[11px] text-base-content/40 leading-tight block">OS-level desktop notification</span>
						</span>
						{#if browserNotificationPermission === 'denied'}
							<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-error/30 text-error">
								BLOCKED
							</span>
						{:else}
							<span
								class="text-[10px] font-mono px-1.5 py-0.5 rounded transition-transform duration-300 {browserNotificationsEnabled && browserNotificationPermission === 'granted' ? 'bg-info/40 text-info' : 'bg-base-200 text-base-content/50'}"
								class:toggle-badge-bounce={isBrowserNotificationsAnimating}
							>
								{browserNotificationsEnabled && browserNotificationPermission === 'granted' ? 'ON' : 'OFF'}
							</span>
						{/if}
					</button>
				</li>
			{/if}

			<!-- Favicon Badge -->
			<li>
				<button
					onclick={handleFaviconBadgeToggle}
					class="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors hover:bg-base-200/50"
					data-nav-id="toggle-favicon-badge"
					title={faviconBadgeEnabled
						? 'Show count badge on favicon when agents need attention'
						: 'Favicon badge disabled'}
				>
					<span
						class="w-4 h-4 flex items-center justify-center text-sm transition-transform duration-300"
						class:toggle-icon-pulse={isFaviconBadgeAnimating}
					>
						{faviconBadgeEnabled ? '🔴' : '⚪'}
					</span>
					<span class="flex-1 text-left">
						<span class="text-xs text-base-content/70 block">Favicon Badge</span>
						<span class="text-[11px] text-base-content/40 leading-tight block">Count badge on browser tab icon</span>
					</span>
					<span
						class="text-[10px] font-mono px-1.5 py-0.5 rounded transition-transform duration-300 {faviconBadgeEnabled ? 'bg-warning/40 text-warning-content' : 'bg-base-200 text-base-content/50'}"
						class:toggle-badge-bounce={isFaviconBadgeAnimating}
					>
						{faviconBadgeEnabled ? 'ON' : 'OFF'}
					</span>
				</button>
			</li>

			<!-- Title Badge -->
			<li>
				<button
					onclick={handleTitleBadgeToggle}
					class="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors hover:bg-base-200/50"
					data-nav-id="toggle-title-badge"
					title={titleBadgeEnabled
						? 'Show count in page title when agents need attention'
						: 'Title badge disabled'}
				>
					<span
						class="w-4 h-4 flex items-center justify-center font-mono text-[9px] font-bold transition-transform duration-300 {titleBadgeEnabled ? 'text-primary' : 'text-base-content/50'}"
						class:toggle-icon-pulse={isTitleBadgeAnimating}
					>
						(3)
					</span>
					<span class="flex-1 text-left">
						<span class="text-xs text-base-content/70 block">Title Badge</span>
						<span class="text-[11px] text-base-content/40 leading-tight block">Agent count in browser tab title</span>
					</span>
					<span
						class="text-[10px] font-mono px-1.5 py-0.5 rounded transition-transform duration-300 {titleBadgeEnabled ? 'bg-primary/40 text-primary' : 'bg-base-200 text-base-content/50'}"
						class:toggle-badge-bounce={isTitleBadgeAnimating}
					>
						{titleBadgeEnabled ? 'ON' : 'OFF'}
					</span>
				</button>
			</li>

			<!-- Subheader: Agent Signal Toasts -->
			<li class="px-2 pt-2 pb-0.5">
				<span class="text-[11px] text-base-content/40 uppercase tracking-wider">Agent Toasts</span>
			</li>

			<!-- Needs Input Toast -->
			<li>
				<button
					onclick={handleToastNeedsInputToggle}
					class="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors hover:bg-base-200/50"
					data-nav-id="toggle-toast-needs-input"
					title={toastNeedsInput
						? 'Show toast when agent needs your input'
						: 'No toast for needs-input signals'}
				>
					<span
						class="w-4 h-4 flex items-center justify-center text-sm transition-transform duration-300 {toastNeedsInput ? '' : 'opacity-40'}"
						class:toggle-icon-pulse={isToastNeedsInputAnimating}
					>
						❓
					</span>
					<span class="flex-1 text-left">
						<span class="text-xs text-base-content/70 block">Needs Input</span>
						<span class="text-[11px] text-base-content/40 leading-tight block">Toast when agent awaits your response</span>
					</span>
					<span
						class="text-[10px] font-mono px-1.5 py-0.5 rounded transition-transform duration-300 {toastNeedsInput ? 'bg-warning/40 text-warning-content' : 'bg-base-200 text-base-content/50'}"
						class:toggle-badge-bounce={isToastNeedsInputAnimating}
					>
						{toastNeedsInput ? 'ON' : 'OFF'}
					</span>
				</button>
			</li>

			<!-- Ready for Review Toast -->
			<li>
				<button
					onclick={handleToastReviewToggle}
					class="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors hover:bg-base-200/50"
					data-nav-id="toggle-toast-review"
					title={toastReview
						? 'Show toast when agent is ready for review'
						: 'No toast for review signals'}
				>
					<span
						class="w-4 h-4 flex items-center justify-center text-sm transition-transform duration-300 {toastReview ? '' : 'opacity-40'}"
						class:toggle-icon-pulse={isToastReviewAnimating}
					>
						👁
					</span>
					<span class="flex-1 text-left">
						<span class="text-xs text-base-content/70 block">Ready for Review</span>
						<span class="text-[11px] text-base-content/40 leading-tight block">Toast when agent finishes and waits</span>
					</span>
					<span
						class="text-[10px] font-mono px-1.5 py-0.5 rounded transition-transform duration-300 {toastReview ? 'bg-info/40 text-info' : 'bg-base-200 text-base-content/50'}"
						class:toggle-badge-bounce={isToastReviewAnimating}
					>
						{toastReview ? 'ON' : 'OFF'}
					</span>
				</button>
			</li>

			<!-- Task Complete Toast -->
			<li>
				<button
					onclick={handleToastCompleteToggle}
					class="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors hover:bg-base-200/50"
					data-nav-id="toggle-toast-complete"
					title={toastComplete
						? 'Show toast when agent completes a task'
						: 'No toast for task completion'}
				>
					<span
						class="w-4 h-4 flex items-center justify-center text-sm transition-transform duration-300 {toastComplete ? '' : 'opacity-40'}"
						class:toggle-icon-pulse={isToastCompleteAnimating}
					>
						✅
					</span>
					<span class="flex-1 text-left">
						<span class="text-xs text-base-content/70 block">Task Complete</span>
						<span class="text-[11px] text-base-content/40 leading-tight block">Toast when agent marks task done</span>
					</span>
					<span
						class="text-[10px] font-mono px-1.5 py-0.5 rounded transition-transform duration-300 {toastComplete ? 'bg-success/40 text-success' : 'bg-base-200 text-base-content/50'}"
						class:toggle-badge-bounce={isToastCompleteAnimating}
					>
						{toastComplete ? 'ON' : 'OFF'}
					</span>
				</button>
			</li>
		{/if}

		<!-- ═══════════════════════════════════════════ -->
		<!-- TERMINAL (collapsible) -->
		<!-- ═══════════════════════════════════════════ -->
		<li aria-hidden="true" class="my-1 h-px bg-base-content/20 mx-1"></li>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<li class="menu-title mt-1 cursor-pointer select-none rounded hover:bg-base-200/40 transition-colors" onclick={() => toggleSection('terminal')} data-nav-id="section-terminal">
			<span class="text-xs text-base-content/50 uppercase tracking-wider flex items-center gap-1">
				<svg class="w-3 h-3 transition-transform duration-200 {expandedSections.has('terminal') ? 'rotate-90' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
				</svg>
				Terminal
				{#if !expandedSections.has('terminal')}
					<span class="text-[10px] text-base-content/30 font-mono normal-case tracking-normal ml-1">{terminalHeight}r · {TERMINAL_FONT_OPTIONS.find(o => o.value === terminalFontFamily)?.label ?? terminalFontFamily} · {terminalFontSize}px</span>
				{/if}
			</span>
		</li>

		{#if expandedSections.has('terminal')}
			<!-- Terminal Height Slider -->
			<li>
				<div class="flex flex-col gap-1 px-2 py-1">
					<div class="flex items-center justify-between">
						<span class="text-xs text-base-content/70">Height (rows)</span>
						<span class="text-xs font-mono text-base-content/80">{terminalHeight}</span>
					</div>
					<input
						type="range"
						min={MIN_TERMINAL_HEIGHT}
						max={MAX_TERMINAL_HEIGHT}
						value={terminalHeight}
						oninput={(e) => handleHeightChange(parseInt(e.currentTarget.value, 10))}
						class="range range-xs range-info w-full"
					/>
					<div class="flex justify-between text-[11px] text-base-content/50">
						<span>{MIN_TERMINAL_HEIGHT}</span>
						<span>{MAX_TERMINAL_HEIGHT}</span>
					</div>
				</div>
			</li>

			<!-- Session Maximize Height -->
			<li>
				<div class="flex flex-col gap-1 px-2 py-1">
					<span class="text-xs text-base-content/70">Click-to-Expand Height</span>
					<div class="flex gap-1">
						{#each SESSION_MAXIMIZE_HEIGHT_OPTIONS as option}
							<button
								onclick={() => handleSessionMaxHeightChange(option.value)}
								class="px-2 py-0.5 text-[10px] font-mono rounded transition-colors border {sessionMaximizeHeight === option.value ? 'bg-info/40 text-info border-info/50' : 'bg-base-200 text-base-content/60 border-base-content/20'}"
							>
								{option.label}
							</button>
						{/each}
					</div>
				</div>
			</li>

			<!-- Terminal Font Family -->
			<li>
				<div class="flex flex-col gap-1 px-2 py-1">
					<span class="text-xs text-base-content/70">Font Family</span>
					<div class="flex flex-wrap gap-1">
						{#each TERMINAL_FONT_OPTIONS as option}
							<button
								onclick={() => handleFontFamilyChange(option.value)}
								class="px-2 py-0.5 text-[10px] rounded transition-colors border {terminalFontFamily === option.value ? 'bg-info/40 text-info border-info/50' : 'bg-base-200 text-base-content/60 border-base-content/20'}"
							>
								{option.label}
							</button>
						{/each}
					</div>
				</div>
			</li>

			<!-- Terminal Font Size -->
			<li>
				<div class="flex flex-col gap-1 px-2 py-1">
					<span class="text-xs text-base-content/70">Font Size</span>
					<div class="flex gap-1">
						{#each TERMINAL_FONT_SIZE_OPTIONS as option}
							<button
								onclick={() => handleFontSizeChange(option.value)}
								class="px-2.5 py-0.5 text-[10px] font-mono rounded transition-colors border {terminalFontSize === option.value ? 'bg-info/40 text-info border-info/50' : 'bg-base-200 text-base-content/60 border-base-content/20'}"
							>
								{option.label}
							</button>
						{/each}
					</div>
				</div>
			</li>

			<!-- Terminal Scrollback Limit -->
			<li>
				<div class="flex flex-col gap-1 px-2 py-1">
					<span class="text-xs text-base-content/70">Scrollback Lines</span>
					<div class="flex gap-1">
						{#each TERMINAL_SCROLLBACK_OPTIONS as option}
							<button
								onclick={() => handleScrollbackChange(option.value)}
								class="px-2 py-0.5 text-[10px] font-mono rounded transition-colors border {terminalScrollback === option.value ? 'bg-info/40 text-info border-info/50' : 'bg-base-200 text-base-content/60 border-base-content/20'}"
							>
								{option.label}
							</button>
						{/each}
					</div>
				</div>
			</li>

			<!-- Ctrl+C Behavior -->
			<li>
				<button
					onclick={handleCtrlCToggle}
					class="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors hover:bg-base-200/50"
					data-nav-id="toggle-ctrl-c"
					title={ctrlCIntercept
						? 'Ctrl+C sends interrupt to tmux'
						: 'Ctrl+C copies text (browser default)'}
				>
					<span
						class="w-4 h-4 flex items-center justify-center font-mono text-[9px] font-bold transition-transform duration-300 {!ctrlCIntercept ? 'line-through opacity-50' : ''} {ctrlCIntercept ? 'text-error' : 'text-base-content/50'}"
						class:toggle-icon-pulse={isCtrlCAnimating}
					>
						^C
					</span>
					<span class="flex-1 text-left">
						<span class="text-xs text-base-content/70 block">Ctrl+C Interrupt</span>
						<span class="text-[11px] text-base-content/40 leading-tight block">Sends ^C to terminal instead of copying</span>
					</span>
					<span
						class="text-[10px] font-mono px-1.5 py-0.5 rounded transition-transform duration-300 {ctrlCIntercept ? 'bg-error/40 text-error' : 'bg-base-200 text-base-content/50'}"
						class:toggle-badge-bounce={isCtrlCAnimating}
					>
						{ctrlCIntercept ? 'ON' : 'OFF'}
					</span>
				</button>
			</li>
		{/if}

		<!-- ═══════════════════════════════════════════ -->
		<!-- AGENTS (collapsible) -->
		<!-- ═══════════════════════════════════════════ -->
		<li aria-hidden="true" class="my-1 h-px bg-base-content/20 mx-1"></li>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<li class="menu-title mt-1 cursor-pointer select-none rounded hover:bg-base-200/40 transition-colors" onclick={() => toggleSection('agents')} data-nav-id="section-agents">
			<span class="text-xs text-base-content/50 uppercase tracking-wider flex items-center gap-1">
				<svg class="w-3 h-3 transition-transform duration-200 {expandedSections.has('agents') ? 'rotate-90' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
				</svg>
				Agents
				{#if !expandedSections.has('agents')}
					<span class="text-[10px] text-base-content/30 font-mono normal-case tracking-normal ml-1">{maxSessions} sessions</span>
				{/if}
			</span>
		</li>

		{#if expandedSections.has('agents')}
			<!-- Max Concurrent Sessions -->
			<li>
				<div class="flex flex-col gap-1 px-2 py-1">
					<span class="text-xs text-base-content/70">Max Sessions</span>
					<div class="flex gap-1">
						{#each MAX_SESSIONS_OPTIONS as option}
							<button
								onclick={() => handleMaxSessionsChange(option.value)}
								class="px-2 py-0.5 text-[10px] font-mono rounded transition-colors border {maxSessions === option.value ? 'bg-success/40 text-success border-success/50' : 'bg-base-200 text-base-content/60 border-base-content/20'}"
							>
								{option.label}
							</button>
						{/each}
					</div>
				</div>
			</li>

			<!-- Epic Celebration -->
			<li>
				<button
					onclick={handleEpicCelebrationToggle}
					class="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors hover:bg-base-200/50"
					data-nav-id="toggle-epic-celebration"
					title={epicCelebration
						? 'Celebrate when all children of an epic complete'
						: 'No celebration for epic completion'}
				>
					<span
						class="w-4 h-4 flex items-center justify-center text-sm transition-transform duration-300"
						class:toggle-icon-pulse={isEpicCelebrationAnimating}
					>
						{epicCelebration ? '🎉' : '🔕'}
					</span>
					<span class="flex-1 text-left">
						<span class="text-xs text-base-content/70 block">Epic Celebration</span>
						<span class="text-[11px] text-base-content/40 leading-tight block">Confetti when all epic children close</span>
					</span>
					<span
						class="text-[10px] font-mono px-1.5 py-0.5 rounded transition-transform duration-300 {epicCelebration ? 'bg-warning/40 text-warning-content' : 'bg-base-200 text-base-content/50'}"
						class:toggle-badge-bounce={isEpicCelebrationAnimating}
					>
						{epicCelebration ? 'ON' : 'OFF'}
					</span>
				</button>
			</li>

			<!-- Epic Auto-Close -->
			<li>
				<button
					onclick={handleEpicAutoCloseToggle}
					class="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors hover:bg-base-200/50"
					data-nav-id="toggle-epic-autoclose"
					title={epicAutoClose
						? 'Automatically close the epic in JAT when all children complete'
						: 'Keep epic open even when all children complete'}
				>
					<span
						class="w-4 h-4 flex items-center justify-center text-sm transition-transform duration-300"
						class:toggle-icon-pulse={isEpicAutoCloseAnimating}
					>
						{epicAutoClose ? '✅' : '⏸️'}
					</span>
					<span class="flex-1 text-left">
						<span class="text-xs text-base-content/70 block">Epic Auto-Close</span>
						<span class="text-[11px] text-base-content/40 leading-tight block">Closes epic when all children complete</span>
					</span>
					<span
						class="text-[10px] font-mono px-1.5 py-0.5 rounded transition-transform duration-300 {epicAutoClose ? 'bg-success/40 text-success' : 'bg-base-200 text-base-content/50'}"
						class:toggle-badge-bounce={isEpicAutoCloseAnimating}
					>
						{epicAutoClose ? 'ON' : 'OFF'}
					</span>
				</button>
			</li>
		{/if}

		<!-- ═══════════════════════════════════════════ -->
		<!-- VERSION & UPDATE (always visible) -->
		<!-- ═══════════════════════════════════════════ -->
		<li aria-hidden="true" class="my-1 h-px bg-base-content/20 mx-1"></li>
		<li>
			<div class="flex items-center justify-between px-2 py-1">
				<div class="flex items-center gap-2">
					<div
						class="text-[10px] font-mono cursor-default text-base-content/50"
						title="Build version"
					>
						{getVersionString()}
					</div>
					<span class="text-[10px] font-mono text-base-content/25" title="j/k to navigate · Enter to toggle · Esc to close">j/k · ↵</span>
				</div>
				<button
					onclick={handleUpdate}
					disabled={isUpdating}
					class="text-[10px] font-mono px-2 py-0.5 rounded transition-colors border {isUpdating ? 'bg-base-200 text-base-content/50 border-base-content/20 cursor-wait' : 'bg-info/20 text-info border-info/30 hover:bg-info/30'}"
					data-nav-id="update"
					title="Pull latest and run install.sh"
				>
					{#if isUpdating}
						<span class="inline-flex items-center gap-1">
							<svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Updating...
						</span>
					{:else}
						Update
					{/if}
				</button>
			</div>
		</li>
	</ul>
</div>

<!-- Help Modal -->
{#if showHelpModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		onclick={() => showHelpModal = false}
		onkeydown={(e) => { if (e.key === 'Escape') showHelpModal = false; }}
		role="presentation"
	>
		<div
			class="relative w-full max-w-lg mx-4 rounded-lg shadow-2xl overflow-hidden bg-base-300 border border-base-content/20"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="presentation"
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-5 py-4 border-b border-base-content/20">
				<h2 class="text-lg font-semibold text-base-content">
					Help & Keyboard Shortcuts
				</h2>
				<button
					aria-label="Close"
					onclick={() => showHelpModal = false}
					class="p-1 rounded hover:bg-base-200 transition-colors"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-base-content/60">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
				<!-- Global Shortcuts -->
				<div>
					<h3 class="text-sm font-semibold mb-2 text-primary">Global Shortcuts</h3>
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<span class="text-sm text-base-content/70">New Task</span>
							<kbd class="kbd kbd-sm bg-base-200 text-base-content/80">Alt + N</kbd>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-base-content/70">Attach to Hovered Session</span>
							<kbd class="kbd kbd-sm bg-base-200 text-base-content/80">Alt + A</kbd>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-base-content/70">Spawn New Session</span>
							<kbd class="kbd kbd-sm bg-base-200 text-base-content/80">Alt + S</kbd>
						</div>
					</div>
				</div>

				<!-- Settings Menu Navigation -->
				<div>
					<h3 class="text-sm font-semibold mb-2 text-primary">Settings Menu</h3>
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<span class="text-sm text-base-content/70">Navigate items</span>
							<span class="flex gap-1">
								<kbd class="kbd kbd-sm bg-base-200 text-base-content/80">j</kbd>
								<kbd class="kbd kbd-sm bg-base-200 text-base-content/80">k</kbd>
							</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-base-content/70">Toggle / activate</span>
							<kbd class="kbd kbd-sm bg-base-200 text-base-content/80">Enter</kbd>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-base-content/70">Close menu</span>
							<kbd class="kbd kbd-sm bg-base-200 text-base-content/80">Esc</kbd>
						</div>
					</div>
				</div>

				<!-- Task Creation Shortcuts -->
				<div>
					<h3 class="text-sm font-semibold mb-2 text-primary">Task Creation Drawer</h3>
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<span class="text-sm text-base-content/70">Save & Start Agent</span>
							<kbd class="kbd kbd-sm bg-base-200 text-base-content/80">Ctrl + Enter</kbd>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-base-content/70">Save & Close</span>
							<kbd class="kbd kbd-sm bg-base-200 text-base-content/80">Alt + Enter</kbd>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-base-content/70">Save & New</span>
							<kbd class="kbd kbd-sm bg-base-200 text-base-content/80">Ctrl + Shift + Enter</kbd>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-base-content/70">Close Drawer</span>
							<kbd class="kbd kbd-sm bg-base-200 text-base-content/80">Escape</kbd>
						</div>
					</div>
				</div>

				<!-- Session Card Tips -->
				<div>
					<h3 class="text-sm font-semibold mb-2 text-primary">Session Cards</h3>
					<ul class="text-sm space-y-1 text-base-content/65">
						<li class="flex items-start gap-2">
							<span class="text-base-content/50">•</span>
							<span>Hover over a session card, then press <kbd class="kbd kbd-xs">Alt + A</kbd> to attach terminal</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-base-content/50">•</span>
							<span>Click the status badge for quick actions (Complete, Kill, Attach)</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-base-content/50">•</span>
							<span>Drag the right edge to resize session cards</span>
						</li>
					</ul>
				</div>

				<!-- Links -->
				<div class="pt-2 border-t border-base-content/20">
					<h3 class="text-sm font-semibold mb-2 text-primary">Resources</h3>
					<div class="flex flex-wrap gap-2">
						<a
							href="https://github.com/anthropics/claude-code/issues"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors bg-base-200 text-base-content/70 hover:bg-base-100"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
							</svg>
							Report Issue
						</a>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="px-5 py-3 flex justify-end border-t border-base-content/20 bg-base-200">
				<button
					onclick={() => showHelpModal = false}
					class="px-4 py-1.5 text-sm rounded transition-colors bg-base-300 text-base-content/80 hover:bg-base-100"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Toggle icon animation - pulse and scale */
	.sound-icon-pulse,
	.toggle-icon-pulse {
		animation: toggle-pulse 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes toggle-pulse {
		0% {
			transform: scale(1);
		}
		40% {
			transform: scale(1.3);
		}
		100% {
			transform: scale(1);
		}
	}

	/* Toggle badge animation - bounce with rotation */
	.sound-badge-bounce,
	.toggle-badge-bounce {
		animation: toggle-bounce 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes toggle-bounce {
		0% {
			transform: scale(1) rotate(0deg);
		}
		50% {
			transform: scale(0.8) rotate(-10deg);
		}
		100% {
			transform: scale(1) rotate(0deg);
		}
	}
</style>
