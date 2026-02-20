import { domToCanvas } from 'modern-screenshot';

const sharedOptions = {
  // Don't try to fetch fragment-only URLs (SVG <use href="#id"> references)
  // or cross-origin resources that will 404
  fetch: {
    requestInit: { mode: 'no-cors' as RequestMode },
    placeholderImage: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  },
  filter: (el: Node) => {
    if (el instanceof HTMLElement) {
      if (el.tagName === 'JAT-FEEDBACK' || el.id?.startsWith('jat-feedback-')) return false;
    }
    return true;
  },
};

export async function captureViewport(): Promise<string> {
  const canvas = await domToCanvas(document.documentElement, {
    ...sharedOptions,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`,
    },
  });

  return canvas.toDataURL('image/jpeg', 0.8);
}

export async function captureElement(el: Element): Promise<string> {
  const canvas = await domToCanvas(el as HTMLElement, {
    ...sharedOptions,
  });

  return canvas.toDataURL('image/jpeg', 0.85);
}
