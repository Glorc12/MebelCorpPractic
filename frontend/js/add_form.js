/**
 * 🚀 ПУТЬ 1: ГОТОВАЯ РЕАЛИЗАЦИЯ - Select вместо ID полей
 *
 * Это ИСПРАВЛЕННЫЙ add_form.js с выпадающими списками SELECT
 * вместо текстовых полей для ID
 */

/**
 * Показать модальное окно для добавления (универсальная версия)
 */
async function showAddForm(tableName) {
  console.log(`📝 Открываем форму для: ${tableName}`);

  const modal = document.getElementById('add-modal');
  const formContainer = document.getElementById('form-container');
  let formHTML = '';

  try {
    if (tableName === 'product_types') {
      formHTML = `
        <h2>➕ Добавить тип продукции</h2>
        <form id="form-add" onsubmit="submitAddProductType(event)">
          <div class="form-group">
            <label for="product_type_name">Название типа:</label>
            <input type="text" id="product_type_name" placeholder="Деревянная мебель" required />
          </div>
          <div class="form-group">
            <label for="coefficient">Коэффициент:</label>
            <input type="number" id="coefficient" step="0.01" placeholder="1.5" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn--primary">✅ Добавить</button>
            <button type="button" class="btn btn--secondary" onclick="closeAddForm()">❌ Отмена</button>
          </div>
        </form>
      `;

    } else if (tableName === 'material_types') {
      formHTML = `
        <h2>➕ Добавить тип материала</h2>
        <form id="form-add" onsubmit="submitAddMaterialType(event)">
          <div class="form-group">
            <label for="material_type_name">Название материала:</label>
            <input type="text" id="material_type_name" placeholder="Дерево" required />
          </div>
          <div class="form-group">
            <label for="loss_percentage">% потерь при обработке:</label>
            <input type="number" id="loss_percentage" step="0.01" placeholder="15" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn--primary">✅ Добавить</button>
            <button type="button" class="btn btn--secondary" onclick="closeAddForm()">❌ Отмена</button>
          </div>
        </form>
      `;

    } else if (tableName === 'products') {
      // 🔑 ЗАГРУЖАЕМ СПРАВОЧНИКИ
      const [productTypes, materialTypes] = await Promise.all([
        fetch('/api/product-types').then(r => r.json()),
        fetch('/api/material-types').then(r => r.json())
      ]);

      console.log('📦 Загруженные справочники:', { productTypes, materialTypes });

      // ✅ СОЗДАЁМ SELECT ДЛЯ ТИПОВ ПРОДУКТОВ
      const productTypesHTML = `
        <select id="product_type_id" required>
          <option value="">-- Выберите тип продукции --</option>
          ${productTypes.map(t => `
            <option value="${t.product_type_id}">
              ${t.product_type_name}
            </option>
          `).join('')}
        </select>
      `;

      // ✅ СОЗДАЁМ SELECT ДЛЯ ТИПОВ МАТЕРИАЛОВ
      const materialTypesHTML = `
        <select id="material_type_id" required>
          <option value="">-- Выберите тип материала --</option>
          ${materialTypes.map(m => `
            <option value="${m.material_type_id}">
              ${m.material_type_name} (${m.loss_percentage}%)
            </option>
          `).join('')}
        </select>
      `;

      formHTML = `
        <h2>➕ Добавить продукт</h2>
        <form id="form-add" onsubmit="submitAddProduct(event)">
          <div class="form-group">
            <label for="product_name">Название продукта:</label>
            <input type="text" id="product_name" placeholder="Кресло офисное" required />
          </div>

          <div class="form-group">
            <label for="article_number">Артикул:</label>
            <input type="number" id="article_number" placeholder="1549922" required />
          </div>

          <div class="form-group">
            <label for="product_type_id">Тип продукции:</label>
            ${productTypesHTML}
          </div>

          <div class="form-group">
            <label for="material_type_id">Тип материала:</label>
            ${materialTypesHTML}
          </div>

          <div class="form-group">
            <label for="minimum_partner_price">Минимальная цена (Р):</label>
            <input type="number" id="minimum_partner_price" step="0.01" placeholder="160507" required />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn--primary">✅ Добавить продукт</button>
            <button type="button" class="btn btn--secondary" onclick="closeAddForm()">❌ Отмена</button>
          </div>
        </form>
      `;

    } else if (tableName === 'workshops') {
      formHTML = `
        <h2>➕ Добавить мастерскую</h2>
        <form id="form-add" onsubmit="submitAddWorkshop(event)">
          <div class="form-group">
            <label for="workshop_name">Название мастерской:</label>
            <input type="text" id="workshop_name" placeholder="Цех №1" required />
          </div>

          <div class="form-group">
            <label for="workshop_type">Тип мастерской:</label>
            <input type="text" id="workshop_type" placeholder="Столярная" required />
          </div>

          <div class="form-group">
            <label for="staff_count">Количество сотрудников:</label>
            <input type="number" id="staff_count" min="1" placeholder="5" required />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn--primary">✅ Добавить</button>
            <button type="button" class="btn btn--secondary" onclick="closeAddForm()">❌ Отмена</button>
          </div>
        </form>
      `;

    } else if (tableName === 'product_workshops') {
      // 🔑 ЗАГРУЖАЕМ СПРАВОЧНИКИ ПРОДУКТОВ И МАСТЕРСКИХ
      const [products, workshops] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/workshops').then(r => r.json())
      ]);

      console.log('📦 Загруженные справочники:', { products, workshops });

      // ✅ СОЗДАЁМ SELECT ДЛЯ ПРОДУКТОВ
      const productsHTML = `
        <select id="product_id" required>
          <option value="">-- Выберите продукт --</option>
          ${products.map(p => `
            <option value="${p.product_id}">
              ${p.product_name} (Артикул: ${p.article_number})
            </option>
          `).join('')}
        </select>
      `;

      // ✅ СОЗДАЁМ SELECT ДЛЯ МАСТЕРСКИХ
      const workshopsHTML = `
        <select id="workshop_id" required>
          <option value="">-- Выберите мастерскую --</option>
          ${workshops.map(w => `
            <option value="${w.workshop_id}">
              ${w.workshop_name} (${w.workshop_type})
            </option>
          `).join('')}
        </select>
      `;

      formHTML = `
        <h2>➕ Привязать продукт к мастерской</h2>
        <form id="form-add" onsubmit="submitAddProductWorkshop(event)">
          <div class="form-group">
            <label for="product_id">Продукт:</label>
            ${productsHTML}
          </div>

          <div class="form-group">
            <label for="workshop_id">Мастерская:</label>
            ${workshopsHTML}
          </div>

          <div class="form-group">
            <label for="manufacturing_time_hours">Время производства (часов):</label>
            <input type="number" id="manufacturing_time_hours" step="0.5" min="0.5" placeholder="8" required />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn--primary">✅ Добавить связь</button>
            <button type="button" class="btn btn--secondary" onclick="closeAddForm()">❌ Отмена</button>
          </div>
        </form>
      `;
    }

    formContainer.innerHTML = formHTML;
    modal.style.display = 'flex';

  } catch (error) {
    console.error('❌ Ошибка при загрузке формы:', error);
    showAlert('❌ Ошибка загрузки формы: ' + error.message, 'error');
  }
}

/**
 * Закрыть форму
 */
function closeAddForm() {
  const modal = document.getElementById('add-modal');
  modal.style.display = 'none';
}

/**
 * Отправить форму типа продукции
 */
async function submitAddProductType(event) {
  event.preventDefault();

  const name = document.getElementById('product_type_name')?.value?.trim();
  const coefficient = document.getElementById('coefficient')?.value;

  if (!name || !coefficient) {
    showAlert('❌ Заполни все поля!', 'error');
    return;
  }

  try {
    const response = await fetch('/api/product-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_type_name: name,
        product_type_coefficient: parseFloat(coefficient)
      })
    });

    if (response.ok) {
      showAlert('✅ Тип продукции добавлен!', 'success');
      closeAddForm();
      if (typeof loadProductTypes === 'function') loadProductTypes();
    } else {
      const error = await response.json();
      showAlert('❌ Ошибка: ' + (error.error || error.message || 'Неизвестная ошибка'), 'error');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
    showAlert('❌ Ошибка сети: ' + error.message, 'error');
  }
}

/**
 * Отправить форму типа материала
 */
async function submitAddMaterialType(event) {
  event.preventDefault();

  const name = document.getElementById('material_type_name')?.value?.trim();
  const loss = document.getElementById('loss_percentage')?.value;

  if (!name || loss === null || loss === '') {
    showAlert('❌ Заполни все поля!', 'error');
    return;
  }

  try {
    const response = await fetch('/api/material-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        material_type_name: name,
        loss_percentage: parseFloat(loss)
      })
    });

    if (response.ok) {
      showAlert('✅ Тип материала добавлен!', 'success');
      closeAddForm();
      if (typeof loadMaterialTypes === 'function') loadMaterialTypes();
    } else {
      const error = await response.json();
      showAlert('❌ Ошибка: ' + (error.error || error.message), 'error');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
    showAlert('❌ Ошибка сети: ' + error.message, 'error');
  }
}

/**
 * Отправить форму продукта
 */
async function submitAddProduct(event) {
  event.preventDefault();

  const name = document.getElementById('product_name')?.value?.trim();
  const article = document.getElementById('article_number')?.value;
  const typeId = document.getElementById('product_type_id')?.value;
  const materialId = document.getElementById('material_type_id')?.value;
  const price = document.getElementById('minimum_partner_price')?.value;

  if (!name || !article || !typeId || !materialId || !price) {
    showAlert('❌ Заполни все поля!', 'error');
    return;
  }

  console.log('📤 Отправляем продукт:', { name, article, typeId, materialId, price });

  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_name: name,
        article_number: article,
        product_type_id: parseInt(typeId),
        material_type_id: parseInt(materialId),
        minimum_partner_price: parseFloat(price)
      })
    });

    if (response.ok) {
      showAlert('✅ Продукт добавлен!', 'success');
      closeAddForm();
      if (typeof loadProducts === 'function') loadProducts();
    } else {
      const error = await response.json();
      showAlert('❌ Ошибка: ' + (error.error || error.message), 'error');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
    showAlert('❌ Ошибка сети: ' + error.message, 'error');
  }
}

/**
 * Отправить форму мастерской
 */
async function submitAddWorkshop(event) {
  event.preventDefault();

  const name = document.getElementById('workshop_name')?.value?.trim();
  const type = document.getElementById('workshop_type')?.value?.trim();
  const staff = document.getElementById('staff_count')?.value;

  if (!name || !type || !staff) {
    showAlert('❌ Заполни все поля!', 'error');
    return;
  }

  try {
    const response = await fetch('/api/workshops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workshop_name: name,
        workshop_type: type,
        staff_count: parseInt(staff)
      })
    });

    if (response.ok) {
      showAlert('✅ Мастерская добавлена!', 'success');
      closeAddForm();
      if (typeof loadWorkshops === 'function') loadWorkshops();
    } else {
      const error = await response.json();
      showAlert('❌ Ошибка: ' + (error.error || error.message), 'error');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
    showAlert('❌ Ошибка сети: ' + error.message, 'error');
  }
}

/**
 * Отправить форму связи продукта и мастерской
 */
async function submitAddProductWorkshop(event) {
  event.preventDefault();

  const productId = document.getElementById('product_id')?.value;
  const workshopId = document.getElementById('workshop_id')?.value;
  const hours = document.getElementById('manufacturing_time_hours')?.value;

  if (!productId || !workshopId || !hours) {
    showAlert('❌ Заполни все поля!', 'error');
    return;
  }

  console.log('📤 Отправляем связь:', { productId, workshopId, hours });

  try {
    const response = await fetch('/api/product-workshops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: parseInt(productId),
        workshop_id: parseInt(workshopId),
        manufacturing_time_hours: parseFloat(hours)
      })
    });

    if (response.ok) {
      showAlert('✅ Связь добавлена!', 'success');
      closeAddForm();
      if (typeof loadProductWorkshops === 'function') loadProductWorkshops();
    } else {
      const error = await response.json();
      if (response.status === 400 && error.message?.includes('уже')) {
        showAlert('❌ Эта связь уже существует!', 'error');
      } else {
        showAlert('❌ Ошибка: ' + (error.message || error.error), 'error');
      }
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
    showAlert('❌ Ошибка сети: ' + error.message, 'error');
  }
}

/**
 * Закрыть модаль при клике вне её
 */
document.addEventListener('click', (e) => {
  const modal = document.getElementById('add-modal');
  if (e.target === modal) {
    closeAddForm();
  }
});