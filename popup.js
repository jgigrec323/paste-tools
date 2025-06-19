document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("options-form");

  const fields = [
    "removeSpaces",
    "wrapInQuotes",
    "toUpperCase",
    "toLowerCase",
    "capitalize",
    "trim"
  ];

  const { transformOptions } = await chrome.storage.local.get("transformOptions");

  fields.forEach(field => {
    const checkbox = document.getElementById(field);
    checkbox.checked = transformOptions?.[field] ?? false;

    checkbox.addEventListener("change", async () => {
      const newOptions = {};
      fields.forEach(f => {
        newOptions[f] = document.getElementById(f).checked;
      });
      await chrome.storage.local.set({ transformOptions: newOptions });
    });
  });
});
