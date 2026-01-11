<script lang="ts">
	/**
	 * AlienHero - The opening transmission
	 *
	 * Features:
	 * - Animated alien glyph constellation in canvas
	 * - "TRANSMISSION RECEIVED" title with glitch effects
	 * - Holographic particle field
	 */
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let glyphRing: HTMLDivElement;

	// Alien glyphs that orbit
	const glyphs = ['⌬', '⏣', '⎔', '⌖', '◬', '⟐', '⧫', '⬡', '⬢', '⬣', '◈', '⬥'];

	onMount(() => {
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let width = window.innerWidth;
		let height = window.innerHeight;
		canvas.width = width;
		canvas.height = height;

		// Particle system
		interface Particle {
			x: number;
			y: number;
			vx: number;
			vy: number;
			size: number;
			alpha: number;
			color: string;
		}

		const particles: Particle[] = [];
		const particleCount = 100;

		// Colors for the alien theme
		const colors = [
			'oklch(70% 0.25 280)',  // Purple
			'oklch(65% 0.20 180)',  // Cyan
			'oklch(75% 0.18 145)',  // Green
		];

		// Initialize particles
		for (let i = 0; i < particleCount; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				vx: (Math.random() - 0.5) * 0.5,
				vy: (Math.random() - 0.5) * 0.5,
				size: Math.random() * 2 + 0.5,
				alpha: Math.random() * 0.5 + 0.2,
				color: colors[Math.floor(Math.random() * colors.length)]
			});
		}

		// Mouse interaction
		const mouse = { x: width / 2, y: height / 2 };
		window.addEventListener('mousemove', (e) => {
			mouse.x = e.clientX;
			mouse.y = e.clientY;
		});

		// Connection distance
		const connectionDist = 120;

		function animate() {
			// Semi-transparent clear for trail effect
			ctx.fillStyle = 'oklch(5% 0.02 280 / 0.1)';
			ctx.fillRect(0, 0, width, height);

			// Draw connections first
			particles.forEach((p1, i) => {
				particles.forEach((p2, j) => {
					if (j <= i) return;
					const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
					if (dist < connectionDist) {
						const alpha = (1 - dist / connectionDist) * 0.15;
						ctx.beginPath();
						ctx.moveTo(p1.x, p1.y);
						ctx.lineTo(p2.x, p2.y);
						ctx.strokeStyle = `oklch(70% 0.25 280 / ${alpha})`;
						ctx.lineWidth = 0.5;
						ctx.stroke();
					}
				});
			});

			// Update and draw particles
			particles.forEach(p => {
				// Attraction to mouse
				const dx = mouse.x - p.x;
				const dy = mouse.y - p.y;
				const dist = Math.hypot(dx, dy);

				if (dist < 200) {
					p.vx += dx * 0.00003;
					p.vy += dy * 0.00003;
				}

				// Update position
				p.x += p.vx;
				p.y += p.vy;

				// Wrap around
				if (p.x < 0) p.x = width;
				if (p.x > width) p.x = 0;
				if (p.y < 0) p.y = height;
				if (p.y > height) p.y = 0;

				// Friction
				p.vx *= 0.99;
				p.vy *= 0.99;

				// Draw particle
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fillStyle = p.color.replace(')', ` / ${p.alpha})`);
				ctx.fill();

				// Glow effect for larger particles
				if (p.size > 1.5) {
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
					const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
					gradient.addColorStop(0, p.color.replace(')', ' / 0.3)'));
					gradient.addColorStop(1, 'transparent');
					ctx.fillStyle = gradient;
					ctx.fill();
				}
			});

			requestAnimationFrame(animate);
		}

		animate();

		// Handle resize
		window.addEventListener('resize', () => {
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width;
			canvas.height = height;
		});
	});
</script>

<section class="alien-hero">
	<!-- Particle Canvas Background -->
	<canvas bind:this={canvas} class="hero-canvas"></canvas>

	<!-- Grid overlay -->
	<div class="hero-grid"></div>

	<!-- Central content -->
	<div class="hero-content">
		<!-- Orbiting glyphs -->
		<div class="glyph-orbit" bind:this={glyphRing}>
			{#each glyphs as glyph, i}
				<span
					class="orbit-glyph"
					style="--orbit-delay: {i * -2.5}s; --orbit-index: {i};"
				>
					{glyph}
				</span>
			{/each}
		</div>

		<!-- Central title -->
		<div class="hero-title-container">
			<div class="transmission-badge">
				<span class="badge-dot"></span>
				<span class="badge-text">TRANSMISSION RECEIVED</span>
			</div>

			<h1 class="hero-title">
				<span class="title-line title-the">THE</span>
				<span class="title-line title-alien">ALIEN</span>
				<span class="title-line title-manual">MANUAL</span>
			</h1>

			<p class="hero-subtitle">
				The alien tool came with no manual.
				<br />
				<span class="subtitle-highlight">So I wrote one.</span>
			</p>

			<div class="hero-cta">
				<a href="#transmission" class="cta-primary">
					<span class="cta-glyph">⬢</span>
					<span>Begin Transmission</span>
				</a>
				<a href="#initialize" class="cta-secondary">
					Initialize System →
				</a>
			</div>
		</div>

		<!-- Bottom indicator -->
		<div class="scroll-indicator">
			<span class="indicator-text">SCROLL TO DECODE</span>
			<div class="indicator-line"></div>
		</div>
	</div>
</section>

<style>
	.alien-hero {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: oklch(5% 0.02 280);
	}

	/* AI-generated background image overlay */
	.alien-hero::before {
		content: '';
		position: absolute;
		inset: 0;
		background: url('/images/alien/hero-bg.png') center/cover no-repeat;
		opacity: 0.15;
		z-index: 0;
	}

	.hero-canvas {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.hero-grid {
		position: absolute;
		inset: 0;
		z-index: 2;
		background-image:
			linear-gradient(oklch(70% 0.25 280 / 0.05) 1px, transparent 1px),
			linear-gradient(90deg, oklch(70% 0.25 280 / 0.05) 1px, transparent 1px);
		background-size: 60px 60px;
		mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
	}

	.hero-content {
		position: relative;
		z-index: 10;
		text-align: center;
		padding: 2rem;
	}

	/* Orbiting glyphs */
	.glyph-orbit {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 500px;
		height: 500px;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	@media (max-width: 640px) {
		.glyph-orbit {
			width: 300px;
			height: 300px;
		}
	}

	.orbit-glyph {
		position: absolute;
		top: 50%;
		left: 50%;
		font-size: 1.5rem;
		color: oklch(70% 0.25 280 / 0.6);
		text-shadow: 0 0 10px oklch(70% 0.25 280 / 0.5);
		animation: orbit 30s linear infinite;
		animation-delay: var(--orbit-delay);
	}

	@keyframes orbit {
		from {
			transform: rotate(0deg) translateX(250px) rotate(0deg);
		}
		to {
			transform: rotate(360deg) translateX(250px) rotate(-360deg);
		}
	}

	@media (max-width: 640px) {
		@keyframes orbit {
			from {
				transform: rotate(0deg) translateX(150px) rotate(0deg);
			}
			to {
				transform: rotate(360deg) translateX(150px) rotate(-360deg);
			}
		}
	}

	/* Title container */
	.hero-title-container {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	/* Transmission badge */
	.transmission-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: oklch(70% 0.25 280 / 0.1);
		border: 1px solid oklch(70% 0.25 280 / 0.3);
		border-radius: 100px;
		animation: badge-pulse 2s ease-in-out infinite;
	}

	@keyframes badge-pulse {
		0%, 100% { border-color: oklch(70% 0.25 280 / 0.3); }
		50% { border-color: oklch(70% 0.25 280 / 0.6); }
	}

	.badge-dot {
		width: 8px;
		height: 8px;
		background: oklch(75% 0.18 145);
		border-radius: 50%;
		animation: dot-blink 1s ease-in-out infinite;
	}

	@keyframes dot-blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}

	.badge-text {
		font-family: ui-monospace, monospace;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		color: oklch(70% 0.25 280);
	}

	/* Hero title */
	.hero-title {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		margin: 0;
	}

	.title-line {
		display: block;
		font-family: ui-monospace, monospace;
		font-weight: 700;
		line-height: 0.9;
		letter-spacing: 0.1em;
	}

	.title-the {
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		color: oklch(60% 0.02 280);
	}

	.title-alien {
		font-size: clamp(4rem, 15vw, 10rem);
		background: linear-gradient(
			180deg,
			oklch(70% 0.25 280) 0%,
			oklch(65% 0.20 180) 50%,
			oklch(70% 0.25 280) 100%
		);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		text-shadow: none;
		filter: drop-shadow(0 0 30px oklch(70% 0.25 280 / 0.5));
		animation: title-glitch 8s ease-in-out infinite;
	}

	@keyframes title-glitch {
		0%, 92%, 100% {
			transform: translateX(0);
			filter: drop-shadow(0 0 30px oklch(70% 0.25 280 / 0.5));
		}
		93% {
			transform: translateX(-3px);
			filter: drop-shadow(3px 0 0 oklch(65% 0.20 180 / 0.5)) drop-shadow(-3px 0 0 oklch(70% 0.25 280 / 0.5));
		}
		94% {
			transform: translateX(3px);
			filter: drop-shadow(-3px 0 0 oklch(65% 0.20 180 / 0.5)) drop-shadow(3px 0 0 oklch(75% 0.18 145 / 0.5));
		}
		95% {
			transform: translateX(-2px);
			filter: drop-shadow(0 0 30px oklch(70% 0.25 280 / 0.5));
		}
		96% {
			transform: translateX(0);
		}
	}

	.title-manual {
		font-size: clamp(2rem, 6vw, 4rem);
		color: oklch(90% 0.02 280);
	}

	/* Subtitle */
	.hero-subtitle {
		max-width: 500px;
		font-size: 1.1rem;
		line-height: 1.6;
		color: oklch(60% 0.02 280);
		margin: 1rem 0 0;
	}

	.subtitle-highlight {
		color: oklch(90% 0.02 280);
		font-weight: 500;
	}

	/* CTAs */
	.hero-cta {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		margin-top: 2rem;
	}

	.cta-primary {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 2rem;
		background: oklch(70% 0.25 280 / 0.15);
		border: 1px solid oklch(70% 0.25 280 / 0.5);
		border-radius: 4px;
		text-decoration: none;
		color: oklch(90% 0.02 280);
		font-family: ui-monospace, monospace;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		transition: all 0.3s ease;
	}

	.cta-primary:hover {
		background: oklch(70% 0.25 280 / 0.25);
		border-color: oklch(70% 0.25 280 / 0.8);
		box-shadow:
			0 0 30px oklch(70% 0.25 280 / 0.3),
			inset 0 0 20px oklch(70% 0.25 280 / 0.1);
	}

	.cta-glyph {
		font-size: 1.25rem;
		color: oklch(70% 0.25 280);
	}

	.cta-secondary {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		text-decoration: none;
		color: oklch(60% 0.02 280);
		font-family: ui-monospace, monospace;
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		transition: color 0.2s ease;
	}

	.cta-secondary:hover {
		color: oklch(90% 0.02 280);
	}

	/* Scroll indicator */
	.scroll-indicator {
		position: absolute;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		animation: indicator-float 2s ease-in-out infinite;
	}

	@keyframes indicator-float {
		0%, 100% { transform: translateX(-50%) translateY(0); }
		50% { transform: translateX(-50%) translateY(-10px); }
	}

	.indicator-text {
		font-family: ui-monospace, monospace;
		font-size: 0.65rem;
		font-weight: 500;
		letter-spacing: 0.2em;
		color: oklch(50% 0.02 280);
	}

	.indicator-line {
		width: 1px;
		height: 40px;
		background: linear-gradient(
			180deg,
			oklch(70% 0.25 280 / 0.6) 0%,
			transparent 100%
		);
	}
</style>
