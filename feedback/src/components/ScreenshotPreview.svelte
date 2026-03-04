<script lang="ts">
  let {
    screenshots = [],
    capturing = false,
    oncapture,
    onremove,
    onedit,
  }: {
    screenshots: string[];
    capturing: boolean;
    oncapture: () => void;
    onremove: (index: number) => void;
    onedit?: (index: number) => void;
  } = $props();
</script>

{#if screenshots.length > 0}
  <div class="thumb-strip">
    {#each screenshots.slice(-3) as src, i}
      {@const actualIndex = screenshots.length > 3 ? screenshots.length - 3 + i : i}
      <div class="thumb-wrap">
        <img class="thumb" src={src} alt="Screenshot {i + 1}" />
        {#if onedit}
          <button class="thumb-edit" onclick={() => onedit(actualIndex)} aria-label="Edit screenshot">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        {/if}
        <button class="thumb-remove" onclick={() => onremove(actualIndex)} aria-label="Remove screenshot">&times;</button>
      </div>
    {/each}
    {#if screenshots.length > 3}
      <span class="more-badge">+{screenshots.length - 3}</span>
    {/if}
  </div>
{/if}

<style>
  .thumb-strip {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .thumb-wrap {
    position: relative;
  }
  .thumb {
    width: 60px;
    height: 42px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #374151;
  }
  .thumb-edit {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 20px;
    height: 20px;
    border-radius: 3px;
    background: rgba(59, 130, 246, 0.85);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .thumb-wrap:hover .thumb-edit {
    opacity: 1;
  }
  .thumb-edit:hover {
    background: #2563eb;
  }
  .thumb-remove {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ef4444;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    padding: 0;
  }
  .more-badge {
    font-size: 11px;
    color: #6b7280;
    padding: 0 4px;
  }
</style>
