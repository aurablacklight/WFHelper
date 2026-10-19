import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
				// Sweeps would sleep between mocked upstream calls; wfmPacing.spec.ts covers the gaps.
				miniflare: { bindings: { WFM_CALL_GAP_MS: '0', WFM_AUCTION_SEARCH_GAP_MS: '0' } },
			},
		},
		// Smoke tests hit the live deployed worker. Keep them out of the default
		// test run so a WFM blip or deploy lag can't flake developer PRs. Run
		// explicitly with `npm run test:smoke`.
		exclude: ['node_modules/**', 'test/smoke.spec.ts'],
	},
});
