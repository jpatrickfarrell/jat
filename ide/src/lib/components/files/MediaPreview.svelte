<script lang="ts">
	/**
	 * MediaPreview - Renders media files (images, videos, audio, PDFs)
	 *
	 * Uses the /api/files/media endpoint to fetch binary files.
	 * Supports:
	 * - Images: png, jpg, gif, webp, svg, ico, bmp, avif
	 * - Videos: mp4, webm, ogg, mov, avi, mkv
	 * - Audio: mp3, wav, flac, aac, m4a, opus
	 * - Documents: pdf
	 */

	interface Props {
		project: string;
		path: string;
		filename: string;
	}

	let { project, path, filename }: Props = $props();

	// Media type categories
	const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp', 'avif'];
	const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
	const AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'opus'];
	const PDF_EXTENSIONS = ['pdf'];

	// Get file extension
	function getExtension(filename: string): string {
		return filename.split('.').pop()?.toLowerCase() || '';
	}

	// Determine media type
	const ext = $derived(getExtension(filename));
	const isImage = $derived(IMAGE_EXTENSIONS.includes(ext));
	const isVideo = $derived(VIDEO_EXTENSIONS.includes(ext));
	const isAudio = $derived(AUDIO_EXTENSIONS.includes(ext));
	const isPdf = $derived(PDF_EXTENSIONS.includes(ext));

	// Build media URL
	const mediaUrl = $derived(
		`/api/files/media?project=${encodeURIComponent(project)}&path=${encodeURIComponent(path)}`
	);

	// Track loading and error states
	let loading = $state(true);
	let error = $state<string | null>(null);

	function handleLoad() {
		loading = false;
		error = null;
	}

	function handleError(message: string) {
		loading = false;
		error = message;
	}

	// Reset states when path changes
	$effect(() => {
		const _path = path; // track dependency
		loading = true;
		error = null;
	});
</script>

<div class="media-preview">
	{#if loading}
		<div class="loading-state">
			<span class="loading loading-spinner loading-md"></span>
			<p>Loading {filename}...</p>
		</div>
	{/if}

	{#if error}
		<div class="error-state">
			<svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
			<p class="error-message">{error}</p>
			<p class="error-hint">This file cannot be previewed</p>
		</div>
	{:else if isImage}
		<div class="image-container" class:hidden={loading}>
			<img
				src={mediaUrl}
				alt={filename}
				onload={handleLoad}
				onerror={() => handleError('Failed to load image')}
				draggable="false"
			/>
		</div>
	{:else if isVideo}
		<div class="video-container" class:hidden={loading}>
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				src={mediaUrl}
				controls
				onloadeddata={handleLoad}
				onerror={() => handleError('Failed to load video')}
			>
				Your browser does not support the video tag.
			</video>
		</div>
	{:else if isAudio}
		<div class="audio-container" class:hidden={loading}>
			<div class="audio-icon">
				<svg class="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
				</svg>
			</div>
			<p class="audio-filename">{filename}</p>
			<audio
				src={mediaUrl}
				controls
				onloadeddata={handleLoad}
				onerror={() => handleError('Failed to load audio')}
			>
				Your browser does not support the audio tag.
			</audio>
		</div>
	{:else if isPdf}
		<div class="pdf-container" class:hidden={loading}>
			<iframe
				src={mediaUrl}
				title={filename}
				onload={handleLoad}
				onerror={() => handleError('Failed to load PDF')}
			></iframe>
		</div>
	{:else}
		<div class="unsupported-state">
			<svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
			</svg>
			<p class="unsupported-message">Cannot preview this file type</p>
			<p class="unsupported-extension">.{ext}</p>
		</div>
	{/if}

	<!-- File info footer -->
	<div class="media-info">
		<span class="info-filename" title={path}>{filename}</span>
		<span class="info-type">
			{#if isImage}Image
			{:else if isVideo}Video
			{:else if isAudio}Audio
			{:else if isPdf}PDF
			{:else}Unknown
			{/if}
		</span>
	</div>
</div>

<style>
	.media-preview {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: oklch(0.12 0.01 250);
		overflow: hidden;
	}

	.hidden {
		visibility: hidden;
		height: 0;
	}

	/* Loading State */
	.loading-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: oklch(0.55 0.02 250);
	}

	/* Error State */
	.error-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		color: oklch(0.55 0.12 30);
		padding: 2rem;
		text-align: center;
	}

	.error-message {
		font-size: 0.9rem;
		color: oklch(0.70 0.12 30);
	}

	.error-hint {
		font-size: 0.8rem;
		color: oklch(0.50 0.02 250);
	}

	/* Image Container */
	.image-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		overflow: auto;
		background:
			linear-gradient(45deg, oklch(0.15 0.01 250) 25%, transparent 25%),
			linear-gradient(-45deg, oklch(0.15 0.01 250) 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, oklch(0.15 0.01 250) 75%),
			linear-gradient(-45deg, transparent 75%, oklch(0.15 0.01 250) 75%);
		background-size: 20px 20px;
		background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
		background-color: oklch(0.10 0.01 250);
	}

	.image-container img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		border-radius: 0.25rem;
		box-shadow: 0 4px 20px oklch(0 0 0 / 0.3);
	}

	/* Video Container */
	.video-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: oklch(0.08 0.01 250);
	}

	.video-container video {
		max-width: 100%;
		max-height: 100%;
		border-radius: 0.5rem;
		box-shadow: 0 4px 20px oklch(0 0 0 / 0.3);
	}

	/* Audio Container */
	.audio-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		padding: 2rem;
		background: linear-gradient(180deg, oklch(0.12 0.01 250) 0%, oklch(0.16 0.02 250) 100%);
	}

	.audio-icon {
		color: oklch(0.55 0.12 200);
	}

	.audio-filename {
		font-size: 1rem;
		font-weight: 500;
		color: oklch(0.75 0.02 250);
		font-family: ui-monospace, monospace;
		max-width: 80%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.audio-container audio {
		width: 100%;
		max-width: 400px;
	}

	/* PDF Container */
	.pdf-container {
		flex: 1;
		display: flex;
		padding: 0.5rem;
		background: oklch(0.90 0.01 250);
	}

	.pdf-container iframe {
		width: 100%;
		height: 100%;
		border: none;
		border-radius: 0.25rem;
	}

	/* Unsupported State */
	.unsupported-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		color: oklch(0.45 0.02 250);
		padding: 2rem;
		text-align: center;
	}

	.unsupported-message {
		font-size: 0.9rem;
		color: oklch(0.55 0.02 250);
	}

	.unsupported-extension {
		font-size: 0.8rem;
		font-family: ui-monospace, monospace;
		color: oklch(0.40 0.02 250);
		background: oklch(0.18 0.01 250);
		padding: 0.25rem 0.75rem;
		border-radius: 0.25rem;
	}

	/* Media Info Footer */
	.media-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 1rem;
		background: oklch(0.15 0.01 250);
		border-top: 1px solid oklch(0.22 0.02 250);
		font-size: 0.75rem;
	}

	.info-filename {
		font-family: ui-monospace, monospace;
		color: oklch(0.70 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.info-type {
		color: oklch(0.55 0.02 250);
		background: oklch(0.20 0.02 250);
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		margin-left: 0.75rem;
	}
</style>
