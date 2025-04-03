// STATE
const state = {
    todos: JSON.parse(localStorage.getItem('todos')) || []
};

// DOM ELEMENTS
const DOM = {
    addFormSelect: document.getElementById('priority'),
    inputList: document.getElementById('inputList'),
    addForm: document.getElementById('addForm'),
    popupEmpty: document.getElementById('popupEmpty'),
    popupError: document.getElementById('popupError'),
    listItems: document.getElementById('listItems')
};

// PRIORITY COLORS
const PRIORITY_COLORS = {
    low: { text: '#2e7d32', bg: '#e8f5e9' },
    medium: { text: '#f57f17', bg: '#fff8e1' },
    high: { text: '#c62828', bg: '#ffebee' }
};
// SELECT HANDLERS
const initSelectHandlers = () => {
    document.querySelectorAll('.select-item').forEach(select => {
        // Áp dụng màu ban đầu
        styleSelect(select);

        // Gắn sự kiện change
        select.addEventListener('change', handleSelectChange);
    });
};
const initEditHandlers = () => {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditClick);
    });
};
const initDeleteHandlers = () => {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            const todoId = this.closest('li').dataset.id;
            showDeletePopup(todoId);
        });
    });
};
const initCheckboxHandlers = () => {
    document.querySelectorAll('.check-box').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const li = this.closest('li');
            const todoId = li.dataset.id;
            const todo = state.todos.find(t => t.id === todoId);

            if (todo) {
                todo.completed = this.checked;
                li.classList.toggle('checked', this.checked);
                saveToLocalStorage();
            }
        });
    });
};

const handleSelectChange = function () {
    // Cập nhật priority trong state
    const todoId = this.closest('li').dataset.id;
    const todo = state.todos.find(t => t.id === todoId);

    if (todo) {
        todo.priority = this.value;
        saveToLocalStorage();
    }

    // Cập nhật màu
    styleSelect(this);
};
const handleEditClick = function (e) {
    const li = e.target.closest('li');
    const todoId = li.dataset.id;
    const todo = state.todos.find(t => t.id === todoId);

    if (!todo) return;

    // Hiển thị popup chỉnh sửa
    showEditPopup(todo);
};
// ADD TODO
const handleAddTodo = (e) => {
    e.preventDefault();
    const text = DOM.inputList.value;
    const priority = DOM.addFormSelect.value;

    const validation = validateInput(text);
    if (!validation.isValid) {
        showPopup(validation.popup);
        return;
    }

    // Thêm vào ĐẦU mảng 
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

// UTILITY FUNCTIONS
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const saveToLocalStorage = () => {
    localStorage.setItem('todos', JSON.stringify(state.todos));
};

// VALIDATION
const validateInput = (text) => {
    if (!text) return { isValid: false, popup: 'popupEmpty' };
    if (/^\s+$/.test(text)) return { isValid: false, popup: 'popupError' };
    if (/^[^\w\sà-ỹ]+$/.test(text)) return { isValid: false, popup: 'popupError' };
    return { isValid: true };
};

// POPUP
const showPopup = (popupId) => {
    const popup = document.getElementById(popupId);
    popup.classList.add('active');
    popup.querySelector('.okPopup').onclick = () => popup.classList.remove('active');
};
const showEditPopup = (todo) => {
    const popup = document.getElementById('popupEdit');
    const input = popup.querySelector('#editList');

    // Điền giá trị hiện tại vào input
    input.value = todo.text;

    // Hiển thị popup
    popup.classList.add('active');

    // Xử lý khi submit form chỉnh sửa
    const editForm = popup.querySelector('#editForm');
    editForm.onsubmit = (e) => {
        e.preventDefault();

        const newText = input.value.trim();
        const validation = validateInput(newText);

        if (!validation.isValid) {
            showPopup(validation.popup);
            return;
        }

        // Cập nhật todo
        todo.text = newText;
        saveToLocalStorage();
        renderTodos();

        // Đóng popup
        popup.classList.remove('active');
    };

    // Xử lý nút cancel
    popup.querySelector('.cancelPopup').onclick = () => {
        popup.classList.remove('active');
    };
};
const showDeletePopup = (todoId) => {
    const popup = document.getElementById('popupDelete');
    popup.classList.add('active');

    // Xử lý khi nhấn OK
    popup.querySelector('.okPopup').onclick = () => {
        deleteTodo(todoId);
        popup.classList.remove('active');
    };

    // Xử lý khi nhấn Cancel
    popup.querySelector('.cancelPopup').onclick = () => {
        popup.classList.remove('active');
    };
};

// SELECT STYLING
const styleSelect = (selectElement) => {
    const priority = selectElement.value;
    const { text, bg } = PRIORITY_COLORS[priority] || { text: '#212529', bg: '#ffffff' };
    selectElement.style.color = text;
    selectElement.style.backgroundColor = bg;
    selectElement.style.borderColor = text;
};

// DELETE TODO
const deleteTodo = (todoId) => {
    state.todos = state.todos.filter(todo => todo.id !== todoId);
    saveToLocalStorage();
    renderTodos();
};

// RENDER TODOS
const renderTodos = () => {
    if (!DOM.listItems) return;

    DOM.listItems.innerHTML = state.todos.map(todo => `
        <li data-id="${todo.id}">
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

    initCheckboxHandlers();
    initSelectHandlers();
    initEditHandlers();
    initDeleteHandlers();
};

// INITIALIZATION
const init = () => {
    // Khởi tạo select trong form add
    if (DOM.addFormSelect) {
        styleSelect(DOM.addFormSelect);
        DOM.addFormSelect.addEventListener('change', () => styleSelect(DOM.addFormSelect));
    }

    // Form submit
    if (DOM.addForm) {
        DOM.addForm.addEventListener('submit', handleAddTodo);
    }

    renderTodos();
};

document.addEventListener('DOMContentLoaded', init);