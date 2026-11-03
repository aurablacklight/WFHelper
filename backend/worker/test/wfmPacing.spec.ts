import { env } from 'cloudflare:test';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWorkerConfig } from '../src/config';
import { createWfmPacer, WFM_AUCTION_SEARCH_GAP_MS, WFM_CALL_GAP_MS } from '../src/services/wfmPacing';
import type { Env } from '../src/types';

const GAPS = { wfmCallGapMs: WFM_CALL_GAP_MS, wfmAuctionSearchGapMs: WFM_AUCTION_SEARCH_GAP_MS };

/** Runs `count` paced calls back to back and records when each one was let through. */
async function startTimes(count: number, kind: 'call' | 'auction-search', pace = createWfmPacer()): Promise<number[]> {
	const origin = Date.now();
	const times: number[] = [];
	const run = (async () => {
		for (let index = 0; index < count; index += 1) {
			await pace(GAPS, kind);
			times.push(Date.now() - origin);
		}
	})();
	await vi.runAllTimersAsync();
	await run;
	return times;
}

describe('warframe.market pacing', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(1_800_000_000_000);
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('lets the first call through at once and spaces the rest by the call gap', async () => {
		expect(await startTimes(4, 'call')).toEqual([0, 350, 700, 1050]);
	});

	it('never lets more than 3 calls into any one second', async () => {
		const times = await startTimes(30, 'call');
		for (const start of times) {
			expect(times.filter((time) => time >= start && time < start + 1000).length).toBeLessThanOrEqual(3);
		}
	});

	it('keeps auction searches to 10 in any minute', async () => {
		const times = await startTimes(12, 'auction-search');
		expect(times.slice(0, 3)).toEqual([0, 6500, 13000]);
		for (const start of times) {
			expect(times.filter((time) => time >= start && time <= start + 60_000).length).toBeLessThanOrEqual(10);
		}
	});

	it('does not wait when the caller is already slower than the gap', async () => {
		const pace = createWfmPacer();
		await pace(GAPS);
		vi.advanceTimersByTime(1000);
		const before = Date.now();
		await pace(GAPS);
		expect(Date.now()).toBe(before);
	});

	it('queues overlapping callers instead of letting them burst', async () => {
		const pace = createWfmPacer();
		const origin = Date.now();
		const times: number[] = [];
		const callers = [0, 1, 2].map(() => pace(GAPS).then(() => times.push(Date.now() - origin)));
		await vi.runAllTimersAsync();
		await Promise.all(callers);
		expect(times).toEqual([0, 350, 700]);
	});

	it('holds a general call behind an auction search, and an auction search behind the auction gap', async () => {
		const pace = createWfmPacer();
		const origin = Date.now();
		const times: number[] = [];
		const run = (async () => {
			for (const kind of ['auction-search', 'call', 'auction-search'] as const) {
				await pace(GAPS, kind);
				times.push(Date.now() - origin);
			}
		})();
		await vi.runAllTimersAsync();
		await run;
		expect(times).toEqual([0, 350, 6500]);
	});

	it('reads the gaps from config, with "0" turning pacing off', () => {
		const base = env as unknown as Env;
		expect(getWorkerConfig({ ...base, WFM_CALL_GAP_MS: undefined, WFM_AUCTION_SEARCH_GAP_MS: undefined })).toMatchObject(GAPS);
		expect(getWorkerConfig({ ...base, WFM_CALL_GAP_MS: '0', WFM_AUCTION_SEARCH_GAP_MS: '0' })).toMatchObject({
			wfmCallGapMs: 0,
			wfmAuctionSearchGapMs: 0,
		});
		expect(getWorkerConfig({ ...base, WFM_CALL_GAP_MS: 'soon' }).wfmCallGapMs).toBe(WFM_CALL_GAP_MS);
	});
});
