from flask import Blueprint, request, jsonify
from sqlalchemy import text
from database import get_db

product_types_bp = Blueprint('product_types', __name__, url_prefix='/api')


@product_types_bp.route('/product-types', methods=['GET'])
def get_product_types():
    """GET /api/product-types - Получить все типы продукции"""
    try:
        db = get_db()
        result = db.execute(
            text(
                "SELECT product_type_id, product_type_name, product_type_coefficient FROM product_types ORDER BY product_type_id")
        ).fetchall()

        return jsonify([{
            'product_type_id': row[0],
            'product_type_name': row[1],
            'coefficient': float(row[2])
        } for row in result]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@product_types_bp.route('/product-types', methods=['POST'])
def create_product_type():
    """POST /api/product-types - Добавить новый тип продукции"""
    try:
        data = request.get_json()
        db = get_db()
        db.execute(
            text("INSERT INTO product_types (product_type_name, product_type_coefficient) VALUES (:name, :coeff)"),
            {"name": data['product_type_name'], "coeff": data['product_type_coefficient']}
        )
        db.commit()
        return jsonify({'success': True, 'message': 'Тип продукции добавлен'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@product_types_bp.route('/product-types/<int:id>', methods=['PUT'])
def update_product_type(id):
    """PUT /api/product-types/{id} - Обновить тип продукции"""
    try:
        data = request.get_json()
        db = get_db()
        db.execute(
            text(
                "UPDATE product_types SET product_type_name = :name, product_type_coefficient = :coeff WHERE product_type_id = :id"),
            {"name": data['product_type_name'], "coeff": data['product_type_coefficient'], "id": id}
        )
        db.commit()
        return jsonify({'success': True, 'message': 'Тип продукции обновлен'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@product_types_bp.route('/product-types/<int:id>', methods=['DELETE'])
def delete_product_type(id):
    """DELETE /api/product-types/{id} - Удалить тип продукции"""
    try:
        db = get_db()
        db.execute(text("DELETE FROM product_types WHERE product_type_id = :id"), {"id": id})
        db.commit()
        return jsonify({'success': True, 'message': 'Тип продукции удален'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500