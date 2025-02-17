document.addEventListener("DOMContentLoaded", () => {
    const taskName = document.getElementById("taskName");
    const taskDueDate = document.getElementById("taskDueDate");
    const taskPriority = document.getElementById("taskPriority");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const pendingTasks = document.getElementById("pendingTasks");
    const completedTasks = document.getElementById("completedTasks");
    const filterPriority = document.getElementById("filterPriority");
    const filterStatus = document.getElementById("filterStatus");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function updateProgress() {
        const totalTasks = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const progress = totalTasks ? (completed / totalTasks) * 100 : 0;
        progressBar.value = progress;
        progressText.innerText = `${Math.round(progress)}%`;
    }

    function getTimeLeft(dueDate) {
        const now = new Date();
        const deadline = new Date(dueDate);
        const diff = deadline - now;

        if (diff <= 0) return `<span class="overdue">⚠️ Overdue</span>`;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days === 0 && hours < 6) return `<span class="warning">⏳ ${hours}h ${minutes}m Left</span>`;
        if (days === 0) return `<span class="warning">🕒 ${hours}h Left</span>`;

        return `🗓️ ${days}d ${hours}h Left`;
    }

    function renderTasks() {
        pendingTasks.innerHTML = "<h2>⏳ Pending Tasks</h2>";
        completedTasks.innerHTML = "<h2>✔️ Completed Tasks</h2>";

        tasks.forEach((task, index) => {
            if (
                (filterPriority.value !== "all" && task.priority !== filterPriority.value) ||
                (filterStatus.value !== "all" && task.completed !== (filterStatus.value === "completed"))
            ) return;

            const taskElement = document.createElement("div");
            taskElement.className = `task ${task.priority}`;
            taskElement.innerHTML = `
                <span>${task.name}</span>
                <div class="countdown">${getTimeLeft(task.dueDate)}</div>
                <button class="deleteBtn" onclick="deleteTask(${index})">🗑️</button>
            `;

            if (task.completed) completedTasks.appendChild(taskElement);
            else pendingTasks.appendChild(taskElement);

            taskElement.addEventListener("click", () => {
                tasks[index].completed = !tasks[index].completed;
                saveTasks();
                renderTasks();
                updateProgress();
            });
        });

        updateProgress();
    }

    addTaskBtn.addEventListener("click", () => {
        if (!taskName.value || !taskDueDate.value) return alert("Please enter all details!");
        tasks.push({ name: taskName.value, dueDate: taskDueDate.value, priority: taskPriority.value, completed: false });
        saveTasks();
        renderTasks();
        taskName.value = "";
        taskDueDate.value = "";
    });

    window.deleteTask = (index) => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    };

    filterPriority.addEventListener("change", renderTasks);
    filterStatus.addEventListener("change", renderTasks);

    setInterval(renderTasks, 60000);
    renderTasks();
});
