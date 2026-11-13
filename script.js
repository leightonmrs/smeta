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

function numberError(value, percentage = false) {
  const normalized = value.trim().replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
  if (!normalized) return "";
  if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized) || !Number.isFinite(Number(normalized))) return "Введите корректное число";
  const number = Number(normalized);
  if (percentage && (number < 0 || number > 100)) return "Введите процент от 0 до 100";
  if (number < 0) return "Введите число не меньше 0";
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
    row.querySelector(".price").setAttribute("aria-label", `Цена, ${currency.value}`);
    row.querySelector(".price").closest("td").dataset.label = `Цена, ${currency.value}`;
    sum = Number.isFinite(sum + safeAmount) ? sum + safeAmount : sum;
  }
  const discount = roundedAmount(sum * (validatedNumber(discountInput, true) / 100));
  const discounted = sum - discount;
  const vat = roundedAmount(discounted * (validatedNumber(vatInput, true) / 100));
  showSummary("#subtotal", sum);
  showSummary("#discount-amount", discount, "#discount-row");
  showSummary("#discounted-amount", discounted, "#discounted-row");
  showSummary("#vat-amount", vat, "#vat-row");
  document.querySelector("#price-heading").textContent = `Цена, ${currency.value}`;
  total.textContent = formatMoney(roundedAmount(discounted + vat));
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
  row.remove();
  recalculate();
  saveDraft();
  if (neighbor) neighbor.querySelector(".item-name").focus();
  else document.querySelector("#add-item").focus();
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
  const dateText = date ? date.split("-").reverse().join(".") : "—";
  document.querySelector("#print-title").textContent = `Смета № ${number} от ${dateText}`;

  // Текстовые копии не обрезают длинные значения, в отличие от полей ввода.
  document.querySelectorAll(".print-value").forEach((value) => value.remove());
  document.querySelectorAll(".details-grid input, #items input, #items select, #comment").forEach((field) => {
    const value = document.createElement("span");
    value.className = "print-value";
    value.textContent = field.id === "estimate-date" ? dateText : field.value;
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
    fields: draftFields.map((selector) => document.querySelector(selector).value),
    items: Array.from(items.rows, (row) => Array.from(row.querySelectorAll("input, select"), (field) => field.value))
  };
  try {
    localStorage.setItem(draftKey, JSON.stringify(draft));
    document.querySelector("#storage-status").textContent = "";
  } catch {
    document.querySelector("#storage-status").textContent = "Браузер не разрешает сохранить черновик. Не закрывайте страницу, пока не сохраните смету.";
  }
}

function restoreDraft() {
  try {
    const saved = localStorage.getItem(draftKey);
    if (!saved) return;
    const draft = JSON.parse(saved);
    if (!Array.isArray(draft.fields) || draft.fields.length !== draftFields.length || !draft.fields.every((value) => typeof value === "string") ||
        !Array.isArray(draft.items) || !draft.items.every((row) => Array.isArray(row) && row.length === 4 && row.every((value) => typeof value === "string")) ||
        !["₸", "₽", "$", "€"].includes(draft.fields[6]) || !draft.items.every((row) => ["шт", "час", "услуга"].includes(row[2]))) return;
    draftFields.forEach((selector, index) => { document.querySelector(selector).value = draft.fields[index]; });
    items.replaceChildren();
    draft.items.forEach((values) => {
      const row = addItem(false);
      row.querySelectorAll("input, select").forEach((field, index) => { field.value = values[index]; });
    });
    recalculate();
  } catch {
    document.querySelector("#storage-status").textContent = "Не удалось восстановить черновик из памяти браузера.";
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
  if (!window.confirm("Создать новую смету? Текущий черновик будет очищен.")) return;
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
  const lines = [`Смета № ${number} от ${date ? date.split("-").reverse().join(".") : "—"}`];
  for (const selector of ['[name="sender"]', '[name="recipient"]']) {
    const value = document.querySelector(selector).value.trim();
    if (value) lines.push(`${selector.includes("sender") ? "От кого" : "Для кого"}: ${value}`);
  }
  lines.push("");
  for (const row of items.rows) {
    const name = row.querySelector(".item-name").value.trim() || "Без наименования";
    const quantity = parseNumber(row.querySelector(".quantity").value).toLocaleString("ru-RU", { maximumFractionDigits: 20 }).replace(/[\u00a0\u202f]/g, " ");
    const unit = row.querySelector("select").value;
    const price = formatMoney(parseNumber(row.querySelector(".price").value));
    lines.push(`• ${name} — ${quantity} ${unit} × ${price} = ${row.querySelector(".line-total").textContent}`);
  }
  lines.push("", `Сумма: ${document.querySelector("#subtotal").textContent}`);
  for (const [row, label, amount] of [["#discount-row", "Скидка", "#discount-amount"], ["#discounted-row", "Сумма со скидкой", "#discounted-amount"], ["#vat-row", "НДС", "#vat-amount"]]) {
    if (!document.querySelector(row).hidden) lines.push(`${label}: ${document.querySelector(amount).textContent}`);
  }
  lines.push(`Итого к оплате: ${total.textContent}`);
  const comment = document.querySelector("#comment").value.trim();
  if (comment) lines.push("", comment);
  return lines.join("\n");
}

document.querySelector("#copy-whatsapp").addEventListener("click", async () => {
  clearCopyFeedback();
  const text = whatsappText();
  try {
    await navigator.clipboard.writeText(text);
    document.querySelector("#copy-status").textContent = "Скопировано ✓";
    copyTimer = setTimeout(() => { document.querySelector("#copy-status").textContent = ""; }, 2000);
  } catch {
    document.querySelector("#manual-copy").hidden = false;
    const field = document.querySelector("#copy-text");
    field.value = text;
    field.focus();
    field.select();
  }
});
