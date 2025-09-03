class DailyChecklist {
    constructor() {
        this.tasks = [];
        this.currentDate = new Date().toDateString();
        this.init();
    }

    init() {
        this.loadTasks();
        this.updateDate();
        this.setupEventListeners();
        this.renderTasks();
        this.updateStats();
        this.checkForDailyReset();
        
        // Check for reset every minute
        setInterval(() => this.checkForDailyReset(), 60000);
    }

    setupEventListeners() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const clearCompletedBtn = document.getElementById('clearCompletedBtn');

        addTaskBtn.addEventListener('click', () => this.addTask());
        
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();
        
        if (taskText === '') return;

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        taskInput.value = '';
        
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        // Add animation class
        const newTaskElement = document.querySelector(`[data-task-id="${task.id}"]`);
        if (newTaskElement) {
            newTaskElement.style.animation = 'slideIn 0.3s ease';
        }
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    clearCompleted() {
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';

        this.tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.setAttribute('data-task-id', task.id);

            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="delete-btn" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            const checkbox = taskItem.querySelector('.task-checkbox');
            const deleteBtn = taskItem.querySelector('.delete-btn');

            checkbox.addEventListener('change', () => this.toggleTask(task.id));
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

            taskList.appendChild(taskItem);
        });
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const remainingTasks = totalTasks - completedTasks;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('remainingTasks').textContent = remainingTasks;
    }

    updateDate() {
        const dateElement = document.getElementById('currentDate');
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }

    checkForDailyReset() {
        const today = new Date().toDateString();
        
        if (today !== this.currentDate) {
            this.resetTasks();
        }
    }

    resetTasks() {
        this.tasks = [];
        this.currentDate = new Date().toDateString();
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        // Show reset notification
        this.showNotification('Tasks have been reset for the new day!');
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4ade80;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    saveTasks() {
        const data = {
            tasks: this.tasks,
            date: this.currentDate
        };
        localStorage.setItem('dailyChecklist', JSON.stringify(data));
    }

    loadTasks() {
        const saved = localStorage.getItem('dailyChecklist');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                const savedDate = data.date;
                const today = new Date().toDateString();
                
                // Only load tasks if they're from today
                if (savedDate === today) {
                    this.tasks = data.tasks || [];
                    this.currentDate = savedDate;
                } else {
                    // Reset if it's a new day
                    this.tasks = [];
                    this.currentDate = today;
                }
            } catch (e) {
                console.error('Error loading tasks:', e);
                this.tasks = [];
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add fadeOut animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DailyChecklist();
});
