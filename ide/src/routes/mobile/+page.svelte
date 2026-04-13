<script lang="ts">
	/**
	 * /mobile — Mobile Mission Control
	 *
	 * Entry point for mobile devices. Sets up the web push subscription
	 * so agents can send push notifications to this device when they
	 * need input or are ready for review.
	 *
	 * Acceptance: prompts for notification permission, stores subscription,
	 * displays 'notifications enabled' indicator.
	 */

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	type PermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

	let permissionStatus = $state<PermissionStatus>('default');
	let subscribed = $state(false);
	let loading = $state(false);
	let errorMsg = $state('');
	let vapidPublicKey = $state('');
	let swRegistration = $state<ServiceWorkerRegistration | null>(null);

	const isSupported = $derived(
		browser &&
		'serviceWorker' in navigator &&
		'PushManager' in window &&
		'Notification' in window
	);

	onMount(async () => {
		if (!isSupported) return;

		// Check current notification permission
		permissionStatus = Notification.permission as PermissionStatus;

		// Fetch VAPID public key
		try {
			const res = await fetch('/api/push');
			if (res.ok) {
				const data = await res.json();
				vapidPublicKey = data.publicKey;
			}
		} catch {
			// Server may not have VAPID keys configured
		}

		// Register service worker
		try {
			swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
				scope: '/'
			});

			// Check if already subscribed
			if (permissionStatus === 'granted' && swRegistration) {
				const existing = await swRegistration.pushManager.getSubscription();
				if (existing) {
					subscribed = true;
				}
			}
		} catch (err) {
			console.error('Service worker registration failed:', err);
		}
	});

	async function requestPermission() {
		if (!isSupported || !vapidPublicKey) return;

		loading = true;
		errorMsg = '';

		try {
			const permission = await Notification.requestPermission();
			permissionStatus = permission as PermissionStatus;

			if (permission === 'granted') {
				await subscribe();
			}
		} catch (err) {
			errorMsg = 'Failed to request permission. Please check your browser settings.';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	async function subscribe() {
		if (!swRegistration || !vapidPublicKey) return;

		try {
			const subscription = await swRegistration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
			});

			// Send subscription to server
			const res = await fetch('/api/push', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(subscription.toJSON())
			});

			if (res.ok) {
				subscribed = true;
			} else {
				throw new Error('Failed to store subscription');
			}
		} catch (err) {
			errorMsg = 'Failed to subscribe to push notifications.';
			console.error(err);
		}
	}

	async function unsubscribe() {
		if (!swRegistration) return;

		loading = true;
		errorMsg = '';

		try {
			const subscription = await swRegistration.pushManager.getSubscription();
			if (subscription) {
				// Remove from server
				await fetch('/api/push', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ endpoint: subscription.endpoint })
				});

				// Unsubscribe locally
				await subscription.unsubscribe();
			}
			subscribed = false;
		} catch (err) {
			errorMsg = 'Failed to unsubscribe.';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	/**
	 * Convert a base64url VAPID public key to a Uint8Array
	 * as required by PushManager.subscribe().
	 */
	function urlBase64ToUint8Array(base64String: string): Uint8Array {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
		const rawData = window.atob(base64);
		return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
	}
</script>

<svelte:head>
	<title>JAT Mobile</title>
</svelte:head>

<div class="min-h-screen bg-base-100 flex flex-col items-center justify-start px-4 py-8 max-w-lg mx-auto">
	<!-- Header -->
	<div class="w-full mb-8 text-center">
		<div class="flex items-center justify-center gap-3 mb-2">
			<img src="/icon-192.png" alt="JAT" class="w-10 h-10 rounded-xl" />
			<h1 class="text-2xl font-bold">JAT Mobile</h1>
		</div>
		<p class="text-base-content/60 text-sm">Mission control for your swarm</p>
	</div>

	<!-- Notification Section -->
	<div class="card bg-base-200 w-full shadow-sm">
		<div class="card-body gap-4">
			<div class="flex items-center gap-3">
				<!-- Bell icon -->
				<div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
					</svg>
				</div>
				<div>
					<h2 class="font-semibold text-base">Push Notifications</h2>
					<p class="text-sm text-base-content/60">Get alerted when agents need you</p>
				</div>

				<!-- Status badge -->
				{#if subscribed && permissionStatus === 'granted'}
					<div class="ml-auto badge badge-success gap-1.5">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
						</svg>
						Enabled
					</div>
				{:else if permissionStatus === 'denied'}
					<div class="ml-auto badge badge-error gap-1.5">Blocked</div>
				{/if}
			</div>

			<!-- Not supported -->
			{#if !isSupported}
				<div class="alert alert-warning text-sm">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
					</svg>
					<span>Push notifications are not supported in this browser.</span>
				</div>

			<!-- No VAPID key -->
			{:else if !vapidPublicKey}
				<div class="alert alert-warning text-sm">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
					</svg>
					<span>VAPID keys not configured on the server.</span>
				</div>

			<!-- Already subscribed -->
			{:else if subscribed && permissionStatus === 'granted'}
				<div class="alert alert-success text-sm">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>Notifications are enabled. You'll be alerted when agents need attention.</span>
				</div>

				<button class="btn btn-ghost btn-sm text-error self-start" onclick={unsubscribe} disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner loading-xs"></span>
					{/if}
					Disable notifications
				</button>

			<!-- Permission denied -->
			{:else if permissionStatus === 'denied'}
				<div class="alert alert-error text-sm">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
					</svg>
					<span>Notifications are blocked. Enable them in your browser settings for this site.</span>
				</div>

			<!-- Not yet requested -->
			{:else}
				<p class="text-sm text-base-content/70">
					Enable push notifications so you know instantly when agents need input or are ready for review — even when your browser tab is in the background.
				</p>

				<button class="btn btn-primary w-full gap-2" onclick={requestPermission} disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
						</svg>
					{/if}
					Enable Notifications
				</button>
			{/if}

			{#if errorMsg}
				<p class="text-error text-sm">{errorMsg}</p>
			{/if}
		</div>
	</div>

	<!-- Quick nav to common pages -->
	<div class="w-full mt-6 grid grid-cols-2 gap-3">
		<a href="/tasks" class="card bg-base-200 hover:bg-base-300 transition-colors shadow-sm cursor-pointer">
			<div class="card-body py-4 px-4 gap-1">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
				</svg>
				<span class="text-sm font-medium">Tasks</span>
			</div>
		</a>
		<a href="/sessions" class="card bg-base-200 hover:bg-base-300 transition-colors shadow-sm cursor-pointer">
			<div class="card-body py-4 px-4 gap-1">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
				</svg>
				<span class="text-sm font-medium">Sessions</span>
			</div>
		</a>
	</div>
</div>
