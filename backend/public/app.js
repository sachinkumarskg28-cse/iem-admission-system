// IEM Kolkata - SPA Client Script
const API_URL = '/api';

let state = {
  token: localStorage.getItem('iem_token') || null,
  user: JSON.parse(localStorage.getItem('iem_user') || 'null'),
  currentView: 'home',
  courses: [],
  selectedCourse: null,
  activeTab: 'personal',
  isDark: localStorage.getItem('iem_dark') === 'true',
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
    <div class="nav-link ${state.currentView === 'track' ? 'active' : ''}" onclick="navigateTo('track')">
      <span class="material-icons" style="font-size:1.1rem">track_changes</span> Track Status
    </div>
  `;

  if (state.user) {
    if (state.user.role === 'student') {
      menuHtml += `
        <div class="nav-link ${state.currentView === 'student_dashboard' ? 'active' : ''}" onclick="navigateTo('student_dashboard')">
          <span class="material-icons" style="font-size:1.1rem">dashboard</span> Dashboard
        </div>
        <div class="nav-link ${state.currentView === 'student_apply' ? 'active' : ''}" onclick="navigateTo('student_apply')">
          <span class="material-icons" style="font-size:1.1rem">edit_document</span> Apply Now
        </div>
        <div class="nav-link ${state.currentView === 'student_profile' ? 'active' : ''}" onclick="navigateTo('student_profile')">
          <span class="material-icons" style="font-size:1.1rem">person</span> Profile
        </div>
        <div class="nav-link ${state.currentView === 'student_documents' ? 'active' : ''}" onclick="navigateTo('student_documents')">
          <span class="material-icons" style="font-size:1.1rem">folder</span> Documents
        </div>
      `;
    } else if (state.user.role === 'officer') {
      menuHtml += `
        <div class="nav-link ${state.currentView === 'officer_dashboard' ? 'active' : ''}" onclick="navigateTo('officer_dashboard')">
          <span class="material-icons" style="font-size:1.1rem">verified_user</span> Scrutiny Queue
        </div>
        <div class="nav-link ${state.currentView === 'officer_reports' ? 'active' : ''}" onclick="navigateTo('officer_reports')">
          <span class="material-icons" style="font-size:1.1rem">analytics</span> Reports
        </div>
      `;
    } else if (state.user.role === 'admin') {
      menuHtml += `
        <div class="nav-link ${state.currentView === 'admin_dashboard' ? 'active' : ''}" onclick="navigateTo('admin_dashboard')">
          <span class="material-icons" style="font-size:1.1rem">admin_panel_settings</span> Executive Dashboard
        </div>
        <div class="nav-link ${state.currentView === 'admin_courses' ? 'active' : ''}" onclick="navigateTo('admin_courses')">
          <span class="material-icons" style="font-size:1.1rem">school</span> Courses & Seats
        </div>
        <div class="nav-link ${state.currentView === 'admin_students' ? 'active' : ''}" onclick="navigateTo('admin_students')">
          <span class="material-icons" style="font-size:1.1rem">people</span> Students
        </div>
        <div class="nav-link ${state.currentView === 'admin_officers' ? 'active' : ''}" onclick="navigateTo('admin_officers')">
          <span class="material-icons" style="font-size:1.1rem">badge</span> Officers
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
          <div class="badge badge-${state.user.role === 'admin' ? 'approved' : state.user.role === 'officer' ? 'submitted' : 'draft'}" style="font-size: 0.65rem;">${state.user.role}</div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="logout()" title="Sign Out">
          <span class="material-icons" style="font-size:1.1rem">logout</span>
        </button>
      </div>
    `;
  } else {
    authActions.innerHTML = `
      <button class="btn btn-outline btn-sm" onclick="navigateTo('login')">Sign In</button>
      <button class="btn btn-primary btn-sm" onclick="navigateTo('register')">Register</button>
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
    const res = await apiCall('/courses');
    const courses = res?.data?.courses || [];
    state.courses = courses;

    container.innerHTML = `
      <!-- Hero -->
      <section style="background: linear-gradient(135deg, #071f33 0%, #0b3b60 60%, #0284c7 100%); color: #fff; padding: 70px 20px 90px; text-align: center; position: relative;">
        <div style="max-width: 860px; margin: 0 auto;">
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(212, 175, 55, 0.2); border: 1px solid #d4af37; color: #fde047; font-size: 0.85rem; font-weight: 700; padding: 6px 16px; border-radius: 9999px; margin-bottom: 20px;">
            <span class="material-icons" style="font-size: 1rem;">verified</span> Official Admission Portal &bull; Session 2026-2027
          </div>
          <h1 style="font-size: 2.8rem; margin-bottom: 16px; color: #fff;">
            Institute of Engineering & Management <span style="color: #d4af37;">(IEM)</span>
          </h1>
          <p style="font-size: 1.1rem; color: #e2e8f0; line-height: 1.6; margin-bottom: 30px;">
            Kolkata's top NIRF-ranked private engineering and management institution. Submit your online application for B.Tech, BCA, MCA, BBA, and MBA programs.
          </p>
          <div style="display: flex; justify-content: center; gap: 14px; margin-bottom: 36px; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="navigateTo('${state.user ? (state.user.role === 'student' ? 'student_apply' : 'officer_dashboard') : 'register'}')" style="padding: 12px 24px; font-size: 1rem;">
              <span class="material-icons">app_registration</span> Apply Online Now
            </button>
            <a href="#courses-sec" class="btn btn-outline" style="border-color: #fff; color: #fff; padding: 12px 24px; font-size: 1rem;">
              <span class="material-icons">menu_book</span> Degree Offerings
            </a>
          </div>

          <!-- Quick Track Input Bar -->
          <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 12px; max-width: 540px; margin: 0 auto;">
            <div style="display: flex; background: var(--bg-card); border-radius: 6px; padding: 4px;">
              <input id="quick-track-input" type="text" placeholder="Enter Application No. (e.g. IEM-2026-881023)..." style="flex: 1; border: none; outline: none; padding: 10px 14px; background: transparent; color: var(--text-main); font-size: 0.95rem;" />
              <button class="btn btn-primary" onclick="quickTrack()">Track Status</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Programs Grid -->
      <section id="courses-sec" class="container" style="padding: 60px 20px;">
        <div style="text-align: center; max-width: 700px; margin: 0 auto 40px;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--iem-secondary); letter-spacing: 1px;">ACADEMIC PROGRAMS</span>
          <h2 style="font-size: 2rem; margin: 6px 0 10px;">Undergraduate & Postgraduate Degrees</h2>
          <p style="color: var(--text-muted);">Explore seat matrix, duration, and tuition fee details.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px;">
          ${courses.map(c => `
            <div class="card" style="display: flex; flex-direction: column;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span class="badge badge-submitted">${c.courseCode}</span>
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--iem-secondary);">${c.level}</span>
              </div>
              <h3 style="font-size: 1.2rem; margin-bottom: 4px; min-height: 44px;">${c.name}</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 14px;">${c.department}</p>
              
              <div style="background: var(--bg-subtle); padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 0.85rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Duration:</span> <strong>${c.duration}</strong></div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Available Seats:</span> <strong style="color:#10b981;">${c.availableSeats} / ${c.totalSeats}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Total Fee:</span> <strong>₹ ${c.feesStructure ? c.feesStructure.totalCourseFee.toLocaleString() : '7,35,000'}</strong></div>
              </div>

              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px; flex: 1;">
                <strong>Eligibility:</strong> ${c.eligibilityCriteria}
              </div>

              <button class="btn btn-primary btn-block" onclick="startApply('${c._id}')">
                Apply for ${c.courseCode}
              </button>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  // 2. LOGIN VIEW
  else if (state.currentView === 'login') {
    container.innerHTML = `
      <div style="min-height: calc(100vh - 180px); display: flex; align-items: center; justify-content: center; padding: 40px 20px;">
        <div class="card" style="width: 100%; max-width: 440px; padding: 36px; box-shadow: var(--shadow-lg);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div class="logo-badge" style="display: inline-block; margin-bottom: 10px;">IEM</div>
            <h2 style="font-size: 1.5rem; margin-bottom: 4px;">Portal Authentication</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Sign in to access your admission workspace</p>
          </div>

          <!-- One Click Demo Logins -->
          <div style="background: var(--bg-subtle); border: 1px dashed var(--border-color); padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">ONE-CLICK DEMO LOGIN</div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline btn-sm" style="flex:1" onclick="autoLogin('student.rahul@gmail.com', 'Student@123')">Student</button>
              <button class="btn btn-outline btn-sm" style="flex:1" onclick="autoLogin('officer.engg@iem.edu.in', 'Officer@123')">Officer</button>
              <button class="btn btn-outline btn-sm" style="flex:1" onclick="autoLogin('admin@iem.edu.in', 'Admin@123')">Admin</button>
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
            Don't have an account? <a onclick="navigateTo('register')" style="font-weight: 600;">Register as Student</a>
          </div>
        </div>
      </div>
    `;
  }

  // 3. REGISTER VIEW
  else if (state.currentView === 'register') {
    container.innerHTML = `
      <div style="min-height: calc(100vh - 180px); display: flex; align-items: center; justify-content: center; padding: 40px 20px;">
        <div class="card" style="width: 100%; max-width: 480px; padding: 36px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div class="logo-badge" style="display: inline-block; margin-bottom: 10px;">IEM</div>
            <h2 style="font-size: 1.5rem; margin-bottom: 4px;">Student Registration</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Create your account for IEM Kolkata Admissions 2026</p>
          </div>

          <div id="reg-error" style="display:none; padding: 10px; border-radius: 6px; background: rgba(239,68,68,0.1); color: var(--danger); font-size: 0.85rem; margin-bottom: 16px;"></div>

          <form onsubmit="handleRegister(event)">
            <div class="form-group">
              <label>Full Name</label>
              <input id="reg-name" type="text" placeholder="e.g. Sourav Mukherjee" required />
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input id="reg-email" type="email" placeholder="sourav@example.com" required />
            </div>
            <div class="form-group">
              <label>Mobile Number</label>
              <input id="reg-phone" type="tel" placeholder="+91 9876543210" required />
            </div>
            <div class="form-group">
              <label>Password (Min 6 characters)</label>
              <input id="reg-password" type="password" required />
            </div>
            <button type="submit" class="btn btn-primary btn-block" style="margin-top: 8px;">Create Account & Proceed</button>
          </form>

          <div style="text-align: center; margin-top: 20px; font-size: 0.85rem; color: var(--text-muted);">
            Already registered? <a onclick="navigateTo('login')" style="font-weight: 600;">Sign in</a>
          </div>
        </div>
      </div>
    `;
  }

  // 4. STUDENT DASHBOARD
  else if (state.currentView === 'student_dashboard') {
    const res = await apiCall('/student/dashboard-overview');
    const data = res?.data?.data || {};
    const apps = data.recentApplications || [];

    container.innerHTML = `
      <div class="container" style="padding: 40px 20px;">
        <!-- Welcome Banner -->
        <div class="card" style="background: linear-gradient(135deg, rgba(11, 59, 96, 0.95), rgba(2, 132, 199, 0.9)); color: #fff; padding: 30px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--iem-secondary); letter-spacing: 1px;">APPLICANT PORTAL</div>
            <h2 style="color: #fff; font-size: 1.8rem; margin: 4px 0;">Welcome, ${state.user?.name}!</h2>
            <p style="font-size: 0.85rem; color: #e2e8f0;">Student ID: <strong>${data.student?.studentId || 'IEM-STD-2026'}</strong> &bull; Academic Cycle: <strong>2026 - 2027</strong></p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" onclick="navigateTo('student_apply')"><span class="material-icons">add_circle</span> Apply for Course</button>
            <button class="btn btn-outline" style="border-color:#fff; color:#fff;" onclick="navigateTo('student_profile')"><span class="material-icons">edit</span> Profile</button>
          </div>
        </div>

        <!-- KPI Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div class="card" style="display:flex; align-items:center; gap:16px; padding:20px;">
            <div style="width:44px; height:44px; background:rgba(2,132,199,0.12); color:#0284c7; border-radius:6px; display:flex; align-items:center; justify-content:center;"><span class="material-icons">description</span></div>
            <div>
              <div style="font-size:1.4rem; font-weight:800;">${data.stats?.totalApplications || 0}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Total Applications</div>
            </div>
          </div>
          <div class="card" style="display:flex; align-items:center; gap:16px; padding:20px;">
            <div style="width:44px; height:44px; background:rgba(16,185,129,0.12); color:#10b981; border-radius:6px; display:flex; align-items:center; justify-content:center;"><span class="material-icons">verified</span></div>
            <div>
              <div style="font-size:1.4rem; font-weight:800;">${data.stats?.approvedApplications || 0}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Approved / Admitted</div>
            </div>
          </div>
          <div class="card" style="display:flex; align-items:center; gap:16px; padding:20px;">
            <div style="width:44px; height:44px; background:rgba(245,158,11,0.12); color:#f59e0b; border-radius:6px; display:flex; align-items:center; justify-content:center;"><span class="material-icons">hourglass_top</span></div>
            <div>
              <div style="font-size:1.4rem; font-weight:800;">${data.stats?.underReviewApplications || 0}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Under Scrutiny</div>
            </div>
          </div>
          <div class="card" style="display:flex; align-items:center; gap:16px; padding:20px;">
            <div style="width:44px; height:44px; background:rgba(139,92,246,0.12); color:#8b5cf6; border-radius:6px; display:flex; align-items:center; justify-content:center;"><span class="material-icons">folder</span></div>
            <div>
              <div style="font-size:1.4rem; font-weight:800;">${data.stats?.verifiedDocumentsCount || 0} / ${data.stats?.totalDocumentsUploaded || 0}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Verified Docs</div>
            </div>
          </div>
        </div>

        <!-- Applications List -->
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
                  <span>Submitted On:</span>
                  <strong>${a.submissionDate ? new Date(a.submissionDate).toLocaleDateString() : 'Draft'}</strong>
                </div>
              </div>

              ${a.officerRemarks ? `
                <div style="background: rgba(245,158,11,0.1); border-left: 3px solid #f59e0b; padding: 8px; border-radius: 0 4px 4px 0; font-size: 0.8rem; margin-bottom: 14px;">
                  <strong>Officer Remark:</strong> ${a.officerRemarks}
                </div>
              ` : ''}

              <div style="margin-top: auto; display: flex; gap: 8px;">
                <a href="/api/applications/${a._id}/download-pdf" target="_blank" class="btn btn-secondary btn-sm" style="flex:1;">
                  <span class="material-icons" style="font-size:1rem;">download</span> Download Form
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 5. APPLICATION WIZARD
  else if (state.currentView === 'student_apply') {
    const res = await apiCall('/courses');
    const courses = res?.data?.courses || [];
    state.courses = courses;

    container.innerHTML = `
      <div class="container" style="padding: 40px 20px; max-width: 860px;">
        <div class="card" style="padding: 32px;">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 24px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--iem-secondary); letter-spacing: 1px;">ONLINE ADMISSION FORM</div>
            <h2 style="font-size: 1.6rem; margin-top: 4px;">Application Wizard 2026-2027</h2>
          </div>

          <form id="wizard-form" onsubmit="submitApplyWizard(event)">
            <div class="form-group">
              <label>1. Select Degree Program *</label>
              <select id="wiz-course" required style="font-size: 1rem; padding: 12px;">
                <option value="">-- Choose Degree Program --</option>
                ${courses.map(c => `<option value="${c._id}">${c.courseCode} - ${c.name} (${c.department})</option>`).join('')}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label>Class 10 Board Percentage (%) *</label>
                <input id="wiz-c10" type="number" step="0.01" value="88.5" required />
              </div>
              <div class="form-group">
                <label>Class 12 PCM Percentage (%) *</label>
                <input id="wiz-c12" type="number" step="0.01" value="91.0" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label>Entrance Exam Rank / Score *</label>
                <input id="wiz-rank" type="text" value="WBJEE Rank 2150" required />
              </div>
              <div class="form-group">
                <label>Application Fee Payment</label>
                <div style="padding: 10px; background: var(--bg-subtle); border-radius: 6px; font-weight: 700; color: var(--iem-primary);">
                  ₹ 2,000 (Mock Gateway Integration)
                </div>
              </div>
            </div>

            <div style="border: 1px solid var(--border-color); padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 0.85rem;">
              <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
                <input type="checkbox" required checked style="margin-top: 3px;" />
                <span>I certify that all information submitted is complete and genuine. I understand that admission is subject to official document scrutiny.</span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary btn-block" style="padding: 14px; font-size: 1rem;">
              Submit Application & Generate Official Slip &rarr;
            </button>
          </form>
        </div>
      </div>
    `;
  }

  // 6. OFFICER DASHBOARD
  else if (state.currentView === 'officer_dashboard') {
    const res = await apiCall('/officer/applications');
    const apps = res?.data?.applications || [];

    container.innerHTML = `
      <div class="container" style="padding: 40px 20px;">
        <div class="card" style="display: flex; justify-content: space-between; align-items: center; padding: 24px; margin-bottom: 24px;">
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--iem-secondary); letter-spacing: 1px;">ADMISSION COMMITTEE</div>
            <h2 style="font-size: 1.6rem; margin: 4px 0;">Applicant Scrutiny Queue</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Verify uploaded certificates, academic cutoffs, and record scrutiny decisions.</p>
          </div>
          <div style="background: var(--bg-subtle); padding: 10px 18px; border-radius: 6px; text-align: center;">
            <span style="font-size: 1.6rem; font-weight: 800; color: var(--iem-primary);">${apps.length}</span>
            <div style="font-size: 0.75rem; color: var(--text-muted);">In Queue</div>
          </div>
        </div>

        <div class="card" style="padding: 0; overflow: hidden;">
          <table class="data-table">
            <thead>
              <tr>
                <th>App Number</th>
                <th>Candidate Name</th>
                <th>Course Applied</th>
                <th>Merit / PCM %</th>
                <th>Fee Paid</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${apps.map(a => `
                <tr>
                  <td><strong>${a.applicationNumber}</strong></td>
                  <td>${a.user?.name || 'Applicant'}<br><span style="font-size:0.75rem; color:var(--text-muted);">${a.user?.email || ''}</span></td>
                  <td><span class="badge badge-submitted">${a.course?.courseCode || 'N/A'}</span></td>
                  <td><strong>${a.meritScore || 88}%</strong></td>
                  <td><span class="badge ${a.isFeePaid ? 'badge-approved' : 'badge-rejected'}">${a.isFeePaid ? 'Paid' : 'Pending'}</span></td>
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

  // 7. ADMIN DASHBOARD
  else if (state.currentView === 'admin_dashboard') {
    const res = await apiCall('/admin/dashboard-stats');
    const stats = res?.data?.stats || {};
    const courses = res?.data?.courseStats || [];
    const logs = res?.data?.recentActivity || [];

    container.innerHTML = `
      <div class="container" style="padding: 40px 20px;">
        <div class="card" style="padding: 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--iem-secondary); letter-spacing: 1px;">EXECUTIVE ADMISSION MANAGEMENT</div>
            <h2 style="font-size: 1.6rem; margin: 4px 0;">Admissions Analytics & Metrics</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Session 2026-2027 Key Performance Indicators</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary btn-sm" onclick="navigateTo('admin_courses')">+ Manage Courses</button>
            <button class="btn btn-outline btn-sm" onclick="navigateTo('admin_officers')">+ Staff Access</button>
          </div>
        </div>

        <!-- 6 KPI Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div class="card"><div style="font-size:1.6rem; font-weight:800; color:var(--iem-primary);">${stats.totalApplications || 3}</div><div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Total Applications</div></div>
          <div class="card"><div style="font-size:1.6rem; font-weight:800; color:#10b981;">${stats.approvedApplications || 1}</div><div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Approved Admissions</div></div>
          <div class="card"><div style="font-size:1.6rem; font-weight:800; color:#f59e0b;">${stats.pendingApplications || 2}</div><div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Under Scrutiny</div></div>
          <div class="card"><div style="font-size:1.6rem; font-weight:800; color:#ef4444;">${stats.rejectedApplications || 0}</div><div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Rejected</div></div>
          <div class="card"><div style="font-size:1.6rem; font-weight:800; color:#8b5cf6;">₹ ${(stats.totalRevenue || 6000).toLocaleString()}</div><div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Revenue Collected</div></div>
          <div class="card"><div style="font-size:1.6rem; font-weight:800; color:#d4af37;">${stats.totalStudents || 3} / ${stats.totalOfficers || 2}</div><div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Students / Officers</div></div>
        </div>

        <!-- Seat Distribution -->
        <div class="card" style="margin-bottom: 30px; padding: 24px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 16px;">Program Seat Allocation & Capacity</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
            ${courses.map(c => `
              <div style="background: var(--bg-subtle); padding: 14px; border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 4px;">
                  <span>${c.courseCode}</span>
                  <span style="color:#10b981;">${c.totalSeats - c.availableSeats} / ${c.totalSeats} filled</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">${c.courseName}</div>
                <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                  <div style="width: ${((c.totalSeats - c.availableSeats) / c.totalSeats) * 100}%; height: 100%; background: #10b981;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Audit Logs Feed -->
        <div class="card" style="padding: 24px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 16px;">Recent System Audit Trail</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${logs.slice(0, 5).map(l => `
              <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-subtle); padding: 10px 14px; border-radius: 6px; font-size: 0.85rem;">
                <div>
                  <strong>${l.userEmail}</strong> performed <code style="background:rgba(0,0,0,0.06); padding:2px 4px; border-radius:3px;">${l.action}</code> in <strong>${l.module}</strong>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(l.createdAt).toLocaleTimeString()}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 8. TRACK APPLICATION
  else if (state.currentView === 'track') {
    const appNo = params.appNo || '';
    let appData = null;
    let err = null;

    if (appNo) {
      const res = await apiCall(`/applications/track/${appNo}`);
      if (res?.ok) appData = res.data?.application;
      else err = res?.data?.message || 'Application not found.';
    }

    container.innerHTML = `
      <div class="container" style="padding: 60px 20px; max-width: 760px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--iem-secondary); letter-spacing: 1px;">ONLINE SCRUTINY TRACKER</div>
          <h2 style="font-size: 2rem; margin: 4px 0 8px;">Track Admission Application</h2>
          <p style="color: var(--text-muted);">Enter your official application reference number below</p>
        </div>

        <div class="card" style="padding: 12px; margin-bottom: 24px;">
          <div style="display: flex; gap: 8px;">
            <input id="track-search-box" type="text" value="${appNo}" placeholder="e.g. IEM-2026-881023" style="flex: 1; border: 1px solid var(--border-color); padding: 10px 14px; border-radius: 6px; font-size: 1rem; outline: none;" />
            <button class="btn btn-primary" onclick="executeTrack()">Search Status</button>
          </div>
        </div>

        ${err ? `
          <div style="background: rgba(239,68,68,0.1); color: var(--danger); border: 1px solid rgba(239,68,68,0.3); padding: 16px; border-radius: 8px; text-align: center;">
            ${err}
          </div>
        ` : ''}

        ${appData ? `
          <div class="card" style="padding: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
              <div>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">APPLICATION NUMBER</span>
                <h3 style="font-size: 1.5rem; color: var(--iem-primary);">${appData.applicationNumber}</h3>
              </div>
              <span class="badge badge-${appData.status.toLowerCase()}">${appData.status}</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.9rem; margin-bottom: 20px;">
              <div><span style="color:var(--text-muted)">Program:</span> <strong>${appData.course?.name || 'Degree'}</strong></div>
              <div><span style="color:var(--text-muted)">Department:</span> <strong>${appData.course?.department || 'IEM'}</strong></div>
              <div><span style="color:var(--text-muted)">Submitted:</span> <strong>${appData.submissionDate ? new Date(appData.submissionDate).toLocaleDateString() : 'Draft'}</strong></div>
              <div><span style="color:var(--text-muted)">Decision Date:</span> <strong>${appData.decisionDate ? new Date(appData.decisionDate).toLocaleDateString() : 'Under Scrutiny'}</strong></div>
            </div>

            ${appData.officerRemarks ? `
              <div style="background: rgba(11,59,96,0.06); border-left: 4px solid var(--iem-primary); padding: 14px; border-radius: 0 6px 6px 0; margin-bottom: 20px;">
                <strong>Admission Officer Remark:</strong>
                <p style="margin-top: 4px;">${appData.officerRemarks}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }
}

// Handlers
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = await apiCall('/auth/login', 'POST', { email, password });
  if (res.ok) {
    localStorage.setItem('iem_token', res.data.token);
    localStorage.setItem('iem_user', JSON.stringify(res.data.user));
    state.token = res.data.token;
    state.user = res.data.user;

    if (state.user.role === 'admin') navigateTo('admin_dashboard');
    else if (state.user.role === 'officer') navigateTo('officer_dashboard');
    else navigateTo('student_dashboard');
  } else {
    const errBox = document.getElementById('login-error');
    errBox.style.display = 'block';
    errBox.innerText = res.data.message || 'Invalid credentials.';
  }
}

function autoLogin(email, password) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = password;
  handleLogin({ preventDefault: () => {} });
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const phone = document.getElementById('reg-phone').value;
  const password = document.getElementById('reg-password').value;

  const res = await apiCall('/auth/register', 'POST', { name, email, phone, password, role: 'student' });
  if (res.ok) {
    localStorage.setItem('iem_token', res.data.token);
    localStorage.setItem('iem_user', JSON.stringify(res.data.user));
    state.token = res.data.token;
    state.user = res.data.user;
    navigateTo('student_dashboard');
  } else {
    const errBox = document.getElementById('reg-error');
    errBox.style.display = 'block';
    errBox.innerText = res.data.message || 'Registration failed.';
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

  // 1. Draft
  const draftRes = await apiCall('/applications/draft', 'POST', { courseId, currentStep: 5 });
  if (!draftRes.ok) {
    alert(draftRes.data.message || 'Error creating application.');
    return;
  }

  const appId = draftRes.data.application._id;

  // 2. Submit
  const submitRes = await apiCall(`/applications/${appId}/submit`, 'POST');

  // 3. Mock Pay
  const payInit = await apiCall('/payments/initialize', 'POST', { applicationId: appId, paymentMethod: 'UPI' });
  if (payInit.ok) {
    await apiCall('/payments/confirm', 'POST', { transactionId: payInit.data.order.transactionId, simulateStatus: 'SUCCESS' });
  }

  alert('Congratulations! Your application has been registered & mock application fee payment confirmed.');
  navigateTo('student_dashboard');
}

async function officerAction(appId, status) {
  const remarks = prompt(`Enter officer scrutiny remarks for ${status}:`, status === 'APPROVED' ? 'Academic records & PCM verified.' : 'Cutoff not met.');
  if (remarks === null) return;

  const res = await apiCall(`/officer/applications/${appId}/status`, 'PUT', { status, remarks });
  if (res.ok) {
    alert(`Application updated to ${status}.`);
    navigateTo('officer_dashboard');
  } else {
    alert(res.data.message || 'Failed to update.');
  }
}

function quickTrack() {
  const val = document.getElementById('quick-track-input').value;
  if (val) {
    navigateTo('track', { appNo: val.trim().toUpperCase() });
  }
}

function executeTrack() {
  const val = document.getElementById('track-search-box').value;
  if (val) {
    navigateTo('track', { appNo: val.trim().toUpperCase() });
  }
}

// Initial Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  renderView();
});
