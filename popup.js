document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addButton = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const zenState = document.getElementById('zenState');
    const dateElement = document.getElementById('date');
    const clearAllButton = document.getElementById('clearAll');
  
    // Update date
    function updateDate() {
      const now = new Date();
      const options = { 
        weekday: 'long', 
        day: 'numeric',
        month: 'long'
      };
      dateElement.textContent = now.toLocaleDateString('ru-RU', options);
    }
  
    updateDate();
  
    // Load tasks from storage
    chrome.storage.local.get(['tasks'], (result) => {
      const tasks = result.tasks || [];
      const todayTasks = tasks.filter(task => task.date === new Date().toDateString());
      todayTasks.forEach(task => addTaskToDOM(task));
      updateZenState();
    });
  
    // Add new task
    function addNewTask() {
      if (taskInput.value.trim()) {
        const task = {
          id: Date.now(),
          text: taskInput.value.trim(),
          completed: false,
          date: new Date().toDateString()
        };
  
        addTaskToDOM(task);
        saveTask(task);
        taskInput.value = '';
        updateZenState();
      }
    }
  
    // Add task on button click
    addButton.addEventListener('click', addNewTask);
  
    // Add task on Enter key
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addNewTask();
      }
    });
  
    // Clear all tasks
    clearAllButton.addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите удалить все задачи за сегодня?')) {
        chrome.storage.local.get(['tasks'], (result) => {
          const tasks = result.tasks || [];
          const filteredTasks = tasks.filter(task => task.date !== new Date().toDateString());
          chrome.storage.local.set({ tasks: filteredTasks }, () => {
            taskList.innerHTML = '';
            updateZenState();
          });
        });
      }
    });
  
    function addTaskToDOM(task) {
      const taskElement = document.createElement('div');
      taskElement.className = 'task-item';
      taskElement.dataset.id = task.id;
  
      const checkbox = document.createElement('div');
      checkbox.className = `task-checkbox ${task.completed ? 'checked' : ''}`;
      
      const text = document.createElement('div');
      text.className = `task-text ${task.completed ? 'completed' : ''}`;
      text.textContent = task.text;
  
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-task';
      deleteButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
  
      taskElement.appendChild(checkbox);
      taskElement.appendChild(text);
      taskElement.appendChild(deleteButton);
      taskList.appendChild(taskElement);
  
      // Toggle task completion
      checkbox.addEventListener('click', () => {
        task.completed = !task.completed;
        checkbox.classList.toggle('checked');
        text.classList.toggle('completed');
        updateTask(task);
        updateZenState();
      });
  
      // Delete task
      deleteButton.addEventListener('click', () => {
        chrome.storage.local.get(['tasks'], (result) => {
          const tasks = result.tasks || [];
          const updatedTasks = tasks.filter(t => t.id !== task.id);
          chrome.storage.local.set({ tasks: updatedTasks }, () => {
            taskElement.remove();
            updateZenState();
          });
        });
      });
    }
  
    function saveTask(task) {
      chrome.storage.local.get(['tasks'], (result) => {
        const tasks = result.tasks || [];
        tasks.push(task);
        chrome.storage.local.set({ tasks });
      });
    }
  
    function updateTask(updatedTask) {
      chrome.storage.local.get(['tasks'], (result) => {
        const tasks = result.tasks || [];
        const taskIndex = tasks.findIndex(t => t.id === updatedTask.id);
        if (taskIndex !== -1) {
          tasks[taskIndex] = updatedTask;
          chrome.storage.local.set({ tasks });
        }
      });
    }
  
    function updateZenState() {
      const tasks = taskList.querySelectorAll('.task-item');
      const incompleteTasks = Array.from(tasks).filter(task => 
        !task.querySelector('.task-checkbox').classList.contains('checked')
      );
  
      if (tasks.length === 0 || incompleteTasks.length === 0) {
        zenState.style.display = 'block';
        taskList.style.display = 'none';
      } else {
        zenState.style.display = 'none';
        taskList.style.display = 'block';
      }
    }
  });

    // Handle star rating
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', () => {
          const rating = star.dataset.rating;
          const extensionId = chrome.runtime.id;
          const chromeStoreUrl = `https://chrome.google.com/webstore/detail/${extensionId}`;
          chrome.tabs.create({ url: chromeStoreUrl });
        });
      });