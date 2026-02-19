// ===========================
// AUTO GENERATE SKIN NAME (5 huruf awal)
// ===========================
function autoSkinFromName(name) {
  const cleaned = name.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
  const prefix = cleaned.substring(0, 5);
  return `skin/${prefix}.png`;
}

// ===========================
// LOAD IMAGE DENGAN FALLBACK
// ===========================
function loadImageWithFallback(src, fallback) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.src = fallback;
    };
    img.src = src;
  });
}

// ===========================
// LOAD DATA GOOGLE SHEET
// ===========================
async function loadPlayersFromSheet() {
  const url =
    "https://docs.google.com/spreadsheets/d/1nUQXKA_X6z3F3pzmMEyLm66SkPpfZZItjPsXMGvZQXs/gviz/tq?tqx=out:json";

  const res = await fetch(url);
  const text = await res.text();

  const json = JSON.parse(
    text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
  );

  const rows = json.table.rows;

  let obj = {};
  let index = 1;

  for (let i = 0; i < rows.length; i++) {
    const c = rows[i].c;
    if (!c) continue;

    const name = c[2]?.v || ""; // kolom nama
    if (!name) continue;

    obj[`player${index}`] = {
      name: name,
      skin: autoSkinFromName(name),
      discord: c[3]?.v || "",
      rank: c[4]?.v || "",
      timezone: c[5]?.v || "",
      free: c[6]?.v || "",
      role: c[7]?.v || "",
      moto: c[8]?.v || "",
      about: c[9]?.v || "",
      hobby: c[10]?.v || "",
      cita: c[11]?.v || "",
      isSlim: (c[12]?.v || "").toLowerCase() === "slim",
    };

    index++;
  }

  window.players = obj;
  window.originalOrder = Object.keys(obj);

  renderPlayerList();
}

// ===========================
// RENDER HANYA HEAD UNTUK LIST
// ===========================
function renderHead(canvas, skinPath) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  loadImageWithFallback(skinPath, "skin/steve.png").then((img) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 8, 8, 8, 8, 0, 0, 64, 64);
    ctx.drawImage(img, 40, 8, 8, 8, 0, 0, 64, 64);
  });
}

// ===========================
// RENDER FULL BODY UNTUK OVERLAY
// ===========================
function renderFullBody(canvas, skinPath, isSlim) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  loadImageWithFallback(skinPath, "skin/steve.png").then((img) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = 2;
    const armWidth = isSlim ? 3 : 4;

    // Kepala
    ctx.drawImage(img, 8, 8, 8, 8, 8, 0, 8 * scale, 8 * scale);
    ctx.drawImage(img, 40, 8, 8, 8, 8, 0, 8 * scale, 8 * scale);

    // Badan
    ctx.drawImage(img, 20, 20, 8, 12, 8, 16, 8 * scale, 12 * scale);
    ctx.drawImage(img, 20, 36, 8, 12, 8, 16, 8 * scale, 12 * scale);

    // Lengan kiri (geser 3px ke kiri jika wide)
    const leftArmX = isSlim ? 2 : 0;
    ctx.drawImage(img, 44, 20, armWidth, 12, leftArmX, 16, armWidth * scale, 12 * scale);

    // Lengan kanan
    ctx.drawImage(img, 36, 52, armWidth, 12, 24, 16, armWidth * scale, 12 * scale);

    // Kaki kiri
    ctx.drawImage(img, 4, 20, 4, 12, 8, 40, 4 * scale, 12 * scale);

    // Kaki kanan
    ctx.drawImage(img, 20, 52, 4, 12, 16, 40, 4 * scale, 12 * scale);
  });
}

// ===========================
// RENDER PLAYER LIST
// ===========================
function renderPlayerList() {
  const list = document.getElementById("playerList");
  list.innerHTML = "";

  let i = 1;
  for (const key in players) {
    const p = players[key];

    const item = document.createElement("div");
    item.className = "player-item";
    item.dataset.key = key; // penting untuk sort
    item.onclick = () => showOverlay(key);

    item.innerHTML = `
      <canvas id="head${i}" width="64" height="64"></canvas>
      <span>${p.name}</span>
    `;

    list.appendChild(item);

    const canvas = document.getElementById(`head${i}`);
    renderHead(canvas, p.skin);

    i++;
  }
}

// ===========================
// SHOW OVERLAY PLAYER
// ===========================
function showOverlay(id) {
  const p = players[id];
  if (!p) return;

  document.getElementById("ov-name").textContent = p.name;
  document.getElementById("ov-discord").textContent = p.discord;
  document.getElementById("ov-rank").textContent = p.rank;
  document.getElementById("ov-role").textContent = p.role;
  document.getElementById("ov-timezone").textContent = p.timezone;
  document.getElementById("ov-free").textContent = p.free;
  document.getElementById("ov-hobby").textContent = p.hobby;
  document.getElementById("ov-cita").textContent = p.cita;
  document.getElementById("ov-about").textContent = p.about;
  document.getElementById("ov-moto").textContent = p.moto;

  const canvas = document.getElementById("ov-skin");
  renderFullBody(canvas, p.skin, p.isSlim);

  const overlay = document.getElementById("playerOverlay");
  overlay.classList.remove("hidden");
  overlay.classList.add("show");
}

function closeOverlay() {
  const overlay = document.getElementById("playerOverlay");
  overlay.classList.add("hidden");
}

// ===========================
// SEARCH
// ===========================
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const items = document.querySelectorAll(".player-item");

  items.forEach((item) => {
    const name = item.querySelector("span").textContent.toLowerCase();
    item.style.display = name.includes(term) ? "flex" : "none";
  });
});

// ===========================
// TOGGLE SORT A-Z / DEFAULT
// ===========================
let isSortedAZ = false; // status toggle
const sortBtn = document.getElementById("sortBtn"); // tombol toggle sort

sortBtn.addEventListener("click", () => {
  const list = document.getElementById("playerList");
  const items = Array.from(document.querySelectorAll(".player-item"));

  let sorted;

  if (!isSortedAZ) {
    // mode A-Z
    sorted = [...items].sort((a, b) =>
      a.querySelector("span").textContent.localeCompare(
        b.querySelector("span").textContent
      )
    );
    isSortedAZ = true;
  } else {
    // mode Default (urutan asli)
    sorted = [...items].sort((a, b) =>
      window.originalOrder.indexOf(a.dataset.key) -
      window.originalOrder.indexOf(b.dataset.key)
    );
    isSortedAZ = false;
  }

  list.innerHTML = "";
  sorted.forEach((item) => list.appendChild(item));
});

/* ======================================================
   LOAD SIDEBAR + FUNGSI-FUNGSI
====================================================== */
fetch('sidebar.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('sidebar-container').innerHTML = html;

    const sidebar = document.querySelector('.sidebar');
    const menuBtn = document.getElementById('menuBtn');

    /* SIDEBAR TOGGLE + ANIMASI MENU BTN */
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
      menuBtn.classList.toggle('active'); // animasi garis → panah
    });

    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebar.classList.remove('active');
        menuBtn.classList.remove('active'); // reset animasi
      }
    });

    document.querySelectorAll('.sidebar a').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('active');
        menuBtn.classList.remove('active'); // reset animasi
      });
    });

    /* MENANDAI HALAMAN AKTIF */
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.sidebar a').forEach(link => {
      const target = link.getAttribute('href');
      link.classList.remove('active');
      if (target === currentPage) link.classList.add('active');
    });

    /* SET JUDUL HEADER */
    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
      pageTitle.textContent = document.body.getAttribute("data-title");
    }
  });
// ===========================
// SCROLL FIX OVERLAY
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("playerOverlay");
  const content = overlay.querySelector(".overlay-content");

  overlay.addEventListener(
    "wheel",
    (e) => {
      const canScroll =
        content.scrollHeight > content.clientHeight &&
        ((e.deltaY < 0 && content.scrollTop > 0) ||
          (e.deltaY > 0 &&
            content.scrollTop + content.clientHeight < content.scrollHeight));

      if (canScroll) e.stopPropagation();
    },
    { passive: false }
  );

  content.style.maxHeight = "85vh";
  content.style.overflowY = "auto";
  content.style.overscrollBehavior = "contain";
});

// ===========================
// START
// ===========================
loadPlayersFromSheet();