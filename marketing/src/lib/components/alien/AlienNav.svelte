<script lang="ts">
	/**
	 * AlienNav - Navigation for THE ALIEN MANUAL
	 *
	 * Features:
	 * - Holographic styling with alien glyphs
	 * - Scroll-aware transparency
	 * - Links to manual "chapters"
	 */
	let scrolled = $state(false);

	function handleScroll() {
		scrolled = window.scrollY > 20;
	}

	const navItems = [
		{ href: '#transmission', label: 'Transmission', glyph: '⌬' },
		{ href: '#chapters', label: 'Chapters', glyph: '⏣' },
		{ href: '#interface', label: 'Interface', glyph: '⎔' },
		{ href: '#swarm', label: 'Swarm', glyph: '⬡' },
		{ href: '#initialize', label: 'Initialize', glyph: '⧫' }
	];
</script>

<svelte:window onscroll={handleScroll} />

<nav class="alien-nav" class:scrolled>
	<div class="nav-content">
		<!-- Logo/Title -->
		<a href="/thealienmanual" class="nav-logo">
			<span class="logo-glyph">⬢</span>
			<span class="logo-text">THE ALIEN MANUAL</span>
		</a>

		<!-- Navigation Links -->
		<div class="nav-links">
			{#each navItems as item}
				<a href={item.href} class="nav-link">
					<span class="link-glyph">{item.glyph}</span>
					<span class="link-text">{item.label}</span>
				</a>
			{/each}
		</div>

		<!-- CTA -->
		<a href="#initialize" class="nav-cta">
			<span class="cta-text">Initialize</span>
			<span class="cta-arrow">→</span>
		</a>
	</div>

	<!-- Scan line decoration -->
	<div class="nav-scanline"></div>
</nav>

<style>
	.alien-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		padding: 1rem 2rem;
		transition: all 0.3s ease;
	}

	.alien-nav.scrolled {
		background: oklch(5% 0.02 280 / 0.95);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid oklch(70% 0.25 280 / 0.2);
		box-shadow: 0 4px 30px oklch(70% 0.25 280 / 0.1);
	}

	.nav-content {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	/* Logo */
	.nav-logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		text-decoration: none;
		color: oklch(90% 0.02 280);
	}

	.logo-glyph {
		font-size: 1.5rem;
		color: oklch(70% 0.25 280);
		text-shadow: 0 0 10px oklch(70% 0.25 280 / 0.8);
		animation: logo-pulse 2s ease-in-out infinite;
	}

	@keyframes logo-pulse {
		0%, 100% { opacity: 0.8; transform: scale(1); }
		50% { opacity: 1; transform: scale(1.1); }
	}

	.logo-text {
		font-family: ui-monospace, monospace;
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}

	/* Navigation Links */
	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	@media (max-width: 900px) {
		.nav-links {
			display: none;
		}
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		text-decoration: none;
		color: oklch(60% 0.02 280);
		font-family: ui-monospace, monospace;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.nav-link:hover {
		color: oklch(90% 0.02 280);
		background: oklch(70% 0.25 280 / 0.1);
	}

	.nav-link:hover .link-glyph {
		color: oklch(70% 0.25 280);
		text-shadow: 0 0 8px oklch(70% 0.25 280 / 0.8);
	}

	.link-glyph {
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}

	.link-text {
		font-weight: 500;
	}

	/* CTA Button */
	.nav-cta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: oklch(70% 0.25 280 / 0.15);
		border: 1px solid oklch(70% 0.25 280 / 0.4);
		border-radius: 4px;
		text-decoration: none;
		color: oklch(70% 0.25 280);
		font-family: ui-monospace, monospace;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		transition: all 0.2s ease;
	}

	.nav-cta:hover {
		background: oklch(70% 0.25 280 / 0.25);
		border-color: oklch(70% 0.25 280 / 0.6);
		box-shadow: 0 0 20px oklch(70% 0.25 280 / 0.3);
	}

	.cta-arrow {
		transition: transform 0.2s ease;
	}

	.nav-cta:hover .cta-arrow {
		transform: translateX(4px);
	}

	/* Scan line decoration */
	.nav-scanline {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			oklch(70% 0.25 280 / 0.5) 50%,
			transparent 100%
		);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.alien-nav.scrolled .nav-scanline {
		opacity: 1;
		animation: scanline-glow 2s ease-in-out infinite;
	}

	@keyframes scanline-glow {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 0.8; }
	}
</style>
