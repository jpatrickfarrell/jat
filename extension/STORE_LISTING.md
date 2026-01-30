# Chrome Web Store Listing

## Extension Name
JAT Bug Reporter

## Short Description (132 char max)
Capture screenshots, console logs, network requests, and elements to create detailed bug reports. All data stays on your device.

## Detailed Description

JAT Bug Reporter is an open-source developer tool that streamlines bug reporting by capturing diagnostic information directly from your browser.

**What it captures (on your command):**

- Screenshots - Capture the visible area or full page with one click
- Console logs - Automatically collect JavaScript console output with sensitive data redacted
- Network requests - Record HTTP request metadata, timings, and status codes
- Element inspector - Click any element to capture its selector, dimensions, and attributes
- Bug report form - Combine all captured data into a structured report

**Key principles:**

- All data is stored locally on your device
- Nothing is transmitted unless you explicitly submit a report
- Sensitive values (API keys, tokens, passwords) are automatically redacted from console logs
- Open source under the MIT license

**Optional server integration:**

If you configure your own Supabase project, you can submit bug reports to your own database. No data is ever sent to JAT developers or third parties. Without configuration, reports are saved locally.

**Built for developers, by developers.**

TypeScript, Svelte 5, Vite, Manifest V3. Cross-browser support for Chrome 88+ and Firefox 109+.

Source code: https://github.com/jomarchy/jat

## Category
Developer Tools

## Language
English

## Website
https://github.com/jomarchy/jat

## Privacy Policy URL
https://jomarchy.github.io/jat/extension/privacy-policy.html

## Single Purpose Description
Capture browser diagnostic data (screenshots, console logs, network requests, DOM elements) and compile it into structured bug reports.

## Host Permission Justification (<all_urls>)
The extension requires access to all URLs because:
1. The content script must run on any page to enable console log capture and element picking
2. The network request monitor needs to observe requests to any domain
3. Screenshots must work on any website the developer is testing

The extension only activates capture when the user explicitly clicks a capture button. No page content is accessed passively.

## Remote Code Justification
This extension does not use any remotely hosted code. All JavaScript is bundled at build time.

## Data Use Justification
- Screenshots: Captured locally for bug reports. Only transmitted if user configures and submits to their own server.
- Console logs: Captured locally with automatic sensitive data redaction. Never transmitted automatically.
- Network metadata: Captured locally for debugging. Request/response bodies are not captured.
- Element data: Captured locally when user clicks an element. CSS selectors and dimensions only.

## Store Assets Needed

### Icon
- 128x128 PNG (provided in extension package)

### Screenshots (1280x800 or 640x400)
Needed for store listing - capture these manually:
1. Extension popup showing capture actions
2. Screenshot capture in action
3. Console log viewer with captured entries
4. Bug report form filled out
5. Element picker highlighting an element

### Promotional Images (optional)
- Small promo tile: 440x280 PNG
- Large promo tile: 920x680 PNG
- Marquee promo tile: 1400x560 PNG
