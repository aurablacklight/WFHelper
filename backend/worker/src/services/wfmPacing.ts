// warframe.market allows 3 requests a second, and 10 a minute for contract (auction)
// searches. The gaps leave a little headroom under both.
export const WFM_CALL_GAP_MS = 350;
export const WFM_AUCTION_SEARCH_GAP_MS = 6500;

type WfmCallKind = 'call' | 'auction-search';

interface WfmGaps {
	wfmCallGapMs: number;
	wfmAuctionSearchGapMs: number;
}

/** Each call reserves the next free slot before it waits, so overlapping callers queue
 *  rather than burst. An auction search also takes a general slot. */
export function createWfmPacer(
	now: () => number = () => Date.now(),
	sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
) {
	let nextCallAt = 0;
	let nextAuctionSearchAt = 0;
	return async function pace(gaps: WfmGaps, kind: WfmCallKind = 'call'): Promise<void> {
		const current = now();
		const startAt = Math.max(current, nextCallAt, kind === 'auction-search' ? nextAuctionSearchAt : 0);
		nextCallAt = startAt + gaps.wfmCallGapMs;
		if (kind === 'auction-search') nextAuctionSearchAt = startAt + gaps.wfmAuctionSearchGapMs;
		if (startAt > current) await sleep(startAt - current);
	};
}

// Shared by the cron sweeps and admin prewarms in this isolate. User read-through misses
// never wait on it: one or two requests per miss must not queue behind a sweep.
export const paceWfmCall = createWfmPacer();
