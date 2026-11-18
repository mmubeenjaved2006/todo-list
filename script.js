
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskTime = document.getElementById("taskTime");
const taskDescription =
  document.getElementById("taskDescription");

const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const currentDate = document.getElementById("currentDate");
const clearCompleted =
  document.getElementById("clearCompleted");

const filterButtons =
  document.querySelectorAll(".filter");

// STORAGE SETTINGS

const STORAGE_KEY = "daymark_tasks";

let tasks = loadTasks();
let currentFilter = "all";

// LOAD TASKS

function loadTasks() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];

  } catch (error) {
    console.error("Unable to load tasks:", error);
    return [];
  }
}

// SAVE TASKS

function saveTasks() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(tasks)
    );

  } catch (error) {
    console.error("Unable to save tasks:", error);
  }
}

// CURRENT DATE

function updateDate() {
  const today = new Date();

  currentDate.textContent = today.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );
}

// FORMAT TIME

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] =
    time.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return (
    formattedHours +
    ":" +
    String(minutes).padStart(2, "0") +
    " " +
    period
  );
}

// GENERATE TASK ID

function generateTaskId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString() +
    "-" +
    Math.random().toString(36).slice(2)
  );
}

// ADD TASK

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskTitle.value.trim();
  const time = taskTime.value;
  const description = taskDescription.value.trim();

  if (!title) {
    taskTitle.focus();
    return;
  }

  const newTask = {
    id: generateTaskId(),
    title: title,
    time: time,
    description: description,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);

  saveTasks();
  renderTasks();

  taskForm.reset();
  taskTitle.focus();
});

// TOGGLE COMPLETED

function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return {
        ...task,
        completed: !task.completed
      };
    }

    return task;
  });

  saveTasks();
  renderTasks();
}

// DELETE TASK

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);

  saveTasks();
  renderTasks();
}

// FILTER TASKS

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter(task => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter(task => task.completed);
  }

  return tasks;
}

// UPDATE TASK COUNTER

function updateCount() {
  const remaining = tasks.filter(
    task => !task.completed
  ).length;

  taskCount.textContent = remaining + " left";
}

// CREATE TASK ELEMENT

function createTaskElement(task) {
  const item = document.createElement("div");

  item.className =
    "task-item" +
    (task.completed ? " completed" : "");

  // CHECKBOX

  const checkbox = document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.completed;

  checkbox.setAttribute(
    "aria-label",
    "Mark " + task.title + " as completed"
  );

  checkbox.addEventListener("change", () => {
    toggleTask(task.id);
  });

  // CONTENT

  const content = document.createElement("div");
  content.className = "task-content";

  // TITLE

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  content.appendChild(title);

  // DESCRIPTION

  if (task.description) {
    const description = document.createElement("p");

    description.className = "task-description";
    description.textContent = task.description;

    content.appendChild(description);
  }

  // TIME

  if (task.time) {
    const time = document.createElement("span");

    time.className = "task-time";
    time.textContent = "◷ " + formatTime(task.time);

    content.appendChild(time);
  }

  // DELETE BUTTON

  const deleteButton = document.createElement("button");

  deleteButton.type = "button";
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "×";
  deleteButton.title = "Delete task";

  deleteButton.setAttribute(
    "aria-label",
    "Delete " + task.title
  );

  deleteButton.addEventListener("click", () => {
    deleteTask(task.id);
  });

  // APPEND ELEMENTS

  item.appendChild(checkbox);
  item.appendChild(content);
  item.appendChild(deleteButton);

  return item;
}

// RENDER TASKS

function renderTasks() {
  taskList.replaceChildren();

  const filteredTasks = getFilteredTasks();

  filteredTasks.forEach(task => {
    taskList.appendChild(createTaskElement(task));
  });

  updateCount();

  const heading = emptyState.querySelector("h3");
  const message = emptyState.querySelector("p");

  if (filteredTasks.length === 0) {
    emptyState.style.display = "flex";

    if (currentFilter === "active" && tasks.length > 0) {
      heading.textContent = "No active tasks";

      message.textContent =
        "You have completed everything. Great work!";

    } else if (
      currentFilter === "completed" &&
      tasks.length > 0
    ) {
      heading.textContent = "No completed tasks";

      message.textContent =
        "Completed tasks will appear here.";

    } else {
      heading.textContent = "All clear for now";

      message.textContent =
        "Add a task above to get started.";
    }

  } else {
    emptyState.style.display = "none";
  }
}

// FILTER BUTTONS

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    renderTasks();
  });
});

// CLEAR COMPLETED

clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);

  saveTasks();
  renderTasks();
});

// INITIALIZE WEBSITE

updateDate();
renderTasks();
