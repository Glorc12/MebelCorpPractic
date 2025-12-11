/**
 * API модуль для работы с бэкендом
 * Содержит все функции для запросов к Flask приложению
 */

const API_URL = 'http://localhost:5000/api';

/**
 * Базовая функция для HTTP запросов
 * @param {string} endpoint - путь API
 * @param {string} method - HTTP метод (GET, POST, PUT, DELETE)
 * @param {object} data - данные для отправки (для POST/PUT)
 * @returns {Promise} результат запроса
 */
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);

        // Если ответ не 2xx, выбросить ошибку
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// PRODUCTS API
// ============================================

/**
 * Получить все продукты
 */
async function getProducts() {
    return apiCall('/products');
}

/**
 * Получить продукт по ID
 */
async function getProductById(productId) {
    return apiCall(`/products/${productId}`);
}

/**
 * Создать новый продукт
 */
async function createProduct(productData) {
    return apiCall('/products', 'POST', productData);
}

/**
 * Обновить продукт
 */
async function updateProduct(productId, productData) {
    return apiCall(`/products/${productId}`, 'PUT', productData);
}

/**
 * Удалить продукт
 */
async function deleteProduct(productId) {
    return apiCall(`/products/${productId}`, 'DELETE');
}

// ============================================
// WORKSHOPS API
// ============================================

/**
 * Получить все цеха
 */
async function getWorkshops() {
    return apiCall('/workshops');
}

/**
 * Получить цеха для конкретного продукта
 */
async function getWorkshopsForProduct(productId) {
    return apiCall(`/workshops/product/${productId}`);
}