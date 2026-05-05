const produkList = [
    { id: 1, nama: "Samsung Galaxy A14", harga: 2200000 },
    { id: 2, nama: "Samsung Galaxy A24", harga: 3200000 },
    { id: 3, nama: "Samsung Galaxy A34", harga: 4500000 },
    { id: 4, nama: "Samsung Galaxy S21 FE", harga: 8500000 },
    { id: 5, nama: "Samsung Galaxy S23", harga: 12000000 }
];

let cart = [];

const produkEl = document.getElementById("produk");
const cartEl = document.getElementById("cartItems");
const totalEl = document.getElementById("total");
const badge = document.getElementById("badge");

// format rupiah
function rupiah(angka) {
    return angka.toLocaleString("id-ID");
}

// render produk
produkList.forEach(p => {
    produkEl.innerHTML += `
    <div class="card">
      <img src="https://picsum.photos/200?random=${p.id}">
      <h4>${p.nama}</h4>
      <p>Rp ${rupiah(p.harga)}</p>
      <button class="tambah" onclick="addToCart(${p.id})">Tambah</button>
    </div>
  `;
});

function addToCart(id) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty++;
    } else {
        const produk = produkList.find(p => p.id === id);
        cart.push({ ...produk, qty: 1 });
    }
    renderCart();
}

function renderCart() {
    cartEl.innerHTML = "";
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.harga * item.qty;
        count += item.qty;

        cartEl.innerHTML += `
      <div class="item">
        <div>
          <b>${item.nama}</b><br>
          Rp ${rupiah(item.harga)}
        </div>
        <div class="qty">
          <button onclick="ubahQty(${item.id}, -1)">-</button>
          <span>${item.qty}</span>
          <button onclick="ubahQty(${item.id}, 1)">+</button>
          <button onclick="hapus(${item.id})">x</button>
        </div>
      </div>
    `;
    });

    totalEl.textContent = rupiah(total);
    badge.textContent = count;
}

function ubahQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += change;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    renderCart();
}

function hapus(id) {
    cart = cart.filter(i => i.id !== id);
    renderCart();
}

function checkout() {
    if (cart.length === 0) return alert("Keranjang kosong!");

    let ringkasan = "🧾 Struk Pembelian HP Samsung\n\n";
    let total = 0;

    cart.forEach(item => {
        ringkasan += `${item.nama} x${item.qty}\nRp ${rupiah(item.harga * item.qty)}\n\n`;
        total += item.harga * item.qty;
    });

    ringkasan += `Total Bayar: Rp ${rupiah(total)}`;
    alert(ringkasan);
}