/**
 * TaskFlow - Advanced To-Do & Task Management Application
 * Pure Vanilla JavaScript implementation with Web Audio FX, Canvas Confetti, and LocalStorage
 */

(() => {
  'use strict';

  // --- Initial Default Sample Tasks ---
  const DEFAULT_SAMPLE_TASKS = [
    {
      id: 'task-1',
      title: 'Design high-fidelity design system tokens',
      notes: 'Finalize primary indigo and cyan gradients, border radii, and dark mode contrast ratios.',
      priority: 'high',
      category: 'Work',
      dueDate: getRelativeDateString(0), // Today
      completed: false,
      starred: true,
      createdAt: Date.now() - 3600000 * 2,
      subtasks: [
        { id: 'sub-1', title: 'Export Figma color styles', completed: true },
        { id: 'sub-2', title: 'Verify WCAG AA contrast ratio', completed: false },
        { id: 'sub-3', title: 'Document typography scale', completed: false }
      ]
    },
    {
      id: 'task-2',
      title: 'Review weekly sprint deliverables & merge PRs',
      notes: 'Check responsive breakpoint tests on mobile devices.',
      priority: 'medium',
      category: 'Work',
      dueDate: getRelativeDateString(1), // Tomorrow
      completed: false,
      starred: false,
      createdAt: Date.now() - 3600000 * 5,
      subtasks: []
    },
    {
      id: 'task-3',
      title: 'Morning 30-minute cardio & strength routine',
      notes: 'Hydrate well and stretch hamstrings.',
      priority: 'medium',
      category: 'Health',
      dueDate: getRelativeDateString(0),
      completed: true,
      starred: false,
      createdAt: Date.now() - 3600000 * 8,
      subtasks: []
    },
    {
      id: 'task-4',
      title: 'Read chapter 4 of Clean Architecture book',
      notes: 'Take notes on dependency inversion and interface segregation principles.',
      priority: 'low',
      category: 'Study',
      dueDate: getRelativeDateString(2),
      completed: false,
      starred: true,
      createdAt: Date.now() - 3600000 * 12,
      subtasks: []
    }
  ];

  // Helper for relative date strings (YYYY-MM-DD)
  function getRelativeDateString(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --- State ---
  let tasks = [];
  let currentFilter = 'all'; // 'all', 'active', 'completed', 'today', 'starred'
  let currentCategory = 'all';
  let searchQuery = '';
  let currentSort = 'created-desc';
  let isSoundEnabled = true;
  let draftSubtasks = [];
  let editSubtasks = [];
  let lastDeletedTask = null;
  let undoTimeoutId = null;

  // --- DOM Elements ---
  const taskListEl = document.getElementById('task-list');
  const emptyStateEl = document.getElementById('empty-state');
  const emptyTitleText = document.getElementById('empty-title-text');
  const emptyDescText = document.getElementById('empty-desc-text');
  const newTaskForm = document.getElementById('new-task-form');
  const taskTitleInput = document.getElementById('task-title-input');
  const taskPrioritySelect = document.getElementById('task-priority-select');
  const taskCategorySelect = document.getElementById('task-category-select');
  const taskDueDate = document.getElementById('task-due-date');
  const toggleAdvancedBtn = document.getElementById('toggle-advanced-btn');
  const advancedFields = document.getElementById('advanced-fields');
  const taskNotesInput = document.getElementById('task-notes-input');
  const subtaskQuickInput = document.getElementById('subtask-quick-input');
  const addSubtaskDraftBtn = document.getElementById('add-subtask-draft-btn');
  const draftSubtasksListEl = document.getElementById('draft-subtasks-list');

  // Search & Filter
  const taskSearchInput = document.getElementById('task-search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const sortTasksSelect = document.getElementById('sort-tasks-select');
  const categoryFilterSelect = document.getElementById('category-filter-select');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const activeFilterSummary = document.getElementById('active-filter-summary');

  // Stats Counters & Ring
  const countAllEl = document.getElementById('count-all');
  const countActiveEl = document.getElementById('count-active');
  const countCompletedEl = document.getElementById('count-completed');
  const countHighEl = document.getElementById('count-high');
  const pillAllCount = document.getElementById('pill-all-count');
  const pillActiveCount = document.getElementById('pill-active-count');
  const pillCompletedCount = document.getElementById('pill-completed-count');
  const pillTodayCount = document.getElementById('pill-today-count');
  const pillStarredCount = document.getElementById('pill-starred-count');
  const statProgressPercent = document.getElementById('stat-progress-percent');
  const statProgressRatio = document.getElementById('stat-progress-ratio');
  const statProgressFill = document.getElementById('stat-progress-fill');
  const statProgressCircle = document.getElementById('stat-progress-circle');
  const progressEmoji = document.getElementById('progress-emoji');

  // Header Elements
  const greetingText = document.getElementById('greeting-text');
  const currentDateDisplay = document.getElementById('current-date-display');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');
  const dataMenuBtn = document.getElementById('data-menu-btn');
  const dataDropdownMenu = document.getElementById('data-dropdown-menu');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const importJsonInput = document.getElementById('import-json-input');
  const resetSampleBtn = document.getElementById('reset-sample-btn');
  const exportExcelMenuBtn = document.getElementById('export-excel-menu-btn');
  const exportCsvMenuBtn = document.getElementById('export-csv-menu-btn');

  // Bulk & Export toolbar buttons
  const exportExcelBtn = document.getElementById('export-excel-btn');
  const exportOptionsToggleBtn = document.getElementById('export-options-toggle-btn');
  const exportQuickMenu = document.getElementById('export-quick-menu');
  const exportAllExcelBtn = document.getElementById('export-all-excel-btn');
  const exportFilteredExcelBtn = document.getElementById('export-filtered-excel-btn');
  const exportCsvQuickBtn = document.getElementById('export-csv-quick-btn');
  const exportAllCountBadge = document.getElementById('export-all-count-badge');
  const exportFilteredCountBadge = document.getElementById('export-filtered-count-badge');
  const markAllDoneBtn = document.getElementById('mark-all-done-btn');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');
  const emptyAddBtn = document.getElementById('empty-add-btn');

  // Edit Modal Elements
  const editModal = document.getElementById('edit-modal');
  const editTaskForm = document.getElementById('edit-task-form');
  const editTaskId = document.getElementById('edit-task-id');
  const editTitleInput = document.getElementById('edit-title-input');
  const editPrioritySelect = document.getElementById('edit-priority-select');
  const editCategorySelect = document.getElementById('edit-category-select');
  const editDueDate = document.getElementById('edit-due-date');
  const editNotesInput = document.getElementById('edit-notes-input');
  const editSubtaskInput = document.getElementById('edit-subtask-input');
  const editSubtaskAddBtn = document.getElementById('edit-subtask-add-btn');
  const editSubtasksListEl = document.getElementById('edit-subtasks-list');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // --- Web Audio Synthesizer (Zero asset dependency) ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playUiSound(type) {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;

      if (type === 'complete') {
        // High, joyful pleasant 2-chord chime
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

        osc2.frequency.setValueAtTime(659.25, now); // E5
        osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.18); // C6

        gainNode.gain.setValueAtTime(0.18, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
      } else if (type === 'add') {
        // Crisp pop
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'delete') {
        // Soft descending swoosh
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // AudioContext failure should not stop app flow
    }
  }

  // --- Confetti Particle System ---
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let particles = [];
  let confettiAnimId = null;

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  function triggerConfettiBurst(originX, originY) {
    if (!confettiCtx) return;
    const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#a855f7'];
    const count = 45;
    const x = originX || window.innerWidth / 2;
    const y = originY || window.innerHeight / 3;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 5 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: 0.015 + Math.random() * 0.02
      });
    }

    if (!confettiAnimId) {
      animateConfetti();
    }
  }

  function animateConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > confettiCanvas.height) {
        particles.splice(i, 1);
        continue;
      }

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = p.opacity;
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    }

    if (particles.length > 0) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      confettiAnimId = null;
    }
  }

  // --- LocalStorage & State Persistence ---
  function loadPersistedData() {
    // Tasks
    try {
      const storedTasks = localStorage.getItem('taskflow_tasks');
      if (storedTasks) {
        try {
          tasks = JSON.parse(storedTasks);
        } catch {
          tasks = [...DEFAULT_SAMPLE_TASKS];
        }
      } else {
        tasks = [...DEFAULT_SAMPLE_TASKS];
        saveTasksToStorage();
      }
    } catch {
      tasks = [...DEFAULT_SAMPLE_TASKS];
    }

    // Theme
    let savedTheme = 'dark';
    try {
      savedTheme = localStorage.getItem('taskflow_theme') || 'dark';
    } catch {
      savedTheme = 'dark';
    }
    applyTheme(savedTheme);

    // Sound
    try {
      const savedSound = localStorage.getItem('taskflow_sound');
      if (savedSound !== null) {
        isSoundEnabled = savedSound === 'true';
      }
    } catch {
      isSoundEnabled = true;
    }
    updateSoundButtonUi();

    // Set default due date in form to today
    taskDueDate.value = getRelativeDateString(0);
  }

  function saveTasksToStorage() {
    try {
      localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // --- Theme Management ---
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('taskflow_theme', theme);
    } catch {}
    if (theme === 'dark') {
      themeIconSun.classList.add('hidden');
      themeIconMoon.classList.remove('hidden');
    } else {
      themeIconSun.classList.remove('hidden');
      themeIconMoon.classList.add('hidden');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    showToast(`Switched to ${next} theme`, 'info');
  }

  // --- Sound Management ---
  function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    try {
      localStorage.setItem('taskflow_sound', isSoundEnabled);
    } catch {}
    updateSoundButtonUi();
    showToast(`Sound FX ${isSoundEnabled ? 'Enabled' : 'Muted'}`, 'info');
    if (isSoundEnabled) {
      playUiSound('add');
    }
  }

  function updateSoundButtonUi() {
    if (isSoundEnabled) {
      soundIconOn.classList.remove('hidden');
      soundIconOff.classList.add('hidden');
    } else {
      soundIconOn.classList.add('hidden');
      soundIconOff.classList.remove('hidden');
    }
  }

  // --- Greeting and Live Clock ---
  function updateGreetingAndDate() {
    const now = new Date();
    const hours = now.getHours();

    let greeting = 'Good morning';
    let emoji = '🌅';
    if (hours >= 12 && hours < 17) {
      greeting = 'Good afternoon';
      emoji = '⚡';
    } else if (hours >= 17 && hours < 22) {
      greeting = 'Good evening';
      emoji = '✨';
    } else if (hours >= 22 || hours < 5) {
      greeting = 'Burning the midnight oil';
      emoji = '🌙';
    }

    greetingText.textContent = `${greeting}, Champion ${emoji} Let's conquer the day.`;

    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    currentDateDisplay.textContent = now.toLocaleDateString('en-US', options);
  }

  // --- Filtering and Sorting ---
  function getFilteredAndSortedTasks() {
    let result = [...tasks];
    const todayStr = getRelativeDateString(0);

    // Status filter
    if (currentFilter === 'active') {
      result = result.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
      result = result.filter(t => t.completed);
    } else if (currentFilter === 'today') {
      result = result.filter(t => t.dueDate === todayStr);
    } else if (currentFilter === 'starred') {
      result = result.filter(t => t.starred);
    }

    // Category filter
    if (currentCategory !== 'all') {
      result = result.filter(t => t.category === currentCategory);
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const notesMatch = t.notes && t.notes.toLowerCase().includes(q);
        const catMatch = t.category.toLowerCase().includes(q);
        const subtasksMatch = t.subtasks && t.subtasks.some(s => s.title.toLowerCase().includes(q));
        return titleMatch || notesMatch || catMatch || subtasksMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (currentSort === 'created-desc') {
        return (b.createdAt || 0) - (a.createdAt || 0);
      } else if (currentSort === 'created-asc') {
        return (a.createdAt || 0) - (b.createdAt || 0);
      } else if (currentSort === 'due-asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      } else if (currentSort === 'priority-desc') {
        const pMap = { high: 3, medium: 2, low: 1 };
        return (pMap[b.priority] || 1) - (pMap[a.priority] || 1);
      } else if (currentSort === 'alpha-asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }

  // --- Stats Dashboard & Ring Calculations ---
  function updateDashboardStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const high = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const todayStr = getRelativeDateString(0);
    const todayCount = tasks.filter(t => t.dueDate === todayStr).length;
    const starredCount = tasks.filter(t => t.starred).length;

    // Update count labels
    countAllEl.textContent = total;
    countActiveEl.textContent = active;
    countCompletedEl.textContent = completed;
    countHighEl.textContent = high;

    // Update filter pill counts
    pillAllCount.textContent = total;
    pillActiveCount.textContent = active;
    pillCompletedCount.textContent = completed;
    pillTodayCount.textContent = todayCount;
    pillStarredCount.textContent = starredCount;

    // Productivity Percentage
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    statProgressPercent.textContent = `${percentage}%`;
    statProgressRatio.textContent = `${completed} of ${total} done`;
    statProgressFill.style.width = `${percentage}%`;

    // SVG Circular Ring: circumference = 2 * PI * 28 = ~175.92
    const circumference = 2 * Math.PI * 28;
    const offset = circumference - (percentage / 100) * circumference;
    statProgressCircle.style.strokeDashoffset = offset;

    // Reactive emoji on completion score
    if (percentage === 100 && total > 0) {
      progressEmoji.textContent = '🏆';
    } else if (percentage >= 70) {
      progressEmoji.textContent = '🔥';
    } else if (percentage >= 40) {
      progressEmoji.textContent = '⚡';
    } else {
      progressEmoji.textContent = '🎯';
    }
  }

  // --- Update Export Badges ---
  function updateExportBadges() {
    const totalCount = tasks.length;
    const filteredCount = getFilteredAndSortedTasks().length;
    if (exportAllCountBadge) {
      exportAllCountBadge.textContent = `(${totalCount})`;
    }
    if (exportFilteredCountBadge) {
      exportFilteredCountBadge.textContent = `(${filteredCount})`;
    }
  }

  // --- Render Tasks Feed ---
  function renderTasks() {
    updateDashboardStats();
    updateExportBadges();
    const visibleTasks = getFilteredAndSortedTasks();
    taskListEl.innerHTML = '';

    // Summary line
    let summaryText = `Showing ${visibleTasks.length} ${visibleTasks.length === 1 ? 'task' : 'tasks'}`;
    if (currentFilter !== 'all') summaryText += ` in "${currentFilter}"`;
    if (currentCategory !== 'all') summaryText += ` (${currentCategory})`;
    if (searchQuery.trim()) summaryText += ` matching "${searchQuery}"`;
    activeFilterSummary.textContent = summaryText;

    if (visibleTasks.length === 0) {
      emptyStateEl.classList.remove('hidden');
      if (searchQuery.trim()) {
        emptyTitleText.textContent = 'No matching tasks';
        emptyDescText.textContent = `No tasks found matching "${searchQuery}". Try a different keyword or clear your search.`;
      } else if (currentFilter === 'completed') {
        emptyTitleText.textContent = 'No tasks completed yet';
        emptyDescText.textContent = 'Check off active items as you finish them to build momentum!';
      } else if (currentFilter === 'today') {
        emptyTitleText.textContent = 'Nothing due today';
        emptyDescText.textContent = 'Great job staying on top of deadlines or assign today to upcoming tasks.';
      } else {
        emptyTitleText.textContent = 'All Caught Up!';
        emptyDescText.textContent = 'Your task list is crystal clear. Enjoy the moment or add your next milestone.';
      }
      return;
    }

    emptyStateEl.classList.add('hidden');

    const todayStr = getRelativeDateString(0);

    visibleTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item priority-${task.priority}-border ${task.completed ? 'task-completed' : ''}`;
      li.dataset.id = task.id;

      // Subtasks completed count
      const totalSubtasks = (task.subtasks || []).length;
      const completedSubtasks = (task.subtasks || []).filter(s => s.completed).length;

      // Date Badge logic
      let dueDateBadgeHtml = '';
      if (task.dueDate) {
        let dateClass = 'badge-due';
        let label = formatDateDisplay(task.dueDate);

        if (!task.completed) {
          if (task.dueDate < todayStr) {
            dateClass += ' is-overdue';
            label = `⚠️ Overdue (${label})`;
          } else if (task.dueDate === todayStr) {
            dateClass += ' is-today';
            label = `⚡ Today`;
          }
        }

        dueDateBadgeHtml = `
          <span class="badge-pill ${dateClass}" title="Due date">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>
            ${label}
          </span>
        `;
      }

      // Subtask Accordion HTML
      let subtasksHtml = '';
      if (totalSubtasks > 0) {
        subtasksHtml = `
          <div class="subtasks-wrapper">
            <button class="subtasks-toggle-btn" data-toggle-subtasks="${task.id}" aria-expanded="false">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              <span>Subtasks (${completedSubtasks}/${totalSubtasks})</span>
            </button>
            <div class="task-subtasks-drawer hidden" id="subtasks-drawer-${task.id}">
              ${task.subtasks.map(sub => `
                <label class="subtask-item ${sub.completed ? 'completed' : ''}">
                  <input type="checkbox" class="subtask-checkbox" data-task-id="${task.id}" data-subtask-id="${sub.id}" ${sub.completed ? 'checked' : ''}>
                  <span>${escapeHtml(sub.title)}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `;
      }

      li.innerHTML = `
        <div class="task-row-main">
          <button class="custom-checkbox-btn ${task.completed ? 'checked' : ''}" data-action="toggle-complete" data-id="${task.id}" aria-label="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>

          <div class="task-content-body">
            <div class="task-title">${escapeHtml(task.title)}</div>
            ${task.notes ? `<p class="task-notes-preview">${escapeHtml(task.notes)}</p>` : ''}
          </div>

          <div class="task-actions">
            <button class="task-action-btn star-btn ${task.starred ? 'is-starred' : ''}" data-action="toggle-star" data-id="${task.id}" title="${task.starred ? 'Unstar task' : 'Star task'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${task.starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </button>
            <button class="task-action-btn" data-action="edit" data-id="${task.id}" title="Edit task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="task-action-btn delete-btn" data-action="delete" data-id="${task.id}" title="Delete task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>

        <div class="task-meta-row">
          <span class="badge-pill badge-cat-${escapeHtml(task.category)}">${escapeHtml(task.category)}</span>
          <span class="badge-pill badge-priority-${task.priority}">
            ${task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
          </span>
          ${dueDateBadgeHtml}
        </div>

        ${subtasksHtml}
      `;

      taskListEl.appendChild(li);
    });
  }

  // --- Task Interactions & Delegation ---
  taskListEl.addEventListener('click', (e) => {
    // 1. Toggle Complete
    const completeBtn = e.target.closest('[data-action="toggle-complete"]');
    if (completeBtn) {
      const taskId = completeBtn.dataset.id;
      toggleTaskCompletion(taskId, completeBtn);
      return;
    }

    // 2. Toggle Star
    const starBtn = e.target.closest('[data-action="toggle-star"]');
    if (starBtn) {
      const taskId = starBtn.dataset.id;
      toggleTaskStarred(taskId);
      return;
    }

    // 3. Edit Task
    const editBtn = e.target.closest('[data-action="edit"]');
    if (editBtn) {
      const taskId = editBtn.dataset.id;
      openEditModal(taskId);
      return;
    }

    // 4. Delete Task
    const deleteBtn = e.target.closest('[data-action="delete"]');
    if (deleteBtn) {
      const taskId = deleteBtn.dataset.id;
      deleteTaskWithUndo(taskId);
      return;
    }

    // 5. Toggle Subtasks Drawer
    const drawerBtn = e.target.closest('[data-toggle-subtasks]');
    if (drawerBtn) {
      const taskId = drawerBtn.dataset.toggleSubtasks;
      const drawer = document.getElementById(`subtasks-drawer-${taskId}`);
      if (drawer) {
        drawer.classList.toggle('hidden');
        drawerBtn.classList.toggle('expanded');
      }
      return;
    }

    // 6. Subtask Checkbox
    if (e.target.classList.contains('subtask-checkbox')) {
      const taskId = e.target.dataset.taskId;
      const subtaskId = e.target.dataset.subtaskId;
      toggleSubtaskItem(taskId, subtaskId, e.target.checked);
      return;
    }
  });

  function toggleTaskCompletion(id, btnElement) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    saveTasksToStorage();

    if (task.completed) {
      playUiSound('complete');
      if (btnElement) {
        const rect = btnElement.getBoundingClientRect();
        triggerConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
      showToast(`Task completed! Keep up the momentum 🚀`, 'success');

      // Check if all tasks completed!
      const allDone = tasks.length > 0 && tasks.every(t => t.completed);
      if (allDone) {
        setTimeout(() => triggerConfettiBurst(), 300);
      }
    } else {
      playUiSound('add');
    }

    renderTasks();
  }

  function toggleTaskStarred(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.starred = !task.starred;
    saveTasksToStorage();
    playUiSound('add');
    renderTasks();
  }

  function toggleSubtaskItem(taskId, subtaskId, isChecked) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;
    const sub = task.subtasks.find(s => s.id === subtaskId);
    if (sub) {
      sub.completed = isChecked;
      saveTasksToStorage();
      if (isChecked) playUiSound('complete');
      renderTasks();
    }
  }

  function deleteTaskWithUndo(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    lastDeletedTask = {
      task: tasks[taskIndex],
      index: taskIndex
    };

    tasks.splice(taskIndex, 1);
    saveTasksToStorage();
    playUiSound('delete');
    renderTasks();

    // Show undo toast
    showUndoToast(`Task deleted`, () => {
      if (lastDeletedTask) {
        tasks.splice(lastDeletedTask.index, 0, lastDeletedTask.task);
        saveTasksToStorage();
        playUiSound('add');
        renderTasks();
        showToast('Task restored', 'success');
        lastDeletedTask = null;
      }
    });
  }

  // --- Add Task Form Handling ---
  newTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    if (!title) return;

    const newTask = {
      id: 'task-' + Date.now(),
      title: title,
      priority: taskPrioritySelect.value,
      category: taskCategorySelect.value,
      dueDate: taskDueDate.value || '',
      notes: taskNotesInput.value.trim(),
      completed: false,
      starred: false,
      createdAt: Date.now(),
      subtasks: [...draftSubtasks]
    };

    tasks.unshift(newTask);
    saveTasksToStorage();
    playUiSound('add');

    // Reset inputs
    taskTitleInput.value = '';
    taskNotesInput.value = '';
    draftSubtasks = [];
    renderDraftSubtasks();

    if (!advancedFields.classList.contains('hidden')) {
      toggleAdvancedFormFields();
    }

    renderTasks();
    showToast('Task added successfully', 'success');
  });

  // Toggle Advanced creation inputs
  toggleAdvancedBtn.addEventListener('click', () => {
    toggleAdvancedFormFields();
  });

  function toggleAdvancedFormFields() {
    const isHidden = advancedFields.classList.toggle('hidden');
    toggleAdvancedBtn.setAttribute('aria-expanded', !isHidden);
    toggleAdvancedBtn.querySelector('span').textContent = isHidden ? 'Add Details' : 'Hide Details';
  }

  // Add draft subtask in new task form
  addSubtaskDraftBtn.addEventListener('click', () => {
    addDraftSubtask();
  });

  subtaskQuickInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDraftSubtask();
    }
  });

  function addDraftSubtask() {
    const text = subtaskQuickInput.value.trim();
    if (!text) return;
    draftSubtasks.push({
      id: 'sub-' + Date.now() + Math.random().toString(36).substring(2, 6),
      title: text,
      completed: false
    });
    subtaskQuickInput.value = '';
    renderDraftSubtasks();
  }

  function renderDraftSubtasks() {
    draftSubtasksListEl.innerHTML = draftSubtasks.map((sub, idx) => `
      <li class="draft-subtask-item">
        <span>${escapeHtml(sub.title)}</span>
        <button type="button" class="remove-subtask-btn" data-draft-idx="${idx}" aria-label="Remove item">✕</button>
      </li>
    `).join('');
  }

  draftSubtasksListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-subtask-btn');
    if (btn) {
      const idx = parseInt(btn.dataset.draftIdx, 10);
      draftSubtasks.splice(idx, 1);
      renderDraftSubtasks();
    }
  });

  // --- Edit Task Modal Logic ---
  function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    editTaskId.value = task.id;
    editTitleInput.value = task.title;
    editPrioritySelect.value = task.priority;
    editCategorySelect.value = task.category;
    editDueDate.value = task.dueDate || '';
    editNotesInput.value = task.notes || '';
    editSubtasks = (task.subtasks || []).map(s => ({ ...s }));

    renderEditSubtasks();
    editModal.classList.remove('hidden');
    editTitleInput.focus();
  }

  function closeEditModal() {
    editModal.classList.add('hidden');
    editSubtasks = [];
  }

  closeModalBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);

  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });

  editSubtaskAddBtn.addEventListener('click', () => {
    addEditSubtask();
  });

  editSubtaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEditSubtask();
    }
  });

  function addEditSubtask() {
    const text = editSubtaskInput.value.trim();
    if (!text) return;
    editSubtasks.push({
      id: 'sub-' + Date.now() + Math.random().toString(36).substring(2, 6),
      title: text,
      completed: false
    });
    editSubtaskInput.value = '';
    renderEditSubtasks();
  }

  function renderEditSubtasks() {
    editSubtasksListEl.innerHTML = editSubtasks.map((sub, idx) => `
      <li class="draft-subtask-item">
        <span>${escapeHtml(sub.title)}</span>
        <button type="button" class="remove-subtask-btn" data-edit-sub-idx="${idx}" aria-label="Remove item">✕</button>
      </li>
    `).join('');
  }

  editSubtasksListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-subtask-btn');
    if (btn) {
      const idx = parseInt(btn.dataset.editSubIdx, 10);
      editSubtasks.splice(idx, 1);
      renderEditSubtasks();
    }
  });

  editTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = editTaskId.value;
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.title = editTitleInput.value.trim();
    task.priority = editPrioritySelect.value;
    task.category = editCategorySelect.value;
    task.dueDate = editDueDate.value || '';
    task.notes = editNotesInput.value.trim();
    task.subtasks = [...editSubtasks];

    saveTasksToStorage();
    playUiSound('add');
    closeEditModal();
    renderTasks();
    showToast('Task updated successfully', 'success');
  });

  // --- Search & Filters Handlers ---
  taskSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    if (searchQuery.length > 0) {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
    }
    renderTasks();
  });

  clearSearchBtn.addEventListener('click', () => {
    taskSearchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    taskSearchInput.focus();
    renderTasks();
  });

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentFilter = tab.dataset.filter;
      renderTasks();
    });
  });

  categoryFilterSelect.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    renderTasks();
  });

  sortTasksSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTasks();
  });

  // Stat Card click to filter
  document.querySelectorAll('.stat-card[data-stat-filter]').forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.dataset.statFilter;
      const targetTab = document.querySelector(`.filter-tab[data-filter="${filter}"]`);
      if (targetTab) {
        targetTab.click();
      }
    });
  });

  // Bulk Actions
  markAllDoneBtn.addEventListener('click', () => {
    const visible = getFilteredAndSortedTasks();
    if (visible.length === 0) return;
    visible.forEach(t => t.completed = true);
    saveTasksToStorage();
    playUiSound('complete');
    triggerConfettiBurst();
    renderTasks();
    showToast('All visible tasks marked complete!', 'success');
  });

  clearCompletedBtn.addEventListener('click', () => {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear', 'info');
      return;
    }
    tasks = tasks.filter(t => !t.completed);
    saveTasksToStorage();
    playUiSound('delete');
    renderTasks();
    showToast(`Cleared ${completedCount} completed tasks`, 'success');
  });

  emptyAddBtn.addEventListener('click', () => {
    taskTitleInput.focus();
    taskTitleInput.scrollIntoView({ behavior: 'smooth' });
  });

  // --- Data Import & Export ---

  // Export Quick Menu Toggle helpers
  function closeExportQuickMenu() {
    if (exportQuickMenu && !exportQuickMenu.classList.contains('hidden')) {
      exportQuickMenu.classList.add('hidden');
      if (exportOptionsToggleBtn) {
        exportOptionsToggleBtn.setAttribute('aria-expanded', 'false');
      }
    }
  }

  function toggleExportQuickMenu(e) {
    e.stopPropagation();
    if (exportQuickMenu) {
      const isHidden = exportQuickMenu.classList.toggle('hidden');
      if (exportOptionsToggleBtn) {
        exportOptionsToggleBtn.setAttribute('aria-expanded', String(!isHidden));
      }
    }
  }

  // --- Pure Vanilla OpenXML (.xlsx) & CSV Generation Engine ---

  // Precomputed CRC32 table for ZIP packaging
  const crc32Table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crc32Table[i] = c >>> 0;
  }

  function calculateCrc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) {
      c = (c >>> 8) ^ crc32Table[(c ^ bytes[i]) & 0xFF];
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function createZipArchive(files) {
    const encoder = new TextEncoder();
    const fileEntries = files.map(file => {
      const dataBytes = typeof file.data === 'string' ? encoder.encode(file.data) : file.data;
      const nameBytes = encoder.encode(file.name);
      const crc = calculateCrc32(dataBytes);
      return {
        nameBytes,
        dataBytes,
        crc,
        size: dataBytes.length
      };
    });

    const now = new Date();
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

    let totalArchiveSize = 0;
    fileEntries.forEach(entry => {
      entry.localHeaderOffset = totalArchiveSize;
      totalArchiveSize += 30 + entry.nameBytes.length + entry.size;
    });

    const cdOffset = totalArchiveSize;
    let cdSize = 0;
    fileEntries.forEach(entry => {
      cdSize += 46 + entry.nameBytes.length;
    });
    totalArchiveSize += cdSize + 22;

    const buffer = new Uint8Array(totalArchiveSize);
    const view = new DataView(buffer.buffer);
    let pos = 0;

    // 1. Write Local File Headers & File Data
    fileEntries.forEach(entry => {
      view.setUint32(pos, 0x04034b50, true); pos += 4;
      view.setUint16(pos, 20, true); pos += 2;
      view.setUint16(pos, 0x0800, true); pos += 2; // UTF-8
      view.setUint16(pos, 0, true); pos += 2; // Store (no compression)
      view.setUint16(pos, dosTime, true); pos += 2;
      view.setUint16(pos, dosDate, true); pos += 2;
      view.setUint32(pos, entry.crc, true); pos += 4;
      view.setUint32(pos, entry.size, true); pos += 4; // compressed size
      view.setUint32(pos, entry.size, true); pos += 4; // uncompressed size
      view.setUint16(pos, entry.nameBytes.length, true); pos += 2;
      view.setUint16(pos, 0, true); pos += 2; // extra field length

      buffer.set(entry.nameBytes, pos); pos += entry.nameBytes.length;
      buffer.set(entry.dataBytes, pos); pos += entry.size;
    });

    // 2. Write Central Directory Headers
    fileEntries.forEach(entry => {
      view.setUint32(pos, 0x02014b50, true); pos += 4;
      view.setUint16(pos, 20, true); pos += 2; // made by
      view.setUint16(pos, 20, true); pos += 2; // needed
      view.setUint16(pos, 0x0800, true); pos += 2; // UTF-8
      view.setUint16(pos, 0, true); pos += 2; // Store
      view.setUint16(pos, dosTime, true); pos += 2;
      view.setUint16(pos, dosDate, true); pos += 2;
      view.setUint32(pos, entry.crc, true); pos += 4;
      view.setUint32(pos, entry.size, true); pos += 4;
      view.setUint32(pos, entry.size, true); pos += 4;
      view.setUint16(pos, entry.nameBytes.length, true); pos += 2;
      view.setUint16(pos, 0, true); pos += 2; // extra len
      view.setUint16(pos, 0, true); pos += 2; // comment len
      view.setUint16(pos, 0, true); pos += 2; // disk start
      view.setUint16(pos, 0, true); pos += 2; // internal attr
      view.setUint32(pos, 0, true); pos += 4; // external attr
      view.setUint32(pos, entry.localHeaderOffset, true); pos += 4;

      buffer.set(entry.nameBytes, pos); pos += entry.nameBytes.length;
    });

    // 3. Write End of Central Directory (EOCD)
    view.setUint32(pos, 0x06054b50, true); pos += 4;
    view.setUint16(pos, 0, true); pos += 2;
    view.setUint16(pos, 0, true); pos += 2;
    view.setUint16(pos, fileEntries.length, true); pos += 2;
    view.setUint16(pos, fileEntries.length, true); pos += 2;
    view.setUint32(pos, cdSize, true); pos += 4;
    view.setUint32(pos, cdOffset, true); pos += 4;
    view.setUint16(pos, 0, true); pos += 2;

    return buffer;
  }

  function escapeXml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  }

  function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getExcelCellRef(colIdx, rowIdx) {
    let colName = '';
    let temp = colIdx;
    while (temp > 0) {
      const rem = (temp - 1) % 26;
      colName = String.fromCharCode(65 + rem) + colName;
      temp = Math.floor((temp - 1) / 26);
    }
    return `${colName}${rowIdx}`;
  }

  function buildTasksXlsxZip(tasksToExport, scopeDescription = 'All Tasks') {
    const todayStr = getRelativeDateString(0);
    const exportTimeStr = new Date().toLocaleString('en-US');

    // 1. [Content_Types].xml
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

    // 2. _rels/.rels
    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    // 3. xl/_rels/workbook.xml.rels
    const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

    // 4. xl/workbook.xml
    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <workbookPr date1904="false"/>
  <bookViews>
    <workbookView xWindow="0" yWindow="0" windowWidth="20480" windowHeight="10240"/>
  </bookViews>
  <sheets>
    <sheet name="Tasks" sheetId="1" r:id="rId1"/>
    <sheet name="Analytics &amp; Summary" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>`;

    // 5. xl/styles.xml
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="8">
    <font><sz val="11"/><name val="Calibri"/><color rgb="FF1E293B"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/><color rgb="FFFFFFFF"/></font>
    <font><b/><sz val="10.5"/><name val="Calibri"/><color rgb="FF047857"/></font>
    <font><b/><sz val="10.5"/><name val="Calibri"/><color rgb="FF0E7490"/></font>
    <font><b/><sz val="10.5"/><name val="Calibri"/><color rgb="FFBE123C"/></font>
    <font><b/><sz val="10.5"/><name val="Calibri"/><color rgb="FFB45309"/></font>
    <font><b/><sz val="10.5"/><name val="Calibri"/><color rgb="FF15803D"/></font>
    <font><sz val="10"/><name val="Calibri"/><color rgb="FF64748B"/></font>
  </fonts>
  <fills count="10">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF4F46E5"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFECFDF5"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFECFEFF"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF1F2"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFBEB"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF0FDF4"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
      <diagonal/>
    </border>
    <border>
      <left style="thin"><color rgb="FF4338CA"/></left>
      <right style="thin"><color rgb="FF4338CA"/></right>
      <top style="thin"><color rgb="FF4338CA"/></top>
      <bottom style="medium"><color rgb="FF3730A3"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="14">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="2" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="7" fillId="6" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="4" fillId="7" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="8" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="9" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="7" fillId="0" borderId="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="7" fillId="3" borderId="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
  </cellXfs>
</styleSheet>`;

    // 6. xl/worksheets/sheet1.xml (Tasks Worksheet)
    const taskHeaders = [
      'Task ID',
      'Task Title',
      'Description / Notes',
      'Status',
      'Priority',
      'Category',
      'Due Date',
      'Due Status',
      'Created Date',
      'Starred',
      'Checklist Progress',
      'Checklist Details'
    ];

    let sheet1DataRows = `<row r="1" ht="28" customHeight="1">`;
    taskHeaders.forEach((header, idx) => {
      const ref = getExcelCellRef(idx + 1, 1);
      sheet1DataRows += `<c r="${ref}" s="1" t="inlineStr"><is><t>${escapeXml(header)}</t></is></c>`;
    });
    sheet1DataRows += `</row>`;

    tasksToExport.forEach((task, rowIdx) => {
      const r = rowIdx + 2;
      const isEven = rowIdx % 2 === 1;
      const totalSub = (task.subtasks || []).length;
      const compSub = (task.subtasks || []).filter(s => s.completed).length;

      let status = 'Pending';
      let statusStyle = 8; // slate
      if (task.completed) {
        status = 'Completed';
        statusStyle = 6; // green
      } else if (totalSub > 0 && compSub > 0) {
        status = 'In Progress';
        statusStyle = 7; // cyan
      }

      let priorityStyle = 10; // medium
      const p = (task.priority || 'medium').toLowerCase();
      if (p === 'high') priorityStyle = 9;
      else if (p === 'low') priorityStyle = 11;

      let dueStatus = 'No Due Date';
      let dueStyle = isEven ? 5 : 3;
      if (task.completed) {
        dueStatus = 'Completed';
        dueStyle = 6;
      } else if (task.dueDate) {
        if (task.dueDate < todayStr) {
          dueStatus = '⚠️ Overdue';
          dueStyle = 9; // rose alert
        } else if (task.dueDate === todayStr) {
          dueStatus = '⚡ Due Today';
          dueStyle = 10; // amber alert
        } else {
          dueStatus = 'Upcoming';
        }
      }

      const createdStr = task.createdAt ? new Date(task.createdAt).toLocaleString('en-US') : '';
      const progressStr = totalSub > 0 ? `${compSub}/${totalSub} (${Math.round((compSub / totalSub) * 100)}%)` : (task.completed ? '100%' : 'None');
      const subtaskDetails = (task.subtasks || []).map(s => (s.completed ? '[✓] ' : '[ ] ') + s.title).join(' | ');

      const defaultLeftStyle = isEven ? 4 : 2;
      const defaultCenterStyle = isEven ? 5 : 3;
      const subtaskStyle = isEven ? 13 : 12;

      sheet1DataRows += `<row r="${r}" ht="24" customHeight="1">`;
      // Col 1: ID
      sheet1DataRows += `<c r="${getExcelCellRef(1, r)}" s="${defaultCenterStyle}" t="inlineStr"><is><t>${escapeXml(task.id)}</t></is></c>`;
      // Col 2: Title
      sheet1DataRows += `<c r="${getExcelCellRef(2, r)}" s="${defaultLeftStyle}" t="inlineStr"><is><t>${escapeXml(task.title)}</t></is></c>`;
      // Col 3: Description
      sheet1DataRows += `<c r="${getExcelCellRef(3, r)}" s="${defaultLeftStyle}" t="inlineStr"><is><t>${escapeXml(task.notes || '')}</t></is></c>`;
      // Col 4: Status
      sheet1DataRows += `<c r="${getExcelCellRef(4, r)}" s="${statusStyle}" t="inlineStr"><is><t>${escapeXml(status)}</t></is></c>`;
      // Col 5: Priority
      sheet1DataRows += `<c r="${getExcelCellRef(5, r)}" s="${priorityStyle}" t="inlineStr"><is><t>${escapeXml(capitalizeFirstLetter(task.priority || 'medium'))}</t></is></c>`;
      // Col 6: Category
      sheet1DataRows += `<c r="${getExcelCellRef(6, r)}" s="${defaultCenterStyle}" t="inlineStr"><is><t>${escapeXml(task.category || 'General')}</t></is></c>`;
      // Col 7: Due Date
      sheet1DataRows += `<c r="${getExcelCellRef(7, r)}" s="${defaultCenterStyle}" t="inlineStr"><is><t>${escapeXml(task.dueDate || '')}</t></is></c>`;
      // Col 8: Due Status
      sheet1DataRows += `<c r="${getExcelCellRef(8, r)}" s="${dueStyle}" t="inlineStr"><is><t>${escapeXml(dueStatus)}</t></is></c>`;
      // Col 9: Created Date
      sheet1DataRows += `<c r="${getExcelCellRef(9, r)}" s="${defaultCenterStyle}" t="inlineStr"><is><t>${escapeXml(createdStr)}</t></is></c>`;
      // Col 10: Starred
      sheet1DataRows += `<c r="${getExcelCellRef(10, r)}" s="${defaultCenterStyle}" t="inlineStr"><is><t>${task.starred ? '⭐ Starred' : 'No'}</t></is></c>`;
      // Col 11: Progress
      sheet1DataRows += `<c r="${getExcelCellRef(11, r)}" s="${defaultCenterStyle}" t="inlineStr"><is><t>${escapeXml(progressStr)}</t></is></c>`;
      // Col 12: Subtasks
      sheet1DataRows += `<c r="${getExcelCellRef(12, r)}" s="${subtaskStyle}" t="inlineStr"><is><t>${escapeXml(subtaskDetails)}</t></is></c>`;
      sheet1DataRows += `</row>`;
    });

    const totalTaskRows = tasksToExport.length + 1;
    const worksheet1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView tabSelected="1" workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <cols>
    <col min="1" max="1" width="13" customWidth="1"/>
    <col min="2" max="2" width="38" customWidth="1"/>
    <col min="3" max="3" width="42" customWidth="1"/>
    <col min="4" max="4" width="16" customWidth="1"/>
    <col min="5" max="5" width="14" customWidth="1"/>
    <col min="6" max="6" width="16" customWidth="1"/>
    <col min="7" max="7" width="14" customWidth="1"/>
    <col min="8" max="8" width="18" customWidth="1"/>
    <col min="9" max="9" width="22" customWidth="1"/>
    <col min="10" max="10" width="14" customWidth="1"/>
    <col min="11" max="11" width="20" customWidth="1"/>
    <col min="12" max="12" width="48" customWidth="1"/>
  </cols>
  <sheetData>
    ${sheet1DataRows}
  </sheetData>
  <autoFilter ref="A1:L${totalTaskRows}"/>
</worksheet>`;

    // 7. xl/worksheets/sheet2.xml (Analytics & Summary Worksheet)
    const totalCount = tasksToExport.length;
    const completedCount = tasksToExport.filter(t => t.completed).length;
    const pendingCount = tasksToExport.filter(t => !t.completed).length;
    const inProgressCount = tasksToExport.filter(t => !t.completed && (t.subtasks || []).some(s => s.completed)).length;
    const highPriorityCount = tasksToExport.filter(t => (t.priority || '').toLowerCase() === 'high').length;
    const overdueCount = tasksToExport.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
    const dueTodayCount = tasksToExport.filter(t => !t.completed && t.dueDate === todayStr).length;
    const starredCount = tasksToExport.filter(t => t.starred).length;
    const productivityPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const summaryMetrics = [
      { metric: 'Total Exported Tasks', val: `${totalCount}`, note: 'Total tasks included in this spreadsheet export' },
      { metric: 'Completed Tasks', val: `${completedCount}`, note: 'Tasks checked off and completed' },
      { metric: 'In Progress Tasks', val: `${inProgressCount}`, note: 'Active tasks with partially completed checklist items' },
      { metric: 'Pending Tasks', val: `${pendingCount}`, note: 'Active tasks remaining to be done' },
      { metric: 'Productivity Score', val: `${productivityPercent}%`, note: 'Overall completion percentage' },
      { metric: 'High Priority (Urgent)', val: `${highPriorityCount}`, note: 'Tasks designated as high focus' },
      { metric: 'Overdue Tasks', val: `${overdueCount}`, note: 'Active tasks past their due date' },
      { metric: 'Due Today', val: `${dueTodayCount}`, note: 'Tasks scheduled for completion today' },
      { metric: 'Starred Milestones', val: `${starredCount}`, note: 'Tasks flagged with gold star for high importance' },
      { metric: 'Export Scope', val: scopeDescription, note: 'Exported filter criteria applied' },
      { metric: 'Export Timestamp', val: exportTimeStr, note: 'Generated by TaskFlow Productivity Manager' },
      { metric: 'Application Architecture', val: 'Pure Vanilla Web Standards (Zero Runtime Dependency)', note: 'TaskFlow OpenXML Exporter' }
    ];

    let sheet2DataRows = `<row r="1" ht="28" customHeight="1">
      <c r="A1" s="1" t="inlineStr"><is><t>Summary Metric</t></is></c>
      <c r="B1" s="1" t="inlineStr"><is><t>Metric Value</t></is></c>
      <c r="C1" s="1" t="inlineStr"><is><t>Notes &amp; Context</t></is></c>
    </row>`;

    summaryMetrics.forEach((m, idx) => {
      const r = idx + 2;
      const isEven = idx % 2 === 1;
      const leftStyle = isEven ? 4 : 2;
      const centerStyle = isEven ? 5 : 3;

      sheet2DataRows += `<row r="${r}" ht="22" customHeight="1">
        <c r="A${r}" s="${leftStyle}" t="inlineStr"><is><t>${escapeXml(m.metric)}</t></is></c>
        <c r="B${r}" s="${centerStyle}" t="inlineStr"><is><t>${escapeXml(m.val)}</t></is></c>
        <c r="C${r}" s="${leftStyle}" t="inlineStr"><is><t>${escapeXml(m.note)}</t></is></c>
      </row>`;
    });

    const worksheet2Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView tabSelected="0" workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <cols>
    <col min="1" max="1" width="30" customWidth="1"/>
    <col min="2" max="2" width="25" customWidth="1"/>
    <col min="3" max="3" width="50" customWidth="1"/>
  </cols>
  <sheetData>
    ${sheet2DataRows}
  </sheetData>
  <autoFilter ref="A1:C${summaryMetrics.length + 1}"/>
</worksheet>`;

    const zipFiles = [
      { name: '[Content_Types].xml', data: contentTypesXml },
      { name: '_rels/.rels', data: rootRelsXml },
      { name: 'xl/_rels/workbook.xml.rels', data: workbookRelsXml },
      { name: 'xl/workbook.xml', data: workbookXml },
      { name: 'xl/styles.xml', data: stylesXml },
      { name: 'xl/worksheets/sheet1.xml', data: worksheet1Xml },
      { name: 'xl/worksheets/sheet2.xml', data: worksheet2Xml }
    ];

    return createZipArchive(zipFiles);
  }

  function generateCsvContent(tasksToExport) {
    const headers = [
      'Task ID',
      'Task Title',
      'Description',
      'Status',
      'Priority',
      'Category',
      'Due Date',
      'Due Status',
      'Created Date',
      'Starred',
      'Checklist Progress',
      'Checklist Details'
    ];

    function escapeCsvCell(val) {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }

    const todayStr = getRelativeDateString(0);
    const rows = [headers.map(escapeCsvCell).join(',')];

    tasksToExport.forEach(task => {
      const totalSub = (task.subtasks || []).length;
      const compSub = (task.subtasks || []).filter(s => s.completed).length;
      let status = 'Pending';
      if (task.completed) status = 'Completed';
      else if (totalSub > 0 && compSub > 0) status = 'In Progress';

      let dueStatus = 'No Due Date';
      if (task.completed) dueStatus = 'Completed';
      else if (task.dueDate) {
        if (task.dueDate < todayStr) dueStatus = 'Overdue';
        else if (task.dueDate === todayStr) dueStatus = 'Due Today';
        else dueStatus = 'Upcoming';
      }

      const createdStr = task.createdAt ? new Date(task.createdAt).toLocaleString('en-US') : '';
      const progressStr = totalSub > 0 ? `${compSub}/${totalSub} (${Math.round((compSub / totalSub) * 100)}%)` : (task.completed ? '100%' : 'None');
      const subtaskDetails = (task.subtasks || []).map(s => (s.completed ? '[✓] ' : '[ ] ') + s.title).join(' | ');

      const row = [
        task.id,
        task.title,
        task.notes || '',
        status,
        capitalizeFirstLetter(task.priority || 'medium'),
        task.category || 'General',
        task.dueDate || '',
        dueStatus,
        createdStr,
        task.starred ? 'Yes' : 'No',
        progressStr,
        subtaskDetails
      ];
      rows.push(row.map(escapeCsvCell).join(','));
    });

    // Add UTF-8 Byte Order Mark (\uFEFF) for immediate compatibility in Excel
    return '\uFEFF' + rows.join('\r\n');
  }

  function triggerFileDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    setTimeout(() => {
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    }, 300);
  }

  function exportTasksToExcel(tasksToExport, scopeDescription = 'All Tasks') {
    if (!tasksToExport || tasksToExport.length === 0) {
      showToast('No tasks available to export. Create a task first!', 'error');
      return;
    }

    try {
      const todayStr = getRelativeDateString(0);
      const filename = `todo-list-export-${todayStr}.xlsx`;
      const zipBytes = buildTasksXlsxZip(tasksToExport, scopeDescription);
      const blob = new Blob([zipBytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      triggerFileDownload(blob, filename);
      if (isSoundEnabled) playUiSound('complete');
      showToast(`Exported ${tasksToExport.length} ${tasksToExport.length === 1 ? 'task' : 'tasks'} to ${filename}`, 'success');
    } catch (err) {
      console.error('Failed to export tasks to Excel:', err);
      showToast('Export failed: ' + (err.message || 'Unable to generate Excel file'), 'error');
    }
  }

  function exportTasksToCsv(tasksToExport, scopeDescription = 'All Tasks') {
    if (!tasksToExport || tasksToExport.length === 0) {
      showToast('No tasks available to export as CSV', 'error');
      return;
    }

    try {
      const todayStr = getRelativeDateString(0);
      const filename = `todo-list-export-${todayStr}.csv`;
      const csvContent = generateCsvContent(tasksToExport);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      triggerFileDownload(blob, filename);
      if (isSoundEnabled) playUiSound('complete');
      showToast(`Exported ${tasksToExport.length} ${tasksToExport.length === 1 ? 'task' : 'tasks'} to ${filename}`, 'success');
    } catch (err) {
      console.error('Failed to export tasks to CSV:', err);
      showToast('CSV export failed: ' + (err.message || 'Unable to generate CSV'), 'error');
    }
  }

  // Header Dropdown Toggle
  dataMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dataDropdownMenu.classList.toggle('hidden');
    closeExportQuickMenu();
  });

  // Global Outside Click to dismiss dropdowns
  document.addEventListener('click', (e) => {
    if (!dataDropdownMenu.classList.contains('hidden')) {
      dataDropdownMenu.classList.add('hidden');
    }
    if (exportQuickMenu && !exportQuickMenu.classList.contains('hidden')) {
      if (!e.target.closest('.export-dropdown-wrapper')) {
        closeExportQuickMenu();
      }
    }
  });

  // Export Button Click Handlers
  if (exportExcelBtn) {
    // 1-Click direct export of all tasks by default
    exportExcelBtn.addEventListener('click', () => {
      exportTasksToExcel(tasks, 'All Tasks');
    });
  }

  if (exportOptionsToggleBtn) {
    exportOptionsToggleBtn.addEventListener('click', toggleExportQuickMenu);
  }

  if (exportAllExcelBtn) {
    exportAllExcelBtn.addEventListener('click', () => {
      closeExportQuickMenu();
      exportTasksToExcel(tasks, 'All Tasks');
    });
  }

  if (exportFilteredExcelBtn) {
    exportFilteredExcelBtn.addEventListener('click', () => {
      closeExportQuickMenu();
      const filtered = getFilteredAndSortedTasks();
      if (filtered.length === 0) {
        showToast('No tasks match the active filter or search query', 'info');
        return;
      }
      exportTasksToExcel(filtered, `Filtered View (${currentFilter}, ${currentCategory})`);
    });
  }

  if (exportCsvQuickBtn) {
    exportCsvQuickBtn.addEventListener('click', () => {
      closeExportQuickMenu();
      exportTasksToCsv(tasks, 'All Tasks');
    });
  }

  if (exportExcelMenuBtn) {
    exportExcelMenuBtn.addEventListener('click', () => {
      if (dataDropdownMenu) dataDropdownMenu.classList.add('hidden');
      exportTasksToExcel(tasks, 'All Tasks');
    });
  }

  if (exportCsvMenuBtn) {
    exportCsvMenuBtn.addEventListener('click', () => {
      if (dataDropdownMenu) dataDropdownMenu.classList.add('hidden');
      exportTasksToCsv(tasks, 'All Tasks');
    });
  }

  exportJsonBtn.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `taskflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Tasks exported to JSON', 'success');
  });

  importJsonInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          tasks = imported;
          saveTasksToStorage();
          renderTasks();
          showToast(`Successfully imported ${imported.length} tasks`, 'success');
        } else {
          showToast('Invalid JSON file format', 'error');
        }
      } catch {
        showToast('Error parsing JSON file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  resetSampleBtn.addEventListener('click', () => {
    if (confirm('Load sample tasks? This will append the starter task set.')) {
      tasks = [...tasks, ...DEFAULT_SAMPLE_TASKS.map(t => ({ ...t, id: 'sample-' + Date.now() + Math.random().toString(36).substring(2, 5) }))];
      saveTasksToStorage();
      renderTasks();
      showToast('Sample tasks loaded', 'success');
    }
  });

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-close-btn" aria-label="Close notification">✕</button>
    `;

    toast.querySelector('.toast-close-btn').addEventListener('click', () => {
      toast.remove();
    });

    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        setTimeout(() => toast.remove(), 250);
      }
    }, 3800);
  }

  function showUndoToast(message, onUndo) {
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
    }

    // Remove any previous undo toasts
    const existingUndo = toastContainer.querySelector('.toast-undo');
    if (existingUndo) existingUndo.remove();

    const toast = document.createElement('div');
    toast.className = 'toast toast-undo';
    toast.innerHTML = `
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-undo-btn">Undo</button>
      <button class="toast-close-btn" aria-label="Close notification">✕</button>
    `;

    toast.querySelector('.toast-undo-btn').addEventListener('click', () => {
      onUndo();
      toast.remove();
    });

    toast.querySelector('.toast-close-btn').addEventListener('click', () => {
      toast.remove();
    });

    toastContainer.appendChild(toast);

    undoTimeoutId = setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        setTimeout(() => toast.remove(), 250);
      }
      lastDeletedTask = null;
    }, 6000);
  }

  // --- Keyboard Shortcuts ---
  document.addEventListener('keydown', (e) => {
    // Focus search on '/'
    if (e.key === '/' && document.activeElement !== taskTitleInput && document.activeElement !== taskNotesInput && document.activeElement !== taskSearchInput && document.activeElement !== editTitleInput && document.activeElement !== editNotesInput) {
      e.preventDefault();
      taskSearchInput.focus();
      return;
    }

    // Escape closes modals, menus, and search
    if (e.key === 'Escape') {
      if (!editModal.classList.contains('hidden')) {
        closeEditModal();
      } else if (!dataDropdownMenu.classList.contains('hidden')) {
        dataDropdownMenu.classList.add('hidden');
      } else if (exportQuickMenu && !exportQuickMenu.classList.contains('hidden')) {
        closeExportQuickMenu();
      } else if (document.activeElement === taskSearchInput && taskSearchInput.value) {
        clearSearchBtn.click();
      }
    }
  });

  // --- Helpers ---
  function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- Speech to Text (Web Speech API) ---
  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const voiceInputBtn = document.getElementById('voice-input-btn');
    const voiceStatusBar = document.getElementById('voice-status-bar');
    const voiceStatusText = document.getElementById('voice-status-text');
    const voiceStopBtn = document.getElementById('voice-stop-btn');

    if (!voiceInputBtn) return;

    if (!SpeechRecognition) {
      voiceInputBtn.title = 'Speech to text is not supported in this browser';
      voiceInputBtn.addEventListener('click', () => {
        showToast('Speech recognition is not supported in this browser. Please use Chrome, Edge, or the Android app!', 'error');
      });
      document.querySelectorAll('.voice-field-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          showToast('Speech recognition not supported in this browser', 'error');
        });
      });
      return;
    }

    let recognition = null;
    let isListening = false;
    let activeVoiceTarget = null;
    let baseTranscript = '';

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';
    } catch (e) {
      console.warn('SpeechRecognition init error:', e);
      return;
    }

    function startListening(targetInput, triggerBtn) {
      if (isListening) {
        stopListening();
        if (activeVoiceTarget === targetInput) return;
      }

      try {
        activeVoiceTarget = targetInput;
        baseTranscript = targetInput.value ? (targetInput.value.trim() + ' ') : '';
        isListening = true;

        recognition.start();

        if (triggerBtn) triggerBtn.classList.add('is-listening');
        if (voiceInputBtn && (triggerBtn === voiceInputBtn || !triggerBtn)) {
          voiceInputBtn.classList.add('is-listening');
        }
        if (voiceStatusBar) {
          voiceStatusBar.classList.remove('hidden');
          voiceStatusText.textContent = 'Listening... Speak your task now';
        }
        playUiSound('add');
        showToast('Microphone active. Speak now...', 'info');
      } catch (err) {
        console.warn('Speech start error:', err);
        stopListening();
      }
    }

    function stopListening() {
      if (!isListening && !recognition) return;
      isListening = false;
      try {
        recognition.stop();
      } catch (e) {}

      document.querySelectorAll('.is-listening').forEach(el => el.classList.remove('is-listening'));
      if (voiceStatusBar) {
        voiceStatusBar.classList.add('hidden');
      }
      if (activeVoiceTarget) {
        activeVoiceTarget.focus();
      }
      activeVoiceTarget = null;
    }

    recognition.onresult = (event) => {
      let interim = '';
      let newlyFinalized = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          newlyFinalized += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (newlyFinalized) {
        baseTranscript += newlyFinalized + ' ';
      }

      const combinedText = (baseTranscript + interim).trim();
      if (activeVoiceTarget) {
        activeVoiceTarget.value = combinedText;
        activeVoiceTarget.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (voiceStatusText) {
        voiceStatusText.textContent = interim ? `"${interim}"` : 'Listening... Speak now';
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech error event:', event.error);
      if (event.error === 'not-allowed') {
        showToast('Microphone permission denied. Please allow microphone access.', 'error');
        stopListening();
      } else if (event.error === 'no-speech') {
        // Just silent pause, keep listening or wait
      } else {
        showToast(`Voice input: ${event.error}`, 'info');
        stopListening();
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {
          stopListening();
        }
      } else {
        stopListening();
      }
    };

    voiceInputBtn.addEventListener('click', () => {
      if (isListening && activeVoiceTarget === taskTitleInput) {
        stopListening();
      } else {
        startListening(taskTitleInput, voiceInputBtn);
      }
    });

    if (voiceStopBtn) {
      voiceStopBtn.addEventListener('click', () => {
        stopListening();
      });
    }

    document.querySelectorAll('.voice-field-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.voiceTarget;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          if (isListening && activeVoiceTarget === targetEl) {
            stopListening();
          } else {
            startListening(targetEl, btn);
          }
        }
      });
    });
  }

  // --- Setup Event Listeners ---
  themeToggleBtn.addEventListener('click', toggleTheme);
  soundToggleBtn.addEventListener('click', toggleSound);

  // --- Initialization ---
  loadPersistedData();
  updateGreetingAndDate();
  setupSpeechRecognition();
  renderTasks();

  // Refresh clock every minute
  setInterval(updateGreetingAndDate, 60000);

})();
