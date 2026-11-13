"use strict";

const items = document.querySelector("#items");
const template = document.querySelector("#item-template");
const total = document.querySelector("#total");
const moneyFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

function parseNumber(value) {
  const normalized = value.trim().replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return 0;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
  return `${moneyFormatter.format(value).replace(/[\u00a0\u202f]/g, " ")} ₸`;
}

function recalculate() {
  let sum = 0;
  for (const row of items.rows) {
    const product = parseNumber(row.querySelector(".quantity").value) * parseNumber(row.querySelector(".price").value);
    const amount = Number.isFinite(product) ? Math.round(product * 100) / 100 : 0;
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    row.querySelector(".line-total").textContent = formatMoney(safeAmount);
    sum = Number.isFinite(sum + safeAmount) ? sum + safeAmount : sum;
  }
  total.textContent = formatMoney(sum);
}

function addItem(focus = true) {
  const row = template.content.firstElementChild.cloneNode(true);
  items.append(row);
  if (focus) row.querySelector(".item-name").focus();
}

document.querySelector("#add-item").addEventListener("click", () => addItem());
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
