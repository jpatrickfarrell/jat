/**
 * Svelte action for scroll-triggered Animista animations.
 *
 * Usage:
 *   <div use:reveal>                          → fade-in-bottom on scroll
 *   <div use:reveal={{ animation: 'scale-in-center' }}>
 *   <div use:reveal={{ delay: 0.2 }}>        → 200ms staggered delay
 *   <div use:reveal={{ threshold: 0.3 }}>    → triggers at 30% visibility
 */
export interface RevealOptions {
  animation?: string
  delay?: number
  threshold?: number
}

export function reveal(node: HTMLElement, options?: RevealOptions) {
  const animation = options?.animation ?? "fade-in-bottom"
  const threshold = options?.threshold ?? 0.1

  node.classList.add("reveal-hidden")

  if (options?.delay) {
    node.style.animationDelay = `${options.delay}s`
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          node.classList.remove("reveal-hidden")
          node.classList.add(animation)
          observer.unobserve(node)
        }
      }
    },
    { threshold },
  )

  observer.observe(node)

  return {
    destroy() {
      observer.disconnect()
    },
  }
}
