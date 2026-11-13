"use strict";

const items = document.querySelector("#items");
const template = document.querySelector("#item-template");
const total = document.querySelector("#total");
const discountInput = document.querySelector("#discount");
const vatInput = document.querySelector("#vat");
const currency = document.querySelector("#currency");
const moneyFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

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
    const product = parseNumber(row.querySelector(".quantity").value) * parseNumber(row.querySelector(".price").value);
    const safeAmount = roundedAmount(product);
    row.querySelector(".line-total").textContent = formatMoney(safeAmount);
    row.querySelector(".price").setAttribute("aria-label", `Цена, ${currency.value}`);
    row.querySelector(".price").closest("td").dataset.label = `Цена, ${currency.value}`;
    sum = Number.isFinite(sum + safeAmount) ? sum + safeAmount : sum;
  }
  const discount = roundedAmount(sum * (Math.min(parseNumber(discountInput.value), 100) / 100));
  const discounted = sum - discount;
  const vat = roundedAmount(discounted * (parseNumber(vatInput.value) / 100));
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
  if (focus) row.querySelector(".item-name").focus();
}

document.querySelector("#add-item").addEventListener("click", () => addItem());
discountInput.addEventListener("input", recalculate);
vatInput.addEventListener("input", recalculate);
currency.addEventListener("change", recalculate);
items.addEventListener("input", recalculate);
items.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-button");
  if (!button) return;
  const row = button.closest("tr");
  const neighbor = row.nextElementSibling || row.previousElementSibling;
  row.remove();
  recalculate();
  if (neighbor) neighbor.querySelector(".item-name").focus();
  else document.querySelector("#add-item").focus();
});
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
