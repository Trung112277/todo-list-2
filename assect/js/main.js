/* ==================== CONSTANTS ==================== */
const PRIORITY_COLORS = {
    low: { text: '#2e7d32', bg: '#e8f5e9' },
    medium: { text: '#f57f17', bg: '#fff8e1' },
    high: { text: '#c62828', bg: '#ffebee' }
};

const SELECT_ALL_TEXT = {
    SELECT: 'Select All',
    DESELECT: 'Deselect All'
};

const DEFAULT_COLOR = { text: '#212529', bg: '#ffffff' };

/* ==================== STATE MANAGEMENT ==================== */
const state = {
    todos: JSON.parse(localStorage.getItem('todos')) || []
};

/* ==================== DOM ELEMENTS ==================== */
const DOM = {
    // Form elements
    addForm: document.getElementById('addForm'),
    addFormSelect: document.getElementById('priority'),
    inputList: document.getElementById('inputList'),

    // Actions
    selectAllBtn: document.getElementById('selectAllItems'),
    deleteAllBtn: document.getElementById('deleteAllItems'),

    // List container
    listItems: document.getElementById('listItems'),

    // Popups
    popupEmpty: document.getElementById('popupEmpty'),
    popupError: document.getElementById('popupError'),
    popupDelete: document.getElementById('popupDelete'),
    popupDeleteAll: document.getElementById('popupDeleteAll'),
    popupEdit: document.getElementById('popupEdit')
};

/* ==================== UTILITY FUNCTIONS ==================== */
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const saveToLocalStorage = () => {
    localStorage.setItem('todos', JSON.stringify(state.todos));
};

const validateInput = (text) => {
    if (!text) return { isValid: false, popup: 'popupEmpty' };
    if (/^\s+$/.test(text)) return { isValid: false, popup: 'popupError' };
    if (/^[^\w\sà-ỹ]+$/.test(text)) return { isValid: false, popup: 'popupError' };
    return { isValid: true };
};

/* ==================== DOM MANIPULATION ==================== */
const styleSelect = (selectElement) => {
    const priority = selectElement.value;
    const { text, bg } = PRIORITY_COLORS[priority] || DEFAULT_COLOR;

    Object.assign(selectElement.style, {
        color: text,
        backgroundColor: bg,
        borderColor: text
    });
};

const renderTodos = () => {
    if (!DOM.listItems) return;

    DOM.listItems.innerHTML = state.todos.map(todo => `
      <li data-id="${todo.id}" class="${todo.completed ? 'checked' : ''}">
        <label class="flex gap-20 mobile:gap-10">
          <input type="checkbox" class="check-box" ${todo.completed ? 'checked' : ''}>
          ${todo.text}
        </label>
        <div class="flex gap-20 mobile:space-center">
          <select class="select-item">
            <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>High</option>
          </select>
          <button class="action-btn edit-btn">✏️</button>
          <button class="action-btn delete-btn">🗑️</button>
        </div>
      </li>
    `).join('');

    initEventHandlers();
    updateSelectAllButton();
};

/* ==================== EVENT HANDLERS ==================== */
const initEventHandlers = () => {
    initSelectHandlers();
    initEditHandlers();
    initDeleteHandlers();
    initCheckboxHandlers();
};

const initSelectHandlers = () => {
    document.querySelectorAll('.select-item').forEach(select => {
        styleSelect(select);
        select.addEventListener('change', handleSelectChange);
    });
};

const initEditHandlers = () => {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditClick);
    });
};

const initDeleteHandlers = () => {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteClick);
    });
};

const initCheckboxHandlers = () => {
    document.querySelectorAll('.check-box').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
};

const initSelectAllHandler = () => {
    if (!DOM.selectAllBtn) return;

    DOM.selectAllBtn.addEventListener('click', handleSelectAll);
};

const initDeleteAllHandler = () => {
    if (!DOM.deleteAllBtn) return;

    DOM.deleteAllBtn.addEventListener('click', handleDeleteAll);
};

/* ==================== SELECT ALL LOGIC ==================== */
const handleSelectAll = () => {
    const isAllCompleted = state.todos.length > 0 && state.todos.every(todo => todo.completed);
    const newCompletionState = !isAllCompleted;

    state.todos.forEach(todo => {
        todo.completed = newCompletionState;
    });

    saveToLocalStorage();
    renderTodos();
};

const updateSelectAllButton = () => {
    if (!DOM.selectAllBtn) return;

    const isAllCompleted = state.todos.length > 0 && state.todos.every(todo => todo.completed);
    DOM.selectAllBtn.textContent = isAllCompleted ? SELECT_ALL_TEXT.DESELECT : SELECT_ALL_TEXT.SELECT;
    DOM.selectAllBtn.classList.toggle('active', isAllCompleted);
};

/* ==================== DELETE ALL LOGIC ==================== */
const handleDeleteAll = () => {
    showDeleteAllPopup();
};

const showDeleteAllPopup = () => {
    const popup = DOM.popupDeleteAll;
    popup.classList.add('active');

    const onConfirm = () => {
        state.todos = [];
        saveToLocalStorage();
        renderTodos();
        popup.classList.remove('active');
    };

    popup.querySelector('.okPopup').onclick = onConfirm;
    popup.querySelector('.cancelPopup').onclick = () => popup.classList.remove('active');
};

/* ==================== BUSINESS LOGIC ==================== */
const handleAddTodo = (e) => {
    e.preventDefault();

    const text = DOM.inputList.value;
    const priority = DOM.addFormSelect.value;

    const validation = validateInput(text);
    if (!validation.isValid) {
        showPopup(validation.popup);
        return;
    }

    state.todos.unshift({
        id: generateId(),
        text: text.trim(),
        priority,
        completed: false,
        createdAt: new Date().toISOString()
    });

    DOM.inputList.value = '';
    saveToLocalStorage();
    renderTodos();
};

const handleSelectChange = function () {
    const todoId = this.closest('li').dataset.id;
    const todo = state.todos.find(t => t.id === todoId);

    if (todo) {
        todo.priority = this.value;
        saveToLocalStorage();
    }
    styleSelect(this);
};

const handleEditClick = function (e) {
    const todo = state.todos.find(t => t.id === e.target.closest('li').dataset.id);
    if (todo) showEditPopup(todo);
};

const handleDeleteClick = function (e) {
    showDeletePopup(e.target.closest('li').dataset.id);
};

const handleCheckboxChange = function () {
    const li = this.closest('li');
    const todo = state.todos.find(t => t.id === li.dataset.id);

    if (todo) {
        todo.completed = this.checked;
        li.classList.toggle('checked', this.checked);
        saveToLocalStorage();
        updateSelectAllButton();
    }
};

/* ==================== POPUP MANAGEMENT ==================== */
const showPopup = (popupId) => {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    popup.classList.add('active');
    popup.querySelector('.okPopup').onclick = () => popup.classList.remove('active');
};

const showEditPopup = (todo) => {
    const popup = DOM.popupEdit;
    const input = popup.querySelector('#editList');

    input.value = todo.text;
    popup.classList.add('active');

    const onSubmit = (e) => {
        e.preventDefault();
        const newText = input.value.trim();

        const validation = validateInput(newText);
        if (!validation.isValid) {
            showPopup(validation.popup);
            return;
        }

        todo.text = newText;
        saveToLocalStorage();
        renderTodos();
        popup.classList.remove('active');
    };

    popup.querySelector('#editForm').onsubmit = onSubmit;
    popup.querySelector('.cancelPopup').onclick = () => popup.classList.remove('active');
};

const showDeletePopup = (todoId) => {
    const popup = DOM.popupDelete;
    popup.classList.add('active');

    const onConfirm = () => {
        state.todos = state.todos.filter(todo => todo.id !== todoId);
        saveToLocalStorage();
        renderTodos();
        popup.classList.remove('active');
    };

    popup.querySelector('.okPopup').onclick = onConfirm;
    popup.querySelector('.cancelPopup').onclick = () => popup.classList.remove('active');
};

/* ==================== INITIALIZATION ==================== */
const init = () => {
    // Initialize form elements
    if (DOM.addFormSelect) {
        styleSelect(DOM.addFormSelect);
        DOM.addFormSelect.addEventListener('change', () => styleSelect(DOM.addFormSelect));
    }

    if (DOM.addForm) {
        DOM.addForm.addEventListener('submit', handleAddTodo);
    }

    initSelectAllHandler();
    initDeleteAllHandler();
    renderTodos();
};

document.addEventListener('DOMContentLoaded', init);