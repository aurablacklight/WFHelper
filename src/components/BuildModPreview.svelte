<script lang="ts">
  import ItemImage from "./ItemImage.svelte";

  let {
    src,
    name,
    rank,
    description = "",
  }: {
    src: string | null;
    name: string;
    rank: string;
    description?: string;
  } = $props();
  let trigger: HTMLButtonElement;
  let preview: HTMLSpanElement;

  function close(): void {
    preview?.hidePopover();
  }

  function open(): void {
    if (!preview || !trigger) return;
    preview.showPopover();
    const anchor = trigger.getBoundingClientRect();
    const bounds = preview.getBoundingClientRect();
    const left =
      anchor.right + 12 + bounds.width <= window.innerWidth - 8
        ? anchor.right + 12
        : anchor.left - bounds.width - 12;
    preview.style.left = `${Math.max(8, Math.min(left, window.innerWidth - bounds.width - 8))}px`;
    preview.style.top = `${Math.max(8, Math.min(anchor.top, window.innerHeight - bounds.height - 8))}px`;
  }
</script>

<svelte:window onresize={close} onscroll={close} />

<button
  bind:this={trigger}
  type="button"
  class="h-9 w-9 shrink-0 cursor-zoom-in rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
  aria-label={`${name} — ${rank}`}
  onmouseenter={open}
  onmouseleave={close}
  onfocus={open}
  onblur={close}
  onclick={open}
  onkeydown={(event) => {
    if (event.key === "Escape") close();
  }}
  data-builds-preview-trigger
>
  <ItemImage {src} alt={name} auditKey={name} cls="h-9 w-9" />
  <span
    bind:this={preview}
    popover="manual"
    class="mod-preview rounded-lg border border-border-subtle bg-surface-tooltip p-3 text-text-primary shadow-xl"
    data-builds-preview
  >
    <span class="flex justify-center">
      <ItemImage {src} alt={name} cls="max-h-[320px] max-w-full" />
    </span>
    <span class="mt-2 block text-sm font-semibold">{name}</span>
    <span class="block text-xs text-text-secondary">{rank}</span>
    {#if description}
      <span class="mt-2 block whitespace-pre-line text-sm text-text-secondary">{description}</span>
    {/if}
  </span>
</button>

<style>
  .mod-preview {
    position: fixed;
    inset: auto;
    margin: 0;
    width: min(280px, calc(100vw - 16px));
    max-height: calc(100vh - 16px);
    overflow-y: auto;
    text-align: center;
    font-weight: normal;
  }
</style>
