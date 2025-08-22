let tasks = [];

document.getElementById('task-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const taskName = document.getElementById('task-name').value;
  const taskDescription = document.getElementById('task-description').value;
  const taskCategory = document.getElementById('task-category').value;
  const taskDueDate = document.getElementById('task-due-date').value;

  const task = {
    taskName,
    taskDescription,
    taskCategory,
    taskDueDate,
    completed: false
  };

  tasks.push(task);
  renderTasks();
  updateProgress();
  this.reset();
});

// Render tasks
function renderTasks() {
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';

  tasks.forEach((task, index) => {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    if (task.completed) taskDiv.classList.add('completed');

    taskDiv.innerHTML = `
      <div>
        <strong>${task.taskName}</strong><br>
        ${task.taskDescription || ''}<br>
        <small>
          ${task.taskCategory ? `Category: ${task.taskCategory}` : ''}
          ${task.taskDueDate ? ` | Due: ${task.taskDueDate}` : ''}
        </small>
      </div>
      <div>
        <button onclick="toggleComplete(${index})">Complete</button>
        <button class="delete-button" onclick="deleteTask(${index})">Delete</button>
      </div>
    `;
    taskList.appendChild(taskDiv);
  });
}

// Delete task
function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
  updateProgress();
}

// Toggle complete
function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
  updateProgress();
}

// Update progress bar
function updateProgress() {
  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = (completedTasks / tasks.length) * 100 || 0;
  document.getElementById('progress').style.width = progress + "%";
}

// Dark mode toggle
document.getElementById('mode-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  document.getElementById('mode-toggle').textContent =
    document.body.classList.contains('dark-mode')
      ? "Switch to Light Mode"
      : "Switch to Dark Mode";
});

// Export tasks as JSON
document.getElementById('export-json').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "tasks.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
});

// Import tasks from JSON
document.getElementById('import-file').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      tasks = JSON.parse(e.target.result);
      renderTasks();
      updateProgress();
    } catch (err) {
      alert("Invalid JSON file!");
    }
  };
  reader.readAsText(file);
});

// Trigger file input on click
document.getElementById('export-json').insertAdjacentHTML(
  "afterend",
  '<button id="import-json">Import JSON</button>'
);
document.getElementById('import-json').addEventListener('click', () => {
  document.getElementById('import-file').click();
});

// ✅ Export tasks as PDF using jsPDF
document.getElementById('export-pdf').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Task Manager - Exported Tasks", 10, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  let y = 30;
  tasks.forEach((task, index) => {
    if (y > 270) { // add new page if needed
      doc.addPage();
      y = 20;
    }

    doc.text(`${index + 1}. ${task.taskName}`, 10, y);
    y += 7;

    if (task.taskDescription) {
      doc.text(`Description: ${task.taskDescription}`, 14, y);
      y += 7;
    }
    if (task.taskCategory) {
      doc.text(`Category: ${task.taskCategory}`, 14, y);
      y += 7;
    }
    if (task.taskDueDate) {
      doc.text(`Due Date: ${task.taskDueDate}`, 14, y);
      y += 7;
    }

    doc.text(`Status: ${task.completed ? "✅ Completed" : "⏳ Incomplete"}`, 14, y);
    y += 12;
  });

  doc.save("tasks.pdf");
});
