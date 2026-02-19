const sidebar = document.querySelector('.sidebar');
const menuBtn = document.getElementById('menuBtn');

// Klik tombol ☰ untuk buka/tutup sidebar + animasi
menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  sidebar.classList.toggle('active');
  menuBtn.classList.toggle('active');
});

// Klik di luar sidebar → tutup
document.addEventListener('click', (e) => {
  const isInsideSidebar = sidebar.contains(e.target);
  const isMenuBtn = menuBtn.contains(e.target);
  if (!isInsideSidebar && !isMenuBtn) {
    sidebar.classList.remove('active');
    menuBtn.classList.remove('active');
  }
});

// Klik link dalam sidebar → tutup juga
document.querySelectorAll('.sidebar a').forEach(link => {
  link.addEventListener('click', () => {
    sidebar.classList.remove('active');
    menuBtn.classList.remove('active');
  });
});