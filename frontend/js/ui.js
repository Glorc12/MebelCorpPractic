
    /**
 * UI модуль для управления интерфейсом
 * Содержит функции для отображения данных, переключения страниц и взаимодействия с элементами
 */

// ============================================
// УПРАВЛЕНИЕ СТРАНИЦАМИ
// ============================================

/**
 * Переключить активную страницу
 * @param {string} pageName - название страницы (products, workshops, edit-product, product-workshops)
 */
function switchPage(pageName) {
    // Скрыть все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('page--active');
    });

    // Показать нужную страницу
    const page = document.getElementById(`page-${pageName}`);
    if (page) {
        page.classList.add('page--active');
    }

    // Обновить активную кнопку в сайдбаре
    document.querySelectorAll('.sidebar__btn').forEach(btn => {
        btn.classList.remove('sidebar__btn--active');
    });

    const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('sidebar__btn--active');
    }

    // Очистить контейнеры алертов
    clearAlerts();
}

// ============================================
// ALERTS (УВЕДОМЛЕНИЯ)
// ============================================

/**
 * Показать уведомление
 * @param {string} message - текст сообщения
 * @param {string} type - тип (success, error, warning, info)
 * @param {string} containerId - ID контейнера для уведомления
 * @param {number} duration - длительность показа (мс), 0 = не скрывать
 */
function showAlert(message, type = 'info', containerId = 'alert-container', duration = 5000) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const titles = {
        success: 'Успешно',
        error: 'Ошибка',
        warning: 'Предупреждение',
        info: 'Информация'
    };

    const alert = document.createElement('div');
    alert.className = `alert alert--${type}`;
    alert.innerHTML = `
        <div class="alert__icon">${icons[type]}</div>
        <div class="alert__content">
            <div class="alert__title">${titles[type]}</div>
            <div class="alert__message">${escapeHtml(message)}</div>
        </div>
        <button class="alert__close" aria-label="Закрыть">&times;</button>
    `;

    container.appendChild(alert);

    // Закрытие по кнопке
    alert.querySelector('.alert__close').addEventListener('click', () => {
        alert.remove();
    });

    // Автозакрытие
    if (duration > 0) {
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, duration);
    }
}

/**
 * Очистить все уведомления
 */
function clearAlerts() {
    document.querySelectorAll('.alert-container').forEach(container => {
        container.innerHTML = '';
    });
}

// ============================================
// ТАБЛИЦА ПРОДУКЦИИ
// ============================================

/**
 * Отобразить продукты в таблице
 * @param {Array} products - массив продуктов
 */
function renderProducts(products) {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #999;">
                    Нет данных о продукции
                </td>
            </tr>
        `;
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(String(product.article_number))}</strong></td>
            <td>${escapeHtml(product.product_name)}</td>
            <td>${escapeHtml(product.product_type || 'N/A')}</td>
            <td>${escapeHtml(product.material_type || 'N/A')}</td>
            <td>${(product.minimum_partner_price || 0).toFixed(2).replace('.', ',')}</td>
            <td>${product.manufacturing_time_hours || 0} ч</td>
            <td>
                <div class="table__actions">
                    <button class="btn btn--secondary" data-edit="${product.product_id}" title="Редактировать">
                        ✏️ Изменить
                    </button>
                    <button class="btn btn--primary" data-workshops="${product.product_id}" title="Цеха производства">
                        🏭 Цеха
                    </button>
                    <button class="btn btn--danger" data-delete="${product.product_id}" title="Удалить">
                        🗑️ Удалить
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Добавить обработчики для кнопок редактирования и удаления
    document.querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.edit);
            editProduct(productId);
        });
    });

    document.querySelectorAll('[data-workshops]').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.workshops);
            const row = btn.closest('tr');
            const productName = row ? row.querySelector('td:nth-child(2)').textContent.trim() : '';
            loadProductWorkshops(productId, productName);
        });
    });

    document.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.delete);
            deleteProductWithConfirm(productId);
        });
    });
}

// ============================================
// ТАБЛИЦА ЦЕХОВ
// ============================================

/**
 * Отобразить цеха в таблице
 * @param {Array} workshops - массив цехов
 */
function renderWorkshops(workshops) {
    const tbody = document.getElementById('workshops-tbody');
    tbody.innerHTML = '';

    if (workshops.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 2rem; color: #999;">
                    Нет данных о цехах
                </td>
            </tr>
        `;
        return;
    }

    workshops.forEach(workshop => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(workshop.workshop_name)}</strong></td>
            <td>${escapeHtml(workshop.workshop_type || 'N/A')}</td>
            <td style="text-align: center;">${workshop.staff_count || 0}</td>
        `;
        tbody.appendChild(row);
    });
}

// ============================================
// ЦЕХА ДЛЯ КОНКРЕТНОГО ПРОДУКТА
// ============================================

/**
 * Отобразить цеха для выбранного продукта
 * @param {Array} workshops - массив цехов продукта
 */
function renderProductWorkshops(workshops) {
    const tbody = document.getElementById('product-workshops-tbody');
    tbody.innerHTML = '';

    if (!workshops || workshops.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem; color: #999;">
                    Для данного продукта не настроены цеха производства
                </td>
            </tr>
        `;
        return;
    }

    workshops.forEach(ws => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(ws.workshop_name)}</strong></td>
            <td>${escapeHtml(ws.workshop_type || 'N/A')}</td>
            <td style="text-align: center;">${ws.staff_count || 0}</td>
            <td style="text-align: center;">${(ws.manufacturing_time_hours || 0).toFixed(2).replace('.', ',')}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Загрузить список цехов для конкретного продукта и показать страницу
 * @param {number} productId - ID продукта
 * @param {string} productName - наименование продукта
 */
async function loadProductWorkshops(productId, productName = '') {
    try {
        const titleEl = document.getElementById('product-workshops-title');
        if (titleEl) {
            titleEl.textContent = productName
                ? `Цеха для продукции: ${productName}`
                : 'Цеха для продукции';
        }

        const response = await fetch(`/api/workshops/product/${productId}`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки цехов (код ${response.status})`);
        }

        const workshops = await response.json();
        renderProductWorkshops(workshops);

        // Переключиться на страницу цехов продукта
        switchPage('product-workshops');
    } catch (error) {
        console.error('Ошибка загрузки цехов для продукта:', error);
        showAlert(
            `Ошибка загрузки цехов для продукта: ${error.message}`,
            'error',
            'alert-container-product-workshops'
        );
    }
}

// ============================================
// ФОРМА РЕДАКТИРОВАНИЯ
// ============================================

// Переменная для хранения ID редактируемого продукта (null = добавление нового)
let currentEditingProductId = null;

/**
 * Показать форму редактирования продукта
 * @param {number} productId - ID продукта (null для нового)
 */
async function showEditForm(productId = null) {
    currentEditingProductId = productId;
    const titleEl = document.getElementById('edit-title');
    const form = document.getElementById('form-product');

    // Очистить форму
    form.reset();
    clearFormErrors();

    if (productId) {
        // Редактирование существующего
        titleEl.textContent = 'Редактировать продукт';
        try {
            const product = await getProductById(productId);

            // Заполнить поля формы
            document.getElementById('product-article').value = product.article_number;
            document.getElementById('product-name').value = product.product_name;
            document.getElementById('product-type').value = product.product_type_id;
            document.getElementById('product-material').value = product.material_type_id;
            document.getElementById('product-price').value = product.minimum_partner_price;
        } catch (error) {
            showAlert(`Ошибка загрузки продукта: ${error.message}`, 'error', 'alert-container-edit');
        }
    } else {
        // Добавление нового
        titleEl.textContent = 'Добавить новый продукт';
    }

    switchPage('edit-product');
}

/**
 * Редактировать продукт (запустить форму редактирования)
 * @param {number} productId - ID продукта
 */
async function editProduct(productId) {
    await showEditForm(productId);
}

/**
 * Удалить продукт с подтверждением
 * @param {number} productId - ID продукта
 */
async function deleteProductWithConfirm(productId) {
    // Стандартный confirm диалог
    if (!confirm('Вы уверены? Эта операция не может быть отменена.')) {
        return;
    }

    try {
        await deleteProduct(productId);
        showAlert('Продукт успешно удалён', 'success', 'alert-container', 3000);
        loadProducts(); // Перезагрузить список
    } catch (error) {
        showAlert(`Ошибка удаления: ${error.message}`, 'error', 'alert-container');
    }
}

// ============================================
// ВАЛИДАЦИЯ ФОРМЫ
// ============================================

/**
 * Получить ошибку для поля
 * @param {string} fieldName - название поля
 * @param {string|number} value - значение поля
 * @returns {string} текст ошибки (пусто, если валидно)
 */
function validateField(fieldName, value) {
    // Преобразовать в строку если число и убрать пробелы
    const strValue = String(value).trim();

    switch (fieldName) {
        case 'article_number':
            if (!strValue || strValue === '') {
                return 'Артикул обязателен';
            }
            if (isNaN(value) || value < 1) {
                return 'Артикул должен быть положительным числом';
            }
            return '';

        case 'product_type_id':
            if (!strValue || strValue === '') {
                return 'Выберите тип продукта';
            }
            return '';

        case 'product_name':
            if (!strValue || strValue === '') {
                return 'Наименование обязательно';
            }
            if (strValue.length < 3) {
                return 'Наименование должно содержать минимум 3 символа';
            }
            return '';

        case 'material_type_id':
            if (!strValue || strValue === '') {
                return 'Выберите материал';
            }
            return '';

        case 'minimum_partner_price':
            if (!strValue || strValue === '') {
                return 'Цена обязательна';
            }
            const price = parseFloat(value);
            if (isNaN(price) || price < 0) {
                return 'Цена не может быть отрицательной';
            }
            if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
                return 'Цена должна иметь максимум 2 знака после запятой';
            }
            return '';

        default:
            return '';
    }
}

/**
 * Очистить ошибки формы
 */
function clearFormErrors() {
    document.querySelectorAll('.form__error').forEach(el => {
        el.textContent = '';
    });
    document.querySelectorAll('.form-control.error').forEach(el => {
        el.classList.remove('error');
    });
}

/**
 * Показать ошибку валидации в форме
 * @param {string} fieldName - название поля
 * @param {string} errorText - текст ошибки
 */
function setFieldError(fieldName, errorText) {
    const errorEl = document.getElementById(`error-${fieldName.replace(/_/g, '-')}`);
    const inputEl = document.getElementById(`product-${fieldName.replace(/_/g, '-')}`);

    if (errorEl) {
        errorEl.textContent = errorText;
    }
    if (inputEl) {
        if (errorText) {
            inputEl.classList.add('error');
        } else {
            inputEl.classList.remove('error');
        }
    }
}

/**
 * Валидировать и отправить форму
 */
async function submitProductForm() {
    clearFormErrors();

    // Собрать данные из формы
    const formData = {
        article_number: parseInt(document.getElementById('product-article').value),
        product_type_id: parseInt(document.getElementById('product-type').value),
        product_name: document.getElementById('product-name').value,
        material_type_id: parseInt(document.getElementById('product-material').value),
        minimum_partner_price: parseFloat(document.getElementById('product-price').value)
    };

    // Валидировать каждое поле
    let hasErrors = false;
    Object.entries(formData).forEach(([key, value]) => {
        const error = validateField(key, value);
        if (error) {
            setFieldError(key, error);
            hasErrors = true;
        }
    });

    if (hasErrors) {
        showAlert('Пожалуйста, исправьте ошибки в форме', 'warning', 'alert-container-edit');
        return;
    }

    try {
        if (currentEditingProductId) {
            // Обновление
            await updateProduct(currentEditingProductId, formData);
            showAlert('Продукт успешно обновлён', 'success', 'alert-container', 3000);
        } else {
            // Создание
            await createProduct(formData);
            showAlert('Продукт успешно создан', 'success', 'alert-container', 3000);
        }

        // Вернуться к списку продукции
        await loadProducts();
        switchPage('products');
    } catch (error) {
        showAlert(`Ошибка: ${error.message}`, 'error', 'alert-container-edit');
    }
}

// ============================================
// ЗАГРУЗКА ДАННЫХ
// ============================================

/**
 * Загрузить и отобразить продукты
 */
async function loadProducts() {
    try {
        const products = await getProducts();
        renderProducts(products);
    } catch (error) {
        showAlert(`Ошибка загрузки продукции: ${error.message}`, 'error', 'alert-container');
    }
}

/**
 * Загрузить и отобразить цеха
 */
async function loadWorkshops() {
    try {
        const workshops = await getWorkshops();
        renderWorkshops(workshops);
    } catch (error) {
        showAlert(`Ошибка загрузки цехов: ${error.message}`, 'error', 'alert-container-workshops');
    }
}

/**
 * Загрузить типы продукции в выпадающий список
 */
async function loadProductTypes() {
    try {
        const select = document.getElementById('product-type');
        const types = [
            { id: 1, name: 'Гостиные' },
            { id: 2, name: 'Прихожие' },
            { id: 3, name: 'Мягкая мебель' },
            { id: 4, name: 'Кровати' },
            { id: 5, name: 'Шкафы' },
            { id: 6, name: 'Комоды' }
        ];
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки типов продукции:', error);
    }
}

/**
 * Загрузить типы материалов в выпадающий список
 */
async function loadMaterialTypes() {
    try {
        const select = document.getElementById('product-material');
        const types = [
            { id: 1, name: 'Мебельный щит из массива дерева' },
            { id: 2, name: 'Ламинированное ДСП' },
            { id: 3, name: 'Фанера' },
            { id: 4, name: 'МДФ' }
        ];
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки типов материалов:', error);
    }
}

// ============================================
// УТИЛИТЫ
// ============================================

/**
 * Экранировать HTML символы (защита от XSS)
 * @param {string} text - текст для экранирования
 * @returns {string} экранированный текст
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Глобальная функция для загрузки таблицы
async function loadTable(tableName) {
    const apiMap = {
        'product_types': '/api/product-types',
        'material_types': '/api/material-types',
        'products': '/api/products',
        'workshops': '/api/workshops',
        'product_workshops': '/api/product-workshops'
    };

    const url = apiMap[tableName];
    if (!url) return alert('❌ Таблица не найдена');

    try {
        console.log(`🔄 Загружаю таблицу: ${tableName}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        console.log(`✅ Данные загружены:`, data);
        renderTable(tableName, data);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        alert(`❌ Ошибка при загрузке таблицы: ${error.message}`);
    }
}

// Функция отрисовки таблицы
function renderTable(tableName, data) {
    const mainContent = document.querySelector('main') ||
                       document.getElementById('content') ||
                       document.querySelector('.content');

    if (!mainContent) {
        alert('❌ Контейнер для контента не найден');
        return;
    }

    const columns = {
        'product_types': ['product_type_id', 'product_type_name', 'coefficient'],
        'material_types': ['material_type_id', 'material_type_name', 'loss_percent'],
        'products': ['product_id', 'product_name', 'article_number', 'minimum_partner_price'],
        'workshops': ['workshop_id', 'workshop_name', 'workshop_type', 'staff_count'],
        'product_workshops': ['product_workshop_id', 'product_name', 'workshop_name', 'manufacturing_time_hours']
    };

    const tableLabels = {
        'product_types': '📊 Типы продукции',
        'material_types': '🪵 Типы материалов',
        'products': '📦 Продукты',
        'workshops': '🏗️ Цехи',
        'product_workshops': '🛣️ Маршруты производства'
    };

    const cols = columns[tableName] || [];
    const label = tableLabels[tableName] || tableName;

    if (!data || data.length === 0) {
        mainContent.innerHTML = `
            <div style="padding: 20px;">
                <h2>${label}</h2>
                <p style="color: #666;">📭 Нет данных</p>
                <button onclick="addNewRow('${tableName}')" style="padding: 10px 20px; cursor: pointer;">+ Добавить</button>
            </div>
        `;
        return;
    }

    let html = `<div style="padding: 20px;">
        <h2>${label}</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
            <tr style="background: #007bff; color: white;">
                ${cols.map(col => `<th style="padding: 10px; text-align: left;">${col}</th>`).join('')}
                <th style="padding: 10px;">Действия</th>
            </tr>
        </thead>
        <tbody>
            ${data.map((row, idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#f9f9f9' : 'white'}; border-bottom: 1px solid #ddd;">
                    ${cols.map(col => `<td style="padding: 10px;">${row[col] || '—'}</td>`).join('')}
                    <td style="padding: 10px;">
                        <button onclick="deleteRow('${tableName}', ${row[cols[0]]})"
                                style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">
                            🗑️ Удалить
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    <button onclick="addNewRow('${tableName}')" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">+ Добавить</button>
    </div>`;

    mainContent.innerHTML = html;
}

// Функция удаления
async function deleteRow(tableName, id) {
    if (!confirm('⚠️ Ты уверен? Это удалит запись безвозвратно!')) return;

    const apiMap = {
        'product_types': '/api/product-types',
        'material_types': '/api/material-types',
        'products': '/api/products',
        'workshops': '/api/workshops',
        'product_workshops': '/api/product-workshops'
    };

    try {
        const response = await fetch(`${apiMap[tableName]}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('✅ Запись удалена!');
            loadTable(tableName);
        } else {
            alert('❌ Ошибка при удалении');
        }
    } catch (error) {
        console.error('❌ Ошибка:', error);
        alert('❌ Ошибка при удалении: ' + error.message);
    }
}

// Функция добавления новой строки
function addNewRow(tableName) {
    alert('➕ Функция добавления в разработке\nПока используй POST запросы через API');
}
