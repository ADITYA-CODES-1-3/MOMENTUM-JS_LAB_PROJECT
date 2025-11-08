// DOM Elements
const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const categoryList = document.getElementById('categoryList');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoryModal = document.getElementById('categoryModal');
const closeCategoryModal = document.getElementById('closeCategoryModal');
const cancelCategory = document.getElementById('cancelCategory');
const saveCategory = document.getElementById('saveCategory');
const categoryName = document.getElementById('categoryName');
const colorOptions = document.getElementById('colorOptions');
const editTaskModal = document.getElementById('editTaskModal');
const closeEditModal = document.getElementById('closeEditModal');
const cancelEdit = document.getElementById('cancelEdit');
const saveEdit = document.getElementById('saveEdit');
const editTaskText = document.getElementById('editTaskText');
const editTaskCategory = document.getElementById('editTaskCategory');
const editTaskPriority = document.getElementById('editTaskPriority');
const editTaskDueDate = document.getElementById('editTaskDueDate');
const currentMonthEl = document.getElementById('currentMonth');
const calendarGrid = document.getElementById('calendarGrid');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const upcomingTasksList = document.getElementById('upcomingTasksList');

// Extended color palette with 12 aesthetic colors
const colorPalette = [
    '#2c3e50', // Dark blue-gray
    '#3498db', // Bright blue
    '#9b59b6', // Purple
    '#1abc9c', // Turquoise
    '#e74c3c', // Red
    '#f39c12', // Orange
    '#2ecc71', // Green
    '#34495e', // Dark gray-blue
    '#16a085', // Dark turquoise
    '#d35400', // Dark orange
    '#8e44ad', // Dark purple
    '#27ae60'  // Dark green
];

// Data
let tasks = JSON.parse(localStorage.getItem('momentum-tasks')) || [];
let categories = JSON.parse(localStorage.getItem('momentum-categories')) || [
    { id: 1, name: 'Work', color: colorPalette[0] },
    { id: 2, name: 'Personal', color: colorPalette[1] },
    { id: 3, name: 'Health', color: colorPalette[6] },
    { id: 4, name: 'Learning', color: colorPalette[3] }
];
let currentFilter = 'all';
let editingTaskId = null;
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedColor = colorPalette[0];

// Initialize the app
function init() {
    // Set default date to today and set min date to today
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.value = today;
    dueDateInput.min = today;
    editTaskDueDate.min = today;
    
    renderTasks();
    updateStats();
    renderCategories();
    populateCategorySelects();
    renderColorOptions();
    renderCalendar();
    renderUpcomingTasks();
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    addCategoryBtn.addEventListener('click', () => {
        categoryModal.style.display = 'flex';
    });
    
    closeCategoryModal.addEventListener('click', () => {
        categoryModal.style.display = 'none';
    });
    
    cancelCategory.addEventListener('click', () => {
        categoryModal.style.display = 'none';
    });
    
    saveCategory.addEventListener('click', saveNewCategory);
    
    closeEditModal.addEventListener('click', () => {
        editTaskModal.style.display = 'none';
    });
    
    cancelEdit.addEventListener('click', () => {
        editTaskModal.style.display = 'none';
    });
    
    saveEdit.addEventListener('click', saveTaskEdit);
    
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === categoryModal) {
            categoryModal.style.display = 'none';
        }
        if (e.target === editTaskModal) {
            editTaskModal.style.display = 'none';
        }
    });
    // Export data
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');

    exportDataBtn.addEventListener('click', exportData);
    importDataBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importData);

}

// Render color options as circles
function renderColorOptions() {
    colorOptions.innerHTML = '';
    
    colorPalette.forEach(color => {
        const colorEl = document.createElement('div');
        colorEl.className = 'color-option';
        colorEl.style.backgroundColor = color;
        
        if (color === selectedColor) {
            colorEl.classList.add('selected');
        }
        
        colorEl.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            colorEl.classList.add('selected');
            selectedColor = color;
        });
        
        colorOptions.appendChild(colorEl);
    });
}

// Add a new task with date validation
function addTask() {
    const text = taskInput.value.trim();
    const category = categorySelect.value;
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }
    
    if (category === '') {
        alert('Please select a category!');
        return;
    }
    
    // Validate due date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (dueDate && dueDate < today) {
        alert('Due date cannot be in the past! Please select today or a future date.');
        return;
    }
    
    const task = {
        id: Date.now(),
        text,
        category,
        priority,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    updateStats();
    renderCalendar();
    renderUpcomingTasks();
    
    // Reset input
    taskInput.value = '';
    taskInput.focus();
}

// Delete a task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
        renderCalendar();
        renderUpcomingTasks();
    }
}

// Toggle task completion
function toggleTaskCompletion(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    updateStats();
    renderCalendar();
    renderUpcomingTasks();
}

// Edit a task
function editTask(id) {
    const task = tasks.find(task => task.id === id);
    editingTaskId = id;
    
    editTaskText.value = task.text;
    editTaskCategory.value = task.category;
    editTaskPriority.value = task.priority;
    editTaskDueDate.value = task.dueDate;
    
    editTaskModal.style.display = 'flex';
}

// Save task edits with date validation
function saveTaskEdit() {
    if (editingTaskId) {
        const text = editTaskText.value.trim();
        const category = editTaskCategory.value;
        const priority = editTaskPriority.value;
        const dueDate = editTaskDueDate.value;
        
        // Validate due date is not in the past
        const today = new Date().toISOString().split('T')[0];
        if (dueDate && dueDate < today) {
            alert('Due date cannot be in the past! Please select today or a future date.');
            return;
        }
        
        tasks = tasks.map(task => {
            if (task.id === editingTaskId) {
                return { 
                    ...task, 
                    text: text,
                    category: category,
                    priority: priority,
                    dueDate: dueDate
                };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
        renderCalendar();
        renderUpcomingTasks();
        editTaskModal.style.display = 'none';
        editingTaskId = null;
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('momentum-tasks', JSON.stringify(tasks));
}

// Save categories to localStorage
function saveCategories() {
    localStorage.setItem('momentum-categories', JSON.stringify(categories));
}

// Render tasks based on filter
function renderTasks() {
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (currentFilter === 'high') {
        filteredTasks = tasks.filter(task => task.priority === 'high');
    } else if (currentFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filteredTasks = tasks.filter(task => task.dueDate === today);
    } else if (currentFilter === 'week') {
        const today = new Date();
        const weekFromNow = new Date(today);
        weekFromNow.setDate(today.getDate() + 7);
        
        filteredTasks = tasks.filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate >= today && dueDate <= weekFromNow;
        });
    }
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No tasks found</h3>
                <p>${currentFilter === 'all' ? 'Add your first task to get started!' : 'No tasks match your filter'}</p>
            </div>
        `;
        return;
    }
    
    // Sort tasks: high priority first, then by due date
    filteredTasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        
        // If both have due dates, sort by due date
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        
        // If only one has due date, put the one with due date first
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        
        // Otherwise, sort by creation date
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        
        const category = categories.find(c => c.name === task.category);
        const categoryColor = category ? category.color : colorPalette[0];
        
        // Determine due date styling
        let dueDateClass = 'task-due-date';
        if (task.dueDate) {
            const today = new Date().toISOString().split('T')[0];
            const dueDate = task.dueDate;
            
            if (dueDate < today && !task.completed) {
                dueDateClass += ' overdue';
            } else if (dueDate === today && !task.completed) {
                dueDateClass += ' today';
            }
        }
        
        const dueDateText = task.dueDate ? 
            new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
            'No due date';
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <span class="task-category" style="background-color: ${categoryColor}">${task.category}</span>
            <div class="${dueDateClass}">
                <i class="far fa-calendar"></i> ${dueDateText}
            </div>
            <div class="task-actions">
                <button class="task-btn edit-btn" title="Edit Task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn delete-btn" title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners to the buttons
        const checkbox = li.querySelector('.task-checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
        editBtn.addEventListener('click', () => editTask(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskList.appendChild(li);
    });
}

// Update statistics
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    totalTasksEl.textContent = totalTasks;
    completedTasksEl.textContent = completedTasks;
    pendingTasksEl.textContent = pendingTasks;
}

// Render categories
function renderCategories() {
    categoryList.innerHTML = '';
    
    categories.forEach(category => {
        const categoryEl = document.createElement('div');
        categoryEl.className = 'category-tag';
        categoryEl.style.backgroundColor = category.color;
        categoryEl.innerHTML = `
            <span>${category.name}</span>
            <i class="fas fa-times delete-category" data-id="${category.id}"></i>
        `;
        
        categoryEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-category')) {
                e.stopPropagation();
                deleteCategory(category.id);
            } else {
                // Filter tasks by this category
                filterBtns.forEach(btn => btn.classList.remove('active'));
                currentFilter = 'all';
                renderTasks();
                // Highlight tasks with this category
                document.querySelectorAll('.task-item').forEach(item => {
                    if (item.querySelector('.task-category').textContent === category.name) {
                        item.style.boxShadow = '0 0 0 2px ' + category.color;
                        setTimeout(() => {
                            item.style.boxShadow = '';
                        }, 2000);
                    }
                });
            }
        });
        
        categoryList.appendChild(categoryEl);
    });
}

// Populate category selects
function populateCategorySelects() {
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    editTaskCategory.innerHTML = '<option value="">Select Category</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
        
        const editOption = option.cloneNode(true);
        editTaskCategory.appendChild(editOption);
    });
}

// Save new category
function saveNewCategory() {
    const name = categoryName.value.trim();
    
    if (name === '') {
        alert('Please enter a category name!');
        return;
    }
    
    if (categories.some(category => category.name.toLowerCase() === name.toLowerCase())) {
        alert('Category already exists!');
        return;
    }
    
    const newCategory = {
        id: Date.now(),
        name,
        color: selectedColor
    };
    
    categories.push(newCategory);
    saveCategories();
    renderCategories();
    populateCategorySelects();
    
    categoryModal.style.display = 'none';
    categoryName.value = '';
    selectedColor = colorPalette[0];
    renderColorOptions();
}

// Delete category
function deleteCategory(id) {
    const category = categories.find(c => c.id === id);
    const tasksWithCategory = tasks.filter(task => task.category === category.name);
    
    if (tasksWithCategory.length > 0) {
        if (!confirm(`This category has ${tasksWithCategory.length} task(s). Deleting it will remove the category from these tasks. Continue?`)) {
            return;
        }
        
        // Remove category from tasks
        tasks = tasks.map(task => {
            if (task.category === category.name) {
                return { ...task, category: '' };
            }
            return task;
        });
        saveTasks();
    }
    
    categories = categories.filter(c => c.id !== id);
    saveCategories();
    renderCategories();
    populateCategorySelects();
    renderTasks();
}

// Render calendar
function renderCalendar() {
    // Update current month display
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    currentMonthEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Clear calendar grid
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayNames.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day-header';
        dayEl.textContent = day;
        calendarGrid.appendChild(dayEl);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonthToday = today.getMonth();
    const currentYearToday = today.getFullYear();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        // Check if this day has tasks
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTasks = tasks.filter(task => task.dueDate === dateStr && !task.completed);
        
        if (dayTasks.length > 0) {
            dayEl.classList.add('has-tasks');
        }
        
        // Highlight current day
        if (day === currentDay && currentMonth === currentMonthToday && currentYear === currentYearToday) {
            dayEl.classList.add('active');
        }
        
        // Add click event to filter tasks by date
        dayEl.addEventListener('click', () => {
            filterBtns.forEach(btn => btn.classList.remove('active'));
            currentFilter = 'all';
            
            // Highlight the selected day
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('active'));
            dayEl.classList.add('active');
            
            // Filter tasks to show only tasks for this date
            const filteredTasks = tasks.filter(task => task.dueDate === dateStr);
            renderFilteredTasks(filteredTasks, `Tasks due on ${new Date(dateStr).toLocaleDateString()}`);
        });
        
        calendarGrid.appendChild(dayEl);
    }
}

// Render filtered tasks (for calendar click)
function renderFilteredTasks(filteredTasks, title) {
    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No tasks for this date</h3>
                <p>${title}</p>
            </div>
        `;
        return;
    }
    
    // Create a title for the filtered view
    const titleEl = document.createElement('div');
    titleEl.style.padding = '10px';
    titleEl.style.fontWeight = 'bold';
    titleEl.style.borderBottom = '1px solid #e2e8f0';
    titleEl.style.marginBottom = '1rem';
    titleEl.textContent = title;
    taskList.appendChild(titleEl);
    
    // Render the filtered tasks
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        
        const category = categories.find(c => c.name === task.category);
        const categoryColor = category ? category.color : colorPalette[0];
        
        // Determine due date styling
        let dueDateClass = 'task-due-date';
        if (task.dueDate) {
            const today = new Date().toISOString().split('T')[0];
            const dueDate = task.dueDate;
            
            if (dueDate < today && !task.completed) {
                dueDateClass += ' overdue';
            } else if (dueDate === today && !task.completed) {
                dueDateClass += ' today';
            }
        }
        
        const dueDateText = task.dueDate ? 
            new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
            'No due date';
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <span class="task-category" style="background-color: ${categoryColor}">${task.category}</span>
            <div class="${dueDateClass}">
                <i class="far fa-calendar"></i> ${dueDateText}
            </div>
            <div class="task-actions">
                <button class="task-btn edit-btn" title="Edit Task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn delete-btn" title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners to the buttons
        const checkbox = li.querySelector('.task-checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
        editBtn.addEventListener('click', () => editTask(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskList.appendChild(li);
    });
}

// Render upcoming tasks
function renderUpcomingTasks() {
    upcomingTasksList.innerHTML = '';
    
    // Get today and next 7 days
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    // Filter tasks due in the next 7 days and not completed
    const upcomingTasks = tasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        
        const dueDate = new Date(task.dueDate);
        return dueDate >= now && dueDate <= nextWeek;
    });
    
    // Sort by due date
    upcomingTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    if (upcomingTasks.length === 0) {
        upcomingTasksList.innerHTML = `
            <div class="empty-state" style="padding: 1rem;">
                <i class="far fa-calendar-check"></i>
                <p>No upcoming tasks</p>
            </div>
        `;
        return;
    }
    
    // Display up to 5 upcoming tasks
    const tasksToShow = upcomingTasks.slice(0, 5);
    
    tasksToShow.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = 'upcoming-task-item';
        
        const dueDate = new Date(task.dueDate);
        const todayStr = now.toDateString();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        
        let dateText = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        if (dueDate.toDateString() === todayStr) {
            dateText = 'Today';
        } else if (dueDate.toDateString() === tomorrow.toDateString()) {
            dateText = 'Tomorrow';
        }
        
        taskEl.innerHTML = `
            <div class="upcoming-task-date">${dateText}</div>
            <div class="upcoming-task-text">${task.text}</div>
        `;
        
        taskEl.addEventListener('click', () => {
            // Find and highlight this task in the main list
            const taskItems = document.querySelectorAll('.task-item');
            taskItems.forEach(item => {
                const textEl = item.querySelector('.task-text');
                if (textEl && textEl.textContent === task.text) {
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    item.style.boxShadow = '0 0 0 2px var(--primary)';
                    setTimeout(() => {
                        item.style.boxShadow = '';
                    }, 3000);
                }
            });
        });
        
        upcomingTasksList.appendChild(taskEl);
    });
}
function exportData() {
    const data = {
        tasks: tasks,
        categories: categories,
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `momentum_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    alert('Data exported successfully! Keep this file safe.');
}
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (!importedData.tasks || !importedData.categories) {
                alert('Invalid file format! Please select a valid Momentum backup file.');
                return;
            }

            if (!confirm('Importing will replace all your current data. Continue?')) return;

            // Replace existing data
            tasks = importedData.tasks;
            categories = importedData.categories;

            // Save to localStorage
            saveTasks();
            saveCategories();

            // Refresh UI
            renderTasks();
            renderCategories();
            populateCategorySelects();
            updateStats();
            renderCalendar();
            renderUpcomingTasks();

            alert('Data imported successfully!');
        } catch (err) {
            alert('Error importing data: ' + err.message);
        }
    };

    reader.readAsText(file);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);