const state = {
  tasks: [],
  completedTasks: [],
  currentTask: null,
  isActive: false,
  isPaused: false,
  timeRemaining: 0,
  timer: null,
};

const APP_NAME = "ずつ";
const NOTIFICATION_SOUND = new Audio("tuturu.mp3");
const DEFAULT_DURATION = 10;
const COMPLETION_MESSAGES = [
  "good job!",
  "well done!",
  '<span title="did it!">やった！</span>',
  '<span title="thank you for your hard work">おつかれさま</span>',
  '<ruby>完了<rt>かんりょう</rt></ruby><span title="complete!">！</span>',
  '<ruby>素晴<rt>すば</rt>らしい</ruby><span title="wonderful!">！</span>',
  "mission complete!",
  '<ruby>頑張<rt>がんば</rt>った</ruby><span title="you did your best!">！</span>',
];

document.addEventListener("DOMContentLoaded", () => {
  initializeDOM();
  loadTasks();
  initializeEventListeners();
  initializeTouchDragAndDrop();
});

function initializeDOM() {
  taskInput = document.getElementById("taskNameInput");
  durationInput = document.getElementById("taskDurationInput");
  addTaskButton = document.getElementById("addTaskButton");
  importButton = document.getElementById("importButton");
  exportButton = document.getElementById("exportButton");
  startButton = document.getElementById("startSessionButton");
  timerDisplay = document.getElementById("timerDisplay");
  currentTaskName = document.getElementById("currentTaskName");
  pauseButton = document.getElementById("pauseButton");
  skipButton = document.getElementById("skipButton");
  taskList = document.getElementById("taskList");
  progressFill = document.getElementById("progressFill");
  completedTasksList = document.getElementById("completedTasksList");
  resetButton = document.getElementById("resetButton");
  currentTaskContainer = document.getElementById("currentTaskContainer");
  importExportcontrols = document.getElementById("importExportControls");
  durationInput.value = DEFAULT_DURATION;
}

function loadTasks() {
  const saved = localStorage.getItem(APP_NAME);
  if (saved) {
    const data = JSON.parse(saved);
    state.tasks = data.tasks || [];
    state.completedTasks = data.completedTasks || [];
  }
  renderTasks();
  updateButtonStates();
}

function renderTasks() {
  // Clear all task containers
  completedTasksList.innerHTML = "";
  currentTaskContainer.innerHTML = "";
  taskList.innerHTML = "";

  // Render completed tasks
  state.completedTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item completed";
    li.innerHTML = `
        <span class="task-name">${task.name}</span>
        <div class="task-actions">
          <span class="task-duration">${task.duration} min</span>
        </div>
      `;
    completedTasksList.appendChild(li);
  });

  // Render current task if exists
  if (state.currentTask) {
    const currentTaskElement = document.createElement("li");
    currentTaskElement.className = "task-item current";
    currentTaskElement.innerHTML = `
        <span class="task-name">${state.currentTask.name}</span>
        <div class="task-actions">
          <span class="task-duration">${state.currentTask.duration} min</span>
        </div>
      `;
    currentTaskContainer.appendChild(currentTaskElement);
  }

  // Render future tasks
  state.tasks.forEach((task, index) => {
    if (state.currentTask && task === state.currentTask) return;

    const li = document.createElement("li");
    li.className = "task-item future";
    li.draggable = true;
    li.innerHTML = `
        <span class="drag-handle" aria-hidden="true">⋮</span>
        <span class="task-name">${task.name}</span>
        <div class="task-actions">
          <span class="task-duration">${task.duration} min</span>
          <button class="delete-button" title="delete task">×</button>
        </div>
      `;

    const deleteBtn = li.querySelector(".delete-button");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      state.tasks.splice(index, 1);
      saveTasks();
      renderTasks();
      updateButtonStates();
    });

    taskList.appendChild(li);
  });
}

function saveTasks() {
  localStorage.setItem(
    APP_NAME,
    JSON.stringify({
      tasks: state.tasks,
      completedTasks: state.completedTasks,
    })
  );
}

function updateButtonStates() {
  const noPendingTasks = state.tasks.length === 0;
  const noActiveTask = !state.isActive || !state.currentTask;
  const noTaskCompleted = state.completedTasks.length === 0;
  const hasCompletedTasks = state.completedTasks.length > 0;
  const noTasks = noPendingTasks && noTaskCompleted;
  exportButton.disabled = noTasks;
  startButton.disabled = noPendingTasks;
  skipButton.disabled = noActiveTask;
  importExportcontrols.style.display = noActiveTask ? "flex" : "none";
  startSessionButton.style.display = noActiveTask ? "block" : "none";
  resetButton.style.display = hasCompletedTasks ? "inline-flex" : "none";
}

function initializeDragAndDrop() {
  let draggedItem = null;

  document.addEventListener("dragstart", (e) => {
    if (e.target.closest(".task-item.future")) {
      draggedItem = e.target.closest(".task-item.future");
      draggedItem.classList.add("dragging");
    }
  });

  document.addEventListener("dragend", (e) => {
    if (e.target.closest(".task-item.future")) {
      e.target.closest(".task-item.future").classList.remove("dragging");
    }
  });

  taskList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(taskList, e.clientY);
    const draggable = document.querySelector(".dragging");

    if (afterElement) {
      taskList.insertBefore(draggable, afterElement);
    } else {
      taskList.appendChild(draggable);
    }
  });

  document.addEventListener("dragend", () => {
    updateTasksFromDOM();
    saveTasks();
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task-item.future:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function initializeEventListeners() {
  // Task Management
  addTaskButton.addEventListener("click", addTask);
  importButton.addEventListener("click", importTasks);
  exportButton.addEventListener("click", exportTasks);
  startButton.addEventListener("click", startSession);
  resetButton.addEventListener("click", resetSession);

  // Timer Controls
  pauseButton.addEventListener("click", togglePause);
  skipButton.addEventListener("click", nextTask);

  // Drag and Drop
  initializeDragAndDrop();

  // Keyboard Shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts);
  taskInput.addEventListener("keypress", handleEnterKeyPress);
  durationInput.addEventListener("keypress", handleEnterKeyPress);
}

function initializeTouchDragAndDrop() {
  let touchStartY = 0;
  let touchedItem = null;

  taskList.addEventListener("touchstart", (e) => {
    const item = e.target.closest(".task-item.future");
    if (!item) return;

    touchedItem = item;
    touchStartY = e.touches[0].clientY;
    item.classList.add("touching");
  });

  taskList.addEventListener("touchmove", (e) => {
    if (!touchedItem) return;
    e.preventDefault();

    const touch = e.touches[0];
    const swapThreshold = touchedItem.offsetHeight;
    const draggedDistance = touch.clientY - touchStartY;

    // Check if we should swap with previous/next item
    if (Math.abs(draggedDistance) > swapThreshold) {
      const nextItem =
        draggedDistance > 0
          ? touchedItem.nextElementSibling
          : touchedItem.previousElementSibling;

      if (nextItem && nextItem.classList.contains("future")) {
        const parent = touchedItem.parentNode;
        const placeholder = document.createElement("div");

        parent.insertBefore(
          placeholder,
          draggedDistance > 0 ? nextItem.nextSibling : touchedItem
        );
        parent.insertBefore(
          nextItem,
          draggedDistance > 0 ? touchedItem : placeholder
        );
        parent.insertBefore(touchedItem, placeholder);
        parent.removeChild(placeholder);

        touchStartY = touch.clientY;
      }
    }
  });

  taskList.addEventListener("touchend", () => {
    if (!touchedItem) return;
    touchedItem.classList.remove("touching");
    touchedItem = null;
    updateTasksFromDOM();
    saveTasks();
  });
}

// Task Management Functions
function addTask() {
  const name = taskInput.value.trim();
  const duration = parseInt(durationInput.value);

  if (!name || !duration) return;

  const task = { name, duration };
  state.tasks.push(task);
  saveTasks();
  renderTasks();
  clearInputs();
  updateButtonStates();
}

function clearInputs() {
  taskInput.value = "";
  durationInput.value = DEFAULT_DURATION;
  taskInput.focus();
}

function importTasks() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data.tasks)) {
          state.tasks = data.tasks;
          state.completedTasks = data.completedTasks || [];
          saveTasks();
          renderTasks();
          updateButtonStates();
        }
      } catch (error) {
        console.error("Failed to import tasks:", error);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function exportTasks() {
  const timestamp = new Date()
    .toISOString()
    .replace(/T/g, "_") // Remove T separator
    .replace(/\..+/, ""); // Remove milliseconds and timezone
  // Combine all tasks in their current order
  const allTasks = [...state.completedTasks, ...state.tasks];
  const exportData = {
    tasks: allTasks,
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${APP_NAME}_${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Timer Functions
function startSession() {
  if (state.tasks.length === 0) return;
  // Request notification permission if needed
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
  state.isActive = true;
  state.currentTask = state.tasks[0];
  state.timeRemaining = state.currentTask.duration * 60;
  updateTimerDisplay();
  startTimer();
  updateUI();
}

function startTimer() {
  clearInterval(state.timer);

  state.timer = setInterval(() => {
    if (state.isPaused) return;

    state.timeRemaining--;
    updateTimerDisplay();
    updateProgress();

    if (state.timeRemaining <= 0) {
      playNotification();
      nextTask();
    }
  }, 1000);
}

function togglePause() {
  state.isPaused = !state.isPaused;
  pauseButton.textContent = state.isPaused ? "resume" : "pause";
  timerDisplay.classList.toggle("paused", state.isPaused);
}

function nextTask() {
  const currentIndex = state.tasks.indexOf(state.currentTask);
  if (currentIndex < state.tasks.length - 1) {
    // Add current task to completed tasks
    state.completedTasks.push({ ...state.currentTask });
    // Remove completed task from tasks array
    state.tasks.splice(0, currentIndex + 1);
    // Set new current task
    state.currentTask = state.tasks[0];
    state.timeRemaining = state.currentTask.duration * 60;
    playNotification();
    showNotification(
      `next up: ${state.currentTask.name} (${state.currentTask.duration} min)`
    );
    updateTimerDisplay();
    updateProgress();
    startTimer();
  } else {
    endSession();
  }
  updateUI();
  saveTasks();
}

// UI Update Functions
function updateTimerDisplay() {
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function updateProgress() {
  const totalSeconds = state.currentTask.duration * 60;
  const percentage =
    ((totalSeconds - state.timeRemaining) / totalSeconds) * 100;
  progressFill.style.width = `${percentage}%`;
}

function updateUI() {
  if (state.currentTask) {
    currentTaskName.textContent = state.currentTask.name;
  }
  renderTasks();
  updateButtonStates();
}

function updateTasksFromDOM() {
  const newTasks = [];
  document.querySelectorAll(".task-item.future").forEach((item) => {
    const name = item.querySelector(".task-name").textContent;
    const duration = parseInt(item.querySelector(".task-duration").textContent);
    newTasks.push({ name, duration });
  });
  state.tasks = newTasks;
}

function handleKeyboardShortcuts(e) {
  if (!state.isActive) return;
    // Don't trigger shortcuts if user is typing in a text input
  if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") {
    return;
  }
  switch (e.code) {
    case "Space":
      e.preventDefault();
      togglePause();
      break;
  }
}

function handleEnterKeyPress(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    if (taskInput.value.trim() && durationInput.value.trim()) {
      addTask();
    }
  }
}

function endSession() {
  const finalTask = state.currentTask;
  resetTimerState();
  clearInterval(state.timer);
  if (finalTask) {
    state.completedTasks.push({ ...finalTask });
  }
  state.tasks = [];
  playNotification();
  const message =
    COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
  currentTaskName.innerHTML = message; // Using innerHTML to support ruby tags
  showNotification(message.replace(/<[^>]*>/g, "")); // Strip HTML tags for notification
  saveTasks();
}

function resetSession() {
  resetTimerState();
  state.tasks = [...state.completedTasks, ...state.tasks];
  state.completedTasks = [];
  state.currentTask = null;
  currentTaskName.textContent = "no task in progress";
  updateUI();
  saveTasks();
}

function resetTimerState() {
  clearInterval(state.timer);
  state.isActive = false;
  state.currentTask = null;
  state.isPaused = false;
  state.timeRemaining = 0;
  timerDisplay.textContent = "00:00";
  pauseButton.textContent = "pause";
  progressFill.style.width = "0%";
}

function playNotification() {
  NOTIFICATION_SOUND.currentTime = 0;
  NOTIFICATION_SOUND.volume = 0.75;
  NOTIFICATION_SOUND.play().catch((error) => {
    console.error("Error playing notification:", error);
  });
}

function showNotification(message) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
  if (Notification.permission === "granted") {
    new Notification("ずつ", {
      body: message,
      icon: "/favicon.ico",
    });
  }
}

// Prevent accidental page leave during active session
window.addEventListener("beforeunload", (e) => {
  if (state.isActive) {
    e.preventDefault();
    e.returnValue = "";
    return "";
  }
});

// ================= //
//   Utility tiles   //
// ================= //
const tileUtils = {
  animatedUpdate(element, newValue) {
    element.classList.add("animating");
    setTimeout(() => {
      element.textContent = newValue;
      element.classList.remove("animating");
    }, 150);
  },

  instantUpdate(element, newValue) {
    element.textContent = newValue;
  },
};

// Coin tile
const coinTile = {
  result: document.getElementById("coinResult"),
  button: document.getElementById("coinButton"),

  initialize() {
    this.button.addEventListener("click", () => this.flip());
  },

  flip() {
    const result = Math.random() < 0.5 ? "heads" : "tails";
    tileUtils.animatedUpdate(this.result, result);
  },
};

// Random number tile
const randomTile = {
  result: document.getElementById("numberResult"),
  minInput: document.getElementById("minNumber"),
  maxInput: document.getElementById("maxNumber"),
  button: document.getElementById("numberButton"),

  initialize() {
    this.button.addEventListener("click", () => this.roll());
    this.setupValidation();
  },

  setupValidation() {
    [this.minInput, this.maxInput].forEach((input) => {
      input.addEventListener("change", () => {
        const min = parseInt(this.minInput.value);
        const max = parseInt(this.maxInput.value);
        if (min >= max) this.maxInput.value = min + 1;
      });
    });
  },

  roll() {
    const min = parseInt(this.minInput.value);
    const max = parseInt(this.maxInput.value);
    const number = Math.floor(Math.random() * (max - min + 1)) + min;
    tileUtils.animatedUpdate(this.result, number);
  },
};

// Counter tile
const counterTile = {
  result: document.getElementById("counterResult"),
  incrementBtn: document.getElementById("incrementButton"),
  decrementBtn: document.getElementById("decrementButton"),
  resetBtn: document.getElementById("resetCounterButton"),
  count: 0,
  storageKey: APP_NAME + "_counter",

  initialize() {
    this.loadState();
    this.incrementBtn.addEventListener("click", () => this.increment());
    this.decrementBtn.addEventListener("click", () => this.decrement());
    this.resetBtn.addEventListener("click", () => this.reset());
  },

  increment() {
    this.count++;
    this.updateDisplay();
  },

  decrement() {
    if (this.count > 0) {
      this.count--;
      this.updateDisplay();
    }
  },

  reset() {
    this.count = 0;
    this.updateDisplay();
  },

  updateDisplay() {
    tileUtils.instantUpdate(this.result, this.count);
    localStorage.setItem(this.storageKey, this.count.toString());
  },

  loadState() {
    const savedCount = localStorage.getItem(this.storageKey);
    if (savedCount !== null) {
      this.count = parseInt(savedCount);
      this.result.textContent = this.count;
    }
  },
};

const noteTile = {
  textarea: document.getElementById("noteTileText"),
  storageKey: APP_NAME + "_note",
  saveTimeout: null,
  debounceTime: 1000,
  initialize() {
    this.loadNote();
    this.textarea.addEventListener("input", () => this.debounceSave());
    // Save when user leaves the textarea
    this.textarea.addEventListener("blur", () => this.saveNote());
  },
  debounceSave() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveNote(), this.debounceTime);
  },
  saveNote() {
    localStorage.setItem(this.storageKey, this.textarea.value);
  },
  loadNote() {
    const savedNote = localStorage.getItem(this.storageKey);
    if (savedNote) {
      this.textarea.value = savedNote;
    }
  },
};

const selectorTile = {
  result: document.getElementById("selectorResult"),
  input: document.getElementById("selectorInput"),
  button: document.getElementById("selectorButton"),
  storageKey: APP_NAME + "_selector",
  initialize() {
    this.loadState();
    this.button.addEventListener("click", () => this.pick());
    this.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.pick();
    });
  },
  pick() {
    const options = this.input.value
      .split(",")
      .map((opt) => opt.trim())
      .filter((opt) => opt);
    if (options.length === 0) {
      tileUtils.animatedUpdate(this.result, "add options below!");
      return;
    }
    const selected = options[Math.floor(Math.random() * options.length)];
    tileUtils.animatedUpdate(this.result, selected);
    this.saveState();
  },
  saveState() {
    localStorage.setItem(this.storageKey, this.input.value);
  },
  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.input.value = saved;
    }
  },
};
const chronoTile = {
  result: document.getElementById("chronoResult"),
  startButton: document.getElementById("chronoStartButton"),
  resetButton: document.getElementById("chronoResetButton"),
  startTime: 0,
  elapsedTime: 0,
  intervalId: null,

  initialize() {
    this.startButton.addEventListener("click", () => this.toggleTimer());
    this.resetButton.addEventListener("click", () => this.reset());
  },

  toggleTimer() {
    if (this.intervalId) {
      this.pause();
    } else {
      this.start();
    }
  },

  start() {
    this.startTime = Date.now() - this.elapsedTime;
    this.intervalId = setInterval(() => this.updateDisplay(), 1000);
    this.startButton.textContent = "⏸";
  },

  pause() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.startButton.textContent = "▶";
  },

  reset() {
    this.pause();
    this.elapsedTime = 0;
    tileUtils.instantUpdate(this.result, "00:00");
  },

  updateDisplay() {
    this.elapsedTime = Date.now() - this.startTime;
    const seconds = Math.floor(this.elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    let display;
    if (hours > 0) {
      display = `${hours}:${String(minutes % 60).padStart(2, "0")}:${String(
        seconds % 60
      ).padStart(2, "0")}`;
    } else {
      display = `${String(minutes).padStart(2, "0")}:${String(
        seconds % 60
      ).padStart(2, "0")}`;
    }
    tileUtils.instantUpdate(this.result, display);
  },
};

const intervalTile = {
  result: document.getElementById("intervalResult"),
  startButton: document.getElementById("intervalStartButton"),
  resetButton: document.getElementById("intervalResetButton"),
  workInput: document.getElementById("workMinutes"),
  restInput: document.getElementById("restMinutes"),
  intervalId: null,
  storageKey: APP_NAME + "_interval",
  isWork: true,
  timeLeft: 0,
  wasMainTimerActive: false,

  initialize() {
    this.loadState();
    this.startButton.addEventListener("click", () => this.toggleTimer());
    this.resetButton.addEventListener("click", () => this.reset());
    [this.workInput, this.restInput].forEach((input) => {
      input.addEventListener("change", () => this.saveState());
    });
  },

  toggleTimer() {
    if (this.intervalId) {
      this.pause();
    } else {
      this.start();
    }
  },

  start() {
    if (!this.timeLeft) {
      this.timeLeft = this.workInput.value * 60;
      this.isWork = true;
    }

    this.intervalId = setInterval(() => this.tick(), 1000);
    this.startButton.textContent = "⏸";
  },

  pause() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.startButton.textContent = "▶";
  },

  reset() {
    this.pause();
    this.timeLeft = 0;
    this.isWork = true;
    this.wasMainTimerActive = false;
    tileUtils.instantUpdate(this.result, "00:00");
    if (!this.isWork && this.wasMainTimerActive && state.isPaused) {
      togglePause();
    }
  },

  tick() {
    this.timeLeft--;
    if (this.timeLeft <= 0) {
      this.switchPhase();
    }
    this.updateDisplay();
  },

  switchPhase() {
    this.isWork = !this.isWork;
    this.timeLeft = (this.isWork ? this.workInput : this.restInput).value * 60;
    if (this.isWork) {
      if (this.wasMainTimerActive && state.isPaused) {
        togglePause();
      }
    } else {
      this.wasMainTimerActive = state.isActive && !state.isPaused;
      if (this.wasMainTimerActive) {
        togglePause();
      }
    }
    playNotification();
    this.updateDisplay();
  },

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const display = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
    const phase = this.isWork ? "☕" : "🦥";
    tileUtils.instantUpdate(this.result, `${display} ${phase}`);
  },

  saveState() {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify({
        work: this.workInput.value,
        rest: this.restInput.value,
      })
    );
  },

  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      const { work, rest } = JSON.parse(saved);
      this.workInput.value = work;
      this.restInput.value = rest;
    }
  },
};

[
  coinTile,
  randomTile,
  counterTile,
  selectorTile,
  intervalTile,
  chronoTile,
].forEach((tile) => tile.initialize());
