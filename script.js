"use strict";

const items = document.querySelector("#items");
const template = document.querySelector("#item-template");
const total = document.querySelector("#total");
const discountInput = document.querySelector("#discount");
const vatInput = document.querySelector("#vat");
const currency = document.querySelector("#currency");
const moneyFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const draftKey = "smeta-draft-v1";
const draftFields = ['[name="sender"]', '[name="recipient"]', '[name="estimate-number"]', '#estimate-date', '#discount', '#vat', '#currency', '#comment'];
let draftReady = false;
let validationId = 0;
let deletedItem = null;
let undoTimer;

function numberError(value, percentage = false) {
  const normalized = value.trim().replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
  if (!normalized) return "";
  if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized) || !Number.isFinite(Number(normalized))) return t("Введите корректное число");
  const number = Number(normalized);
  if (percentage && (number < 0 || number > 100)) return t("Введите процент от 0 до 100");
  if (number < 0) return t("Введите число не меньше 0");
  return "";
}

function validatedNumber(field, percentage = false) {
  const error = numberError(field.value, percentage);
  let hint = field.nextElementSibling;
  if (!hint || !hint.classList.contains("field-error")) {
    hint = document.createElement("span");
    hint.className = "field-error";
    hint.id = `field-error-${++validationId}`;
    hint.setAttribute("aria-live", "polite");
    field.after(hint);
    field.setAttribute("aria-describedby", hint.id);
  }
  hint.textContent = error;
  hint.hidden = !error;
  field.setAttribute("aria-invalid", String(Boolean(error)));
  return error ? 0 : parseNumber(field.value);
}

function parseNumber(value) {
  const normalized = value.trim().replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return 0;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
  return `${moneyFormatter.format(value).replace(/[\u00a0\u202f]/g, " ")} ${currency.value}`;
}

function roundedAmount(value) {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function showSummary(id, value, rowId) {
  document.querySelector(id).textContent = formatMoney(value);
  if (rowId) document.querySelector(rowId).hidden = value === 0;
}

function recalculate() {
  let sum = 0;
  for (const row of items.rows) {
    const product = validatedNumber(row.querySelector(".quantity")) * validatedNumber(row.querySelector(".price"));
    const safeAmount = roundedAmount(product);
    row.querySelector(".line-total").textContent = formatMoney(safeAmount);
    row.querySelector(".price").setAttribute("aria-label", `${t("Цена")}, ${currency.value}`);
    row.querySelector(".price").closest("td").dataset.label = `${t("Цена")}, ${currency.value}`;
    sum = Number.isFinite(sum + safeAmount) ? sum + safeAmount : sum;
  }
  const discount = roundedAmount(sum * (validatedNumber(discountInput, true) / 100));
  const discounted = sum - discount;
  const vat = roundedAmount(discounted * (validatedNumber(vatInput, true) / 100));
  showSummary("#subtotal", sum);
  showSummary("#discount-amount", discount, "#discount-row");
  showSummary("#discounted-amount", discounted, "#discounted-row");
  showSummary("#vat-amount", vat, "#vat-row");
  document.querySelector("#price-heading").textContent = `${t("Цена")}, ${currency.value}`;
  total.textContent = formatMoney(roundedAmount(discounted + vat));
  translateTree(items);
}

function addItem(focus = true) {
  const row = template.content.firstElementChild.cloneNode(true);
  items.append(row);
  recalculate();
  saveDraft();
  if (focus) row.querySelector(".item-name").focus();
  return row;
}

document.querySelector("#add-item").addEventListener("click", () => addItem());
discountInput.addEventListener("input", recalculate);
vatInput.addEventListener("input", recalculate);
currency.addEventListener("change", recalculate);
items.addEventListener("input", recalculate);
items.addEventListener("click", (event) => {
  const duplicateButton = event.target.closest(".duplicate-button");
  if (duplicateButton) {
    duplicateItem(duplicateButton.closest("tr"));
    return;
  }
  const button = event.target.closest(".delete-button");
  if (!button) return;
  const row = button.closest("tr");
  const neighbor = row.nextElementSibling || row.previousElementSibling;
  rememberDeletedItem(row);
  row.remove();
  recalculate();
  saveDraft();
  if (neighbor) neighbor.querySelector(".item-name").focus();
  else document.querySelector("#add-item").focus();
});

function clearUndo() {
  clearTimeout(undoTimer);
  deletedItem = null;
  const button = document.querySelector("#undo-delete");
  if (document.activeElement === button) document.querySelector("#add-item").focus();
  document.querySelector("#undo-notice").hidden = true;
}

function rememberDeletedItem(row) {
  clearUndo();
  deletedItem = {
    row,
    next: row.nextElementSibling,
    previous: row.previousElementSibling,
    index: Array.from(items.rows).indexOf(row)
  };
  document.querySelector("#undo-notice").hidden = false;
  undoTimer = setTimeout(clearUndo, 5000);
}

document.querySelector("#undo-delete").addEventListener("click", () => {
  if (!deletedItem) return;
  const { row, next, previous, index } = deletedItem;
  if (next && next.parentElement === items) items.insertBefore(row, next);
  else if (previous && previous.parentElement === items) previous.after(row);
  else items.insertBefore(row, items.rows[index] || null);
  clearUndo();
  recalculate();
  saveDraft();
  row.querySelector(".item-name").focus();
});

function duplicateItem(source) {
  // Создаём чистую строку, чтобы не копировать идентификаторы подсказок и печатные значения.
  const copy = template.content.firstElementChild.cloneNode(true);
  const values = source.querySelectorAll("input, select");
  copy.querySelectorAll("input, select").forEach((field, index) => {
    field.value = values[index].value;
  });
  source.after(copy);
  recalculate();
  saveDraft();
  const name = copy.querySelector(".item-name");
  name.focus();
  name.select();
}
items.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.isComposing && event.target.matches("input") && event.target.closest("tr") === items.lastElementChild) {
    event.preventDefault();
    addItem();
  }
});

const today = new Date();
document.querySelector("#estimate-date").value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
addItem(false);

function preparePrint() {
  recalculate();
  const number = document.querySelector('[name="estimate-number"]').value.trim() || "—";
  const date = document.querySelector("#estimate-date").value;
  const dateText = localizedDate(date);
  document.querySelector("#print-title").textContent = estimateHeading(number, date);

  // Текстовые копии не обрезают длинные значения, в отличие от полей ввода.
  document.querySelectorAll(".print-value").forEach((value) => value.remove());
  document.querySelectorAll(".details-grid input, #items input, #items select, #comment").forEach((field) => {
    const value = document.createElement("span");
    value.className = "print-value";
    value.textContent = field.id === "estimate-date" ? dateText : field.tagName === "SELECT" ? t(field.value) : field.value;
    field.after(value);
  });
}

window.addEventListener("beforeprint", preparePrint);
document.querySelector("#save-pdf").addEventListener("click", () => {
  preparePrint();
  window.print();
});

function saveDraft() {
  if (!draftReady) return;
  const draft = {
    language: currentLanguage,
    fields: draftFields.map((selector) => document.querySelector(selector).value),
    items: Array.from(items.rows, (row) => Array.from(row.querySelectorAll("input, select"), (field) => field.value))
  };
  try {
    localStorage.setItem(draftKey, JSON.stringify(draft));
    document.querySelector("#storage-status").textContent = "";
  } catch {
    document.querySelector("#storage-status").textContent = t("Браузер не разрешает сохранить черновик. Не закрывайте страницу, пока не сохраните смету.");
  }
}

function restoreDraft() {
  try {
    const saved = localStorage.getItem(draftKey);
    if (!saved) return;
    const draft = JSON.parse(saved);
    if (!validLanguage(draft.language) || !Array.isArray(draft.fields) || draft.fields.length !== draftFields.length || !draft.fields.every((value) => typeof value === "string") ||
        !Array.isArray(draft.items) || !draft.items.every((row) => Array.isArray(row) && row.length === 4 && row.every((value) => typeof value === "string")) ||
        !["₸", "₽", "$", "€"].includes(draft.fields[6]) || !draft.items.every((row) => ["шт", "час", "услуга"].includes(row[2]))) return;
    setLanguage(draft.language);
    draftFields.forEach((selector, index) => { document.querySelector(selector).value = draft.fields[index]; });
    items.replaceChildren();
    draft.items.forEach((values) => {
      const row = addItem(false);
      row.querySelectorAll("input, select").forEach((field, index) => { field.value = values[index]; });
    });
    recalculate();
  } catch {
    document.querySelector("#storage-status").textContent = t("Не удалось восстановить черновик из памяти браузера.");
  }
}

restoreDraft();
draftReady = true;
document.querySelector("main").addEventListener("input", (event) => {
  if (event.target.matches("input, select, #comment")) saveDraft();
});
document.querySelector("main").addEventListener("change", (event) => {
  if (event.target.matches("input, select, #comment")) saveDraft();
});

let copyTimer;
function clearCopyFeedback() {
  clearTimeout(copyTimer);
  document.querySelector("#copy-status").textContent = "";
  document.querySelector("#manual-copy").hidden = true;
  document.querySelector("#copy-text").value = "";
}

document.querySelector("#new-estimate").addEventListener("click", () => {
  if (!window.confirm(t("Создать новую смету? Текущий черновик будет очищен."))) return;
  clearUndo();
  const numberField = document.querySelector('[name="estimate-number"]');
  const previous = numberField.value.trim();
  const match = previous.match(/^(.*?)(\d+)$/);
  const next = match ? match[1] + String(BigInt(match[2]) + 1n).padStart(match[2].length, "0") : "1";
  draftFields.forEach((selector) => { document.querySelector(selector).value = ""; });
  numberField.value = next;
  const now = new Date();
  document.querySelector("#estimate-date").value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  discountInput.value = "0";
  vatInput.value = "0";
  currency.value = "₸";
  items.replaceChildren();
  clearCopyFeedback();
  addItem();
});

function whatsappText() {
  recalculate();
  const number = document.querySelector('[name="estimate-number"]').value.trim() || "—";
  const date = document.querySelector("#estimate-date").value;
  const lines = [estimateHeading(number, date)];
  for (const selector of ['[name="sender"]', '[name="recipient"]']) {
    const value = document.querySelector(selector).value.trim();
    if (value) lines.push(`${selector.includes("sender") ? t("От кого") : t("Для кого")}: ${value}`);
  }
  lines.push("");
  for (const row of items.rows) {
    const name = row.querySelector(".item-name").value.trim() || t("Без наименования");
    const quantity = parseNumber(row.querySelector(".quantity").value).toLocaleString(locale(), { maximumFractionDigits: 20 }).replace(/[\u00a0\u202f]/g, " ");
    const unit = t(row.querySelector("select").value);
    const price = formatMoney(parseNumber(row.querySelector(".price").value));
    lines.push(`• ${name} — ${quantity} ${unit} × ${price} = ${row.querySelector(".line-total").textContent}`);
  }
  lines.push("", `${t("Сумма")}: ${document.querySelector("#subtotal").textContent}`);
  for (const [row, label, amount] of [["#discount-row", t("Скидка"), "#discount-amount"], ["#discounted-row", t("Сумма со скидкой"), "#discounted-amount"], ["#vat-row", t("НДС"), "#vat-amount"]]) {
    if (!document.querySelector(row).hidden) lines.push(`${label}: ${document.querySelector(amount).textContent}`);
  }
  lines.push(`${t("Итого к оплате")}: ${total.textContent}`);
  const comment = document.querySelector("#comment").value.trim();
  if (comment) lines.push("", comment);
  return lines.join("\n");
}

document.querySelector("#copy-whatsapp").addEventListener("click", async () => {
  clearCopyFeedback();
  const text = whatsappText();
  try {
    await navigator.clipboard.writeText(text);
    document.querySelector("#copy-status").textContent = t("Скопировано ✓");
    copyTimer = setTimeout(() => { document.querySelector("#copy-status").textContent = ""; }, 2000);
  } catch {
    document.querySelector("#manual-copy").hidden = false;
    const field = document.querySelector("#copy-text");
    field.value = text;
    field.focus();
    field.select();
  }
});

const archiveKey = "smeta-archive-v1";

function readArchive() {
  const entries = JSON.parse(localStorage.getItem(archiveKey) || "[]");
  if (!Array.isArray(entries) || !entries.every((entry) => {
    const draft = entry && entry.draft;
    return typeof entry?.id === "string" && typeof entry.total === "string" && draft && validLanguage(draft.language) &&
      Array.isArray(draft.fields) && draft.fields.length === draftFields.length && draft.fields.every((value) => typeof value === "string") &&
      ["₸", "₽", "$", "€"].includes(draft.fields[6]) && Array.isArray(draft.items) &&
      draft.items.every((row) => Array.isArray(row) && row.length === 4 && row.every((value) => typeof value === "string") && ["шт", "час", "услуга"].includes(row[2]));
  })) throw new Error(t("Неверный формат архива"));
  return entries;
}

function archiveError() {
  document.querySelector("#archive-status").textContent = t("Не удалось прочитать или сохранить архив в памяти браузера. Данные архива не заменены.");
}

function openArchivedEstimate(entry) {
  if (!window.confirm(t("Открыть смету из архива? Текущий черновик будет заменён."))) return;
  clearUndo();
  clearCopyFeedback();
  // Не сохраняем промежуточные строки во время восстановления.
  draftReady = false;
  try {
    setLanguage(entry.draft.language);
    entry.draft.fields.forEach((value, index) => { document.querySelector(draftFields[index]).value = value; });
    items.replaceChildren();
    entry.draft.items.forEach((values) => {
      const row = template.content.firstElementChild.cloneNode(true);
      row.querySelectorAll("input, select").forEach((field, index) => { field.value = values[index]; });
      items.append(row);
    });
    recalculate();
  } finally {
    draftReady = true;
  }
  saveDraft();
  try { renderArchive(readArchive()); } catch { archiveError(); }
  document.querySelector('[name="estimate-number"]').focus();
  document.querySelector("#archive-status").textContent = t("Смета открыта из архива.");
}

function renderArchive(entries) {
  const list = document.querySelector("#archive-list");
  list.replaceChildren();
  document.querySelector("#archive-status").textContent = entries.length ? "" : t("В архиве пока нет смет.");
  for (const entry of entries) {
    const item = document.createElement("li");
    item.className = "archive-entry";
    const details = document.createElement("p");
    const [, recipient, number, date] = entry.draft.fields;
    details.textContent = `${estimateHeading(number, date)}\n${t("Для кого")}: ${recipient || "—"}\n${t("Итого к оплате")}: ${entry.total}`;
    const actions = document.createElement("div");
    actions.className = "draft-actions";
    const open = document.createElement("button");
    open.type = "button";
    open.className = "add-button";
    open.textContent = t("Открыть");
    open.addEventListener("click", () => openArchivedEstimate(entry));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "add-button";
    remove.textContent = t("Удалить");
    remove.addEventListener("click", () => {
      if (!window.confirm(deleteArchiveQuestion(number || "—"))) return;
      try {
        const remaining = readArchive().filter((saved) => saved.id !== entry.id);
        localStorage.setItem(archiveKey, JSON.stringify(remaining));
        renderArchive(remaining);
        document.querySelector("#archive-status").textContent = t("Смета удалена из архива.");
        document.querySelector("#save-archive").focus();
      } catch { archiveError(); }
    });
    actions.append(open, remove);
    item.append(details, actions);
    list.append(item);
  }
}

document.querySelector("#save-archive").addEventListener("click", () => {
  recalculate();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    total: total.textContent,
    draft: {
      language: currentLanguage,
      fields: draftFields.map((selector) => document.querySelector(selector).value),
      items: Array.from(items.rows, (row) => Array.from(row.querySelectorAll("input, select"), (field) => field.value))
    }
  };
  try {
    const entries = [entry, ...readArchive()];
    localStorage.setItem(archiveKey, JSON.stringify(entries));
    renderArchive(entries);
    document.querySelector("#archive-status").textContent = t("Смета сохранена в архив.");
  } catch { archiveError(); }
});

try { renderArchive(readArchive()); } catch { archiveError(); }

function validBackupDraft(draft) {
  if (!draft || !validLanguage(draft.language) || !Array.isArray(draft.fields) || draft.fields.length !== draftFields.length ||
      !draft.fields.every((value) => typeof value === "string") || !["₸", "₽", "$", "€"].includes(draft.fields[6]) ||
      !Array.isArray(draft.items) || !draft.items.every((row) => Array.isArray(row) && row.length === 4 &&
        row.every((value) => typeof value === "string") && ["шт", "час", "услуга"].includes(row[2]))) return false;
  const date = draft.fields[3];
  if (!date) return true;
  const parsed = new Date(`${date}T00:00:00Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

function validateBackup(data) {
  if (!data || data.version !== 1 || !validBackupDraft(data.draft) || !Array.isArray(data.archive) ||
      !data.archive.every((entry) => entry && typeof entry.id === "string" && entry.id.length > 0 &&
        typeof entry.total === "string" && validBackupDraft(entry.draft)) ||
      new Set(data.archive.map((entry) => entry.id)).size !== data.archive.length) {
    throw new Error(t("Неверный файл резервной копии или неподдерживаемая версия. Данные не изменены."));
  }
  return data;
}

document.querySelector("#download-backup").addEventListener("click", () => {
  const status = document.querySelector("#backup-status");
  try {
    const data = validateBackup({
      version: 1,
      draft: {
        language: currentLanguage,
      fields: draftFields.map((selector) => document.querySelector(selector).value),
        items: Array.from(items.rows, (row) => Array.from(row.querySelectorAll("input, select"), (field) => field.value))
      },
      archive: readArchive()
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smeta-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = t("Резервная копия подготовлена к скачиванию.");
  } catch {
    status.textContent = t("Не удалось создать резервную копию. Проверьте доступность и данные архива.");
  }
});

document.querySelector("#upload-backup").addEventListener("click", () => {
  document.querySelector("#backup-file").click();
});

function storeBackup(data) {
  const oldDraft = localStorage.getItem(draftKey);
  const oldArchive = localStorage.getItem(archiveKey);
  try {
    localStorage.setItem(draftKey, JSON.stringify(data.draft));
    localStorage.setItem(archiveKey, JSON.stringify(data.archive));
  } catch {
    try {
      for (const [key, value] of [[draftKey, oldDraft], [archiveKey, oldArchive]]) {
        if (localStorage.getItem(key) === value) continue;
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      }
    } catch {
      throw new Error(t("Ошибка памяти браузера при восстановлении прежних данных. Текущая смета осталась на экране; скачайте резервную копию перед обновлением страницы."));
    }
    throw new Error(t("Не удалось сохранить резервную копию в браузере. Прежние данные сохранены."));
  }
}

document.querySelector("#backup-file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.querySelector("#backup-status");
  try {
    let data;
    try { data = JSON.parse(await file.text()); }
    catch { throw new Error(t("Не удалось прочитать JSON-файл. Данные не изменены.")); }
    validateBackup(data);
    if (!window.confirm(t("Загрузить резервную копию? Текущий черновик и весь архив будут заменены."))) {
      status.textContent = t("Загрузка отменена. Данные не изменены.");
      return;
    }
    storeBackup(data);
    clearUndo();
    clearCopyFeedback();
    draftReady = false;
    try { restoreDraft(); } finally { draftReady = true; }
    recalculate();
    renderArchive(data.archive);
    document.querySelector("#storage-status").textContent = "";
    status.textContent = t("Резервная копия загружена. Черновик и архив восстановлены.");
  } catch (error) {
    status.textContent = error.message;
  } finally {
    event.target.value = "";
  }
});

function refreshLanguage() {
  setLanguage(document.querySelector("#language").value);
  recalculate();
  try { renderArchive(readArchive()); } catch { archiveError(); }
  if (!document.querySelector("#manual-copy").hidden) document.querySelector("#copy-text").value = whatsappText();
  saveDraft();
}
document.querySelector("#language").addEventListener("change", refreshLanguage);
setLanguage(currentLanguage);
recalculate();
