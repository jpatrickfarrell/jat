let open = $state(false);

export const voiceVocabSheet = {
	get open() { return open; },
	toggle() { open = !open; },
	show() { open = true; },
	hide() { open = false; }
};
