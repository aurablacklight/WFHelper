<script lang="ts">
  import { tr } from "../../lib/i18n.js";
  import { buildsFontSize, BUILDS_FONT_SIZES } from "../../stores/buildsFontSize.js";
  import ThemedControlCard from "../ThemedControlCard.svelte";
</script>

<div class="appearance-section">
  <ThemedControlCard as="label" density="tight">
    <span class="text-xs font-medium text-text-secondary">
      {$tr("appearance.buildsFontSize")}
      <span class="mt-0.5 block font-normal text-text-muted">
        {$tr("appearance.buildsFontSizeHint")}
      </span>
    </span>
    <select
      bind:value={$buildsFontSize}
      class="rounded-[var(--radius-md)] border border-[var(--ui-control-border)] bg-bg-base px-2 py-1 text-sm text-text-primary"
      aria-label={$tr("appearance.buildsFontSize")}
      data-builds-font-size
    >
      {#each BUILDS_FONT_SIZES as size}
        <option value={size}>{size} px</option>
      {/each}
    </select>
  </ThemedControlCard>
</div>
