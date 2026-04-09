import type { NetworkRequestEntry } from './types';
import { filterSensitiveData } from './sensitiveFilter';

const MAX_ENTRIES = 100;
const capturedRequests: NetworkRequestEntry[] = [];
let capturing = false;

let originalFetch: typeof window.fetch;
let originalXHROpen: typeof XMLHttpRequest.prototype.open;
let originalXHRSend: typeof XMLHttpRequest.prototype.send;

function addEntry(entry: NetworkRequestEntry) {
  capturedRequests.push(entry);
  while (capturedRequests.length > MAX_ENTRIES) {
    capturedRequests.shift();
  }
}

function safeFilterBody(body: unknown): string | undefined {
  if (body == null) return undefined;
  if (typeof body === 'string') {
    if (body.length > 2048) return filterSensitiveData(body.slice(0, 2048)) + '...[truncated]';
    return filterSensitiveData(body);
  }
  if (body instanceof URLSearchParams) return filterSensitiveData(body.toString());
  if (body instanceof FormData) return '[FormData]';
  if (body instanceof Blob) return `[Blob ${body.size}B]`;
  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return `[Binary ${(body as ArrayBuffer).byteLength ?? (body as DataView).byteLength}B]`;
  return undefined;
}

function installFetchIntercept() {
  originalFetch = window.fetch;

  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const startMs = Date.now();
    const method = init?.method?.toUpperCase() || 'GET';
    const url = filterSensitiveData(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    const requestBody = safeFilterBody(init?.body);

    return originalFetch.call(window, input, init).then(
      (response) => {
        addEntry({
          method,
          url,
          status: response.status,
          duration: Date.now() - startMs,
          timestampMs: startMs,
          requestBody,
          responseType: response.headers.get('content-type') || undefined,
        });
        return response;
      },
      (err) => {
        addEntry({
          method,
          url,
          status: null,
          duration: Date.now() - startMs,
          timestampMs: startMs,
          requestBody,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      },
    );
  };
}

function installXHRIntercept() {
  originalXHROpen = XMLHttpRequest.prototype.open;
  originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...rest: unknown[]) {
    (this as XMLHttpRequest & { _nc_method: string; _nc_url: string })._nc_method = method.toUpperCase();
    (this as XMLHttpRequest & { _nc_url: string })._nc_url = filterSensitiveData(typeof url === 'string' ? url : url.href);
    return originalXHROpen.apply(this, [method, url, ...rest] as Parameters<typeof originalXHROpen>);
  };

  XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
    const xhr = this as XMLHttpRequest & { _nc_method: string; _nc_url: string };
    const startMs = Date.now();
    const requestBody = safeFilterBody(body);

    const onDone = () => {
      addEntry({
        method: xhr._nc_method || 'UNKNOWN',
        url: xhr._nc_url || '',
        status: xhr.status || null,
        duration: Date.now() - startMs,
        timestampMs: startMs,
        requestBody,
        responseType: xhr.getResponseHeader('content-type') || undefined,
      });
    };

    const onError = () => {
      addEntry({
        method: xhr._nc_method || 'UNKNOWN',
        url: xhr._nc_url || '',
        status: null,
        duration: Date.now() - startMs,
        timestampMs: startMs,
        requestBody,
        error: 'Network error',
      });
    };

    xhr.addEventListener('load', onDone);
    xhr.addEventListener('error', onError);
    xhr.addEventListener('abort', onError);

    return originalXHRSend.call(this, body);
  };
}

export function startNetworkCapture() {
  if (capturing) return;
  capturing = true;
  installFetchIntercept();
  installXHRIntercept();
}

export function stopNetworkCapture() {
  if (!capturing) return;
  capturing = false;
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.open = originalXHROpen;
  XMLHttpRequest.prototype.send = originalXHRSend;
}

export function getCapturedRequests(): NetworkRequestEntry[] {
  return [...capturedRequests];
}

export function clearCapturedRequests() {
  capturedRequests.length = 0;
}
