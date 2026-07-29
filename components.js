/* =========================================================
   منصة اتقِ الله — Shared Components (components.js)
   فوتر احترافي · شريط تنقل سفلي · Service Worker · App-like
   ========================================================= */

(function () {
  'use strict';

  const curPage = (window.location.pathname.split('/').pop() || 'index.html');
  const isAuth = !!localStorage.getItem('authenticatedUserEmail');
  const isAdmin = !!localStorage.getItem('tamerElGearAdminAuthenticated');
  const act = (p) => curPage === p ? 'active' : '';

  /* ═════════════════════ PWA Service Worker ═════════════════════ */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW reg error:', err));
    });
  }

  /* ═════════════════════ ROUTE GUARD ═════════════════════ */
  window.requireAuth = function (targetUrl = 'auth.html') {
    if (!localStorage.getItem('authenticatedUserEmail')) {
      alert('عذراً عزيزي الطالب! يجب تسجيل الدخول أو إنشاء حساب للاستفادة الكاملة من ميزات منصة اتقِ الله.');
      window.location.href = targetUrl;
      return false;
    }
    return true;
  };

  /* ═════════════════════ HEADER ═════════════════════ */
  function renderHeader() {
    const h = document.createElement('header');
    h.id = 'shared-header';

    const pubLinks = `
      <li><a href="index.html"     class="nav-link ${act('index.html')}"><i class="fa-solid fa-house"></i> الرئيسية</a></li>
      <li><a href="hub.html"       class="nav-link ${act('hub.html')}"><i class="fa-solid fa-graduation-cap"></i> دليل الكليات</a></li>
      <li><a href="library.html"   class="nav-link ${act('library.html')}"><i class="fa-solid fa-book-open"></i> الدروس والمكتبة</a></li>
      <li><a href="community.html" class="nav-link ${act('community.html')}"><i class="fa-solid fa-users-bubble"></i> المجتمع والشات</a></li>
      <li><a href="store.html"     class="nav-link ${act('store.html')}"><i class="fa-solid fa-gift"></i> متجر الهدايا</a></li>
      <li><a href="teachers.html"  class="nav-link ${act('teachers.html')}"><i class="fa-solid fa-chalkboard-user"></i> المدرسين</a></li>
      <li><a href="about.html"     class="nav-link ${act('about.html')}"><i class="fa-solid fa-circle-info"></i> رؤيتنا</a></li>
      <li><a href="news.html"      class="nav-link ${act('news.html')}"><i class="fa-solid fa-newspaper"></i> الأخبار</a></li>
      <li><a href="support.html"   class="nav-link ${act('support.html')}"><i class="fa-solid fa-headset"></i> الدعم</a></li>
    `;
    const admLinks = isAdmin ? `
      <li><a href="admin-news.html"  class="nav-link ${act('admin-news.html')} nav-cta" style="background: linear-gradient(135deg,#832527,#5A1C1C); color:#fff !important;"><i class="fa-solid fa-sliders"></i> لوحة التحكم</a></li>
    ` : '';
    const authLink = isAuth
      ? `<li><a href="profile.html" class="nav-link ${act('profile.html')} nav-cta"><i class="fa-solid fa-user-circle"></i> حسابي</a></li>`
      : `<li><a href="auth.html" class="nav-link ${act('auth.html')} nav-cta">تسجيل الدخول</a></li>`;

    h.innerHTML = `
      <nav>
        <a href="index.html" class="logo">
          <i class="fa-solid fa-kaaba logo-icon"></i>
          <span class="logo-text">اتقِ الله</span>
        </a>
        <ul class="nav-links" id="navLinks">${pubLinks}${admLinks}${authLink}</ul>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="القائمة" aria-expanded="false">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </nav>
    `;
    document.body.insertBefore(h, document.body.firstChild);

    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay'; overlay.id = 'mobileOverlay';
    document.body.appendChild(overlay);

    const btn = document.getElementById('mobileMenuBtn');
    const links = document.getElementById('navLinks');
    const ov = document.getElementById('mobileOverlay');

    function open() { btn.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); links.classList.add('active'); ov.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function close() { btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); links.classList.remove('active'); ov.classList.remove('active'); document.body.style.overflow = ''; }

    btn.addEventListener('click', () => links.classList.contains('active') ? close() : open());
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    ov.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && links.classList.contains('active')) close(); });

    window.addEventListener('scroll', () => { if (window.scrollY > 30) h.classList.add('scrolled'); else h.classList.remove('scrolled'); }, { passive: true });
  }

  /* ═════════════════════ BOTTOM MOBILE NAVIGATION BAR ═════════════════════ */
  function renderBottomNav() {
    const b = document.createElement('nav');
    b.id = 'shared-bottom-nav';

    const profileOrAuth = isAuth ? 'profile.html' : 'auth.html';
    const profileLabel = isAuth ? 'حسابي' : 'دخول';

    b.innerHTML = `
      <a href="index.html" class="bottom-nav-item ${act('index.html')}">
        <i class="fa-solid fa-house"></i>
        <span>الرئيسية</span>
      </a>
      <a href="community.html" class="bottom-nav-item ${act('community.html')}">
        <i class="fa-solid fa-users-bubble"></i>
        <span>المجتمع</span>
      </a>
      <a href="library.html" class="bottom-nav-item ${act('library.html')}">
        <i class="fa-solid fa-book-open-reader"></i>
        <span>الدروس</span>
      </a>
      <a href="hub.html" class="bottom-nav-item ${act('hub.html')}">
        <i class="fa-solid fa-graduation-cap"></i>
        <span>الكليات</span>
      </a>
      <a href="store.html" class="bottom-nav-item ${act('store.html')}">
        <i class="fa-solid fa-gift"></i>
        <span>المتجر</span>
      </a>
      <a href="${profileOrAuth}" class="bottom-nav-item ${act('profile.html') || act('auth.html')}">
        <i class="fa-solid fa-user"></i>
        <span>${profileLabel}</span>
      </a>
    `;
    document.body.appendChild(b);
  }

  /* ═════════════════════ FOOTER ═════════════════════ */
  function renderFooter() {
    const f = document.createElement('footer');
    f.id = 'shared-footer';

    f.innerHTML = `
      <div class="ft-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <div class="ft-container">
        <div class="ft-brand">
          <div class="ft-brand-icon"><i class="fa-solid fa-kaaba"></i></div>
          <div class="ft-brand-name">اتقِ الله</div>
          <p class="ft-brand-desc">أول منصة تعليمية ذكية ومجانية تخدم طلاب البكالوريا المصرية والثانوية العامة والأزهرية.</p>
          <div class="ft-socials">
            <a href="https://www.facebook.com/profile.php?id=61550798575286" target="_blank" aria-label="فيسبوك"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="https://www.instagram.com/krmo2o" target="_blank" aria-label="إنستغرام"><i class="fa-brands fa-instagram"></i></a>
            <a href="https://www.tiktok.com/@karim._.omar5" target="_blank" aria-label="تيك توك"><i class="fa-brands fa-tiktok"></i></a>
            <a href="https://t.me/atqallah" target="_blank" aria-label="تلغرام"><i class="fa-brands fa-telegram"></i></a>
          </div>
        </div>

        <div class="ft-col">
          <div class="ft-col-title">روابط الأقسام</div>
          <a href="index.html"><i class="fa-solid fa-house"></i>الرئيسية</a>
          <a href="hub.html"><i class="fa-solid fa-graduation-cap"></i>دليل البكالوريا والكليات</a>
          <a href="library.html"><i class="fa-solid fa-book"></i>بنك الدروس والملخصات</a>
          <a href="community.html"><i class="fa-solid fa-users-bubble"></i>مجتمع الطلاب والشات</a>
          <a href="store.html"><i class="fa-solid fa-gift"></i>متجر استبدال النقاط</a>
        </div>

        <div class="ft-col">
          <div class="ft-col-title">المنصة والبرمجة</div>
          <a href="about.html"><i class="fa-solid fa-eye"></i>رؤيتنا وفكرتنا</a>
          <a href="teachers.html"><i class="fa-solid fa-chalkboard-user"></i>دليل المدرسين</a>
          <a href="news.html"><i class="fa-solid fa-newspaper"></i>مركز الأخبار</a>
          <a href="https://kemo-omar.github.io/Kareem/" target="_blank"><i class="fa-solid fa-code"></i>كريم عمر (بروفايل)</a>
          <a href="https://mostafa7html7-pixel.github.io/AbuTaleb/" target="_blank"><i class="fa-solid fa-code"></i>مصطفى محمد عبقرينو</a>
        </div>

        <div class="ft-col">
          <div class="ft-col-title">الدعم والحساب</div>
          <a href="auth.html"><i class="fa-solid fa-right-to-bracket"></i>تسجيل الدخول / إنشاء حساب</a>
          <a href="profile.html"><i class="fa-solid fa-user"></i>الملف الشخصي والنتائج</a>
          <a href="support.html"><i class="fa-solid fa-headset"></i>الدعم الفني والشكاوى</a>
          <a href="support.html"><i class="fa-solid fa-shield-halved"></i>شروط الاستخدام والخصوصية</a>
        </div>
      </div>

      <div class="ft-bottom">
        <div class="ft-divider"></div>
        <p>جميع الحقوق محفوظة © 2025-2026 منصة اتقِ الله التعليمية</p>
        <p>تصميم وتطوير المبرمجين <strong>كريم عمر</strong> و <strong>مصطفى محمد عبقرينو</strong></p>
      </div>
    `;

    document.body.appendChild(f);
  }

  /* ═════════════════════ INIT ═════════════════════ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { renderHeader(); renderBottomNav(); renderFooter(); });
  } else { renderHeader(); renderBottomNav(); renderFooter(); }

  window.syncNavAuthState = async function (db) {
    const email = localStorage.getItem('authenticatedUserEmail');
    if (!email || !db) return;
    try {
      const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const snap = await getDoc(doc(db, 'users', email));
      if (snap.exists()) {
        const d = snap.data();
        if (d.isBlocked) { localStorage.removeItem('authenticatedUserEmail'); window.location.reload(); return; }
        window._navUserData = d;
      } else { localStorage.removeItem('authenticatedUserEmail'); }
    } catch (e) { console.error('Nav Auth Sync Error:', e); }
  };
})();

