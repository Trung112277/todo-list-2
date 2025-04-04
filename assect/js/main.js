/* ==================== CONSTANTS ==================== */
const PRIORITY_COLORS = {
    low: { text: '#2e7d32', bg: '#e8f5e9' },
    medium: { text: '#f57f17', bg: '#fff8e1' },
    high: { text: '#c62828', bg: '#ffebee' }
};

const FILTER_TYPES = {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed'
};

const SORT_TYPES = {
    A_TO_Z: 'a-z',
    DEFAULT: null
};

/* ==================== STATE MANAGEMENT ==================== */
const state = {
    todos: JSON.parse(localStorage.getItem('todos')) || [],
    currentFilter: FILTER_TYPES.ALL,
    currentSort: SORT_TYPES.DEFAULT
};

/* ==================== DOM ELEMENTS ==================== */
const DOM = {
    // Form elements
    addForm: document.getElementById('addForm'),
    addFormSelect: document.getElementById('priority'),
    inputList: document.getElementById('inputList'),

    // Action buttons
    selectAllBtn: document.getElementById('selectAllItems'),
    deleteAllBtn: document.getElementById('deleteAllItems'),

    // Filter buttons
    filterButtons: {
        all: document.getElementById('allItems'),
        active: document.getElementById('activeItems'),
        completed: document.getElementById('completedItems')
    },

    // Sort buttons
    sortButtons: {
        aToZ: document.getElementById('filterA')
    },

    // List container
    listItems: document.getElementById('listItems'),

    // Popups
    popups: {
        empty: document.getElementById('popupEmpty'),
        error: document.getElementById('popupError'),
        delete: document.getElementById('popupDelete'),
        deleteAll: document.getElementById('popupDeleteAll'),
        edit: document.getElementById('popupEdit')
    }
};

/* ==================== UTILITY FUNCTIONS ==================== */
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const saveToLocalStorage = () => {
    localStorage.setItem('todos', JSON.stringify(state.todos));
};

const validateInput = (text) => {
    if (!text) return { isValid: false, popup: 'empty' };
    if (/^\s+$/.test(text)) return { isValid: false, popup: 'error' };
    return { isValid: true };
};

const styleSelect = (selectElement) => {
    const priority = selectElement.value;
    const { text, bg } = PRIORITY_COLORS[priority] || { text: '#212529', bg: '#ffffff' };

    selectElement.style.color = text;
    selectElement.style.backgroundColor = bg;
    selectElement.style.borderColor = text;
};

/* ==================== SORT & FILTER FUNCTIONS ==================== */
const sortTodos = (todos) => {
    if (state.currentSort === SORT_TYPES.A_TO_Z) {
        return [...todos].sort((a, b) => a.text.localeCompare(b.text));
    }
    return todos;
};

const filterTodos = () => {
    let filtered = state.todos;

    switch (state.currentFilter) {
        case FILTER_TYPES.ACTIVE:
            filtered = filtered.filter(todo => !todo.completed);
            break;
        case FILTER_TYPES.COMPLETED:
            filtered = filtered.filter(todo => todo.completed);
            break;
    }

    return sortTodos(filtered);
};

/* ==================== RENDER FUNCTIONS ==================== */
const renderTodoItem = (todo) => `
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
`;

const renderTodos = () => {
    const filteredTodos = filterTodos();

    DOM.listItems.innerHTML = filteredTodos.map(renderTodoItem).join('');

    // Update active states
    DOM.sortButtons.aToZ.classList.toggle('active', state.currentSort === SORT_TYPES.A_TO_Z);
    Object.entries(DOM.filterButtons).forEach(([type, button]) => {
        button.classList.toggle('active', state.currentFilter === type);
    });

    initEventHandlers();
};

/* ==================== EVENT HANDLERS ==================== */
const initEventHandlers = () => {
    // Checkboxes
    document.querySelectorAll('.check-box').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const todoId = this.closest('li').dataset.id;
            const todo = state.todos.find(t => t.id === todoId);
            if (todo) {
                todo.completed = this.checked;
                saveToLocalStorage();
                renderTodos();
            }
        });
    });

    // Priority selects
    document.querySelectorAll('.select-item').forEach(select => {
        styleSelect(select);
        select.addEventListener('change', function () {
            const todoId = this.closest('li').dataset.id;
            const todo = state.todos.find(t => t.id === todoId);
            if (todo) {
                todo.priority = this.value;
                saveToLocalStorage();
                styleSelect(this);
            }
        });
    });

    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const todoId = this.closest('li').dataset.id;
            const todo = state.todos.find(t => t.id === todoId);
            if (todo) showEditPopup(todo);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const todoId = this.closest('li').dataset.id;
            showDeletePopup(todoId);
        });
    });
};

const initButtonHandlers = () => {
    // Filter buttons
    DOM.filterButtons.all.addEventListener('click', () => {
        state.currentFilter = FILTER_TYPES.ALL;
        renderTodos();
    });

    DOM.filterButtons.active.addEventListener('click', () => {
        state.currentFilter = FILTER_TYPES.ACTIVE;
        renderTodos();
    });

    DOM.filterButtons.completed.addEventListener('click', () => {
        state.currentFilter = FILTER_TYPES.COMPLETED;
        renderTodos();
    });

    // Sort A-Z button
    DOM.sortButtons.aToZ.addEventListener('click', () => {
        state.currentSort = state.currentSort === SORT_TYPES.A_TO_Z
            ? SORT_TYPES.DEFAULT
            : SORT_TYPES.A_TO_Z;
        renderTodos();
    });

    // Select All button
    DOM.selectAllBtn.addEventListener('click', () => {
        const isAllCompleted = state.todos.every(todo => todo.completed);
        state.todos.forEach(todo => todo.completed = !isAllCompleted);
        saveToLocalStorage();
        renderTodos();
    });

    // Delete All button
    DOM.deleteAllBtn.addEventListener('click', showDeleteAllPopup);
};

/* ==================== POPUP FUNCTIONS ==================== */
const showPopup = (popupType) => {
    const popup = DOM.popups[popupType];
    if (!popup) return;

    popup.classList.add('active');
    popup.querySelector('.okPopup').onclick = () => popup.classList.remove('active');
};

const showEditPopup = (todo) => {
    const popup = DOM.popups.edit;
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
    const popup = DOM.popups.delete;
    popup.classList.add('active');

    popup.querySelector('.okPopup').onclick = () => {
        state.todos = state.todos.filter(todo => todo.id !== todoId);
        saveToLocalStorage();
        renderTodos();
        popup.classList.remove('active');
    };

    popup.querySelector('.cancelPopup').onclick = () => popup.classList.remove('active');
};

const showDeleteAllPopup = () => {
    const popup = DOM.popups.deleteAll;
    popup.classList.add('active');

    popup.querySelector('.okPopup').onclick = () => {
        state.todos = [];
        saveToLocalStorage();
        renderTodos();
        popup.classList.remove('active');
    };

    popup.querySelector('.cancelPopup').onclick = () => popup.classList.remove('active');
};

/* ==================== INITIALIZATION ==================== */
const init = () => {
    // Form initialization
    DOM.addForm.addEventListener('submit', (e) => {
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
    });

    // Priority select styling
    styleSelect(DOM.addFormSelect);
    DOM.addFormSelect.addEventListener('change', () => styleSelect(DOM.addFormSelect));

    // Initialize all button handlers
    initButtonHandlers();

    // Initial render
    renderTodos();
};

document.addEventListener('DOMContentLoaded', init);