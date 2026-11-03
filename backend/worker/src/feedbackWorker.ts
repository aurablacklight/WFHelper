import { APP_PRODUCT_NAME } from '../../../config/shared/appMeta';
import { handleFeedbackRoute } from './routes/feedback';
import { parseClientHeader } from './security/client';
import { jsonResponse, originIsAllowed } from './security/cors';
import type { Env } from './types';

/** Feedback only, for the fork: no KV, crons or price routes, so `wrangler.feedback.jsonc`
 *  can deploy it apart from the backend. The client check is forgeable and only turns away
 *  drive-by traffic; the route's rate limits are the real bound. */
export default {
	fetch(req: Request, env: Env): Promise<Response> | Response {
		const url = new URL(req.url);
		if (req.method !== 'POST' || url.pathname !== '/v1/feedback') {
			return jsonResponse({ ok: false, error: 'not_found' }, req, env, 404);
		}
		if (!originIsAllowed(req, env)) return jsonResponse({ ok: false, error: 'forbidden_origin' }, req, env, 403);
		if (parseClientHeader(req)?.product !== APP_PRODUCT_NAME) {
			return jsonResponse({ ok: false, error: 'forbidden_client' }, req, env, 403);
		}
		return handleFeedbackRoute(req, env);
	},
};
