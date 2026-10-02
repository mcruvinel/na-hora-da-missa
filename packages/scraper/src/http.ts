import { setTimeout as sleep } from "node:timers/promises";

const USER_AGENT = "HoraDaMissa/1.0 (+https://github.com/mcruvinel/na-hora-da-missa)";
const DEFAULT_INTERVAL_MS = 700;

export class HttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(url: string, status: number) {
    super(`HTTP ${status} em ${url}`);
    this.url = url;
    this.status = status;
  }

  get retryable(): boolean {
    return this.status === 429 || this.status >= 500;
  }
}

export type RequestOptions = {
  retries?: number;
  timeoutMs?: number;
  minIntervalMs?: number;
  query?: Record<string, string>;
};

const nextSlotByHost = new Map<string, number>();

async function waitForSlot(host: string, intervalMs: number): Promise<void> {
  const now = Date.now();
  const slot = Math.max(now, nextSlotByHost.get(host) ?? 0);
  nextSlotByHost.set(host, slot + intervalMs);
  if (slot > now) await sleep(slot - now);
}

export async function request(
  input: string,
  { retries = 3, timeoutMs = 20_000, minIntervalMs = DEFAULT_INTERVAL_MS, query }: RequestOptions = {},
): Promise<{ body: string; headers: Headers }> {
  const url = new URL(input);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(1000 * 2 ** (attempt - 1));
    await waitForSlot(url.host, minIntervalMs);
    try {
      const response = await fetch(url, {
        headers: { "user-agent": USER_AGENT, "accept-language": "pt-BR,pt;q=0.9" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.ok) return { body: await response.text(), headers: response.headers };
      lastError = new HttpError(url.href, response.status);
      if (!(lastError as HttpError).retryable) break;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export async function fetchText(url: string, options?: RequestOptions): Promise<string> {
  return (await request(url, options)).body;
}
