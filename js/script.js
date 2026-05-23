/* ═══════════════════════════════════════════════════════
   MESHIMAP — script.js  (Full User Flow Edition)
   ═══════════════════════════════════════════════════════
   Kiến trúc:
   - Không dùng class CSS để gắn event (dùng data-action)
   - Mọi routing qua <a href> hoặc window.location
   - localStorage lưu: auth state, search query
   ═══════════════════════════════════════════════════════ */

/* ─── 1. COMPONENT INJECTION (Header / Footer) ──────── */
async function injectComponent(slotId, filePath) {
  const slot = document.getElementById(slotId);
  if (!slot) return;
  try {
    const res  = await fetch(filePath);
    if (!res.ok) return;
    slot.innerHTML = await res.text();
  } catch (e) {
    console.warn('[Meshimap] Component load failed:', filePath);
  }
}

function resolveComponentPath(filename) {
  const inSubPage = location.pathname.includes('/pages/');
  return (inSubPage ? '../' : '') + 'components/' + filename;
}

function resolvePath(path) {
  const inSubPage = location.pathname.includes('/pages/');
  return inSubPage ? '../' + path : path;
}

// Navigate to a root-relative path from any page depth
function navTo(rootRelativePath) {
  window.location.href = resolvePath(rootRelativePath);
}

async function initComponents() {
  await Promise.all([
    injectComponent('header-slot', resolveComponentPath('header.html')),
    injectComponent('footer-slot', resolveComponentPath('footer.html')),
  ]);
  updateHeaderAuthState();
  setActiveNavLink();
  bindAllEvents();
}

/* ─── 2. AUTH STATE ─────────────────────────────────── */
function getUser() {
  try { return JSON.parse(localStorage.getItem('meshimap_user') || 'null'); } catch { return null; }
}

function setUser(user) {
  localStorage.setItem('meshimap_user', JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem('meshimap_user');
}

function updateHeaderAuthState() {
  const user    = getUser();
  const loginBtn  = document.getElementById('btn-login');
  const avatarEl  = document.getElementById('user-avatar');

  if (!loginBtn) return;

  if (user) {
    // Thay nút "Đăng nhập" bằng avatar
    if (user.avatar) {
      let avatarSrc = user.avatar;
      if (avatarSrc.startsWith('../') && !location.pathname.includes('/pages/')) {
        avatarSrc = avatarSrc.replace('../', '');
      } else if (!avatarSrc.startsWith('../') && !avatarSrc.startsWith('data:') && location.pathname.includes('/pages/')) {
        avatarSrc = '../' + avatarSrc;
      }
      loginBtn.innerHTML = `<img src="${avatarSrc}" style="width:100%;height:100%;border-radius:50%;object-fit:cover" />`;
      loginBtn.style.cssText = 'width:36px;height:36px;border-radius:50%;padding:0;cursor:pointer;border:none;display:flex;align-items:center;justify-content:center;overflow:hidden;background:none;';
    } else {
      loginBtn.textContent   = user.name.charAt(0).toUpperCase();
      loginBtn.style.cssText = 'width:36px;height:36px;border-radius:50%;background:var(--clr-light);color:var(--clr-dark);font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;font-family:var(--font-body)';
    }
    loginBtn.removeAttribute('href');
    loginBtn.dataset.action = 'open-user-menu';
    loginBtn.title = user.name;
  }
}

/* ─── 3. ACTIVE NAV LINK ────────────────────────────── */
function setActiveNavLink() {
  const path = location.pathname;
  document.querySelectorAll('[data-page]').forEach(link => {
    link.classList.remove('header__nav-link--active');
    const page = link.dataset.page;
    const isHome    = page === 'home'    && (path.endsWith('index.html') || path.endsWith('/') || path.endsWith('meshimap-html/'));
    const isSearch  = page === 'search'  && (path.includes('search-results') || path.includes('tim-kiem'));
    const isBooking = page === 'booking' && (path.includes('restaurant-detail') || path.includes('dat-ban'));
    if (isHome || isSearch || isBooking) link.classList.add('header__nav-link--active');
  });
}

/* ─── 4. GLOBAL EVENT DELEGATION ───────────────────── */
function bindAllEvents() {
  document.addEventListener('click',  handleGlobalClick);
  document.addEventListener('submit', handleGlobalSubmit);
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('change', handleGlobalChange);
  document.addEventListener('input',  handleGlobalInput);
}

function handleGlobalClick(e) {
  const el = e.target.closest('[data-action]');
  if (!el) return;

  switch (el.dataset.action) {
    case 'toggle-menu':   toggleMobileMenu();           break;
    case 'toggle-lang':   toggleLanguage(el);           break;
    case 'search-submit': handleSearch(el);             break;
    case 'chip-filter':   handleChipFilter(el.dataset.value); break;
    case 'filter':        handleCategoryFilter(el);    break;
    case 'select-lang':   handleLangOption(el);        break;
    case 'close-modal':   closeModal(el.dataset.target); break;
    case 'trigger-upload': document.getElementById('photo-upload')?.click(); break;
    case 'trigger-avatar-upload': document.getElementById('avatar-upload')?.click(); break;
    case 'profile-cancel': e.preventDefault(); navTo('index.html'); break;
    case 'open-user-menu': showUserMenu(el);            break;
    case 'logout':        handleLogout();               break;
    case 'toggle-password': togglePassword(el);         break;
    // ── Nav links (resolve path from shared header) ──
    case 'go-home':    e.preventDefault(); navTo('index.html');                    break;
    case 'nav-home':   e.preventDefault(); navTo('index.html');                    break;
    case 'nav-search': e.preventDefault(); navTo('pages/search-results.html');     break;
    case 'nav-booking':e.preventDefault(); navTo('pages/restaurant-detail.html');  break;
    case 'nav-login':  e.preventDefault(); navTo('pages/login.html');              break;
  }
}

function handleGlobalSubmit(e) {
  const form = e.target.closest('[data-action]');
  if (!form) return;
  e.preventDefault();

  switch (form.dataset.action) {
    case 'submit-login':    handleLogin(form);    break;
    case 'submit-register': handleRegister(form); break;
    case 'submit-booking':  handleBooking(form);  break;
    case 'submit-review':   handleReview(form);   break;
    case 'submit-profile':  handleProfileSubmit(form); break;
  }
}

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('[data-modal]').forEach(m => m.style.display = 'none');
    closeMobileMenu();
    document.body.style.overflow = '';
  }
  // Search Enter key
  if (e.key === 'Enter' && e.target.matches('[data-action="search-input"]')) {
    handleSearch();
  }
}

function handleGlobalChange(e) {
  if (e.target.dataset.action === 'sort') filterResults();
  if (e.target.id === 'photo-upload')     handlePhotoUpload(e.target);
  if (e.target.id === 'avatar-upload')    handleAvatarUpload(e.target);
}

function handleGlobalInput(e) {
  // Char count for review textarea
  if (e.target.id === 'review-content') {
    const el = document.getElementById('char-count');
    if (el) el.textContent = `${e.target.value.length} / 500 ký tự`;
  }
  // Live search filter
  if (e.target.id === 'search-input') filterResults();
}

/* ─── 5. MOBILE MENU ────────────────────────────────── */
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('is-open');
}
function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.remove('is-open');
}

/* ─── 6. LANGUAGE ───────────────────────────────────── */
let currentLang = 'VN/JP';
function toggleLanguage(btn) {
  currentLang = currentLang === 'VN/JP' ? 'JP/VN' : 'VN/JP';
  const label = btn.querySelector('[data-lang-label]');
  if (label) label.textContent = currentLang;
}

function togglePassword(btn) {
  const inputId = btn.dataset.target;
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

function handleLangOption(el) {
  // For register/review lang selection buttons
  const group = el.closest('.lang-options, [style]');
  el.closest('div').querySelectorAll('[data-action="select-lang"]').forEach(btn => {
    btn.classList.remove('is-selected');
    btn.style.background     = 'white';
    btn.style.color          = 'var(--clr-dark)';
    btn.style.borderColor    = 'var(--clr-border)';
    btn.style.fontWeight     = '400';
  });
  el.classList.add('is-selected');
  el.style.background  = '#fff8f5';
  el.style.color       = 'var(--clr-primary)';
  el.style.borderColor = 'var(--clr-primary)';
  el.style.fontWeight  = '600';
}

/* ─── 7. SEARCH ─────────────────────────────────────── */
function handleSearch(triggerEl) {
  const input = document.querySelector('[data-action="search-input"], .search-bar__input');
  const q     = input ? input.value.trim() : '';

  // Save to localStorage
  if (q) localStorage.setItem('meshimap_last_search', q);

  // Resolve target — detect page depth
  const inSubPage = location.pathname.includes('/pages/');
  const target    = triggerEl?.dataset.target
    || (inSubPage ? 'search-results.html' : 'pages/search-results.html');

  window.location.href = q
    ? `${target}?q=${encodeURIComponent(q)}`
    : target;
}

/* ─── 8. CATEGORY FILTER ────────────────────────────── */
function handleCategoryFilter(btn) {
  document.querySelectorAll('[data-action="filter"]').forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  filterResults();
}

function handleChipFilter(value) {
  const inSubPage = location.pathname.includes('/pages/');
  const base      = inSubPage ? 'search-results.html' : 'pages/search-results.html';
  window.location.href = `${base}?filter=${encodeURIComponent(value)}`;
}

/* ─── 9. RESULTS FILTERING ──────────────────────────── */
function filterResults() {
  const activeFilter = document.querySelector('[data-action="filter"].is-active');
  const category     = activeFilter ? activeFilter.dataset.category : 'all';
  const sortEl       = document.querySelector('[data-action="sort"]');
  const sort         = sortEl ? sortEl.value : 'rating';
  const searchInput  = document.getElementById('search-input');
  const query        = searchInput ? searchInput.value.toLowerCase() : '';

  const allItems = document.querySelectorAll('[data-category]');
  let count = 0;

  allItems.forEach(item => {
    const matchCat   = category === 'all' || item.dataset.category === category;
    const name       = (item.querySelector('.card__title') || item.querySelector('.result-card__title'))?.textContent.toLowerCase() || '';
    const location   = (item.querySelector('.card__location') || item.querySelector('.result-card__location'))?.textContent.toLowerCase() || '';
    const matchQuery = !query || name.includes(query) || location.includes(query);

    if (matchCat && matchQuery) {
      item.style.display = '';
      count++;
    } else {
      item.style.display = 'none';
    }
  });

  const countEls = document.querySelectorAll('[data-results-count]');
  countEls.forEach(el => el.textContent = count);
}

/* ─── 10. AUTH — LOGIN ──────────────────────────────── */
function handleLogin(form) {
  const email    = form.querySelector('#login-email');
  const password = form.querySelector('#login-password');
  const alert    = document.getElementById('login-alert');
  let valid = true;

  // Reset
  [email, password].forEach(f => { if (f) f.classList.remove('is-error'); });
  document.querySelectorAll('.form-error').forEach(e => e.classList.remove('is-visible'));
  if (alert) alert.classList.remove('is-visible');

  // Validate
  if (!email?.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    email?.classList.add('is-error');
    document.getElementById('email-error')?.classList.add('is-visible');
    valid = false;
  }
  if (!password?.value) {
    password?.classList.add('is-error');
    document.getElementById('pass-error')?.classList.add('is-visible');
    valid = false;
  }
  if (!valid) return;

  // Simulate auth — detect role from email
  const emailVal = email.value.toLowerCase();
  let role = 'user';
  if (emailVal.includes('owner')) {
    role = 'owner';
  } else if (emailVal.includes('admin')) {
    role = 'admin';
  }

  const DEMO_USER = { email: email.value, name: email.value.split('@')[0], role: role };
  setUser(DEMO_USER);

  // Redirect based on role
  const btn = form.querySelector('[type="submit"]');
  if (btn) { btn.textContent = 'Đang đăng nhập...'; btn.disabled = true; }
  setTimeout(() => {
    if (role === 'owner') {
      window.location.href = 'owner-dashboard.html';
    } else if (role === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = '../index.html';
    }
  }, 800);
}

/* ─── 11. AUTH — REGISTER ───────────────────────────── */
function handleRegister(form) {
  const name     = form.querySelector('#reg-name');
  const email    = form.querySelector('#reg-email');
  const password = form.querySelector('#reg-password');
  const confirm  = form.querySelector('#reg-confirm');
  let valid = true;

  // Reset errors
  form.querySelectorAll('.field-error').forEach(e => e.classList.remove('is-visible'));
  form.querySelectorAll('.auth-input').forEach(i => i.classList.remove('is-error'));

  if (!name?.value.trim()) {
    document.getElementById('name-error')?.classList.add('is-visible');
    name?.classList.add('is-error');
    valid = false;
  }
  if (!email?.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    document.getElementById('reg-email-error')?.classList.add('is-visible');
    email?.classList.add('is-error');
    valid = false;
  }
  if (!password?.value || password.value.length < 8) {
    document.getElementById('reg-pass-error')?.classList.add('is-visible');
    password?.classList.add('is-error');
    valid = false;
  }
  if (confirm && confirm.value !== password?.value) {
    document.getElementById('confirm-error')?.classList.add('is-visible');
    confirm.classList.add('is-error');
    valid = false;
  }
  
  if (!valid) return;

  const emailVal = email.value.toLowerCase();
  let role = 'user';
  if (emailVal.includes('owner')) {
    role = 'owner';
  } else if (emailVal.includes('admin')) {
    role = 'admin';
  }

  setUser({ email: email.value, name: name.value.trim(), role: role });

  const btn = form.querySelector('[type="submit"]');
  if (btn) { btn.textContent = 'Đang tạo tài khoản...'; btn.disabled = true; }
  setTimeout(() => {
    if (role === 'owner') {
      window.location.href = 'owner-dashboard.html';
    } else if (role === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = '../index.html';
    }
  }, 800);
}

/* ─── 12. AUTH — LOGOUT ─────────────────────────────── */
function handleLogout() {
  clearUser();
  // Redirect to login page regardless of current page depth
  const inSubPage = location.pathname.includes('/pages/');
  window.location.href = inSubPage ? 'login.html' : 'pages/login.html';
}

function showUserMenu(btn) {
  // Simple inline dropdown
  let menu = document.getElementById('user-dropdown');
  if (menu) { menu.remove(); return; }

  menu = document.createElement('div');
  menu.id = 'user-dropdown';
  menu.style.cssText = 'position:absolute;top:calc(100% + 8px);right:0;background:#fff;border:1px solid var(--clr-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.1);min-width:180px;z-index:200;overflow:hidden;';

  const user = getUser();
  let roleDashboardLink = '';
  if (user?.role === 'owner') {
    roleDashboardLink = `<a href="${resolvePath('pages/owner-dashboard.html')}" style="display:block;padding:12px 16px;font-family:var(--font-body);font-size:14px;color:var(--clr-primary);font-weight:600;text-align:left;border-bottom:1px solid var(--clr-border)">Dashboard Chủ nhà</a>`;
  } else if (user?.role === 'admin') {
    roleDashboardLink = `<a href="${resolvePath('pages/admin-dashboard.html')}" style="display:block;padding:12px 16px;font-family:var(--font-body);font-size:14px;color:var(--clr-primary);font-weight:600;text-align:left;border-bottom:1px solid var(--clr-border)">Dashboard Admin</a>`;
  }

  menu.innerHTML = `
    <div style="padding:12px 16px;font-size:12px;color:var(--clr-muted);border-bottom:1px solid var(--clr-border)">${user?.email || ''} (${user?.role || 'user'})</div>
    ${roleDashboardLink}
    <a href="${resolvePath('pages/profile.html')}" style="display:block;padding:12px 16px;font-family:var(--font-body);font-size:14px;color:var(--clr-dark);text-align:left;border-bottom:1px solid var(--clr-border)">Hồ sơ cá nhân</a>
    <button data-action="logout" style="display:block;width:100%;padding:12px 16px;text-align:left;background:none;border:none;font-family:var(--font-body);font-size:14px;color:var(--clr-dark);cursor:pointer;">Đăng xuất</button>
  `;

  btn.style.position = 'relative';
  btn.appendChild(menu);
}

/* ─── 13. BOOKING FORM ──────────────────────────────── */
function handleBooking(form) {
  const date = form.querySelector('#booking-date');
  if (!date?.value) {
    date.style.borderColor = '#e53e3e';
    date.focus();
    setTimeout(() => { date.style.borderColor = ''; }, 3000);
    return;
  }

  // Save booking to localStorage
  const booking = {
    date: date.value,
    time: form.querySelector('#booking-time')?.value,
    guests: form.querySelector('#booking-guests')?.value,
    note: form.querySelector('#booking-note')?.value,
    restaurant: document.querySelector('.detail__title')?.textContent || 'Nhà hàng',
    createdAt: new Date().toISOString(),
  };
  const bookings = JSON.parse(localStorage.getItem('meshimap_bookings') || '[]');
  bookings.push(booking);
  localStorage.setItem('meshimap_bookings', JSON.stringify(bookings));

  openModal('modal-booking-success');
}

/* ─── 14. REVIEW FORM ───────────────────────────────── */
function handleReview(form) {
  const rating  = form.querySelector('input[name="rating"]:checked');
  const title   = form.querySelector('#review-title');
  const content = form.querySelector('#review-content');
  let valid = true;

  // Reset errors
  ['star-error','title-error','content-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (!rating) {
    const el = document.getElementById('star-error');
    if (el) el.style.display = 'block';
    valid = false;
  }
  if (!title?.value.trim()) {
    const el = document.getElementById('title-error');
    if (el) el.style.display = 'block';
    title?.focus();
    valid = false;
  }
  if (!content?.value.trim()) {
    const el = document.getElementById('content-error');
    if (el) el.style.display = 'block';
    valid = false;
  }
  if (!valid) return;

  // Save to localStorage
  const params = new URLSearchParams(location.search);
  const review = {
    restaurant: params.get('restaurant') || 'unknown',
    rating: rating?.value,
    title: title?.value,
    content: content?.value,
    date: form.querySelector('#visit-date')?.value,
    author: getUser()?.name || 'Ẩn danh',
    createdAt: new Date().toISOString(),
  };
  const reviews = JSON.parse(localStorage.getItem('meshimap_reviews') || '[]');
  reviews.push(review);
  localStorage.setItem('meshimap_reviews', JSON.stringify(reviews));

  // Show success, reset form
  const banner = document.getElementById('success-banner');
  if (banner) { banner.classList.add('is-visible'); banner.scrollIntoView({ behavior: 'smooth' }); }
  form.reset();
  document.querySelectorAll('.star-rating label').forEach(l => l.style.color = '');

  // Redirect to detail page after delay
  setTimeout(() => {
    const restaurant = params.get('restaurant') || '';
    window.location.href = `restaurant-detail.html${restaurant ? '?restaurant=' + restaurant : ''}`;
  }, 2000);
}

/* ─── 15. PHOTO UPLOAD PREVIEW ──────────────────────── */
function handlePhotoUpload(input) {
  const preview = document.getElementById('upload-preview');
  if (!preview) return;
  preview.innerHTML = '';

  Array.from(input.files).slice(0, 5).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.cssText = 'width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid var(--clr-border)';
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

/* ─── 16. MODAL ─────────────────────────────────────── */
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.style.display    = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal(selector) {
  const id    = selector ? selector.replace('#', '') : null;
  const modal = id ? document.getElementById(id) : null;
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

/* ─── 17. URL PARAM INIT ────────────────────────────── */
function initFromURLParams() {
  const params = new URLSearchParams(location.search);
  const q      = params.get('q') || localStorage.getItem('meshimap_last_search') || '';
  const filter = params.get('filter');

  // Pre-fill search input
  if (q) {
    const input = document.getElementById('search-input');
    if (input) {
      input.value = q;
      const label = document.getElementById('query-display');
      if (label) label.textContent = q;
    }
  }

  // Activate filter chip
  if (filter) {
    const btn = document.querySelector(`[data-action="filter"][data-category="${filter}"]`);
    if (btn) {
      document.querySelectorAll('[data-action="filter"]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    }
  }

  filterResults();
}

/* ─── 18. SCROLL ANIMATIONS ─────────────────────────── */
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .cta__card, .review, .detail__info-item').forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    obs.observe(el);
  });
}

/* ─── 19. PROFILE PAGE LOGIC ────────────────────────── */
let tempAvatarDataUrl = null;

function initProfilePage() {
  if (!location.pathname.includes('profile.html')) return;

  const user = getUser() || {
    name: 'Yuki Nguyen',
    email: 'yuki.nguyen@example.com',
    nickname: 'Yuki Nguyen',
    birthMonth: '1',
    birthDay: '15',
    birthYear: '1995',
    hometown: 'Hà Nội, Việt Nam',
    bio: 'Chào mọi người, mình là Yuki. Mình rất yêu thích ẩm thực Nhật Bản và Việt Nam! 🇯🇵🇻🇳',
    avatar: '../assets/images/user-profile-avatar.png'
  };

  const nicknameInput = document.getElementById('profile-nickname');
  const monthSelect = document.getElementById('profile-birth-month');
  const daySelect = document.getElementById('profile-birth-day');
  const yearSelect = document.getElementById('profile-birth-year');
  const hometownInput = document.getElementById('profile-hometown');
  const bioTextarea = document.getElementById('profile-bio');
  const avatarPreview = document.getElementById('avatar-preview');

  if (nicknameInput) nicknameInput.value = user.nickname || user.name || '';
  if (monthSelect) monthSelect.value = user.birthMonth || '1';
  if (daySelect) daySelect.value = user.birthDay || '15';
  if (yearSelect) yearSelect.value = user.birthYear || '1995';
  if (hometownInput) hometownInput.value = user.hometown || 'Hà Nội, Việt Nam';
  if (bioTextarea) bioTextarea.value = user.bio || '';
  if (avatarPreview && user.avatar) avatarPreview.src = user.avatar;

  if (!getUser()) {
    setUser(user);
    updateHeaderAuthState();
  }
}

function handleAvatarUpload(input) {
  const preview = document.getElementById('avatar-preview');
  if (!preview || !input.files || !input.files[0]) return;

  const file = input.files[0];
  if (!file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = e => {
    preview.src = e.target.result;
    tempAvatarDataUrl = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleProfileSubmit(form) {
  const user = getUser() || {};
  user.name = document.getElementById('profile-nickname')?.value || user.name;
  user.nickname = document.getElementById('profile-nickname')?.value;
  user.birthMonth = document.getElementById('profile-birth-month')?.value;
  user.birthDay = document.getElementById('profile-birth-day')?.value;
  user.birthYear = document.getElementById('profile-birth-year')?.value;
  user.hometown = document.getElementById('profile-hometown')?.value;
  user.bio = document.getElementById('profile-bio')?.value;

  if (tempAvatarDataUrl) {
    user.avatar = tempAvatarDataUrl;
  }

  setUser(user);
  updateHeaderAuthState();

  const banner = document.getElementById('profile-success');
  if (banner) {
    banner.classList.add('is-visible');
    banner.scrollIntoView({ behavior: 'smooth' });
  }

  const btn = form.querySelector('[type="submit"]');
  if (btn) {
    btn.textContent = 'Đang lưu...';
    btn.disabled = true;
  }

  setTimeout(() => {
    window.location.href = '../index.html';
  }, 1500);
}

/* ─── INIT ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await initComponents();
  initFromURLParams();
  initProfilePage();
  initScrollAnimations();
});
