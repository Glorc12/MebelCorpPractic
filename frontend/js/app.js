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
    console.log('🚀 Инициализируем приложение...');

    // Загрузить данные при старте
    await loadProductTypes();
    await loadMaterialTypes();
    await loadProducts();
    await loadWorkshops();
    await loadProductWorkshops();

    // Установить обработчики событий
    setupEventListeners();

    // Показать успешную инициализацию
    console.log('✅ Приложение инициализировано');
}

// ============================================
// ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ
// ============================================

/**
 * Переключить активную секцию
 */
function switchPage(page) {
    console.log('📄 Переключаемся на страницу:', page);

    // Скрыть все секции
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Показать нужную секцию
    const targetSection = document.getElementById(page);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Обновить заголовок
    const titleMap = {
        product_types: '📦 Типы продукции',
        material_types: '📄 Типы материалов',
        products: '🛍️ Продукты',
        workshops: '🏗️ Цехи',
        product_workshops: '🔗 Маршруты'
    };

    const titleEl = document.getElementById('page-title');
    if (titleEl && titleMap[page]) {
        titleEl.textContent = titleMap[page];
    }

    // Обновить кнопки в сайдбаре
    document.querySelectorAll('.sidebar__btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });
}

// ============================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================

/**
 * Установить все обработчики событий
 */
function setupEventListeners() {
    console.log('🎯 Устанавливаем обработчики событий...');

    // Переключение страниц в сайдбаре
    document.querySelectorAll('.sidebar__btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const page = btn.dataset.page;
            console.log('Клик по кнопке:', page);

            // Загрузить данные для текущей страницы
            if (page === 'products') {
                loadProducts();
            } else if (page === 'workshops') {
                loadWorkshops();
            } else if (page === 'product_types') {
                loadProductTypes();
            } else if (page === 'material_types') {
                loadMaterialTypes();
            } else if (page === 'product_workshops') {
                loadProductWorkshops();
            }

            // Переключить страницу
            switchPage(page);
        });
    });
}

// ============================================
// ЗАПУСК
// ============================================

// Запустить приложение когда DOM загружен
document.addEventListener('DOMContentLoaded', initializeApp);