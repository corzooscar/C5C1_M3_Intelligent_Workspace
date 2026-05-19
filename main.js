// --- SELECTORES DEL DOM ---
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const completedCount = document.getElementById('completed-count');
const themeToggle = document.getElementById('theme-toggle');
const welcomeBanner = document.getElementById('welcome-banner');

// --- ESTADO DE LA APLICACIÓN ---
// localStorage: Persiste tareas y tema
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentTheme = localStorage.getItem('theme') || 'light';

// sessionStorage: Datos volátiles de la sesión
let currentFilter = sessionStorage.getItem('currentFilter') || 'all';
let searchText = sessionStorage.getItem('searchText') || '';

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Aplicar tema persistente
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // 2. Manejo del Banner de bienvenida (sessionStorage)
    if (!sessionStorage.getItem('welcomeShown')) {
        welcomeBanner.textContent = "¡Bienvenido a tu Workspace Inteligente de esta sesión!";
        welcomeBanner.classList.remove('hidden');
        sessionStorage.setItem('welcomeShown', 'true');
    }

    // 3. Restaurar filtros y búsquedas de la sesión
    searchInput.value = searchText;
    setActiveFilterButton(currentFilter);

    // 4. Renderizar por primera vez
    renderTodos();
});

// --- FUNCIONES PRINCIPALES (DOM & LOGIC) ---

function renderTodos() {
    todoList.innerHTML = '';
    let doneCounter = 0;

    // Filtrar la lista basándonos en el estado (tanto persistente como temporal)
    const filteredTodos = todos.filter(todo => {
        const matchesSearch = todo.text.toLowerCase().includes(searchText.toLowerCase());
        
        if (todo.completed) doneCounter++; // Para el contador general

        if (currentFilter === 'pending') return !todo.completed && matchesSearch;
        if (currentFilter === 'completed') return todo.completed && matchesSearch;
        return matchesSearch;
    });

    // Actualizar contador (Bonus)
    completedCount.textContent = doneCounter;

    // Crear elementos del DOM
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <span onclick="toggleComplete('${todo.id}')">${todo.text}</span>
            <div class="todo-actions">
                <button class="btn-edit" onclick="editTodo('${todo.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteTodo('${todo.id}')">Borrar</button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

// Agregar Tarea
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;

    const newTodo = {
        id: Date.now().toString(),
        text: text,
        completed: false
    };

    todos.push(newTodo);
    saveTodos();
    renderTodos();
    todoForm.reset();
});

// Marcar Completada
window.toggleComplete = (id) => {
    todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    saveTodos();
    renderTodos();
};

// Eliminar Tarea
window.deleteTodo = (id) => {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
};

// Editar Tarea (Bonus)
window.editTodo = (id) => {
    const todo = todos.find(t => t.id === id);
    const newText = prompt("Editar tarea:", todo.text);
    if (newText !== null && newText.trim() !== "") {
        todo.text = newText.trim();
        saveTodos();
        renderTodos();
    }
};

// --- GESTIÓN DE STORAGES ---

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Búsqueda Temporal (sessionStorage)
searchInput.addEventListener('input', (e) => {
    searchText = e.target.value;
    sessionStorage.setItem('searchText', searchText);
    renderTodos();
});

// Filtros Temporales (sessionStorage)
filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentFilter = e.target.getAttribute('data-filter');
        sessionStorage.setItem('currentFilter', currentFilter);
        setActiveFilterButton(currentFilter);
        renderTodos();
    });
});

function setActiveFilterButton(filter) {
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });
}

// Modo Oscuro Persistente (localStorage - Bonus)
themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
});