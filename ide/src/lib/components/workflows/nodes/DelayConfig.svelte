<script lang="ts">
	import type { DelayConfig } from '$lib/types/workflow';

	let {
		config = { duration: 5, unit: 'seconds' as const },
		onUpdate = () => {}
	}: {
		config: DelayConfig;
		onUpdate?: (config: DelayConfig) => void;
	} = $props();

	function update(patch: Partial<DelayConfig>) {
		config = { ...config, ...patch };
		onUpdate(config);
	}

	const UNIT_OPTIONS: { value: DelayConfig['unit']; label: string; max: number }[] = [
		{ value: 'seconds', label: 'Seconds', max: 3600 },
		{ value: 'minutes', label: 'Minutes', max: 60 },
		{ value: 'hours', label: 'Hours', max: 24 }
	];

	const PRESETS: { label: string; duration: number; unit: DelayConfig['unit'] }[] = [
		{ label: '5 sec', duration: 5, unit: 'seconds' },
		{ label: '30 sec', duration: 30, unit: 'seconds' },
		{ label: '1 min', duration: 1, unit: 'minutes' },
		{ label: '5 min', duration: 5, unit: 'minutes' },
		{ label: '15 min', duration: 15, unit: 'minutes' },
		{ label: '1 hour', duration: 1, unit: 'hours' }
	];

	const currentMax = $derived(UNIT_OPTIONS.find(u => u.value === config.unit)?.max ?? 3600);

	function humanReadable(duration: number, unit: string): string {
		const totalSeconds = unit === 'hours' ? duration * 3600 : unit === 'minutes' ? duration * 60 : duration;
		if (totalSeconds < 60) return `${totalSeconds}s`;
		if (totalSeconds < 3600) {
			const m = Math.floor(totalSeconds / 60);
			const s = totalSeconds % 60;
			return s > 0 ? `${m}m ${s}s` : `${m}m`;
		}
		const h = Math.floor(totalSeconds / 3600);
		const m = Math.floor((totalSeconds % 3600) / 60);
		return m > 0 ? `${h}h ${m}m` : `${h}h`;
	}
</script>

<div class="flex flex-col gap-4">
	<div class="grid grid-cols-2 gap-3">
		<div class="form-control">
			<label class="label w-full pb-1">
				<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Duration</span>
			</label>
			<input
				type="number"
				class="input input-sm input-bordered w-full"
				style="background: oklch(0.16 0.01 250); border-color: oklch(0.25 0.02 250); color: oklch(0.90 0.02 250)"
				value={config.duration}
				oninput={(e) => update({ duration: Math.max(1, parseInt(e.currentTarget.value) || 1) })}
				min="1"
				max={currentMax}
			/>
		</div>

		<div class="form-control">
			<label class="label w-full pb-1">
				<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Unit</span>
			</label>
			<select
				class="select select-sm select-bordered w-full"
				style="background: oklch(0.16 0.01 250); border-color: oklch(0.25 0.02 250); color: oklch(0.90 0.02 250)"
				value={config.unit}
				onchange={(e) => update({ unit: e.currentTarget.value as DelayConfig['unit'] })}
			>
				{#each UNIT_OPTIONS as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Human-readable summary -->
	<div class="flex items-center gap-2 px-3 py-2 rounded-lg" style="background: oklch(0.18 0.01 250); border: 1px solid oklch(0.22 0.02 250)">
		<svg class="w-4 h-4 shrink-0" style="color: oklch(0.60 0.10 55)" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
		</svg>
		<span class="text-xs" style="color: oklch(0.70 0.02 250)">
			Wait <strong style="color: oklch(0.85 0.10 55)">{humanReadable(config.duration, config.unit)}</strong> then pass data through
		</span>
	</div>

	<!-- Presets -->
	<div class="form-control">
		<label class="label w-full pb-1">
			<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Quick Presets</span>
		</label>
		<div class="flex flex-wrap gap-1.5">
			{#each PRESETS as preset}
				{@const isActive = config.duration === preset.duration && config.unit === preset.unit}
				<button
					type="button"
					class="px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer"
					style="
						background: {isActive ? 'oklch(0.72 0.15 55 / 0.18)' : 'oklch(0.18 0.01 250)'};
						border: 1px solid {isActive ? 'oklch(0.72 0.15 55 / 0.5)' : 'oklch(0.25 0.02 250)'};
						color: {isActive ? 'oklch(0.85 0.12 55)' : 'oklch(0.65 0.02 250)'};
					"
					onclick={() => update({ duration: preset.duration, unit: preset.unit })}
				>
					{preset.label}
				</button>
			{/each}
		</div>
	</div>
</div>
