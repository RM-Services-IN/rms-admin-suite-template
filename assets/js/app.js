/* ============================================================
   RM SERVICES ADMIN TEMPLATE — vanilla JS engine (offline)
   Handles: theme, dark mode, sidebar, dropdowns, modals,
   toasts, charts, tables, chat, template builder, gallery,
   blog tools, settings tabs.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- THEME ---------------- */
  var THEMES = ['indigo', 'emerald', 'rose', 'amber', 'ocean'];
  var charts = [];

  function primaryVar(shade, alpha) {
    var v = getComputedStyle(document.documentElement).getPropertyValue('--p-' + shade).trim();
    return 'rgba(' + v.split(/\s+/).join(',') + ',' + alpha + ')';
  }
  function isDark() { return document.documentElement.classList.contains('dark'); }

  window.RM = {
    setTheme: function (name) {
      if (THEMES.indexOf(name) === -1) return;
      document.documentElement.dataset.theme = name;
      localStorage.setItem('rm-theme', name);
      paintThemeDots();
      refreshCharts();
    },
    toggleDark: function () {
      var d = document.documentElement.classList.toggle('dark');
      localStorage.setItem('rm-dark', d ? '1' : '0');
      refreshCharts();
    },
    toggleSidebar: function () {
      var sb = $('#sidebar'), ov = $('#sidebar-overlay');
      if (!sb) return;
      var closed = sb.classList.toggle('-translate-x-full');
      if (ov) ov.classList.toggle('hidden', closed);
    },
    toast: function (msg, type) {
      var wrap = $('#rm-toasts');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'rm-toasts';
        wrap.className = 'fixed bottom-5 right-5 z-[70] space-y-2';
        document.body.appendChild(wrap);
      }
      var t = document.createElement('div');
      var bar = type === 'error' ? 'bg-red-500' : (type === 'warn' ? 'bg-amber-500' : 'bg-emerald-500');
      t.className = 'rm-pop flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-pop rounded-xl pl-2 pr-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200';
      t.innerHTML = '<span class="w-1.5 h-9 rounded-full ' + bar + '"></span><span>' + msg + '</span>';
      wrap.appendChild(t);
      setTimeout(function () { t.style.transition = 'opacity .3s, transform .3s'; t.style.opacity = '0'; t.style.transform = 'translateY(6px)'; setTimeout(function () { t.remove(); }, 320); }, 2800);
    },
    openModal: function (id) { var m = $('#' + id); if (m) { m.classList.remove('hidden'); } },
    closeModal: function (id) { var m = $('#' + id); if (m) { m.classList.add('hidden'); } }
  };

  function paintThemeDots() {
    var cur = document.documentElement.dataset.theme || 'indigo';
    $$('[data-theme-dot]').forEach(function (d) {
      var on = d.dataset.themeDot === cur;
      d.classList.toggle('ring-2', on);
      d.classList.toggle('ring-offset-2', on);
      d.classList.toggle('ring-slate-400', on);
      d.classList.toggle('dark:ring-slate-500', on);
    });
  }

  /* ---------------- DROPDOWNS ---------------- */
  function closeDropdowns() { $$('[data-dropdown-panel]').forEach(function (p) { p.classList.add('hidden'); }); }
  $$('[data-dropdown-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var panel = $('#' + btn.dataset.dropdownToggle);
      var wasHidden = panel.classList.contains('hidden');
      closeDropdowns();
      if (wasHidden) panel.classList.remove('hidden');
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-dropdown-panel]')) closeDropdowns();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDropdowns(); $$('[data-modal]').forEach(function (m) { m.classList.add('hidden'); }); }
  });

  /* ---------------- MODALS ---------------- */
  $$('[data-modal-open]').forEach(function (b) { b.addEventListener('click', function () { RM.openModal(b.dataset.modalOpen); }); });
  $$('[data-modal-close]').forEach(function (b) { b.addEventListener('click', function () { RM.closeModal(b.dataset.modalClose); }); });
  $$('[data-modal]').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m) m.classList.add('hidden'); });
  });

  /* ---------------- SIDEBAR ---------------- */
  var ov = $('#sidebar-overlay');
  if (ov) ov.addEventListener('click', RM.toggleSidebar);

  paintThemeDots();

  /* ---------------- CHARTS ---------------- */
  function gridColor() { return isDark() ? 'rgba(148,163,184,.12)' : 'rgba(100,116,139,.12)'; }
  function tickColor() { return isDark() ? '#94a3b8' : '#64748b'; }

  function makeCharts() {
    if (!window.Chart) return;
    Chart.defaults.font.family = 'Manrope, sans-serif';
    Chart.defaults.color = tickColor();
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;

    var defs = {
      /* Ecommerce dashboard */
      revenueChart: function (ctx) {
        var g = ctx.createLinearGradient(0, 0, 0, 320);
        g.addColorStop(0, primaryVar(500, .28)); g.addColorStop(1, primaryVar(500, 0));
        return {
          type: 'line',
          data: { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            datasets: [
              { label: 'Revenue', data: [42,55,48,62,58,74,81,76,92,88,104,118], borderColor: primaryVar(500,1), backgroundColor: g, fill: true, tension: .45, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5, pointBackgroundColor: primaryVar(500,1) },
              { label: 'Expenses', data: [30,34,32,38,36,44,47,45,52,50,58,63], borderColor: isDark() ? '#475569' : '#cbd5e1', borderDash: [6,6], fill: false, tension: .45, borderWidth: 2, pointRadius: 0 }
            ]},
          options: baseOpts({ yCallback: function (v) { return '$' + v + 'k'; } })
        };
      },
      trafficChart: function () {
        return {
          type: 'doughnut',
          data: { labels: ['Organic', 'Social', 'Referral', 'Direct'],
            datasets: [{ data: [42, 26, 18, 14], backgroundColor: [primaryVar(500,1), primaryVar(300,1), primaryVar(200,1), isDark() ? '#334155' : '#e2e8f0'], borderWidth: 0, hoverOffset: 6 }]},
          options: { cutout: '72%', maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        };
      },
      /* CRM dashboard */
      crmLeadsChart: function () {
        return {
          type: 'bar',
          data: { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            datasets: [
              { label: 'New Leads', data: [32,45,38,52,47,28,35], backgroundColor: primaryVar(500,.9), borderRadius: 6, barPercentage: .55 },
              { label: 'Qualified', data: [18,26,22,34,29,15,21], backgroundColor: primaryVar(200,.9), borderRadius: 6, barPercentage: .55 }
            ]},
          options: baseOpts({ stacked: false })
        };
      },
      crmRevenueChart: function (ctx) {
        var g = ctx.createLinearGradient(0, 0, 0, 280);
        g.addColorStop(0, primaryVar(400, .3)); g.addColorStop(1, primaryVar(400, 0));
        return {
          type: 'line',
          data: { labels: ['Q1','Q2','Q3','Q4'], datasets: [{ label: 'Deal Value', data: [120, 185, 162, 248], borderColor: primaryVar(500,1), backgroundColor: g, fill: true, tension: .45, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: primaryVar(500,1) }]},
          options: baseOpts({ yCallback: function (v) { return '$' + v + 'k'; } })
        };
      },
      /* Marketing dashboard */
      mktMessagesChart: function () {
        return {
          type: 'bar',
          data: { labels: ['W1','W2','W3','W4','W5','W6','W7','W8'],
            datasets: [
              { type: 'line', label: 'Read Rate %', data: [68,72,70,78,82,79,85,88], borderColor: isDark() ? '#fbbf24' : '#f59e0b', tension: .45, borderWidth: 2.5, pointRadius: 0, yAxisID: 'y1' },
              { label: 'Messages Sent', data: [4200,5100,4800,6300,7200,6800,8100,9200], backgroundColor: primaryVar(500,.85), borderRadius: 6, barPercentage: .5 }
            ]},
          options: baseOpts({ dual: true })
        };
      },
      mktDeliveryChart: function () {
        return {
          type: 'doughnut',
          data: { labels: ['Delivered', 'Read', 'Failed'],
            datasets: [{ data: [94, 78, 6], backgroundColor: [primaryVar(500,1), '#22c55e', '#f43f5e'], borderWidth: 0, hoverOffset: 6 }]},
          options: { cutout: '72%', maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        };
      },
      /* Meta API dashboard */
      metaRevenueChart: function (ctx) {
        var g = ctx.createLinearGradient(0, 0, 0, 340);
        g.addColorStop(0, primaryVar(500, .25)); g.addColorStop(1, primaryVar(500, 0));
        return {
          type: 'line',
          data: { labels: ['2026-02','2026-03','2026-04','2026-05','2026-06','2026-07'],
            datasets: [{ label: 'Revenue', data: [0, 8200, 18400, 31500, 52800, 95334], borderColor: primaryVar(500,1), backgroundColor: g, fill: true, tension: .4, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5, pointBackgroundColor: primaryVar(500,1) }]},
          options: baseOpts({ yCallback: function (v) { return '₹' + (v / 1000) + '.0k'; } })
        };
      },
      metaPlanChart: function () {
        return {
          type: 'doughnut',
          data: { labels: ['Business Annual Plan', 'Starter Plan', 'Enterprise Plan'],
            datasets: [{ data: [95334, 4200, 6800], backgroundColor: [primaryVar(500,1), primaryVar(300,1), isDark() ? '#334155' : '#e2e8f0'], borderWidth: 0, hoverOffset: 6 }]},
          options: { cutout: '76%', maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        };
      }
    };

    Object.keys(defs).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      charts.push(new Chart(el.getContext('2d'), defs[id](el.getContext('2d'))));
    });
  }

  function baseOpts(extra) {
    extra = extra || {};
    var scales = {
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: gridColor() }, border: { display: false }, ticks: { font: { size: 11 }, callback: extra.yCallback || undefined } }
    };
    if (extra.dual) scales.y1 = { position: 'right', grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 } } };
    return {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
      scales: scales
    };
  }

  function refreshCharts() {
    if (!window.Chart || !charts.length) return;
    charts.forEach(function (c) { c.destroy(); });
    charts = [];
    makeCharts();
  }

  makeCharts();

  /* ================= DATA TABLE PAGE ================= */
  if ($('#data-table-body')) {
    var PLAN_C = { 'Enterprise': 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20', 'Business': 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/20', 'Starter': 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20' };
    var STATUS_C = { 'Active': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', 'Pending': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', 'Suspended': 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20' };
    var names = [['Riya Sharma','TechNova'],['Aman Kapoor','PixelWorks'],['Jay Patel','CloudBridge'],['Sara Mathew','BrightAds'],['Pooja Nair','Craftly'],['Vivek Tandon','DataNest'],['Ankit Rao','ShopKart'],['Kiran Desai','WaveMedia'],['Neha Gupta','FinEdge'],['Rahul Verma','QuickServe'],['Meera Iyer','AdVantage'],['Arjun Singh','WebCraft'],['Divya Menon','LeadGenius'],['Kunal Shah','MarketMinds'],['Tara Bose','SalesFlow'],['Om Prakash','CloudNine'],['Isha Reddy','BrandWave'],['Rohan Joshi','AppSmith'],['Ananya Das','ChatPilot'],['Vikram Malhotra','GrowthLab'],['Sneha Kulkarni','OmniRetail'],['Farhan Ali','MetaReach'],['Priya Nair','Supportly'],['Dev Patel','InsightIQ'],['Kavya Rao','BuzzTel'],['Manoj Kumar','FreshCart'],['Ritu Singh','AdSpark'],['Nikhil Bose','FlowCRM'],['Alisha Khan','ShopSphere'],['Varun Mehta','TaskMate'],['Pallavi Jha','MailBlast'],['Suresh Raina','LinkTree'],['Nidhi Agarwal','CartLoop'],['Harsh Vardhan','LeadFlow'],['Juhi Chawla','WebWave'],['Aditya Rao','CloudMart'],['Shruti Pillai','DataBridge'],['Gaurav Bhat','SalesZen'],['Ritika Soni','AppFlow'],['Mohit Anand','ChatWave']];
    var tableData = names.map(function (n, i) {
      var plans = ['Enterprise', 'Business', 'Starter'];
      var statuses = ['Active', 'Active', 'Active', 'Pending', 'Suspended'];
      return {
        id: 1000 + i,
        name: n[0], company: n[1],
        email: n[0].toLowerCase().replace(/\s+/g, '.') + '@' + n[1].toLowerCase() + '.com',
        avatar: 'assets/img/avatar-' + ((i % 8) + 1) + '.svg',
        plan: plans[i % 3], status: statuses[i % 5],
        amount: 1200 + ((i * 1377) % 48000),
        date: new Date(2026, i % 7, (i % 27) + 1).toISOString().slice(0, 10)
      };
    });

    var state = { page: 1, perPage: 8, query: '', sortKey: '', sortDir: 1, selected: {} };

    function filtered() {
      var q = state.query.toLowerCase();
      var rows = tableData.filter(function (r) {
        return !q || (r.name + r.email + r.company + r.plan + r.status).toLowerCase().indexOf(q) > -1;
      });
      if (state.sortKey) {
        rows = rows.slice().sort(function (a, b) {
          var x = a[state.sortKey], y = b[state.sortKey];
          return (x > y ? 1 : x < y ? -1 : 0) * state.sortDir;
        });
      }
      return rows;
    }

    function renderTable() {
      var rows = filtered();
      var pages = Math.max(1, Math.ceil(rows.length / state.perPage));
      if (state.page > pages) state.page = pages;
      var start = (state.page - 1) * state.perPage;
      var slice = rows.slice(start, start + state.perPage);
      var body = $('#data-table-body');
      body.innerHTML = slice.map(function (r) {
        return '<tr class="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">' +
          '<td class="px-5 py-3.5"><input type="checkbox" data-row-check="' + r.id + '" ' + (state.selected[r.id] ? 'checked' : '') + ' class="w-4 h-4 rounded accent-primary-500 cursor-pointer"></td>' +
          '<td class="px-5 py-3.5"><div class="flex items-center gap-3"><img src="' + r.avatar + '" class="w-9 h-9 rounded-full" alt=""><div><p class="font-bold text-slate-800 dark:text-slate-100 text-sm">' + r.name + '</p><p class="text-xs text-slate-400">' + r.email + '</p></div></div></td>' +
          '<td class="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300 font-medium">' + r.company + '</td>' +
          '<td class="px-5 py-3.5"><span class="px-2.5 py-1 rounded-full text-xs font-bold border ' + PLAN_C[r.plan] + '">' + r.plan + '</span></td>' +
          '<td class="px-5 py-3.5"><span class="px-2.5 py-1 rounded-full text-xs font-bold border ' + STATUS_C[r.status] + '">' + r.status + '</span></td>' +
          '<td class="px-5 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-100">$' + r.amount.toLocaleString() + '</td>' +
          '<td class="px-5 py-3.5 text-sm text-slate-500">' + r.date + '</td>' +
          '<td class="px-5 py-3.5 text-right"><button data-row-edit="' + r.id + '" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-500 transition-colors" title="Edit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button></td></tr>';
      }).join('') || '<tr><td colspan="8" class="px-5 py-12 text-center text-slate-400 text-sm font-medium">No results found for “' + state.query + '”</td></tr>';

      $('#table-count').textContent = 'Showing ' + (rows.length ? start + 1 : 0) + '–' + Math.min(start + state.perPage, rows.length) + ' of ' + rows.length + ' customers';

      var pg = $('#table-pagination');
      var btns = '';
      btns += pgBtn('‹', state.page - 1, state.page === 1);
      var win = [];
      for (var i = 1; i <= pages; i++) { if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) win.push(i); }
      var last = 0;
      win.forEach(function (i) {
        if (i - last > 1) btns += '<span class="px-2 text-slate-400">…</span>';
        btns += '<button data-page="' + i + '" class="min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-bold transition-colors ' + (i === state.page ? 'bg-primary-500 text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800') + '">' + i + '</button>';
        last = i;
      });
      btns += pgBtn('›', state.page + 1, state.page === pages);
      pg.innerHTML = btns;
      $$('[data-page]', pg).forEach(function (b) { b.addEventListener('click', function () { state.page = +b.dataset.page; renderTable(); }); });

      $$('[data-row-check]').forEach(function (c) {
        c.addEventListener('change', function () { state.selected[c.dataset.rowCheck] = c.checked; updateBulk(); });
      });
      updateBulk();

      $$('[data-sort]').forEach(function (th) {
        th.classList.toggle('sorted', th.dataset.sort === state.sortKey);
        var a = th.querySelector('.rm-arrow');
        if (a) a.textContent = th.dataset.sort === state.sortKey ? (state.sortDir === 1 ? '▲' : '▼') : '▲▼';
      });
    }
    function pgBtn(label, page, disabled) {
      return '<button ' + (disabled ? 'disabled' : 'data-page="' + page + '"') + ' class="min-w-[2.25rem] h-9 rounded-lg text-sm font-bold ' + (disabled ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800') + '">' + label + '</button>';
    }
    function updateBulk() {
      var n = Object.keys(state.selected).filter(function (k) { return state.selected[k]; }).length;
      var bar = $('#bulk-bar');
      if (bar) { bar.classList.toggle('hidden', n === 0); $('#bulk-count').textContent = n + ' selected'; }
    }

    $('#table-search').addEventListener('input', function (e) { state.query = e.target.value; state.page = 1; renderTable(); });
    $('#table-perpage').addEventListener('change', function (e) { state.perPage = +e.target.value; state.page = 1; renderTable(); });
    $$('[data-sort]').forEach(function (th) {
      th.addEventListener('click', function () {
        if (state.sortKey === th.dataset.sort) state.sortDir *= -1;
        else { state.sortKey = th.dataset.sort; state.sortDir = 1; }
        renderTable();
      });
    });
    var checkAll = $('#table-check-all');
    if (checkAll) checkAll.addEventListener('change', function () {
      filtered().forEach(function (r) { state.selected[r.id] = checkAll.checked; });
      renderTable();
    });
    renderTable();
    window._rmTable = { data: tableData, filtered: filtered, render: renderTable };
  }

  /* ================= META CHAT PAGE ================= */
  if ($('#chat-thread')) {
    var chats = [
      { id: 1, name: 'Riya Sharma', phone: '+91 98200 11223', avatar: 'assets/img/avatar-1.svg', time: '10:42', unread: 2, online: true, tag: 'Customer',
        msgs: [
          { dir: 'in', text: 'Hi! I saw your WhatsApp broadcast about the festive offer.', time: '10:38' },
          { dir: 'out', text: 'Hello Riya! Yes, the offer is live till Sunday. Flat 25% off on annual plans.', time: '10:40', tick: 2 },
          { dir: 'in', text: 'Great. Can I upgrade my current Business plan?', time: '10:41' },
          { dir: 'out', text: 'Absolutely. I will share the upgrade link right away — it takes less than a minute.', time: '10:42', tick: 2 }
        ] },
      { id: 2, name: 'Aman Kapoor', phone: '+91 99870 44556', avatar: 'assets/img/avatar-2.svg', time: '09:15', unread: 0, online: false, tag: 'Lead',
        msgs: [
          { dir: 'in', text: 'Does the CRM integration work with Meta Cloud API?', time: '09:10' },
          { dir: 'out', text: 'Yes Aman, we connect directly via the official Meta WhatsApp Business API.', time: '09:12', tick: 2 },
          { dir: 'in', text: 'Perfect, please send the pricing deck.', time: '09:15' }
        ] },
      { id: 3, name: 'Sara Mathew', phone: '+91 98111 77889', avatar: 'assets/img/avatar-4.svg', time: 'Yesterday', unread: 5, online: true, tag: 'VIP',
        msgs: [
          { dir: 'in', text: 'The template I submitted got rejected. Any idea why?', time: '18:02' },
          { dir: 'out', text: 'Let me check — usually it is a missing sample for the {{1}} variable. I will review and resubmit.', time: '18:10', tick: 2 },
          { dir: 'in', text: 'Thanks! Also need 2 more agent seats.', time: '18:12' }
        ] },
      { id: 4, name: 'Vivek Tandon', phone: '+91 90040 33221', avatar: 'assets/img/avatar-6.svg', time: 'Yesterday', unread: 0, online: false, tag: 'Customer',
        msgs: [
          { dir: 'out', text: 'Hi Vivek, your invoice for July is ready. Would you like the PDF here?', time: '15:20', tick: 2 },
          { dir: 'in', text: 'Yes please, and add GST number 27ABCDE1234F1Z5.', time: '15:44' }
        ] },
      { id: 5, name: 'Kiran Desai', phone: '+91 98675 55443', avatar: 'assets/img/avatar-8.svg', time: 'Mon', unread: 0, online: false, tag: 'Lead',
        msgs: [ { dir: 'in', text: 'Is there a free trial for the marketing suite?', time: '11:05' } ] }
    ];
    var activeChat = chats[0];

    function renderChatList() {
      $('#chat-list').innerHTML = chats.map(function (c) {
        var last = c.msgs[c.msgs.length - 1];
        return '<button data-chat-id="' + c.id + '" class="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ' + (c.id === activeChat.id ? 'bg-primary-500/8 dark:bg-primary-500/10 border-r-2 border-primary-500' : '') + '">' +
          '<div class="relative flex-none"><img src="' + c.avatar + '" class="w-11 h-11 rounded-full" alt="">' + (c.online ? '<span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>' : '') + '</div>' +
          '<div class="flex-1 min-w-0"><div class="flex items-center justify-between"><p class="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">' + c.name + '</p><span class="text-[11px] ' + (c.unread ? 'text-primary-500 font-bold' : 'text-slate-400') + '">' + c.time + '</span></div>' +
          '<div class="flex items-center justify-between gap-2"><p class="text-xs text-slate-500 truncate">' + (last.dir === 'out' ? 'You: ' : '') + last.text + '</p>' + (c.unread ? '<span class="flex-none w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">' + c.unread + '</span>' : '') + '</div></div></button>';
      }).join('');
      $$('[data-chat-id]').forEach(function (b) {
        b.addEventListener('click', function () {
          activeChat = chats.find(function (c) { return c.id === +b.dataset.chatId; });
          activeChat.unread = 0;
          renderChatList(); renderThread();
        });
      });
    }

    function tickIcon(t) {
      if (!t) return '';
      var col = t === 2 ? 'text-sky-500' : 'text-slate-400';
      return '<svg class="inline ' + col + '" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>';
    }

    function renderThread(scroll) {
      $('#chat-name').textContent = activeChat.name;
      $('#chat-phone').textContent = activeChat.phone + (activeChat.online ? ' · online' : ' · last seen recently');
      $('#chat-avatar').src = activeChat.avatar;
      $('#chat-tag').textContent = activeChat.tag;
      $('#chat-thread').innerHTML = activeChat.msgs.map(function (m) {
        if (m.dir === 'in') {
          return '<div class="flex"><div class="max-w-[75%] bg-white dark:bg-slate-800 rounded-2xl rounded-tl-md px-4 py-2.5 shadow-soft"><p class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">' + m.text + '</p><p class="text-[10px] text-slate-400 text-right mt-1">' + m.time + '</p></div></div>';
        }
        return '<div class="flex justify-end"><div class="max-w-[75%] bg-primary-500/15 dark:bg-primary-500/25 border border-primary-500/15 rounded-2xl rounded-tr-md px-4 py-2.5"><p class="text-sm text-slate-700 dark:text-slate-100 leading-relaxed">' + m.text + '</p><p class="text-[10px] text-slate-400 text-right mt-1">' + m.time + ' ' + tickIcon(m.tick) + '</p></div></div>';
      }).join('');
      if (scroll !== false) { var th = $('#chat-thread'); th.scrollTop = th.scrollHeight; }
    }

    function sendChat() {
      var inp = $('#chat-input');
      var txt = inp.value.trim();
      if (!txt) return;
      var now = new Date();
      var t = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
      activeChat.msgs.push({ dir: 'out', text: txt, time: t, tick: 1 });
      inp.value = '';
      renderThread(); renderChatList();
      setTimeout(function () { var m = activeChat.msgs[activeChat.msgs.length - 1]; if (m.dir === 'out') m.tick = 2; renderThread(false); }, 900);
      setTimeout(function () {
        activeChat.msgs.push({ dir: 'in', text: 'Got it, thanks! I will get back to you shortly.', time: t });
        renderThread(); renderChatList();
      }, 1800);
    }
    $('#chat-send').addEventListener('click', sendChat);
    $('#chat-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') sendChat(); });

    /* slash commands — type / to insert a saved quick reply (mirrors quick-replies.html) */
    var slashMenu = $('#chat-slash-menu');
    if (slashMenu) {
      var SLASH = [
        { s: '/price', t: 'Pricing Details', m: 'Hi {{name}}, thanks for your interest! Our plans start at ₹1,499/month. Full pricing: rmservices.com/pricing' },
        { s: '/demo', t: 'Book a Demo', m: 'We would love to walk you through the platform. Pick a slot here: rmservices.com/demo — takes about 20 minutes.' },
        { s: '/hours', t: 'Business Hours', m: 'Our team is available Mon–Sat, 10 AM to 7 PM IST. Leave a message and we will reply first thing next working day.' },
        { s: '/support', t: 'Support Handoff', m: 'I am looping in our support specialist to resolve this quickly. You will hear back within 2 working hours.' },
        { s: '/payment', t: 'Payment Link', m: 'Here is your secure payment link: pay.rmservices.com/{{order_id}} — valid for 24 hours. UPI, cards and netbanking accepted.' },
        { s: '/welcome', t: 'Welcome Message', m: 'Welcome aboard, {{name}}! Your workspace is ready. Here is a 3-minute setup guide to get your first campaign live.' },
        { s: '/docs', t: 'API Documentation', m: 'You can find our full API reference at docs.rmservices.com — including WhatsApp Cloud API examples in PHP and Node.' },
        { s: '/thanks', t: 'Thank You', m: 'Thank you for choosing RM Services! If anything comes up, just reply to this chat — we are always here.' }
      ];
      function slashClose() { slashMenu.classList.add('hidden'); }
      function slashPick(item) {
        var inp = $('#chat-input');
        inp.value = inp.value.replace(/\/(\w*)$/, item.m);
        slashClose();
        inp.focus();
      }
      $('#chat-input').addEventListener('input', function () {
        var m = this.value.match(/\/(\w*)$/);
        if (!m) { slashClose(); return; }
        var q = m[1].toLowerCase();
        var hits = SLASH.filter(function (r) { return r.s.indexOf('/' + q) === 0 || r.t.toLowerCase().indexOf(q) > -1; });
        if (!hits.length) { slashClose(); return; }
        slashMenu.innerHTML = '<p class="px-4 pt-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Quick Replies</p>' + hits.map(function (r, i) {
          return '<button data-slash="' + i + '" class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">' +
            '<code class="px-2 py-0.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-emerald-400 text-[10px] font-bold flex-none">' + r.s + '</code>' +
            '<span class="flex-1 min-w-0"><span class="block text-xs font-extrabold text-slate-800 dark:text-slate-100">' + r.t + '</span>' +
            '<span class="block text-[11px] text-slate-400 truncate">' + escH(r.m) + '</span></span></button>';
        }).join('');
        slashMenu.classList.remove('hidden');
        $$('[data-slash]', slashMenu).forEach(function (b) {
          b.addEventListener('click', function () { slashPick(hits[+b.dataset.slash]); });
        });
      });
      $('#chat-input').addEventListener('keydown', function (e) { if (e.key === 'Escape') slashClose(); });
      $('#chat-input').addEventListener('blur', function () { setTimeout(slashClose, 150); });
    }
    renderChatList(); renderThread(false);
  }

  /* ================= WHATSAPP TEMPLATE BUILDER ================= */
  if ($('#tpl-body')) {
    var buttons = [];
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function highlightVars(s) { return esc(s).replace(/\{\{(\d+)\}\}/g, '<span class="px-1 rounded bg-primary-500/15 text-primary-600 dark:text-primary-300 font-bold">{{$1}}</span>').replace(/\n/g, '<br>'); }

    function renderPreview() {
      var name = $('#tpl-name').value || 'template_name';
      $('#pv-name').textContent = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      $('#pv-category').textContent = $('#tpl-category').value;
      var ht = $('#tpl-header-type').value;
      var head = '';
      if (ht === 'text') head = '<p class="font-bold text-[13px] text-slate-800 dark:text-slate-100 mb-1">' + highlightVars($('#tpl-header-text').value || 'Header text') + '</p>';
      if (ht === 'image') head = '<div class="h-24 rounded-lg mb-2 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">IMAGE HEADER</div>';
      if (ht === 'video') head = '<div class="h-24 rounded-lg mb-2 bg-slate-700 flex items-center justify-center text-white text-xs font-bold">▶ VIDEO HEADER</div>';
      if (ht === 'document') head = '<div class="rounded-lg mb-2 bg-slate-200 dark:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-200">📄 Document.pdf</div>';
      $('#tpl-header-text-wrap').classList.toggle('hidden', ht !== 'text');

      var body = $('#tpl-body').value || 'Your message body goes here…';
      var foot = $('#tpl-footer').value;
      var btns = buttons.map(function (b) {
        var icon = b.type === 'url' ? '↗' : (b.type === 'phone' ? '📞' : '');
        return '<div class="border-t border-slate-200/70 dark:border-slate-600/50 py-2 text-center text-[13px] font-semibold text-sky-500">' + icon + ' ' + esc(b.text) + '</div>';
      }).join('');
      $('#pv-bubble').innerHTML = head +
        '<p class="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">' + highlightVars(body) + '</p>' +
        (foot ? '<p class="text-[11px] text-slate-400 mt-1.5">' + esc(foot) + '</p>' : '') +
        '<p class="text-[10px] text-slate-400 text-right mt-1">10:42 ✓✓</p>';
      $('#pv-buttons').innerHTML = btns;
      $('#pv-buttons-wrap').classList.toggle('hidden', buttons.length === 0);
      $('#tpl-body-count').textContent = $('#tpl-body').value.length + ' / 1024';
      renderButtonList();
    }

    function renderButtonList() {
      $('#tpl-btn-list').innerHTML = buttons.map(function (b, i) {
        var lbl = b.type === 'url' ? 'CTA · URL' : (b.type === 'phone' ? 'CTA · Phone' : 'Quick Reply');
        return '<div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"><span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">' + lbl + '</span><span class="text-sm font-semibold text-slate-700 dark:text-slate-200 flex-1 truncate">' + esc(b.text) + '</span><button data-btn-del="' + i + '" class="text-slate-400 hover:text-red-500 transition-colors"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div>';
      }).join('');
      $$('[data-btn-del]').forEach(function (d) { d.addEventListener('click', function () { buttons.splice(+d.dataset.btnDel, 1); renderPreview(); }); });
    }

    $('#tpl-add-btn').addEventListener('click', function () {
      var txt = $('#tpl-btn-text').value.trim();
      if (!txt) { RM.toast('Enter button text first', 'warn'); return; }
      if (buttons.length >= 3) { RM.toast('Meta allows max 3 buttons', 'error'); return; }
      buttons.push({ type: $('#tpl-btn-type').value, text: txt });
      $('#tpl-btn-text').value = '';
      renderPreview();
    });
    ['tpl-name', 'tpl-category', 'tpl-header-type', 'tpl-header-text', 'tpl-body', 'tpl-footer'].forEach(function (id) {
      $('#' + id).addEventListener('input', renderPreview);
      $('#' + id).addEventListener('change', renderPreview);
    });
    $('#tpl-submit').addEventListener('click', function () { RM.toast('Template submitted to Meta for review (demo)'); });
    renderPreview();
  }

  /* ================= GALLERY PAGE ================= */
  if ($('#gallery-grid')) {
    var galleryItems = [
      { src: 'assets/img/gallery-1.svg', title: 'Mountain Campaign', cat: 'banners', size: '1.2 MB' },
      { src: 'assets/img/gallery-2.svg', title: 'City Skyline', cat: 'blog', size: '980 KB' },
      { src: 'assets/img/gallery-3.svg', title: 'Ocean Waves', cat: 'banners', size: '1.1 MB' },
      { src: 'assets/img/gallery-4.svg', title: 'Product Box', cat: 'products', size: '860 KB' },
      { src: 'assets/img/gallery-5.svg', title: 'Abstract Orbs', cat: 'blog', size: '1.4 MB' },
      { src: 'assets/img/gallery-6.svg', title: 'Desert Sunset', cat: 'products', size: '920 KB' },
      { src: 'assets/img/gallery-7.svg', title: 'Botanical', cat: 'blog', size: '1.0 MB' },
      { src: 'assets/img/gallery-8.svg', title: 'Geometry', cat: 'banners', size: '780 KB' }
    ];
    var galleryFilter = 'all';
    var deleteIdx = -1;

    function renderGallery() {
      var items = galleryItems.filter(function (g) { return galleryFilter === 'all' || g.cat === galleryFilter; });
      $('#gallery-grid').innerHTML = items.map(function (g) {
        var i = galleryItems.indexOf(g);
        return '<div class="rm-fade-up group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-surface shadow-soft rm-card-hover">' +
          '<img src="' + g.src + '" alt="' + g.title + '" class="w-full h-44 object-cover">' +
          '<div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/45 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">' +
          '<button class="p-2.5 rounded-xl bg-white/95 text-slate-700 hover:scale-110 transition-transform" onclick="RM.toast(\'Preview (demo)\')" title="View"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>' +
          '<button data-gallery-del="' + i + '" class="p-2.5 rounded-xl bg-red-500 text-white hover:scale-110 transition-transform" title="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div>' +
          '<div class="p-3.5"><p class="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">' + g.title + '</p><p class="text-xs text-slate-400 capitalize">' + g.cat + ' · ' + g.size + '</p></div></div>';
      }).join('') || '<p class="col-span-full text-center text-slate-400 py-16 text-sm font-medium">No media in this category yet.</p>';
      $$('[data-gallery-del]').forEach(function (b) {
        b.addEventListener('click', function () {
          deleteIdx = +b.dataset.galleryDel;
          $('#delete-name').textContent = galleryItems[deleteIdx].title;
          RM.openModal('gallery-delete-modal');
        });
      });
      $('#gallery-count').textContent = items.length + ' files';
    }
    $$('[data-gallery-filter]').forEach(function (t) {
      t.addEventListener('click', function () {
        galleryFilter = t.dataset.galleryFilter;
        $$('[data-gallery-filter]').forEach(function (x) {
          var on = x === t;
          x.className = 'px-4 py-2 rounded-xl text-sm font-bold transition-colors ' + (on ? 'bg-primary-500 text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800');
        });
        renderGallery();
      });
    });
    $('#gallery-delete-confirm').addEventListener('click', function () {
      galleryItems.splice(deleteIdx, 1);
      RM.closeModal('gallery-delete-modal');
      renderGallery();
      RM.toast('Media deleted');
    });
    $('#gallery-add-save').addEventListener('click', function () {
      var title = $('#gallery-title').value.trim() || 'Untitled Media';
      var cat = $('#gallery-cat').value;
      var dz = document.querySelector('#gallery-add-modal .rm-dropzone');
      var src = (dz && dz.dataset.uploaded) ? dz.dataset.uploaded : 'assets/img/gallery-5.svg';
      var size = (dz && dz.dataset.uploadedSize) ? dz.dataset.uploadedSize : '1.0 MB';
      galleryItems.unshift({ src: src, title: title, cat: cat, size: size });
      if (dz) { delete dz.dataset.uploaded; delete dz.dataset.uploadedSize; var p = dz.querySelector('.rm-dz-preview'); if (p) p.remove(); }
      $('#gallery-title').value = '';
      RM.closeModal('gallery-add-modal');
      renderGallery();
      RM.toast('Media uploaded to library');
    });
    renderGallery();
  }

  /* ================= BLOG CREATE PAGE ================= */
  if ($('#post-title')) {
    $('#post-title').addEventListener('input', function (e) {
      $('#post-slug').value = e.target.value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-');
      $('#seo-title-count').textContent = e.target.value.length + ' / 60';
    });
    $('#post-content').addEventListener('input', function (e) {
      var words = e.target.value.trim() ? e.target.value.trim().split(/\s+/).length : 0;
      $('#word-count').textContent = words + ' words';
    });
    $('#seo-desc').addEventListener('input', function (e) { $('#seo-desc-count').textContent = e.target.value.length + ' / 160'; });

    $$('[data-md]').forEach(function (b) {
      b.addEventListener('click', function () {
        var ta = $('#post-content');
        var s = ta.selectionStart, en = ta.selectionEnd;
        var sel = ta.value.substring(s, en) || 'text';
        var wrap = { 'bold': ['**', '**'], 'italic': ['_', '_'], 'h2': ['\n## ', ''], 'link': ['[', '](https://)'], 'list': ['\n- ', ''], 'quote': ['\n> ', ''] }[b.dataset.md];
        ta.value = ta.value.substring(0, s) + wrap[0] + sel + wrap[1] + ta.value.substring(en);
        ta.focus();
        ta.dispatchEvent(new Event('input'));
      });
    });

    var tagInput = $('#tag-input');
    if (tagInput) tagInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && tagInput.value.trim()) {
        e.preventDefault();
        var chip = document.createElement('span');
        chip.className = 'rm-pop inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-300 text-xs font-bold';
        chip.innerHTML = tagInput.value.trim() + ' <button class="hover:text-red-500 font-black">×</button>';
        chip.querySelector('button').addEventListener('click', function () { chip.remove(); });
        $('#tag-wrap').insertBefore(chip, tagInput);
        tagInput.value = '';
      }
    });
    $('#post-publish').addEventListener('click', function () { RM.toast('Post published successfully (demo)'); });
    $('#post-draft').addEventListener('click', function () { RM.toast('Draft saved (demo)'); });
  }

  /* ================= BLOG CATEGORIES PAGE ================= */
  if ($('#category-rows')) {
    var cats = [
      { name: 'Marketing', slug: 'marketing', posts: 24, desc: 'Growth, ads and campaign strategies' },
      { name: 'WhatsApp API', slug: 'whatsapp-api', posts: 18, desc: 'Meta Cloud API guides and updates' },
      { name: 'Ecommerce', slug: 'ecommerce', posts: 15, desc: 'Store growth and conversion tips' },
      { name: 'CRM', slug: 'crm', posts: 9, desc: 'Sales pipelines and automation' },
      { name: 'Product Updates', slug: 'product-updates', posts: 12, desc: 'Release notes from RM Services' }
    ];
    var editIdx = -1;
    function renderCats() {
      $('#category-rows').innerHTML = cats.map(function (c, i) {
        return '<tr class="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">' +
          '<td class="px-6 py-4"><p class="font-bold text-sm text-slate-800 dark:text-slate-100">' + c.name + '</p><p class="text-xs text-slate-400">' + c.desc + '</p></td>' +
          '<td class="px-6 py-4 text-sm text-slate-500 font-medium">/' + c.slug + '</td>' +
          '<td class="px-6 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-500/10 text-primary-600 dark:text-primary-300 border border-primary-500/20">' + c.posts + ' posts</span></td>' +
          '<td class="px-6 py-4 text-right whitespace-nowrap">' +
          '<button data-cat-edit="' + i + '" class="p-2 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>' +
          '<button data-cat-del="' + i + '" class="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></td></tr>';
      }).join('');
      $$('[data-cat-edit]').forEach(function (b) { b.addEventListener('click', function () { editIdx = +b.dataset.catEdit; $('#cat-name').value = cats[editIdx].name; $('#cat-desc').value = cats[editIdx].desc; $('#cat-modal-title').textContent = 'Edit Category'; RM.openModal('category-modal'); }); });
      $$('[data-cat-del]').forEach(function (b) { b.addEventListener('click', function () { cats.splice(+b.dataset.catDel, 1); renderCats(); RM.toast('Category deleted'); }); });
    }
    $('#category-add').addEventListener('click', function () { editIdx = -1; $('#cat-name').value = ''; $('#cat-desc').value = ''; $('#cat-modal-title').textContent = 'Add Category'; RM.openModal('category-modal'); });
    $('#cat-save').addEventListener('click', function () {
      var name = $('#cat-name').value.trim();
      if (!name) { RM.toast('Category name is required', 'warn'); return; }
      var obj = { name: name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), posts: 0, desc: $('#cat-desc').value.trim() || '—' };
      if (editIdx > -1) { obj.posts = cats[editIdx].posts; cats[editIdx] = obj; } else cats.unshift(obj);
      RM.closeModal('category-modal'); renderCats(); RM.toast('Category saved');
    });
    renderCats();
  }

  /* ================= SETTINGS TABS ================= */
  if ($('[data-settings-tab]')) {
    $$('[data-settings-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        $$('[data-settings-tab]').forEach(function (t) {
          var on = t === tab;
          t.className = 'px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ' + (on ? 'bg-primary-500 text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800');
        });
        $$('[data-settings-panel]').forEach(function (p) { p.classList.toggle('hidden', p.dataset.settingsPanel !== tab.dataset.settingsTab); });
      });
    });
  }

  /* ---------------- AUTH: inline validation states ---------------- */
  var BRD_N = ['border-slate-200', 'dark:border-slate-700'];
  var BRD_E = ['border-red-400', 'dark:border-red-500'];
  var BRD_O = ['border-emerald-400', 'dark:border-emerald-500'];
  function fieldState(inp, state, msg) {
    if (!inp) return true;
    BRD_N.concat(BRD_E, BRD_O).forEach(function (c) { inp.classList.remove(c); });
    (state === 'error' ? BRD_E : (state === 'ok' ? BRD_O : BRD_N)).forEach(function (c) { inp.classList.add(c); });
    var err = inp.parentElement.querySelector('[data-error]');
    if (err) { if (msg) err.textContent = msg; err.classList.toggle('hidden', state !== 'error'); }
    return state !== 'error';
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function bindLive(inputs) {
    inputs.forEach(function (i) { if (i) i.addEventListener('input', function () { fieldState(i, 'neutral'); }); });
  }

  var loginForm = $('#login-form');
  if (loginForm) {
    var le = $('#email'), lp = $('#password');
    bindLive([le, lp]);
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = fieldState(le, isEmail(le.value.trim()) ? 'ok' : 'error', 'Enter a valid email address');
      ok = fieldState(lp, lp.value.length >= 8 ? 'ok' : 'error', 'Password must be at least 8 characters') && ok;
      if (!ok) { RM.toast('Please fix the highlighted fields', 'error'); return; }
      var ls = $('#login-success'); if (ls) ls.classList.remove('hidden');
      RM.toast('Welcome back to RM Services');
      setTimeout(function () { location.href = 'index.html'; }, 700);
    });
  }

  var regForm = $('#register-form');
  if (regForm) {
    var rn = $('#name'), re = $('#reg-email'), rp = $('#reg-password'), rc = $('#reg-confirm');
    bindLive([rn, re, rp, rc]);
    regForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = fieldState(rn, rn.value.trim().length >= 2 ? 'ok' : 'error', 'Please enter your full name');
      ok = fieldState(re, isEmail(re.value.trim()) ? 'ok' : 'error', 'Enter a valid email address') && ok;
      ok = fieldState(rp, rp.value.length >= 8 ? 'ok' : 'error', 'Password must be at least 8 characters') && ok;
      ok = fieldState(rc, (rc.value === rp.value && rc.value.length >= 8) ? 'ok' : 'error', 'Passwords do not match') && ok;
      if (!ok) { RM.toast('Please fix the highlighted fields', 'error'); return; }
      var rs = $('#register-success'); if (rs) rs.classList.remove('hidden');
      RM.toast('Account created — welcome aboard');
      setTimeout(function () { location.href = 'index.html'; }, 700);
    });
  }

  /* ---------------- MULTI-STEP REGISTRATION WIZARD ---------------- */
  if ($('#ms-form')) {
    var msStep = 0, msPlan = 'Business';
    var msPanels = $$('[data-ms-panel]');
    var DOT_DONE = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold flex-none bg-primary-600 text-white';
    var DOT_ACTIVE = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold flex-none border-2 border-primary-500 text-primary-600 dark:text-primary-400';
    var DOT_TODO = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold flex-none border-2 border-slate-200 dark:border-slate-700 text-slate-400';

    function msShow(n) {
      msStep = n;
      msPanels.forEach(function (p) { p.classList.toggle('hidden', +p.dataset.msPanel !== n); });
      $$('[data-ms-dot]').forEach(function (d) {
        var i = +d.dataset.msDot;
        d.className = i < n ? DOT_DONE : (i === n ? DOT_ACTIVE : DOT_TODO);
        d.textContent = i < n ? '✓' : String(i + 1);
      });
      $('#ms-back').classList.toggle('invisible', n === 0);
      $('#ms-next').textContent = n === msPanels.length - 1 ? 'Create Account' : 'Continue';
    }

    $$('[data-ms-plan]').forEach(function (c) {
      c.addEventListener('click', function () {
        msPlan = c.dataset.msPlan;
        $$('[data-ms-plan]').forEach(function (x) {
          var on = x === c;
          x.classList.toggle('border-primary-500', on);
          x.classList.toggle('bg-primary-500/5', on);
          x.classList.toggle('border-slate-200', !on);
          x.classList.toggle('dark:border-slate-700', !on);
        });
      });
    });

    function msValidate(n) {
      if (n === 0) {
        var ok = fieldState($('#ms-name'), $('#ms-name').value.trim().length >= 2 ? 'ok' : 'error', 'Please enter your full name');
        ok = fieldState($('#ms-email'), isEmail($('#ms-email').value.trim()) ? 'ok' : 'error', 'Enter a valid email address') && ok;
        ok = fieldState($('#ms-password'), $('#ms-password').value.length >= 8 ? 'ok' : 'error', 'Password must be at least 8 characters') && ok;
        return ok;
      }
      if (n === 1) return fieldState($('#ms-company'), $('#ms-company').value.trim() ? 'ok' : 'error', 'Please enter your company name');
      return true;
    }
    bindLive([$('#ms-name'), $('#ms-email'), $('#ms-password'), $('#ms-company')]);

    $('#ms-next').addEventListener('click', function () {
      if (!msValidate(msStep)) { RM.toast('Please fix the highlighted fields', 'error'); return; }
      if (msStep < msPanels.length - 1) { msShow(msStep + 1); return; }
      $('#ms-sum-name').textContent = $('#ms-name').value.trim();
      $('#ms-sum-email').textContent = $('#ms-email').value.trim();
      $('#ms-sum-company').textContent = $('#ms-company').value.trim();
      $('#ms-sum-plan').textContent = msPlan;
      $('#ms-form').classList.add('hidden');
      $('#ms-success').classList.remove('hidden');
      RM.toast('Workspace created — welcome aboard');
    });
    $('#ms-back').addEventListener('click', function () { if (msStep > 0) msShow(msStep - 1); });
    msShow(0);
  }

  /* ---------------- GLOBAL TOPBAR SEARCH ---------------- */
  $$('[data-testid="topbar-search"]').forEach(function (inp) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && inp.value.trim()) location.href = 'search.html?q=' + encodeURIComponent(inp.value.trim());
    });
  });

  /* ---------------- CSV / EXCEL EXPORT HELPER ---------------- */
  function csvQ(s) { return '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"'; }
  function escH(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return escH(s).replace(/"/g, '&quot;'); }
  function downloadCSV(filename, header, rows) {
    var csv = '﻿' + header + '\n' + rows.join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 150);
  }

  /* ---------------- FORGOT PASSWORD ---------------- */
  var forgotForm = $('#forgot-form');
  if (forgotForm) forgotForm.addEventListener('submit', function (e) {
    e.preventDefault();
    forgotForm.classList.add('hidden');
    var fs = $('#forgot-success');
    if (fs) fs.classList.remove('hidden');
    RM.toast('Reset link sent to your email (demo)');
  });

  /* ---------------- OTP LOGIN ---------------- */
  var otpPhoneForm = $('#otp-phone-form');
  if (otpPhoneForm) {
    otpPhoneForm.addEventListener('submit', function (e) {
      e.preventDefault();
      $('#otp-step-phone').textContent = $('#otp-phone').value.trim() || '+91 98765 43210';
      otpPhoneForm.classList.add('hidden');
      $('#otp-verify-step').classList.remove('hidden');
      var first = $('.otp-box');
      if (first) first.focus();
    });
    $$('.otp-box').forEach(function (box, i, boxes) {
      box.addEventListener('input', function () {
        box.value = box.value.replace(/\D/g, '').slice(0, 1);
        if (box.value && boxes[i + 1]) boxes[i + 1].focus();
      });
      box.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !box.value && boxes[i - 1]) boxes[i - 1].focus();
      });
      box.addEventListener('paste', function (e) {
        e.preventDefault();
        var d = (e.clipboardData.getData('text') || '').replace(/\D/g, '');
        d.split('').slice(0, boxes.length).forEach(function (ch, j) { boxes[j].value = ch; });
        var last = boxes[Math.min(Math.max(d.length, 1), boxes.length) - 1];
        if (last) last.focus();
      });
    });
    $('#otp-verify-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var code = $$('.otp-box').map(function (b) { return b.value; }).join('');
      if (code.length < 6) { RM.toast('Enter the full 6-digit code', 'warn'); return; }
      RM.toast('Verified — welcome to RM Services');
      setTimeout(function () { location.href = 'index.html'; }, 700);
    });
    $('#otp-resend').addEventListener('click', function (e) { e.preventDefault(); RM.toast('New OTP sent (demo)'); });
    $('#otp-back').addEventListener('click', function (e) {
      e.preventDefault();
      $('#otp-verify-step').classList.add('hidden');
      otpPhoneForm.classList.remove('hidden');
    });
  }

  /* ---------------- REAL FILE UPLOAD DROPZONES ---------------- */
  $$('.rm-dropzone').forEach(function (dz) {
    dz.removeAttribute('onclick');
    var fi = document.createElement('input');
    fi.type = 'file';
    fi.accept = 'image/*';
    fi.className = 'hidden';
    dz.appendChild(fi);
    dz.addEventListener('click', function () { fi.click(); });
    fi.addEventListener('click', function (e) { e.stopPropagation(); });
    fi.addEventListener('change', function () {
      var f = fi.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        dz.dataset.uploaded = ev.target.result;
        dz.dataset.uploadedSize = f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' MB' : Math.round(f.size / 1024) + ' KB';
        var prev = dz.querySelector('.rm-dz-preview');
        if (prev) prev.remove();
        var img = document.createElement('img');
        img.src = ev.target.result;
        img.alt = f.name;
        img.className = 'rm-dz-preview w-full h-32 object-cover rounded-xl mb-3';
        dz.insertBefore(img, dz.firstChild);
        var p = dz.querySelector('.rm-dz-label');
        if (p) p.innerHTML = '<span class="text-emerald-500 font-bold">✓ ' + f.name + '</span> — click to replace';
        RM.toast('Image ready: ' + f.name);
      };
      reader.readAsDataURL(f);
    });
  });

  /* ---------------- BROADCAST COMPOSER ---------------- */
  if ($('#broadcast-segments')) {
    var SEGMENTS = { all: 32480, premium: 4120, cart: 1140, inactive: 6830 };
    var TPLS = {
      festive_offer: { title: 'Festive Sale is Live!', body: 'Hi {{1}}, our biggest festive sale is now live! Get flat {{2}} off on all annual plans. Offer valid till Sunday only.', footer: 'Reply STOP to unsubscribe' },
      order_confirmation: { title: 'Order Confirmed', body: 'Hi {{1}}, your order #{{2}} has been confirmed and is being packed. We will share tracking shortly.', footer: 'Thank you for shopping with us' },
      event_invite: { title: 'You are Invited', body: 'Hi {{1}}, join our live masterclass on {{2}}. Limited seats — reserve yours now.', footer: '' }
    };
    function escB(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function bcPreview() {
      var t = TPLS[$('#bc-template').value];
      var v1 = $('#bc-var1').value || 'Customer';
      var v2 = $('#bc-var2').value || '25%';
      var body = escB(t.body)
        .replace(/\{\{1\}\}/g, '<span class="font-bold text-primary-600 dark:text-primary-300">' + escB(v1) + '</span>')
        .replace(/\{\{2\}\}/g, '<span class="font-bold text-primary-600 dark:text-primary-300">' + escB(v2) + '</span>');
      $('#bc-pv-bubble').innerHTML = '<p class="font-bold text-[13px] text-slate-800 dark:text-slate-100 mb-1">' + escB(t.title) + '</p>' +
        '<p class="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">' + body + '</p>' +
        (t.footer ? '<p class="text-[11px] text-slate-400 mt-1.5">' + escB(t.footer) + '</p>' : '') +
        '<p class="text-[10px] text-slate-400 text-right mt-1">10:42 ✓✓</p>';
      $('#bc-sum-tpl').textContent = $('#bc-template').value;
    }
    function bcTotals() {
      var total = 0;
      $$('[data-segment]').forEach(function (c) {
        var card = c.closest('[data-segment-card]');
        if (c.checked) total += SEGMENTS[c.dataset.segment];
        card.classList.toggle('border-primary-500', c.checked);
        card.classList.toggle('bg-primary-500/5', c.checked);
      });
      $('#bc-total').textContent = total.toLocaleString();
      $('#bc-cost').textContent = '₹' + Math.round(total * 0.99).toLocaleString();
      return total;
    }
    $$('[data-segment]').forEach(function (c) { c.addEventListener('change', bcTotals); });
    ['bc-template', 'bc-var1', 'bc-var2'].forEach(function (id) {
      $('#' + id).addEventListener('input', bcPreview);
      $('#' + id).addEventListener('change', bcPreview);
    });
    $$('input[name="bc-when"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var later = document.querySelector('input[name="bc-when"]:checked').value === 'later';
        $('#bc-schedule-wrap').classList.toggle('hidden', !later);
        $('#bc-sum-when').textContent = later ? 'Scheduled' : 'Send immediately';
      });
    });
    $('#bc-send-btn').addEventListener('click', function () {
      var total = bcTotals();
      if (!total) { RM.toast('Select at least one audience segment', 'warn'); return; }
      var later = document.querySelector('input[name="bc-when"]:checked').value === 'later';
      RM.toast(later ? 'Broadcast scheduled for ' + total.toLocaleString() + ' recipients (demo)' : 'Broadcast queued to ' + total.toLocaleString() + ' recipients (demo)');
    });
    bcPreview();
    bcTotals();
  }

  /* ---------------- TABLES PAGE: real edit modal + real export ---------------- */
  if ($('#data-table-body') && window._rmTable) {
    document.body.insertAdjacentHTML('beforeend',
      '<div id="customer-edit-modal" data-modal class="hidden fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">' +
      '<div class="rm-pop w-full max-w-md bg-surface rounded-2xl border border-slate-200 dark:border-slate-700 shadow-pop p-6" data-testid="customer-edit-modal">' +
      '<div class="flex items-center justify-between mb-5"><h3 class="font-extrabold text-lg text-slate-900 dark:text-white">Edit Customer</h3>' +
      '<button data-te-close class="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>' +
      '<div class="space-y-4">' +
      '<div><label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Name</label><input id="te-name" class="w-full bg-slate-100/70 dark:bg-slate-800/60 border border-transparent focus:border-primary-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"/></div>' +
      '<div><label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email</label><input id="te-email" class="w-full bg-slate-100/70 dark:bg-slate-800/60 border border-transparent focus:border-primary-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"/></div>' +
      '<div class="grid grid-cols-2 gap-3">' +
      '<div><label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Plan</label><select id="te-plan" class="w-full bg-slate-100/70 dark:bg-slate-800/60 border border-transparent rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none cursor-pointer"><option>Starter</option><option>Business</option><option>Enterprise</option></select></div>' +
      '<div><label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Status</label><select id="te-status" class="w-full bg-slate-100/70 dark:bg-slate-800/60 border border-transparent rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none cursor-pointer"><option>Active</option><option>Pending</option><option>Suspended</option></select></div>' +
      '</div></div>' +
      '<div class="flex gap-3 mt-6"><button id="te-save" data-testid="te-save-btn" class="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl py-3 text-sm shadow-soft transition-colors">Save Changes</button>' +
      '<button data-te-close class="px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button></div>' +
      '</div></div>');
    var teModal = $('#customer-edit-modal');
    teModal.addEventListener('click', function (e) { if (e.target === teModal || e.target.closest('[data-te-close]')) teModal.classList.add('hidden'); });
    var editId = null;
    $('#data-table-body').addEventListener('click', function (e) {
      var b = e.target.closest('[data-row-edit]');
      if (!b) return;
      editId = +b.dataset.rowEdit;
      var r = window._rmTable.data.find(function (x) { return x.id === editId; });
      if (!r) return;
      $('#te-name').value = r.name;
      $('#te-email').value = r.email;
      $('#te-plan').value = r.plan;
      $('#te-status').value = r.status;
      RM.openModal('customer-edit-modal');
    });
    $('#te-save').addEventListener('click', function () {
      var r = window._rmTable.data.find(function (x) { return x.id === editId; });
      if (!r) return;
      r.name = $('#te-name').value.trim() || r.name;
      r.email = $('#te-email').value.trim() || r.email;
      r.plan = $('#te-plan').value;
      r.status = $('#te-status').value;
      RM.closeModal('customer-edit-modal');
      window._rmTable.render();
      RM.toast('Customer updated');
    });
    var expBtn = $('[data-testid="table-export-btn"]');
    if (expBtn) {
      expBtn.removeAttribute('data-demo-toast');
      expBtn.addEventListener('click', function () {
        var rows = window._rmTable.filtered();
        downloadCSV('customers-export.csv', 'ID,Name,Email,Company,Plan,Status,Spend,Joined',
          rows.map(function (r) { return [r.id, csvQ(r.name), csvQ(r.email), csvQ(r.company), r.plan, r.status, r.amount, r.date].join(','); }));
        RM.toast('Exported ' + rows.length + ' customers — opens in Excel');
      });
    }
  }

  /* ================= INQUIRIES PAGE =================
     Rows are STATIC HTML — replace with your Laravel @foreach loop.
     JS only adds search/filter/modals/export on top of the markup. */
  if ($('#inq-body')) {
    var IQ_ST = { 'New': 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20', 'Responded': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', 'Closed': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };

    function inqApply() {
      var q = ($('#inq-search').value || '').toLowerCase();
      var src = $('#inq-source').value;
      var st = $('#inq-status').value;
      var all = $$('[data-inq-row]');
      var visible = 0;
      all.forEach(function (tr) {
        var b = tr.querySelector('[data-inq-view]');
        var ok = (!q || tr.textContent.toLowerCase().indexOf(q) > -1) &&
                 (!src || b.dataset.source === src) && (!st || b.dataset.status === st);
        tr.classList.toggle('hidden', !ok);
        if (ok) visible++;
      });
      $('#inq-count').textContent = 'Showing ' + visible + ' of ' + all.length + ' inquiries';
    }

    $$('[data-inq-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        var d = b.dataset;
        var img = b.closest('[data-inq-row]').querySelector('img');
        $('#iv-avatar').src = img ? img.src : 'assets/img/avatar-1.svg';
        $('#iv-name').textContent = d.name;
        $('#iv-email').textContent = d.email;
        $('#iv-phone').textContent = d.phone;
        $('#iv-source').textContent = d.source;
        $('#iv-subject').textContent = d.subject;
        $('#iv-date').textContent = d.date;
        $('#iv-message').textContent = d.message;
        var st = $('#iv-status');
        st.textContent = d.status;
        st.className = 'px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ' + (IQ_ST[d.status] || '');
        RM.openModal('inquiry-view-modal');
      });
    });

    var inqEditRow = null;
    $$('[data-inq-edit]').forEach(function (b) {
      b.addEventListener('click', function () {
        var d = b.dataset;
        inqEditRow = b.closest('[data-inq-row]');
        $('#ie-name').value = d.name;
        $('#ie-email').value = d.email;
        $('#ie-phone').value = d.phone;
        $('#ie-status').value = d.status;
        $('#ie-notes').value = '';
        RM.openModal('inquiry-edit-modal');
      });
    });
    $('#ie-save').addEventListener('click', function () {
      if (!inqEditRow) return;
      var vb = inqEditRow.querySelector('[data-inq-view]');
      var eb = inqEditRow.querySelector('[data-inq-edit]');
      var name = $('#ie-name').value.trim(), email = $('#ie-email').value.trim(), phone = $('#ie-phone').value.trim(), status = $('#ie-status').value;
      if (name) { inqEditRow.querySelector('.iq-name').textContent = name; vb.dataset.name = name; eb.dataset.name = name; }
      if (email) { inqEditRow.querySelector('.iq-email').textContent = email; vb.dataset.email = email; eb.dataset.email = email; }
      if (phone) { inqEditRow.querySelector('.iq-phone').textContent = phone; vb.dataset.phone = phone; eb.dataset.phone = phone; }
      vb.dataset.status = status; eb.dataset.status = status;
      var badge = inqEditRow.querySelector('.iq-status');
      badge.textContent = status;
      badge.className = 'iq-status px-2.5 py-1 rounded-full text-xs font-bold border ' + (IQ_ST[status] || '');
      RM.closeModal('inquiry-edit-modal');
      RM.toast('Inquiry updated');
    });

    var inqDelRow = null;
    $$('[data-inq-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        inqDelRow = b.closest('[data-inq-row]');
        $('#id-name').textContent = b.dataset.label;
        RM.openModal('inquiry-delete-modal');
      });
    });
    $('#id-confirm').addEventListener('click', function () {
      if (inqDelRow) inqDelRow.remove();
      inqDelRow = null;
      RM.closeModal('inquiry-delete-modal');
      inqApply();
      RM.toast('Inquiry deleted');
    });

    $('#inq-export').addEventListener('click', function () {
      var rows = $$('[data-inq-row]').filter(function (tr) { return !tr.classList.contains('hidden'); });
      downloadCSV('inquiries-export.csv', 'Name,Email,Phone,Source,Subject,Status,Received',
        rows.map(function (tr) {
          var d = tr.querySelector('[data-inq-view]').dataset;
          return [csvQ(d.name), csvQ(d.email), csvQ(d.phone), csvQ(d.source), csvQ(d.subject), d.status, d.date].join(',');
        }));
      RM.toast('Exported ' + rows.length + ' inquiries — opens in Excel');
    });

    $('#inq-search').addEventListener('input', inqApply);
    $('#inq-source').addEventListener('change', inqApply);
    $('#inq-status').addEventListener('change', inqApply);
    inqApply();
  }

  /* ================= GLOBAL SEARCH PAGE ================= */
  if ($('#global-search')) {
    var IDX = {
      'Pages': [
        { t: 'Ecommerce Dashboard', d: 'Revenue, orders, customers & traffic analytics', u: 'index.html' },
        { t: 'CRM Dashboard', d: 'Leads, pipeline, deals & activity', u: 'dashboard-crm.html' },
        { t: 'Marketing Dashboard', d: 'WhatsApp campaigns & delivery health', u: 'dashboard-marketing.html' },
        { t: 'Meta API Dashboard', d: 'Tenants, subscriptions & platform revenue', u: 'meta-dashboard.html' },
        { t: 'Meta Chat', d: 'WhatsApp customer inbox', u: 'chat.html' },
        { t: 'Quick Replies', d: 'Saved chat responses & shortcuts', u: 'quick-replies.html' },
        { t: 'WA Template Builder', d: 'Meta API templates with live phone preview', u: 'whatsapp-templates.html' },
        { t: 'Broadcast Composer', d: 'Audience picker, variables & scheduling', u: 'broadcast.html' },
        { t: 'Customer Inquiries', d: 'Contact & consultation form leads', u: 'inquiries.html' },
        { t: 'Data Tables', d: 'Searchable, sortable, paginated table', u: 'tables.html' },
        { t: 'Kanban Board', d: 'Drag & drop deals pipeline', u: 'kanban.html' },
        { t: 'Calendar', d: 'Campaign & demo schedule, month view', u: 'calendar.html' },
        { t: 'Plans & Subscriptions', d: 'Pricing tiers & active subscriptions', u: 'plans.html' },
        { t: 'Payment History', d: 'Invoices, transactions & refunds', u: 'payments.html' },
        { t: 'Invoice', d: 'Printable invoice document', u: 'invoice.html' },
        { t: 'Staff & Members', d: 'Team roles, invites & permissions', u: 'staff.html' },
        { t: 'Blank Starter', d: 'Empty page + Laravel Blade guide', u: 'starter.html' },
        { t: '404 Error', d: 'Branded page-not-found screen', u: '404.html' },
        { t: 'Maintenance', d: 'Branded scheduled-maintenance screen', u: 'maintenance.html' },
        { t: 'FAQ', d: 'Searchable help accordion', u: 'faq.html' },
        { t: 'Multi-Step Register', d: 'Step-by-step onboarding wizard', u: 'register-multi.html' },
        { t: 'My Profile', d: 'Avatar, activity timeline & security', u: 'profile.html' },
        { t: 'Pricing Page', d: 'Public pricing landing with billing toggle', u: 'pricing.html' },
        { t: 'Notifications', d: 'Notification center with unread states', u: 'notifications.html' },
        { t: 'Changelog', d: 'Release notes & version history', u: 'changelog.html' },
        { t: 'About', d: 'Public about page with team & values', u: 'about.html' },
        { t: 'Contact', d: 'Public contact page with validated form', u: 'contact.html' },
        { t: 'All Posts', d: 'Blog post library', u: 'blog-list.html' },
        { t: 'New Post', d: 'Blog editor with SEO panel', u: 'blog-create.html' },
        { t: 'Categories', d: 'Blog category manager', u: 'blog-categories.html' },
        { t: 'Gallery', d: 'Media library with upload & delete', u: 'gallery.html' },
        { t: 'Settings', d: 'Profile, security, notifications, appearance', u: 'settings.html' },
        { t: 'Login', d: 'Email + password sign in', u: 'login.html' },
        { t: 'Register', d: 'Create a new account', u: 'register.html' },
        { t: 'OTP Login', d: 'Passwordless WhatsApp/SMS sign in', u: 'otp-login.html' },
        { t: 'Forgot Password', d: 'Reset link flow', u: 'forgot-password.html' }
      ],
      'Inquiries': [
        { t: 'Shivam — WhatsApp API info', d: 'Contact Form · I want full information of this WhatsApp API…', u: 'inquiries.html' },
        { t: 'Rahul Guwala — Consultation', d: 'Consultation Form · Need consultation for broadcast strategy…', u: 'inquiries.html' },
        { t: 'Priya Sharma — Pricing question', d: 'Contact Form · Plan pricing for 5 agent seats…', u: 'inquiries.html' },
        { t: 'Amit Gupta — Demo request', d: 'Consultation Form · Looking for a demo of the broadcast composer…', u: 'inquiries.html' }
      ],
      'Customers': [
        { t: 'Riya Sharma', d: 'TechNova · Enterprise · Active', u: 'tables.html' },
        { t: 'Aman Kapoor', d: 'PixelWorks · Business · Active', u: 'tables.html' },
        { t: 'Sara Mathew', d: 'BrightAds · Enterprise · Pending', u: 'tables.html' },
        { t: 'Vivek Tandon', d: 'DataNest · Starter · Active', u: 'tables.html' }
      ],
      'Blog Posts': [
        { t: '10 WhatsApp Business API flows that convert 3x better', d: 'WhatsApp API · Published', u: 'blog-list.html' },
        { t: 'Festive campaign playbook: broadcast timing that works', d: 'Marketing · Published', u: 'blog-list.html' },
        { t: 'Reduce RTO losses with WhatsApp order confirmations', d: 'Ecommerce · Draft', u: 'blog-list.html' },
        { t: 'RM Services v2.1: new template builder & chat inbox', d: 'Product Updates · Scheduled', u: 'blog-list.html' }
      ]
    };
    var gi = $('#global-search');
    function runSearch(q) {
      q = (q || '').trim().toLowerCase();
      var wrap = $('#search-results');
      var empty = $('#search-empty');
      var html = '', total = 0;
      Object.keys(IDX).forEach(function (group) {
        var hits = IDX[group].filter(function (x) { return !q || (x.t + ' ' + x.d).toLowerCase().indexOf(q) > -1; });
        if (!hits.length) return;
        total += hits.length;
        html += '<div class="rm-fade-up"><p class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">' + group + ' · ' + hits.length + '</p>' +
          '<div class="bg-surface rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft divide-y divide-slate-100 dark:divide-slate-800/70 overflow-hidden">' +
          hits.map(function (x) {
            return '<a href="' + x.u + '" class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">' +
              '<span class="w-10 h-10 flex-none rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7 7 17"/><path d="M7 7h10v10"/></svg></span>' +
              '<span class="flex-1 min-w-0"><span class="block text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">' + x.t + '</span><span class="block text-xs text-slate-400 truncate">' + x.d + '</span></span>' +
              '<span class="text-slate-300 dark:text-slate-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all font-bold">→</span></a>';
          }).join('') + '</div></div>';
      });
      wrap.innerHTML = html;
      empty.classList.toggle('hidden', total > 0);
      wrap.classList.toggle('hidden', total === 0);
    }
    gi.addEventListener('input', function () {
      history.replaceState(null, '', 'search.html' + (gi.value.trim() ? '?q=' + encodeURIComponent(gi.value.trim()) : ''));
      runSearch(gi.value);
    });
    $$('[data-search-chip]').forEach(function (c) {
      c.addEventListener('click', function () { gi.value = c.dataset.searchChip; gi.focus(); runSearch(gi.value); });
    });
    var q0 = new URLSearchParams(location.search).get('q') || '';
    if (q0) gi.value = q0;
    runSearch(q0);
  }

  /* ================= QUICK REPLIES PAGE =================
     Rows are STATIC HTML — replace with your Laravel @foreach loop.
     JS only adds search/filter/modals/copy/export on top of the markup. */
  if ($('#qr-body')) {
    var QR_CAT = { 'Sales': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', 'Support': 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20', 'Onboarding': 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20', 'General': 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20' };

    function qrApply() {
      var q = ($('#qr-search').value || '').toLowerCase();
      var cat = $('#qr-category').value;
      var all = $$('[data-qr-row]');
      var visible = 0;
      all.forEach(function (tr) {
        var ok = (!q || tr.textContent.toLowerCase().indexOf(q) > -1) &&
                 (!cat || tr.querySelector('.qr-cat').textContent.trim() === cat);
        tr.classList.toggle('hidden', !ok);
        if (ok) visible++;
      });
      $('#qr-count').textContent = 'Showing ' + visible + ' of ' + all.length + ' replies';
      var st = $('#qr-stat-total');
      if (st) st.textContent = all.length;
    }

    function qrRowHtml(d) {
      return '<tr data-qr-row class="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="px-5 py-4"><code class="qr-shortcut px-2 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-emerald-400 text-xs font-bold">' + escH(d.shortcut) + '</code></td>' +
        '<td class="px-5 py-4"><p class="qr-title text-sm font-bold text-slate-800 dark:text-slate-100">' + escH(d.title) + '</p></td>' +
        '<td class="px-5 py-4 max-w-[320px]"><p class="qr-message text-sm text-slate-500 dark:text-slate-400 truncate">' + escH(d.message) + '</p></td>' +
        '<td class="px-5 py-4"><span class="qr-cat px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ' + (QR_CAT[d.category] || '') + '">' + d.category + '</span></td>' +
        '<td class="px-5 py-4"><span class="qr-uses text-sm font-bold text-slate-700 dark:text-slate-200">' + d.uses + '</span></td>' +
        '<td class="px-5 py-4 text-right whitespace-nowrap">' +
        '<button data-qr-copy title="Copy message" class="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>' +
        '<button data-qr-edit data-shortcut="' + escA(d.shortcut) + '" data-title="' + escA(d.title) + '" data-category="' + d.category + '" data-message="' + escA(d.message) + '" title="Edit" class="p-2 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>' +
        '<button data-qr-del data-label="' + escA(d.shortcut) + '" title="Delete" class="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></td></tr>';
    }

    var qrEditRow = null, qrDelRow = null;
    $('#qr-body').addEventListener('click', function (e) {
      var copy = e.target.closest('[data-qr-copy]');
      if (copy) {
        var msg = copy.closest('[data-qr-row]').querySelector('.qr-message').textContent;
        if (navigator.clipboard) navigator.clipboard.writeText(msg);
        RM.toast('Message copied to clipboard');
        return;
      }
      var ed = e.target.closest('[data-qr-edit]');
      if (ed) {
        qrEditRow = ed.closest('[data-qr-row]');
        $('#qe-title-label').textContent = ed.dataset.shortcut;
        $('#qe-shortcut').value = ed.dataset.shortcut;
        $('#qe-title').value = ed.dataset.title;
        $('#qe-category').value = ed.dataset.category;
        $('#qe-message').value = ed.dataset.message;
        RM.openModal('qr-edit-modal');
        return;
      }
      var del = e.target.closest('[data-qr-del]');
      if (del) {
        qrDelRow = del.closest('[data-qr-row]');
        $('#qd-name').textContent = del.dataset.label;
        RM.openModal('qr-delete-modal');
      }
    });

    $('#qe-save').addEventListener('click', function () {
      if (!qrEditRow) return;
      var sc = $('#qe-shortcut').value.trim(), ti = $('#qe-title').value.trim(), ca = $('#qe-category').value, me = $('#qe-message').value.trim();
      if (sc) { if (sc[0] !== '/') sc = '/' + sc; qrEditRow.querySelector('.qr-shortcut').textContent = sc; }
      if (ti) qrEditRow.querySelector('.qr-title').textContent = ti;
      if (me) qrEditRow.querySelector('.qr-message').textContent = me;
      var badge = qrEditRow.querySelector('.qr-cat');
      badge.textContent = ca;
      badge.className = 'qr-cat px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ' + (QR_CAT[ca] || '');
      var eb = qrEditRow.querySelector('[data-qr-edit]');
      eb.dataset.shortcut = sc; eb.dataset.title = ti; eb.dataset.category = ca; eb.dataset.message = me;
      RM.closeModal('qr-edit-modal');
      RM.toast('Quick reply updated');
    });

    $('#qa-save').addEventListener('click', function () {
      var sc = $('#qa-shortcut').value.trim(), ti = $('#qa-title').value.trim(), ca = $('#qa-category').value, me = $('#qa-message').value.trim();
      if (!sc || !me) { RM.toast('Shortcut and message are required', 'warn'); return; }
      if (sc[0] !== '/') sc = '/' + sc;
      $('#qr-body').insertAdjacentHTML('afterbegin', qrRowHtml({ shortcut: sc, title: ti || 'Untitled Reply', category: ca, message: me, uses: 0 }));
      $('#qa-shortcut').value = ''; $('#qa-title').value = ''; $('#qa-message').value = '';
      RM.closeModal('qr-add-modal');
      qrApply();
      RM.toast('Quick reply created');
    });

    $('#qd-confirm').addEventListener('click', function () {
      if (qrDelRow) qrDelRow.remove();
      qrDelRow = null;
      RM.closeModal('qr-delete-modal');
      qrApply();
      RM.toast('Quick reply deleted');
    });

    $('#qr-export').addEventListener('click', function () {
      var rows = $$('[data-qr-row]').filter(function (tr) { return !tr.classList.contains('hidden'); });
      downloadCSV('quick-replies-export.csv', 'Shortcut,Title,Category,Message,Uses',
        rows.map(function (tr) {
          var eb = tr.querySelector('[data-qr-edit]');
          return [csvQ(eb.dataset.shortcut), csvQ(eb.dataset.title), eb.dataset.category, csvQ(eb.dataset.message), tr.querySelector('.qr-uses').textContent.trim()].join(',');
        }));
      RM.toast('Exported ' + rows.length + ' replies — opens in Excel');
    });

    $('#qr-search').addEventListener('input', qrApply);
    $('#qr-category').addEventListener('change', qrApply);
    qrApply();
  }

  /* ================= STAFF PAGE =================
     Rows are STATIC HTML — replace with your Laravel @foreach loop. */
  if ($('#staff-body')) {
    var ST_ROLE = { 'Super Admin': 'bg-slate-900 text-white dark:bg-white dark:text-slate-900', 'Admin': 'bg-primary-500/10 text-primary-600 dark:text-primary-300 border border-primary-500/20', 'Agent': 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20', 'Viewer': 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20' };
    var ST_STATUS = { 'Active': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', 'Invited': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', 'Suspended': 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20' };
    var stEditRow = null, stDelRow = null;

    function staffCount() { var el = $('#staff-stat-total'); if (el) el.textContent = $$('[data-staff-row]').length; }

    function staffRowHtml(d) {
      return '<tr data-staff-row class="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="px-6 py-4"><div class="flex items-center gap-3"><img src="assets/img/avatar-3.svg" class="w-9 h-9 rounded-full" alt=""/><div><p class="sf-name text-sm font-bold text-slate-800 dark:text-slate-100">' + escH(d.name) + '</p><p class="sf-email text-xs text-slate-400">' + escH(d.email) + '</p></div></div></td>' +
        '<td class="px-6 py-4"><span class="sf-role px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ' + (ST_ROLE[d.role] || '') + '">' + d.role + '</span></td>' +
        '<td class="px-6 py-4"><span class="sf-perms text-xs font-semibold text-slate-500">Default permissions</span></td>' +
        '<td class="px-6 py-4"><span class="sf-status px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ' + ST_STATUS['Invited'] + '">Invited</span></td>' +
        '<td class="px-6 py-4 text-right whitespace-nowrap">' +
        '<button data-staff-edit data-name="' + escA(d.name) + '" data-email="' + escA(d.email) + '" data-role="' + d.role + '" data-status="Invited" title="Edit" class="p-2 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>' +
        '<button data-staff-del data-label="' + escA(d.name) + '" title="Remove" class="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></td></tr>';
    }

    $('#staff-body').addEventListener('click', function (e) {
      var ed = e.target.closest('[data-staff-edit]');
      if (ed) {
        stEditRow = ed.closest('[data-staff-row]');
        $('#se-title').textContent = ed.dataset.name;
        $('#se-role').value = ed.dataset.role;
        $('#se-status').value = ed.dataset.status;
        RM.openModal('staff-edit-modal');
        return;
      }
      var del = e.target.closest('[data-staff-del]');
      if (del) {
        stDelRow = del.closest('[data-staff-row]');
        $('#sd-name').textContent = del.dataset.label;
        RM.openModal('staff-delete-modal');
      }
    });

    $('#se-save').addEventListener('click', function () {
      if (!stEditRow) return;
      var role = $('#se-role').value, status = $('#se-status').value;
      var rb = stEditRow.querySelector('.sf-role');
      rb.textContent = role;
      rb.className = 'sf-role px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ' + (ST_ROLE[role] || '');
      var sb = stEditRow.querySelector('.sf-status');
      sb.textContent = status;
      sb.className = 'sf-status px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ' + (ST_STATUS[status] || '');
      var eb = stEditRow.querySelector('[data-staff-edit]');
      if (eb) { eb.dataset.role = role; eb.dataset.status = status; }
      RM.closeModal('staff-edit-modal');
      RM.toast('Member updated');
    });

    $('#sd-confirm').addEventListener('click', function () {
      if (stDelRow) stDelRow.remove();
      stDelRow = null;
      RM.closeModal('staff-delete-modal');
      staffCount();
      RM.toast('Member removed');
    });

    $('#si-save').addEventListener('click', function () {
      var name = $('#si-name').value.trim(), email = $('#si-email').value.trim(), role = $('#si-role').value;
      if (!name || !email) { RM.toast('Name and email are required', 'warn'); return; }
      $('#staff-body').insertAdjacentHTML('afterbegin', staffRowHtml({ name: name, email: email, role: role }));
      $('#si-name').value = ''; $('#si-email').value = '';
      RM.closeModal('staff-invite-modal');
      staffCount();
      RM.toast('Invite sent to ' + email + ' (demo)');
    });
  }

  /* ================= KANBAN BOARD =================
     Cards are STATIC HTML — replace with your Laravel @foreach loop.
     JS only adds drag & drop between columns + live counts/totals. */
  if ($('[data-kb-col]')) {
    var kbDrag = null;

    function kbUpdate() {
      $$('[data-kb-col]').forEach(function (col) {
        var cards = $$('[data-kb-card]', col);
        var total = 0;
        cards.forEach(function (c) { total += parseInt(c.dataset.amount, 10) || 0; });
        col.querySelector('.kb-count').textContent = cards.length;
        col.querySelector('.kb-total').textContent = '₹' + total.toLocaleString('en-IN');
      });
    }

    document.addEventListener('dragstart', function (e) {
      var card = e.target.closest && e.target.closest('[data-kb-card]');
      if (card) { kbDrag = card; card.classList.add('opacity-40'); }
    });
    document.addEventListener('dragend', function () {
      if (kbDrag) kbDrag.classList.remove('opacity-40');
      kbDrag = null;
      $$('[data-kb-list]').forEach(function (l) { l.classList.remove('ring-2', 'ring-primary-400', 'ring-offset-2', 'dark:ring-primary-500'); });
    });

    $$('[data-kb-list]').forEach(function (list) {
      list.addEventListener('dragover', function (e) {
        e.preventDefault();
        list.classList.add('ring-2', 'ring-primary-400', 'ring-offset-2', 'dark:ring-primary-500');
      });
      list.addEventListener('dragleave', function () { list.classList.remove('ring-2', 'ring-primary-400', 'ring-offset-2', 'dark:ring-primary-500'); });
      list.addEventListener('drop', function (e) {
        e.preventDefault();
        list.classList.remove('ring-2', 'ring-primary-400', 'ring-offset-2', 'dark:ring-primary-500');
        if (kbDrag && kbDrag.parentNode !== list) {
          list.appendChild(kbDrag);
          RM.toast('Deal moved to ' + list.closest('[data-kb-col]').querySelector('.uppercase.tracking-widest').textContent.trim().replace(/\s+\d+$/, ''));
        }
        if (kbDrag) kbDrag.classList.remove('opacity-40');
        kbDrag = null;
        kbUpdate();
      });
    });

    $('#kb-save').addEventListener('click', function () {
      var name = $('#kb-name').value.trim(), company = $('#kb-company').value.trim(), amount = parseInt($('#kb-amount').value, 10) || 0;
      if (!name || !amount) { RM.toast('Deal name and value are required', 'warn'); return; }
      var col = $$('[data-kb-col]')[parseInt($('#kb-stage').value, 10)] || $$('[data-kb-col]')[0];
      col.querySelector('[data-kb-list]').insertAdjacentHTML('afterbegin',
        '<div data-kb-card data-amount="' + amount + '" draggable="true" class="rm-pop bg-surface rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 shadow-soft cursor-grab active:cursor-grabbing hover:border-primary-400 dark:hover:border-primary-500 transition-colors">' +
        '<div class="flex items-center justify-between mb-2"><span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-primary-500/10 text-primary-600 dark:text-primary-300">New</span></div>' +
        '<p class="text-sm font-extrabold text-slate-800 dark:text-slate-100">' + escH(name) + '</p>' +
        '<p class="text-xs text-slate-400 mb-3">' + escH(company || '—') + '</p>' +
        '<div class="flex items-center justify-between"><img src="assets/img/avatar-5.svg" class="w-6 h-6 rounded-full" alt=""/><span class="text-sm font-extrabold text-primary-600 dark:text-primary-400">₹' + amount.toLocaleString('en-IN') + '</span></div></div>');
      $('#kb-name').value = ''; $('#kb-company').value = ''; $('#kb-amount').value = '';
      RM.closeModal('kb-add-modal');
      kbUpdate();
      RM.toast('Deal added to pipeline');
    });

    kbUpdate();
  }

  /* ================= CALENDAR PAGE =================
     Cells & events are STATIC HTML — render with your Laravel month loop. */
  if ($('#cal-grid')) {
    var CAL_TYPE = { 'Campaign': 'bg-primary-500/10 text-primary-600 dark:text-primary-300', 'Demo': 'bg-violet-500/10 text-violet-600 dark:text-violet-400', 'Billing': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', 'Review': 'bg-amber-500/10 text-amber-600 dark:text-amber-400' };
    var CAL_DOT = { 'Campaign': 'bg-primary-500', 'Demo': 'bg-violet-500', 'Billing': 'bg-emerald-500', 'Review': 'bg-amber-500' };

    function calSelect(cell) {
      $$('#cal-grid [data-cal-day]').forEach(function (c) { c.classList.remove('ring-2', 'ring-inset', 'ring-primary-400'); });
      if (!cell) return;
      cell.classList.add('ring-2', 'ring-inset', 'ring-primary-400');
      var d = new Date(cell.dataset.calDay + 'T00:00:00');
      $('#cal-panel-date').textContent = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      var evs = $$('[data-cal-event]', cell);
      $('#cal-panel-empty').classList.toggle('hidden', evs.length > 0);
      $('#cal-panel-events').innerHTML = evs.map(function (ev) {
        return '<div class="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3">' +
          '<span class="w-2.5 h-2.5 rounded-full flex-none ' + (CAL_DOT[ev.dataset.type] || 'bg-slate-400') + '"></span>' +
          '<div class="flex-1 min-w-0"><p class="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">' + escH(ev.dataset.title) + '</p>' +
          '<p class="text-xs text-slate-400">' + escH(ev.dataset.time) + ' · ' + escH(ev.dataset.type) + '</p></div></div>';
      }).join('');
    }

    /* drag events between days (same approach as the kanban board) */
    var calDragEv = null;
    document.addEventListener('dragstart', function (e) {
      var chip = e.target.closest && e.target.closest('[data-cal-event]');
      if (chip) { calDragEv = chip; chip.classList.add('opacity-40'); }
    });
    document.addEventListener('dragend', function () {
      if (calDragEv) calDragEv.classList.remove('opacity-40');
      calDragEv = null;
      $$('#cal-grid [data-cal-day]').forEach(function (c) { c.classList.remove('ring-2', 'ring-inset', 'ring-primary-400'); });
    });

    $$('#cal-grid [data-cal-day]').forEach(function (cell) {
      cell.addEventListener('click', function () { calSelect(cell); });
      cell.addEventListener('dragover', function (e) {
        e.preventDefault();
        cell.classList.add('ring-2', 'ring-inset', 'ring-primary-400');
      });
      cell.addEventListener('dragleave', function () { cell.classList.remove('ring-2', 'ring-inset', 'ring-primary-400'); });
      cell.addEventListener('drop', function (e) {
        e.preventDefault();
        cell.classList.remove('ring-2', 'ring-inset', 'ring-primary-400');
        if (calDragEv && calDragEv.closest('[data-cal-day]') !== cell) {
          var dropWrap = cell.querySelector('.space-y-1');
          if (!dropWrap) { dropWrap = document.createElement('div'); dropWrap.className = 'mt-1 space-y-1'; cell.appendChild(dropWrap); }
          dropWrap.appendChild(calDragEv);
          var dd = new Date(cell.dataset.calDay + 'T00:00:00');
          RM.toast('Event moved to ' + dd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
        }
        if (calDragEv) calDragEv.classList.remove('opacity-40');
        calDragEv = null;
        calSelect(cell);
      });
    });

    $('#ca-save').addEventListener('click', function () {
      var title = $('#ca-title').value.trim(), date = $('#ca-date').value, type = $('#ca-type').value;
      if (!title || !date) { RM.toast('Title and date are required', 'warn'); return; }
      var cell = $('#cal-grid [data-cal-day="' + date + '"]');
      if (!cell) { RM.toast('Pick a date inside August 2026 (demo month)', 'error'); return; }
      var wrap = cell.querySelector('.space-y-1');
      if (!wrap) { wrap = document.createElement('div'); wrap.className = 'mt-1 space-y-1'; cell.appendChild(wrap); }
      wrap.insertAdjacentHTML('beforeend', '<button draggable="true" data-cal-event data-title="' + escA(title) + '" data-time="All day" data-type="' + type + '" class="rm-pop block w-full text-left px-1.5 py-0.5 rounded text-[10px] font-bold ' + (CAL_TYPE[type] || '') + ' truncate">' + escH(title) + '</button>');
      $('#ca-title').value = '';
      RM.closeModal('cal-add-modal');
      calSelect(cell);
      RM.toast('Event added to calendar');
    });

    var todayCell = $('#cal-grid [data-cal-today]');
    if (todayCell) calSelect(todayCell);
  }

  /* ================= FAQ PAGE ================= */
  if ($('[data-faq-item]')) {
    $$('[data-faq-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = btn.parentElement.querySelector('[data-faq-panel]');
        var nowHidden = panel.classList.toggle('hidden');
        btn.querySelector('svg').style.transform = nowHidden ? '' : 'rotate(180deg)';
      });
    });
    var fq = $('#faq-search');
    if (fq) fq.addEventListener('input', function () {
      var q = (fq.value || '').toLowerCase();
      var total = 0;
      $$('[data-faq-item]').forEach(function (item) {
        var ok = !q || item.textContent.toLowerCase().indexOf(q) > -1;
        item.classList.toggle('hidden', !ok);
        if (ok) total++;
      });
      $$('[data-faq-group]').forEach(function (g) {
        g.classList.toggle('hidden', !$$('[data-faq-item]:not(.hidden)', g).length);
      });
      $('#faq-count').textContent = q ? total + ' answer' + (total === 1 ? '' : 's') + ' found' : '';
    });
  }

  /* ================= PAYMENTS PAGE ================= */
  if ($('#pay-body')) {
    var PAY_ST = { 'Paid': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', 'Pending': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', 'Failed': 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20', 'Refunded': 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20' };
    var payData = [
      { inv: 'INV-2026-0852', customer: 'Riya Sharma', plan: 'Business · Annual', method: 'UPI', amount: 25960, status: 'Paid', date: '2026-08-12' },
      { inv: 'INV-2026-0851', customer: 'Aman Kapoor', plan: 'Starter · Monthly', method: 'Card', amount: 1769, status: 'Paid', date: '2026-08-10' },
      { inv: 'INV-2026-0850', customer: 'Sara Mathew', plan: 'Enterprise · Annual', method: 'Netbanking', amount: 88500, status: 'Paid', date: '2026-08-08' },
      { inv: 'INV-2026-0849', customer: 'Vivek Tandon', plan: 'Business · Monthly', method: 'UPI', amount: 5310, status: 'Pending', date: '2026-08-06' },
      { inv: 'INV-2026-0848', customer: 'Pooja Nair', plan: 'Business · Annual', method: 'Card', amount: 25960, status: 'Paid', date: '2026-08-04' },
      { inv: 'INV-2026-0847', customer: 'Riya Sharma', plan: 'Business · Annual', method: 'UPI', amount: 25960, status: 'Paid', date: '2026-08-01' },
      { inv: 'INV-2026-0846', customer: 'Kiran Desai', plan: 'Starter · Monthly', method: 'UPI', amount: 1769, status: 'Failed', date: '2026-07-28' },
      { inv: 'INV-2026-0845', customer: 'Ankit Rao', plan: 'Enterprise · Annual', method: 'Netbanking', amount: 88500, status: 'Paid', date: '2026-07-24' },
      { inv: 'INV-2026-0844', customer: 'Neha Gupta', plan: 'Business · Monthly', method: 'Card', amount: 5310, status: 'Paid', date: '2026-07-20' },
      { inv: 'INV-2026-0843', customer: 'Rahul Verma', plan: 'Starter · Monthly', method: 'UPI', amount: 1769, status: 'Refunded', date: '2026-07-15' },
      { inv: 'INV-2026-0842', customer: 'Meera Iyer', plan: 'Business · Annual', method: 'UPI', amount: 25960, status: 'Paid', date: '2026-07-11' },
      { inv: 'INV-2026-0841', customer: 'Arjun Singh', plan: 'Enterprise · Annual', method: 'Card', amount: 88500, status: 'Paid', date: '2026-07-06' }
    ];
    var payState = { page: 1, perPage: 8, query: '', status: '' };

    function payFiltered() {
      var q = payState.query.toLowerCase();
      return payData.filter(function (r) {
        return (!q || (r.inv + ' ' + r.customer + ' ' + r.plan + ' ' + r.method).toLowerCase().indexOf(q) > -1) && (!payState.status || r.status === payState.status);
      });
    }

    function payPageBtn(label, page, disabled, active) {
      var cls = 'min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-bold transition-colors ' +
        (disabled ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : (active ? 'bg-primary-500 text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'));
      return '<button ' + (disabled ? 'disabled' : 'data-pay-page="' + page + '"') + ' class="' + cls + '">' + label + '</button>';
    }

    function payRender() {
      var rows = payFiltered();
      var pages = Math.max(1, Math.ceil(rows.length / payState.perPage));
      if (payState.page > pages) payState.page = pages;
      var start = (payState.page - 1) * payState.perPage;
      $('#pay-body').innerHTML = rows.slice(start, start + payState.perPage).map(function (r) {
        var i = payData.indexOf(r);
        return '<tr class="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">' +
          '<td class="px-5 py-3.5 text-sm font-extrabold text-slate-800 dark:text-slate-100">' + r.inv + '</td>' +
          '<td class="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300 font-medium">' + r.customer + '</td>' +
          '<td class="px-5 py-3.5 text-sm text-slate-500">' + r.plan + '</td>' +
          '<td class="px-5 py-3.5 text-sm text-slate-500">' + r.method + '</td>' +
          '<td class="px-5 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-100">₹' + r.amount.toLocaleString('en-IN') + '</td>' +
          '<td class="px-5 py-3.5"><span class="px-2.5 py-1 rounded-full text-xs font-bold border ' + PAY_ST[r.status] + '">' + r.status + '</span></td>' +
          '<td class="px-5 py-3.5 text-sm text-slate-500">' + r.date + '</td>' +
          '<td class="px-5 py-3.5 text-right"><button data-pay-view="' + i + '" title="View invoice" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-500 transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button></td></tr>';
      }).join('') || '<tr><td colspan="8" class="px-5 py-12 text-center text-slate-400 text-sm font-medium">No payments match your filters</td></tr>';

      $('#pay-count').textContent = 'Showing ' + (rows.length ? start + 1 : 0) + '–' + Math.min(start + payState.perPage, rows.length) + ' of ' + rows.length + ' payments';

      var btns = payPageBtn('‹', payState.page - 1, payState.page === 1, false);
      for (var i = 1; i <= pages; i++) btns += payPageBtn(String(i), i, false, i === payState.page);
      btns += payPageBtn('›', payState.page + 1, payState.page === pages, false);
      $('#pay-pagination').innerHTML = btns;
      $$('[data-pay-page]').forEach(function (b) { b.addEventListener('click', function () { payState.page = +b.dataset.payPage; payRender(); }); });
    }

    var payView = null;
    $('#pay-body').addEventListener('click', function (e) {
      var b = e.target.closest('[data-pay-view]');
      if (!b) return;
      payView = payData[+b.dataset.payView];
      $('#piv-invoice').textContent = payView.inv;
      $('#piv-customer').textContent = payView.customer;
      $('#piv-plan').textContent = payView.plan;
      $('#piv-method').textContent = payView.method;
      $('#piv-date').textContent = payView.date;
      $('#piv-amount').textContent = '₹' + payView.amount.toLocaleString('en-IN');
      var st = $('#piv-status');
      st.textContent = payView.status;
      st.className = 'px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ' + PAY_ST[payView.status];
      $('#piv-full-btn').href = 'invoice.html?inv=' + encodeURIComponent(payView.inv) +
        '&customer=' + encodeURIComponent(payView.customer) + '&plan=' + encodeURIComponent(payView.plan) +
        '&method=' + encodeURIComponent(payView.method) + '&status=' + encodeURIComponent(payView.status) +
        '&date=' + encodeURIComponent(payView.date) + '&amount=' + payView.amount;
      RM.openModal('invoice-view-modal');
    });

    $('#piv-download').addEventListener('click', function () {
      if (!payView) return;
      downloadCSV(payView.inv + '.csv', 'Invoice,Customer,Plan,Method,Amount,Status,Date',
        [[payView.inv, csvQ(payView.customer), csvQ(payView.plan), payView.method, payView.amount, payView.status, payView.date].join(',')]);
      RM.toast('Invoice ' + payView.inv + ' downloaded — opens in Excel');
    });

    $('#pay-search').addEventListener('input', function (e) { payState.query = e.target.value; payState.page = 1; payRender(); });
    $('#pay-status').addEventListener('change', function (e) { payState.status = e.target.value; payState.page = 1; payRender(); });
    payRender();
  }

  /* ================= INVOICE PAGE — prefill via URL params (from payments) ================= */
  if ($('#invoice-doc')) {
    var iqp = new URLSearchParams(location.search);
    if (iqp.get('inv')) {
      var INV_ST = { 'Paid': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', 'Pending': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', 'Failed': 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20', 'Refunded': 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20' };
      var iAmt = parseInt(iqp.get('amount'), 10) || 0;
      var iBase = Math.round(iAmt / 1.18);
      var iGst = iAmt - iBase;
      var iStatus = iqp.get('status') || 'Paid';
      var iPlan = iqp.get('plan') || 'Subscription';
      document.title = 'Invoice ' + iqp.get('inv') + ' · RM Services Admin';
      $('#inv-title').textContent = 'Invoice ' + iqp.get('inv');
      $('#inv-number').textContent = iqp.get('inv');
      $('#inv-customer').textContent = iqp.get('customer') || 'Customer';
      $('#inv-date').textContent = iqp.get('date') || '—';
      $('#inv-plan').textContent = iPlan;
      $('#inv-method').textContent = iqp.get('method') || '—';
      var iBadge = $('#inv-status');
      iBadge.textContent = iStatus;
      iBadge.className = 'inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ' + (INV_ST[iStatus] || '');
      $('#inv-item1-desc').textContent = iPlan + ' Subscription';
      $('#inv-item1-sub').textContent = 'Billed via ' + (iqp.get('method') || 'online payment');
      $('#inv-item1-rate').textContent = '₹' + iBase.toLocaleString('en-IN') + '.00';
      $('#inv-item1-amt').textContent = '₹' + iBase.toLocaleString('en-IN') + '.00';
      var iRow2 = $('#inv-row-2'); if (iRow2) iRow2.classList.add('hidden');
      var iRow3 = $('#inv-row-3'); if (iRow3) iRow3.classList.add('hidden');
      $('#inv-subtotal').textContent = '₹' + iBase.toLocaleString('en-IN') + '.00';
      $('#inv-gst').textContent = '₹' + iGst.toLocaleString('en-IN') + '.00';
      $('#inv-total').textContent = '₹' + iAmt.toLocaleString('en-IN') + '.00';
    }
  }

  /* ================= PRICING LANDING (monthly/annual toggle) ================= */
  if ($('#pricing-toggle')) {
    var PRICE = { 'pt-starter': [1499, 1249], 'pt-business': [4499, 3749], 'pt-enterprise': [12999, 10799] };
    function setBilling(annual) {
      Object.keys(PRICE).forEach(function (id) {
        $('#' + id).textContent = '₹' + PRICE[id][annual ? 1 : 0].toLocaleString('en-IN');
      });
      $$('.pt-cycle').forEach(function (el) { el.textContent = annual ? '/mo billed annually' : '/mo billed monthly'; });
      $('#pricing-save').classList.toggle('hidden', !annual);
      var onCls = 'px-4 py-2 rounded-lg text-sm font-extrabold transition-all bg-surface shadow-soft text-slate-800 dark:text-slate-100';
      var offCls = 'px-4 py-2 rounded-lg text-sm font-extrabold transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-300';
      $('#pricing-annual').className = annual ? onCls : offCls;
      $('#pricing-monthly').className = annual ? offCls : onCls;
    }
    $('#pricing-monthly').addEventListener('click', function () { setBilling(false); });
    $('#pricing-annual').addEventListener('click', function () { setBilling(true); });
  }

  /* ---------------- CALENDAR: month/week view toggle ---------------- */
  if ($('#cal-view-month')) {
    $$('[data-cal-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var v = btn.dataset.calView;
        $('#cal-month-wrap').classList.toggle('hidden', v !== 'month');
        $('#cal-week').classList.toggle('hidden', v !== 'week');
        $$('[data-cal-view]').forEach(function (b) {
          b.className = 'px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ' + (b === btn ? 'bg-surface shadow-soft text-slate-800 dark:text-slate-100' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300');
        });
      });
    });
  }

  /* ---------------- RTL LAYOUT (Settings → Appearance) ---------------- */
  var rtlSw = $('#rtl-switch');
  if (rtlSw) {
    rtlSw.checked = document.documentElement.dir === 'rtl';
    rtlSw.addEventListener('change', function () {
      if (rtlSw.checked) { document.documentElement.dir = 'rtl'; localStorage.setItem('rm-rtl', '1'); }
      else { document.documentElement.dir = 'ltr'; localStorage.removeItem('rm-rtl'); }
      RM.toast(rtlSw.checked ? 'RTL layout enabled — every page now loads right-to-left' : 'LTR layout restored');
    });
  }

  /* ================= NOTIFICATIONS PAGE =================
     Items are STATIC HTML — replace with your Laravel @foreach loop. */
  if ($('#notif-list')) {
    var NT_ON = 'px-4 py-2 rounded-lg text-xs font-extrabold bg-surface shadow-soft text-slate-800 dark:text-slate-100 transition-all';
    var NT_OFF = 'px-4 py-2 rounded-lg text-xs font-extrabold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all';
    var ntTab = 'all';

    function ntRender() {
      var unread = $$('#notif-list [data-nt-unread]').length;
      $('#nt-unread-count').textContent = unread ? unread + ' unread notification' + (unread === 1 ? '' : 's') : 'All caught up';
      var visible = 0;
      $$('#notif-list [data-nt-item]').forEach(function (item) {
        var show = ntTab === 'all' || item.hasAttribute('data-nt-unread');
        item.classList.toggle('hidden', !show);
        if (show) visible++;
      });
      $('#nt-empty').classList.toggle('hidden', visible > 0);
      $$('[data-nt-tab]').forEach(function (b) { b.className = b.dataset.ntTab === ntTab ? NT_ON : NT_OFF; });
    }

    function ntRead(item) {
      if (!item.hasAttribute('data-nt-unread')) return;
      item.removeAttribute('data-nt-unread');
      item.classList.remove('bg-primary-500/5');
      var dot = item.querySelector('.nt-dot');
      if (dot) dot.remove();
    }

    $('#notif-list').addEventListener('click', function (e) {
      var item = e.target.closest('[data-nt-item]');
      if (item) { ntRead(item); ntRender(); }
    });
    $('#nt-mark-all').addEventListener('click', function () {
      $$('#notif-list [data-nt-unread]').forEach(ntRead);
      ntRender();
      RM.toast('All notifications marked as read');
    });
    $$('[data-nt-tab]').forEach(function (b) { b.addEventListener('click', function () { ntTab = b.dataset.ntTab; ntRender(); }); });
    ntRender();
  }

  /* ---------------- CONTACT PAGE (public) ---------------- */
  var ctForm = $('#ct-form');
  if (ctForm) {
    bindLive([$('#ct-name'), $('#ct-email'), $('#ct-message')]);
    ctForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = fieldState($('#ct-name'), $('#ct-name').value.trim().length >= 2 ? 'ok' : 'error', 'Please enter your name');
      ok = fieldState($('#ct-email'), isEmail($('#ct-email').value.trim()) ? 'ok' : 'error', 'Enter a valid email address') && ok;
      ok = fieldState($('#ct-message'), $('#ct-message').value.trim().length >= 10 ? 'ok' : 'error', 'Tell us a little more (min. 10 characters)') && ok;
      if (!ok) { RM.toast('Please fix the highlighted fields', 'error'); return; }
      ctForm.classList.add('hidden');
      $('#ct-success').classList.remove('hidden');
      RM.toast('Message sent — we reply within 4 working hours');
    });
  }

  /* ================= PLAN MANAGEMENT PAGE ================= */
  if ($('#pm-body')) {
    var pmDelBtn = null;

    function pmRefresh() {
      var rows = $$('#pm-body [data-pm-row]');
      var q = ($('#pm-search').value || '').toLowerCase();
      var st = $('#pm-status').value;
      var visible = 0, active = 0;
      rows.forEach(function (tr) {
        var isActive = tr.querySelector('.pm-status-switch').checked;
        tr.dataset.status = isActive ? 'active' : 'paused';
        if (isActive) active++;
        var show = (!q || tr.textContent.toLowerCase().indexOf(q) > -1) && (!st || tr.dataset.status === st);
        tr.classList.toggle('hidden', !show);
        if (show) visible++;
      });
      $('#pm-count').textContent = 'Showing ' + visible + ' of ' + rows.length + ' plans';
      $('#pm-empty').classList.toggle('hidden', visible > 0);
      $('#pm-stat-active').textContent = active;
      $('#pm-stat-total').textContent = rows.length;
    }

    $('#pm-body').addEventListener('click', function (e) {
      var d = e.target.closest('[data-pm-del]');
      if (d) { pmDelBtn = d; $('#pmd-name').textContent = d.dataset.pmDel; RM.openModal('plan-delete-modal'); }
    });

    $('#pm-body').addEventListener('change', function (e) {
      if (!e.target.classList.contains('pm-status-switch')) return;
      var label = e.target.closest('label').querySelector('.pm-status-label');
      label.textContent = e.target.checked ? 'Active' : 'Paused';
      label.className = 'pm-status-label text-xs font-extrabold ' + (e.target.checked ? 'text-emerald-500' : 'text-slate-400');
      RM.toast('Plan ' + (e.target.checked ? 'activated — now visible to customers' : 'paused — hidden from pricing page'));
      pmRefresh();
    });

    $('#pmd-confirm').addEventListener('click', function () {
      if (pmDelBtn) {
        var name = pmDelBtn.dataset.pmDel;
        pmDelBtn.closest('tr').remove();
        RM.toast('Plan "' + name + '" deleted');
        pmDelBtn = null;
      }
      RM.closeModal('plan-delete-modal');
      pmRefresh();
    });

    $('#pm-search').addEventListener('input', pmRefresh);
    $('#pm-status').addEventListener('change', pmRefresh);
    pmRefresh();
  }

  /* ================= CREATE / EDIT PLAN PAGE — live preview ================= */
  if ($('#pc-form')) {
    var pcParam = new URLSearchParams(location.search).get('plan');
    if (pcParam) { $('#pc-heading').textContent = 'Edit Plan: ' + pcParam; $('#pc-name').value = pcParam; document.title = 'Edit ' + pcParam + ' · RM Services Admin'; }

    function pcFmt(v) { var n = parseInt(v, 10); return isNaN(n) ? '0' : n.toLocaleString('en-IN'); }
    function pcLimit(label, val) {
      var n = parseInt(val, 10);
      return '<li class="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary-500 flex-none"><path d="M20 6 9 17l-5-5"/></svg>' + (n === -1 ? 'Unlimited ' + label : pcFmt(val) + ' ' + label) + '</li>';
    }

    function pcSync() {
      var name = $('#pc-name').value.trim();
      $('#pv-name').textContent = name || 'Your Plan';
      $('#pv-tagline').textContent = $('#pc-tagline').value.trim() || 'Plan tagline appears here';
      $('#pv-dot').style.background = $('#pc-color').value;
      $('#pv-price').textContent = '₹' + pcFmt($('#pc-monthly').value);
      var yr = parseInt($('#pc-yearly').value, 10);
      $('#pv-yearly').textContent = yr > 0 ? '₹' + pcFmt(yr) + '/mo when billed yearly' : 'billed monthly';
      $('#pv-limits').innerHTML =
        pcLimit('contacts', $('#pc-contacts').value) +
        pcLimit('broadcasts / month', $('#pc-broadcasts').value) +
        pcLimit('team seats', $('#pc-seats').value) +
        pcLimit('WA templates', $('#pc-templates').value);
      $('#pv-features').innerHTML = $$('.pc-feat').filter(function (f) { return f.checked; }).map(function (f) {
        return '<li class="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500 flex-none"><path d="M20 6 9 17l-5-5"/></svg>' + f.dataset.featLabel + '</li>';
      }).join('');
      $('#pv-popular').classList.toggle('hidden', !$('#pc-popular').checked);
      $('#pv-inactive').classList.toggle('hidden', $('#pc-active').checked);
    }

    $('#pc-form').addEventListener('input', pcSync);
    $('#pc-form').addEventListener('change', pcSync);
    $('#pc-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!$('#pc-name').value.trim()) { RM.toast('Plan name is required', 'error'); $('#pc-name').focus(); return; }
      if (!$('#pc-monthly').value || parseInt($('#pc-monthly').value, 10) < 0) { RM.toast('Enter a valid monthly price', 'error'); $('#pc-monthly').focus(); return; }
      RM.toast((pcParam ? 'Plan "' + pcParam + '" updated' : 'Plan "' + $('#pc-name').value.trim() + '" created') + ' (demo)');
    });
    pcSync();
  }

  /* ================= LANDING PAGES LIST ================= */
  if ($('#lp-body')) {
    var lpDelBtn = null;

    function lpRefresh() {
      var rows = $$('#lp-body [data-lp-row]');
      var q = ($('#lp-search').value || '').toLowerCase();
      var visible = 0;
      rows.forEach(function (tr) {
        var show = !q || tr.textContent.toLowerCase().indexOf(q) > -1;
        tr.classList.toggle('hidden', !show);
        if (show) visible++;
      });
      $('#lp-count').textContent = 'Showing ' + visible + ' of ' + rows.length + ' pages';
      $('#lp-empty').classList.toggle('hidden', visible > 0);
    }

    $('#lp-body').addEventListener('click', function (e) {
      var d = e.target.closest('[data-lp-del]');
      if (d) { lpDelBtn = d; $('#lpd-name').textContent = d.dataset.lpDel; RM.openModal('lp-delete-modal'); }
    });
    $('#lpd-confirm').addEventListener('click', function () {
      if (lpDelBtn) {
        var name = lpDelBtn.dataset.lpDel;
        lpDelBtn.closest('tr').remove();
        RM.toast('Landing page "' + name + '" deleted');
        lpDelBtn = null;
      }
      RM.closeModal('lp-delete-modal');
      lpRefresh();
    });

    $('#lp-search').addEventListener('input', lpRefresh);
    lpRefresh();
  }

  /* ================= LANDING PAGE EDITOR — sections, SEO, drag reorder ================= */
  var LP_NAMES = { home: 'Home', wa: 'WhatsApp Marketing', crm: 'CRM Suite', offer: 'Festive Offer 2026' };
  var LP_LIVE = { home: 'landing.html', wa: 'landing-wa.html', crm: 'landing-crm.html', offer: 'landing.html' };
  var LP_URLS = { home: 'rmservices.com/', wa: 'rmservices.com/whatsapp-marketing', crm: 'rmservices.com/crm-suite', offer: 'rmservices.com/offers/diwali-2026' };
  var LP_DEFAULTS = {
    home: {
      'hero-title': 'Grow your business on WhatsApp',
      'hero-subtitle': 'Broadcasts, chatbots and a shared team inbox — all powered by the official Meta API.',
      'hero-cta': 'Start Free Trial',
      'features-heading': 'Everything you need to sell more',
      'stats-heading': 'Trusted by 4,000+ growing businesses',
      'stat1-value': '4,000+', 'stat1-label': 'Active businesses',
      'stat2-value': '38M', 'stat2-label': 'Messages sent',
      'stat3-value': '98.2%', 'stat3-label': 'Delivery rate',
      'stat4-value': '4.9★', 'stat4-label': 'Average rating',
      'testimonials-heading': 'Loved by teams like yours',
      't1-quote': 'We replaced three tools with RM Services. Broadcasts that took a day now take twenty minutes.', 't1-name': 'Riya Sharma', 't1-role': 'Founder, Bloomkart',
      't2-quote': 'The shared inbox changed our support game. Response time dropped from hours to minutes.', 't2-name': 'Aman Kapoor', 't2-role': 'Ops Head, Fleetly',
      't3-quote': 'Meta approval felt scary until their template builder walked us through it. Worth every rupee.', 't3-name': 'Sara Mathew', 't3-role': 'CMO, UrbanNest',
      'pricing-heading': 'Simple, honest pricing',
      'faq-heading': 'Frequently asked questions',
      'cta-title': 'Ready to grow on WhatsApp?', 'cta-button': "Get Started — It's Free",
      'footer-text': '© 2026 RM Services · Made with care in India',
      'seo-title': 'RM Services — WhatsApp Marketing & CRM Platform',
      'seo-desc': 'Broadcasts, chatbots, CRM and a shared team inbox — powered by the official Meta Business API.',
      'seo-image': ''
    },
    wa: {
      'hero-title': 'Turn WhatsApp into your #1 sales channel',
      'hero-subtitle': 'Bulk broadcasts, catalog messages and instant auto-replies — everything your marketing team needs.',
      'hero-cta': 'Start Broadcasting',
      'features-heading': 'Marketing firepower, zero code',
      'stats-heading': "The numbers behind India's favorite WhatsApp platform",
      'stat1-value': '38M', 'stat1-label': 'Messages delivered',
      'stat2-value': '98.2%', 'stat2-label': 'Delivery rate',
      'stat3-value': '3.5x', 'stat3-label': 'Campaign ROI',
      'stat4-value': '4,000+', 'stat4-label': 'Happy senders',
      'testimonials-heading': 'Marketers love the results',
      't1-quote': 'Our Diwali broadcast reached 40,000 customers in minutes with a 96% read rate.', 't1-name': 'Pooja Nair', 't1-role': 'Marketing Head, Zayka',
      't2-quote': 'Quick replies and chatbots cut our first-response time to under a minute.', 't2-name': 'Kiran Desai', 't2-role': 'Growth Lead, Medisure',
      't3-quote': 'Template approval used to scare us. Now it is a five-minute job.', 't3-name': 'Meera Iyer', 't3-role': 'Founder, Thriftly',
      'pricing-heading': 'Simple pricing for every sender',
      'faq-heading': 'Broadcast questions, answered',
      'cta-title': 'Start your first campaign today', 'cta-button': 'Create a Broadcast',
      'footer-text': '© 2026 RM Services · Made with care in India',
      'seo-title': 'RM Services — WhatsApp Marketing Platform',
      'seo-desc': 'Bulk broadcasts, chatbots and catalog messaging on the official Meta API.',
      'seo-image': ''
    },
    crm: {
      'hero-title': 'Close more deals with a CRM your team loves',
      'hero-subtitle': 'Visual pipelines, WhatsApp-native conversations and follow-ups that never slip — all in one workspace.',
      'hero-cta': 'Start Free Trial',
      'features-heading': 'One workspace for every deal',
      'stats-heading': 'Built for teams that live in their pipeline',
      'stat1-value': '1,200+', 'stat1-label': 'Sales teams',
      'stat2-value': '92%', 'stat2-label': 'Follow-up rate',
      'stat3-value': '3.2x', 'stat3-label': 'Faster deal cycles',
      'stat4-value': '4.8★', 'stat4-label': 'Average rating',
      'testimonials-heading': 'Sales teams swear by it',
      't1-quote': 'Our follow-up rate doubled in the first month. The kanban pipeline keeps everyone honest.', 't1-name': 'Vivek Tandon', 't1-role': 'Sales Lead, Propwise',
      't2-quote': 'Having WhatsApp chats inside the CRM means zero context switching for my reps.', 't2-name': 'Neha Gupta', 't2-role': 'VP Sales, Gridline',
      't3-quote': 'From inquiry to invoice without leaving one screen. That is the dream.', 't3-name': 'Arjun Singh', 't3-role': 'Founder, Craftlane',
      'pricing-heading': 'Pricing that scales with your pipeline',
      'faq-heading': 'Common CRM questions',
      'cta-title': 'Ready to close your next deal?', 'cta-button': 'Try the CRM Free',
      'footer-text': '© 2026 RM Services · Made with care in India',
      'seo-title': 'RM Services CRM — Visual Pipelines on WhatsApp',
      'seo-desc': 'Kanban pipelines, WhatsApp-native chats and automated follow-ups for sales teams.',
      'seo-image': ''
    }
  };

  if ($('#lpe-sections')) {
    var lpePage = new URLSearchParams(location.search).get('page') || 'home';
    if (!LP_DEFAULTS[lpePage]) lpePage = 'home';
    var lpeKey = 'rm-landing-' + lpePage;
    var lpeSaved = null;
    try { lpeSaved = JSON.parse(localStorage.getItem(lpeKey) || 'null'); } catch (e) {}

    $('#lpe-title').textContent = 'Edit: ' + (LP_NAMES[lpePage] || lpePage);
    document.title = 'Edit ' + (LP_NAMES[lpePage] || 'Landing Page') + ' · RM Services Admin';
    var liveBtn = $('#lpe-view-live');
    if (liveBtn) liveBtn.href = LP_LIVE[lpePage] || 'landing.html';
    var pvUrl = $('#lpe-preview-url');
    if (pvUrl) pvUrl.textContent = LP_URLS[lpePage] || LP_URLS.home;

    function lpeSyncOrder() {
      $$('#lpe-sections [data-lpe-section]').forEach(function (sec) {
        var pv = $('#lp-preview [data-lpe-pv="' + sec.dataset.lpeSection + '"]');
        if (pv) $('#lp-preview').appendChild(pv);
      });
    }

    /* prefill: page defaults merged with saved edits */
    var lpeFields = {};
    Object.keys(LP_DEFAULTS[lpePage]).forEach(function (k) { lpeFields[k] = LP_DEFAULTS[lpePage][k]; });
    if (lpeSaved && lpeSaved.fields) Object.keys(lpeSaved.fields).forEach(function (k) { lpeFields[k] = lpeSaved.fields[k]; });
    $$('[data-lpe-field]').forEach(function (f) {
      if (lpeFields[f.dataset.lpeField] !== undefined) f.value = lpeFields[f.dataset.lpeField];
      var pv = $('#lp-pv-' + f.dataset.lpeField);
      if (pv) pv.textContent = f.value;
    });
    if (lpeSaved) {
      (lpeSaved.hidden || []).forEach(function (k) {
        var sec = $('#lpe-sections [data-lpe-section="' + k + '"]');
        if (sec) { var sw = sec.querySelector('.lpe-enable'); if (sw) sw.checked = false; }
        var pv = $('#lp-preview [data-lpe-pv="' + k + '"]');
        if (pv) pv.classList.add('hidden');
      });
      (lpeSaved.order || []).forEach(function (k) {
        var sec = $('#lpe-sections [data-lpe-section="' + k + '"]');
        if (sec) $('#lpe-sections').appendChild(sec);
      });
      lpeSyncOrder();
    }

    /* expand/collapse + arrow reorder */
    $('#lpe-sections').addEventListener('click', function (e) {
      var up = e.target.closest('[data-lpe-up]');
      var down = e.target.closest('[data-lpe-down]');
      if (up || down) {
        var sec = (up || down).closest('[data-lpe-section]');
        if (up && sec.previousElementSibling) sec.parentNode.insertBefore(sec, sec.previousElementSibling);
        if (down && sec.nextElementSibling) sec.parentNode.insertBefore(sec.nextElementSibling, sec);
        lpeSyncOrder();
        return;
      }
      var head = e.target.closest('[data-lpe-head]');
      if (head && !e.target.closest('.lpe-enable') && !e.target.closest('.lpe-grip')) {
        var body = head.parentNode.querySelector('.lpe-body');
        body.classList.toggle('hidden');
        head.querySelector('.lpe-chev').style.transform = body.classList.contains('hidden') ? '' : 'rotate(180deg)';
      }
    });

    /* enable/disable section */
    $('#lpe-sections').addEventListener('change', function (e) {
      if (!e.target.classList.contains('lpe-enable')) return;
      var sec = e.target.closest('[data-lpe-section]');
      var pv = $('#lp-preview [data-lpe-pv="' + sec.dataset.lpeSection + '"]');
      if (pv) pv.classList.toggle('hidden', !e.target.checked);
      RM.toast('Section ' + (e.target.checked ? 'visible on page' : 'hidden from page'));
    });

    /* live field sync (sections + SEO card) */
    document.addEventListener('input', function (e) {
      var f = e.target.dataset && e.target.dataset.lpeField;
      if (!f) return;
      var pv = $('#lp-pv-' + f);
      if (pv) pv.textContent = e.target.value;
    });

    /* drag & drop reorder via grip handle */
    var dragSec = null;
    var lpeList = $('#lpe-sections');
    lpeList.addEventListener('dragstart', function (e) {
      var grip = e.target.closest('.lpe-grip');
      var sec = e.target.closest('[data-lpe-section]');
      if (!grip || !sec) { e.preventDefault(); return; }
      dragSec = sec;
      sec.classList.add('opacity-40');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', sec.dataset.lpeSection); } catch (err) {}
      }
    });
    lpeList.addEventListener('dragover', function (e) {
      if (!dragSec) return;
      e.preventDefault();
      var over = e.target.closest('[data-lpe-section]');
      if (!over || over === dragSec) return;
      var rect = over.getBoundingClientRect();
      var after = (e.clientY - rect.top) > rect.height / 2;
      over.parentNode.insertBefore(dragSec, after ? over.nextSibling : over);
    });
    lpeList.addEventListener('drop', function (e) { if (dragSec) e.preventDefault(); });
    lpeList.addEventListener('dragend', function () {
      if (dragSec) { dragSec.classList.remove('opacity-40'); dragSec = null; lpeSyncOrder(); RM.toast('Section order updated'); }
    });

    /* publish — saves THIS page only */
    $('#lpe-save').addEventListener('click', function () {
      var state = { order: [], hidden: [], fields: {} };
      $$('#lpe-sections [data-lpe-section]').forEach(function (sec) {
        var key = sec.dataset.lpeSection;
        state.order.push(key);
        var sw = sec.querySelector('.lpe-enable');
        if (sw && !sw.checked) state.hidden.push(key);
      });
      $$('[data-lpe-field]').forEach(function (f) { state.fields[f.dataset.lpeField] = f.value; });
      localStorage.setItem(lpeKey, JSON.stringify(state));
      RM.toast('"' + (LP_NAMES[lpePage] || 'Page') + '" published — open the live page to see your changes');
    });
  }

  /* ================= PUBLIC LANDING PAGES — apply admin edits =================
     Reads the editor's saved state (localStorage 'rm-landing-<page>') and
     applies text, SEO meta, section visibility and section order.
     In production: replace with CMS fields rendered by Laravel. */
  if ($('#landing-page')) {
    try {
      var lpKey = 'rm-landing-' + ($('#landing-page').dataset.lpPage || 'home');
      var cms = JSON.parse(localStorage.getItem(lpKey) || 'null');
      if (cms) {
        var cmsFields = cms.fields || {};
        Object.keys(cmsFields).forEach(function (k) {
          $$('[data-lp-cms="' + k + '"]').forEach(function (el) { el.textContent = cmsFields[k]; });
        });
        if (cmsFields['seo-title']) document.title = cmsFields['seo-title'];
        if (cmsFields['seo-desc']) {
          var md = document.querySelector('meta[name="description"]');
          if (md) md.setAttribute('content', cmsFields['seo-desc']);
        }
        if (cmsFields['seo-image']) {
          var og = document.querySelector('meta[property="og:image"]');
          if (!og) { og = document.createElement('meta'); og.setAttribute('property', 'og:image'); document.head.appendChild(og); }
          og.setAttribute('content', cmsFields['seo-image']);
        }
        (cms.hidden || []).forEach(function (k) {
          var s = $('#lp-sec-' + k);
          if (s) s.classList.add('hidden');
        });
        if (cms.order && cms.order.length) {
          var wrap = $('#lp-sections-wrap');
          cms.order.forEach(function (k) {
            var s = $('#lp-sec-' + k);
            if (s) wrap.appendChild(s);
          });
        }
      }
    } catch (e) { /* invalid saved state — show defaults */ }
  }

  /* ================= SYSTEM PREFERENCES PAGE ================= */
  if ($('#pref-layout')) {
    /* inner section nav */
    $$('[data-pref-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.prefNav;
        $$('[data-pref-nav]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        $$('[data-pref-panel]').forEach(function (p) { p.classList.toggle('hidden', p.dataset.prefPanel !== key); });
      });
    });

    /* collapsible cards (Hide / Show) */
    $$('[data-pref-collapse]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var body = btn.closest('.bg-surface').querySelector('[data-pref-body]');
        if (!body) return;
        var hidden = body.classList.toggle('hidden');
        btn.querySelector('span').textContent = hidden ? 'Show' : 'Hide';
      });
    });

    /* selectable connection method cards */
    $$('[data-pref-method]').forEach(function (card) {
      card.addEventListener('click', function () {
        card.classList.toggle('selected');
        var name = card.querySelector('p').textContent;
        RM.toast(name + (card.classList.contains('selected') ? ' enabled' : ' disabled'));
      });
    });

    /* header actions */
    $$('[data-pref-refresh]').forEach(function (b) {
      b.addEventListener('click', function () { RM.toast('Settings refreshed from server (demo)'); });
    });
    $$('[data-pref-save]').forEach(function (b) {
      b.addEventListener('click', function () { RM.toast('System preferences saved (demo)'); });
    });
    $$('[data-pref-test]').forEach(function (b) {
      b.addEventListener('click', function () { RM.toast('Test email sent to admin@rmservices.com (demo)'); });
    });
    $$('.pref-toggle').forEach(function (t) {
      t.addEventListener('change', function () {
        var nameEl = t.parentElement.querySelector('p');
        var name = nameEl ? nameEl.textContent : 'Setting';
        RM.toast(name + (t.checked ? ' enabled' : ' disabled'));
      });
    });
  }

  /* ---------------- GENERIC DEMO BUTTONS ---------------- */
  $$('[data-demo-toast]').forEach(function (b) { b.addEventListener('click', function () { RM.toast(b.dataset.demoToast); }); });
})();
