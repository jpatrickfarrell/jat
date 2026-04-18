<script lang="ts">
	interface Props {
		data?: number[];
		state?: string;
	}

	let { data = [], state = 'working' }: Props = $props();

	const BARS = 10;
	const BAR_W = 2.5;
	const HEIGHT = 10;

	const displayData = $derived.by(() => {
		const d = data.slice(-BARS);
		while (d.length < BARS) d.unshift(-1);
		return d;
	});

	const maxVal = $derived.by(() => {
		const pos = displayData.filter(v => v > 0);
		return pos.length > 0 ? Math.max(...pos) : 1;
	});

	const color = $derived.by(() => {
		switch (state) {
			case 'working':
			case 'starting':
			case 'completing': return 'oklch(0.75 0.15 85)';
			case 'needs-input': return 'oklch(0.70 0.18 200)';
			case 'ready-for-review': return 'oklch(0.70 0.18 145)';
			default: return 'oklch(0.45 0.02 250)';
		}
	});

	const totalWidth = $derived(BARS * BAR_W + (BARS - 1));
</script>

<div
	class="activity-pulse"
	style="width: {totalWidth}px; height: {HEIGHT}px;"
	aria-hidden="true"
>
	{#each displayData as value, i}
		{@const isNoData = value < 0}
		{@const isIdle = value === 0}
		{@const barH = isNoData ? 0 : isIdle ? 1 : Math.max((value / maxVal) * HEIGHT, 2)}
		{@const isRecent = i >= BARS - 3}
		<div
			class="ap-bar"
			style="
				width: {BAR_W}px;
				height: {barH}px;
				background: {color};
				opacity: {isNoData ? 0 : isRecent ? 0.9 : 0.3};
			"
		></div>
	{/each}
</div>

<style>
	.activity-pulse {
		display: inline-flex;
		align-items: flex-end;
		gap: 1px;
		flex-shrink: 0;
	}

	.ap-bar {
		border-radius: 1px;
		transition: height 0.25s ease, opacity 0.25s ease;
	}
</style>
