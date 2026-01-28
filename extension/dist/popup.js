(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
console.log("JAT Browser Extension Popup loaded");
const screenshotVisibleBtn = document.getElementById("screenshot-visible-btn");
const screenshotFullpageBtn = document.getElementById("screenshot-fullpage-btn");
const screenshotElementBtn = document.getElementById("screenshot-element-btn");
const screenshotAnnotateBtn = document.getElementById("screenshot-annotate-btn");
const consoleBtn = document.getElementById("console-btn");
const networkBtn = document.getElementById("network-btn");
const reportBtn = document.getElementById("report-btn");
const statusDiv = document.getElementById("status");
function showStatus(message, isError = false) {
  statusDiv.textContent = message;
  statusDiv.style.display = "block";
  statusDiv.style.backgroundColor = isError ? "#fef2f2" : "#f0f9ff";
  statusDiv.style.borderColor = isError ? "#fecaca" : "#bae6fd";
  statusDiv.style.color = isError ? "#dc2626" : "#0369a1";
}
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}
screenshotVisibleBtn?.addEventListener("click", async () => {
  try {
    showStatus("Capturing visible area...");
    const tab = await getCurrentTab();
    if (!tab.id) throw new Error("No active tab found");
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "CAPTURE_SCREENSHOT",
      options: { type: "visible" }
    });
    if (response?.success) {
      const size = response.size ? ` (${formatBytes(response.size)})` : "";
      showStatus(`Visible area captured${size}!`);
    } else {
      throw new Error(response?.error || "Screenshot capture failed");
    }
  } catch (error) {
    console.error("Screenshot error:", error);
    showStatus(`Screenshot failed: ${error instanceof Error ? error.message : "Unknown error"}`, true);
  }
});
screenshotFullpageBtn?.addEventListener("click", async () => {
  try {
    showStatus("Capturing full page (this may take a moment)...");
    const tab = await getCurrentTab();
    if (!tab.id) throw new Error("No active tab found");
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "CAPTURE_SCREENSHOT",
      options: { type: "fullpage" }
    });
    if (response?.success) {
      const size = response.size ? ` (${formatBytes(response.size)})` : "";
      const dims = response.width && response.height ? ` ${response.width}x${response.height}` : "";
      showStatus(`Full page captured${dims}${size}!`);
    } else {
      throw new Error(response?.error || "Full page capture failed");
    }
  } catch (error) {
    console.error("Full page screenshot error:", error);
    showStatus(`Full page capture failed: ${error instanceof Error ? error.message : "Unknown error"}`, true);
  }
});
screenshotElementBtn?.addEventListener("click", async () => {
  try {
    showStatus("Click on an element to capture...");
    const tab = await getCurrentTab();
    if (!tab.id) throw new Error("No active tab found");
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "START_ELEMENT_SCREENSHOT"
    });
    if (response?.success) {
      showStatus("Element picker activated!");
      window.close();
    } else {
      throw new Error(response?.error || "Element picker activation failed");
    }
  } catch (error) {
    console.error("Element screenshot error:", error);
    showStatus(`Element capture failed: ${error instanceof Error ? error.message : "Unknown error"}`, true);
  }
});
screenshotAnnotateBtn?.addEventListener("click", async () => {
  try {
    showStatus("Opening annotation editor...");
    const tab = await getCurrentTab();
    if (!tab.id) throw new Error("No active tab found");
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "OPEN_ANNOTATION_EDITOR"
    });
    if (response?.success) {
      showStatus("Annotation editor opened!");
      window.close();
    } else {
      throw new Error(response?.error || "No screenshot available to annotate");
    }
  } catch (error) {
    console.error("Annotation error:", error);
    showStatus(`Annotation failed: ${error instanceof Error ? error.message : "Unknown error"}`, true);
  }
});
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
consoleBtn?.addEventListener("click", async () => {
  try {
    showStatus("Capturing console logs...");
    const tab = await getCurrentTab();
    if (!tab.id) throw new Error("No active tab found");
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "CAPTURE_CONSOLE_LOGS"
    });
    if (response?.success) {
      showStatus(`Captured ${response.logsCount || 0} console logs!`);
    } else {
      throw new Error(response?.error || "Console log capture failed");
    }
  } catch (error) {
    console.error("Console logs error:", error);
    showStatus(`Console capture failed: ${error instanceof Error ? error.message : "Unknown error"}`, true);
  }
});
networkBtn?.addEventListener("click", async () => {
  try {
    showStatus("Capturing network logs...");
    const response = await chrome.runtime.sendMessage({
      type: "CAPTURE_NETWORK_LOGS"
    });
    if (response?.success) {
      showStatus(`Captured ${response.requestsCount || 0} network requests!`);
    } else {
      throw new Error(response?.error || "Network log capture failed");
    }
  } catch (error) {
    console.error("Network logs error:", error);
    showStatus(`Network capture failed: ${error instanceof Error ? error.message : "Unknown error"}`, true);
  }
});
reportBtn?.addEventListener("click", async () => {
  try {
    showStatus("Opening bug report form...");
    const tab = await getCurrentTab();
    if (!tab.id) throw new Error("No active tab found");
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "OPEN_BUG_REPORT_FORM"
    });
    if (response?.success) {
      showStatus("Bug report form opened!");
      window.close();
    } else {
      throw new Error(response?.error || "Bug report form failed to open");
    }
  } catch (error) {
    console.error("Bug report error:", error);
    showStatus(`Bug report failed: ${error instanceof Error ? error.message : "Unknown error"}`, true);
  }
});
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("Popup received message:", message);
  switch (message.type) {
    case "STATUS_UPDATE":
      showStatus(message.message, message.isError);
      break;
    case "ELEMENT_SELECTED":
      showStatus(`Element selected: ${message.tagName}`);
      break;
    default:
      console.log("Unknown message type:", message.type);
  }
  sendResponse({ received: true });
});
document.addEventListener("DOMContentLoaded", () => {
  showStatus("JAT Bug Reporter ready!");
  console.log("JAT Bug Reporter popup initialized");
});
