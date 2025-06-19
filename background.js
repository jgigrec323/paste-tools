const DEFAULT_OPTIONS = {
  removeSpaces: false,
  wrapInQuotes: false,
  toUpperCase: false,
  toLowerCase: false,
  capitalize: false,
  trim: true
};

chrome.runtime.onInstalled.addListener(() => {
  // REMOVE ALL existing context menus to prevent duplicates or grouping
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "pasteNoSpaces",
      title: "Paste Without Spaces",
      contexts: ["editable"]
    });

    chrome.contextMenus.create({
      id: "pasteWithQuotes",
      title: "Paste With Quotes",
      contexts: ["editable"]
    });

    chrome.contextMenus.create({
      id: "pasteWithPreset",
      title: "Paste With My Preset",
      contexts: ["editable"]
    });
  });

  chrome.storage.local.set({ transformOptions: DEFAULT_OPTIONS });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async (menuItemId) => {
      try {
        const text = await navigator.clipboard.readText();
        let result = text;

        const { transformOptions } = await chrome.storage.local.get("transformOptions") || {};

        if (menuItemId === "pasteNoSpaces") {
          result = text.replace(/\s+/g, "");
        } else if (menuItemId === "pasteWithQuotes") {
          result = `"${text}"`;
        } else if (menuItemId === "pasteWithPreset") {
          if (transformOptions.removeSpaces) result = result.replace(/\s+/g, "");
          if (transformOptions.trim) result = result.trim();
          if (transformOptions.wrapInQuotes) result = `"${result}"`;
          if (transformOptions.toUpperCase) result = result.toUpperCase();
          if (transformOptions.toLowerCase) result = result.toLowerCase();
          if (transformOptions.capitalize) {
            result = result
              .split(" ")
              .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ");
          }
        }

        const el = document.activeElement;
        if (el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT")) {
          const start = el.selectionStart;
          const end = el.selectionEnd;
          const original = el.value;
          el.value = original.slice(0, start) + result + original.slice(end);
          el.selectionStart = el.selectionEnd = start + result.length;
        }
      } catch (e) {
        console.error("Paste Tools error:", e);
      }
    },
    args: [info.menuItemId]
  });
});
