// ===== STATE =====
let tasks = [];
let currentFilter = 'semua';
let dragSrcIndex = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  renderTasks();

  const input = document.getElementById('taskInput');
  input.addEventListener('input', () => {
    document.getElementById('charCount').textContent = `${input.value.length}/100`;
    clearError();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });
});

// ===== LOCAL STORAGE =====
function saveToStorage() {
  localStorage.setItem('taskr-tasks', JSON.stringify(tasks));
}

function loadFromStorage() {
  const saved = localStorage.getItem('taskr-tasks');
  if (saved) {
    try { tasks = JSON.parse(saved); } catch { tasks = []; }
  }
}

// ===== ADD TASK =====
function addTask() {
  const input = document.getElementById('taskInput');
  const priority = document.getElementById('prioritySelect').value;
  const text = input.value.trim();

  // Validation
  if (text === '') {
    showError('⚠️ Tugas tidak boleh kosong!');
    return;
  }
  if (text.length < 3) {
    showError('⚠️ Tugas minimal 3 karakter!');
    return;
  }
  if (text.length > 100) {
    showError('⚠️ Tugas maksimal 100 karakter!');
    return;
  }

  const task = {
    id: Date.now(),
    text,
    priority,
    completed: false,
  };

  tasks.unshift(task);
  saveToStorage();
  input.value = '';
  document.getElementById('charCount').textContent = '0/100';
  clearError();
  renderTasks();

  // Animate the newly added item
  setTimeout(() => {
    const first = document.querySelector('.task-item');
    if (first) first.style.animationPlayState = 'running';
  }, 10);
}

// ===== DELETE TASK =====
function deleteTask(id) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (item) {
    item.classList.add('removing');
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveToStorage();
      renderTasks();
    }, 230);
  }
}

// ===== TOGGLE COMPLETE =====
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveToStorage();
    renderTasks();
  }
}

// ===== EDIT TASK (double click) =====
function startEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task || task.completed) return;

  const textEl = document.querySelector(`[data-id="${id}"] .task-text`);
  if (!textEl) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-edit-input';
  input.value = task.text;
  input.maxLength = 100;
  textEl.replaceWith(input);
  input.focus();
  input.select();

  function saveEdit() {
    const newText = input.value.trim();
    if (newText.length >= 3 && newText.length <= 100) {
      task.text = newText;
      saveToStorage();
    }
    renderTasks();
  }

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { renderTasks(); }
  });
}

// ===== CLEAR COMPLETED =====
function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveToStorage();
  renderTasks();
}

// ===== FILTER =====
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${filter}`).classList.add('active');
  renderTasks();
}

function getFilteredTasks() {
  switch (currentFilter) {
    case 'aktif':   return tasks.filter(t => !t.completed);
    case 'selesai': return tasks.filter(t => t.completed);
    default:        return tasks;
  }
}

// ===== RENDER =====
function renderTasks() {
  const list = document.getElementById('taskList');
  const filtered = getFilteredTasks();

  // Counter
  const remaining = tasks.filter(t => !t.completed).length;
  document.getElementById('remainingCount').textContent = remaining;

  // Empty state
  if (filtered.length === 0) {
    list.innerHTML = `
      <li class="empty-state" id="emptyState">
        <div class="empty-icon">📋</div>
        <p>${currentFilter === 'selesai' ? 'Belum ada tugas selesai.' : currentFilter === 'aktif' ? 'Semua tugas sudah selesai! 🎉' : 'Belum ada tugas. Yuk tambahkan!'}</p>
      </li>`;
    return;
  }

  list.innerHTML = filtered.map((task, index) => {
    const priorityLabel = { rendah: 'Rendah', sedang: 'Sedang', tinggi: 'Tinggi' }[task.priority];
    const globalIndex = tasks.indexOf(task);
    return `
      <li class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}"
          data-id="${task.id}"
          data-index="${globalIndex}"
          draggable="true"
          ondragstart="onDragStart(event, ${globalIndex})"
          ondragover="onDragOver(event)"
          ondragleave="onDragLeave(event)"
          ondrop="onDrop(event, ${globalIndex})"
          ondragend="onDragEnd(event)">
        <div class="custom-checkbox ${task.completed ? 'checked' : ''}"
             onclick="toggleTask(${task.id})"
             title="Tandai selesai"></div>
        <div class="task-text-wrapper">
          <span class="task-text"
                ondblclick="startEdit(${task.id})"
                title="Klik 2x untuk edit">${escapeHtml(task.text)}</span>
        </div>
        <span class="priority-badge ${task.priority}">${priorityLabel}</span>
        <button class="btn-delete" onclick="deleteTask(${task.id})" title="Hapus tugas">✕</button>
      </li>
    `;
  }).join('');
}

// ===== DRAG & DROP =====
function onDragStart(e, index) {
  dragSrcIndex = index;
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

function onDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function onDrop(e, targetIndex) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (dragSrcIndex === null || dragSrcIndex === targetIndex) return;

  const dragged = tasks.splice(dragSrcIndex, 1)[0];
  tasks.splice(targetIndex, 0, dragged);
  dragSrcIndex = null;
  saveToStorage();
  renderTasks();
}

function onDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.task-item').forEach(el => el.classList.remove('drag-over'));
  dragSrcIndex = null;
}

// ===== HELPERS =====
function showError(msg) {
  document.getElementById('errorMsg').textContent = msg;
}

function clearError() {
  document.getElementById('errorMsg').textContent = '';
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}