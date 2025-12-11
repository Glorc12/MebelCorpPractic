/**
 * Главный модуль приложения
 * Инициализация обработчиков событий и загрузка данных при старте
 */

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

/**
 * Инициализировать приложение
 */
async function initializeApp() {
    // Загрузить данные при старте
    await loadProducts();
    await loadWorkshops();

    // Загрузить справочники для формы
    loadProductTypes();
    loadMaterialTypes();

    // Установить обработчики событий
    setupEventListeners();

    // Показать успешную инициализацию
    console.log('Приложение инициализировано');
}

// ============================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================

/**
 * Установить все обработчики событий
 */
function setupEventListeners() {
    // Переключение страниц в сайдбаре
    document.querySelectorAll('.sidebar__btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            if (page === 'products') {
                loadProducts();
            } else if (page === 'workshops') {
                loadWorkshops();
            }
            switchPage(page);
        });
    });

    // Кнопка добавить продукт
    document.getElementById('btn-add-product').addEventListener('click', () => {
        showEditForm(null);
    });

    // Кнопка назад в форме редактирования
    document.getElementById('btn-back-to-products').addEventListener('click', () => {
        switchPage('products');
    });

    // Кнопка отмена в форме редактирования
    document.getElementById('btn-cancel-edit').addEventListener('click', () => {
        switchPage('products');
    });

    // Отправка формы
    document.getElementById('form-product').addEventListener('submit', (e) => {
        e.preventDefault();
        submitProductForm();
    });

    // Переключение фокуса между полями для улучшения UX
    document.querySelectorAll('.form__input').forEach(input => {
        input.addEventListener('focus', function() {
            // Очистить ошибку для этого поля при фокусе
            const fieldName = this.id.replace('product-', '').replace(/-/g, '_');
            const errorEl = document.getElementById(`error-${this.id.replace('product-', '')}`);
            if (errorEl && errorEl.textContent) {
                // Ошибка была, но пользователь начал редактировать — очистим
                errorEl.textContent = '';
                this.classList.remove('error');
            }
        });
    });
}

// ============================================
// ЗАПУСК
// ============================================

// Запустить приложение когда DOM загружен
document.addEventListener('DOMContentLoaded', initializeApp);
