// ================ STATE ================
const state = {
    todos: []
};

// ================ DOM ELEMENTS ================
const DOM = {
    prioritySelects: document.querySelectorAll('.select-item'),
    addFormSelect: document.getElementById('priority')
};

// ================ PRIORITY COLORS ================
const PRIORITY_COLORS = {
    low: { text: '#2e7d32', bg: '#e8f5e9' },
    medium: { text: '#f57f17', bg: '#fff8e1' },
    hight: { text: '#c62828', bg: '#ffebee' }
};

// ================ FUNCTION ================
/**
 * Cập nhật giao diện select dựa trên option được chọn
 */
const styleSelectBasedOnOption = (selectElement) => {
    const selectedValue = selectElement.value;
    const { text, bg } = PRIORITY_COLORS[selectedValue] || { text: '#212529', bg: '#ffffff' };

    // Áp dụng màu sắc
    selectElement.style.color = text;
    selectElement.style.backgroundColor = bg;
    selectElement.style.borderColor = text;
};

// ================ EVENT HANDLERS ================
/**
 * Khởi tạo sự kiện cho tất cả select
 */
const initSelectEvents = () => {
    // Style và lắng nghe sự kiện cho tất cả select
    DOM.prioritySelects.forEach(select => {
        styleSelectBasedOnOption(select);
        select.addEventListener('change', () => styleSelectBasedOnOption(select));
    });

    // Xử lý riêng cho select trong form add 
    if (DOM.addFormSelect) {
        styleSelectBasedOnOption(DOM.addFormSelect);
        DOM.addFormSelect.addEventListener('change', () => {
            styleSelectBasedOnOption(DOM.addFormSelect);
        });
    }
};

// ================ INITIALIZATION ================
const init = () => {
    initSelectEvents();
};

document.addEventListener('DOMContentLoaded', init);