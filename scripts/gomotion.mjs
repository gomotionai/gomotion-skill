#!/usr/bin/env node
/**
 * gomotion — a zero-dependency client for the Go Motion public API
 * (https://gomotion-ai.app/api/v1). Node 18 or newer, no install step.
 *
 * Every command prints one JSON document to stdout so agents can parse it;
 * progress lines go to stderr. Paid steps (plan, produce, export) need
 * --max-credits (the most credits you accept) or --dry-run (the quote only).
 *
 * Environment: GOMOTION_API_KEY (required), GOMOTION_BASE_URL (optional).
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const VERSION = '0.2.1';
const DEFAULT_BASE_URL = 'https://gomotion-ai.app';
const UTM = 'utm_source=skill';
const TERMINAL = new Set(['review', 'ready', 'exported', 'failed']);
const JOB_TERMINAL = new Set(['succeeded', 'failed', 'canceled']);

const usage = `gomotion ${VERSION} — make narrated, captioned videos with Go Motion

Usage: node scripts/gomotion.mjs <command> [options]

Account
  me                                  Balance, limits and links
  capabilities                        Prices per minute and what is configured
  voices [--language en]              Voices for a language
  styles                              Script writing styles

Videos
  list [--status draft|active]        Your videos
  create --idea "..." [options]       Draft from an idea (free), then prints the planning quote
  create --script notes.txt [options] Draft from your own script (free; blank lines split scenes)
  create --scenes scenes.json         Draft from scenes: [{ "title"?: "", "narration": "" }]
      options: --title "..." --duration 60 --ratio 16:9|9:16 --language en
               --voice <id> --style <id> --theme <id> --captions <preset>
  get <videoId>                       Status, scenes, jobs and the latest export
  plan <videoId> --max-credits N      Write the script (paid); --dry-run for the quote
  script get <videoId>                The scenes as JSON
  script set <videoId> <file>         Replace the scenes (free): scenes.json or script.txt
  estimate <file | videoId>           Seconds per scene, started minutes and credits before you pay
      options: --language en --duration 60 --live   (a file needs no key unless --live)
  produce <videoId> --max-credits N   Voice, captions and footage (paid); --dry-run for the quote
  export <videoId> --max-credits N    Render the 1080p MP4 (paid); --dry-run for the quote
  status <videoId> [--wait]           Poll until the current step finishes
  download <videoId> [--out dir]      Save the MP4 and captions (default ./gomotion)
  delete <videoId>

Jobs
  job <jobId> [--wait]                One job
  cancel <jobId>                      Cancel a queued or running job (refunded before paid work)

Options
  --wait            With plan/produce/export: poll until the step finishes
  --interval 3      Seconds between polls
  --idempotency-key Reuse one key to retry the same paid request safely
  --base-url URL    Override GOMOTION_BASE_URL
  --live            With estimate <file>: use the server's rates and prices, not the built-in table

Environment: GOMOTION_API_KEY (required), GOMOTION_BASE_URL (default ${DEFAULT_BASE_URL})
Docs: ${DEFAULT_BASE_URL}/how-it-works/agent-skill?${UTM}
`;

class CliError extends Error {
  constructor(message, extra = {}, exitCode = 1) {
    super(message);
    this.extra = extra;
    this.exitCode = exitCode;
  }
}

/** --flag value, --flag=value, --bool; positionals in order. */
export function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const eq = arg.indexOf('=');
    const name = (eq > 0 ? arg.slice(2, eq) : arg.slice(2)).replace(
      /-([a-z])/g,
      (_, c) => c.toUpperCase()
    );
    if (eq > 0) flags[name] = arg.slice(eq + 1);
    else if (i + 1 < argv.length && !argv[i + 1].startsWith('--'))
      flags[name] = argv[++i];
    else flags[name] = true;
  }
  return { flags, positional };
}

const agentName = (env = process.env) =>
  env.CLAUDECODE || env.CLAUDE_CODE
    ? 'claude-code'
    : env.CODEX_SANDBOX || env.CODEX_HOME || env.CODEX_THREAD_ID
      ? 'codex'
      : env.CURSOR_AGENT || env.CURSOR_TRACE_ID
        ? 'cursor'
        : 'unknown';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createClient({
  baseUrl = process.env.GOMOTION_BASE_URL || DEFAULT_BASE_URL,
  apiKey = process.env.GOMOTION_API_KEY,
  fetchImpl = globalThis.fetch,
  env = process.env,
} = {}) {
  const base = baseUrl.replace(/\/+$/, '');
  const link = (p) => `${base}${p}${p.includes('?') ? '&' : '?'}${UTM}`;
  const links = {
    signUp: link('/sign-up'),
    apiKeys: link('/settings/apikeys'),
    pricing: link('/pricing'),
    docs: link('/how-it-works/agent-skill'),
  };
  if (!apiKey)
    throw new CliError(
      'GOMOTION_API_KEY is not set. Create a key under Settings → API keys and export it in your shell (never paste it into the chat).',
      { errorCode: 'NO_API_KEY', links }
    );
  const headers = {
    authorization: `Bearer ${apiKey}`,
    'x-gomotion-client': `skill/${VERSION} ${agentName(env)}`,
    accept: 'application/json',
  };

  async function request(method, pathname, body, extraHeaders = {}, attempt = 0) {
    const init = { method, headers: { ...headers, ...extraHeaders } };
    if (body !== undefined) {
      init.headers['content-type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    let response;
    try {
      response = await fetchImpl(`${base}/api/v1/${pathname}`, init);
    } catch (error) {
      throw new CliError(
        `Could not reach ${base}: ${error.message}. If you run inside the Codex sandbox, allow network access for this command.`,
        { errorCode: 'NETWORK', cause: error.message }
      );
    }
    // Writes with one key are spaced by the server; a quote followed at once
    // by the real request can hit that. Wait as told and try once more.
    if (response.status === 429 && attempt < 2) {
      const seconds = Math.min(5, Math.max(1, Number(response.headers.get('retry-after')) || 1));
      await sleep(seconds * 1000);
      return request(method, pathname, body, extraHeaders, attempt + 1);
    }
    const text = await response.text();
    let envelope;
    try {
      envelope = JSON.parse(text);
    } catch {
      throw new CliError(`Unexpected answer (${response.status}) from ${base}`, {
        errorCode: 'BAD_RESPONSE',
        status: response.status,
        body: text.slice(0, 500),
      });
    }
    if (!response.ok || envelope.code !== 0) {
      const data = envelope.data ?? {};
      const errorCode = data.errorCode ?? `HTTP_${response.status}`;
      const hint =
        response.status === 401
          ? `The API key was refused. Create or copy a key at ${links.apiKeys}`
          : response.status === 402
            ? `Not enough credits (needs ${data.credits ?? '?'}). Buy credits at ${links.pricing}`
            : errorCode === 'QUOTE_EXCEEDS_BUDGET'
              ? `The quote is ${data.quote?.credits} credits; ask the user whether to continue with --max-credits ${data.quote?.credits}.`
              : errorCode === 'RATE_LIMITED'
                ? 'Wait a moment and send the request again.'
                : undefined;
      throw new CliError(envelope.message ?? `HTTP ${response.status}`, {
        errorCode,
        status: response.status,
        data,
        ...(hint ? { hint } : {}),
        links,
      });
    }
    return envelope.data;
  }

  /** Follow the download redirect and save the bytes; the key never travels to the bucket. */
  async function downloadTo(pathname, directory, fallbackName) {
    const response = await fetchImpl(`${base}${pathname}`, {
      headers: { authorization: headers.authorization },
      redirect: 'follow',
    });
    if (!response.ok) {
      let message = `Download failed (${response.status})`;
      try {
        message = JSON.parse(await response.text()).message ?? message;
      } catch {
        /* not JSON */
      }
      throw new CliError(message, { errorCode: 'DOWNLOAD_FAILED', status: response.status });
    }
    const disposition = response.headers.get('content-disposition') ?? '';
    const match = /filename="([^"]+)"/.exec(disposition);
    const name = (match?.[1] ?? fallbackName).replace(/[\\/]/g, '_');
    await mkdir(directory, { recursive: true });
    const target = path.join(directory, name);
    await writeFile(target, Buffer.from(await response.arrayBuffer()));
    return target;
  }

  return { base, links, request, downloadTo };
}

const progress = (line) => process.stderr.write(`[gomotion] ${line}\n`);

async function waitForVideo(client, id, intervalSeconds) {
  let last = '';
  for (;;) {
    const video = await client.request('GET', `videos/${id}`);
    const job = video.activeJob;
    const line = job
      ? `${video.status} ${job.progress ?? 0}% (${job.stage})`
      : video.status;
    if (line !== last) progress(line);
    last = line;
    if (TERMINAL.has(video.status)) return video;
    await sleep(intervalSeconds * 1000);
  }
}
async function waitForJob(client, id, intervalSeconds) {
  let last = '';
  for (;;) {
    const job = await client.request('GET', `jobs/${id}`);
    const line = `${job.type} ${job.status} ${job.progress ?? 0}% (${job.stage})`;
    if (line !== last) progress(line);
    last = line;
    if (JOB_TERMINAL.has(job.status)) return job;
    await sleep(intervalSeconds * 1000);
  }
}

/** Blank lines separate scenes; a line ending in ":" or a "# heading" names the next scene. */
export function scenesFromText(text) {
  const blocks = text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split('\n');
    const heading = /^#+\s*(.+)$/.exec(lines[0]);
    if (heading && lines.length > 1)
      return { title: heading[1].trim(), narration: lines.slice(1).join(' ').trim() };
    return { narration: lines.join(' ').trim() };
  });
}
async function scenesFromFile(file) {
  const text = await readFile(file, 'utf8');
  if (file.endsWith('.json')) {
    const parsed = JSON.parse(text);
    const scenes = Array.isArray(parsed) ? parsed : parsed.scenes;
    if (!Array.isArray(scenes) || !scenes.length)
      throw new CliError(`${file} must hold a scenes array`, { errorCode: 'USAGE' }, 2);
    return scenes.map((scene) => ({
      ...(scene.id ? { id: String(scene.id) } : {}),
      ...(scene.title ? { title: String(scene.title) } : {}),
      narration: String(scene.narration ?? ''),
    }));
  }
  const scenes = scenesFromText(text);
  if (!scenes.length)
    throw new CliError(`${file} has no narration`, { errorCode: 'USAGE' }, 2);
  return scenes;
}

/**
 * Speech rates of each language's default voice as Go Motion measured them
 * (2026-10-26, the same passage read in every language). `capabilities` →
 * `languages[]` publishes the live table; this copy lets `estimate` work with
 * no key and no request.
 */
export const SPEECH_RATES = {
  en: { charsPerMinute: 980, wordsPerMinute: 170 },
  nl: { charsPerMinute: 1090, wordsPerMinute: 181 },
  fr: { charsPerMinute: 1340, wordsPerMinute: 222 },
  de: { charsPerMinute: 1040, wordsPerMinute: 167 },
  hi: { charsPerMinute: 910, wordsPerMinute: 179 },
  id: { charsPerMinute: 1420, wordsPerMinute: 204 },
  it: { charsPerMinute: 1340, wordsPerMinute: 232 },
  pl: { charsPerMinute: 760, wordsPerMinute: 111 },
  pt: { charsPerMinute: 1000, wordsPerMinute: 180 },
  ru: { charsPerMinute: 840, wordsPerMinute: 128 },
  es: { charsPerMinute: 1000, wordsPerMinute: 189 },
  sv: { charsPerMinute: 920, wordsPerMinute: 152 },
  tr: { charsPerMinute: 970, wordsPerMinute: 132 },
  uk: { charsPerMinute: 910, wordsPerMinute: 134 },
  zh: { charsPerMinute: 375, wordsPerMinute: 375, planningUnit: 'characters' },
};
/** Credits per started minute of the three paid steps; `capabilities` → `prices` is authoritative. */
export const DEFAULT_PRICES = { scriptPlanPerMinute: 10, generatePerMinute: 30, exportPerMinute: 5 };
/** Seconds to keep under a minute mark: the voice and the transitions can add a few. */
const SAFETY_SECONDS = 5;

const round1 = (n) => Math.round(n * 10) / 10;

/**
 * The arithmetic behind a quote, before any request: seconds per scene at the
 * language's character rate, the started minutes a quote rounds to, the credits
 * of each step at those minutes, and what to cut when the script sits just over
 * a minute mark. The server's quote (`--dry-run`) stays authoritative.
 */
export function estimateScenes(
  scenes,
  { language = 'en', rates, prices, targetSeconds, includePlan = false } = {}
) {
  const rate = rates ?? SPEECH_RATES[language] ?? SPEECH_RATES.en;
  const unit = rate.planningUnit ?? 'words';
  const price = { ...DEFAULT_PRICES, ...(prices ?? {}) };
  let total = 0;
  let totalChars = 0;
  let totalWords = 0;
  const perScene = scenes.map((scene, index) => {
    const text = String(scene.narration ?? '').trim();
    const words = unit === 'characters' ? null : text ? text.split(/\s+/).length : 0;
    const seconds = (text.length / rate.charsPerMinute) * 60;
    total += seconds;
    totalChars += text.length;
    totalWords += words ?? 0;
    return {
      id: scene.id ?? `scene-${index + 1}`,
      ...(scene.title ? { title: scene.title } : {}),
      chars: text.length,
      words,
      seconds: round1(seconds),
    };
  });
  const minutes = total > 0 ? Math.max(1, Math.ceil(total / 60)) : 0;
  // The script step is only ahead of a draft that has no scenes yet; a file is
  // the user's own script and a planned video has paid for its script already.
  const credits = {
    ...(includePlan && targetSeconds
      ? { plan: Math.max(1, Math.ceil(targetSeconds / 60)) * price.scriptPlanPerMinute }
      : {}),
    produce: minutes * price.generatePerMinute,
    export: minutes * price.exportPerMinute,
  };
  credits.total = (credits.plan ?? 0) + credits.produce + credits.export;

  const advice = [];
  const charsFor = (seconds) => Math.ceil((seconds / 60) * rate.charsPerMinute);
  const charsPerWord = totalWords > 0 ? totalChars / totalWords : 0;
  const inWords = (chars) =>
    unit === 'characters' || !charsPerWord
      ? `${chars} characters`
      : `${chars} characters (about ${Math.ceil(chars / charsPerWord)} words)`;
  if (minutes === 0) {
    advice.push('No narration yet. Plan the script first, or write the scenes.');
  } else if (minutes > 1 && total - (minutes - 1) * 60 <= 12) {
    const over = total - (minutes - 1) * 60;
    advice.push(
      `${round1(over)} s over the ${minutes - 1}-minute mark, so production and export pay for ${minutes} minutes. ` +
        `Cut at least ${inWords(charsFor(over) + 1)} to get under it; ${inWords(charsFor(over + SAFETY_SECONDS))} leaves a ${SAFETY_SECONDS}-second margin.`
    );
  } else if (minutes * 60 - total < SAFETY_SECONDS) {
    advice.push(
      `Only ${round1(minutes * 60 - total)} s under the ${minutes}-minute mark; the voice and the transitions can push the timeline over it. ` +
        `Cut ${inWords(charsFor(SAFETY_SECONDS - (minutes * 60 - total)))} to keep a ${SAFETY_SECONDS}-second margin.`
    );
  }
  if (targetSeconds && minutes > 0 && total < targetSeconds * 0.8)
    advice.push(
      `About ${round1(targetSeconds - total)} s shorter than the ${targetSeconds} s target; there is room for an example or a closing line.`
    );

  return {
    language,
    rates: {
      charsPerMinute: rate.charsPerMinute,
      wordsPerMinute: rate.wordsPerMinute,
      planningUnit: unit,
    },
    scenes: perScene,
    totalSeconds: round1(total),
    startedMinutes: minutes,
    credits,
    advice,
    note: "Estimated at the measured rate of the language's default voice; the server's quote (plan, produce or export with --dry-run) is authoritative.",
  };
}

const paidBody = (flags, action) => {
  if (flags.dryRun) return { dryRun: true };
  const max = Number(flags.maxCredits);
  if (!Number.isInteger(max) || max < 0)
    throw new CliError(
      `${action} needs --max-credits <credits you accept> or --dry-run for the quote.`,
      { errorCode: 'USAGE' },
      2
    );
  return {
    maxCredits: max,
    ...(flags.idempotencyKey ? { idempotencyKey: String(flags.idempotencyKey) } : {}),
  };
};
const settingsFrom = (flags) => {
  const settings = {};
  if (flags.duration !== undefined) settings.durationSeconds = Number(flags.duration);
  if (flags.ratio) settings.aspectRatio = String(flags.ratio);
  if (flags.language) settings.language = String(flags.language);
  if (flags.voice) settings.voice = String(flags.voice);
  if (flags.theme) settings.theme = String(flags.theme);
  if (flags.captions) settings.captionPresetId = String(flags.captions);
  return settings;
};
const requireId = (positional, index, what) => {
  const value = positional[index];
  if (!value) throw new CliError(`Missing ${what}`, { errorCode: 'USAGE' }, 2);
  return value;
};

/** `estimate <file | videoId>`: a file is arithmetic on the built-in table unless --live; a draft on the server brings its own scenes, language and target. */
async function estimate(rest, flags, clientFor) {
  const target = requireId(rest, 0, 'file or videoId');
  const targetSeconds = flags.duration !== undefined ? Number(flags.duration) : undefined;
  const isFile = existsSync(target);
  if (isFile && !flags.live) {
    const language = String(flags.language ?? 'en');
    return {
      source: 'file',
      file: target,
      ratesSource: 'built-in',
      ...estimateScenes(await scenesFromFile(target), { language, targetSeconds }),
    };
  }
  const client = clientFor();
  const capabilities = await client.request('GET', 'capabilities');
  const liveRates = (code) => {
    const entry = capabilities.languages?.find((language) => language.code === code);
    return entry?.charsPerMinute ? entry : undefined;
  };
  if (isFile) {
    const language = String(flags.language ?? 'en');
    const rates = liveRates(language);
    return {
      source: 'file',
      file: target,
      ratesSource: rates ? 'live' : 'built-in',
      ...estimateScenes(await scenesFromFile(target), {
        language,
        rates,
        prices: capabilities.prices,
        targetSeconds,
      }),
    };
  }
  const video = await client.request('GET', `videos/${target}`);
  const language = String(flags.language ?? video.settings?.language ?? 'en');
  const rates = liveRates(language);
  return {
    source: 'video',
    videoId: video.id,
    status: video.status,
    ratesSource: rates ? 'live' : 'built-in',
    ...estimateScenes(video.scenes ?? [], {
      language,
      rates,
      prices: capabilities.prices,
      targetSeconds: targetSeconds ?? video.settings?.durationSeconds,
      includePlan: !(video.scenes?.length > 0),
    }),
  };
}

export async function run(argv, { client: given, env = process.env } = {}) {
  const { flags, positional } = parseArgs(argv);
  const [command, ...rest] = positional;
  if (!command || command === 'help' || flags.help) return { usage };
  const interval = Math.max(1, Number(flags.interval) || 3);
  const clientFor = () =>
    given ??
    createClient({
      baseUrl: flags.baseUrl ? String(flags.baseUrl) : undefined,
      env,
    });
  // A file estimate is arithmetic on the built-in table: no key, no request.
  if (command === 'estimate') return estimate(rest, flags, clientFor);
  const client = clientFor();
  const paid = async (action, id, extra = {}) => {
    const body = { ...paidBody(flags, action), ...extra };
    const result = await client.request('POST', `videos/${id}/${action}`, body);
    if (body.dryRun) return { action, videoId: id, ...result, links: client.links };
    if (flags.wait) {
      const video = await waitForVideo(client, id, interval);
      return { action, job: result.job, video };
    }
    return { action, ...result };
  };

  switch (command) {
    case 'me':
      return client.request('GET', 'me');
    case 'capabilities':
      return client.request('GET', 'capabilities');
    case 'voices':
      return client.request(
        'GET',
        `voices?language=${encodeURIComponent(String(flags.language ?? 'en'))}`
      );
    case 'styles':
      return client.request('GET', 'styles');
    case 'list':
      return client.request(
        'GET',
        flags.status ? `videos?status=${encodeURIComponent(String(flags.status))}` : 'videos'
      );
    case 'create': {
      const body = { settings: settingsFrom(flags) };
      if (flags.title) body.title = String(flags.title);
      if (flags.style) body.styleId = String(flags.style);
      if (flags.idea) body.idea = String(flags.idea);
      else if (flags.script || flags.scenes)
        body.scenes = await scenesFromFile(String(flags.script ?? flags.scenes));
      else
        throw new CliError(
          'create needs --idea "…", --script file.txt or --scenes scenes.json',
          { errorCode: 'USAGE' },
          2
        );
      const video = await client.request('POST', 'videos', body);
      const next = body.idea
        ? {
            planQuote: await client.request('POST', `videos/${video.id}/plan`, {
              dryRun: true,
            }),
            nextStep: `plan ${video.id} --max-credits <quote.credits>`,
          }
        : {
            produceQuote: await client.request('POST', `videos/${video.id}/produce`, {
              dryRun: true,
            }),
            nextStep: `produce ${video.id} --max-credits <quote.credits>`,
          };
      return { video, ...next };
    }
    case 'get':
      return client.request('GET', `videos/${requireId(rest, 0, 'videoId')}`);
    case 'status': {
      const id = requireId(rest, 0, 'videoId');
      return flags.wait
        ? waitForVideo(client, id, interval)
        : client.request('GET', `videos/${id}`);
    }
    case 'plan':
      return paid('plan', requireId(rest, 0, 'videoId'));
    case 'produce':
      return paid('produce', requireId(rest, 0, 'videoId'));
    case 'export':
      return paid('export', requireId(rest, 0, 'videoId'));
    case 'script': {
      const [sub, id, file] = rest;
      if (sub === 'get') {
        const video = await client.request('GET', `videos/${requireId(rest, 1, 'videoId')}`);
        return { videoId: video.id, status: video.status, scenes: video.scenes };
      }
      if (sub === 'set') {
        requireId(rest, 1, 'videoId');
        if (!file) throw new CliError('script set needs a file', { errorCode: 'USAGE' }, 2);
        return client.request('PATCH', `videos/${id}/scenes`, {
          scenes: await scenesFromFile(file),
        });
      }
      throw new CliError('script needs "get <videoId>" or "set <videoId> <file>"', { errorCode: 'USAGE' }, 2);
    }
    case 'job': {
      const id = requireId(rest, 0, 'jobId');
      return flags.wait ? waitForJob(client, id, interval) : client.request('GET', `jobs/${id}`);
    }
    case 'cancel':
      return client.request('POST', `jobs/${requireId(rest, 0, 'jobId')}/cancel`, {});
    case 'delete':
      return client.request('DELETE', `videos/${requireId(rest, 0, 'videoId')}`);
    case 'download': {
      const id = requireId(rest, 0, 'videoId');
      const video = await client.request('GET', `videos/${id}`);
      if (!video.export)
        throw new CliError(
          `No finished export for ${id} yet (status: ${video.status}). Run export first, then status --wait.`,
          { errorCode: 'NOT_EXPORTED', status: video.status }
        );
      const directory = path.resolve(String(flags.out ?? 'gomotion'));
      const formats = String(flags.formats ?? 'mp4,srt,vtt').split(',');
      const stem = (video.title || 'video').replace(/[^\w.-]+/g, '_');
      const files = {};
      if (formats.includes('mp4'))
        files.mp4 = await client.downloadTo(video.export.url, directory, `${stem}.mp4`);
      for (const format of ['srt', 'vtt'])
        if (formats.includes(format))
          try {
            files[format] = await client.downloadTo(
              video.export.subtitles[format],
              directory,
              `${stem}.${format}`
            );
          } catch (error) {
            files[format] = null;
            progress(`${format}: ${error.message}`);
          }
      return {
        videoId: id,
        title: video.title,
        files,
        studio: `${video.links.studio}?${UTM}`,
        madeWith: `Made with Go Motion — ${client.links.docs}`,
      };
    }
    default:
      throw new CliError(`Unknown command "${command}"\n\n${usage}`, { errorCode: 'USAGE' }, 2);
  }
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname;
if (isMain) {
  run(process.argv.slice(2))
    .then((result) => {
      if (result && typeof result === 'object' && 'usage' in result) {
        process.stdout.write(result.usage);
        return;
      }
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    })
    .catch((error) => {
      const payload =
        error instanceof CliError
          ? { error: { message: error.message, ...error.extra } }
          : { error: { message: error?.message ?? String(error), errorCode: 'UNEXPECTED' } };
      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
      process.exitCode = error instanceof CliError ? error.exitCode : 1;
    });
}
