/**
 * UI модуль для управления интерфейсом
 * Рендеринг таблиц в HTML формате
 */

// ============================================
// ЗАГРУЗКА ДАННЫХ
// ============================================

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Ошибка загрузки продуктов');
        const products = await response.json();
        window.products = products;
        console.log('✅ Продукты загружены:', window.products);
        renderProductsTable(products);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        showAlert('Ошибка загрузки продуктов', 'error');
    }
}

async function loadWorkshops() {
    try {
        const response = await fetch('/api/workshops');
        if (!response.ok) throw new Error('Ошибка загрузки цехов');
        const workshops = await response.json();
        window.workshops = workshops;
        console.log('✅ Цехи загружены:', window.workshops);
        renderWorkshopsTable(workshops);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        showAlert('Ошибка загрузки цехов', 'error');
    }
}

async function loadProductTypes() {
    try {
        const response = await fetch('/api/product-types');
        if (!response.ok) throw new Error('Ошибка загрузки типов продуктов');
        const productTypes = await response.json();
        window.productTypes = productTypes;
        console.log('✅ Типы продуктов загружены:', window.productTypes);
        renderProductTypesTable(productTypes);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        showAlert('Ошибка загрузки типов продуктов', 'error');
    }
}

async function loadMaterialTypes() {
    try {
        const response = await fetch('/api/material-types');
        if (!response.ok) throw new Error('Ошибка загрузки типов материалов');
        const materialTypes = await response.json();
        window.materialTypes = materialTypes;
        console.log('✅ Типы материалов загружены:', window.materialTypes);
        renderMaterialTypesTable(materialTypes);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        showAlert('Ошибка загрузки типов материалов', 'error');
    }
}

async function loadProductWorkshops() {
    try {
        const response = await fetch('/api/product-workshops');
        if (!response.ok) throw new Error('Ошибка загрузки маршрутов');
        const productWorkshops = await response.json();
        console.log('✅ Маршруты загружены:', productWorkshops);
        renderProductWorkshopsTable(productWorkshops);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        showAlert('Ошибка загрузки маршрутов', 'error');
    }
}

// ============================================
// РЕНДЕРИНГ ТАБЛИЦ (HTML)
// ============================================

function renderProductTypesTable(productTypes) {
    const container = document.getElementById('product_types-table');
    if (!container) {
        console.warn('⚠️ Контейнер product_types-table не найден');
        return;
    }

    if (!productTypes || productTypes.length === 0) {
        container.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px">Нет данных</td></tr>';
        return;
    }

    let html = productTypes.map(type => `
        <tr>
            <td>${type.product_type_id}</td>
            <td>${type.product_type_name}</td>
            <td>${type.coefficient || type.product_type_coefficient || 'N/A'}</td>
            <td><button class="btn btn--danger btn--sm" onclick="deleteRow('product_types', ${type.product_type_id})">🗑️ Удалить</button></td>
        </tr>
    `).join('');

    container.innerHTML = html;
}

function renderMaterialTypesTable(materialTypes) {
    const container = document.getElementById('material_types-table');
    if (!container) {
        console.warn('⚠️ Контейнер material_types-table не найден');
        return;
    }

    if (!materialTypes || materialTypes.length === 0) {
        container.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px">Нет данных</td></tr>';
        return;
    }

    let html = materialTypes.map(material => `
        <tr>
            <td>${material.material_type_id}</td>
            <td>${material.material_type_name}</td>
            <td>${material.loss_percentage || 'N/A'}%</td>
            <td><button class="btn btn--danger btn--sm" onclick="deleteRow('material_types', ${material.material_type_id})">🗑️ Удалить</button></td>
        </tr>
    `).join('');

    container.innerHTML = html;
}

function renderProductsTable(products) {
    const container = document.getElementById('products-table');
    if (!container) {
        console.warn('⚠️ Контейнер products-table не найден');
        return;
    }

    if (!products || products.length === 0) {
        container.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px">Нет данных</td></tr>';
        return;
    }

    let html = products.map(product => {
        const productTypeName = getProductTypeName(product.product_type_id);
        const materialTypeName = getMaterialTypeName(product.material_type_id);
        const totalTime = product.manufacturing_time_hours === -1 || product.manufacturing_time_hours === null ? '—' : product.manufacturing_time_hours;product.manufacturing_time_hours;
        return `
        <tr>
            <td>${product.product_id}</td>
            <td>${product.product_name}</td>
            <td>${product.article_number}</td>
            <td>${productTypeName}</td>
            <td>${materialTypeName}</td>
            <td>${parseFloat(product.minimum_partner_price).toLocaleString('ru-RU')} ₽</td>
            <td><strong>${totalTime}</strong> ч</td>
            <td><button class="btn btn--danger btn--sm" onclick="deleteRow('products', ${product.product_id})">🗑️ Удалить</button></td>
        </tr>
    `;
    }).join('');

    container.innerHTML = html;
}


function renderWorkshopsTable(workshops) {
    const container = document.getElementById('workshops-table');
    if (!container) {
        console.warn('⚠️ Контейнер workshops-table не найден');
        return;
    }

    if (!workshops || workshops.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px">Нет данных</td></tr>';
        return;
    }

    let html = workshops.map(workshop => `
        <tr>
            <td>${workshop.workshop_id}</td>
            <td>${workshop.workshop_name}</td>
            <td>${workshop.workshop_type}</td>
            <td>${workshop.staff_count}</td>
            <td><button class="btn btn--danger btn--sm" onclick="deleteRow('workshops', ${workshop.workshop_id})">🗑️ Удалить</button></td>
        </tr>
    `).join('');

    container.innerHTML = html;
}

function renderProductWorkshopsTable(productWorkshops) {
    const container = document.getElementById('product_workshops-table');
    if (!container) {
        console.warn('⚠️ Контейнер product_workshops-table не найден');
        return;
    }

    if (!productWorkshops || productWorkshops.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px">Нет данных</td></tr>';
        return;
    }

    let html = productWorkshops.map(pw => `
        <tr>
            <td>${pw.product_workshop_id}</td>
            <td>${pw.product_name}</td>
            <td>${pw.workshop_name}</td>
            <td>${pw.manufacturing_time_hours}</td>
            <td><button class="btn btn--danger btn--sm" onclick="deleteRow('product_workshops', ${pw.product_workshop_id})">🗑️ Удалить</button></td>
        </tr>
    `).join('');

    container.innerHTML = html;
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function getProductTypeName(typeId) {
    if (!window.productTypes) return typeId;
    const type = window.productTypes.find(t => t.product_type_id === typeId);
    return type ? type.product_type_name : typeId;
}

function getMaterialTypeName(typeId) {
    if (!window.materialTypes) return typeId;
    const type = window.materialTypes.find(t => t.material_type_id === typeId);
    return type ? type.material_type_name : typeId;
}

// ============================================
// УДАЛЕНИЕ ЗАПИСЕЙ
// ============================================

async function deleteRow(tableName, id) {
    if (!confirm('Вы уверены что хотите удалить эту запись?')) {
        return;
    }

    const apiMap = {
        product_types: '/api/product-types',
        material_types: '/api/material-types',
        products: '/api/products',
        workshops: '/api/workshops',
        product_workshops: '/api/product-workshops'
    };

    try {
        const response = await fetch(`${apiMap[tableName]}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('✅ Запись удалена!', 'success');

            // Перезагрузить таблицу
            if (tableName === 'products') {
                loadProducts();
            } else if (tableName === 'workshops') {
                loadWorkshops();
            } else if (tableName === 'product_types') {
                loadProductTypes();
            } else if (tableName === 'material_types') {
                loadMaterialTypes();
            } else if (tableName === 'product_workshops') {
                loadProductWorkshops();
            }
        } else {
            const error = await response.json();
            showAlert('❌ Ошибка удаления: ' + (error.message || error.error), 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка:', error);
        showAlert('❌ Ошибка: ' + error.message, 'error');
    }
}

// ============================================
// АЛЕРТ
// ============================================

function showAlert(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Можно добавить красивый всплывающий алерт
    alert(message);
}
