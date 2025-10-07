class TaskManager {
    constructor() {
        this.apiUrl = '/api/tasks';
        this.currentFilter = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTasks();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('taskForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTask();
        });

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const status = e.target.dataset.status;
                this.loadTasks(status);
            });
        });

        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
                this.switchView(e.target.dataset.view);
            });
        });
    }

    switchView(viewName) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');
    }

    displayResponse(data, status = 200) {
        const responseBox = document.getElementById('apiResponse');
        const timestamp = new Date().toLocaleTimeString();
        const formattedResponse = {
            timestamp,
            status,
            response: data
        };
        responseBox.textContent = JSON.stringify(formattedResponse, null, 2);
    }

    clearResponse() {
        document.getElementById('apiResponse').textContent = 'Waiting for API request...';
    }

    async createTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const status = document.getElementById('taskStatus').value;

        if (!this.validateForm(title)) {
            return;
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description: description || null,
                    status
                })
            });

            const data = await response.json();
            this.displayResponse(data, response.status);

            if (data.success) {
                this.resetForm();
                this.loadTasks(this.currentFilter);
                this.showNotification('Task created successfully', 'success');
            } else {
                this.showNotification('Failed to create task', 'error');
            }
        } catch (error) {
            this.displayResponse({ error: error.message }, 500);
            this.showNotification('Network error occurred', 'error');
        }
    }

    async loadTasks(status = '') {
        this.currentFilter = status;
        
        try {
            const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;
            const response = await fetch(url);
            const data = await response.json();
            
            this.displayResponse(data, response.status);

            if (data.success && data.data) {
                this.renderTasks(data.data);
            }
        } catch (error) {
            this.displayResponse({ error: error.message }, 500);
            this.showNotification('Failed to load tasks', 'error');
        }
    }

    renderTasks(tasks) {
        const container = document.getElementById('tasksList');

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p class="empty-text">No tasks found</p>
                    <p class="empty-subtext">${this.currentFilter ? 'Try a different filter' : 'Create your first task to get started'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => this.createTaskCard(task)).join('');
    }

    createTaskCard(task) {
        return `
            <div class="task-item">
                <div class="task-header">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <span class="task-status status-${task.status}">
                        ${task.status.replace('_', ' ')}
                    </span>
                </div>
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span>ID: ${task.id}</span>
                    <span>Created: ${task.createdAt}</span>
                    ${task.updatedAt ? `<span>Updated: ${task.updatedAt}</span>` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn btn-sm btn-warning" onclick="taskManager.updateTaskStatus(${task.id}, 'pending')">
                        <span class="btn-icon">⏳</span> Pending
                    </button>
                    <button class="btn btn-sm btn-info" onclick="taskManager.updateTaskStatus(${task.id}, 'in_progress')">
                        <span class="btn-icon">🔄</span> In Progress
                    </button>
                    <button class="btn btn-sm btn-success" onclick="taskManager.updateTaskStatus(${task.id}, 'completed')">
                        <span class="btn-icon">✅</span> Completed
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="taskManager.deleteTask(${task.id})">
                        <span class="btn-icon">🗑️</span> Delete
                    </button>
                </div>
            </div>
        `;
    }

    async updateTaskStatus(id, status) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();
            this.displayResponse(data, response.status);

            if (data.success) {
                this.loadTasks(this.currentFilter);
                this.showNotification('Task updated successfully', 'success');
            } else {
                this.showNotification('Failed to update task', 'error');
            }
        } catch (error) {
            this.displayResponse({ error: error.message }, 500);
            this.showNotification('Network error occurred', 'error');
        }
    }

    async deleteTask(id) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            this.displayResponse(data, response.status);

            if (data.success) {
                this.loadTasks(this.currentFilter);
                this.showNotification('Task deleted successfully', 'success');
            } else {
                this.showNotification('Failed to delete task', 'error');
            }
        } catch (error) {
            this.displayResponse({ error: error.message }, 500);
            this.showNotification('Network error occurred', 'error');
        }
    }

    validateForm(title) {
        const titleError = document.getElementById('titleError');
        
        if (!title || title.length < 3) {
            titleError.textContent = 'Title must be at least 3 characters';
            titleError.classList.add('active');
            return false;
        }

        titleError.classList.remove('active');
        return true;
    }

    resetForm() {
        document.getElementById('taskForm').reset();
        document.getElementById('titleError').classList.remove('active');
    }

    showNotification(message, type) {
        // Simple console log for now - can be enhanced with toast notifications
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize the application
const taskManager = new TaskManager();
