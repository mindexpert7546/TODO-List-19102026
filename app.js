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

  // Bulk buttons
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

    // Theme
    const savedTheme = localStorage.getItem('taskflow_theme') || 'dark';
    applyTheme(savedTheme);

    // Sound
    const savedSound = localStorage.getItem('taskflow_sound');
    if (savedSound !== null) {
      isSoundEnabled = savedSound === 'true';
    }
    updateSoundButtonUi();

    // Set default due date in form to today
    taskDueDate.value = getRelativeDateString(0);
  }

  function saveTasksToStorage() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }

  // --- Theme Management ---
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskflow_theme', theme);
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
    localStorage.setItem('taskflow_sound', isSoundEnabled);
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

  // --- Render Tasks Feed ---
  function renderTasks() {
    updateDashboardStats();
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
  dataMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dataDropdownMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    if (!dataDropdownMenu.classList.contains('hidden')) {
      dataDropdownMenu.classList.add('hidden');
    }
  });

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

    // Escape closes modals and search
    if (e.key === 'Escape') {
      if (!editModal.classList.contains('hidden')) {
        closeEditModal();
      } else if (!dataDropdownMenu.classList.contains('hidden')) {
        dataDropdownMenu.classList.add('hidden');
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
