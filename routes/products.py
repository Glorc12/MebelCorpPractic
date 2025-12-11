"""
API эндпоинты для работы с продукцией
"""

from flask import Blueprint, request, jsonify
from services.product_service import ProductService
from services.manufacturing import ManufacturingService
from database import get_db
from models import Product, ProductWorkshop

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

@products_bp.route('', methods=['GET'])
def get_products():
    """
    GET /api/products
    Получить список всех продуктов
    """
    try:
        db_session = get_db()
        service = ProductService(db_session)
        products = service.get_all_products()

        # Добавляем время производства для каждого продукта
        for product in products:
            product['manufacturing_time_hours'] = ManufacturingService.calculate_manufacturing_time(
                product['product_id'], db_session
            )

        return jsonify(products), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['GET'])  # ✅ ИСПРАВЛЕНО: добавлен <int:product_id>
def get_product(product_id):
    """
    GET /api/products/{id}
    Получить продукт по ID
    """
    try:
        db_session = get_db()
        service = ProductService(db_session)
        product = service.get_product_by_id(product_id)

        if not product:
            return jsonify({'error': 'Продукт не найден'}), 404

        # Добавляем время производства
        product['manufacturing_time_hours'] = ManufacturingService.calculate_manufacturing_time(
            product_id, db_session
        )

        return jsonify(product), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>/workshops', methods=['GET'])  # ✅ НОВЫЙ ЭНДПОИНТ
def get_product_workshops(product_id):
    """
    GET /api/products/{id}/workshops
    Получить все цехи для производства продукта с временем
    """
    try:
        db_session = get_db()

        # Проверяем существование продукта
        product = db_session.query(Product).filter(Product.product_id == product_id).first()
        if not product:
            return jsonify({'error': 'Продукт не найден'}), 404

        # Получаем все производственные маршруты для этого продукта
        workshops = db_session.query(ProductWorkshop).filter(
            ProductWorkshop.product_id == product_id
        ).all()

        result = []
        total_time = 0

        for pw in workshops:
            workshop_time = float(pw.manufacturing_time_hours)
            total_time += workshop_time

            result.append({
                'product_workshop_id': pw.product_workshop_id,
                'workshop_id': pw.workshop_id,
                'workshop_name': pw.workshop.workshop_name,
                'staff_count': pw.workshop.staff_count,
                'manufacturing_time_hours': workshop_time
            })

        return jsonify({
            'product_id': product_id,
            'product_name': product.product_name,
            'workshops': result,
            'total_manufacturing_time_hours': int(round(total_time))
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('', methods=['POST'])
def create_product():
    """
    POST /api/products
    Создать новый продукт

    JSON:
    {
        "product_type_id": 1,
        "product_name": "Новое кресло",
        "article_number": 9999999,
        "minimum_partner_price": 15000.00,
        "material_type_id": 1
    }
    """
    try:
        data = request.get_json()

        # Валидация
        if not all(k in data for k in ['product_type_id', 'product_name', 'article_number',
                                        'minimum_partner_price', 'material_type_id']):
            return jsonify({'error': 'Отсутствуют обязательные поля'}), 400

        if data['minimum_partner_price'] < 0:
            return jsonify({'error': 'Цена не может быть отрицательной'}), 400

        db_session = get_db()
        service = ProductService(db_session)
        result = service.create_product(data)

        if 'error' in result:
            return jsonify(result), 400

        return jsonify(result), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['PUT'])  # ✅ ИСПРАВЛЕНО: добавлен <int:product_id>
def update_product(product_id):
    """
    PUT /api/products/{id}
    Обновить продукт
    """
    try:
        data = request.get_json()
        db_session = get_db()
        service = ProductService(db_session)
        result = service.update_product(product_id, data)

        if 'error' in result:
            return jsonify(result), 400

        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['DELETE'])  # ✅ ИСПРАВЛЕНО: добавлен <int:product_id>
def delete_product(product_id):
    """
    DELETE /api/products/{id}
    Удалить продукт
    """
    try:
        db_session = get_db()
        service = ProductService(db_session)
        result = service.delete_product(product_id)

        if 'error' in result:
            return jsonify(result), 404

        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
