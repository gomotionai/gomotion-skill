import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createClient, parseArgs, run, scenesFromText } from '../scripts/gomotion.mjs';

const envelope = (data, status = 200) =>
  new Response(JSON.stringify({ code: status < 400 ? 0 : -1, message: 'ok', data }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
const failure = (status, message, data) =>
  new Response(JSON.stringify({ code: -1, message, data }), {
    status,
    headers: { 'content-type': 'application/json' },
  });

test('parseArgs reads flags, values and positionals', () => {
  const parsed = parseArgs([
    'plan',
    'abc',
    '--max-credits',
    '10',
    '--wait',
    '--base-url=http://localhost:3007',
    '--dry-run',
  ]);
  assert.deepEqual(parsed.positional, ['plan', 'abc']);
  assert.deepEqual(parsed.flags, {
    maxCredits: '10',
    wait: true,
    baseUrl: 'http://localhost:3007',
    dryRun: true,
  });
});

test('scenesFromText splits paragraphs and keeps headings as titles', () => {
  assert.deepEqual(
    scenesFromText('# Hook\nThree hearts.\nTwo for the gills.\n\nThe body heart stops when it swims.\n'),
    [
      { title: 'Hook', narration: 'Three hearts. Two for the gills.' },
      { narration: 'The body heart stops when it swims.' },
    ]
  );
});

test('createClient refuses to start without a key and explains where to get one', () => {
  assert.throws(
    () => createClient({ apiKey: undefined, env: {} }),
    (error) => {
      assert.equal(error.extra.errorCode, 'NO_API_KEY');
      assert.match(error.extra.links.apiKeys, /settings\/apikeys\?utm_source=skill$/);
      return true;
    }
  );
});

test('requests carry the key and the client header; errors carry hints', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    if (url.endsWith('/me')) return envelope({ balance: 12 });
    if (url.endsWith('/plan'))
      return failure(402, 'Not enough credits.', {
        errorCode: 'INSUFFICIENT_CREDITS',
        credits: 30,
      });
    if (url.endsWith('/export'))
      return failure(409, 'Too expensive.', {
        errorCode: 'QUOTE_EXCEEDS_BUDGET',
        quote: { credits: 5 },
      });
    return failure(401, 'Provide a valid API key', { errorCode: 'AUTH_REQUIRED' });
  };
  const client = createClient({
    apiKey: 'sk_test',
    baseUrl: 'https://example.test/',
    fetchImpl,
    env: { CLAUDECODE: '1' },
  });
  assert.deepEqual(await client.request('GET', 'me'), { balance: 12 });
  assert.equal(calls[0].url, 'https://example.test/api/v1/me');
  assert.equal(calls[0].init.headers.authorization, 'Bearer sk_test');
  assert.match(calls[0].init.headers['x-gomotion-client'], /^skill\/\d+\.\d+\.\d+ claude-code$/);

  await assert.rejects(client.request('POST', 'videos/x/plan', { maxCredits: 30 }), (error) => {
    assert.equal(error.extra.errorCode, 'INSUFFICIENT_CREDITS');
    assert.equal(error.extra.status, 402);
    assert.match(error.extra.hint, /needs 30.*pricing\?utm_source=skill/);
    return true;
  });
  assert.equal(calls[1].init.headers['content-type'], 'application/json');
  assert.equal(calls[1].init.body, '{"maxCredits":30}');
  await assert.rejects(client.request('POST', 'videos/x/export', { maxCredits: 1 }), (error) => {
    assert.equal(error.extra.errorCode, 'QUOTE_EXCEEDS_BUDGET');
    assert.match(error.extra.hint, /--max-credits 5/);
    return true;
  });
  await assert.rejects(client.request('GET', 'videos'), (error) => {
    assert.equal(error.extra.status, 401);
    assert.match(error.extra.hint, /settings\/apikeys/);
    return true;
  });
});

test('run: create quotes the next step; paid commands need consent flags', async () => {
  const requests = [];
  const client = {
    links: { pricing: 'p', docs: 'd' },
    async request(method, pathname, body) {
      requests.push({ method, pathname, body });
      if (pathname === 'videos') return { id: 'v1', status: 'review' };
      if (pathname === 'videos/v1/plan')
        return body.dryRun ? { quote: { credits: 10 }, balance: 50, enough: true } : { job: { id: 'j1' } };
      if (pathname === 'videos/v1/produce') return { quote: { credits: 30 }, balance: 50, enough: true };
      throw new Error(`unexpected ${pathname}`);
    },
  };
  const created = await run(['create', '--idea', 'Octopus hearts', '--duration', '45', '--ratio', '9:16'], { client });
  assert.equal(created.video.id, 'v1');
  assert.equal(created.planQuote.quote.credits, 10);
  assert.match(created.nextStep, /^plan v1 --max-credits/);
  assert.deepEqual(requests[0], {
    method: 'POST',
    pathname: 'videos',
    body: { settings: { durationSeconds: 45, aspectRatio: '9:16' }, idea: 'Octopus hearts' },
  });
  assert.deepEqual(requests[1].body, { dryRun: true });

  await assert.rejects(run(['plan', 'v1'], { client }), (error) => {
    assert.equal(error.exitCode, 2);
    assert.match(error.message, /--max-credits/);
    return true;
  });
  const started = await run(['plan', 'v1', '--max-credits', '10', '--idempotency-key', 'skill-plan-0001'], { client });
  assert.equal(started.job.id, 'j1');
  assert.deepEqual(requests.at(-1).body, { maxCredits: 10, idempotencyKey: 'skill-plan-0001' });

  const fromScript = await run(['create', '--scenes', new URL('./fixtures.json', import.meta.url).pathname], {
    client,
  }).catch((error) => error);
  assert.ok(fromScript instanceof Error, 'a missing scenes file is reported');
});

test('download saves the MP4 and captions next to each other', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'gomotion-cli-'));
  try {
    const client = {
      links: { docs: 'd' },
      async request(method, pathname) {
        assert.equal(pathname, 'videos/v1');
        return {
          id: 'v1',
          title: 'Octopus hearts',
          status: 'exported',
          export: {
            url: '/api/v1/jobs/j9/download',
            subtitles: { srt: '/api/v1/jobs/j9/subtitles?format=srt', vtt: '/api/v1/jobs/j9/subtitles?format=vtt' },
          },
          links: { studio: 'https://example.test/app/projects/v1' },
        };
      },
      async downloadTo(pathname, dir, fallback) {
        const target = path.join(dir, pathname.endsWith('download') ? 'Octopus_hearts-r4.mp4' : fallback);
        await (await import('node:fs/promises')).writeFile(target, pathname);
        return target;
      },
    };
    const result = await run(['download', 'v1', '--out', directory, '--formats', 'mp4,srt'], { client });
    assert.equal(path.basename(result.files.mp4), 'Octopus_hearts-r4.mp4');
    assert.equal(path.basename(result.files.srt), 'Octopus_hearts.srt');
    assert.equal(result.files.vtt, undefined);
    assert.equal(await readFile(result.files.srt, 'utf8'), '/api/v1/jobs/j9/subtitles?format=srt');
    assert.match(result.studio, /utm_source=skill$/);
    assert.match(result.madeWith, /^Made with Go Motion/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('a 429 is retried after Retry-After, then surfaced', async () => {
  let calls = 0;
  const limited = () =>
    new Response(JSON.stringify({ code: -1, message: 'Too many requests.', data: { errorCode: 'RATE_LIMITED' } }), {
      status: 429,
      headers: { 'content-type': 'application/json', 'retry-after': '1' },
    });
  const client = createClient({
    apiKey: 'sk_test',
    baseUrl: 'https://example.test',
    env: {},
    fetchImpl: async () => (++calls === 1 ? limited() : envelope({ ok: true })),
  });
  assert.deepEqual(await client.request('POST', 'videos/x/plan', { dryRun: true }), { ok: true });
  assert.equal(calls, 2);
  calls = 0;
  const stubborn = createClient({
    apiKey: 'sk_test',
    baseUrl: 'https://example.test',
    env: {},
    fetchImpl: async () => {
      calls++;
      return limited();
    },
  });
  await assert.rejects(stubborn.request('POST', 'videos/x/plan', { dryRun: true }), (error) => {
    assert.equal(error.extra.errorCode, 'RATE_LIMITED');
    assert.match(error.extra.hint, /Wait a moment/);
    return true;
  });
  assert.equal(calls, 3);
});
