// Показать модальное окно для добавления
function showAddForm(tableName) {
    const modal = document.getElementById('add-modal');
    const formContainer = document.getElementById('form-container');

    let formHTML = '';

    if (tableName === 'product_types') {
        formHTML = `
            <h2>Добавить тип продукции</h2>
            <form onsubmit="submitForm(event, 'product_types')">
                <div class="form-group">
                    <label>Название типа:</label>
                    <input type="text" name="product_type_name" required placeholder="Например: Гостиные">
                </div>
                <div class="form-group">
                    <label>Коэффициент:</label>
                    <input type="number" name="product_type_coefficient" step="0.1" required placeholder="Например: 3.5">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">✅ Добавить</button>
                    <button type="button" class="btn-secondary" onclick="closeAddForm()">❌ Отменить</button>
                </div>
            </form>
        `;
    } else if (tableName === 'material_types') {
        formHTML = `
            <h2>Добавить тип материала</h2>
            <form onsubmit="submitForm(event, 'material_types')">
                <div class="form-group">
                    <label>Название материала:</label>
                    <input type="text" name="material_type_name" required placeholder="Например: Мебельный щит">
                </div>
                <div class="form-group">
                    <label>% потерь:</label>
                    <input type="number" name="raw_material_loss_percent" step="0.01" required placeholder="Например: 0.8">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">✅ Добавить</button>
                    <button type="button" class="btn-secondary" onclick="closeAddForm()">❌ Отменить</button>
                </div>
            </form>
        `;
    } else if (tableName === 'products') {
        formHTML = `
            <h2>Добавить продукт</h2>
            <form onsubmit="submitForm(event, 'products')">
                <div class="form-group">
                    <label>Название продукта:</label>
                    <input type="text" name="product_name" required placeholder="Комплект мебели для гостиной">
                </div>
                <div class="form-group">
                    <label>Артикул:</label>
                    <input type="number" name="article_number" required placeholder="1549922">
                </div>
                <div class="form-group">
                    <label>Тип продукции (ID):</label>
                    <input type="number" name="product_type_id" required placeholder="1">
                </div>
                <div class="form-group">
                    <label>Тип материала (ID):</label>
                    <input type="number" name="material_type_id" required placeholder="1">
                </div>
                <div class="form-group">
                    <label>Минимальная цена (₽):</label>
                    <input type="number" name="minimum_partner_price" required placeholder="160507">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">✅ Добавить</button>
                    <button type="button" class="btn-secondary" onclick="closeAddForm()">❌ Отменить</button>
                </div>
            </form>
        `;
    } else if (tableName === 'workshops') {
        formHTML = `
            <h2>Добавить цех</h2>
            <form onsubmit="submitForm(event, 'workshops')">
                <div class="form-group">
                    <label>Название цеха:</label>
                    <input type="text" name="workshop_name" required placeholder="Проектный цех">
                </div>
                <div class="form-group">
                    <label>Тип цеха:</label>
                    <select name="workshop_type" required>
                        <option value="">Выбери тип...</option>
                        <option value="Проектирование">Проектирование</option>
                        <option value="Обработка">Обработка</option>
                        <option value="Сушка">Сушка</option>
                        <option value="Сборка">Сборка</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Количество сотрудников:</label>
                    <input type="number" name="staff_count" required placeholder="4">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">✅ Добавить</button>
                    <button type="button" class="btn-secondary" onclick="closeAddForm()">❌ Отменить</button>
                </div>
            </form>
        `;
    } else if (tableName === 'product_workshops') {
        formHTML = `
            <h2>Добавить маршрут производства</h2>
            <form onsubmit="submitForm(event, 'product_workshops')">
                <div class="form-group">
                    <label>ID продукта:</label>
                    <input type="number" name="product_id" required placeholder="1">
                </div>
                <div class="form-group">
                    <label>ID цеха:</label>
                    <input type="number" name="workshop_id" required placeholder="1">
                </div>
                <div class="form-group">
                    <label>Время производства (часы):</label>
                    <input type="number" name="manufacturing_time_hours" step="0.1" required placeholder="1.5">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">✅ Добавить</button>
                    <button type="button" class="btn-secondary" onclick="closeAddForm()">❌ Отменить</button>
                </div>
            </form>
        `;
    }

    formContainer.innerHTML = formHTML;
    modal.style.display = 'flex';
}

// Закрыть форму добавления
function closeAddForm() {
    const modal = document.getElementById('add-modal');
    modal.style.display = 'none';
}

// Отправить форму
async function submitForm(event, tableName) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const apiMap = {
        'product_types': '/api/product-types',
        'material_types': '/api/material-types',
        'products': '/api/products',
        'workshops': '/api/workshops',
        'product_workshops': '/api/product-workshops'
    };

    try {
        const response = await fetch(apiMap[tableName], {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('✅ Запись успешно добавлена!');
            closeAddForm();
            loadTableData(tableName);
        } else {
            const error = await response.json();
            alert('❌ Ошибка: ' + (error.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка при добавлении: ' + error.message);
    }
}

// Закрыть модальное окно по клику вне его
window.onclick = function(event) {
    const modal = document.getElementById('add-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}