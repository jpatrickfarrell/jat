// Popup script for JAT Browser Extension
console.log('JAT Browser Extension Popup loaded')

// DOM elements
const screenshotVisibleBtn = document.getElementById('screenshot-visible-btn') as HTMLButtonElement
const screenshotFullpageBtn = document.getElementById('screenshot-fullpage-btn') as HTMLButtonElement
const screenshotElementBtn = document.getElementById('screenshot-element-btn') as HTMLButtonElement
const screenshotAnnotateBtn = document.getElementById('screenshot-annotate-btn') as HTMLButtonElement
const consoleBtn = document.getElementById('console-btn') as HTMLButtonElement
const networkBtn = document.getElementById('network-btn') as HTMLButtonElement
const reportBtn = document.getElementById('report-btn') as HTMLButtonElement
const statusDiv = document.getElementById('status') as HTMLDivElement

// Show status
function showStatus(message: string, isError: boolean = false) {
  statusDiv.textContent = message
  statusDiv.style.display = 'block'
  statusDiv.style.backgroundColor = isError ? '#fef2f2' : '#f0f9ff'
  statusDiv.style.borderColor = isError ? '#fecaca' : '#bae6fd'
  statusDiv.style.color = isError ? '#dc2626' : '#0369a1'
}

// Get current active tab
async function getCurrentTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab
}

// Screenshot visible area
screenshotVisibleBtn?.addEventListener('click', async () => {
  try {
    showStatus('Capturing visible area...')

    const tab = await getCurrentTab()
    if (!tab.id) throw new Error('No active tab found')

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'CAPTURE_SCREENSHOT',
      options: { type: 'visible' }
    })

    if (response?.success) {
      const size = response.size ? ` (${formatBytes(response.size)})` : ''
      showStatus(`Visible area captured${size}!`)
    } else {
      throw new Error(response?.error || 'Screenshot capture failed')
    }
  } catch (error) {
    console.error('Screenshot error:', error)
    showStatus(`Screenshot failed: ${error instanceof Error ? error.message : 'Unknown error'}`, true)
  }
})

// Screenshot full page
screenshotFullpageBtn?.addEventListener('click', async () => {
  try {
    showStatus('Capturing full page (this may take a moment)...')

    const tab = await getCurrentTab()
    if (!tab.id) throw new Error('No active tab found')

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'CAPTURE_SCREENSHOT',
      options: { type: 'fullpage' }
    })

    if (response?.success) {
      const size = response.size ? ` (${formatBytes(response.size)})` : ''
      const dims = response.width && response.height ? ` ${response.width}x${response.height}` : ''
      showStatus(`Full page captured${dims}${size}!`)
    } else {
      throw new Error(response?.error || 'Full page capture failed')
    }
  } catch (error) {
    console.error('Full page screenshot error:', error)
    showStatus(`Full page capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`, true)
  }
})

// Screenshot element
screenshotElementBtn?.addEventListener('click', async () => {
  try {
    showStatus('Click on an element to capture...')

    const tab = await getCurrentTab()
    if (!tab.id) throw new Error('No active tab found')

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'START_ELEMENT_SCREENSHOT'
    })

    if (response?.success) {
      showStatus('Element picker activated!')
      window.close()
    } else {
      throw new Error(response?.error || 'Element picker activation failed')
    }
  } catch (error) {
    console.error('Element screenshot error:', error)
    showStatus(`Element capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`, true)
  }
})

// Annotate last screenshot
screenshotAnnotateBtn?.addEventListener('click', async () => {
  try {
    showStatus('Opening annotation editor...')

    const tab = await getCurrentTab()
    if (!tab.id) throw new Error('No active tab found')

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'OPEN_ANNOTATION_EDITOR'
    })

    if (response?.success) {
      showStatus('Annotation editor opened!')
      window.close()
    } else {
      throw new Error(response?.error || 'No screenshot available to annotate')
    }
  } catch (error) {
    console.error('Annotation error:', error)
    showStatus(`Annotation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, true)
  }
})

// Format bytes helper
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Console logs functionality
consoleBtn?.addEventListener('click', async () => {
  try {
    showStatus('Capturing console logs...')
    
    const tab = await getCurrentTab()
    if (!tab.id) throw new Error('No active tab found')
    
    // Send message to content script to capture console logs
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'CAPTURE_CONSOLE_LOGS'
    })
    
    if (response?.success) {
      showStatus(`Captured ${response.logsCount || 0} console logs!`)
    } else {
      throw new Error(response?.error || 'Console log capture failed')
    }
  } catch (error) {
    console.error('Console logs error:', error)
    showStatus(`Console capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`, true)
  }
})

// Network logs functionality
networkBtn?.addEventListener('click', async () => {
  try {
    showStatus('Capturing network logs...')
    
    // Send message to background script to capture network logs
    const response = await chrome.runtime.sendMessage({
      type: 'CAPTURE_NETWORK_LOGS'
    })
    
    if (response?.success) {
      showStatus(`Captured ${response.requestsCount || 0} network requests!`)
    } else {
      throw new Error(response?.error || 'Network log capture failed')
    }
  } catch (error) {
    console.error('Network logs error:', error)
    showStatus(`Network capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`, true)
  }
})


// Bug report functionality
reportBtn?.addEventListener('click', async () => {
  try {
    showStatus('Opening bug report form...')
    
    const tab = await getCurrentTab()
    if (!tab.id) throw new Error('No active tab found')
    
    // Send message to content script to open bug report form
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'OPEN_BUG_REPORT_FORM'
    })
    
    if (response?.success) {
      showStatus('Bug report form opened!')
      window.close()
    } else {
      throw new Error(response?.error || 'Bug report form failed to open')
    }
  } catch (error) {
    console.error('Bug report error:', error)
    showStatus(`Bug report failed: ${error instanceof Error ? error.message : 'Unknown error'}`, true)
  }
})

// Listen for messages from content script and background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Popup received message:', message)
  
  switch (message.type) {
    case 'STATUS_UPDATE':
      showStatus(message.message, message.isError)
      break
      
    case 'ELEMENT_SELECTED':
      showStatus(`Element selected: ${message.tagName}`)
      break
      
    default:
      console.log('Unknown message type:', message.type)
  }
  
  sendResponse({ received: true })
})

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  showStatus('JAT Bug Reporter ready!')
  console.log('JAT Bug Reporter popup initialized')
})