class TaskManager {
    constructor() {
        this.apiUrl = "http://localhost:8000/api/tasks";
        this.currentFilter = { status: "", priority: "", search: "" };
        this.currentPage = 1;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStats();
        this.loadTasks();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById("taskForm");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.createTask();
        });

        // Search input
        const searchInput = document.getElementById("searchInput");
        let searchTimeout;
        searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.currentFilter.search = e.target.value;
                this.loadTasks();
            }, 500);
        });

        // Filter buttons
        const filterButtons = document.querySelectorAll(".filter-btn");
        filterButtons.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                filterButtons.forEach((b) => b.classList.remove("active"));
                e.target.classList.add("active");
                this.currentFilter.status = e.target.dataset.status || "";
                this.currentFilter.priority = e.target.dataset.priority || "";
                this.currentFilter.search = "";
                document.getElementById("searchInput").value = "";
                this.currentPage = 1;
                this.loadTasks();
            });
        });

        // Navigation
        const navLinks = document.querySelectorAll(".nav-link");
        navLinks.forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                navLinks.forEach((l) => l.classList.remove("active"));
                e.target.classList.add("active");
                this.switchView(e.target.dataset.view);
            });
        });
    }

    switchView(viewName) {
        document.querySelectorAll(".view").forEach((view) => {
            view.classList.remove("active");
        });
        document.getElementById(`${viewName}-view`).classList.add("active");
    }

    displayResponse(data, status = 200) {
        const responseBox = document.getElementById("apiResponse");
        const timestamp = new Date().toLocaleTimeString();
        const formattedResponse = {
            timestamp,
            status,
            response: data,
        };
        responseBox.textContent = JSON.stringify(formattedResponse, null, 2);
    }

    clearResponse() {
        document.getElementById("apiResponse").textContent =
            "Waiting for API request...";
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.apiUrl}/stats`);
            const data = await response.json();

            if (data.success) {
                document.getElementById("statTotal").textContent =
                    data.data.total;
                document.getElementById("statPending").textContent =
                    data.data.pending;
                document.getElementById("statInProgress").textContent =
                    data.data.inProgress;
                document.getElementById("statCompleted").textContent =
                    data.data.completed;
            }
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    }

    async createTask() {
        const title = document.getElementById("taskTitle").value.trim();
        const description = document
            .getElementById("taskDescription")
            .value.trim();
        const status = document.getElementById("taskStatus").value;
        const priority = document.getElementById("taskPriority").value;
        const dueDate = document.getElementById("taskDueDate").value;

        if (!this.validateForm(title)) {
            return;
        }

        try {
            const payload = {
                title,
                description: description || null,
                status,
                priority,
            };

            if (dueDate) {
                payload.dueDate = dueDate;
            }

            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            this.displayResponse(data, response.status);

            if (data.success) {
                this.resetForm();
                this.loadStats();
                this.loadTasks();
                this.showNotification("Task created successfully", "success");
            } else {
                this.showNotification("Failed to create task", "error");
            }
        } catch (error) {
            this.displayResponse({ error: error.message }, 500);
            this.showNotification("Network error occurred", "error");
        }
    }

    async loadTasks(page = 1) {
        this.currentPage = page;

        try {
            let url = `${this.apiUrl}?page=${page}&limit=10`;

            if (this.currentFilter.search) {
                url += `&search=${encodeURIComponent(
                    this.currentFilter.search
                )}`;
            } else {
                if (this.currentFilter.status) {
                    url += `&status=${this.currentFilter.status}`;
                }
                if (this.currentFilter.priority) {
                    url += `&priority=${this.currentFilter.priority}`;
                }
            }

            const response = await fetch(url);
            const data = await response.json();

            this.displayResponse(data, response.status);

            if (data.success && data.data) {
                this.renderTasks(data.data);
                this.renderPagination(data.pagination);
            }
        } catch (error) {
            this.displayResponse({ error: error.message }, 500);
            this.showNotification("Failed to load tasks", "error");
        }
    }

    renderTasks(tasks) {
        const container = document.getElementById("tasksList");

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p class="empty-text">No tasks found</p>
                    <p class="empty-subtext">${
                        this.currentFilter.search ||
                        this.currentFilter.status ||
                        this.currentFilter.priority
                            ? "Try a different filter"
                            : "Create your first task to get started"
                    }</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks
            .map((task) => this.createTaskCard(task))
            .join("");
    }

    createTaskCard(task) {
        const isOverdue =
            task.dueDate &&
            new Date(task.dueDate) < new Date() &&
            task.status !== "completed";
        const dueDateClass = isOverdue
            ? "due-date-badge overdue"
            : "due-date-badge";

        return `
            <div class="task-item">
                <div class="task-header">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span class="priority-badge priority-${task.priority}">
                            ${task.priority}
                        </span>
                        <span class="task-status status-${task.status}">
                            ${task.status.replace("_", " ")}
                        </span>
                    </div>
                </div>
                ${
                    task.description
                        ? `<div class="task-description">${this.escapeHtml(
                              task.description
                          )}</div>`
                        : ""
                }
                <div class="task-meta">
                    <span>ID: ${task.id}</span>
                    ${
                        task.dueDate
                            ? `<span class="${dueDateClass}">📅 Due: ${
                                  task.dueDate
                              }${isOverdue ? " (Overdue!)" : ""}</span>`
                            : ""
                    }
                    <span>Created: ${task.createdAt}</span>
                </div>
                <div class="task-actions">
                    <button class="btn btn-sm btn-warning" onclick="taskManager.updateTaskStatus(${
                        task.id
                    }, 'pending')">
                        <span class="btn-icon">⏳</span> Pending
                    </button>
                    <button class="btn btn-sm btn-info" onclick="taskManager.updateTaskStatus(${
                        task.id
                    }, 'in_progress')">
                        <span class="btn-icon">🔄</span> In Progress
                    </button>
                    <button class="btn btn-sm btn-success" onclick="taskManager.updateTaskStatus(${
                        task.id
                    }, 'completed')">
                        <span class="btn-icon">✅</span> Complete
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="taskManager.deleteTask(${
                        task.id
                    })">
                        <span class="btn-icon">🗑️</span> Delete
                    </button>
                </div>
            </div>
        `;
    }

    renderPagination(pagination) {
        const container = document.getElementById("pagination");

        if (pagination.totalPages <= 1) {
            container.innerHTML = "";
            return;
        }

        let html = `
            <button class="pagination-btn" ${
                pagination.page === 1 ? "disabled" : ""
            }
                onclick="taskManager.loadTasks(${pagination.page - 1})">
                ← Previous
            </button>
        `;

        for (let i = 1; i <= pagination.totalPages; i++) {
            html += `
                <button class="pagination-btn ${
                    i === pagination.page ? "active" : ""
                }"
                    onclick="taskManager.loadTasks(${i})">
                    ${i}
                </button>
            `;
        }

        html += `
            <button class="pagination-btn" ${
                pagination.page === pagination.totalPages ? "disabled" : ""
            }
                onclick="taskManager.loadTasks(${pagination.page + 1})">
                Next →
            </button>
        `;

        container.innerHTML = html;
    }

    async updateTaskStatus(id, status) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();
            this.displayResponse(data, response.status);

            if (data.success) {
                this.loadStats();
                this.loadTasks(this.currentPage);
                this.showNotification("Task updated successfully", "success");
            } else {
                this.showNotification("Failed to update task", "error");
            }
        } catch (error) {
            this.displayResponse({ error: error.message }, 500);
            this.showNotification("Network error occurred", "error");
        }
    }

    async deleteTask(id) {
        if (!confirm("Are you sure you want to delete this task?")) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            this.displayResponse(data, response.status);

            if (data.success) {
                this.loadStats();
                this.loadTasks(this.currentPage);
                this.showNotification("Task deleted successfully", "success");
            } else {
                this.showNotification("Failed to delete task", "error");
            }
        } catch (error) {
            this.displayResponse({ error: error.message }, 500);
            this.showNotification("Network error occurred", "error");
        }
    }

    validateForm(title) {
        const titleError = document.getElementById("titleError");

        if (!title || title.length < 3) {
            titleError.textContent = "Title must be at least 3 characters";
            titleError.classList.add("active");
            return false;
        }

        titleError.classList.remove("active");
        return true;
    }

    resetForm() {
        document.getElementById("taskForm").reset();
        document.getElementById("titleError").classList.remove("active");
        document.getElementById("taskPriority").value = "medium";
    }

    showNotification(message, type) {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    escapeHtml(text) {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}

// Initialize the application
const taskManager = new TaskManager();
