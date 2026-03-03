import { domToCanvas } from 'modern-screenshot';

const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Check if a URL is a same-page fragment reference (#id).
 * These resolve to the current page URL and cause slow 404 fetches
 * when modern-screenshot tries to load them as resources.
 */
function isFragmentUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.origin === window.location.origin
      && parsed.pathname === window.location.pathname
      && !!parsed.hash;
  } catch {
    return true; // malformed → treat as skip
  }
}

/**
 * Wrap window.fetch to intercept fragment-only URLs during screenshot capture.
 * modern-screenshot's fetchFn only intercepts "image" requests, but fragment
 * URLs also appear in CSS url() refs fetched as "text". This catches ALL of them.
 */
function withFetchIntercept<T>(fn: () => Promise<T>): Promise<T> {
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
    if (isFragmentUrl(url)) {
      return Promise.resolve(new Response('', { status: 200 }));
    }
    return originalFetch.call(window, input, init);
  } as typeof window.fetch;

  return fn().finally(() => {
    window.fetch = originalFetch;
  });
}

const sharedOptions = {
  fetch: {
    placeholderImage: PLACEHOLDER,
  },
  filter: (el: Node) => {
    if (el instanceof HTMLElement) {
      if (el.tagName === 'JAT-FEEDBACK' || el.id?.startsWith('jat-feedback-')) return false;
    }
    return true;
  },
};

export async function captureViewport(): Promise<string> {
  return withFetchIntercept(async () => {
    const canvas = await domToCanvas(document.documentElement, {
      ...sharedOptions,
      width: window.innerWidth,
      height: window.innerHeight,
      style: {
        transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`,
      },
    });

    return canvas.toDataURL('image/jpeg', 0.8);
  });
}

/**
 * Quick capture at half resolution — used for auto-capture on panel open.
 * Uses withFetchIntercept to block slow fragment-URL fetches from SVG refs.
 */
export async function captureViewportQuick(): Promise<string> {
  return withFetchIntercept(async () => {
    const canvas = await domToCanvas(document.documentElement, {
      ...sharedOptions,
      scale: 0.5,
      width: window.innerWidth,
      height: window.innerHeight,
      style: {
        transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`,
      },
    });

    return canvas.toDataURL('image/jpeg', 0.6);
  });
}

export async function captureElement(el: Element): Promise<string> {
  return withFetchIntercept(async () => {
    const canvas = await domToCanvas(el as HTMLElement, {
      ...sharedOptions,
    });

    return canvas.toDataURL('image/jpeg', 0.85);
  });
}
