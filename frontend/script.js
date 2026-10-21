const form = document.getElementById("taskForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("search");

let tasks = [];

try {
    const saved = JSON.parse(localStorage.getItem("studentTasks") || "[]");
    if (Array.isArray(saved)) {
        tasks = saved.filter(task =>
            task &&
            Number.isInteger(task.id) &&
            typeof task.title === "string" &&
            typeof task.description === "string" &&
            typeof task.completed === "boolean"
        );
    }
} catch {
    tasks = [];
}

let currentFilter = "all";

function saveTasks() {
    localStorage.setItem("studentTasks", JSON.stringify(tasks));
}

function updateStats() {
    document.getElementById("totalCount").textContent = tasks.length;
    document.getElementById("pendingCount").textContent =
        tasks.filter(task => !task.completed).length;
    document.getElementById("completedCount").textContent =
        tasks.filter(task => task.completed).length;
}

function renderTasks() {
    taskList.replaceChildren();

    const keyword = searchInput.value.trim().toLowerCase();

    const filteredTasks = tasks.filter(task => {
        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "pending" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        const matchesSearch =
            task.title.toLowerCase().includes(keyword) ||
            task.description.toLowerCase().includes(keyword);

        return matchesFilter && matchesSearch;
    });

    if (filteredTasks.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = tasks.length
            ? "No matching tasks found."
            : "No tasks yet. Add your first task above!";
        taskList.appendChild(empty);
    }

    filteredTasks.forEach(task => {
        const card = document.createElement("article");
        card.className = "task-card" + (task.completed ? " done" : "");

        const details = document.createElement("div");
        const heading = document.createElement("h3");
        heading.textContent = task.title;

        const description = document.createElement("p");
        description.textContent = task.description;

        const status = document.createElement("span");
        status.className = "status";
        status.textContent = task.completed ? "Completed" : "Pending";

        details.append(heading, description, status);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");
        completeButton.className = "complete-btn";
        completeButton.textContent = task.completed ? "Undo" : "Complete";
        completeButton.addEventListener("click", () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            const newTitle = prompt("Edit task title:", task.title);
            if (newTitle === null) return;

            const newDescription = prompt(
                "Edit task description:", task.description
            );
            if (newDescription === null) return;

            if (!newTitle.trim() || !newDescription.trim()) {
                alert("Title and description cannot be empty.");
                return;
            }

            task.title = newTitle.trim();
            task.description = newDescription.trim();
            saveTasks();
            renderTasks();
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            if (!confirm("Delete this task?")) return;

            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        actions.append(completeButton, editButton, deleteButton);
        card.append(details, actions);
        taskList.appendChild(card);
    });

    updateStats();
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title || !description) return;

    const id = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;

    tasks.push({
        id,
        title,
        description,
        completed: false
    });

    saveTasks();
    form.reset();
    renderTasks();
});

searchInput.addEventListener("input", renderTasks);

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        renderTasks();
    });
});

renderTasks();