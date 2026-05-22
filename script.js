// ===== DOM Elements =====
const heroScreen = document.getElementById('heroScreen');
const getStartedBtn = document.getElementById('getStartedBtn');
const appContainer = document.getElementById('appContainer');
const themeToggle = document.getElementById('themeToggle');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const dateInput = document.getElementById('dateInput');
const priorityDropdownBtn = document.getElementById('priorityDropdownBtn');
const priorityDropdownMenu = document.getElementById('priorityDropdownMenu');
const priorityIndicator = document.getElementById('priorityIndicator');
const priorityLabel = document.getElementById('priorityLabel');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const taskCounter = document.getElementById('taskCounter');
const progressPercentage = document.getElementById('progressPercentage');
const progressBar = document.getElementById('progressBar');
const editModal = document.getElementById('editModal');
const editTaskInput = document.getElementById('editTaskInput');
const editDateInput = document.getElementById('editDateInput');
const editPriorityBtn = document.getElementById('editPriorityBtn');
const editPriorityMenu = document.getElementById('editPriorityMenu');
const editPriorityIndicator = document.getElementById('editPriorityIndicator');
const editPriorityLabel = document.getElementById('editPriorityLabel');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

// ===== State =====
let tasks = [];
let currentFilter = 'all';
let currentSearch = '';
let selectedPriority = null;
let editingTaskId = null;
let editSelectedPriority = null;

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadTasks();
    setupEventListeners();
});

// ===== Event Listeners =====
function setupEventListeners() {
    // Hero Screen
    getStartedBtn.addEventListener('click', showApp);

    // Theme Toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Add Task
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Priority Dropdown
    priorityDropdownBtn.addEventListener('click', togglePriorityDropdown);
    document.querySelectorAll('#priorityDropdownMenu .priority-option').forEach(option => {
        option.addEventListener('click', () => selectPriority(option.dataset.priority));
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!priorityDropdownBtn.contains(e.target) && !priorityDropdownMenu.contains(e.target)) {
            closePriorityDropdown();
        }
    });

    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    // Clear Completed
    clearCompletedBtn.addEventListener('click', clearCompleted);

    // Task List (Event Delegation)
    taskList.addEventListener('click', handleTaskClick);

    // Edit Modal
    cancelEditBtn.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveEditTask);
    editPriorityBtn.addEventListener('click', toggleEditPriorityMenu);
    document.querySelectorAll('#editPriorityMenu .priority-option').forEach(option => {
        option.addEventListener('click', () => selectEditPriority(option.dataset.priority));
    });

    // Close modal when clicking outside
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });

    // Close edit priority menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!editPriorityBtn.contains(e.target) && !editPriorityMenu.contains(e.target)) {
            closeEditPriorityMenu();
        }
    });
}

// ===== Hero Screen =====
function showApp() {
    heroScreen.classList.add('hidden');
    setTimeout(() => {
        appContainer.classList.add('visible');
    }, 300);
}

// ===== Theme Toggle =====
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// ===== Priority Dropdown =====
function positionDropdown(button, dropdown) {
    // Reset to ensure accurate measurements
    dropdown.style.position = 'absolute';
    dropdown.style.top = '100%';
    dropdown.style.left = '0';
    dropdown.style.width = 'auto';
    dropdown.style.minWidth = '160px';
    
    // Get measurements after reset
    const rect = button.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const minSpace = 10;
    
    // Check if dropdown goes below viewport
    if (spaceBelow < dropdownRect.height + minSpace && rect.top > dropdownRect.height + minSpace) {
        // Position above instead
        dropdown.style.top = 'auto';
        dropdown.style.bottom = '100%';
        dropdown.style.marginBottom = '8px';
        dropdown.style.marginTop = '0';
    } else {
        // Position below (default)
        dropdown.style.top = '100%';
        dropdown.style.bottom = 'auto';
        dropdown.style.marginTop = '8px';
        dropdown.style.marginBottom = '0';
    }
}

function togglePriorityDropdown() {
    const isOpen = priorityDropdownMenu.classList.contains('open');
    closePriorityDropdown();
    if (!isOpen) {
        priorityDropdownMenu.classList.add('open');
        priorityDropdownBtn.classList.add('open');
        // Position the dropdown after a small delay to ensure it's rendered
        setTimeout(() => positionDropdown(priorityDropdownBtn, priorityDropdownMenu), 0);
    }
}

function closePriorityDropdown() {
    priorityDropdownMenu.classList.remove('open');
    priorityDropdownBtn.classList.remove('open');
    priorityDropdownMenu.style.top = '';
    priorityDropdownMenu.style.left = '';
}

function selectPriority(priority) {
    selectedPriority = priority;
    priorityIndicator.className = `priority-indicator ${priority}`;
    priorityLabel.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
    closePriorityDropdown();
}

// ===== Edit Priority Menu =====
function toggleEditPriorityMenu() {
    const isOpen = editPriorityMenu.classList.contains('open');
    closeEditPriorityMenu();
    if (!isOpen) {
        editPriorityMenu.classList.add('open');
        editPriorityBtn.classList.add('open');
        // Position the dropdown after a small delay to ensure it's rendered
        setTimeout(() => positionDropdown(editPriorityBtn, editPriorityMenu), 0);
    }
}

function closeEditPriorityMenu() {
    editPriorityMenu.classList.remove('open');
    editPriorityBtn.classList.remove('open');
    editPriorityMenu.style.top = '';
    editPriorityMenu.style.left = '';
}

function selectEditPriority(priority) {
    editSelectedPriority = priority;
    editPriorityIndicator.className = `priority-indicator ${priority}`;
    editPriorityLabel.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
    closeEditPriorityMenu();
}

// ===== Task Management =====
function addTask() {
    const title = taskInput.value.trim();
    const dueDate = dateInput.value;
    const priority = selectedPriority || 'low';

    if (!title) {
        taskInput.classList.add('shake');
        setTimeout(() => taskInput.classList.remove('shake'), 300);
        return;
    }

    const task = {
        id: Date.now(),
        title,
        dueDate,
        priority,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
    resetInput();
}

function resetInput() {
    taskInput.value = '';
    dateInput.value = '';
    selectedPriority = null;
    priorityIndicator.className = 'priority-indicator';
    priorityLabel.textContent = 'Priority';
}

function handleTaskClick(e) {
    const taskCard = e.target.closest('.task-card');
    if (!taskCard) return;

    const taskId = parseInt(taskCard.dataset.id);

    if (e.target.closest('.task-checkbox')) {
        toggleTaskComplete(taskId);
    } else if (e.target.closest('.task-action-btn.edit')) {
        openEditModal(taskId);
    } else if (e.target.closest('.task-action-btn.delete')) {
        deleteTask(taskId);
    }
}

function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(taskId) {
    const taskCard = document.querySelector(`.task-card[data-id="${taskId}"]`);
    if (taskCard) {
        taskCard.classList.add('removing');
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
        }, 300);
    }
}

function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;
    editTaskInput.value = task.title;
    editDateInput.value = task.dueDate;
    editSelectedPriority = task.priority;
    editPriorityIndicator.className = `priority-indicator ${task.priority}`;
    editPriorityLabel.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

    editModal.classList.add('open');
}

function closeEditModal() {
    editModal.classList.remove('open');
    editingTaskId = null;
    editSelectedPriority = null;
}

function saveEditTask() {
    const title = editTaskInput.value.trim();
    const dueDate = editDateInput.value;
    const priority = editSelectedPriority || 'low';

    if (!title) {
        editTaskInput.classList.add('shake');
        setTimeout(() => editTaskInput.classList.remove('shake'), 300);
        return;
    }

    const task = tasks.find(t => t.id === editingTaskId);
    if (task) {
        task.title = title;
        task.dueDate = dueDate;
        task.priority = priority;
        saveTasks();
        renderTasks();
    }

    closeEditModal();
}

// ===== Search & Filter =====
function handleSearch() {
    currentSearch = searchInput.value.trim().toLowerCase();
    renderTasks();
}

function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTasks();
}

function clearCompleted() {
    const completedTasks = tasks.filter(t => t.completed);
    completedTasks.forEach(task => {
        const taskCard = document.querySelector(`.task-card[data-id="${task.id}"]`);
        if (taskCard) {
            taskCard.classList.add('removing');
        }
    });

    setTimeout(() => {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
    }, 300);
}

// ===== Render Tasks =====
function renderTasks() {
    let filteredTasks = tasks;

    // Apply search filter
    if (currentSearch) {
        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(currentSearch)
        );
    }

    // Apply status filter
    if (currentFilter === 'pending') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }

    // Clear task list
    taskList.innerHTML = '';

    // Show empty state or tasks
    if (filteredTasks.length === 0) {
        emptyState.classList.add('visible');
    } else {
        emptyState.classList.remove('visible');
        filteredTasks.forEach(task => {
            const taskCard = createTaskCard(task);
            taskList.appendChild(taskCard);
        });
    }

    updateProgress();
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.dataset.id = task.id;

    const dueDateText = formatDueDate(task.dueDate);
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

    card.innerHTML = `
        <div class="task-checkbox ${task.completed ? 'checked' : ''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </div>
        <div class="task-content">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <div class="task-meta">
                <span class="priority-badge ${task.priority}">${task.priority}</span>
                ${task.dueDate ? `<span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${dueDateText}
                </span>` : ''}
            </div>
        </div>
        <div class="task-actions">
            <button class="task-action-btn edit" aria-label="Edit task">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="task-action-btn delete" aria-label="Delete task">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `;

    return card;
}

function formatDueDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays < 0 && diffDays > -1) {
        return 'Today';
    } else if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Tomorrow';
    } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else if (diffHours > 0 && diffHours < 24) {
        return `In ${diffHours}h`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Progress Bar =====
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    taskCounter.textContent = `${completed} of ${total} completed`;
    progressPercentage.textContent = `${percentage}% Completed`;
    progressBar.style.width = `${percentage}%`;
}

// ===== Local Storage =====
function saveTasks() {
    localStorage.setItem('srTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('srTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

// ===== Utility Functions =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== Handle Window Resize for Dropdown =====
window.addEventListener('resize', () => {
    if (priorityDropdownMenu.classList.contains('open')) {
        closePriorityDropdown();
    }
    if (editPriorityMenu.classList.contains('open')) {
        closeEditPriorityMenu();
    }
});
