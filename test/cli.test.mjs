import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createClient, creditsText, parseArgs, run, scenesFromText } from '../scripts/gomotion.mjs';

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

const exportedVideo = {
  id: 'v1',
  title: 'Octopus hearts',
  status: 'exported',
  export: {
    jobId: 'j9',
    url: '/api/v1/jobs/j9/download',
    subtitles: { srt: '/api/v1/jobs/j9/subtitles?format=srt', vtt: '/api/v1/jobs/j9/subtitles?format=vtt' },
    attribution: '/api/v1/jobs/j9/attribution',
  },
  links: { studio: 'https://example.test/app/projects/v1' },
};
/** One entry of `GET /jobs/:id/attribution`: a Pixabay photo unless overridden. */
const credit = (over = {}) => ({
  sceneId: 'scene-1',
  sceneNumber: 1,
  sceneTitle: 'Three hearts',
  kind: 'image',
  originKind: 'stock',
  source: 'pixabay',
  sourceName: 'Pixabay',
  name: 'Octopus',
  sourceUrl: 'https://pixabay.com/photos/octopus-1/',
  author: 'Hans',
  authorUrl: 'https://pixabay.com/users/hans-1/',
  license: 'Pixabay Content License',
  licenseUrl: 'https://pixabay.com/service/license-summary/',
  attributionRequired: false,
  ...over,
});
/** `download v1` against a mock client whose attribution answer is `attribution()`. */
async function downloadWith(directory, attribution) {
  const requests = [];
  const client = {
    links: { docs: 'd' },
    async request(method, pathname) {
      requests.push(`${method} ${pathname}`);
      if (pathname === 'videos/v1') return exportedVideo;
      if (pathname === 'jobs/j9/attribution') return attribution();
      throw new Error(`unexpected ${pathname}`);
    },
    async downloadTo(pathname, dir, fallback) {
      const target = path.join(dir, pathname.endsWith('download') ? 'Octopus_hearts-r4.mp4' : fallback);
      await writeFile(target, pathname);
      return target;
    },
  };
  const result = await run(['download', 'v1', '--out', directory, '--formats', 'mp4,srt'], { client });
  return { result, requests };
}

test('download saves the MP4, the captions and CREDITS.txt next to each other', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'gomotion-cli-'));
  try {
    const { result, requests } = await downloadWith(directory, () => [
      credit(),
      credit({
        sceneId: 'scene-2',
        sceneNumber: 2,
        sceneTitle: 'Gills',
        kind: 'video',
        originKind: 'ai',
        source: 'fal',
        sourceName: 'fal',
        name: 'scene-2.mp4',
        sourceUrl: null,
        author: null,
        authorUrl: null,
        license: null,
        licenseUrl: null,
      }),
      credit({
        sceneId: 'scene-5',
        sceneNumber: 5,
        sceneTitle: 'Mars',
        source: 'commons',
        sourceName: 'Wikimedia Commons',
        name: 'PIA16160 Mars sky',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:PIA16160.jpg',
        author: 'NASA/JPL-Caltech/MSSS',
        authorUrl: 'https://commons.wikimedia.org/wiki/File:PIA16160.jpg',
        license: 'Public Domain',
        licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
        attributionRequired: true,
      }),
    ]);
    assert.deepEqual(requests, ['GET videos/v1', 'GET jobs/j9/attribution']);
    assert.equal(path.basename(result.files.mp4), 'Octopus_hearts-r4.mp4');
    assert.equal(path.basename(result.files.srt), 'Octopus_hearts.srt');
    assert.equal(result.files.vtt, undefined);
    assert.equal(await readFile(result.files.srt, 'utf8'), '/api/v1/jobs/j9/subtitles?format=srt');
    assert.equal(path.basename(result.files.credits), 'CREDITS.txt');
    assert.equal(result.attributionRequired, true);
    assert.equal(
      await readFile(result.files.credits, 'utf8'),
      [
        'Picture credits — Octopus hearts',
        '',
        'Credit required (put these lines in the video description):',
        'Scene 5 — Mars: NASA/JPL-Caltech/MSSS via Wikimedia Commons, Public Domain (https://creativecommons.org/publicdomain/mark/1.0/)',
        '',
        'No credit required:',
        'Scene 1 — Three hearts: Hans via Pixabay, Pixabay Content License (https://pixabay.com/service/license-summary/)',
        'Scene 2 — Gills: AI-generated video',
        '',
        'Made with Go Motion — d',
        '',
      ].join('\n')
    );
    assert.match(result.studio, /utm_source=skill$/);
    assert.match(result.madeWith, /^Made with Go Motion/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('download: a server without picture credits (404) still saves the files', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'gomotion-cli-'));
  try {
    const { result } = await downloadWith(directory, () => {
      throw Object.assign(new Error('Endpoint not found'), { extra: { status: 404, errorCode: 'NOT_FOUND' } });
    });
    assert.equal(path.basename(result.files.mp4), 'Octopus_hearts-r4.mp4');
    assert.equal(result.files.credits, null);
    assert.equal(result.attributionRequired, null);
    assert.equal(result.files.vtt, undefined);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('creditsText: the pictures that need a credit line come first; blanks are handled', () => {
  const text = creditsText('Title', [
    credit({ author: null, authorUrl: null, license: null, licenseUrl: null }),
    credit({ sceneNumber: 3, sceneTitle: '', originKind: 'upload', source: 'upload', sourceName: 'upload' }),
  ]);
  assert.equal(
    text,
    [
      'Picture credits — Title',
      '',
      'Credit required (put these lines in the video description):',
      'none',
      '',
      'No credit required:',
      'Scene 1 — Three hearts: Pixabay (https://pixabay.com/photos/octopus-1/)',
      'Scene 3: image uploaded by you',
      '',
    ].join('\n')
  );
  assert.equal(
    creditsText('Title', []),
    'Picture credits — Title\n\nNo pictures from outside sources: nothing to credit.\n'
  );
  assert.equal(creditsText('Title', [], 'Made with Go Motion — d').split('\n').at(-2), 'Made with Go Motion — d');
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
