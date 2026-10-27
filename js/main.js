/**
 * Drishta Vidya LLP — Main JavaScript
 */

/* =============================================
   NAVBAR
   ============================================= */
(function () {
  const navbar   = document.querySelector('.navbar');
  const toggle   = document.querySelector('.nav-toggle');
  const menu     = document.querySelector('.nav-menu');

  // Scroll shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });

  // Mobile toggle
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
    });

    // Dropdown toggle (handles mobile and desktop click/tap)
    menu.querySelectorAll('.nav-dropdown-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const parent = btn.closest('.nav-dropdown');
        if (parent) {
          const willOpen = !parent.classList.contains('open');
          menu.querySelectorAll('.nav-dropdown.open').forEach(d => {
            if (d !== parent) {
              d.classList.remove('open');
              d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
            }
          });
          parent.classList.toggle('open', willOpen);
          btn.setAttribute('aria-expanded', String(willOpen));
        }
      });
    });

    // Close on nav link click
    menu.querySelectorAll('.nav-link, .nav-dropdown-item').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        document.querySelectorAll('.nav-dropdown.open').forEach(d => {
          d.classList.remove('open');
          d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
        });
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        document.querySelectorAll('.nav-dropdown.open').forEach(d => {
          d.classList.remove('open');
          d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  // Active link highlighting
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .nav-dropdown-item').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html') || (href && href.startsWith(currentPage) && currentPage !== '')) {
      link.classList.add('active');
      const parentDropdown = link.closest('.nav-dropdown');
      if (parentDropdown) {
        parentDropdown.querySelector('.nav-dropdown-toggle')?.classList.add('active');
      }
    }
  });

  // Footer copyright year auto-update
  document.querySelectorAll('.footer-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();

/* =============================================
   SCROLL REVEAL
   ============================================= */
(function () {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));
})();

/* =============================================
   FALLBACK DATASETS (COURSES & UPCOMING RUNS)
   Guarantees View & Enroll works across local & production
   ============================================= */
const _defaultCoursesData = [
  {
    id: 1,
    title: "EQuip for Leaders",
    program: "EQuip",
    audience: "Senior executives, business owners & entrepreneurs",
    description: "Build a high-performance culture by leading with clarity, steadiness and empathy through change and uncertainty.",
    duration: "2-Day Live Workshop",
    durationDays: 2,
    followUp: "60-day in EQ OS",
    participants: "20–30",
    icon: "🚀",
    featured: true,
    tags: ["Leadership", "Organization Development", "Emotional Intelligence", "EQ OS"],
    price: 15000,
    priceLabel: "₹15,000",
    priceNote: "per participant + 18% GST",
    paymentLink: "",
    upiId: "drishtavidya@upi"
  },
  {
    id: 2,
    title: "EQuip for Teams",
    program: "EQuip",
    audience: "Mid-level managers, team leads & professionals",
    description: "Break the mindset barriers that hold teams back during growth and change. Handle conflict and work with less friction.",
    duration: "2-Day Live Workshop",
    durationDays: 2,
    followUp: "60-day in EQ OS",
    participants: "20–30",
    icon: "🔄",
    featured: true,
    tags: ["Emotional Intelligence", "Team Performance", "Collaboration", "EQ OS"],
    price: 12000,
    priceLabel: "₹12,000",
    priceNote: "per participant + 18% GST",
    paymentLink: "",
    upiId: "drishtavidya@upi"
  },
  {
    id: 3,
    title: "EQuip for Educators",
    program: "EQuip",
    audience: "Teachers, faculty & educational institutions",
    description: "Build emotionally intelligent classrooms and campuses. Foster better relationships between teachers, students and parents.",
    duration: "2-Day Live Workshop",
    durationDays: 2,
    followUp: "60-day in EQ OS",
    participants: "20–30",
    icon: "🧠",
    featured: true,
    tags: ["Education", "Teacher Training", "Emotional Intelligence", "EQ OS"],
    price: 10000,
    priceLabel: "₹10,000",
    priceNote: "per participant + 18% GST",
    paymentLink: "",
    upiId: "drishtavidya@upi"
  },
  {
    id: 4,
    title: "LEAD — Virtual L&D",
    program: "LEAD",
    audience: "HR teams, L&D managers & training departments",
    description: "Your learning & development department without the headcount: needs assessment, learning roadmaps, delivery and effectiveness tracking.",
    duration: "Ongoing Engagement",
    durationDays: 0,
    followUp: "",
    participants: "Open",
    icon: "📚",
    featured: true,
    tags: ["Virtual L&D", "Learning Design", "HR Partnership"],
    price: 0,
    priceLabel: "Custom Quote",
    priceNote: "Monthly / annual engagement",
    paymentLink: "",
    upiId: "drishtavidya@upi"
  },
  {
    id: 5,
    title: "SimplifAI Workshop",
    program: "SimplifAI",
    audience: "MSME owners, professional practices & managers",
    description: "A hands-on workshop for business owners: simplify a real process first, then put AI to work on it with a 90-day action plan.",
    duration: "1–2 Day Workshop",
    durationDays: 2,
    followUp: "90-day action plan",
    participants: "15–20",
    icon: "⚡",
    featured: true,
    tags: ["SimplifAI", "CLEAR Method", "AI Adoption", "Process Optimization"],
    price: 7500,
    priceLabel: "₹7,500",
    priceNote: "per participant + 18% GST",
    paymentLink: "",
    upiId: "drishtavidya@upi"
  },
  {
    id: 6,
    title: "SimplifAI Consulting",
    program: "SimplifAI",
    audience: "Growing businesses & leadership teams",
    description: "Takes the CLEAR method into your business over 30 to 90 days. Process audit, AI workflow automation, and team adoption.",
    duration: "30–90 Days",
    durationDays: 60,
    followUp: "Ongoing advisory",
    participants: "Custom",
    icon: "🤖",
    featured: false,
    tags: ["Consulting", "Automation", "Advisory"],
    price: 0,
    priceLabel: "Custom Quote",
    priceNote: "Based on scope & processes",
    paymentLink: "",
    upiId: "drishtavidya@upi"
  }
];

if (typeof window.coursesData === 'undefined' || !window.coursesData) {
  window.coursesData = _defaultCoursesData;
}
if (typeof coursesData === 'undefined') {
  var coursesData = window.coursesData;
}

if (typeof window.upcomingPrograms === 'undefined' || !window.upcomingPrograms) {
  window.upcomingPrograms = [];
}
if (typeof upcomingPrograms === 'undefined') {
  var upcomingPrograms = window.upcomingPrograms;
}

/* =============================================
   UPCOMING PROGRAMS TICKER
   ============================================= */
(function () {
  const tickerContainer = document.querySelector('.upcoming-ticker');
  const tickerInner = document.getElementById('ticker-inner');
  const runs = (typeof window.upcomingPrograms !== 'undefined' && Array.isArray(window.upcomingPrograms))
    ? window.upcomingPrograms
    : [];

  if (!runs || !runs.length) {
    if (tickerContainer) tickerContainer.style.display = 'none';
    return;
  }

  if (tickerContainer) tickerContainer.style.display = '';

  function buildItem(p, idx) {
    const seatsHtml = p.seats > 0
      ? `<span class="ticker-seats">${p.seats} seats left</span>`
      : '';
    return `<div class="upcoming-ticker-item" data-prog-idx="${idx}" title="Click to register">
      <span class="ticker-program">${p.program}</span>
      <span class="ticker-sep">·</span>
      <span class="ticker-date">📅 ${p.date}</span>
      <span class="ticker-sep">·</span>
      <span class="ticker-location">📍 ${p.location}</span>
      <span class="ticker-mode">${p.mode}</span>
      ${seatsHtml}
      <span class="ticker-register-hint">Register →</span>
    </div>`;
  }

  // Render items with repetition for smooth marquee scrolling
  let repeatCount = runs.length === 1 ? 4 : (runs.length < 3 ? 3 : 2);
  let html = runs.map((p, i) => buildItem(p, i)).join('');
  let fullHtml = '';
  for (let r = 0; r < repeatCount; r++) fullHtml += html;
  tickerInner.innerHTML = fullHtml;

  // Click to open registration
  tickerInner.addEventListener('click', (e) => {
    const item = e.target.closest('.upcoming-ticker-item');
    if (!item) return;
    const idx = parseInt(item.dataset.progIdx, 10);
    if (!isNaN(idx)) openRegModal(idx);
  });
})();

/* =============================================
   REGISTRATION + RAZORPAY MODAL
   ============================================= */
let _currentProgram = null;
let _currentPromoCode = null;
let _currentDiscount = 0;
let _currentTax = 0;
let _currentFinalAmount = 0;
let _currentBaseAmount = 0;

function _updateBreakdownUI() {
  const elBase = document.getElementById('summary-base');
  const elDiscountRow = document.getElementById('summary-discount-row');
  const elDiscount = document.getElementById('summary-discount');
  const elTax = document.getElementById('summary-tax');
  const elTotal = document.getElementById('summary-total');
  const btnText = document.getElementById('reg-pay-btn-text');
  
  if (!elBase) return;
  
  elBase.textContent = '₹' + _currentBaseAmount.toLocaleString('en-IN');
  if (_currentDiscount > 0) {
    elDiscountRow.style.display = 'flex';
    elDiscount.textContent = '-₹' + _currentDiscount.toLocaleString('en-IN');
  } else {
    elDiscountRow.style.display = 'none';
  }
  elTax.textContent = '₹' + _currentTax.toLocaleString('en-IN');
  elTotal.textContent = '₹' + _currentFinalAmount.toLocaleString('en-IN');
  if (btnText) {
    btnText.textContent = `Pay ₹${_currentFinalAmount.toLocaleString('en-IN')} & Register`;
  }
}

function openRegModal(progIdx) {
  const runs = (typeof window.upcomingPrograms !== 'undefined' && Array.isArray(window.upcomingPrograms))
    ? window.upcomingPrograms
    : [];

  const p = runs[progIdx];
  if (!p) return;
  _currentProgram = p;

  const overlay = document.getElementById('reg-modal');
  if (!overlay) return;

  // Look up course for pricing & program badge
  const allCourses = (typeof window.coursesData !== 'undefined' && window.coursesData && window.coursesData.length)
    ? window.coursesData
    : ((typeof coursesData !== 'undefined' && coursesData) ? coursesData : _defaultCoursesData);

  const course = allCourses.find(c => c.id == p.courseId);

  // Populate header
  const badgeEl = document.getElementById('reg-program-badge');
  if (badgeEl) badgeEl.textContent  = course ? course.program : 'EQuip';
  const titleEl = document.getElementById('reg-program-title');
  if (titleEl) titleEl.textContent  = p.program;
  const dateEl = document.getElementById('reg-date-badge');
  if (dateEl) dateEl.textContent     = '📅 ' + p.date;
  const locEl = document.getElementById('reg-location-badge');
  if (locEl) locEl.textContent = '📍 ' + p.location;
  const modeEl = document.getElementById('reg-mode-badge');
  if (modeEl) modeEl.textContent     = p.mode;

  _currentPromoCode = null;
  _currentDiscount = 0;
  _currentTax = 0;
  _currentFinalAmount = 0;
  _currentBaseAmount = 0;

  const promoInput = document.getElementById('reg-promo-code');
  if (promoInput) promoInput.value = '';
  const promoMsg = document.getElementById('promo-message');
  if (promoMsg) { promoMsg.textContent = ''; promoMsg.style.color = ''; }

  if (course && course.price > 0) {
    _currentBaseAmount = course.price;
    _currentTax = Math.round(_currentBaseAmount * 0.18);
    _currentFinalAmount = _currentBaseAmount + _currentTax;
    _updateBreakdownUI();

    const priceEl = document.getElementById('reg-price');
    if (priceEl) priceEl.textContent = `₹${_currentBaseAmount.toLocaleString('en-IN')}`;
    const priceRow = document.getElementById('reg-price-row');
    if (priceRow) priceRow.style.display = '';
  } else {
    const priceRow = document.getElementById('reg-price-row');
    if (priceRow) priceRow.style.display = 'none';
    const payText = document.getElementById('reg-pay-btn-text');
    if (payText) payText.textContent = 'Complete Registration';
  }

  // Reset form
  const regForm = document.getElementById('reg-form');
  if (regForm) regForm.reset();
  const regErr = document.getElementById('reg-error');
  if (regErr) regErr.style.display = 'none';
  const step1 = document.getElementById('reg-step-1');
  if (step1) step1.style.display = '';
  const step2 = document.getElementById('reg-step-2');
  if (step2) step2.style.display = 'none';

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeRegModal() {
  const overlay = document.getElementById('reg-modal');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  _currentProgram = null;
}

function _launchRazorpay(registrant, course, program) {
  const config = (typeof RAZORPAY_CONFIG !== 'undefined') ? RAZORPAY_CONFIG : {};
  const key = config.key || '';

  if (!key || key.startsWith('rzp_test_XXXX')) {
    // Test mode bypass — save to DB as 'free' and show success
    fetch('api/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id:              program.id,
        program_id:          course.id,
        first_name:          registrant.fname,
        last_name:           registrant.lname,
        email:               registrant.email,
        phone:               registrant.phone,
        organization:        registrant.org  || null,
        designation:         registrant.role || null,
        payment_method:      'free',
        payment_status:      'completed',
        razorpay_payment_id: 'TEST_BYPASS_' + Date.now(),
        amount_paid_inr: _currentFinalAmount,
        base_amount_inr: _currentBaseAmount,
        promo_code: _currentPromoCode,
        discount_amount_inr: _currentDiscount,
        tax_amount_inr: _currentTax
      })
    })
    .then(async res => {
      if (!res.ok) {
        console.error('Save failed:', await res.text());
        throw new Error('Database save failed');
      }
      return res.json();
    })
    .then(() => _showRegSuccess({ razorpay_payment_id: 'TEST_BYPASS' }, registrant, program, course))
    .catch(err => {
      const errEl = document.getElementById('reg-error');
      errEl.textContent = 'Save failed! Make sure you are testing on MAMP (e.g. http://localhost:8888) and not port 8000.';
      errEl.style.display = 'block';
      const btn = document.getElementById('reg-pay-btn');
      if (btn) btn.disabled = false;
      document.getElementById('reg-pay-btn-text').textContent = 'Try Again';
    });
    return;
  }

  const amountPaise = _currentFinalAmount * 100; // Razorpay uses paise

  const options = {
    key,
    amount: amountPaise,
    currency: config.currency || 'INR',
    name: config.businessName || 'Drishta Vidya LLP',
    description: `${program.program} — ${program.date}`,
    image: config.logo || '',
    prefill: {
      name:    `${registrant.fname} ${registrant.lname}`,
      email:   registrant.email,
      contact: registrant.phone,
    },
    notes: {
      program:      program.program,
      date:         program.date,
      location:     program.location,
      organization: registrant.org || '',
      run_id:       program.id || '',
    },
    theme: config.theme || { color: '#c8960c' },
    handler: async function (response) {
      // Save registration to database
      try {
        await fetch('api/register.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            run_id:              program.id,
            program_id:          course.id,
            first_name:          registrant.fname,
            last_name:           registrant.lname,
            email:               registrant.email,
            phone:               registrant.phone,
            organization:        registrant.org  || null,
            designation:         registrant.role || null,
            payment_method:      'razorpay',
            payment_status:      'completed',
            razorpay_payment_id: response.razorpay_payment_id,
            amount_paid_inr: _currentFinalAmount,
            base_amount_inr: _currentBaseAmount,
            promo_code: _currentPromoCode,
            discount_amount_inr: _currentDiscount,
            tax_amount_inr: _currentTax
          })
        });
      } catch (_) { /* fail silently — payment happened, DB save is best-effort */ }
      _showRegSuccess(response, registrant, program, course);
    },
    modal: {
      ondismiss: function () {
        const btn = document.getElementById('reg-pay-btn');
        if (btn) btn.disabled = false;
        document.getElementById('reg-pay-btn-text').textContent =
          course.price > 0 ? `Pay ${course.priceLabel} & Register` : 'Complete Registration';
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.on('payment.failed', function () {
    const errEl = document.getElementById('reg-error');
    errEl.textContent = 'Payment failed. Please try again or contact us at namaste@drishtavidya.com.';
    errEl.style.display = 'block';
    const btn = document.getElementById('reg-pay-btn');
    if (btn) btn.disabled = false;
    document.getElementById('reg-pay-btn-text').textContent =
      course.price > 0 ? `Pay ${course.priceLabel} & Register` : 'Complete Registration';
  });
  rzp.open();
}

function _showRegSuccess(razorpayResponse, registrant, program, course) {
  document.getElementById('reg-step-1').style.display = 'none';
  document.getElementById('reg-step-2').style.display = '';

  const noteEl = document.getElementById('reg-success-note');
  if (noteEl) {
    const isEquip = (program && program.program && program.program.toLowerCase().includes('equip')) ||
                    (course && course.program && course.program.toLowerCase().includes('equip'));
    noteEl.textContent = isEquip
      ? 'Payment successful. Check your email for receipt and your EQ OS unlock voucher code.'
      : 'Payment successful. Check your email for registration receipt and workshop preparation pack.';
  }

  const paymentId = razorpayResponse ? razorpayResponse.razorpay_payment_id : '—';
  const rows = [
    ['Program',     program.program],
    ['Date',        program.date],
    ['Location',    program.location],
    ['Name',        `${registrant.fname} ${registrant.lname}`],
    ['Email',       registrant.email],
    ['Mobile',      registrant.phone],
    ...(registrant.org ? [['Organization', registrant.org]] : []),
    ...(course && course.price > 0 ? [['Amount Paid', course.priceLabel]] : []),
    ...(paymentId !== '—' ? [['Payment ID', paymentId]] : []),
  ];

  document.getElementById('reg-success-details').innerHTML =
    rows.map(([label, value]) =>
      `<div class="reg-success-row">
         <span class="reg-success-label">${label}</span>
         <span class="reg-success-value">${value}</span>
       </div>`
    ).join('');
}

// Wire up registration form submit
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('reg-modal');
  if (!overlay) return;

  document.getElementById('reg-modal-close').addEventListener('click', closeRegModal);
  document.getElementById('reg-success-close').addEventListener('click', closeRegModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeRegModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeRegModal(); });

  document.getElementById('reg-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const fname = document.getElementById('reg-fname').value.trim();
    const lname = document.getElementById('reg-lname').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const org   = document.getElementById('reg-org').value.trim();
    const role  = document.getElementById('reg-role').value.trim();

    const errEl = document.getElementById('reg-error');
    errEl.style.display = 'none';

    // Honeypot check
    if (document.getElementById('reg-honeypot')?.value) return;

    // Validate
    if (!fname || !lname) { errEl.textContent = 'Please enter your full name.'; errEl.style.display = 'block'; return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.textContent = 'Please enter a valid email address.'; errEl.style.display = 'block'; return; }
    if (!phone || phone.replace(/\D/g,'').length < 10) { errEl.textContent = 'Please enter a valid 10-digit mobile number.'; errEl.style.display = 'block'; return; }

    const registrant = { fname, lname, email, phone, org, role };
    const p = _currentProgram;
    const course = (typeof coursesData !== 'undefined' && p)
      ? coursesData.find(c => c.id === p.courseId)
      : null;

    const btn = document.getElementById('reg-pay-btn');
    btn.disabled = true;
    document.getElementById('reg-pay-btn-text').textContent = 'Processing…';

    if (course && course.price > 0) {
      _launchRazorpay(registrant, course, p);
    } else {
      // Free / enquiry-only program — save enquiry and show success
      fetch('api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          run_id:       p.id,
          program_id:   course?.id || 0,
          first_name:   registrant.fname,
          last_name:    registrant.lname,
          email:        registrant.email,
          phone:        registrant.phone,
          organization: registrant.org  || null,
          designation:  registrant.role || null,
          payment_method: 'enquiry',
          payment_status: 'pending'
        })
      }).catch(() => {}).finally(() => _showRegSuccess(null, registrant, p, course));
    }
  });
});

function showNoDatesAlert(course) {
  // Remove existing alert if any
  const existing = document.getElementById('no-dates-modal');
  if (existing && typeof existing.remove === 'function') existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'no-dates-modal';
  overlay.className = 'modal-overlay';
  overlay.style.zIndex = '3000'; // Above other modals if any
  
  const title = course ? encodeURIComponent(course.title) : '';
  const courseName = course ? course.title : 'this program';
  const redirectUrl = `contact.html?course=${title}`;

  overlay.innerHTML = `
    <div class="modal" style="max-width: 440px; text-align: center;">
      <div class="modal-header" style="padding: 30px 20px 16px; background: transparent; border: none; flex-direction: column; align-items: center;">
        <div style="font-size: 48px; margin-bottom: 12px;">📅</div>
        <h3 style="color: var(--navy); font-size: 20px; margin: 0; font-family: 'Playfair Display', serif; font-weight: 700;">No Scheduled Dates</h3>
      </div>
      <div class="modal-body" style="padding: 0 28px 30px;">
        <p style="color: var(--text-muted); font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          There are currently no upcoming open cohort dates scheduled for <strong>${courseName}</strong>. You can register your interest to be notified when new dates are announced, or discuss an in-house session for your team.
        </p>
        <button class="btn btn-primary" style="width: 100%; justify-content: center; margin-bottom: 10px;" onclick="window.location.href='${redirectUrl}'">
          Enquire Now
        </button>
        <button class="btn btn-outline-navy" style="width: 100%; justify-content: center;" onclick="this.closest('.modal-overlay').remove()">
          Close
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.classList.add('open');
}

function openRegForCourse(courseIdOrNameOrObj) {
  let target = courseIdOrNameOrObj;
  if (typeof courseIdOrNameOrObj === 'object' && courseIdOrNameOrObj !== null) {
    target = courseIdOrNameOrObj.id || courseIdOrNameOrObj.title || courseIdOrNameOrObj.program;
  }

  const allRuns = (typeof window.upcomingPrograms !== 'undefined' && Array.isArray(window.upcomingPrograms))
    ? window.upcomingPrograms
    : [];

  const allCourses = (typeof window.coursesData !== 'undefined' && window.coursesData && window.coursesData.length)
    ? window.coursesData
    : ((typeof coursesData !== 'undefined' && coursesData && coursesData.length) ? coursesData : _defaultCoursesData);

  // Match by course ID or course/program title
  let runIdx = allRuns.findIndex(p => p.courseId == target);
  if (runIdx < 0 && typeof target === 'string') {
    const t = target.trim().toLowerCase();
    runIdx = allRuns.findIndex(p => p.program && p.program.trim().toLowerCase() === t);
  }

  if (runIdx >= 0) {
    openRegModal(runIdx);
  } else {
    let course = allCourses.find(c => c.id == target);
    if (!course && typeof target === 'string') {
      const t = target.trim().toLowerCase();
      course = allCourses.find(c => c.title && c.title.trim().toLowerCase() === t);
    }
    showNoDatesAlert(course);
  }
}

/* =============================================
   COURSE CARD RENDERER
   ============================================= */
function buildCourseCard(course, showEnquireBtn = true) {
  const followUpHtml = course.followUp
    ? `<span class="course-meta-item">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
         ${course.followUp} follow-up
       </span>`
    : '';

  const participantsHtml = course.participants !== 'Open'
    ? `<span class="course-meta-item">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
         Up to ${course.participants}
       </span>`
    : `<span class="course-meta-item">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
         Open enrollment
       </span>`;

  // Price row
  const priceRowHtml = course.priceLabel
    ? `<div class="course-price-row">
         <div>
           ${course.price > 0
             ? `<div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Starting from</div>
                <div class="course-price-label">${course.priceLabel}</div>
                <div class="course-price-note">${course.priceNote}</div>`
             : `<div class="course-price-custom">${course.priceLabel}</div>
                <div class="course-price-note">${course.priceNote}</div>`
           }
         </div>
       </div>`
    : '';

  // Footer buttons
  const btnHtml = showEnquireBtn
    ? `<div class="course-card-footer">
         <a href="contact.html?course=${encodeURIComponent(course.title)}" class="btn btn-outline-navy">
           Enquire
         </a>
         ${course.price > 0
           ? `<button type="button" class="btn btn-primary" onclick="openRegForCourse(${course.id})">
                💳 View &amp; Enroll
              </button>`
           : `<a href="contact.html?course=${encodeURIComponent(course.title)}" class="btn btn-primary">
                Get Quote
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>`
         }
       </div>`
    : '';

  return `
    <div class="course-card reveal">
      <div class="course-card-header">
        <div class="course-program-badge">${course.program}</div>
        <div class="course-icon">${course.icon}</div>
        <h3 class="course-card-title">${course.title}</h3>
      </div>
      <div class="course-card-body">
        <p class="course-description">${course.description}</p>
        <div class="course-meta">
          <span class="course-duration-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${course.duration}
          </span>
          ${followUpHtml}
          ${participantsHtml}
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:auto;">
          <strong>For:</strong> ${course.audience}
        </div>
      </div>
      ${priceRowHtml}
      ${btnHtml}
    </div>`;
}

/* =============================================
   PAYMENT MODAL
   ============================================= */
function openPaymentModal(courseIdOrObj) {
  let courseId = courseIdOrObj;
  let targetTitle = '';
  if (typeof courseIdOrObj === 'object' && courseIdOrObj !== null) {
    courseId = courseIdOrObj.id;
    targetTitle = courseIdOrObj.title || courseIdOrObj.program || '';
  }

  const allCourses = (typeof window.coursesData !== 'undefined' && window.coursesData && window.coursesData.length)
    ? window.coursesData
    : ((typeof coursesData !== 'undefined' && coursesData) ? coursesData : _defaultCoursesData);

  let course = null;
  if (courseId) {
    course = allCourses.find(c => c.id == courseId);
  }
  if (!course && targetTitle) {
    const t = targetTitle.toLowerCase();
    course = allCourses.find(c => c.title && c.title.toLowerCase().includes(t));
  }
  if (!course && typeof courseIdOrObj === 'string') {
    const t = courseIdOrObj.toLowerCase();
    course = allCourses.find(c => (c.title && c.title.toLowerCase().includes(t)) || (c.program && c.program.toLowerCase() === t));
  }

  // If reg-modal is present on this page and course is identified, delegate to openRegForCourse
  const regOverlay = document.getElementById('reg-modal');
  if (regOverlay && course) {
    openRegForCourse(course.id);
    return;
  }

  const overlay = document.getElementById('payment-modal');
  if (!overlay) return;

  if (course) {
    const pBadge = document.getElementById('modal-program');
    if (pBadge) pBadge.textContent = course.program;
    const cTitle = document.getElementById('modal-course-title');
    if (cTitle) cTitle.textContent = course.title;
    const mPrice = document.getElementById('modal-price');
    if (mPrice) mPrice.textContent = course.priceLabel;
    const mPriceNote = document.getElementById('modal-price-note');
    if (mPriceNote) mPriceNote.textContent = course.priceNote;
    const mUpi = document.getElementById('modal-upi-id');
    if (mUpi) mUpi.textContent = course.upiId || 'drishtavidya@upi';

    const razorBtn = document.getElementById('razorpay-btn');
    if (razorBtn) {
      if (course.paymentLink) {
        razorBtn.href = course.paymentLink;
        razorBtn.style.opacity = '1';
        razorBtn.style.pointerEvents = 'auto';
      } else {
        razorBtn.href = '#';
        razorBtn.style.opacity = '.5';
        razorBtn.style.pointerEvents = 'none';
        razorBtn.title = 'Payment link coming soon';
      }
    }

    const enquireLink = document.getElementById('modal-enquire-link');
    if (enquireLink) {
      enquireLink.href = `contact.html?course=${encodeURIComponent(course.title)}`;
    }
  }

  // Reset to first tab
  switchPaymentTab('online');

  // Open overlay
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
  const overlay = document.getElementById('payment-modal');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function switchPaymentTab(tabName) {
  document.querySelectorAll('.payment-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabName);
  });
  document.querySelectorAll('.payment-panel').forEach(p => {
    p.classList.toggle('active', p.id === `panel-${tabName}`);
  });
}

function copyUPI() {
  const upiEl = document.getElementById('modal-upi-id');
  if (!upiEl) return;
  navigator.clipboard.writeText(upiEl.textContent).then(() => {
    const btn = document.querySelector('.copy-btn');
    if (btn) { btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy', 2000); }
  });
}

// Wire up modal events after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('payment-modal');
  if (!overlay) return;

  document.getElementById('modal-close').addEventListener('click', closePaymentModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePaymentModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePaymentModal();
  });

  overlay.querySelectorAll('.payment-tab').forEach(tab => {
    tab.addEventListener('click', () => switchPaymentTab(tab.dataset.tab));
  });
});

/* =============================================
   HOMEPAGE — FEATURED COURSES
   ============================================= */
(function () {
  const container = document.getElementById('featured-courses');
  if (!container || typeof coursesData === 'undefined') return;

  const featured = coursesData.filter(c => c.featured).slice(0, 3);
  container.innerHTML = featured.map(c => buildCourseCard(c)).join('');

  // Re-trigger scroll observer for new elements
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      el.classList.add('visible'); // instant on home
    });
  }, 100);
})();

/* =============================================
   COURSES PAGE — ALL COURSES + FILTER
   ============================================= */
(function () {
  const grid      = document.getElementById('all-courses-grid');
  const filterBar = document.getElementById('filter-bar');
  if (!grid || typeof coursesData === 'undefined') return;

  let activeFilter = 'all';

  function renderCourses() {
    const filtered = activeFilter === 'all'
      ? coursesData
      : coursesData.filter(c => c.program === activeFilter);

    grid.innerHTML = filtered.length
      ? filtered.map(c => buildCourseCard(c)).join('')
      : '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:40px">No courses found.</p>';

    // Trigger reveal
    setTimeout(() => {
      grid.querySelectorAll('.reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 80);
      });
    }, 50);
  }

  // Build filter buttons dynamically
  const programs = ['all', ...new Set(coursesData.map(c => c.program))];
  filterBar.innerHTML = programs.map(p =>
    `<button class="filter-btn${p === 'all' ? ' active' : ''}" data-filter="${p}">
      ${p === 'all' ? 'All Programs' : p}
    </button>`
  ).join('');

  filterBar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCourses();
    });
  });

  renderCourses();
})();

/* =============================================
   CONTACT FORM
   ============================================= */
(function () {
  // Pre-fill course from URL param
  const params = new URLSearchParams(location.search);
  const courseParam = params.get('course');
  const courseSelect = document.getElementById('course-interest');
  if (courseParam && courseSelect) {
    const searchVal = courseParam.trim().toLowerCase();
    for (const opt of courseSelect.options) {
      const optVal = opt.value.trim().toLowerCase();
      const optText = opt.textContent.trim().toLowerCase();
      if (optVal && (optVal === searchVal || optText === searchVal || optVal.includes(searchVal) || searchVal.includes(optVal))) {
        opt.selected = true;
        break;
      }
    }
  }

  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.textContent = 'Sending…';
      btn.disabled = true;
    }

    const formData = {
      first_name: form.querySelector('#first-name')?.value || '',
      last_name: form.querySelector('#last-name')?.value || '',
      email: form.querySelector('#email')?.value || '',
      phone: form.querySelector('#phone')?.value || '',
      organization: form.querySelector('#organization')?.value || '',
      course_interest: form.querySelector('#course-interest')?.value || '',
      team_size: form.querySelector('#team-size')?.value || '',
      message: form.querySelector('#message')?.value || ''
    };

    fetch('api/contact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .catch(() => {})
    .finally(() => {
      form.innerHTML = `
        <div style="text-align:center;padding:40px 20px">
          <div style="font-size:56px;margin-bottom:16px">✅</div>
          <h3 style="font-size:22px;font-weight:700;color:var(--navy);margin-bottom:10px">
            Message Received!
          </h3>
          <p style="color:var(--text-muted);line-height:1.7">
            Thank you for reaching out. Your enquiry has been forwarded to our team at <strong>namaste@drishtavidya.com</strong>. We'll get back to you within 1–2 business days.
          </p>
        </div>`;
    });
  });
})();

/* =============================================
   SMOOTH SCROLL for anchor links
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* =============================================
   GENERIC TABS
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const group = btn.closest('.tabs-container') || document;
      
      group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      group.querySelectorAll('.tab-pane').forEach(p => {
        p.classList.remove('active');
        if (p.id === target) p.classList.add('active');
      });
    });
  });
});

/* =============================================
   RESOURCES DYNAMIC LOADING
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  const booksTab = document.getElementById('tab-books');
  const appsTab = document.getElementById('tab-apps');
  const newslettersTab = document.getElementById('tab-newsletters');

  if (!booksTab && !appsTab && !newslettersTab) return; // Only run on resources page

  fetch('api/get-resources.php')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        renderResources(data.data.books || [], booksTab, 'Get the Book');
        renderResources(data.data.apps || [], appsTab, 'Open App');
        renderResources(data.data.newsletters || [], newslettersTab, 'Subscribe Now');
      } else {
        console.error('Failed to load resources:', data.error);
      }
    })
    .catch(err => console.error('Error fetching resources:', err));

  function renderResources(items, container, btnText) {
    if (!container) return;
    container.innerHTML = '';
    
    if (items.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding:40px; color:#6b7280;">More resources coming soon.</p>';
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'service-card';
      card.style.cssText = 'display: flex; gap: 32px; align-items: flex-start; text-align: left; padding: 40px; flex-wrap: wrap; margin-bottom: 24px;';
      
      let imgHtml = '';
      if (item.image_path) {
        imgHtml = `<img src="${item.image_path}" alt="${item.title}" style="width: 180px; border-radius: 8px; box-shadow: var(--shadow-sm); flex-shrink: 0;" />`;
      } else {
        imgHtml = `<div style="width: 180px; height: 250px; background: #e5e7eb; border-radius: 8px; flex-shrink: 0; display:flex; align-items:center; justify-content:center; color:#9ca3af;">No Image</div>`;
      }

      // Convert newlines to paragraphs for description
      const descHtml = item.description.split('\\n').filter(p => p.trim() !== '').map(p => `<p style="margin-bottom: 12px; font-size: 15px; line-height: 1.6; color: #4b5563;">${p}</p>`).join('');

      card.innerHTML = `
        ${imgHtml}
        <div style="flex: 1; min-width: 250px;">
          <h3 style="margin: 0 0 16px 0; font-size: 1.8rem; color: #111827; font-weight: 700;">${item.title}</h3>
          ${descHtml}
        </div>
        <div style="flex-shrink: 0; min-width: 160px; text-align: center;">
          <a href="${item.link}" target="_blank" rel="noopener" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 14px 24px;">
            ${btnText}
          </a>
        </div>
      `;
      container.appendChild(card);
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const promoBtn = document.getElementById('reg-promo-btn');
  if (promoBtn) {
    promoBtn.addEventListener('click', async () => {
      const code = document.getElementById('reg-promo-code').value.trim().toUpperCase();
      const msgEl = document.getElementById('promo-message');
      
      if (!code) {
        msgEl.textContent = 'Please enter a promo code.';
        msgEl.style.color = '#ef4444';
        return;
      }
      
      promoBtn.disabled = true;
      promoBtn.textContent = 'Applying...';
      
      try {
        const res = await fetch('api/validate-promo.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promo_code: code, base_amount: _currentBaseAmount })
        });
        const data = await res.json();
        
        if (data.success) {
          _currentPromoCode = code;
          _currentDiscount = data.discount_amount;
          _currentTax = data.tax_amount;
          _currentFinalAmount = data.final_amount;
          _updateBreakdownUI();
          msgEl.textContent = `Promo code applied successfully!`;
          msgEl.style.color = '#16a34a';
        } else {
          msgEl.textContent = data.error || 'Invalid promo code.';
          msgEl.style.color = '#ef4444';
          // reset
          _currentPromoCode = null;
          _currentDiscount = 0;
          _currentTax = Math.round(_currentBaseAmount * 0.18);
          _currentFinalAmount = _currentBaseAmount + _currentTax;
          _updateBreakdownUI();
        }
      } catch (err) {
        msgEl.textContent = 'Error validating promo code.';
        msgEl.style.color = '#ef4444';
      } finally {
        promoBtn.disabled = false;
        promoBtn.textContent = 'Apply';
      }
    });
  }
});

/* =============================================
   SPECIAL EVENT FETCHING
   ============================================= */
(function() {
  const linkEl = document.getElementById('special-event-link');
  if (!linkEl) return; // Only run on pages with the special event hero card

  const iconEl = document.getElementById('special-event-icon');
  const titleEl = document.getElementById('special-event-title');
  const descEl = document.getElementById('special-event-desc');
  const badgeEl = document.getElementById('special-event-badge');

  fetch('api/get-special-event.php')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.event) {
        const ev = data.event;
        if (ev.title) titleEl.textContent = ev.title;
        if (ev.description) descEl.textContent = ev.description;
        if (ev.icon) iconEl.textContent = ev.icon;
        if (ev.badge_text) badgeEl.textContent = ev.badge_text;
        if (ev.link_url) linkEl.href = ev.link_url;
        
        if (ev.is_default != 1) {
          linkEl.classList.add('hero-card-special');
        }
      }
    })
    .catch(err => {
      console.error('Error fetching special event:', err);
    });
})();

/* =============================================
   EQUIP PAGE — TRACKS CARDS HYDRATION
   ============================================= */
(function () {
  const equipGrid = document.getElementById('equip-tracks-grid');
  if (!equipGrid || typeof coursesData === 'undefined') return;

  const equipCourses = coursesData.filter(c => 
    c.program === 'EQuip' || 
    (c.title && c.title.toLowerCase().startsWith('equip'))
  );

  if (equipCourses.length > 0) {
    equipGrid.innerHTML = equipCourses.map(c => buildCourseCard(c)).join('');
    setTimeout(() => {
      equipGrid.querySelectorAll('.reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 80);
      });
    }, 50);
  }
})();

/* =============================================
   NEWSLETTER FORM (THE EQNOMIST)
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.footer-newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.footer-newsletter-input');
      const btn = form.querySelector('.footer-newsletter-btn');
      if (!input || !input.value.trim()) return;
      btn.textContent = 'Subscribed! ✓';
      btn.disabled = true;
      input.value = '';
      setTimeout(() => {
        btn.textContent = 'Subscribe';
        btn.disabled = false;
      }, 4000);
    });
  });
});

/* Explicit global assignments for inline onclick handlers */
window.openRegModal = openRegModal;
window.closeRegModal = closeRegModal;
window.openRegForCourse = openRegForCourse;
window.showNoDatesAlert = showNoDatesAlert;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.switchPaymentTab = switchPaymentTab;
window.copyUPI = copyUPI;

