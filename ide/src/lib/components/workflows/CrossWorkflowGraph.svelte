<script lang="ts">
	import { onMount } from 'svelte';
	interface GraphNode {
		id: string;
		name: string;
		description?: string;
		enabled: boolean;
		healthStatus?: 'healthy' | 'degraded' | 'critical';
		lastRunStatus?: string;
		lastRunAt?: string;
		runCount: number;
	}
	interface GraphEdge {
		source: string;
		target: string;
	}

	interface Props {
		onWorkflowClick?: (id: string) => void;
	}

	let { onWorkflowClick }: Props = $props();

	// ─── Data ──────────────────────────────────────────────────────────────────

	let loading = $state(true);
	let loadError = $state<string | null>(null);
	let graphNodes = $state<GraphNode[]>([]);
	let graphEdges = $state<GraphEdge[]>([]);

	// ─── Layout ────────────────────────────────────────────────────────────────

	interface LayoutNode extends GraphNode {
		x: number;
		y: number;
		w: number;
		h: number;
	}

	const BASE_W = 160;
	const BASE_H = 52;
	const COL_GAP = 220;
	const ROW_GAP = 80;
	const PAD = 60;

	const layoutNodes = $derived.by((): LayoutNode[] => {
		if (graphNodes.length === 0) return [];

		const ids = graphNodes.map((n) => n.id);

		// Kahn's topological sort into layers
		const preds = new Map<string, Set<string>>();
		for (const id of ids) preds.set(id, new Set());
		for (const e of graphEdges) {
			if (preds.has(e.target) && preds.has(e.source)) {
				preds.get(e.target)!.add(e.source);
			}
		}

		const col = new Map<string, number>();
		const remaining = new Set(ids);
		let level = 0;
		while (remaining.size > 0) {
			const ready: string[] = [];
			for (const id of remaining) {
				const p = preds.get(id)!;
				let allAssigned = true;
				for (const pred of p) {
					if (remaining.has(pred)) { allAssigned = false; break; }
				}
				if (allAssigned) ready.push(id);
			}
			if (ready.length === 0) {
				for (const id of remaining) col.set(id, level);
				break;
			}
			for (const id of ready) {
				col.set(id, level);
				remaining.delete(id);
			}
			level++;
		}

		// Group by column, preserving original order within column
		const columns = new Map<number, string[]>();
		for (const n of graphNodes) {
			const c = col.get(n.id) ?? 0;
			if (!columns.has(c)) columns.set(c, []);
			columns.get(c)!.push(n.id);
		}

		// Compute node sizes (wider nodes for longer names)
		const nodeMap = new Map(graphNodes.map((n) => [n.id, n]));
		const result: LayoutNode[] = [];
		for (const n of graphNodes) {
			const c = col.get(n.id) ?? 0;
			const rows = columns.get(c)!;
			const r = rows.indexOf(n.id);
			const w = Math.max(BASE_W, Math.min(220, n.name.length * 8 + 48));
			result.push({
				...n,
				x: PAD + c * (BASE_W + COL_GAP),
				y: PAD + r * (BASE_H + ROW_GAP),
				w,
				h: BASE_H
			});
		}
		return result;
	});

	const svgWidth = $derived(
		layoutNodes.length === 0
			? 600
			: Math.max(...layoutNodes.map((n) => n.x + n.w)) + PAD
	);
	const svgHeight = $derived(
		layoutNodes.length === 0
			? 400
			: Math.max(...layoutNodes.map((n) => n.y + n.h)) + PAD
	);

	// ─── Pan / Zoom ────────────────────────────────────────────────────────────

	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let isPanning = $state(false);
	let panStart = $state({ x: 0, y: 0, px: 0, py: 0 });

	let svgEl: SVGSVGElement | undefined = $state();
	let containerEl: HTMLDivElement | undefined = $state();

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const delta = e.deltaY > 0 ? 0.9 : 1.1;
		zoom = Math.max(0.25, Math.min(3, zoom * delta));
	}

	function handleMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;
		const target = e.target as Element;
		if (target.closest('.graph-node')) return;
		isPanning = true;
		panStart = { x: e.clientX, y: e.clientY, px: panX, py: panY };
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isPanning) return;
		panX = panStart.px + (e.clientX - panStart.x);
		panY = panStart.py + (e.clientY - panStart.y);
	}

	function handleMouseUp() {
		isPanning = false;
	}

	function fitView() {
		if (!containerEl || layoutNodes.length === 0) return;
		const rect = containerEl.getBoundingClientRect();
		const scaleX = (rect.width - 80) / svgWidth;
		const scaleY = (rect.height - 80) / svgHeight;
		zoom = Math.min(scaleX, scaleY, 1.5);
		panX = (rect.width - svgWidth * zoom) / 2;
		panY = (rect.height - svgHeight * zoom) / 2;
	}

	// ─── Edge paths ────────────────────────────────────────────────────────────

	function edgePath(edge: GraphEdge): string {
		const src = layoutNodes.find((n) => n.id === edge.source);
		const tgt = layoutNodes.find((n) => n.id === edge.target);
		if (!src || !tgt) return '';

		const x1 = src.x + src.w;
		const y1 = src.y + src.h / 2;
		const x2 = tgt.x;
		const y2 = tgt.y + tgt.h / 2;
		const cx = (x1 + x2) / 2;

		return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
	}

	// ─── Colors ────────────────────────────────────────────────────────────────

	function healthColor(node: GraphNode): string {
		if (!node.enabled) return 'oklch(0.38 0.02 250)';
		switch (node.healthStatus) {
			case 'healthy': return 'oklch(0.65 0.18 145)';
			case 'degraded': return 'oklch(0.72 0.18 85)';
			case 'critical': return 'oklch(0.65 0.20 25)';
			default: return 'oklch(0.50 0.05 250)';
		}
	}

	function healthBg(node: GraphNode): string {
		if (!node.enabled) return 'oklch(0.20 0.01 250)';
		switch (node.healthStatus) {
			case 'healthy': return 'oklch(0.65 0.18 145 / 0.12)';
			case 'degraded': return 'oklch(0.72 0.18 85 / 0.12)';
			case 'critical': return 'oklch(0.65 0.20 25 / 0.12)';
			default: return 'oklch(0.18 0.01 250)';
		}
	}

	function statusDotColor(node: GraphNode): string {
		switch (node.lastRunStatus) {
			case 'success': return 'oklch(0.65 0.18 145)';
			case 'error':
			case 'failed': return 'oklch(0.65 0.20 25)';
			case 'running': return 'oklch(0.65 0.18 200)';
			default: return 'oklch(0.38 0.02 250)';
		}
	}

	// ─── Run count → node size multiplier ─────────────────────────────────────

	const maxRunCount = $derived(Math.max(1, ...graphNodes.map((n) => n.runCount)));

	function nodeOpacity(n: GraphNode): number {
		if (!n.enabled) return 0.5;
		return 1;
	}

	// ─── Load ──────────────────────────────────────────────────────────────────

	async function load() {
		loading = true;
		loadError = null;
		try {
			const res = await fetch('/api/workflows/graph');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			graphNodes = data.nodes ?? [];
			graphEdges = data.edges ?? [];
		} catch (e) {
			loadError = (e as Error).message;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		load().then(() => {
			setTimeout(fitView, 50);
		});
	});
</script>

<div
	class="relative w-full h-full overflow-hidden"
	style="background: oklch(0.13 0.01 250); cursor: {isPanning ? 'grabbing' : 'grab'}"
	bind:this={containerEl}
	onwheel={handleWheel}
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseUp}
	role="application"
	aria-label="Cross-workflow dependency graph"
>
	{#if loading}
		<div class="absolute inset-0 flex items-center justify-center">
			<span class="loading loading-spinner loading-lg" style="color: oklch(0.55 0.15 200)"></span>
		</div>
	{:else if loadError}
		<div class="absolute inset-0 flex flex-col items-center justify-center gap-3">
			<span class="text-sm" style="color: oklch(0.65 0.15 25)">Failed to load graph: {loadError}</span>
			<button class="btn btn-sm" onclick={load}>Retry</button>
		</div>
	{:else if graphNodes.length === 0}
		<div class="absolute inset-0 flex flex-col items-center justify-center gap-2">
			<svg class="w-10 h-10 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: oklch(0.60 0.02 250)">
				<circle cx="6" cy="12" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="18" cy="18" r="3" />
				<path d="M9 12h6M15.5 7.5l-3 3M15.5 16.5l-3-3" />
			</svg>
			<p class="text-sm" style="color: oklch(0.40 0.02 250)">No workflows yet</p>
			<p class="text-xs" style="color: oklch(0.32 0.02 250)">Add <strong>Run Workflow</strong> nodes to see cross-workflow dependencies</p>
		</div>
	{:else}
		<!-- SVG graph - no viewBox so coordinates are in screen pixels -->
		<svg
			bind:this={svgEl}
			style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: visible"
		>
			<defs>
				<marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
					<polygon points="0 0, 8 3, 0 6" fill="oklch(0.40 0.05 250)" />
				</marker>
				<marker id="arrowhead-hover" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
					<polygon points="0 0, 8 3, 0 6" fill="oklch(0.60 0.12 200)" />
				</marker>
			</defs>

			<g transform="translate({panX},{panY}) scale({zoom})">
				<!-- Edges -->
				{#each graphEdges as edge}
					{@const path = edgePath(edge)}
					{#if path}
						<path
							d={path}
							fill="none"
							stroke="oklch(0.35 0.04 250)"
							stroke-width="1.5"
							stroke-dasharray="none"
							marker-end="url(#arrowhead)"
							opacity="0.7"
						/>
					{/if}
				{/each}

				<!-- Nodes -->
				{#each layoutNodes as node}
					{@const color = healthColor(node)}
					{@const bg = healthBg(node)}
					{@const dotColor = statusDotColor(node)}
					{@const isRunning = node.lastRunStatus === 'running'}
					{@const sizeScale = 0.85 + (node.runCount / maxRunCount) * 0.3}
					<g
						class="graph-node"
						transform="translate({node.x},{node.y})"
						opacity={nodeOpacity(node)}
						role="button"
						tabindex="0"
						aria-label="Open workflow {node.name}"
						style="cursor: pointer"
						onclick={() => onWorkflowClick?.(node.id)}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onWorkflowClick?.(node.id); }}
					>
						<!-- Node background -->
						<rect
							x="0"
							y="0"
							width={node.w}
							height={node.h}
							rx="8"
							fill={bg}
							stroke={color}
							stroke-width="1.5"
						/>

						<!-- Left accent bar -->
						<rect
							x="0"
							y="0"
							width="4"
							height={node.h}
							rx="2"
							fill={color}
						/>

						<!-- Status dot (top right) -->
						<circle
							cx={node.w - 10}
							cy="10"
							r={isRunning ? 5 : 4}
							fill={dotColor}
						>
							{#if isRunning}
								<animate attributeName="r" values="4;6;4" dur="1.2s" repeatCount="indefinite" />
								<animate attributeName="opacity" values="1;0.5;1" dur="1.2s" repeatCount="indefinite" />
							{/if}
						</circle>

						<!-- Run count badge (bottom right, proportional size indicator) -->
						{#if node.runCount > 0}
							<rect
								x={node.w - 28}
								y={node.h - 14}
								width="22"
								height="10"
								rx="4"
								fill="oklch(0.25 0.02 250)"
							/>
							<text
								x={node.w - 17}
								y={node.h - 6}
								text-anchor="middle"
								font-size="7"
								fill="oklch(0.55 0.02 250)"
								font-family="monospace"
							>{node.runCount >= 100 ? '99+' : node.runCount}</text>
						{/if}

						<!-- Workflow name -->
						<text
							x="14"
							y={node.h / 2 - 5}
							font-size="11"
							font-weight="600"
							fill="oklch(0.88 0.02 250)"
							font-family="system-ui, sans-serif"
						>
							{#if node.name.length > 20}
								{node.name.slice(0, 18)}…
							{:else}
								{node.name}
							{/if}
						</text>

						<!-- Workflow ID + disabled label -->
						<text
							x="14"
							y={node.h / 2 + 9}
							font-size="9"
							fill="oklch(0.45 0.02 250)"
							font-family="monospace"
						>
							{node.id}{node.enabled ? '' : ' · off'}
						</text>
					</g>
				{/each}
			</g>
		</svg>

		<!-- Fit view button -->
		<button
			class="absolute bottom-3 right-3 btn btn-xs btn-ghost"
			style="color: oklch(0.50 0.02 250); background: oklch(0.18 0.01 250); border: 1px solid oklch(0.25 0.02 250)"
			onclick={fitView}
			title="Fit to view"
		>
			<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
			</svg>
		</button>

		<!-- Legend -->
		<div class="absolute top-3 right-3 flex flex-col gap-1 p-2 rounded" style="background: oklch(0.16 0.01 250 / 0.9); border: 1px solid oklch(0.22 0.02 250)">
			<div class="flex items-center gap-1.5">
				<div class="w-2 h-2 rounded-full" style="background: oklch(0.65 0.18 145)"></div>
				<span class="text-[9px]" style="color: oklch(0.55 0.02 250)">Healthy</span>
			</div>
			<div class="flex items-center gap-1.5">
				<div class="w-2 h-2 rounded-full" style="background: oklch(0.72 0.18 85)"></div>
				<span class="text-[9px]" style="color: oklch(0.55 0.02 250)">Degraded</span>
			</div>
			<div class="flex items-center gap-1.5">
				<div class="w-2 h-2 rounded-full" style="background: oklch(0.65 0.20 25)"></div>
				<span class="text-[9px]" style="color: oklch(0.55 0.02 250)">Critical</span>
			</div>
			<div class="flex items-center gap-1.5">
				<div class="w-2 h-2 rounded-full" style="background: oklch(0.38 0.02 250)"></div>
				<span class="text-[9px]" style="color: oklch(0.55 0.02 250)">Disabled</span>
			</div>
		</div>

		<!-- Stats bar (bottom left) -->
		<div class="absolute bottom-3 left-3 flex items-center gap-3 px-2 py-1 rounded" style="background: oklch(0.16 0.01 250 / 0.9); border: 1px solid oklch(0.22 0.02 250)">
			<span class="text-[9px]" style="color: oklch(0.45 0.02 250)">{graphNodes.length} workflows</span>
			{#if graphEdges.length > 0}
				<span class="text-[9px]" style="color: oklch(0.45 0.02 250)">{graphEdges.length} trigger{graphEdges.length === 1 ? '' : 's'}</span>
			{:else}
				<span class="text-[9px]" style="color: oklch(0.35 0.02 250)">No cross-triggers yet — add Run Workflow nodes</span>
			{/if}
		</div>
	{/if}
</div>
