import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleUsersRequest } from '../server/users.ts';
import worker from '../worker/index.ts';

for (const id of [1, 2, 3]) {
  test(`API returns User ${id} without HTTP caching`, async () => {
    const response = await handleUsersRequest(
      new Request(`https://demo.test/api/users/${id}`),
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    const user = await response.json();
    assert.equal(user.id, id);
    assert.equal(typeof user.name, 'string');
  });
}

test('Worker serves the same API and honors the simulated delay', async () => {
  const started = performance.now();
  const response = await worker.fetch(
    new Request('https://demo.test/api/users/2?delay=40'),
  );
  assert.equal(response.status, 200);
  assert.ok(performance.now() - started >= 35);
});

test('unknown API routes and users return JSON 404', async () => {
  for (const path of ['/api/missing', '/api/users/99']) {
    const response = await worker.fetch(
      new Request(`https://demo.test${path}`),
    );
    assert.equal(response.status, 404);
    assert.equal(typeof (await response.json()).error, 'string');
  }
});

test('API rejects mutations and supports HEAD', async () => {
  const url = 'https://demo.test/api/users/1';
  const post = await worker.fetch(new Request(url, { method: 'POST' }));
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('Allow'), 'GET, HEAD');
  const head = await worker.fetch(new Request(url, { method: 'HEAD' }));
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});
