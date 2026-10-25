import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin, type PreviewServer } from 'vite';
import { handleUsersRequest } from './server/users';

// Share the API implementation with the deployed Worker.
function usersApi(): Plugin {
  const install = (server: Pick<PreviewServer, 'middlewares'>) => {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (!url.pathname.startsWith('/api/')) return next();
      try {
        const response = await handleUsersRequest(
          new Request(url, { method: req.method }),
        );
        res.statusCode = response.status;
        response.headers.forEach((value, name) => {
          res.setHeader(name, value);
        });
        res.end(await response.text());
      } catch (error) {
        next(error instanceof Error ? error : new Error(String(error)));
      }
    });
  };
  return {
    name: 'demo-users-api',
    configureServer: install,
    configurePreviewServer: install,
  };
}
export default defineConfig({ plugins: [react(), usersApi()] });
