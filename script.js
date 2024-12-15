// Telegram Web App Initialization
const tg = window.Telegram.WebApp;
tg.expand();

// Modal elements
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");

// Crypto data configuration
const cryptoData = {
  USDT: { name: "Tether", icon: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
  BTC: { name: "Bitcoin", icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
  ETH: { name: "Ethereum", icon: "ethereum-eth.svg" },
  BNB: { name: "BNB", icon: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png" },
  TON: { name: "Toncoin", icon: "https://cryptologos.cc/logos/toncoin-ton-logo.png" },
  TRX: { name: "Tron", icon: "https://cryptologos.cc/logos/tron-trx-logo.png" },
  XRP: { name: "Ripple", icon: "free-icon-xrp-4821657.png" },
};

const networks = {
  USDT: [
    { name: "TRC-20", icon: "https://cryptologos.cc/logos/tron-trx-logo.png" },
    { name: "ERC-20", icon: "ethereum-eth.svg" },
    { name: "BEP-20", icon: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png" },
    { name: "TON", icon: "https://cryptologos.cc/logos/toncoin-ton-logo.png" },
  ],
};

/** Utility function to show modal */
function showModal(content) {
  modalBody.innerHTML = content;
  modal.style.display = "block";
}

/** Utility function to close modal */
function closeModal() {
  modal.style.display = "none";
}

/** Utility function to copy text to clipboard */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    () => alert("Скопировано!"),
    () => alert("Не удалось скопировать текст")
  );
}

/** Handle top-up modal */
function openTopUp() {
  const options = Object.keys(cryptoData)
    .map(
      (key) => `
        <div class="crypto-option" onclick="selectTopUpCrypto('${key}')">
          <img src="${cryptoData[key].icon}" alt="${key}">
          <span>${cryptoData[key].name}</span>
        </div>`
    )
    .join("");

  showModal(`
    <h2>Выберите криптовалюту для пополнения</h2>
    ${options}
  `);
}

/** Handle selecting crypto for top-up */
function selectTopUpCrypto(crypto) {
  if (crypto === "USDT") {
    const networkOptions = networks[crypto]
      .map(
        (net) => `
          <div class="crypto-option" onclick="confirmTopUp('${crypto}', '${net.name}')">
            <img src="${net.icon}" alt="${net.name}">
            <span>${net.name}</span>
          </div>`
      )
      .join("");

    showModal(`
      <h2>Выберите сеть для USDT</h2>
      ${networkOptions}
    `);
  } else {
    displayWalletAddress(crypto);
  }
}

/** Handle confirming top-up */
function confirmTopUp(crypto, network) {
  displayWalletAddress(`${crypto} (${network})`);
}

/** Display wallet address */
function displayWalletAddress(crypto) {
  const icon = cryptoData[crypto.split(" ")[0]]?.icon || "";
  showModal(`
    <h2>Пополнение</h2>
    <h4>Криптовалюта: <img src="${icon}" alt="${crypto}" style="width: 20px; margin-right: 10px;">${crypto}</h4>
    <div class="wallet-address">
      <p>Кошелек:</p>
      <input type="text" value="12345_${crypto}_ADDRESS" id="wallet-address" readonly>
      <button onclick="copyToClipboard('12345_${crypto}_ADDRESS')">Скопировать</button>
    </div>
  `);
}

/** Handle withdrawal modal */
function openWithdraw() {
  const options = Object.keys(cryptoData)
    .map(
      (key) => `
        <div class="crypto-option" onclick="selectWithdrawCrypto('${key}')">
          <img src="${cryptoData[key].icon}" alt="${key}">
          <span>${cryptoData[key].name}</span>
        </div>`
    )
    .join("");

  showModal(`
    <h2>Выберите криптовалюту для вывода</h2>
    ${options}
  `);
}

/** Handle selecting crypto for withdrawal */
function selectWithdrawCrypto(crypto) {
  if (crypto === "USDT") {
    const networkOptions = networks[crypto]
      .map(
        (net) => `
          <div class="crypto-option" onclick="withdrawForm('${crypto}', '${net.name}')">
            <img src="${net.icon}" alt="${net.name}">
            <span>${net.name}</span>
          </div>`
      )
      .join("");

    showModal(`
      <h2>Выберите сеть для вывода USDT</h2>
      ${networkOptions}
    `);
  } else {
    withdrawForm(crypto);
  }
}

/** Display withdrawal form */
function withdrawForm(crypto, network = null) {
  const networkInfo = network ? ` (${network})` : "";
  const icon = cryptoData[crypto.split(" ")[0]]?.icon || "";

  showModal(`
    <h2>Вывод средств</h2>
    <h4>Криптовалюта: <img src="${icon}" alt="${crypto}" style="width: 20px; margin-right: 10px;">${crypto}${networkInfo}</h4>
    <div class="withdraw-form">
      <label for="withdraw-address">Введите адрес кошелька:</label>
      <input type="text" id="withdraw-address" placeholder="Адрес кошелька">
      <label for="withdraw-amount">Введите сумму:</label>
      <input type="number" id="withdraw-amount" placeholder="Сумма">
      <button onclick="submitWithdraw('${crypto}', '${network}')">Подтвердить</button>
    </div>
  `);
}

/** Handle withdrawal submission */
function submitWithdraw(crypto, network) {
  const address = document.getElementById("withdraw-address").value;
  const amount = document.getElementById("withdraw-amount").value;

  if (!address || !amount) {
    alert("Заполните все поля!");
    return;
  }

  alert(`Запрос на вывод ${amount} ${crypto} отправлен!`);
  closeModal();
}

// Fetch crypto prices and update UI
async function fetchCryptoPrices() {
  const cryptoList = Object.keys(cryptoData).map((key) => cryptoData[key].name.toLowerCase());
  const ids = cryptoList.join(",");

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    );
    const data = await response.json();

    const assetsList = document.getElementById("assets-list");
    assetsList.innerHTML = Object.keys(data)
      .map(
        (key) => `
          <div class="asset">
            <div class="asset-info">
              <img src="${cryptoData[key.toUpperCase()].icon}" alt="${key}">
              <span>${cryptoData[key.toUpperCase()].name}</span>
            </div>
            <div>
              <span class="asset-price">$${data[key].usd.toFixed(2)}</span>
              <span class="asset-change">${data[key].usd_24h_change.toFixed(2)}%</span>
            </div>
          </div>`
      )
      .join("");
  } catch (error) {
    console.error("Failed to fetch crypto prices", error);
    alert("Не удалось загрузить данные о ценах на криптовалюту.");
  }
}

setInterval(fetchCryptoPrices, 90000); // Refresh prices every 90 seconds
fetchCryptoPrices();
