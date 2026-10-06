<script lang="ts">
  import { formatNumber } from "../lib/format.js";
  import { locale, tr, type MessageKey } from "../lib/i18n.js";
  import { invoke } from "../lib/ipc.js";
  import { inventoryData, itemDb } from "../stores/data.js";
  import ItemImage from "../components/ItemImage.svelte";
  import SearchBox from "../components/SearchBox.svelte";
  import ThemedButton from "../components/ThemedButton.svelte";
  import ThemedPanel from "../components/ThemedPanel.svelte";
  import ThemedSelect from "../components/ThemedSelect.svelte";
  import {
    ADVISOR_FACTIONS,
    type AdvisorFaction,
    type FactionDps,
  } from "../../config/shared/buildAdvisorTypes.js";
  import type {
    DamageType,
    GunBuildReview,
    GunCategory,
    GunStats,
    OwnedGunSummary,
  } from "../../config/shared/buildAdvisorTypes.js";

  const GROUPS: { category: GunCategory; labelKey: MessageKey }[] = [
    { category: "LongGuns", labelKey: "builds.groupPrimary" },
    { category: "Pistols", labelKey: "builds.groupSecondary" },
  ];

  // Arsenal order: physical first, then single elements, then combined ones.
  const DAMAGE_ROWS: { type: DamageType; labelKey: MessageKey }[] = [
    { type: "impact", labelKey: "pt.element.impact" },
    { type: "puncture", labelKey: "pt.element.puncture" },
    { type: "slash", labelKey: "pt.element.slash" },
    { type: "heat", labelKey: "pt.element.heat" },
    { type: "cold", labelKey: "pt.element.cold" },
    { type: "electricity", labelKey: "pt.element.electric" },
    { type: "toxin", labelKey: "pt.element.toxin" },
    { type: "blast", labelKey: "pt.element.blast" },
    { type: "radiation", labelKey: "pt.element.radiation" },
    { type: "gas", labelKey: "pt.element.gas" },
    { type: "magnetic", labelKey: "pt.element.magnetic" },
    { type: "viral", labelKey: "pt.element.viral" },
    { type: "corrosive", labelKey: "pt.element.corrosive" },
  ];

  const FACTION_LABELS: Record<AdvisorFaction, MessageKey> = {
    grineer: "builds.faction.grineer",
    corpus: "builds.faction.corpus",
    infested: "builds.faction.infested",
    corrupted: "builds.faction.corrupted",
    sentient: "builds.faction.sentient",
    narmer: "builds.faction.narmer",
    murmur: "builds.faction.murmur",
    scaldra: "builds.faction.scaldra",
    techrot: "builds.faction.techrot",
    anarchs: "builds.faction.anarchs",
  };

  interface StatColumn {
    key: string;
    label: string;
    stats: GunStats;
    versus: FactionDps | null;
    recommended: boolean;
  }

  interface StatRow {
    key: string;
    label: string;
    values: string[];
  }

  let guns = $state<OwnedGunSummary[]>([]);
  let search = $state("");
  let selectedType = $state<string | null>(null);
  let review = $state<GunBuildReview | null>(null);
  let loadingReview = $state(false);
  // On by default: players compare builds with their stacks running.
  let stacksUp = $state(true);
  // The select holds "" for no target.
  let targetValue = $state("");
  // On by default: a recommendation that does not fit the weapon is no use.
  let fitCapacity = $state(true);
  const target = $derived(ADVISOR_FACTIONS.find((faction) => faction === targetValue) ?? null);

  const inv = $derived($inventoryData);
  const db = $derived($itemDb);
  const selected = $derived(guns.find((gun) => gun.type === selectedType) ?? null);

  const visibleGuns = $derived.by(() => {
    const query = search.trim().toLowerCase();
    return query ? guns.filter((gun) => gun.name.toLowerCase().includes(query)) : guns;
  });

  // The list and the open review both come from the inventory the main process
  // holds, so a new inventory in the renderer is the cue to ask again.
  $effect(() => {
    if (!inv) {
      guns = [];
      return;
    }
    let stale = false;
    void invoke("getBuildAdvisorGuns")
      .then((list) => {
        if (!stale) guns = list;
      })
      .catch(() => {
        if (!stale) guns = [];
      });
    return () => {
      stale = true;
    };
  });

  $effect(() => {
    const type = selectedType;
    const assume = stacksUp;
    const faction = target;
    const fit = fitCapacity;
    if (!type || !inv) {
      review = null;
      return;
    }
    let stale = false;
    loadingReview = true;
    void invoke("reviewGunBuild", type, assume, faction, fit)
      .then((result) => {
        if (!stale) review = result;
      })
      .catch(() => {
        if (!stale) review = null;
      })
      .finally(() => {
        if (!stale) loadingReview = false;
      });
    return () => {
      stale = true;
    };
  });

  const advice = $derived(review?.advice.ok ? review.advice : null);
  // The arcane leads the list: it decides what the mods beside it are worth.
  const recommended = $derived(
    advice
      ? [
          ...(advice.arcane ? [{ ...advice.arcane, isArcane: true }] : []),
          ...advice.mods.map((mod) => ({ ...mod, isArcane: false })),
        ]
      : [],
  );

  const columns = $derived.by((): StatColumn[] => {
    if (!review || !advice) return [];
    return [
      {
        key: "recommended",
        label: $tr("common.recommended"),
        stats: advice.stats,
        versus: advice.versus,
        recommended: true,
      },
      ...review.configs.map((config) => ({
        key: `config-${config.index}`,
        label:
          config.name ??
          $tr("builds.config", { letter: String.fromCharCode("A".charCodeAt(0) + config.index) }),
        stats: config.stats,
        versus: config.versus,
        recommended: false,
      })),
    ];
  });

  function decimal(value: number, digits: number): string {
    return new Intl.NumberFormat($locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  }

  // Stat text carries line breaks, some written as a literal backslash and n.
  const oneLine = (text: string): string => text.replace(/\\n|\s+/g, " ");

  const percent = (value: number): string => `${decimal(value * 100, 1)}%`;

  const rows = $derived.by((): StatRow[] => {
    if (columns.length === 0) return [];
    const each = (pick: (stats: GunStats) => string): string[] =>
      columns.map((column) => pick(column.stats));
    const damage = DAMAGE_ROWS.filter((row) =>
      columns.some((column) => (column.stats.damage[row.type] ?? 0) > 0),
    ).map((row) => ({
      key: row.type,
      label: $tr(row.labelKey),
      values: each((stats) => {
        const amount = stats.damage[row.type] ?? 0;
        return amount > 0 ? decimal(amount, 1) : "-";
      }),
    }));
    return [
      ...damage,
      {
        key: "total",
        label: $tr("common.total"),
        // The arsenal's Total row: per-projectile damage times multishot.
        values: each((stats) => decimal(stats.totalDamage * stats.multishot, 1)),
      },
      {
        key: "multishot",
        label: $tr("builds.stat.multishot"),
        values: each((stats) => decimal(stats.multishot, 1)),
      },
      {
        key: "criticalChance",
        label: $tr("builds.stat.criticalChance"),
        values: each((stats) => percent(stats.criticalChance)),
      },
      {
        key: "criticalDamage",
        label: $tr("builds.stat.criticalDamage"),
        values: each((stats) => `${decimal(stats.criticalMultiplier, 1)}x`),
      },
      {
        key: "status",
        label: $tr("builds.stat.status"),
        values: each((stats) => percent(stats.statusChance)),
      },
      {
        key: "fireRate",
        label: $tr("builds.stat.fireRate"),
        values: each((stats) => decimal(stats.fireRate, 2)),
      },
      {
        key: "magazine",
        label: $tr("builds.stat.magazine"),
        values: each((stats) => formatNumber(stats.magazineSize, $locale)),
      },
      {
        key: "reload",
        label: $tr("builds.stat.reload"),
        values: each((stats) => `${decimal(stats.reloadTime, 2)}s`),
      },
      {
        key: "burstDps",
        label: $tr("builds.stat.burstDps"),
        values: each((stats) => formatNumber(Math.round(stats.burstDps), $locale)),
      },
      {
        key: "sustainedDps",
        label: $tr("builds.stat.sustainedDps"),
        values: each((stats) => formatNumber(Math.round(stats.sustainedDps), $locale)),
      },
      // Present only while a target faction is chosen.
      ...(columns.every((column) => column.versus)
        ? [
            {
              key: "burstVs",
              label: $tr("builds.stat.burstVs"),
              values: columns.map((column) =>
                formatNumber(Math.round(column.versus?.burstDps ?? 0), $locale),
              ),
            },
            {
              key: "sustainedVs",
              label: $tr("builds.stat.sustainedVs"),
              values: columns.map((column) =>
                formatNumber(Math.round(column.versus?.sustainedDps ?? 0), $locale),
              ),
            },
          ]
        : []),
    ];
  });

  const uncounted = $derived(
    review?.configs.reduce((count, config) => count + config.unrecognised.length, 0) ?? 0,
  );
</script>

<section class="view active" data-builds-view>
  <div class="view-header">
    <h2>{$tr("common.builds")}</h2>
    <span class="text-xs text-text-muted">{$tr("builds.hint")}</span>
    <div class="ml-auto flex items-center gap-2">
      <label
        class="flex items-center gap-1.5 text-xs text-text-muted"
        title={$tr("builds.targetHint")}
      >
        {$tr("builds.target")}
        <ThemedSelect bind:value={targetValue}>
          <option value="">{$tr("common.none")}</option>
          {#each ADVISOR_FACTIONS as faction (faction)}
            <option value={faction} data-builds-target={faction}>
              {$tr(FACTION_LABELS[faction])}
            </option>
          {/each}
        </ThemedSelect>
      </label>
      <ThemedButton
        active={stacksUp}
        title={$tr("builds.stacksUpHint")}
        onClick={() => (stacksUp = !stacksUp)}
      >
        <span data-builds-stacks>{$tr("builds.stacksUp")}</span>
      </ThemedButton>
      <ThemedButton
        active={fitCapacity}
        title={$tr("builds.fitCapacityHint")}
        onClick={() => (fitCapacity = !fitCapacity)}
      >
        <span data-builds-fit>{$tr("builds.fitCapacity")}</span>
      </ThemedButton>
      <SearchBox bind:value={search} />
    </div>
  </div>

  {#if !inv}
    <div class="empty-state" data-builds-empty>
      <p>{$tr("builds.noData")}</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-3 p-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside
        class="self-start lg:sticky lg:top-1 lg:max-h-[calc(100vh_-_var(--titlebar-height)_-_var(--statusbar-height)_-_0.5rem)] lg:overflow-y-auto"
        data-builds-guns
      >
        <ThemedPanel className="flex flex-col gap-3 p-2">
          {#if visibleGuns.length === 0}
            <p class="m-0 p-1 text-xs text-text-muted">{$tr("builds.noGuns")}</p>
          {/if}
          {#each GROUPS as group (group.category)}
            {@const groupGuns = visibleGuns.filter((gun) => gun.category === group.category)}
            {#if groupGuns.length > 0}
              <div class="flex flex-col gap-0.5">
                <h3
                  class="m-0 px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-text-muted"
                >
                  {$tr(group.labelKey)}
                </h3>
                {#each groupGuns as gun (gun.type)}
                  <button
                    type="button"
                    class="gun-row flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1 text-left text-xs"
                    class:gun-row-active={gun.type === selectedType}
                    aria-pressed={gun.type === selectedType}
                    data-builds-gun={gun.type}
                    onclick={() => (selectedType = gun.type)}
                  >
                    <span class="h-6 w-6 shrink-0 overflow-hidden">
                      <ItemImage
                        src={db[gun.type]?.imageUrl ?? null}
                        alt={gun.name}
                        auditKey={gun.name}
                        cls="h-6 w-6"
                      />
                    </span>
                    <span
                      class="flex-1 truncate {gun.unsupported
                        ? 'text-text-muted'
                        : 'text-text-secondary'}"
                      title={gun.name}
                    >
                      {db[gun.type]?.displayName ?? gun.name}
                    </span>
                    {#if gun.unsupported}
                      <span class="whitespace-nowrap text-[0.65rem] text-text-muted">
                        {$tr("builds.notSupported")}
                      </span>
                    {/if}
                  </button>
                {/each}
              </div>
            {/if}
          {/each}
        </ThemedPanel>
      </aside>

      <div class="flex min-w-0 flex-col gap-3" data-builds-detail>
        {#if !selected}
          <div class="empty-state">
            <p>{$tr("builds.pickGun")}</p>
          </div>
        {:else if selected.unsupported}
          <ThemedPanel className="flex flex-col gap-1 p-3">
            <h3 class="m-0 text-sm font-semibold text-text-primary">{selected.name}</h3>
            <p class="m-0 text-xs text-text-muted" data-builds-unsupported>
              {selected.unsupported === "unknown-weapon"
                ? $tr("builds.unknownWeapon")
                : $tr("builds.unsupportedDetail")}
            </p>
          </ThemedPanel>
        {:else if advice}
          <ThemedPanel className="flex flex-col gap-2 p-3">
            <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h3 class="m-0 text-sm font-semibold text-text-primary">{advice.weapon.name}</h3>
              {#if advice.weapon.bonus}
                {@const bonus = advice.weapon.bonus}
                <span class="text-xs text-text-secondary" data-builds-bonus>
                  {$tr("builds.bonus", {
                    percent: decimal(bonus.value * 100, 1),
                    element: $tr(
                      DAMAGE_ROWS.find((row) => row.type === bonus.damageType)?.labelKey ??
                        "pt.element.impact",
                    ),
                  })}
                </span>
              {/if}
              <span class="text-xs text-text-muted">{$tr("builds.recommendedTitle")}</span>
              {#if advice.capacity}
                <span class="ml-auto text-xs text-text-secondary" data-builds-capacity>
                  {$tr("builds.capacity", {
                    used: String(advice.capacity.used),
                    total: String(advice.capacity.total),
                  })}
                </span>
              {/if}
            </div>

            {#if recommended.length === 0}
              <p class="m-0 text-xs text-text-muted">{$tr("builds.noMods")}</p>
            {:else}
              <ul class="m-0 grid list-none grid-cols-1 gap-2 p-0 xl:grid-cols-2">
                {#each recommended as mod (mod.type)}
                  <li
                    class="flex items-start gap-2 border-t border-[color:var(--ui-panel-border)] pt-2"
                    data-builds-mod={mod.type}
                    data-builds-arcane={mod.isArcane ? "" : undefined}
                  >
                    <span class="h-9 w-9 shrink-0 overflow-hidden">
                      <ItemImage
                        src={db[mod.type]?.imageUrl ?? null}
                        alt={mod.name}
                        auditKey={mod.name}
                        cls="h-9 w-9"
                      />
                    </span>
                    <div class="flex min-w-0 flex-1 flex-col gap-1">
                      <div class="flex items-baseline gap-2 text-xs">
                        <span class="truncate font-semibold text-text-secondary" title={mod.name}>
                          {db[mod.type]?.displayName ?? mod.name}
                        </span>
                        {#if mod.isArcane}
                          <span class="whitespace-nowrap text-accent"
                            >{$tr("inventory.tab.arcanes")}</span
                          >
                        {/if}
                        <span class="whitespace-nowrap text-text-muted">
                          {$tr("rivens.detail.rank", {
                            current: String(mod.rank),
                            max: String(mod.maxRank),
                          })}
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="share-track h-1.5 flex-1 rounded-full">
                          <div
                            class="share-fill h-full rounded-full"
                            style="width:{Math.min(100, Math.max(0, mod.burstDpsShare * 100))}%"
                          ></div>
                        </div>
                        <span class="whitespace-nowrap text-xs text-text-muted">
                          {$tr("builds.share", { percent: decimal(mod.burstDpsShare * 100, 0) })}
                        </span>
                      </div>
                      {#each mod.assumed as line (line)}
                        <span class="text-[0.7rem] text-text-muted" data-builds-assumed>
                          {$tr("builds.assumes", { text: oneLine(line) })}
                        </span>
                      {/each}
                      {#each mod.ignored as line (line)}
                        <span class="text-[0.7rem] text-text-muted">
                          {$tr("builds.notCounted", { text: oneLine(line) })}
                        </span>
                      {/each}
                    </div>
                  </li>
                {/each}
              </ul>
            {/if}
          </ThemedPanel>

          <ThemedPanel className="flex flex-col gap-2 p-3">
            <h3 class="m-0 text-sm font-semibold text-text-primary">{$tr("builds.statsTitle")}</h3>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse text-xs" data-builds-stats>
                <thead>
                  <!-- svelte-ignore component_name_lowercase (a table row, not the tr store) -->
                  <tr>
                    <th class="py-1 pr-3 text-left font-normal text-text-muted"></th>
                    {#each columns as column (column.key)}
                      <th
                        class="whitespace-nowrap px-2 py-1 text-right font-semibold {column.recommended
                          ? 'text-accent'
                          : 'text-text-secondary'}"
                      >
                        {column.label}
                      </th>
                    {/each}
                  </tr>
                </thead>
                <tbody>
                  {#each rows as row (row.key)}
                    <!-- svelte-ignore component_name_lowercase -->
                    <tr
                      class="border-t border-[color:var(--ui-panel-border)]"
                      data-builds-stat={row.key}
                    >
                      <td class="whitespace-nowrap py-1 pr-3 text-text-muted">{row.label}</td>
                      {#each row.values as value, index (columns[index].key)}
                        <td
                          class="px-2 py-1 text-right tabular-nums {columns[index].recommended
                            ? 'text-text-primary'
                            : 'text-text-secondary'}"
                        >
                          {value}
                        </td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            {#if uncounted > 0}
              <p class="m-0 text-xs text-text-muted">
                {$tr("builds.uncounted", { count: String(uncounted) })}
              </p>
            {/if}
            {#if advice.approximate}
              <p class="m-0 text-xs text-warning" data-builds-approximate>
                {$tr("builds.approximate")}
              </p>
            {/if}
            {#if advice.weapon.radialBase > 0}
              <p class="m-0 text-xs text-text-muted" data-builds-radial>
                {$tr("builds.radialNote", { amount: decimal(advice.weapon.radialBase, 0) })}
              </p>
            {/if}
            <p class="m-0 text-xs text-text-muted">{$tr("builds.caveat")}</p>
          </ThemedPanel>
        {:else if loadingReview}
          <div class="empty-state">
            <p>{$tr("common.loading")}</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</section>

<style>
  .gun-row {
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
  }
  .gun-row:hover {
    border-color: var(--ui-control-border);
  }
  .gun-row-active {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 18%, transparent);
  }
  .share-track {
    background: color-mix(in srgb, var(--text-muted) 25%, transparent);
  }
  .share-fill {
    background: var(--accent);
  }
</style>
