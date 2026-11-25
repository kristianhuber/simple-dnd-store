let shopData = {};

const storeSelect = document.getElementById("store-select");
const sizeSelect = document.getElementById("size-select");
const inventoryBody = document.getElementById("inventory-body");

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

function render() {
  const store = storeSelect.value;
  const size = sizeSelect.value;
  const storeInfo = shopData[store];

  if (!storeInfo) return;

  const villageItems = storeInfo.Village?.Basic ?? [];
  const townItems = size === "Town" ? (storeInfo.Town?.Basic ?? []) : [];
  const items = [...villageItems, ...townItems];

  inventoryBody.innerHTML = "";

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
    inventoryBody.appendChild(row);
  });
}

storeSelect.addEventListener("change", render);
sizeSelect.addEventListener("change", render);

init();