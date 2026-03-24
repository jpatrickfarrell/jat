<script lang="ts">
	/**
	 * EmojiPicker — Compact emoji icon selector.
	 * Shows a small trigger button with the current emoji, opens a grid dropdown.
	 * Used in BasesList to let users assign visual icons to bases.
	 */

	let {
		selected = null,
		onSelect,
		size = 'sm',
	}: {
		selected: string | null;
		onSelect: (emoji: string | null) => void;
		size?: 'sm' | 'md';
	} = $props();

	let open = $state(false);
	let searchQuery = $state('');
	let triggerEl: HTMLButtonElement | undefined = $state(undefined);

	const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
		{
			label: 'Objects',
			emojis: ['📄', '📝', '📋', '📊', '📈', '📉', '📁', '📂', '🗂️', '📑', '📌', '📎', '🔖', '🏷️', '📓', '📒', '📕', '📗', '📘', '📙', '📚', '💾', '💿', '🖥️', '⌨️'],
		},
		{
			label: 'Symbols',
			emojis: ['⚡', '🔥', '💡', '🔑', '🔒', '🔓', '🛡️', '⚙️', '🔧', '🔨', '🧪', '🧬', '🔬', '🔭', '💎', '🧩', '🎯', '🏆', '🎨', '🎭', '🎪', '🎲', '♟️', '🧮', '📡'],
		},
		{
			label: 'Nature',
			emojis: ['🌍', '🌎', '🌏', '🌐', '🗺️', '🏔️', '⛰️', '🌋', '🏝️', '🌊', '🌅', '🌄', '🌈', '☀️', '🌙', '⭐', '🌟', '💫', '🌸', '🌺', '🌻', '🌿', '🍀', '🌲', '🌳'],
		},
		{
			label: 'People',
			emojis: ['🤖', '👤', '👥', '🧑‍💻', '👨‍🔬', '👩‍🎨', '🧙', '🦸', '🦹', '👾', '🎃', '💀', '👻', '🐱', '🐶', '🦊', '🦉', '🐝', '🦋', '🐙', '🐬', '🦈', '🐢', '🦎', '🐍'],
		},
		{
			label: 'Travel',
			emojis: ['🚀', '🛸', '✈️', '🚂', '🏠', '🏢', '🏗️', '🏭', '🏛️', '⛪', '🕌', '🕍', '🏰', '🗼', '🗽', '⛩️', '🎡', '🎢', '⛺', '🏕️', '🏖️', '🌁', '🌆', '🌃', '🌉'],
		},
		{
			label: 'Food',
			emojis: ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🍑', '🥝', '🍕', '🍔', '🌮', '🍣', '🍩', '🧁', '🍰', '☕', '🍵', '🧃', '🍷', '🍺', '🥤', '🧊', '🍫', '🥜', '🌶️'],
		},
	];

	const allEmojis = EMOJI_GROUPS.flatMap(g => g.emojis);

	const filteredEmojis = $derived.by(() => {
		if (!searchQuery.trim()) return null;
		const q = searchQuery.toLowerCase();
		// Simple: just show all emojis (emoji search by name would require a mapping)
		return allEmojis;
	});

	function handleSelect(emoji: string) {
		onSelect(emoji);
		open = false;
		searchQuery = '';
	}

	function handleClear(e: MouseEvent) {
		e.stopPropagation();
		onSelect(null);
		open = false;
	}

	function handleClickOutside(e: MouseEvent) {
		if (triggerEl && !triggerEl.contains(e.target as Node)) {
			const dropdown = document.querySelector('.emoji-picker-dropdown');
			if (dropdown && !dropdown.contains(e.target as Node)) {
				open = false;
				searchQuery = '';
			}
		}
	}

	const btnSize = $derived(size === 'sm' ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-base');
</script>

<svelte:window onclick={handleClickOutside} />

<div class="relative inline-flex">
	<button
		bind:this={triggerEl}
		class="emoji-trigger {btnSize} flex items-center justify-center rounded transition-all duration-100 cursor-pointer"
		style="background: {selected ? 'oklch(0.25 0.02 250)' : 'oklch(0.20 0.01 250)'}; border: 1px solid {open ? 'oklch(0.45 0.10 240)' : 'oklch(0.28 0.02 250)'};"
		onclick={(e) => { e.stopPropagation(); open = !open; }}
		title={selected ? `Icon: ${selected} (click to change)` : 'Set icon'}
	>
		{#if selected}
			<span>{selected}</span>
		{:else}
			<span style="color: oklch(0.40 0.02 250); font-size: 0.65em;">+</span>
		{/if}
	</button>

	{#if open}
		<div
			class="emoji-picker-dropdown absolute left-0 top-full mt-1 z-50 rounded-lg overflow-hidden"
			style="background: oklch(0.18 0.02 250); border: 1px solid oklch(0.30 0.02 250); box-shadow: 0 8px 32px oklch(0 0 0 / 0.5); width: 240px;"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Search -->
			<div class="px-2 py-1.5" style="border-bottom: 1px solid oklch(0.24 0.01 250);">
				<input
					type="text"
					placeholder="Filter..."
					bind:value={searchQuery}
					class="w-full px-2 py-1 rounded text-xs border-0 outline-none"
					style="background: oklch(0.22 0.01 250); color: oklch(0.85 0.01 250);"
				/>
			</div>

			<!-- Emoji grid -->
			<div class="max-h-48 overflow-y-auto px-1.5 py-1.5">
				{#if filteredEmojis}
					<div class="grid grid-cols-8 gap-0.5">
						{#each filteredEmojis as emoji}
							<button
								class="w-7 h-7 flex items-center justify-center rounded text-sm cursor-pointer transition-all duration-75 hover:scale-110"
								style="background: {selected === emoji ? 'oklch(0.45 0.12 240 / 0.3)' : 'transparent'};"
								onclick={() => handleSelect(emoji)}
							>
								{emoji}
							</button>
						{/each}
					</div>
				{:else}
					{#each EMOJI_GROUPS as group}
						<div class="mb-1.5">
							<div class="text-[9px] font-mono uppercase tracking-wider px-1 py-0.5" style="color: oklch(0.45 0.02 250);">
								{group.label}
							</div>
							<div class="grid grid-cols-8 gap-0.5">
								{#each group.emojis as emoji}
									<button
										class="w-7 h-7 flex items-center justify-center rounded text-sm cursor-pointer transition-all duration-75 hover:scale-110"
										style="background: {selected === emoji ? 'oklch(0.45 0.12 240 / 0.3)' : 'transparent'};"
										onclick={() => handleSelect(emoji)}
									>
										{emoji}
									</button>
								{/each}
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<!-- Clear button -->
			{#if selected}
				<div class="px-2 py-1.5" style="border-top: 1px solid oklch(0.24 0.01 250);">
					<button
						class="w-full text-center text-[10px] py-1 rounded cursor-pointer transition-colors duration-100"
						style="color: oklch(0.55 0.02 250); background: transparent;"
						onclick={handleClear}
					>
						Clear icon
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
