let shopData = {};

const storeSelect = document.getElementById("store-select");
const sizeSelect = document.getElementById("size-select");
const rerollSpecialsBtn = document.getElementById("reroll-specials-btn");
const specialsBody = document.getElementById("specials-body");
const inventoryBody = document.getElementById("inventory-body");

function shuffleCopy(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandom(items, count) {
  if (!items.length || count <= 0) return [];
  return shuffleCopy(items).slice(0, Math.min(count, items.length));
}

function getSpecialsForSettlement(storeInfo, size) {
  const villageSpecials = storeInfo.Village?.Specials ?? [];
  const townSpecials = storeInfo.Town?.Specials ?? [];

  if (size === "Village") {
    const targetCount = Math.floor(Math.random() * 3); // 0, 1, or 2
    return pickRandom(villageSpecials, targetCount);
  }

  // Town: 2 or 3 items total, at least 1 from Village and at least 1 from Town
  const targetTotal = Math.random() < 0.5 ? 2 : 3;

  const fromVillage = pickRandom(villageSpecials, villageSpecials.length ? 1 : 0);
  const fromTown = pickRandom(townSpecials, townSpecials.length ? 1 : 0);

  const chosen = [...fromVillage, ...fromTown];
  const remainingNeeded = targetTotal - chosen.length;

  if (remainingNeeded > 0) {
    const leftoverPool = [
      ...villageSpecials.filter((item) => !chosen.includes(item)),
      ...townSpecials.filter((item) => !chosen.includes(item)),
    ];
    chosen.push(...pickRandom(leftoverPool, remainingNeeded));
  }

  return chosen;
}

function renderRows(tbody, items, emptyMessage = "No items available.") {
  tbody.innerHTML = "";

  if (!items.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 2;
    cell.className = "empty";
    cell.textContent = emptyMessage;
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  items.forEach((entry) => {
    const row = document.createElement("tr");

    const itemCell = document.createElement("td");
    itemCell.textContent = entry.item;

    if (entry.note) {
      const noteSpan = document.createElement("span");
      noteSpan.className = "note";
      noteSpan.textContent = entry.note;
      itemCell.appendChild(noteSpan);
    }

    const priceCell = document.createElement("td");
    priceCell.textContent = entry.price ?? "—";

    row.appendChild(itemCell);
    row.appendChild(priceCell);
    tbody.appendChild(row);
  });
}

function renderSpecials() {
  const store = storeSelect.value;
  const size = sizeSelect.value;
  const storeInfo = shopData[store];
  if (!storeInfo) return;

  const specials = getSpecialsForSettlement(storeInfo, size);
  renderRows(specialsBody, specials, "No specials available.");
}

function renderBasic() {
  const store = storeSelect.value;
  const size = sizeSelect.value;
  const storeInfo = shopData[store];
  if (!storeInfo) return;

  const villageItems = storeInfo.Village?.Basic ?? [];
  const townItems = size === "Town" ? (storeInfo.Town?.Basic ?? []) : [];
  const basicItems = [...villageItems, ...townItems];

  renderRows(inventoryBody, basicItems, "No basic items available.");
}

function render() {
  renderSpecials();
  renderBasic();
}

async function init() {
  const response = await fetch("./shops.json");
  shopData = await response.json();

  Object.keys(shopData).forEach((storeName) => {
    const option = document.createElement("option");
    option.value = storeName;
    option.textContent = storeName;
    storeSelect.appendChild(option);
  });

  render();
}

storeSelect.addEventListener("change", render);
sizeSelect.addEventListener("change", render);
rerollSpecialsBtn.addEventListener("click", renderSpecials);

init();