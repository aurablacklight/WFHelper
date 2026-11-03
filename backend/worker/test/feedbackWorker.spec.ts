import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../src/feedbackWorker';
import type { Env } from '../src/types';

const report = {
	kind: 'bug',
	title: 'Cannot open panel',
	description: 'Panel stays closed',
	appVersion: '0.1.0-beta.7',
	platform: 'win32',
};
let target: Env;
let discord: ReturnType<typeof vi.spyOn<typeof globalThis, 'fetch'>>;

function request(init: RequestInit = {}, path = '/v1/feedback'): Request {
	return new Request(`https://example.com${path}`, {
		method: 'POST',
		body: JSON.stringify(report),
		...init,
		headers: {
			'content-type': 'application/json',
			'x-wfhelper-client': 'WFHelper/0.1.0-beta.7',
			'cf-connecting-ip': '192.0.2.1',
			...(init.headers as Record<string, string>),
		},
	});
}

beforeEach(() => {
	target = {
		FEEDBACK_DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/123456/test-token',
		FEEDBACK_DISCORD_FORUM: '1',
		FEEDBACK_RATE_LIMITER: { limit: vi.fn(async () => ({ success: true })) },
		FEEDBACK_GLOBAL_LIMITER: { limit: vi.fn(async () => ({ success: true })) },
	} as unknown as Env;
	discord = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json({ id: '123456789' }));
	vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => vi.restoreAllMocks());

describe('feedback-only worker', () => {
	it('delivers a report from the app using only its own bindings', async () => {
		const response = await worker.fetch(request(), target);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ ok: true });
		expect(discord).toHaveBeenCalledTimes(1);
		const body = JSON.parse(String(discord.mock.calls[0]![1]?.body)) as { thread_name: string };
		expect(body.thread_name).toBe('Bug: Cannot open panel');
	});

	it('sends no thread name to a text channel, which would reject it', async () => {
		target.FEEDBACK_DISCORD_FORUM = '0';
		expect((await worker.fetch(request(), target)).status).toBe(200);
		const body = JSON.parse(String(discord.mock.calls[0]![1]?.body)) as Record<string, unknown>;
		expect(body).not.toHaveProperty('thread_name');
	});

	it('reports unavailable until the webhook secret is set', async () => {
		delete target.FEEDBACK_DISCORD_WEBHOOK_URL;
		expect((await worker.fetch(request(), target)).status).toBe(503);
		expect(discord).not.toHaveBeenCalled();
	});

	it.each([
		['GET', '/v1/feedback'],
		['POST', '/v1/snapshot'],
		['POST', '/'],
	])('has no route for %s %s', async (method, path) => {
		const init = method === 'GET' ? { method, body: null } : { method };
		expect((await worker.fetch(request(init, path), target)).status).toBe(404);
		expect(discord).not.toHaveBeenCalled();
	});

	it.each([
		['a browser origin', { origin: 'https://evil.example' }],
		['no client header', { 'x-wfhelper-client': '' }],
		['another client', { 'x-wfhelper-client': 'curl/8.0' }],
	])('refuses %s', async (_name, headers) => {
		expect((await worker.fetch(request({ headers }), target)).status).toBe(403);
		expect(discord).not.toHaveBeenCalled();
	});

	it('answers a wrong content type without calling Discord, which is the deploy probe', async () => {
		const response = await worker.fetch(request({ headers: { 'content-type': 'text/plain' } }), target);
		expect(response.status).toBe(400);
		expect(discord).not.toHaveBeenCalled();
	});

	it('does not leave half of an emoji in the thread name', async () => {
		const title = `${'x'.repeat(94)}\u{1F600}more`;
		await worker.fetch(request({ body: JSON.stringify({ ...report, title }) }), target);
		const body = JSON.parse(String(discord.mock.calls[0]![1]?.body)) as { thread_name: string };
		expect(body.thread_name).toBe(`Bug: ${'x'.repeat(94)}`);
	});
});
