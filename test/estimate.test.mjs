import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { DEFAULT_PRICES, SPEECH_RATES, estimateScenes, run } from '../scripts/gomotion.mjs';

const example = JSON.parse(
  readFileSync(new URL('../examples/why-the-sky-is-blue/scenes.json', import.meta.url), 'utf8')
);
const untrimmed = [
  ...example.slice(0, 1),
  { ...example[1], narration: `${example[1].narration} This is called Rayleigh scattering.` },
  ...example.slice(2),
];

test('the example script is one started minute; with the sentence it lost it was two', () => {
  const trimmed = estimateScenes(example, { language: 'en' });
  assert.equal(trimmed.scenes.length, 5);
  assert.equal(trimmed.scenes[0].id, 'scene-1');
  assert.equal(trimmed.scenes[1].words, 37);
  assert.ok(trimmed.totalSeconds > 57 && trimmed.totalSeconds < 60, `got ${trimmed.totalSeconds}`);
  assert.equal(trimmed.startedMinutes, 1);
  assert.deepEqual(trimmed.credits, { produce: 30, export: 5, total: 35 });
  assert.match(trimmed.advice[0], /under the 1-minute mark/);

  const longer = estimateScenes(untrimmed, { language: 'en', targetSeconds: 60 });
  assert.ok(longer.totalSeconds > 60 && longer.totalSeconds < 62, `got ${longer.totalSeconds}`);
  assert.equal(longer.startedMinutes, 2);
  assert.deepEqual(longer.credits, { produce: 60, export: 10, total: 70 });
  assert.match(longer.advice[0], /over the 1-minute mark.*pay for 2 minutes.*Cut at least \d+ characters \(about \d+ words\)/);
});

test('rates and prices can come from the live table; Chinese counts characters', () => {
  const zh = estimateScenes([{ narration: '天空为什么是蓝色的，一分钟讲清楚。' }], { language: 'zh' });
  assert.equal(zh.rates.planningUnit, 'characters');
  assert.equal(zh.scenes[0].chars, 17);
  assert.equal(zh.scenes[0].words, null);
  assert.equal(zh.scenes[0].seconds, 2.7);
  assert.equal(SPEECH_RATES.zh.charsPerMinute, 375);

  const live = estimateScenes(example, {
    language: 'en',
    rates: { charsPerMinute: 1900, wordsPerMinute: 300 },
    prices: { generatePerMinute: 40, exportPerMinute: 6 },
  });
  assert.equal(live.rates.charsPerMinute, 1900);
  assert.ok(live.totalSeconds < 31, `got ${live.totalSeconds}`);
  assert.deepEqual(live.credits, { produce: 40, export: 6, total: 46 });

  const empty = estimateScenes([], { language: 'en', targetSeconds: 60, includePlan: true });
  assert.equal(empty.startedMinutes, 0);
  assert.deepEqual(empty.credits, { plan: DEFAULT_PRICES.scriptPlanPerMinute, produce: 0, export: 0, total: 10 });
  assert.match(empty.advice[0], /No narration yet/);
  // Without the script step ahead (a file, or a planned video) there is no plan line.
  assert.deepEqual(estimateScenes([], { language: 'en', targetSeconds: 60 }).credits, { produce: 0, export: 0, total: 0 });
});

test('estimate on a file needs no key; a videoId or --live asks the server', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'gomotion-estimate-'));
  try {
    const file = path.join(directory, 'notes.txt');
    await writeFile(file, '# Hook\nThree hearts, two for the gills.\n\nThe body heart stops when it swims.\n');
    const offline = await run(['estimate', file, '--language', 'en', '--duration', '30'], { env: {} });
    assert.equal(offline.source, 'file');
    assert.equal(offline.ratesSource, 'built-in');
    assert.equal(offline.scenes.length, 2);
    assert.equal(offline.scenes[0].title, 'Hook');
    assert.equal(offline.credits.plan, undefined, 'a file is the user\'s own script: no plan step');
    assert.match(offline.advice[0], /shorter than the 30 s target/);

    const requests = [];
    const client = {
      links: {},
      async request(method, pathname) {
        requests.push(pathname);
        if (pathname === 'capabilities')
          return {
            languages: [{ code: 'en', charsPerMinute: 980, wordsPerMinute: 170, planningUnit: 'words' }],
            prices: { scriptPlanPerMinute: 10, generatePerMinute: 30, exportPerMinute: 5 },
          };
        if (pathname === 'videos/v1')
          return { id: 'v1', status: 'review', settings: { language: 'en', durationSeconds: 60 }, scenes: example };
        if (pathname === 'videos/v0')
          return { id: 'v0', status: 'review', settings: { language: 'en', durationSeconds: 60 }, scenes: [] };
        throw new Error(`unexpected ${pathname}`);
      },
    };
    const live = await run(['estimate', 'v1'], { client });
    assert.deepEqual(requests, ['capabilities', 'videos/v1']);
    assert.equal(live.source, 'video');
    assert.equal(live.ratesSource, 'live');
    assert.equal(live.status, 'review');
    assert.deepEqual(live.credits, { produce: 30, export: 5, total: 35 }, 'the script is written: no plan line');

    const unplanned = await run(['estimate', 'v0'], { client });
    assert.deepEqual(unplanned.credits, { plan: 10, produce: 0, export: 0, total: 10 });
    assert.match(unplanned.advice[0], /No narration yet/);

    const liveFile = await run(['estimate', file, '--live'], { client });
    assert.equal(liveFile.source, 'file');
    assert.equal(liveFile.ratesSource, 'live');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
