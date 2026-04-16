import { domToCanvas } from 'modern-screenshot';

const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Check whether a canvas has actual rendered content.
 * An empty/transparent canvas converts to solid black in JPEG —
 * detect this before returning a broken screenshot.
 * Samples ~50 pixels across the canvas diagonally + randomly.
 */
function canvasHasContent(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const { width, height } = canvas;
  if (width === 0 || height === 0) return false;

  const data = ctx.getImageData(0, 0, width, height).data;
  const totalPixels = width * height;
  // Sample ~50 pixels: diagonal + scattered
  const sampleCount = Math.min(50, totalPixels);
  const step = Math.max(1, Math.floor(totalPixels / sampleCount));

  for (let i = 0; i < totalPixels; i += step) {
    const off = i * 4;
    const a = data[off + 3];
    // Any non-transparent pixel means the canvas has content
    if (a > 10) {
      const r = data[off], g = data[off + 1], b = data[off + 2];
      // Also check it's not just solid black (which would be from a failed render)
      if (r > 5 || g > 5 || b > 5) return true;
    }
  }
  return false;
}

/**
 * Check if a URL is a same-page fragment reference (#id).
 * These resolve to the current page URL and cause slow 404 fetches
 * when modern-screenshot tries to load them as resources.
 */
function isFragmentUrl(url: string): boolean {
  if (typeof url === 'string' && url.startsWith('#')) return true;
  try {
    const parsed = new URL(url, window.location.href);
    // Block any same-origin URL with a hash — these are SVG/DOM fragment refs
    // that will never load as network resources (url(#filter-id) etc.).
    if (parsed.origin === window.location.origin && parsed.hash) return true;
    // Block %23-encoded variant: modern-screenshot sometimes encodes # → %23,
    // turning url(#id) into a path like /%23id with no hash property.
    if (decodeURIComponent(parsed.pathname).startsWith('/#')) return true;
    return false;
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
  features: {
    restoreScrollPosition: true,
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

    if (!canvasHasContent(canvas)) {
      // Retry once targeting document.body (foreignObject can fail on <html>)
      const retry = await domToCanvas(document.body, {
        ...sharedOptions,
        width: window.innerWidth,
        height: window.innerHeight,
      });
      if (!canvasHasContent(retry)) {
        throw new Error('Screenshot produced a blank image');
      }
      return retry.toDataURL('image/jpeg', 0.8);
    }

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

    if (!canvasHasContent(canvas)) {
      // Retry once targeting document.body
      const retry = await domToCanvas(document.body, {
        ...sharedOptions,
        scale: 0.5,
        width: window.innerWidth,
        height: window.innerHeight,
      });
      if (!canvasHasContent(retry)) {
        throw new Error('Screenshot produced a blank image');
      }
      return retry.toDataURL('image/jpeg', 0.6);
    }

    return canvas.toDataURL('image/jpeg', 0.6);
  });
}

export async function captureElement(el: Element): Promise<string> {
  return withFetchIntercept(async () => {
    const canvas = await domToCanvas(el as HTMLElement, {
      ...sharedOptions,
    });

    if (!canvasHasContent(canvas)) {
      throw new Error('Element screenshot produced a blank image');
    }

    return canvas.toDataURL('image/jpeg', 0.85);
  });
}
