import { handleUsersRequest } from '../server/users.ts';

// Static assets are served directly by Cloudflare; only /api/* reaches here.
export default {
  fetch(request: Request): Promise<Response> {
    return handleUsersRequest(request);
  },
};
