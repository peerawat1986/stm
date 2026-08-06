// State Management
  const state = {
    user: null, // Teacher info
    currentView: 'home',
    selectedStudents: [], // For bulk registration
    searchDataArray: [], // Store array of search results
    recentRegistrations: [], // Store recent registrations
    publicResults: [],
    competitions: [],
    studentPdfEnabled: false
  };

  // Views HTML Templates
  const views = {
    home: `
      <!-- Space Animation Background -->
      <div class="space-container">
        <div class="space-stars"></div>
        <div class="space-stars2"></div>
        <div class="comet comet1"></div>
        <div class="comet comet2"></div>
        <div class="comet comet3"></div>
        <div class="space-planet"></div>
      </div>
      
      <div class="card dark-glass mb-4">
        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; display: grid;">
          <div style="background: rgba(var(--primary-rgb), 0.1); padding: 1.5rem; border-radius: var(--radius); text-align: center; border: 1px solid var(--primary);">
            <h3 id="dash-total-students" style="font-size: 2.5rem; color: var(--primary); margin: 0;">0</h3>
            <p class="text-muted m-0">นักเรียนที่เข้าร่วม (คน)</p>
          </div>
          <div style="background: rgba(var(--primary-rgb), 0.1); padding: 1.5rem; border-radius: var(--radius); text-align: center; border: 1px solid var(--primary);">
            <h3 id="dash-total-comps" style="font-size: 2.5rem; color: var(--primary); margin: 0;">0</h3>
            <p class="text-muted m-0">รายการแข่งขัน</p>
          </div>
        </div>

        <div id="award-summary-container" style="display: none; margin-bottom: 2rem;">
          <h4 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #94a3b8;"><i class="ph ph-medal"></i> สรุปผลรางวัล</h4>
          <div id="award-summary-grid" class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; display: grid;">
          </div>
        </div>

        <div class="flex justify-between items-center mb-4" style="flex-wrap: wrap; gap: 1rem;">
          <h2 style="margin: 0; color: #fbbf24;"><i class="ph ph-trophy"></i> ข้อมูลลงทะเบียนและผลการแข่งขัน</h2>
          <button class="btn btn-outline" onclick="loadPublicResults()">
            <i class="ph ph-arrows-clockwise"></i> รีเฟรช
          </button>
        </div>
        <p class="text-muted">ค้นหารายชื่อและตรวจสอบผลการแข่งขัน รวมถึงดาวน์โหลดเกียรติบัตรของคุณ</p>
        
        <div class="form-group mb-4 flex gap-2" style="margin-top: 1.5rem; flex-wrap: wrap;">
          <input type="text" id="public-search-input" class="form-control" style="flex: 1; min-width: 250px;" placeholder="ค้นหาด้วย ชื่อ นามสกุล รหัสนักเรียน หรือ ห้อง..." onkeyup="filterPublicResults()">
          <select id="public-comp-filter" class="form-control" style="flex: 1; min-width: 250px; color: var(--primary) !important;" onchange="filterPublicResults()">
            <option value="">-- ทุกรายการแข่งขัน --</option>
          </select>
        </div>
        
        <div class="table-responsive mt-4">
          <table id="results-table">
            <thead>
              <tr>
                <th>รายการแข่งขัน</th>
                <th>รหัสนักเรียน</th>
                <th>ชื่อ นามสกุล</th>
                <th>ผลการแข่งขัน</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="4" class="text-center">กำลังโหลดข้อมูล...</td></tr>
            </tbody>
          </table>
        </div>
        
        <!-- Student Details Modal for PDF -->
        <div id="student-pdf-modal" class="modal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; min-height: 100vh; background: rgba(0,0,0,0.7); z-index: 9999; align-items: flex-start; justify-content: center; backdrop-filter: blur(5px); overflow-y: auto;">
          <div id="student-pdf-card" class="card dark-glass" style="max-width: 500px; width: 90%; position: relative; margin-bottom: 2rem; transition: margin-top 0.2s ease-out;">
            <button onclick="document.getElementById('student-pdf-modal').style.display='none'" style="position: absolute; right: 1rem; top: 1rem; background: transparent; border: none; color: #fff; cursor: pointer; font-size: 1.5rem;"><i class="ph ph-x"></i></button>
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <i class="ph ph-user-circle" style="font-size: 4rem; color: var(--primary);"></i>
              <h3 id="modal-student-name" style="margin: 0.5rem 0 0 0; color: #fff;">ชื่อ นามสกุล</h3>
              <p id="modal-student-id-room" class="text-muted m-0">รหัสนักเรียน</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: var(--radius); margin-bottom: 1.5rem;">
              <div style="margin-bottom: 0.75rem;">
                <div class="text-muted" style="margin-bottom: 0.25rem;">รายการแข่งขัน:</div>
                <div id="modal-student-comp" style="font-weight: bold; color: var(--primary);"></div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span class="text-muted">ผลการแข่งขัน:</span>
                <span id="modal-student-award" style="font-weight: bold;"></span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span class="text-muted">เลขที่เกียรติบัตร:</span>
                <span id="modal-student-cert-no" style="font-weight: bold;">-</span>
              </div>
            </div>
            
            <div id="modal-pdf-action-container" style="text-align: center;">
              <!-- PDF Button will be injected here -->
            </div>
          </div>
        </div>
        
      </div>
    `,

    login: `
      <div class="login-container">
        <div class="card glass">
          <div class="login-header">
            <i class="ph ph-user-circle login-icon"></i>
            <h2>ระบบสำหรับครู</h2>
            <p class="text-muted">เข้าสู่ระบบเพื่อจัดการข้อมูล</p>
          </div>
          
          <form id="login-form" onsubmit="handleLogin(event)">
            <div class="form-group">
              <label class="form-label">ชื่อ - นามสกุล (Username)</label>
              <input list="teacher-names-list" class="form-control" id="login-username" required placeholder="พิมพ์เพื่อค้นหา หรือเลือกชื่อครู...">
              <datalist id="teacher-names-list">
              </datalist>
            </div>
            
            <div class="form-group">
              <label class="form-label">รหัสผ่าน (Password)</label>
              <input type="password" class="form-control" id="login-password" required placeholder="กรอกรหัสผ่าน">
            </div>
            
            <button type="submit" class="btn btn-primary w-full" id="btn-login">
              <i class="ph ph-sign-in"></i> เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    `,

    dashboard: `
      <div class="dashboard-grid">
        <!-- Sidebar -->
        <div class="card glass">
          <div class="mb-4">
            <p class="text-muted" style="font-size: 0.875rem;">เข้าสู่ระบบโดย:</p>
            <h3 id="teacher-name-display" style="font-size: 1.1rem; color: var(--primary); white-space: nowrap;"></h3>
          </div>
          <hr style="border: 0; border-top: 1px solid var(--border); margin-bottom: 1rem;">
          
          <div class="sidebar-menu">
            <button class="active" onclick="switchDashboardTab('register', this)">
              <i class="ph ph-user-plus"></i> ลงทะเบียนแข่งขัน
            </button>
            <button onclick="switchDashboardTab('committee', this)">
              <i class="ph ph-users-three"></i> ลงชื่อคณะทำงาน
            </button>
            <button onclick="switchDashboardTab('result', this)" style="white-space: nowrap;">
              <i class="ph ph-medal"></i> บันทึกผลการแข่งขัน
            </button>
            <div id="admin-panel" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
              <p class="text-muted" style="font-size: 0.875rem; margin-bottom: 0.5rem;"><i class="ph ph-shield-check"></i> เมนูผู้ดูแลระบบ</p>
              <label class="flex items-center gap-2 cursor-pointer" style="font-size: 0.875rem;">
                <div class="switch">
                  <input type="checkbox" id="admin-pdf-toggle" onchange="toggleAdminPdfSetting(this)">
                  <span class="slider"></span>
                </div>
                เปิดให้นักเรียนสร้างเกียรติบัตรเอง
              </label>
            </div>
            <button onclick="handleLogout()" style="color: var(--danger); margin-top: 1rem;">
              <i class="ph ph-sign-out"></i> ออกจากระบบ
            </button>
          </div>
        </div>
        
        <!-- Main Panel -->
        <div class="card glass" id="dashboard-panel">
          <!-- Register Tab (Default) -->
          <div id="tab-register">
            <h2>ลงทะเบียนแข่งขัน</h2>
            <p class="text-muted">ค้นหานักเรียนและเลือกรายการแข่งขัน</p>
            
            <div class="flex gap-2 mb-4" style="margin-top: 1.5rem;">
              <input type="text" class="form-control" id="search-student-code" placeholder="กรอกรหัสนักเรียน...พิมพ์ชื่อ หรือ ห้อง...">
              <button class="btn btn-primary" onclick="searchStudent('register')" style="white-space: nowrap;">
                <i class="ph ph-magnifying-glass"></i> ค้นหา
              </button>
            </div>
            
            <div id="student-search-result"></div>
            
            <div id="registration-form" style="display: none;">
            <div class="form-group">
              <label class="form-label">รายการแข่งขัน</label>
              <select class="form-control" id="reg-competition">
                <option value="" disabled selected>กำลังโหลดรายการ...</option>
              </select>
            </div>
            <button class="btn btn-success w-full" id="submit-reg-btn" onclick="submitRegistration('register')" style="justify-content: flex-start;">
              <i class="ph ph-check-circle"></i> บันทึกลงทะเบียน
            </button>
          </div>
          

          </div>
        
          <!-- Committee Tab -->
          <div id="tab-committee" style="display: none; margin-bottom: 2rem;">
            <h2>ลงชื่อคณะทำงาน</h2>
            <p class="text-muted">ค้นหานักเรียนและเลือกรายการที่จะเป็นคณะทำงาน</p>
            
            <div class="flex gap-2 mb-4" style="margin-top: 1.5rem;">
              <input type="text" class="form-control" id="search-student-code-committee" placeholder="กรอกรหัสนักเรียน...พิมพ์ชื่อ หรือ ห้อง...">
              <button class="btn btn-primary" onclick="searchStudent('committee')" style="white-space: nowrap;">
                <i class="ph ph-magnifying-glass"></i> ค้นหา
              </button>
            </div>
            
            <div id="student-search-result-committee"></div>
            
            <div id="registration-form-committee" style="display: none;">
            <div class="form-group">
              <label class="form-label">รายการ</label>
              <select class="form-control" id="reg-competition-committee">
                <option value="" disabled selected>กำลังโหลดรายการ...</option>
              </select>
            </div>
            <button class="btn btn-success w-full" id="submit-reg-btn-committee" onclick="submitRegistration('committee')" style="justify-content: flex-start;">
              <i class="ph ph-check-circle"></i> บันทึกคณะทำงาน
            </button>
          </div>
          </div>

          <!-- Add Recent Registrations -->
          <div id="recent-registrations-wrapper">
            <div id="recent-registrations" style="margin-top: 2rem; display: none;">
              <div class="flex justify-between items-center mb-2">
                <h3 style="margin: 0;"><i class="ph ph-clock-counter-clockwise"></i> ประวัติการลงทะเบียน</h3>
                <button id="btn-delete-selected-recent" class="btn btn-outline btn-sm" onclick="deleteSelectedRecent()" style="color: var(--danger); border-color: var(--danger); display: none;">
                  <i class="ph ph-trash"></i> ลบรายการที่เลือก
                </button>
              </div>
              <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                <table id="recent-reg-table">
                  <thead>
                    <tr>
                      <th>รหัสนักเรียน</th>
                      <th>ชื่อ นามสกุล</th>
                      <th>ห้อง</th>
                      <th>รายการแข่งขัน</th>
                      <th>จัดการ</th>
                      <th style="width: 40px; text-align: center;"><input type="checkbox" onchange="toggleSelectAllRecent(this)" style="width: 1.25rem; height: 1.25rem;"></th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>
          </div>
        

          
          <!-- Result Tab (Auto-loaded) -->
          <div id="tab-result" style="display: none;">
            <h2>บันทึกผลการแข่งขัน</h2>
            <p class="text-muted">รายการแข่งขันที่คุณรับผิดชอบ</p>
            
            <div id="my-competitions-container" style="margin-top: 1.5rem;">
              <div class="text-center"><i class="ph ph-spinner ph-spin" style="font-size: 2rem; color: var(--primary);"></i><p>กำลังโหลดข้อมูล...</p></div>
            </div>
          </div>
        </div>
      </div>
    `
  };

  // App Controller
  const app = {
    init: function () {
      // Check if logged in via localStorage (simple simulation for this SPA)
      const savedUser = localStorage.getItem('scienceDayTeacher');
      if (savedUser) {
        state.user = JSON.parse(savedUser);
      }

      loadStudentPdfStatus();
      this.navigate(state.user ? 'dashboard' : 'home');
    },

    navigate: function (viewName) {
      if (viewName === 'login' && state.user) {
        viewName = 'dashboard';
      }
      if (viewName === 'dashboard' && !state.user) {
        viewName = 'login';
      }

      state.currentView = viewName;

      // Update Navbar
      document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
      if (viewName === 'home') document.getElementById('nav-home').classList.add('active');
      if (viewName === 'login' || viewName === 'dashboard') document.getElementById('nav-login').classList.add('active');

      // Inject View
      const root = document.getElementById('app-root');
      root.innerHTML = views[viewName] || '<h2>View not found</h2>';

      // Post-render actions
      if (viewName === 'home') {
        document.body.classList.add('is-home-view');
        loadPublicResults();
      } else if (viewName === 'dashboard') {
        document.body.classList.remove('is-home-view');
        document.getElementById('teacher-name-display').textContent = state.user.name;
        loadCompetitions();
        loadTeacherRegistrations();

        // Show Admin panel if matched
        if (state.user && state.user.name.replace(/\s+/g, '') === 'นายพีระวัฒน์ศรีธรรมมา') {
          const adminPanel = document.getElementById('admin-panel');
          if (adminPanel) adminPanel.style.display = 'block';
          const toggle = document.getElementById('admin-pdf-toggle');
          if (toggle) toggle.checked = state.studentPdfEnabled;
        }
      } else if (viewName === 'login') {
        document.body.classList.remove('is-home-view');
        loadTeacherList();
      }
    }
  };

  // UI Utilities
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? '<i class="ph ph-check-circle" style="font-size: 1.5rem; color: var(--success);"></i>' : '<i class="ph ph-warning-circle" style="font-size: 1.5rem; color: var(--danger);"></i>';

    toast.innerHTML = `
      ${icon}
      <div>${message}</div>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Logic: Public Results
  function loadPublicResults() {
    const tbody = document.querySelector('#results-table tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">กำลังโหลดข้อมูล... <div class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 10px auto;"></div></td></tr>';

    // Check if google.script.run is available (running in GAS environment)
    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(function (res) {
          if (res.success && res.data.length > 0) {
            state.publicResults = res.data;
            updateDashboardStats(res.data);
            renderResultsTable(res.data);
          } else {
            state.publicResults = [];
            updateDashboardStats([]);
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">ยังไม่มีข้อมูลการลงทะเบียน</td></tr>';
          }
        })
        .withFailureHandler(function (err) {
          tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
          showToast('ไม่สามารถโหลดข้อมูลได้', 'error');
        })
        .getPublicResults();
    } else {
      // Mock Data for local testing
      setTimeout(() => {
        state.publicResults = [];
        updateDashboardStats([]);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">ไม่ได้รันบน Google Apps Script (Simulation Mode)</td></tr>';
      }, 1000);
    }
  }

  function getStandardAwardKey(raw) {
    let rawAward = String(raw || 'เข้าร่วม').trim();
    if (rawAward === '') return 'เข้าร่วม';
    if (rawAward.includes('ชนะเลิศ') && !rawAward.includes('รอง')) return 'ชนะเลิศ';
    if (rawAward.includes('รองชนะเลิศอันดับ 1') || rawAward.includes('รองชนะเลิศอันดับที่ 1')) return 'รองชนะเลิศอันดับ 1';
    if (rawAward.includes('รองชนะเลิศอันดับ 2') || rawAward.includes('รองชนะเลิศอันดับที่ 2')) return 'รองชนะเลิศอันดับ 2';
    if (rawAward.includes('รองชนะเลิศอันดับ 3') || rawAward.includes('รองชนะเลิศอันดับที่ 3')) return 'รองชนะเลิศอันดับ 3';
    if (rawAward.includes('ชมเชย')) return 'ชมเชย';
    if (rawAward.includes('เข้าร่วม')) return 'เข้าร่วม';
    return 'อื่นๆ';
  }

  function updateDashboardStats(data) {
    const students = new Set();
    const comps = new Set();
    const awards = {};

    data.forEach(row => {
      const compName = String(row['รายการแข่งขัน'] || '');
      const awardName = String(row['ผลรางวัล'] || '');
      if (row['รหัสนักเรียน'] && !compName.includes('คณะดำเนินงาน') && !awardName.includes('คณะดำเนินงาน')) {
        students.add(row['รหัสนักเรียน'].toString());
      }
      if (row['รายการแข่งขัน']) comps.add(compName);

      let awardKey = getStandardAwardKey(row['ผลรางวัล']);
      awards[awardKey] = (awards[awardKey] || 0) + 1;
    });

    const dashStudents = document.getElementById('dash-total-students');
    const dashComps = document.getElementById('dash-total-comps');
    if (dashStudents) dashStudents.textContent = students.size;
    if (dashComps) dashComps.textContent = comps.size;

    // Populate competition dropdown
    const compFilter = document.getElementById('public-comp-filter');
    if (compFilter) {
      const currentVal = compFilter.value;
      let compOptions = '<option value="">-- ทุกรายการแข่งขัน --</option>';
      const sortedComps = Array.from(comps).sort();
      sortedComps.forEach(c => {
        compOptions += `<option value="${c}">${c}</option>`;
      });
      compFilter.innerHTML = compOptions;
      if (sortedComps.includes(currentVal)) {
        compFilter.value = currentVal;
      }
    }

    renderAwardSummary(awards);
  }

  function renderAwardSummary(awards) {
    const container = document.getElementById('award-summary-container');
    const grid = document.getElementById('award-summary-grid');
    if (!container || !grid) return;

    const awardKeys = Object.keys(awards);
    if (awardKeys.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';

    const sortedKeys = awardKeys.sort((a, b) => {
      const getRank = (name) => {
        if (name === 'ชนะเลิศ') return 1;
        if (name === 'รองชนะเลิศอันดับ 1') return 2;
        if (name === 'รองชนะเลิศอันดับ 2') return 3;
        if (name === 'รองชนะเลิศอันดับ 3') return 4;
        if (name === 'ชมเชย') return 5;
        if (name === 'เข้าร่วม') return 99;
        return 10;
      };
      return getRank(a) - getRank(b) || a.localeCompare(b);
    });

    const targetAwards = ['ชนะเลิศ', 'รองชนะเลิศอันดับ 1', 'รองชนะเลิศอันดับ 2', 'รองชนะเลิศอันดับ 3'];
    let html = '';

    targetAwards.forEach(key => {
      let count = awards[key] || 0;
      let color = '#fff';
      let bgColor = 'rgba(255,255,255, 0.05)';
      let textColor = '#fff';

      if (key === 'ชนะเลิศ') {
        color = '#fbbf24';
        bgColor = '#fbbf24';
        textColor = '#000'; // Make text black for readability on yellow
      }
      else if (key === 'รองชนะเลิศอันดับ 1') color = '#cbd5e1'; // Silver
      else if (key === 'รองชนะเลิศอันดับ 2') color = '#b45309'; // Bronze
      else if (key === 'รองชนะเลิศอันดับ 3') color = '#d97706'; // Amber/Copper

      html += `
        <div class="award-filter-btn" data-bg="${bgColor}" onclick="filterByAward('${key}', this)" style="background: ${bgColor} !important; padding: 1.25rem 1rem; border-radius: var(--radius); text-align: center; border: 1px solid ${color} !important; transition: all 0.2s; cursor: pointer;">
          <h3 style="font-size: 2rem; color: ${key === 'ชนะเลิศ' ? '#000' : color} !important; margin: 0;">${count}</h3>
          <p class="m-0" style="font-size: 0.9rem; margin-top: 0.5rem; color: ${key === 'ชนะเลิศ' ? '#000' : 'var(--text-muted)'} !important;">${key}</p>
        </div>
      `;
    });

    grid.innerHTML = html;
  }

  window.filterByAward = function (award, btnElement) {
    // If clicking the same active button, deselect it to show all
    if (state.currentAwardFilter === award) {
      state.currentAwardFilter = null;
      document.querySelectorAll('.award-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.setProperty('background', btn.getAttribute('data-bg') || 'rgba(255,255,255, 0.05)', 'important');
        btn.style.transform = 'scale(1)';
      });
      filterPublicResults();
      return;
    }

    state.currentAwardFilter = award;

    if (btnElement) {
      document.querySelectorAll('.award-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.setProperty('background', btn.getAttribute('data-bg') || 'rgba(255,255,255, 0.05)', 'important');
        btn.style.transform = 'scale(1)';
      });
      btnElement.classList.add('active');
      btnElement.style.setProperty('background', btnElement.getAttribute('data-bg') || 'rgba(255,255,255,0.15)', 'important');
      btnElement.style.transform = 'scale(1.05)';
    }

    filterPublicResults();
  };

  function filterPublicResults() {
    const input = document.getElementById('public-search-input');
    const query = input ? input.value.toLowerCase() : '';

    const compFilterSelect = document.getElementById('public-comp-filter');
    const compFilterVal = compFilterSelect ? compFilterSelect.value : '';

    let filtered = state.publicResults;

    if (compFilterVal) {
      filtered = filtered.filter(row => {
        const comp = (row['รายการแข่งขัน'] || '').toString();
        return comp === compFilterVal;
      });
    }

    if (state.currentAwardFilter) {
      filtered = filtered.filter(row => {
        let awardKey = getStandardAwardKey(row['ผลรางวัล']);
        return awardKey === state.currentAwardFilter;
      });
    }

    if (query) {
      filtered = filtered.filter(row => {
        const id = (row['รหัสนักเรียน'] || '').toString().toLowerCase();
        const name = (row['ชื่อ นามสกุล'] || '').toString().toLowerCase();
        const room = (row['ห้อง'] || '').toString().toLowerCase();
        return id.includes(query) || name.includes(query) || room.includes(query);
      });
    }

    renderResultsTable(filtered);
  }

  function renderResultsTable(data) {
    const tbody = document.querySelector('#results-table tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">ไม่พบข้อมูลที่ค้นหา</td></tr>';
      return;
    }

    // Sort data by Award (Gold -> Silver -> Bronze -> ...)
    data.sort((a, b) => {
      const getRank = (name) => {
        let award = String(name || 'เข้าร่วม').trim();
        if (award === '') return 99;
        if (award.includes('ชนะเลิศ') && !award.includes('รอง')) return 1;
        if (award.includes('รองชนะเลิศอันดับ 1') || award.includes('รองชนะเลิศอันดับที่ 1')) return 2;
        if (award.includes('รองชนะเลิศอันดับ 2') || award.includes('รองชนะเลิศอันดับที่ 2')) return 3;
        if (award.includes('รองชนะเลิศอันดับ 3') || award.includes('รองชนะเลิศอันดับที่ 3')) return 4;
        if (award.includes('ชมเชย')) return 5;
        if (award.includes('เข้าร่วม')) return 99;
        return 10;
      };
      return getRank(a['ผลรางวัล']) - getRank(b['ผลรางวัล']);
    });

    data.forEach(row => {
      // Determine badge color
      let badgeClass = 'badge-normal';
      let rawAward = String(row['ผลรางวัล'] || 'เข้าร่วม');
      let awardText = rawAward;
      const awardPrefixes = ['ชนะเลิศ', 'รองชนะเลิศอันดับที่ 1', 'รองชนะเลิศอันดับที่ 2', 'รองชนะเลิศอันดับที่ 3', 'ชมเชย', 'รองชนะเลิศอันดับ 1', 'รองชนะเลิศอันดับ 2', 'รองชนะเลิศอันดับ 3'];
      if (awardPrefixes.includes(rawAward.trim())) {
        awardText = 'รับรางวัล' + rawAward.trim();
      }

      if (awardText.includes('ชนะเลิศ')) badgeClass = 'badge-gold';
      if (awardText.includes('รองชนะเลิศอันดับ 1') || awardText.includes('รองชนะเลิศอันดับที่ 1')) badgeClass = 'badge-silver';
      if (awardText.includes('รองชนะเลิศอันดับ 2') || awardText.includes('รองชนะเลิศอันดับที่ 2')) badgeClass = 'badge-bronze';

      const safeId = String(row['รหัสนักเรียน'] || '').replace(/'/g, "\\'");
      const safeName = String(row['ชื่อ นามสกุล'] || '').replace(/'/g, "\\'");
      const safeComp = String(row['รายการแข่งขัน'] || '').replace(/'/g, "\\'");
      const safeAward = String(rawAward).replace(/'/g, "\\'");
      const link = row['ลิงก์เกียรติบัตร'] ? String(row['ลิงก์เกียรติบัตร']).replace(/'/g, "\\'") : '';
      const safeRoom = String(row['ห้อง'] || '').replace(/'/g, "\\'");
      const safeCertNo = String(row['เลขที่เกียรติบัตร'] || '-').replace(/'/g, "\\'");

      const clickHandler = `onclick="showStudentPdfModal(event, '${safeId}', '${safeName}', '${safeComp}', '${safeAward}', '${link}', '${safeRoom}', '${safeCertNo}')"`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row['รายการแข่งขัน'] || '-'}</td>
        <td ${clickHandler} style="cursor: pointer; color: var(--primary); text-decoration: underline;" title="คลิกเพื่อดูเกียรติบัตร">${row['รหัสนักเรียน'] || '-'}</td>
        <td ${clickHandler} style="cursor: pointer; color: var(--primary); text-decoration: underline; white-space: nowrap;" title="คลิกเพื่อดูเกียรติบัตร">${row['ชื่อ นามสกุล'] || '-'}</td>
        <td><span class="badge ${badgeClass}">${awardText}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.showStudentPdfModal = function (event, id, name, comp, award, link, room, certNo) {
    document.getElementById('modal-student-name').textContent = name || '-';

    let idRoomText = id || '-';
    if (room && room !== '-') idRoomText += ` | ห้อง: ${room}`;
    document.getElementById('modal-student-id-room').textContent = idRoomText;

    document.getElementById('modal-student-comp').textContent = comp || '-';
    document.getElementById('modal-student-cert-no').textContent = certNo || '-';

    let awardText = award;
    const awardPrefixes = ['ชนะเลิศ', 'รองชนะเลิศอันดับที่ 1', 'รองชนะเลิศอันดับที่ 2', 'รองชนะเลิศอันดับที่ 3', 'ชมเชย', 'รองชนะเลิศอันดับ 1', 'รองชนะเลิศอันดับ 2', 'รองชนะเลิศอันดับ 3'];
    if (awardPrefixes.includes(award.trim())) {
      awardText = 'รับรางวัล' + award.trim();
    }
    document.getElementById('modal-student-award').textContent = awardText || 'เข้าร่วม';

    const actionContainer = document.getElementById('modal-pdf-action-container');

    let certBtn = '<p class="text-muted mb-0">รอดำเนินการ (ระบบยังไม่เปิดให้ดาวน์โหลด)</p>';
    if (state.studentPdfEnabled) {
      if (link && link.trim() !== '') {
        certBtn = `<a href="${link}" target="_blank" class="btn btn-outline w-full" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><i class="ph ph-download-simple"></i> โหลดเกียรติบัตร</a>`;
      } else {
        certBtn = `<button class="btn btn-primary w-full" onclick="studentRequestPDF('${id}', '${comp}', this, '${award}')" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><i class="ph ph-file-pdf"></i> สร้างเกียรติบัตร</button>`;
      }
    }

    actionContainer.innerHTML = certBtn;

    const modal = document.getElementById('student-pdf-modal');
    const card = document.getElementById('student-pdf-card');

    // Ensure the overlay covers the full scrollable document height (useful for GAS iframes)
    modal.style.height = Math.max(document.body.scrollHeight, window.innerHeight) + 'px';

    // Calculate the exact center of the user's viewport
    let targetY = 100;
    if (event && event.pageY && event.clientY) {
      let scrollOffset = event.pageY - event.clientY; // Distance scrolled from top of iframe
      targetY = scrollOffset + (window.innerHeight / 2); // Center of the visible screen
    } else if (event && event.pageY) {
      targetY = event.pageY; // Fallback
    }
    
    card.style.marginTop = targetY + 'px';
    card.style.transform = 'translateY(-50%)'; // Perfectly center it vertically

    modal.style.display = 'flex';
  };

  function loadStudentPdfStatus() {
    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(function (status) {
          state.studentPdfEnabled = status;
          if (state.currentView === 'home' && state.publicResults.length > 0) {
            filterPublicResults(); // Re-render to reflect new state
          }
        })
        .getStudentPdfStatus();
    }
  }

  function toggleAdminPdfSetting(checkbox) {
    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(function (res) {
          if (res.success) {
            state.studentPdfEnabled = checkbox.checked;
            showToast(res.message);
          } else {
            checkbox.checked = !checkbox.checked; // Revert
            showToast(res.message, 'error');
          }
        })
        .withFailureHandler(function (err) {
          checkbox.checked = !checkbox.checked; // Revert
          showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
        })
        .toggleStudentPdfStatus(checkbox.checked, state.user.name);
    }
  }

  function studentRequestPDF(studentId, compName, btnElement, targetAward) {
    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = '<i class="ph ph-spinner ph-spin"></i> กำลังสร้าง...';
    btnElement.disabled = true;

    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(function (res) {
          if (res.success) {
            showToast('สร้างเกียรติบัตรสำเร็จ');
            btnElement.outerHTML = `<a href="${res.url}" target="_blank" class="btn btn-outline w-full" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><i class="ph ph-download-simple"></i> โหลดเกียรติบัตร</a>`;

            const row = state.publicResults.find(r => r['รหัสนักเรียน'] == studentId && r['รายการแข่งขัน'] == compName && (r['ผลรางวัล'] || 'เข้าร่วม') == targetAward);
            if (row) {
              row['ลิงก์เกียรติบัตร'] = res.url;
              // Re-render table so that the next click has the updated link in the click handler
              filterPublicResults();
            }
          } else {
            btnElement.innerHTML = originalText;
            btnElement.disabled = false;
            showToast(res.message, 'error');
          }
        })
        .withFailureHandler(function (err) {
          btnElement.innerHTML = originalText;
          btnElement.disabled = false;
          showToast('เกิดข้อผิดพลาดในการสร้าง', 'error');
        })
        .studentGenerateCertificatePDF(studentId, compName, targetAward);
    }
  }

  // Logic: Load Teacher List
  function loadTeacherList() {
    const dataList = document.getElementById('teacher-names-list');
    const input = document.getElementById('login-username');
    if (!dataList || !input) return;

    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(function (res) {
          if (res.success) {
            dataList.innerHTML = '';
            res.data.forEach(name => {
              const option = document.createElement('option');
              option.value = name;
              dataList.appendChild(option);
            });
          } else {
            input.placeholder = 'ไม่สามารถโหลดรายชื่อได้';
            showToast(res.message, 'error');
          }
        })
        .withFailureHandler(function (err) {
          input.placeholder = 'ไม่สามารถโหลดรายชื่อได้';
          showToast('เกิดข้อผิดพลาดในการโหลดรายชื่อ', 'error');
        })
        .getTeacherList();
    } else {
      // Mock Data
      setTimeout(() => {
        dataList.innerHTML = '';
        ['ครูสมชาย ใจดี', 'ครูสมหญิง รักเรียน'].forEach(name => {
          const option = document.createElement('option');
          option.value = name;
          dataList.appendChild(option);
        });
      }, 500);
    }
  }

  // Logic: Load Competitions
  function loadCompetitions() {
    const regSelect = document.getElementById('reg-competition');
    const myCompsContainer = document.getElementById('my-competitions-container');
    if (!regSelect) return;

    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(function (res) {
          if (res.success) {
            state.competitions = res.data;
            const optionsHtml = '<option value="" disabled selected>-- เลือกรายการ --</option>' +
              res.data.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

            regSelect.innerHTML = optionsHtml;
            const regSelectCommittee = document.getElementById('reg-competition-committee');
            if (regSelectCommittee) regSelectCommittee.innerHTML = optionsHtml;

            // Render my competitions
            const myComps = res.data.filter(c => c.t1 === state.user.name || c.t2 === state.user.name);
            if (myComps.length === 0) {
              myCompsContainer.innerHTML = '<p class="text-muted">คุณยังไม่ได้รับผิดชอบรายการแข่งขันใดๆ</p>';
            } else if (myComps.length === 1) {
              const c = myComps[0];
              myCompsContainer.innerHTML = `
                <div class="mb-4" style="border: 1px solid var(--border); padding: 1rem; border-radius: var(--radius);">
                  <h3 style="color: var(--primary); margin-bottom: 1rem;">${c.name}</h3>
                  <div id="registrations-container-${c.name}">
                    <div class="text-center"><i class="ph ph-spinner ph-spin"></i> กำลังโหลดรายชื่อ...</div>
                  </div>
                </div>
              `;
              loadRegistrations(c.name);
            } else {
              const optionsHtml = myComps.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
              myCompsContainer.innerHTML = `
                <div class="form-group mb-4">
                  <label class="form-label">เลือกรายการแข่งขันเพื่อบันทึกผล:</label>
                  <select class="form-control" id="my-comp-selector" onchange="switchMyComp(this.value)">
                    ${optionsHtml}
                  </select>
                </div>
                <div id="my-comp-dynamic-wrapper">
                </div>
              `;

              window.switchMyComp = function (compName) {
                const wrapper = document.getElementById('my-comp-dynamic-wrapper');
                wrapper.innerHTML = `
                  <div class="mb-4" style="border: 1px solid var(--border); padding: 1rem; border-radius: var(--radius);">
                    <h3 style="color: var(--primary); margin-bottom: 1rem;">${compName}</h3>
                    <div id="registrations-container-${compName}">
                      <div class="text-center"><i class="ph ph-spinner ph-spin"></i> กำลังโหลดรายชื่อ...</div>
                    </div>
                  </div>
                `;
                loadRegistrations(compName);
              };

              // Load the first one by default
              window.switchMyComp(myComps[0].name);
            }

          } else {
            regSelect.innerHTML = '<option value="" disabled selected>ไม่สามารถโหลดรายการได้</option>';
            if (myCompsContainer) myCompsContainer.innerHTML = '<p class="text-danger">ไม่สามารถโหลดข้อมูลรายการแข่งขันได้</p>';
          }
        })
        .withFailureHandler(function (err) {
          regSelect.innerHTML = '<option value="" disabled selected>ไม่สามารถโหลดรายการได้</option>';
          if (myCompsContainer) myCompsContainer.innerHTML = '<p class="text-danger">เกิดข้อผิดพลาดในการโหลดข้อมูลรายการแข่งขัน</p>';
        })
        .getCompetitions();
    } else {
      setTimeout(() => {
        state.competitions = [{ name: 'จำลองการแข่งขัน 1', t1: state.user?.name, t2: '' }];
        regSelect.innerHTML = '<option value="" disabled selected>-- เลือกรายการ --</option><option value="จำลองการแข่งขัน 1">จำลองการแข่งขัน 1</option>';
        const regSelectCommittee = document.getElementById('reg-competition-committee');
        if (regSelectCommittee) regSelectCommittee.innerHTML = regSelect.innerHTML;
        if (myCompsContainer) {
          myCompsContainer.innerHTML = `
            <div class="mb-4" style="border: 1px solid var(--border); padding: 1rem; border-radius: var(--radius);">
              <h3 style="color: var(--primary); margin-bottom: 1rem;">จำลองการแข่งขัน 1</h3>
              <div id="registrations-container-จำลองการแข่งขัน 1"></div>
            </div>
          `;
          loadRegistrations('จำลองการแข่งขัน 1');
        }
      }, 500);
    }
  }

  // Logic: Authentication
  function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('btn-login');

    btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div> กำลังตรวจสอบ...';
    btn.disabled = true;

    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(function (res) {
          btn.innerHTML = '<i class="ph ph-sign-in"></i> เข้าสู่ระบบ';
          btn.disabled = false;

          if (res.success) {
            state.user = res.user;
            localStorage.setItem('scienceDayTeacher', JSON.stringify(res.user));
            showToast('เข้าสู่ระบบสำเร็จ');
            app.navigate('dashboard');
          } else {
            showToast(res.message, 'error');
          }
        })
        .withFailureHandler(function (err) {
          btn.innerHTML = '<i class="ph ph-sign-in"></i> เข้าสู่ระบบ';
          btn.disabled = false;
          showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
        })
        .verifyLogin(username, password);
    } else {
      // Mock Login
      setTimeout(() => {
        state.user = { name: username };
        localStorage.setItem('scienceDayTeacher', JSON.stringify(state.user));
        showToast('Simulation: เข้าสู่ระบบสำเร็จ');
        app.navigate('dashboard');
      }, 1000);
    }
  }

  function handleLogout() {
    state.user = null;
    localStorage.removeItem('scienceDayTeacher');
    showToast('ออกจากระบบแล้ว');
    app.navigate('home');
  }

  function renderRecentRegistrations() {
    const container = document.getElementById('recent-registrations');
    const tbody = document.querySelector('#recent-reg-table tbody');

    const isCommittee = state.activeTab === 'committee';
    const filteredRegistrations = state.recentRegistrations.filter(reg => {
      if (isCommittee) {
        return reg.award === 'เป็นคณะดำเนินงาน';
      } else {
        return reg.award !== 'เป็นคณะดำเนินงาน';
      }
    });

    if (filteredRegistrations.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    tbody.innerHTML = '';

    const reversed = [...filteredRegistrations].reverse();
    reversed.forEach(reg => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${reg.id}</td>
        <td style="white-space: nowrap;">${reg.name}</td>
        <td>${reg.room || '-'}</td>
        <td>${reg.comp}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="editRecentRegistration('${reg.id}', '${reg.comp}', '${reg.award || 'เข้าร่วม'}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
            <i class="ph ph-pencil-simple"></i> แก้ไข
          </button>
          <button class="btn btn-outline btn-sm" onclick="deleteRecentRegistration('${reg.id}', '${reg.comp}', '${reg.award || 'เข้าร่วม'}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; color: var(--danger); border-color: var(--danger);">
            <i class="ph ph-trash"></i> ลบ
          </button>
        </td>
        <td style="text-align: center;">
          <input type="checkbox" class="recent-del-cb" value='${JSON.stringify({ id: reg.id, comp: reg.comp, award: reg.award || "เข้าร่วม" })}' onchange="checkRecentSelection()" style="width: 1.25rem; height: 1.25rem;">
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function deleteRecentRegistration(studentId, compName, targetAward) {
    if (!confirm(`คุณต้องการลบการลงทะเบียนของรหัส ${studentId} ในรายการ ${compName} ใช่หรือไม่?`)) return;

    if (typeof google !== 'undefined' && google.script) {
      showToast('กำลังลบข้อมูล...', 'info');
      google.script.run
        .withSuccessHandler(function (res) {
          if (res.success) {
            showToast(res.message);
            // Refresh from server to ensure data is up to date
            loadTeacherRegistrations();
            loadRegistrations(compName); // refresh result tab silently
          } else {
            showToast(res.message, 'error');
          }
        })
        .withFailureHandler(function (err) {
          showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
        })
        .deleteRegistration(studentId, compName, state.user.name, targetAward);
    }
  }

  window.toggleSelectAllRecent = function (checkbox) {
    const cbs = document.querySelectorAll('.recent-del-cb');
    cbs.forEach(cb => cb.checked = checkbox.checked);
    checkRecentSelection();
  };

  window.checkRecentSelection = function () {
    const anyChecked = document.querySelectorAll('.recent-del-cb:checked').length > 0;
    const btn = document.getElementById('btn-delete-selected-recent');
    if (btn) btn.style.display = anyChecked ? 'inline-flex' : 'none';
  };

  window.deleteSelectedRecent = function () {
    const checked = document.querySelectorAll('.recent-del-cb:checked');
    if (checked.length === 0) return;

    if (!confirm(`คุณต้องการลบข้อมูลที่เลือกจำนวน ${checked.length} รายการ ใช่หรือไม่?`)) return;

    const btn = document.getElementById('btn-delete-selected-recent');
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> กำลังลบข้อมูล...';
    btn.disabled = true;

    const allCbs = document.querySelectorAll('.recent-del-cb, #recent-reg-table thead input[type="checkbox"]');
    allCbs.forEach(cb => cb.disabled = true);

    const recordsToDelete = Array.from(checked).map(cb => {
      const data = JSON.parse(cb.value);
      return { studentId: data.id, compName: data.comp, targetAward: data.award };
    });

    if (typeof google !== 'undefined' && google.script) {
      showToast(`กำลังลบข้อมูล ${recordsToDelete.length} รายการ...`, 'info');
      google.script.run
        .withSuccessHandler(function (res) {
          btn.innerHTML = originalBtnText;
          btn.disabled = false;
          if (res.success) {
            showToast(res.message);
            // Uncheck header checkbox
            const selectAllCb = document.querySelector('#recent-reg-table thead input[type="checkbox"]');
            if (selectAllCb) selectAllCb.checked = false;

            // Hide the button
            btn.style.display = 'none';

            // Refresh from server
            loadTeacherRegistrations();

            // Refresh result tab for affected competitions
            const comps = [...new Set(recordsToDelete.map(r => r.compName))];
            comps.forEach(c => loadRegistrations(c));
          } else {
            allCbs.forEach(cb => cb.disabled = false);
            showToast(res.message, 'error');
          }
        })
        .withFailureHandler(function (err) {
          btn.innerHTML = originalBtnText;
          btn.disabled = false;
          allCbs.forEach(cb => cb.disabled = false);
          showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
        })
        .deleteMultipleRecentRegistrations(recordsToDelete, state.user.name);
    }
  };

  function editRecentRegistration(studentId, oldCompName, targetAward) {
    const availableComps = state.competitions.map(c => c.name);
    if (availableComps.length === 0) {
      showToast('กำลังโหลดข้อมูล หรือไม่มีรายการแข่งขัน', 'error');
      return;
    }

    const modalId = 'edit-comp-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = modalId;
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px);';
      document.body.appendChild(modal);
    }

    const optionsHtml = availableComps.map(c => `<option value="${c}" ${c === oldCompName ? 'selected' : ''}>${c}</option>`).join('');

    modal.innerHTML = `
      <div class="card glass" style="min-width: 300px; padding: 2rem; max-width: 90%; max-height: 90vh; overflow-y: auto;">
        <h3 style="margin-top: 0;">เปลี่ยนรายการแข่งขัน</h3>
        <p class="text-muted">สำหรับรหัส ${studentId}</p>
        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label">รายการแข่งขันใหม่</label>
          <select id="new-comp-select" class="form-control">
            ${optionsHtml}
          </select>
        </div>
        <div class="flex gap-2" style="margin-top: 1.5rem;">
          <button class="btn btn-outline w-full" onclick="document.getElementById('${modalId}').style.display='none'">ยกเลิก</button>
          <button class="btn btn-primary w-full" onclick="confirmEditRegistration('${studentId}', '${oldCompName}', '${targetAward}')">บันทึก</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  }

  function confirmEditRegistration(studentId, oldCompName, targetAward) {
    const newCompName = document.getElementById('new-comp-select').value;
    document.getElementById('edit-comp-modal').style.display = 'none';

    if (!newCompName || newCompName === oldCompName) return;

    if (typeof google !== 'undefined' && google.script) {
      showToast('กำลังแก้ไขข้อมูล...', 'info');
      google.script.run
        .withSuccessHandler(function (res) {
          if (res.success) {
            showToast(res.message);
            // Refresh from server
            loadTeacherRegistrations();
            loadRegistrations(oldCompName); // refresh old
            loadRegistrations(newCompName); // refresh new
          } else {
            showToast(res.message, 'error');
          }
        })
        .withFailureHandler(function (err) {
          showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
        })
        .updateRegistration(studentId, oldCompName, newCompName, state.user.name, targetAward);
    }
  }

  function loadTeacherRegistrations() {
    if (!state.user) return;

    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(function (res) {
          if (res.success) {
            state.recentRegistrations = res.data;
            renderRecentRegistrations();
          }
        })
        .getTeacherRegistrations(state.user.name);
    }
  }

  // Logic: Dashboard Tabs
  function switchDashboardTab(tab, btnElement) {
    // Update active button
    document.querySelectorAll('.sidebar-menu button').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');

    // Hide all tabs
    document.getElementById('tab-register').style.display = 'none';
    document.getElementById('tab-committee').style.display = 'none';
    document.getElementById('tab-result').style.display = 'none';

    // Show selected tab
    document.getElementById('tab-' + tab).style.display = 'block';

    state.activeTab = tab;

    const recentRegWrapper = document.getElementById('recent-registrations-wrapper');
    if (recentRegWrapper) {
      recentRegWrapper.style.display = (tab === 'register' || tab === 'committee') ? 'block' : 'none';
      renderRecentRegistrations();
    }
  }

  function searchStudent(tab = 'register') {
    const isCommittee = tab === 'committee';
    const inputId = isCommittee ? 'search-student-code-committee' : 'search-student-code';
    const resultDivId = isCommittee ? 'student-search-result-committee' : 'student-search-result';
    const formId = isCommittee ? 'registration-form-committee' : 'registration-form';

    const code = document.getElementById(inputId).value;
    const resultDiv = document.getElementById(resultDivId);

    if (!code) {
      showToast('กรุณากรอกข้อมูลเพื่อค้นหา', 'error');
      return;
    }

    resultDiv.innerHTML = '<p class="text-muted"><i class="ph ph-spinner ph-spin"></i> กำลังค้นหาข้อมูล...</p>';
    document.getElementById(formId).style.display = 'none';

    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(function (res) {
          if (res.success) {
            state.searchDataArray = res.data;
            if (res.data.length === 1) {
              selectSingleStudent(0, resultDivId);
            } else {
              renderStudentSelection(res.data, resultDivId, tab);
            }
            showRegistrationForm(tab);
          } else {
            resultDiv.innerHTML = `<p class="text-danger"><i class="ph ph-warning-circle"></i> ${res.message}</p>`;
            state.selectedStudents = [];
          }
        })
        .withFailureHandler(function (err) {
          resultDiv.innerHTML = '<p class="text-danger">เกิดข้อผิดพลาดในการเชื่อมต่อ</p>';
        })
        .searchStudent(code);
    } else {
      setTimeout(() => {
        const mockData = [
          { id: code, name: 'เด็กชาย เรียนดี ขยันยิ่ง', room: 'ม.3/1', number: '5', image: '' },
          { id: code + '2', name: 'เด็กหญิง ขยัน เรียนดี', room: 'ม.3/1', number: '6', image: '' }
        ];
        state.searchDataArray = mockData;
        renderStudentSelection(mockData, resultDivId, tab);
      }, 500);
    }
  }

  function renderStudentSelection(data, containerId, tab = 'register') {
    const container = document.getElementById(containerId);
    let html = `
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <p class="text-muted m-0">พบข้อมูล ${data.length} รายการ กรุณาเลือกนักเรียน:</p>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" onchange="toggleSelectAllStudents(this, '${tab}')" style="width: 1.25rem; height: 1.25rem;"> เลือกทั้งหมด
          </label>
        </div>
        <div class="flex flex-col gap-2 max-h-60 overflow-y-auto">
    `;

    data.forEach((student, idx) => {
      html += `
        <label class="card glass flex justify-between items-center cursor-pointer" style="padding: 0.75rem 1rem; border: 1px solid var(--border); margin: 0;">
          <div>
            <strong>${student.id}</strong> - ${student.name} <br>
            <small class="text-muted">ห้อง: ${student.room} | เลขที่: ${student.number}</small>
          </div>
          <input type="checkbox" class="student-checkbox-${tab}" value="${idx}" style="width: 1.25rem; height: 1.25rem;">
        </label>
      `;
    });

    html += `
        </div>
      </div>
    `;
    container.innerHTML = html;
  }

  function toggleSelectAllStudents(checkbox, tab = 'register') {
    const checkboxes = document.querySelectorAll(`.student-checkbox-${tab}`);
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
  }

  function showRegistrationForm(tab = 'register') {
    const isCommittee = tab === 'committee';
    const formId = isCommittee ? 'registration-form-committee' : 'registration-form';
    document.getElementById(formId).style.display = 'block';

    // Default competition
    const selectId = isCommittee ? 'reg-competition-committee' : 'reg-competition';
    const regSelect = document.getElementById(selectId);
    if (state.competitions && state.user) {
      const myComps = state.competitions.filter(c => c.t1 === state.user.name || c.t2 === state.user.name);
      if (myComps.length > 0) {
        regSelect.value = myComps[0].name;
      }
    }
  }

  function selectSingleStudent(index, containerId = 'student-search-result') {
    const student = state.searchDataArray[index];
    state.selectedStudents = [student];

    const container = document.getElementById(containerId);
    const imgHtml = student.image ? `<img src="${student.image}" alt="รูป" class="student-img">` : `<div class="student-img"><i class="ph ph-user" style="font-size: 2rem;"></i></div>`;

    container.innerHTML = `
      <div class="student-profile">
        ${imgHtml}
        <div class="student-details">
          <h3>${student.name}</h3>
          <p>รหัส: ${student.id} | ห้อง: ${student.room} | เลขที่: ${student.number}</p>
        </div>
      </div>
    `;
  }

  // Logic: Submit Forms
  async function autoGeneratePDFs(dataArray, compName) {
    for (let i = 0; i < dataArray.length; i++) {
      const student = dataArray[i];
      showToast(`กำลังสร้างเกียรติบัตรให้ ${student.studentName} (${i + 1}/${dataArray.length})...`, 'info');

      await new Promise((resolve) => {
        if (typeof google !== 'undefined' && google.script) {
          google.script.run
            .withSuccessHandler(res => {
              if (res.success) {
                showToast(`สร้างเกียรติบัตรสำเร็จ: ${student.studentName}`);
              } else {
                showToast(`สร้างไม่สำเร็จ ${student.studentName}: ${res.message}`, 'error');
              }
              resolve();
            })
            .withFailureHandler(err => {
              showToast(`เกิดข้อผิดพลาดในการสร้างเกียรติบัตร: ${student.studentName}`, 'error');
              resolve();
            })
            .generateCertificatePDF(student.studentId, compName, state.user.name);
        } else {
          setTimeout(resolve, 500);
        }
      });
    }

    showToast('ดำเนินการสร้างเกียรติบัตรเสร็จสิ้นแล้ว');
    loadTeacherRegistrations();
    loadRegistrations(compName);
  }

  function submitRegistration(tab = 'register') {
    const isCommittee = tab === 'committee';
    const checkboxes = document.querySelectorAll(`.student-checkbox-${tab}`);
    if (checkboxes.length > 0) {
      const checked = document.querySelectorAll(`.student-checkbox-${tab}:checked`);
      if (checked.length === 0) {
        showToast('กรุณาเลือกนักเรียนอย่างน้อย 1 คน', 'error');
        return;
      }
      state.selectedStudents = Array.from(checked).map(cb => state.searchDataArray[cb.value]);
    }

    if (!state.selectedStudents || state.selectedStudents.length === 0) return;

    const selectId = isCommittee ? 'reg-competition-committee' : 'reg-competition';
    const compSelector = document.getElementById(selectId);
    const compName = compSelector.value;

    if (!compName) {
      showToast('กรุณาเลือกรายการแข่งขัน', 'error');
      return;
    }

    const dataArray = state.selectedStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      studentRoom: student.room,
      competitionName: compName,
      teacherName: state.user.name,
      award: isCommittee ? 'เป็นคณะดำเนินงาน' : 'เข้าร่วม'
    }));

    const submitBtnId = isCommittee ? 'submit-reg-btn-committee' : 'submit-reg-btn';
    const submitBtn = document.getElementById(submitBtnId);
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> กำลังบันทึก...';
    }

    const resetBtn = () => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = isCommittee ? '<i class="ph ph-check-circle"></i> บันทึกคณะทำงาน' : '<i class="ph ph-check-circle"></i> บันทึกลงทะเบียน';
      }
    };

    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(function (res) {
          resetBtn();
          if (res.success) {
            showToast(res.message);
            // Add to recent
            dataArray.forEach(d => {
              state.recentRegistrations.push({
                id: d.studentId,
                name: d.studentName,
                room: d.studentRoom,
                comp: compName,
                award: d.award
              });
            });
            renderRecentRegistrations();

            // Silently update the result tab for this competition
            loadRegistrations(compName);

            // Reset form
            const inputId = isCommittee ? 'search-student-code-committee' : 'search-student-code';
            const resultDivId = isCommittee ? 'student-search-result-committee' : 'student-search-result';
            const formId = isCommittee ? 'registration-form-committee' : 'registration-form';

            document.getElementById(inputId).value = '';
            document.getElementById(resultDivId).innerHTML = '';
            document.getElementById(formId).style.display = 'none';
            document.getElementById(selectId).selectedIndex = 0;
            state.selectedStudents = [];
          } else {
            showToast(res.message, 'error');
          }
        })
        .withFailureHandler(function (err) {
          resetBtn();
          showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
        })
        .saveMultipleRegistrations(dataArray);
    } else {
      setTimeout(() => {
        resetBtn();
        showToast('Simulation: บันทึกลงทะเบียนแล้ว');
      }, 1000);
    }
  }
  function loadRegistrations(compName) {
    const container = document.getElementById(`registrations-container-${compName}`);
    if (!container) return;

    container.innerHTML = '<div class="text-center"><i class="ph ph-spinner ph-spin" style="font-size: 2rem; color: var(--primary);"></i><p>กำลังโหลดรายชื่อ...</p></div>';

    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(function (res) {
          if (res.success && res.data.length > 0) {
            renderRegistrationsTable(res.data, compName, container);
          } else {
            container.innerHTML = '<div class="card glass text-center"><p class="text-muted">ยังไม่มีผู้ลงทะเบียนในรายการนี้</p></div>';
          }
        })
        .withFailureHandler(function (err) {
          container.innerHTML = '<div class="card glass text-center"><p class="text-danger">เกิดข้อผิดพลาดในการโหลดข้อมูล</p></div>';
        })
        .getRegistrationsByCompetition(compName);
    } else {
      setTimeout(() => {
        renderRegistrationsTable([
          { studentId: '12345', studentName: 'เด็กชาย สมมติ ทดสอบ', award: 'ชนะเลิศ', certificateUrl: 'https://google.com' },
          { studentId: '67890', studentName: 'เด็กหญิง จำลอง ข้อมูล', award: '', certificateUrl: '' }
        ], compName, container);
      }, 500);
    }
  }

  // Filter logic for result table
  window.filterResultTable = function (compIdSafe) {
    const textSelect = document.getElementById(`search-text-${compIdSafe}`);

    if (!textSelect) return;

    const text = textSelect.value.toLowerCase();

    const rows = document.querySelectorAll(`.result-row-${compIdSafe}`);
    rows.forEach(row => {
      const name = row.getAttribute('data-name').toLowerCase();
      const id = row.getAttribute('data-id').toLowerCase();

      const matchText = !text || name.includes(text) || id.includes(text);

      if (matchText) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  };

  function renderRegistrationsTable(data, compName, container) {
    const compIdSafe = compName.replace(/[^a-zA-Z0-9]/g, '');
    const awardOptionsHtml = `
      <option value="">-- เลือกผลการแข่งขัน --</option>
      <option value="ชนะเลิศ">ชนะเลิศ</option>
      <option value="รองชนะเลิศอันดับที่ 1">รองชนะเลิศอันดับที่ 1</option>
      <option value="รองชนะเลิศอันดับที่ 2">รองชนะเลิศอันดับที่ 2</option>
      <option value="รองชนะเลิศอันดับที่ 3">รองชนะเลิศอันดับที่ 3</option>
      <option value="ชมเชย">ชมเชย</option>
      <option value="เข้าร่วม">เข้าร่วม</option>
    `;

    let rowsHtml = '';
    data.forEach((student, index) => {
      // Pre-select award
      let originalAward = student.award || 'เข้าร่วม';
      let selectHtml = `<select class="form-control" id="award-select-${index}" style="min-width: 150px;" onchange="document.getElementById('save-btn-${index}').style.display = (this.value !== '${originalAward}') ? 'inline-flex' : 'none';">${awardOptionsHtml}</select>`;

      if (student.award) {
        selectHtml = selectHtml.replace(`value="${student.award}"`, `value="${student.award}" selected`);
      } else {
        selectHtml = selectHtml.replace(`value="เข้าร่วม"`, `value="เข้าร่วม" selected`);
      }

      let certHtml = '';
      if (student.certificateUrl) {
        certHtml = `<a href="${student.certificateUrl}" target="_blank" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; white-space: nowrap;"><i class="ph ph-file-pdf"></i> เปิดเกียรติบัตร</a>`;
      } else {
        certHtml = `<button class="btn btn-primary btn-sm" onclick="generatePdf('${student.studentId}', '${compName}', this, '${originalAward}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; white-space: nowrap;"><i class="ph ph-file-pdf"></i> สร้าง PDF</button>`;
      }

      rowsHtml += `
        <tr class="result-row-${compIdSafe}" data-name="${student.studentName}" data-id="${student.studentId}" data-room="${student.studentRoom}">
          <td>${student.studentId}</td>
          <td style="white-space: nowrap;">${student.studentName}</td>
          <td>${student.studentRoom || '-'}</td>
          <td>${selectHtml}</td>
          <td>
            <div class="flex gap-2">
              <button id="save-btn-${index}" class="btn btn-success" onclick="submitRowAward('${student.studentId}', '${student.studentName}', '${compName}', '${originalAward}', ${index})" style="padding: 0.5rem; font-size: 0.875rem; display: none;">
                <i class="ph ph-floppy-disk"></i> บันทึก
              </button>
              <button class="btn btn-outline" onclick="editRecentRegistration('${student.studentId}', '${compName}', '${originalAward}')" style="padding: 0.5rem; font-size: 0.875rem;">
                <i class="ph ph-pencil-simple"></i> แก้ไข
              </button>
              <button class="btn btn-outline" onclick="deleteRecentRegistration('${student.studentId}', '${compName}', '${originalAward}')" style="padding: 0.5rem; font-size: 0.875rem; color: var(--danger); border-color: var(--danger);">
                <i class="ph ph-trash"></i> ลบ
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    const searchControlsHtml = `
      <div class="flex gap-2 mb-4" style="flex-wrap: wrap;">
        <input type="text" class="form-control" id="search-text-${compIdSafe}" placeholder="ค้นหาชื่อ/รหัส..." oninput="filterResultTable('${compIdSafe}')" style="max-width: 200px;">
      </div>
    `;

    container.innerHTML = `
      ${searchControlsHtml}
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>รหัสนักเรียน</th>
              <th>ชื่อ นามสกุล</th>
              <th>ห้อง</th>
              <th>ผลการแข่งขัน</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  function generatePdf(studentId, compName, btn, award) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> กำลังสร้าง...';
    btn.disabled = true;

    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(function (res) {
          if (res.success) {
            showToast(res.message);
            loadRegistrations(compName);
          } else {
            btn.innerHTML = originalText;
            btn.disabled = false;
            showToast(res.message, 'error');
          }
        })
        .withFailureHandler(function (err) {
          btn.innerHTML = originalText;
          btn.disabled = false;
          showToast('เกิดข้อผิดพลาดในการสร้าง PDF', 'error');
        })
        .generateCertificatePDF(studentId, compName, state.user.name, award);
    } else {
      setTimeout(() => {
        btn.innerHTML = '<i class="ph ph-file-pdf"></i> เปิดเกียรติบัตร';
        btn.className = 'btn btn-outline btn-sm';
        btn.disabled = false;
        showToast('Simulation: สร้าง PDF แล้ว');
      }, 2000);
    }
  }

  function submitRowAward(studentId, studentName, compName, originalAward, index) {
    const awardSelect = document.getElementById(`award-select-${index}`);
    const btn = document.getElementById(`save-btn-${index}`);

    const award = awardSelect.value;

    if (!award) {
      showToast('กรุณาเลือกผลรางวัลสำหรับ ' + studentName, 'error');
      return;
    }

    const data = {
      studentId: studentId,
      studentName: studentName,
      competitionName: compName,
      award: award,
      originalAward: originalAward,
      teacherName: state.user.name
    };

    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';
    btn.disabled = true;

    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(function (res) {
          btn.innerHTML = originalHtml;
          btn.disabled = false;
          if (res.success) {
            showToast(res.message);
            btn.style.display = 'none';
            awardSelect.setAttribute('onchange', `document.getElementById('save-btn-${index}').style.display = (this.value !== '${award}') ? 'inline-flex' : 'none';`);

            // Note: In order to allow multiple edits without page reload, 
            // the onclick of this button should also be updated with the new award, 
            // but the safest approach is to just trigger a re-render of the table if it's a SPA.
            loadRegistrations(compName);
          } else {
            showToast(res.message, 'error');
          }
        })
        .withFailureHandler(function (err) {
          btn.innerHTML = originalHtml;
          btn.disabled = false;
          showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
        })
        .saveResult(data);
    } else {
      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
        btn.style.display = 'none';
        awardSelect.setAttribute('onchange', `document.getElementById('save-btn-${index}').style.display = (this.value !== '${award}') ? 'inline-flex' : 'none';`);
        showToast('Simulation: บันทึกข้อมูลสำเร็จ');
        loadRegistrations(compName);
      }, 500);
    }
  }

  // Initialize App on load
  window.addEventListener('DOMContentLoaded', () => {
    app.init();
  });
