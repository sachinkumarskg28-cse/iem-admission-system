// Institute of Engineering & Management (IEM), Kolkata - Production SPA Client Script
const API_URL = '/api';

let state = {
  token: localStorage.getItem('iem_token') || null,
  user: JSON.parse(localStorage.getItem('iem_user') || 'null'),
  currentView: 'home',
  courses: [],
  selectedCourse: null,
  activeTab: 'personal',
  isDark: localStorage.getItem('iem_dark') === 'true',
  dbSelectedCollection: 'applications',
};

// Initialize Theme
if (state.isDark) {
  document.body.classList.add('dark-theme');
  document.body.classList.remove('light-theme');
  const icon = document.getElementById('theme-icon');
  if (icon) icon.innerText = 'light_mode';
}

function toggleTheme() {
  state.isDark = !state.isDark;
  localStorage.setItem('iem_dark', String(state.isDark));
  if (state.isDark) {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    document.getElementById('theme-icon').innerText = 'light_mode';
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    document.getElementById('theme-icon').innerText = 'dark_mode';
  }
}

// API Helper
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const data = await res.json();
    if (res.status === 401 && state.token) {
      logout();
      navigateTo('login');
      return null;
    }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error('API Error:', err);
    return { ok: false, data: { message: err.message } };
  }
}

// Navigation & View Controller
function navigateTo(view, params = {}) {
  state.currentView = view;
  renderNav();
  renderView(params);
  window.scrollTo(0, 0);
}

function renderNav() {
  const navMenu = document.getElementById('nav-menu');
  const authActions = document.getElementById('auth-actions');

  let menuHtml = `
    <div class="nav-link ${state.currentView === 'home' ? 'active' : ''}" onclick="navigateTo('home')">
      <span class="material-icons" style="font-size:1.1rem">home</span> Home
    </div>
    <div class="nav-link ${state.currentView === 'about' ? 'active' : ''}" onclick="navigateTo('about')">
      <span class="material-icons" style="font-size:1.1rem">account_balance</span> About IEM
    </div>
    <div class="nav-link ${state.currentView === 'contact' ? 'active' : ''}" onclick="navigateTo('contact')">
      <span class="material-icons" style="font-size:1.1rem">support_agent</span> Contact & Helpdesk
    </div>
    <div class="nav-link ${state.currentView === 'track' ? 'active' : ''}" onclick="navigateTo('track')">
      <span class="material-icons" style="font-size:1.1rem">track_changes</span> Track Status
    </div>
  `;

  if (state.user) {
    const role = state.user.role;
    if (role === 'student') {
      menuHtml += `
        <div class="nav-link ${state.currentView === 'student_dashboard' ? 'active' : ''}" onclick="navigateTo('student_dashboard')">
          <span class="material-icons" style="font-size:1.1rem">dashboard</span> Dashboard
        </div>
        <div class="nav-link ${state.currentView === 'student_apply' ? 'active' : ''}" onclick="navigateTo('student_apply')">
          <span class="material-icons" style="font-size:1.1rem">edit_document</span> Apply Now
        </div>
        <div class="nav-link ${state.currentView === 'student_payments' ? 'active' : ''}" onclick="navigateTo('student_payments')">
          <span class="material-icons" style="font-size:1.1rem">receipt_long</span> Fee & Receipts
        </div>
        <div class="nav-link ${state.currentView === 'student_tickets' ? 'active' : ''}" onclick="navigateTo('student_tickets')">
          <span class="material-icons" style="font-size:1.1rem">confirmation_number</span> Tickets
        </div>
      `;
    } else if (role === 'faculty') {
      menuHtml += `
        <div class="nav-link ${state.currentView === 'faculty_dashboard' ? 'active' : ''}" onclick="navigateTo('faculty_dashboard')">
          <span class="material-icons" style="font-size:1.1rem">fact_check</span> Academic Scrutiny
        </div>
      `;
    } else if (['officer', 'admission_officer'].includes(role)) {
      menuHtml += `
        <div class="nav-link ${state.currentView === 'officer_dashboard' ? 'active' : ''}" onclick="navigateTo('officer_dashboard')">
          <span class="material-icons" style="font-size:1.1rem">verified_user</span> Scrutiny Queue
        </div>
        <div class="nav-link ${state.currentView === 'officer_reports' ? 'active' : ''}" onclick="navigateTo('officer_reports')">
          <span class="material-icons" style="font-size:1.1rem">analytics</span> Reports
        </div>
      `;
    } else if (role === 'accounts') {
      menuHtml += `
        <div class="nav-link ${state.currentView === 'accounts_dashboard' ? 'active' : ''}" onclick="navigateTo('accounts_dashboard')">
          <span class="material-icons" style="font-size:1.1rem">account_balance_wallet</span> Finance Dashboard
        </div>
      `;
    } else if (['admin', 'super_admin'].includes(role)) {
      menuHtml += `
        <div class="nav-link ${state.currentView === 'admin_dashboard' ? 'active' : ''}" onclick="navigateTo('admin_dashboard')">
          <span class="material-icons" style="font-size:1.1rem">admin_panel_settings</span> Executive Dashboard
        </div>
        <div class="nav-link ${state.currentView === 'admin_courses' ? 'active' : ''}" onclick="navigateTo('admin_courses')">
          <span class="material-icons" style="font-size:1.1rem">school</span> Courses & Seats
        </div>
        <div class="nav-link ${state.currentView === 'admin_database' ? 'active' : ''}" onclick="navigateTo('admin_database')">
          <span class="material-icons" style="font-size:1.1rem">storage</span> DB Access Panel
        </div>
        <div class="nav-link ${state.currentView === 'admin_audit' ? 'active' : ''}" onclick="navigateTo('admin_audit')">
          <span class="material-icons" style="font-size:1.1rem">history</span> Audit Logs
        </div>
      `;
    }

    authActions.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="text-align: right;">
          <div style="font-size: 0.85rem; font-weight: 700;">${state.user.name}</div>
          <div class="badge badge-${role}" style="font-size: 0.65rem;">${role.replace('_', ' ')}</div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="logout()" title="Sign Out">
          <span class="material-icons" style="font-size:1.1rem">logout</span>
        </button>
      </div>
    `;
  } else {
    authActions.innerHTML = `
      <button class="btn btn-outline btn-sm" onclick="navigateTo('login')">Sign In</button>
      <button class="btn btn-crimson btn-sm" onclick="navigateTo('register')">Register</button>
    `;
  }

  navMenu.innerHTML = menuHtml;
}

function logout() {
  localStorage.removeItem('iem_token');
  localStorage.removeItem('iem_user');
  state.token = null;
  state.user = null;
  navigateTo('login');
}

// Render Specific Views
async function renderView(params = {}) {
  const container = document.getElementById('app-view');

  // 1. HOME VIEW
  if (state.currentView === 'home') {
    if (state.courses.length === 0) {
      const res = await apiCall('/courses');
      if (res && res.ok) state.courses = res.data.courses || [];
    }
    const courses = state.courses;

    container.innerHTML = `
      <!-- Hero Banner -->
      <section style="background: linear-gradient(135deg, #072238 0%, #0b3b60 60%, #174d75 100%); color: #fff; padding: 70px 20px 80px; text-align: center; position: relative;">
        <div class="container" style="max-width: 960px;">
          <div style="display: flex; justify-content: center; align-items: center; gap: 12px; margin-bottom: 18px;">
            <img src="/assets/iem-logo.png" alt="IEM Crest" style="height: 64px; background: rgba(255,255,255,0.9); padding: 5px; border-radius: 8px;" />
            <div style="text-align: left;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #fde047; letter-spacing: 1px; display: block;">INSTITUTE OF ENGINEERING & MANAGEMENT, KOLKATA</span>
              <span style="font-size: 0.75rem; color: #cbd5e1;">NAAC 'A' Grade &bull; NBA Accredited &bull; MAKAUT Affiliated</span>
            </div>
          </div>
          
          <h1 style="font-size: 2.8rem; margin-bottom: 14px; color: #fff; line-height: 1.15;">
            Empowering Next-Gen Leaders with <span style="color: #fde047;">Quality Education</span>
          </h1>
          <p style="font-size: 1.05rem; color: #e2e8f0; line-height: 1.6; margin-bottom: 28px;">
            West Bengal's Pioneer Engineering & Management Institute (Est. 1989). Admissions Open for B.Tech, BCA, MCA, BBA, and MBA Programs for Session 2026-2027.
          </p>
          
          <div style="display: flex; justify-content: center; gap: 14px; margin-bottom: 34px; flex-wrap: wrap;">
            <button class="btn btn-crimson" onclick="navigateTo('${state.user ? (state.user.role === 'student' ? 'student_apply' : 'home') : 'register'}')" style="padding: 12px 26px; font-size: 1rem; font-weight:700;">
              <span class="material-icons">app_registration</span> Apply for Admission 2026
            </button>
            <button class="btn btn-outline" style="border-color: #fff; color: #fff; padding: 12px 24px; font-size: 1rem;" onclick="navigateTo('about')">
              <span class="material-icons">school</span> Discover IEM
            </button>
          </div>

          <!-- Quick Track Input Bar -->
          <div style="background: rgba(255,255,255,0.12); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.25); padding: 8px; border-radius: 12px; max-width: 560px; margin: 0 auto;">
            <div style="display: flex; background: var(--bg-card); border-radius: 6px; padding: 4px;">
              <input id="quick-track-input" type="text" placeholder="Enter Application No. (e.g. IEM2026BTECH-CSE001)..." style="flex: 1; border: none; outline: none; padding: 10px 14px; background: transparent; color: var(--text-main); font-size: 0.92rem;" />
              <button class="btn btn-primary" onclick="quickTrack()">Track Application</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Institutional Highlights Strip -->
      <section style="background: #082035; color: #fff; padding: 20px 0; border-bottom: 1px solid #13395b;">
        <div class="container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; text-align: center;">
          <div><strong style="color: #fde047; font-size: 1.6rem; display:block;">1989</strong><span style="font-size:0.8rem; color:#cbd5e1;">Pioneer Legacy (37+ Years)</span></div>
          <div><strong style="color: #fde047; font-size: 1.6rem; display:block;">NAAC 'A'</strong><span style="font-size:0.8rem; color:#cbd5e1;">Accredited Excellence</span></div>
          <div><strong style="color: #fde047; font-size: 1.6rem; display:block;">₹72 LPA</strong><span style="font-size:0.8rem; color:#cbd5e1;">Highest Placement Package</span></div>
          <div><strong style="color: #fde047; font-size: 1.6rem; display:block;">100%+</strong><span style="font-size:0.8rem; color:#cbd5e1;">Consistent Placement Record</span></div>
        </div>
      </section>

      <!-- Academic Offerings Grid -->
      <section id="courses-sec" class="container" style="padding: 60px 20px;">
        <div style="text-align: center; max-width: 700px; margin: 0 auto 40px;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--iem-crimson); letter-spacing: 1px;">ACADEMIC PROGRAMS & SEATS</span>
          <h2 style="font-size: 2.1rem; margin: 6px 0 10px;">Degree Programs Offered</h2>
          <p style="color: var(--text-muted);">Explore branch seat matrix, eligibility criteria, and fee structure for Session 2026-2027.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px;">
          ${courses.map(c => `
            <div class="card" style="display: flex; flex-direction: column; transition: transform 0.2s; border-top: 4px solid var(--iem-primary);">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span class="badge badge-submitted">${c.courseCode}</span>
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--iem-crimson);">${c.department}</span>
              </div>
              <h3 style="font-size: 1.25rem; margin-bottom: 6px; min-height: 48px;">${c.name}</h3>
              
              <div style="background: var(--bg-subtle); padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 0.85rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Duration:</span> <strong>${c.duration}</strong></div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Available Seats:</span> <strong style="color:#10b981;">${c.availableSeats} / ${c.totalSeats}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Semester Fee:</span> <strong>₹ ${c.fees?.semesterFee ? c.fees.semesterFee.toLocaleString('en-IN') : '85,000'}</strong></div>
              </div>

              <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 20px; flex: 1; line-height: 1.5;">
                <strong>Eligibility:</strong> ${c.eligibility || 'Min 60% in PCM, Valid WBJEE / JEE Main Rank'}
              </div>

              <button class="btn btn-primary btn-block" onclick="startApply('${c._id}')">
                Apply for ${c.courseCode} &rarr;
              </button>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  // 2. ABOUT IEM VIEW
  else if (state.currentView === 'about') {
    container.innerHTML = `
      <section style="background: #0b3b60; color: #fff; padding: 50px 20px; text-align: center;">
        <div class="container" style="max-width: 900px;">
          <img src="/assets/iem-logo.png" alt="IEM Logo" style="height: 60px; background:#fff; padding:6px; border-radius:8px; margin-bottom:12px;" />
          <h1 style="color: #fff; font-size: 2.4rem; margin-bottom: 10px;">About IEM Kolkata</h1>
          <p style="font-size: 1.05rem; color: #e2e8f0; line-height: 1.6;">
            The Premier & Oldest Private Engineering & Management Institution of West Bengal &bull; Salt Lake Sector V, Kolkata
          </p>
        </div>
      </section>

      <section class="container" style="padding: 50px 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 28px; margin-bottom: 40px;">
          <div class="card">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
              <span class="material-icons" style="color:var(--iem-crimson); font-size:1.8rem;">history_edu</span>
              <h3 style="font-size:1.3rem;">Institutional Overview</h3>
            </div>
            <p style="font-size:0.9rem; line-height:1.7; color:var(--text-muted);">
              Founded in 1989 under the visionary leadership of <strong>Prof. Dr. Satyajit Chakrabarti</strong>, the Institute of Engineering & Management (IEM) has earned an impeccable reputation for high quality education and 100% placement assurance in eastern India. Located in the heart of Kolkata's IT hub (Sector V, Salt Lake), IEM offers state-of-the-art infrastructure and continuous industry immersion.
            </p>
          </div>

          <div class="card">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
              <span class="material-icons" style="color:var(--iem-primary); font-size:1.8rem;">visibility</span>
              <h3 style="font-size:1.3rem;">Vision & Mission</h3>
            </div>
            <p style="font-size:0.9rem; line-height:1.7; color:var(--text-muted);">
              <strong>Vision:</strong> To be a globally recognized center of excellence in technical and managerial education, innovation, and ethical leadership.<br/><br/>
              <strong>Mission:</strong> Foster intellectual curiosity, impart rigorous industry-relevant knowledge, inculcate human values, and prepare graduates for high-impact global careers.
            </p>
          </div>
        </div>

        <!-- Academic Excellence & Placements -->
        <div class="card" style="margin-bottom: 40px; border-left: 5px solid var(--iem-crimson);">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
            <span class="material-icons" style="color:var(--iem-crimson); font-size:2rem;">work</span>
            <h3 style="font-size:1.4rem;">Placement Track Record & Industry Partners</h3>
          </div>
          <p style="font-size:0.92rem; line-height:1.7; color:var(--text-muted); margin-bottom:20px;">
            IEM Kolkata holds the record of 100%+ job offers with multiple dream offers for deserving students. Students are recruited by tier-one multinational giants across IT, Finance, Consulting, and Core Engineering.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom:20px; text-align:center;">
            <div style="background:var(--bg-subtle); padding:16px; border-radius:8px;">
              <strong style="font-size:1.6rem; color:var(--iem-crimson); display:block;">₹72.0 LPA</strong>
              <small>Highest Package Offered</small>
            </div>
            <div style="background:var(--bg-subtle); padding:16px; border-radius:8px;">
              <strong style="font-size:1.6rem; color:var(--iem-primary); display:block;">₹6.5 LPA</strong>
              <small>Average Placement Package</small>
            </div>
            <div style="background:var(--bg-subtle); padding:16px; border-radius:8px;">
              <strong style="font-size:1.6rem; color:#10b981; display:block;">150+</strong>
              <small>Annual Corporate Recruiters</small>
            </div>
          </div>
          <div style="font-size:0.85rem; color:var(--text-muted);">
            <strong>Top Corporate Recruiters:</strong> Tata Consultancy Services (TCS), Cognizant, Infosys, Wipro, Amazon, Capgemini, PwC, Oracle, Mindtree, Deloitte, IBM, LTI, SAP Labs.
          </div>
        </div>

        <!-- Facilities & Research -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 28px;">
          <div class="card">
            <h3 style="font-size:1.25rem; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
              <span class="material-icons" style="color:var(--iem-primary);">science</span> Research & Innovation
            </h3>
            <ul style="list-style:none; font-size:0.88rem; line-height:1.8; color:var(--text-muted);">
              <li>&bull; AI, Machine Learning & Robotics Excellence Center</li>
              <li>&bull; IoT & Embedded Systems Incubation Lab</li>
              <li>&bull; Smart Grid and Renewable Energy Research Hub</li>
              <li>&bull; Over 200+ International Patents & IEEE Publications</li>
            </ul>
          </div>
          <div class="card">
            <h3 style="font-size:1.25rem; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
              <span class="material-icons" style="color:var(--iem-primary);">apartment</span> Campus Facilities
            </h3>
            <ul style="list-style:none; font-size:0.88rem; line-height:1.8; color:var(--text-muted);">
              <li>&bull; Central Digital Library with 150,000+ volumes & IEEE Xplore</li>
              <li>&bull; Fully Air-Conditioned Smart Multimedia Classrooms</li>
              <li>&bull; High-Speed Wi-Fi Enabled Campus with 1 Gbps Fiber</li>
              <li>&bull; Dedicated Separate Boys & Girls Hostels with 24/7 Security</li>
            </ul>
          </div>
        </div>
      </section>
    `;
  }

  // 3. CONTACT & HELPDESK VIEW
  else if (state.currentView === 'contact') {
    const faqRes = await apiCall('/helpdesk/faqs');
    const faqs = faqRes?.data?.faqs || [];

    container.innerHTML = `
      <section style="background: #0b3b60; color: #fff; padding: 50px 20px; text-align: center;">
        <div class="container" style="max-width: 900px;">
          <h1 style="color: #fff; font-size: 2.2rem; margin-bottom: 8px;">Admission Helpdesk & Contact Us</h1>
          <p style="font-size: 1rem; color: #e2e8f0;">We're here to assist you throughout your admission journey at IEM Kolkata</p>
        </div>
      </section>

      <section class="container" style="padding: 50px 20px;">
        <!-- Contact Information Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 40px;">
          <div class="card" style="text-align:center; padding:24px;">
            <span class="material-icons" style="color:var(--iem-crimson); font-size:2.4rem; margin-bottom:8px;">phone_in_talk</span>
            <h4>Helpline Numbers</h4>
            <p style="font-size:0.9rem; color:var(--text-muted); margin-top:6px;">
              +91 33 2357 2059<br/>+91 33 2357 2995<br/>+91 9674005988 (WhatsApp)
            </p>
          </div>
          <div class="card" style="text-align:center; padding:24px;">
            <span class="material-icons" style="color:var(--iem-primary); font-size:2.4rem; margin-bottom:8px;">email</span>
            <h4>Admission Email</h4>
            <p style="font-size:0.9rem; color:var(--text-muted); margin-top:6px;">
              admissions@iemcal.com<br/>admissions@iem.edu.in
            </p>
          </div>
          <div class="card" style="text-align:center; padding:24px;">
            <span class="material-icons" style="color:#10b981; font-size:2.4rem; margin-bottom:8px;">place</span>
            <h4>Campus Address</h4>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:6px;">
              Sector V, Salt Lake Electronics Complex,<br/>Kolkata - 700091, West Bengal
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 36px; margin-bottom: 50px;">
          <!-- Inquiry Form -->
          <div class="card">
            <h3 style="font-size: 1.3rem; margin-bottom: 14px; display:flex; align-items:center; gap:8px;">
              <span class="material-icons" style="color:var(--iem-primary);">send</span> Send an Admission Inquiry
            </h3>
            <div id="contact-success" style="display:none; padding:10px; border-radius:6px; background:rgba(16,185,129,0.15); color:#10b981; font-size:0.88rem; margin-bottom:14px;"></div>
            
            <form onsubmit="handleContactSubmit(event)">
              <div class="form-group">
                <label>Your Full Name *</label>
                <input id="inq-name" type="text" placeholder="e.g. Aniket Roy" required />
              </div>
              <div class="form-group">
                <label>Email Address *</label>
                <input id="inq-email" type="email" placeholder="aniket@gmail.com" required />
              </div>
              <div class="form-group">
                <label>Phone Number *</label>
                <input id="inq-phone" type="tel" placeholder="+91 9876543210" required />
              </div>
              <div class="form-group">
                <label>Course Interested In</label>
                <select id="inq-course">
                  <option value="B.Tech Computer Science & Engineering">B.Tech Computer Science & Engineering</option>
                  <option value="B.Tech Information Technology">B.Tech Information Technology</option>
                  <option value="B.Tech Electronics & Communication">B.Tech Electronics & Communication</option>
                  <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                  <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                  <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Message / Query *</label>
                <textarea id="inq-message" rows="3" placeholder="Specify your marks, exam rank, or questions..." required></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-block">Submit Inquiry</button>
            </form>
          </div>

          <!-- FAQ Accordion -->
          <div>
            <h3 style="font-size: 1.3rem; margin-bottom: 14px; display:flex; align-items:center; gap:8px;">
              <span class="material-icons" style="color:var(--iem-crimson);">quiz</span> Frequently Asked Questions
            </h3>
            <div>
              ${faqs.map((f, i) => `
                <div class="faq-item">
                  <div class="faq-header" onclick="toggleFaq(${i})">
                    <span>${f.question}</span>
                    <span class="material-icons" id="faq-icon-${i}">expand_more</span>
                  </div>
                  <div class="faq-body" id="faq-body-${i}" style="${i === 0 ? '' : 'display:none;'}">
                    ${f.answer}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // 4. LOGIN VIEW
  else if (state.currentView === 'login') {
    container.innerHTML = `
      <div style="min-height: calc(100vh - 180px); display: flex; align-items: center; justify-content: center; padding: 40px 20px;">
        <div class="card" style="width: 100%; max-width: 480px; padding: 36px; box-shadow: var(--shadow-lg);">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="/assets/iem-logo.png" alt="IEM Logo" style="height: 54px; margin-bottom: 8px;" />
            <h2 style="font-size: 1.5rem; margin-bottom: 4px;">Portal Authentication</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Sign in to access your role workspace</p>
          </div>

          <!-- One Click Demo Logins for All Roles -->
          <div style="background: var(--bg-subtle); border: 1px dashed var(--border-color); padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--iem-crimson); margin-bottom: 8px;">ONE-CLICK DEMO LOGIN (SELECT ROLE)</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
              <button class="btn btn-outline btn-sm" onclick="autoLogin('student.rahul@gmail.com', 'Student@123')">Student</button>
              <button class="btn btn-outline btn-sm" onclick="autoLogin('officer.engg@iem.edu.in', 'Officer@123')">Officer</button>
              <button class="btn btn-outline btn-sm" onclick="autoLogin('faculty.cse@iem.edu.in', 'Faculty@123')">Faculty</button>
              <button class="btn btn-outline btn-sm" onclick="autoLogin('accounts@iem.edu.in', 'Accounts@123')">Accounts</button>
              <button class="btn btn-outline btn-sm" onclick="autoLogin('admin@iem.edu.in', 'Admin@123')">Admin</button>
              <button class="btn btn-outline btn-sm" onclick="autoLogin('superadmin@iem.edu.in', 'Admin@123')">Super Admin</button>
            </div>
          </div>

          <div id="login-error" style="display:none; padding: 10px; border-radius: 6px; background: rgba(239,68,68,0.1); color: var(--danger); font-size: 0.85rem; margin-bottom: 16px;"></div>

          <form onsubmit="handleLogin(event)">
            <div class="form-group">
              <label>Email Address</label>
              <input id="login-email" type="email" placeholder="name@example.com" required value="student.rahul@gmail.com" />
            </div>
            <div class="form-group">
              <label>Password</label>
              <input id="login-password" type="password" placeholder="••••••••" required value="Student@123" />
            </div>
            <button type="submit" class="btn btn-primary btn-block" style="margin-top: 8px;">Sign In</button>
          </form>

          <div style="text-align: center; margin-top: 20px; font-size: 0.85rem; color: var(--text-muted);">
            New Applicant? <a onclick="navigateTo('register')" style="font-weight: 600; color:var(--iem-crimson);">Register as Student</a>
          </div>
        </div>
      </div>
    `;
  }

  // 5. REGISTER VIEW
  else if (state.currentView === 'register') {
    container.innerHTML = `
      <div style="min-height: calc(100vh - 180px); display: flex; align-items: center; justify-content: center; padding: 40px 20px;">
        <div class="card" style="width: 100%; max-width: 480px; padding: 36px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="/assets/iem-logo.png" alt="IEM Logo" style="height: 52px; margin-bottom: 8px;" />
            <h2 style="font-size: 1.5rem; margin-bottom: 4px;">Student Registration</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Create your account for IEM Kolkata Admissions 2026</p>
          </div>

          <div id="reg-error" style="display:none; padding: 10px; border-radius: 6px; background: rgba(239,68,68,0.1); color: var(--danger); font-size: 0.85rem; margin-bottom: 16px;"></div>

          <form onsubmit="handleRegister(event)">
            <div class="form-group">
              <label>Full Name *</label>
              <input id="reg-name" type="text" placeholder="e.g. Sourav Mukherjee" required />
            </div>
            <div class="form-group">
              <label>Email Address *</label>
              <input id="reg-email" type="email" placeholder="sourav@example.com" required />
            </div>
            <div class="form-group">
              <label>Phone Number *</label>
              <input id="reg-phone" type="tel" placeholder="+91 9876543210" required />
            </div>
            <div class="form-group">
              <label>Password *</label>
              <input id="reg-password" type="password" placeholder="At least 6 characters" required />
            </div>
            <button type="submit" class="btn btn-crimson btn-block" style="margin-top: 8px;">Register & Begin Application</button>
          </form>

          <div style="text-align: center; margin-top: 20px; font-size: 0.85rem; color: var(--text-muted);">
            Already registered? <a onclick="navigateTo('login')" style="font-weight: 600;">Sign in</a>
          </div>
        </div>
      </div>
    `;
  }

  // 6. STUDENT DASHBOARD
  else if (state.currentView === 'student_dashboard') {
    const res = await apiCall('/student/dashboard-overview');
    const data = res?.data?.data || {};
    const apps = data.recentApplications || [];

    container.innerHTML = `
      <div class="container" style="padding: 40px 20px;">
        <div class="card" style="background: linear-gradient(135deg, rgba(11, 59, 96, 0.95), rgba(2, 132, 199, 0.9)); color: #fff; padding: 30px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: #fde047; letter-spacing: 1px;">APPLICANT PORTAL &bull; SESSION 2026-2027</div>
            <h2 style="color: #fff; font-size: 1.8rem; margin: 4px 0;">Welcome, ${state.user?.name}!</h2>
            <p style="font-size: 0.85rem; color: #e2e8f0;">Student ID: <strong>${data.student?.studentId || 'IEM-STD-2026'}</strong> &bull; Profile Completion: <strong>${data.student?.profileCompletionPercentage || 85}%</strong></p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" onclick="navigateTo('student_apply')"><span class="material-icons">add_circle</span> Apply for Course</button>
            <button class="btn btn-outline" style="border-color:#fff; color:#fff;" onclick="navigateTo('student_payments')"><span class="material-icons">receipt_long</span> Payment History</button>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-size: 1.4rem;">Your Admission Applications</h3>
          <button class="btn btn-primary btn-sm" onclick="navigateTo('student_apply')">+ New Application</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px;">
          ${apps.map(a => `
            <div class="card" style="display: flex; flex-direction: column;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <div>
                  <span style="font-size: 0.75rem; font-weight: 700; color: var(--iem-primary);">${a.applicationNumber}</span>
                  <h4 style="font-size: 1.1rem; margin: 2px 0;">${a.course?.name || 'Program'}</h4>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">${a.course?.department || ''}</span>
                </div>
                <span class="badge badge-${a.status.toLowerCase()}">${a.status}</span>
              </div>

              <div style="background: var(--bg-subtle); padding: 10px; border-radius: 6px; font-size: 0.85rem; margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span>Application Fee:</span>
                  <strong style="color: ${a.isFeePaid ? '#10b981' : '#f59e0b'};">${a.isFeePaid ? '₹ 2,000 Paid (Confirmed)' : 'Payment Pending'}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Allocated Seat:</span>
                  <strong>${a.allocatedSeatNumber || 'Under Scrutiny'}</strong>
                </div>
              </div>

              ${a.officerRemarks ? `
                <div style="background: rgba(245,158,11,0.1); border-left: 3px solid #f59e0b; padding: 8px; border-radius: 0 4px 4px 0; font-size: 0.8rem; margin-bottom: 14px;">
                  <strong>Remarks:</strong> ${a.officerRemarks}
                </div>
              ` : ''}

              <div style="margin-top: auto; display: flex; gap: 8px;">
                <a href="/api/applications/${a._id}/download-pdf" target="_blank" class="btn btn-secondary btn-sm" style="flex:1;">
                  <span class="material-icons" style="font-size:1rem;">download</span> Official Form PDF
                </a>
                ${!a.isFeePaid ? `
                  <button class="btn btn-crimson btn-sm" onclick="openRazorpayModal('${a._id}')">Pay ₹2000</button>
                ` : `
                  <button class="btn btn-outline btn-sm" onclick="openReceiptModal('${a._id}')">Receipt</button>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 7. STUDENT PAYMENTS & RECEIPTS VIEW
  else if (state.currentView === 'student_payments') {
    const res = await apiCall('/payments/history');
    const payments = res?.data?.payments || [];

    container.innerHTML = `
      <div class="container" style="padding: 40px 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div>
            <h2 style="font-size: 1.8rem; margin-bottom: 4px;">Fee Payments & Receipts</h2>
            <p style="color:var(--text-muted); font-size:0.9rem;">View transaction history, payment verification status, and download e-receipts.</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="navigateTo('student_dashboard')">&larr; Back to Dashboard</button>
        </div>

        <div class="card" style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map(p => `
                <tr>
                  <td><strong>${p.receiptNumber || 'RCP-IEM-PENDING'}</strong></td>
                  <td><code style="font-size:0.8rem;">${p.transactionId}</code></td>
                  <td><strong>₹ ${p.amount.toLocaleString('en-IN')}</strong></td>
                  <td><span class="badge badge-submitted">${p.paymentMethod || 'UPI'}</span></td>
                  <td><span class="badge badge-${p.status === 'SUCCESS' ? 'approved' : 'danger'}">${p.status}</span></td>
                  <td>${p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button class="btn btn-outline btn-sm" onclick="showReceiptDetail('${p.receiptNumber || p.transactionId}')">
                      <span class="material-icons" style="font-size:0.9rem;">receipt</span> View Receipt
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 8. STUDENT SUPPORT TICKETS VIEW
  else if (state.currentView === 'student_tickets') {
    const res = await apiCall('/helpdesk/tickets');
    const tickets = res?.data?.tickets || [];

    container.innerHTML = `
      <div class="container" style="padding: 40px 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div>
            <h2 style="font-size: 1.8rem; margin-bottom: 4px;">Helpdesk Support Tickets</h2>
            <p style="color:var(--text-muted); font-size:0.9rem;">Submit assistance requests directly to admission officers & scrutiny faculty.</p>
          </div>
          <button class="btn btn-crimson btn-sm" onclick="openCreateTicketModal()">+ Open New Ticket</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(360px, 1fr)); gap:20px;">
          ${tickets.map(t => `
            <div class="card">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="font-size:0.75rem; font-weight:700; color:var(--iem-primary);">${t.ticketNumber}</span>
                <span class="badge badge-${t.status === 'RESOLVED' ? 'approved' : 'pending'}">${t.status}</span>
              </div>
              <h4 style="font-size:1.05rem; margin-bottom:6px;">${t.subject}</h4>
              <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; margin-bottom:12px;">${t.description}</p>
              
              ${t.responses && t.responses.length > 0 ? `
                <div style="background:var(--bg-subtle); padding:10px; border-radius:6px; font-size:0.82rem; margin-top:10px;">
                  <strong style="color:var(--iem-primary);">${t.responses[0].responderName}:</strong> ${t.responses[0].message}
                </div>
              ` : '<div style="font-size:0.78rem; color:var(--text-muted); font-style:italic;">Awaiting response from admission team...</div>'}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 9. FACULTY ACADEMIC SCRUTINY DASHBOARD
  else if (state.currentView === 'faculty_dashboard') {
    const res = await apiCall('/officer/applications');
    const apps = res?.data?.applications || [];

    container.innerHTML = `
      <div class="container" style="padding: 40px 20px;">
        <div class="card" style="background:#0b3b60; color:#fff; padding:24px; margin-bottom:24px;">
          <h2 style="color:#fff; font-size:1.8rem; margin-bottom:4px;">Faculty Academic Scrutiny Console</h2>
          <p style="color:#cbd5e1; font-size:0.88rem;">Department: <strong>${state.user.department || 'Computer Science & Engineering'}</strong> &bull; Scrutiny Officer: <strong>${state.user.name}</strong></p>
        </div>

        <div class="card" style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>App No</th>
                <th>Candidate</th>
                <th>Program</th>
                <th>Class 12 %</th>
                <th>WBJEE / JEE Rank</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${apps.map(a => `
                <tr>
                  <td><strong>${a.applicationNumber}</strong></td>
                  <td>${a.student?.personalInfo?.name || a.applicantName || 'Candidate'}</td>
                  <td>${a.course?.courseCode || 'BTECH-CSE'}</td>
                  <td><strong>88.4% (PCM)</strong></td>
                  <td><span class="badge badge-submitted">Rank: 2,410</span></td>
                  <td><span class="badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm" onclick="officerAction('${a._id}', 'APPROVED')">Verify & Approve</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 10. ACCOUNTS DASHBOARD
  else if (state.currentView === 'accounts_dashboard') {
    const res = await apiCall('/admin/accounts-summary');
    const metrics = res?.data?.metrics || {};
    const recent = res?.data?.recentPayments || [];

    container.innerHTML = `
      <div class="container" style="padding: 40px 20px;">
        <div class="card" style="background: linear-gradient(135deg, #072238, #0b3b60); color:#fff; padding:26px; margin-bottom:24px;">
          <h2 style="color:#fff; font-size:1.8rem; margin-bottom:4px;">Accounts & Finance Directorate</h2>
          <p style="color:#cbd5e1; font-size:0.88rem;">Fee Reconciliation, Cashier Ledger, and Admission Receipts Audit</p>
        </div>

        <!-- Revenue Analytics Strip -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-bottom:30px;">
          <div class="card">
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">TOTAL REVENUE COLLECTED</span>
            <div style="font-size:1.8rem; font-weight:800; color:#10b981; margin:6px 0;">₹ ${(metrics.totalRevenue || 0).toLocaleString('en-IN')}</div>
            <small style="color:var(--text-muted);">${metrics.successfulTransactions || 0} Successful Transactions</small>
          </div>
          <div class="card">
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">PENDING RECEIVABLES</span>
            <div style="font-size:1.8rem; font-weight:800; color:var(--warning); margin:6px 0;">₹ ${(metrics.pendingRevenue || 0).toLocaleString('en-IN')}</div>
            <small style="color:var(--text-muted);">From Unpaid Registrations</small>
          </div>
          <div class="card">
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">PAYMENT GATEWAYS</span>
            <div style="font-size:1.1rem; font-weight:700; margin:10px 0;">Razorpay &bull; UPI &bull; Cards</div>
            <small style="color:#10b981;">100% Reconciled</small>
          </div>
        </div>

        <!-- Transaction Ledger Table -->
        <div class="card" style="overflow-x:auto;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3>Recent Fee Transactions</h3>
            <button class="btn btn-outline btn-sm" onclick="window.print()">Print Financial Ledger</button>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Txn ID</th>
                <th>Candidate</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${recent.map(p => `
                <tr>
                  <td><strong>${p.receiptNumber}</strong></td>
                  <td><code>${p.transactionId}</code></td>
                  <td>${p.userName || 'Student'}</td>
                  <td><strong>₹ ${p.amount}</strong></td>
                  <td><span class="badge badge-submitted">${p.paymentMethod}</span></td>
                  <td><span class="badge badge-approved">${p.status}</span></td>
                  <td>${new Date(p.paidAt || p.createdAt).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 11. ADMIN EXECUTIVE DASHBOARD
  else if (state.currentView === 'admin_dashboard') {
    const res = await apiCall('/admin/dashboard-stats');
    const data = res?.data || {};
    const stats = data.stats || {};
    const courses = data.courseStats || [];

    container.innerHTML = `
      <div class="container" style="padding: 40px 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
          <div>
            <h2 style="font-size: 1.8rem; margin-bottom: 4px;">Executive Admission Command Center</h2>
            <p style="font-size: 0.88rem; color: var(--text-muted);">Session 2026-2027 &bull; Real-time Seat Matrix & Conversion Analytics</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary btn-sm" onclick="navigateTo('admin_database')">
              <span class="material-icons" style="font-size:1rem;">storage</span> Database Access Panel
            </button>
            <button class="btn btn-outline btn-sm" onclick="navigateTo('admin_courses')">
              <span class="material-icons" style="font-size:1rem;">school</span> Manage Seats
            </button>
          </div>
        </div>

        <!-- KPI Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div class="card" style="border-left: 4px solid #0284c7;">
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">TOTAL APPLICATIONS</span>
            <div style="font-size: 1.8rem; font-weight: 800; margin: 4px 0;">${stats.totalApplications || 0}</div>
            <span style="font-size: 0.75rem; color: #10b981;">&uarr; 28% from last cycle</span>
          </div>
          <div class="card" style="border-left: 4px solid #10b981;">
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">APPROVED / ALLOCATED</span>
            <div style="font-size: 1.8rem; font-weight: 800; color: #10b981; margin: 4px 0;">${stats.approvedApplications || 0}</div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Seats Booked</span>
          </div>
          <div class="card" style="border-left: 4px solid #f59e0b;">
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">PENDING SCRUTINY</span>
            <div style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin: 4px 0;">${stats.pendingApplications || 0}</div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">In Verification Queue</span>
          </div>
          <div class="card" style="border-left: 4px solid #ef4444;">
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">REJECTED CANDIDATES</span>
            <div style="font-size: 1.8rem; font-weight: 800; color: #ef4444; margin: 4px 0;">${stats.rejectedApplications || 0}</div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Did not meet cutoff</span>
          </div>
        </div>

        <!-- Revenue Analytics Strip -->
        <div class="card" style="background:var(--bg-subtle); margin-bottom:30px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <span style="font-size:0.75rem; font-weight:700; color:var(--iem-crimson);">FEE REVENUE RECONCILIATION</span>
            <h3 style="font-size:1.3rem;">Total Application Fee Collected: <span style="color:#10b981;">₹ ${(stats.totalRevenue || 0).toLocaleString('en-IN')}</span></h3>
          </div>
          <button class="btn btn-outline btn-sm" onclick="navigateTo('accounts_dashboard')">View Finance Ledger &rarr;</button>
        </div>

        <!-- Course Occupancy Table -->
        <div class="card" style="margin-bottom: 30px; overflow-x: auto;">
          <h3 style="font-size: 1.25rem; margin-bottom: 16px;">Course-Wise Seat Occupancy</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Department</th>
                <th>Total Seats</th>
                <th>Available</th>
                <th>Admitted</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              ${courses.map(c => {
                const pct = Math.round(((c.totalSeats - c.availableSeats) / c.totalSeats) * 100) || 0;
                return `
                  <tr>
                    <td><strong>${c.courseCode}</strong></td>
                    <td>${c.courseName}</td>
                    <td>${c.department}</td>
                    <td>${c.totalSeats}</td>
                    <td><strong style="color: #10b981;">${c.availableSeats}</strong></td>
                    <td>${c.admittedCount}</td>
                    <td style="width: 140px;">
                      <div style="background: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 4px;">
                        <div style="background: ${pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981'}; width: ${pct}%; height: 100%;"></div>
                      </div>
                      <small style="font-size: 0.75rem; font-weight: 600;">${pct}% Filled</small>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 12. ADMIN DATABASE ACCESS PANEL VIEW
  else if (state.currentView === 'admin_database') {
    const colRes = await apiCall('/admin/database/collections');
    const collections = colRes?.data?.collections || [];
    const activeCol = params.collection || state.dbSelectedCollection || 'applications';
    state.dbSelectedCollection = activeCol;

    const recRes = await apiCall(`/admin/database/${activeCol}?search=${encodeURIComponent(params.search || '')}`);
    const records = recRes?.data?.records || [];

    container.innerHTML = `
      <div class="container" style="padding: 40px 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
          <div>
            <h2 style="font-size: 1.8rem; margin-bottom: 4px;">Admin Database Management Panel</h2>
            <p style="color:var(--text-muted); font-size:0.88rem;">Secure database inspection, CRUD operations, and CSV/Excel data export.</p>
          </div>
          <div style="display:flex; gap:10px;">
            <a href="/api/admin/database/${activeCol}/export" target="_blank" class="btn btn-outline btn-sm">
              <span class="material-icons" style="font-size:1rem;">file_download</span> Export CSV / Excel
            </a>
            <button class="btn btn-primary btn-sm" onclick="openAddRecordModal('${activeCol}')">
              <span class="material-icons" style="font-size:1rem;">add</span> Add Record
            </button>
          </div>
        </div>

        <!-- Collection Selector Pills -->
        <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; margin-bottom:16px;">
          ${collections.map(c => `
            <button class="btn btn-sm ${c.name === activeCol ? 'btn-primary' : 'btn-outline'}" onclick="navigateTo('admin_database', { collection: '${c.name}' })" style="white-space:nowrap;">
              ${c.label} (${c.count})
            </button>
          `).join('')}
        </div>

        <!-- Search Bar -->
        <div class="card" style="padding:14px; margin-bottom:20px;">
          <div style="display:flex; gap:10px;">
            <input id="db-search-input" type="text" placeholder="Search ${activeCol} records..." value="${params.search || ''}" style="flex:1; padding:8px 14px; border:1px solid var(--border-color); border-radius:6px; background:var(--bg-card); color:var(--text-main);" />
            <button class="btn btn-primary btn-sm" onclick="executeDbSearch('${activeCol}')">Search</button>
          </div>
        </div>

        <!-- Records Table -->
        <div class="card" style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Summary Fields</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${records.length === 0 ? `<tr><td colspan="4" style="text-align:center; padding:30px; color:var(--text-muted);">No records found in collection '${activeCol}'.</td></tr>` : ''}
              ${records.map(r => `
                <tr>
                  <td><strong>${r._id}</strong></td>
                  <td>
                    <div style="max-height:60px; overflow-y:auto; font-size:0.8rem; font-family:monospace; background:var(--bg-subtle); padding:6px; border-radius:4px;">
                      ${JSON.stringify(r).slice(0, 150)}...
                    </div>
                  </td>
                  <td>${r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      <button class="btn btn-outline btn-sm" onclick="openEditRecordModal('${activeCol}', '${r._id}')">Edit</button>
                      <button class="btn btn-danger btn-sm" onclick="deleteDbRecord('${activeCol}', '${r._id}')">Delete</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 13. TRACK VIEW
  else if (state.currentView === 'track') {
    const appNo = params.appNo || '';
    let appData = null;
    let trackError = null;

    if (appNo) {
      const res = await apiCall(`/applications/track/${appNo}`);
      if (res && res.ok) appData = res.data.application;
      else trackError = res?.data?.message || 'Application number not found.';
    }

    container.innerHTML = `
      <div class="container" style="padding: 50px 20px; max-width: 800px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="font-size: 2rem; margin-bottom: 6px;">Application Status Verification</h2>
          <p style="color: var(--text-muted);">Enter your official IEM Kolkata Application Reference ID</p>
        </div>

        <div class="card" style="margin-bottom: 30px;">
          <div style="display: flex; gap: 10px;">
            <input id="track-search-box" type="text" placeholder="e.g. IEM2026BTECH-CSE001" value="${appNo}" style="flex: 1; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 1rem; background: var(--bg-card); color: var(--text-main);" />
            <button class="btn btn-primary" onclick="executeTrack()">Verify</button>
          </div>
        </div>

        ${trackError ? `
          <div class="card" style="background: rgba(239, 68, 68, 0.1); border-color: var(--danger); color: var(--danger); padding: 16px; text-align: center;">
            <span class="material-icons" style="vertical-align: middle;">error</span> ${trackError}
          </div>
        ` : ''}

        ${appData ? `
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 16px;">
              <div>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">APPLICATION RECORD</span>
                <h3 style="font-size: 1.3rem;">${appData.applicationNumber}</h3>
              </div>
              <span class="badge badge-${appData.status.toLowerCase()}">${appData.status}</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.9rem; margin-bottom: 20px;">
              <div><span style="color: var(--text-muted);">Course:</span> <strong>${appData.course?.name || 'Academic Degree'}</strong></div>
              <div><span style="color: var(--text-muted);">Department:</span> <strong>${appData.course?.department || 'Engineering'}</strong></div>
              <div><span style="color: var(--text-muted);">Application Fee:</span> <strong style="color: ${appData.isFeePaid ? '#10b981' : '#f59e0b'};">${appData.isFeePaid ? 'Paid (Confirmed)' : 'Pending'}</strong></div>
              <div><span style="color: var(--text-muted);">Seat Allocation:</span> <strong>${appData.allocatedSeatNumber || 'Under Review'}</strong></div>
            </div>

            ${appData.officerRemarks ? `
              <div style="background: var(--bg-subtle); padding: 12px; border-radius: 6px; font-size: 0.85rem; margin-bottom: 20px;">
                <strong>Admission Committee Remarks:</strong> ${appData.officerRemarks}
              </div>
            ` : ''}

            <a href="/api/applications/${appData._id}/download-pdf" target="_blank" class="btn btn-secondary btn-block">
              <span class="material-icons">download</span> Download Official Application Slip (PDF)
            </a>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 14. STUDENT APPLY WIZARD VIEW
  else if (state.currentView === 'student_apply') {
    if (state.courses.length === 0) {
      const res = await apiCall('/courses');
      if (res && res.ok) state.courses = res.data.courses || [];
    }
    const courses = state.courses;

    container.innerHTML = `
      <div class="container" style="padding: 40px 20px; max-width: 800px;">
        <div class="card" style="padding: 36px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--iem-crimson); letter-spacing: 1px;">ONLINE ADMISSIONS 2026</span>
            <h2 style="font-size: 1.8rem; margin: 4px 0;">Candidate Application Wizard</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Select course and submit personal, academic & document details</p>
          </div>

          <form onsubmit="submitApplyWizard(event)">
            <div class="form-group">
              <label>1. Select Degree Program *</label>
              <select id="wiz-course" required>
                <option value="">-- Choose Course --</option>
                ${courses.map(c => `<option value="${c._id}">${c.courseCode} - ${c.name} (${c.availableSeats} seats left)</option>`).join('')}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label>Date of Birth *</label>
                <input id="wiz-dob" type="date" required value="2005-04-12" />
              </div>
              <div class="form-group">
                <label>Gender *</label>
                <select id="wiz-gender">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label>Aadhaar Card Number *</label>
                <input id="wiz-aadhaar" type="text" placeholder="12-digit Aadhaar number" value="382910485920" required />
              </div>
              <div class="form-group">
                <label>Category *</label>
                <select id="wiz-category">
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label>Class 12 Board Percentage (PCM) *</label>
                <input id="wiz-pcm" type="number" step="0.1" placeholder="e.g. 88.5" value="88.5" required />
              </div>
              <div class="form-group">
                <label>WBJEE / JEE Main Rank *</label>
                <input id="wiz-rank" type="text" placeholder="e.g. WBJEE GMR 3420" value="WBJEE 2410" required />
              </div>
            </div>

            <div class="form-group">
              <label>Permanent Residential Address *</label>
              <input id="wiz-address" type="text" placeholder="House no, Street, City, State, Pincode" value="Sector 2, Salt Lake, Kolkata - 700091" required />
            </div>

            <div style="background: var(--bg-subtle); padding: 14px; border-radius: 6px; margin-bottom: 20px; font-size: 0.85rem;">
              <strong>Application Fee Note:</strong> A processing fee of ₹2,000 will be verified via Razorpay/UPI gateway on final submission.
            </div>

            <button type="submit" class="btn btn-crimson btn-block" style="padding: 12px;">Submit Application & Proceed to Fee Payment</button>
          </form>
        </div>
      </div>
    `;
  }

  // 15. OFFICER SCRUTINY QUEUE
  else if (state.currentView === 'officer_dashboard') {
    const res = await apiCall('/officer/applications');
    const apps = res?.data?.applications || [];

    container.innerHTML = `
      <div class="container" style="padding: 40px 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h2 style="font-size: 1.8rem; margin-bottom: 4px;">Candidate Scrutiny Queue</h2>
            <p style="font-size: 0.88rem; color: var(--text-muted);">Verify uploaded credentials and record admission decisions</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="navigateTo('officer_reports')">View Analytics Reports</button>
        </div>

        <div class="card" style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Application No</th>
                <th>Course</th>
                <th>Fee Status</th>
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${apps.map(a => `
                <tr>
                  <td><strong>${a.applicationNumber}</strong></td>
                  <td>${a.course?.courseCode || 'BTECH-CSE'}</td>
                  <td><span class="badge badge-${a.isFeePaid ? 'approved' : 'pending'}">${a.isFeePaid ? 'PAID' : 'UNPAID'}</span></td>
                  <td><span class="badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-success btn-sm" onclick="officerAction('${a._id}', 'APPROVED')">Approve</button>
                      <button class="btn btn-danger btn-sm" onclick="officerAction('${a._id}', 'REJECTED')">Reject</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

// ----------------- HANDLERS & MODALS -----------------

function autoLogin(email, password) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = password;
  handleLogin({ preventDefault: () => {} });
}

async function handleLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = await apiCall('/auth/login', 'POST', { email, password });
  if (res && res.ok) {
    localStorage.setItem('iem_token', res.data.token);
    localStorage.setItem('iem_user', JSON.stringify(res.data.user));
    state.token = res.data.token;
    state.user = res.data.user;

    const role = res.data.user.role;
    if (role === 'student') navigateTo('student_dashboard');
    else if (role === 'faculty') navigateTo('faculty_dashboard');
    else if (role === 'accounts') navigateTo('accounts_dashboard');
    else if (['officer', 'admission_officer'].includes(role)) navigateTo('officer_dashboard');
    else navigateTo('admin_dashboard');
  } else {
    const errBox = document.getElementById('login-error');
    if (errBox) {
      errBox.style.display = 'block';
      errBox.innerText = res?.data?.message || 'Invalid email or password.';
    }
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const phone = document.getElementById('reg-phone').value;
  const password = document.getElementById('reg-password').value;

  const res = await apiCall('/auth/register', 'POST', { name, email, phone, password, role: 'student' });
  if (res && res.ok) {
    localStorage.setItem('iem_token', res.data.token);
    localStorage.setItem('iem_user', JSON.stringify(res.data.user));
    state.token = res.data.token;
    state.user = res.data.user;
    navigateTo('student_dashboard');
  } else {
    const errBox = document.getElementById('reg-error');
    if (errBox) {
      errBox.style.display = 'block';
      errBox.innerText = res?.data?.message || 'Registration failed.';
    }
  }
}

async function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('inq-name').value;
  const email = document.getElementById('inq-email').value;
  const phone = document.getElementById('inq-phone').value;
  const courseInterested = document.getElementById('inq-course').value;
  const message = document.getElementById('inq-message').value;

  const res = await apiCall('/helpdesk/contact', 'POST', { name, email, phone, courseInterested, message });
  if (res && res.ok) {
    const box = document.getElementById('contact-success');
    box.style.display = 'block';
    box.innerText = 'Thank you! Your inquiry has been submitted. Our counselors will contact you shortly.';
    e.target.reset();
  }
}

function toggleFaq(index) {
  const body = document.getElementById(`faq-body-${index}`);
  const icon = document.getElementById(`faq-icon-${index}`);
  if (body.style.display === 'none') {
    body.style.display = 'block';
    icon.innerText = 'expand_less';
  } else {
    body.style.display = 'none';
    icon.innerText = 'expand_more';
  }
}

function startApply(courseId) {
  if (state.user) {
    navigateTo('student_apply');
    setTimeout(() => {
      const select = document.getElementById('wiz-course');
      if (select) select.value = courseId;
    }, 100);
  } else {
    navigateTo('login');
  }
}

async function submitApplyWizard(e) {
  e.preventDefault();
  const courseId = document.getElementById('wiz-course').value;
  if (!courseId) {
    alert('Please select a course.');
    return;
  }

  const draftRes = await apiCall('/applications/draft', 'POST', { courseId, currentStep: 5 });
  if (!draftRes.ok) {
    alert(draftRes.data.message || 'Error creating application.');
    return;
  }

  const appId = draftRes.data.application._id;
  await apiCall(`/applications/${appId}/submit`, 'POST');

  // Trigger Razorpay payment modal
  openRazorpayModal(appId);
}

// ----------------- RAZORPAY & PAYMENT MODAL -----------------

async function openRazorpayModal(applicationId) {
  const res = await apiCall('/payments/razorpay/create-order', 'POST', { applicationId });
  if (!res.ok) {
    alert(res.data.message || 'Payment initialization failed.');
    return;
  }

  const order = res.data.order;
  const modalContainer = document.getElementById('modal-container');

  modalContainer.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-dialog" style="max-width:480px; padding:0; overflow:hidden;">
        <!-- Razorpay Header -->
        <div style="background:#0b3b60; color:#fff; padding:20px; text-align:center; position:relative;">
          <img src="/assets/iem-logo.png" alt="IEM" style="height:44px; background:#fff; padding:4px; border-radius:6px; margin-bottom:6px;" />
          <h3 style="color:#fff; font-size:1.15rem; margin:0;">Institute of Engineering & Management</h3>
          <p style="font-size:0.8rem; color:#e2e8f0; margin-top:2px;">Online Admission Application Fee</p>
          <div style="font-size:1.5rem; font-weight:800; color:#fde047; margin-top:8px;">₹ 2,000.00</div>
        </div>

        <div style="padding:24px;">
          <div style="font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:12px;">SELECT PAYMENT METHOD</div>
          
          <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
            <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid var(--border-color); border-radius:8px; cursor:pointer;">
              <input type="radio" name="paymethod" value="UPI" checked />
              <div>
                <strong>UPI / QR Code (GPay, PhonePe, Paytm, BHIM)</strong>
                <small style="display:block; color:var(--text-muted); font-size:0.75rem;">Fastest & Zero Transaction Charges</small>
              </div>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid var(--border-color); border-radius:8px; cursor:pointer;">
              <input type="radio" name="paymethod" value="CREDIT_CARD" />
              <div>
                <strong>Credit / Debit Card (Visa, MasterCard, RuPay)</strong>
                <small style="display:block; color:var(--text-muted); font-size:0.75rem;">All Domestic & International Cards Accepted</small>
              </div>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid var(--border-color); border-radius:8px; cursor:pointer;">
              <input type="radio" name="paymethod" value="NET_BANKING" />
              <div>
                <strong>Net Banking (SBI, HDFC, ICICI, Axis, PNB)</strong>
                <small style="display:block; color:var(--text-muted); font-size:0.75rem;">50+ Major Indian Banks</small>
              </div>
            </label>
          </div>

          <div style="display:flex; gap:10px;">
            <button class="btn btn-outline" style="flex:1;" onclick="closeModal()">Cancel</button>
            <button class="btn btn-crimson" style="flex:2;" onclick="confirmRazorpayPayment('${order.id}', '${order.transactionId}')">
              Pay ₹2,000 via Razorpay
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function confirmRazorpayPayment(orderId, transactionId) {
  const method = document.querySelector('input[name="paymethod"]:checked')?.value || 'UPI';
  
  const res = await apiCall('/payments/razorpay/verify', 'POST', {
    razorpay_order_id: orderId,
    razorpay_payment_id: `pay_iem_${Date.now()}`,
    razorpay_signature: 'sig_mock_verified',
    transactionId,
  });

  closeModal();

  if (res && res.ok) {
    showPaymentSuccess(res.data.payment);
  } else {
    showPaymentFailure(transactionId);
  }
}

function showPaymentSuccess(payment) {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-dialog" style="max-width:520px; text-align:center; padding:32px;">
        <span class="material-icons" style="font-size:4rem; color:#10b981;">check_circle</span>
        <h2 style="font-size:1.6rem; margin:10px 0 4px;">Payment Confirmed!</h2>
        <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:20px;">
          Your application fee of ₹${payment.amount} has been successfully credited.
        </p>

        <div style="background:var(--bg-subtle); padding:16px; border-radius:8px; text-align:left; font-size:0.85rem; margin-bottom:24px; line-height:1.7;">
          <div>Receipt Number: <strong>${payment.receiptNumber}</strong></div>
          <div>Transaction ID: <strong>${payment.transactionId}</strong></div>
          <div>Payment Mode: <strong>${payment.paymentMethod || 'UPI'}</strong></div>
          <div>Status: <strong style="color:#10b981;">SUCCESS &bull; VERIFIED</strong></div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn btn-outline" style="flex:1;" onclick="closeModal(); navigateTo('student_dashboard');">Go to Dashboard</button>
          <button class="btn btn-primary" style="flex:1;" onclick="showReceiptDetail('${payment.receiptNumber}')">Print E-Receipt</button>
        </div>
      </div>
    </div>
  `;
}

function showPaymentFailure(transactionId) {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-dialog" style="max-width:440px; text-align:center; padding:32px;">
        <span class="material-icons" style="font-size:4rem; color:var(--danger);">error</span>
        <h2 style="font-size:1.5rem; margin:10px 0 4px;">Transaction Failed</h2>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:20px;">
          The transaction could not be completed. Please check your bank connection or try an alternate payment mode.
        </p>
        <button class="btn btn-crimson btn-block" onclick="closeModal()">Try Again</button>
      </div>
    </div>
  `;
}

function showReceiptDetail(receiptNumber) {
  closeModal();
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-dialog" style="max-width:580px; padding:30px;">
        <!-- Official Printable Slip -->
        <div style="border-bottom:2px solid var(--iem-primary); padding-bottom:14px; margin-bottom:16px; display:flex; align-items:center; gap:12px;">
          <img src="/assets/iem-logo.png" alt="IEM" style="height:48px;" />
          <div>
            <h3 style="font-size:1.15rem; color:var(--iem-primary); margin:0;">INSTITUTE OF ENGINEERING & MANAGEMENT</h3>
            <small style="color:var(--iem-crimson); font-weight:700;">OFFICIAL E-FEE RECEIPT &bull; SESSION 2026-2027</small>
          </div>
        </div>

        <div style="font-size:0.88rem; line-height:1.8; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between;"><span>Receipt No:</span> <strong>${receiptNumber}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Institution:</span> <strong>IEM Kolkata (Sector V, Salt Lake)</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Description:</span> <strong>Admission Registration & Processing Fee</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Amount Paid:</span> <strong style="color:#10b981;">INR 2,000.00 (Paid)</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Verification Seal:</span> <strong style="color:var(--iem-primary);">DIGITALLY CONFIRMED &bull; NAAC 'A'</strong></div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn btn-outline" style="flex:1;" onclick="closeModal()">Close</button>
          <button class="btn btn-primary" style="flex:1;" onclick="window.print()">Print Official Receipt</button>
        </div>
      </div>
    </div>
  `;
}

// ----------------- DB MANAGEMENT PANEL MODALS -----------------

function executeDbSearch(collection) {
  const query = document.getElementById('db-search-input').value;
  navigateTo('admin_database', { collection, search: query });
}

function openAddRecordModal(collection) {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-dialog">
        <h3 style="margin-bottom:14px;">Add New Record to '${collection}'</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:14px;">Provide JSON record payload for the new entry:</p>
        <textarea id="db-add-payload" rows="8" style="width:100%; font-family:monospace; font-size:0.85rem; padding:10px; border:1px solid var(--border-color); border-radius:6px; margin-bottom:16px;">
{
  "name": "Sample Entry",
  "status": "ACTIVE"
}
        </textarea>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="submitAddDbRecord('${collection}')">Insert Record</button>
        </div>
      </div>
    </div>
  `;
}

async function submitAddDbRecord(collection) {
  try {
    const raw = document.getElementById('db-add-payload').value;
    const body = JSON.parse(raw);
    const res = await apiCall(`/admin/database/${collection}`, 'POST', body);
    closeModal();
    if (res && res.ok) {
      alert('Record added successfully.');
      navigateTo('admin_database', { collection });
    } else {
      alert(res?.data?.message || 'Error inserting record.');
    }
  } catch (err) {
    alert('Invalid JSON payload: ' + err.message);
  }
}

async function deleteDbRecord(collection, id) {
  if (!confirm(`Are you sure you want to permanently delete record ${id} from '${collection}'?`)) return;
  const res = await apiCall(`/admin/database/${collection}/${id}`, 'DELETE');
  if (res && res.ok) {
    alert('Record deleted.');
    navigateTo('admin_database', { collection });
  } else {
    alert(res?.data?.message || 'Delete failed.');
  }
}

function closeModal() {
  const modal = document.getElementById('modal-container');
  if (modal) modal.innerHTML = '';
}

function quickTrack() {
  const val = document.getElementById('quick-track-input').value;
  if (val) navigateTo('track', { appNo: val.trim().toUpperCase() });
}

function executeTrack() {
  const val = document.getElementById('track-search-box').value;
  if (val) navigateTo('track', { appNo: val.trim().toUpperCase() });
}

async function officerAction(appId, status) {
  const remarks = prompt(`Enter officer remarks for ${status}:`, status === 'APPROVED' ? 'Academic records and PCM cutoff verified.' : 'Cutoff criteria not met.');
  if (remarks === null) return;

  const res = await apiCall(`/officer/applications/${appId}/status`, 'PUT', { status, remarks });
  if (res && res.ok) {
    alert(`Application successfully updated to ${status}.`);
    navigateTo('officer_dashboard');
  } else {
    alert(res?.data?.message || 'Failed to update application.');
  }
}

// Initial Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  renderView();
});
