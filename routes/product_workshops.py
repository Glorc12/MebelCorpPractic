from flask import Blueprint, request, jsonify
from sqlalchemy import text
from database import get_db

product_workshops_bp = Blueprint('product_workshops', __name__, url_prefix='/api')


@product_workshops_bp.route('/product-workshops', methods=['GET'])
def get_product_workshops():
    """GET /api/product-workshops - Получить все маршруты производства"""
    try:
        db = get_db()
        result = db.execute(
            text("""SELECT pw.product_workshop_id,
                           pw.product_id,
                           pw.workshop_id,
                           pw.manufacturing_time_hours,
                           p.product_name,
                           w.workshop_name
                    FROM product_workshops pw
                             JOIN products p ON pw.product_id = p.product_id
                             JOIN workshops w ON pw.workshop_id = w.workshop_id
                    ORDER BY pw.product_id, pw.workshop_id""")
        ).fetchall()

        return jsonify([{
            'product_workshop_id': row[0],
            'product_id': row[1],
            'workshop_id': row[2],
            'manufacturing_time_hours': float(row[3]),
            'product_name': row[4],
            'workshop_name': row[5]
        } for row in result]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@product_workshops_bp.route('/product-workshops', methods=['POST'])
def create_product_workshop():
    """POST /api/product-workshops - Добавить новый маршрут"""
    try:
        data = request.get_json()
        db = get_db()
        db.execute(
            text("""INSERT INTO product_workshops (product_id, workshop_id, manufacturing_time_hours)
                    VALUES (:p_id, :w_id, :time)"""),
            {"p_id": data['product_id'], "w_id": data['workshop_id'], "time": data['manufacturing_time_hours']}
        )
        db.commit()
        return jsonify({'success': True, 'message': 'Маршрут добавлен'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@product_workshops_bp.route('/product-workshops/<int:id>', methods=['PUT'])  # ✅ ИСПРАВЛЕНО: добавлен <int:id>
def update_product_workshop(id):
    """PUT /api/product-workshops/{id} - Обновить маршрут"""
    try:
        data = request.get_json()
        db = get_db()
        db.execute(
            text("""UPDATE product_workshops
                    SET product_id               = :p_id,
                        workshop_id              = :w_id,
                        manufacturing_time_hours = :time
                    WHERE product_workshop_id = :id"""),
            {"p_id": data['product_id'], "w_id": data['workshop_id'], "time": data['manufacturing_time_hours'],
             "id": id}
        )
        db.commit()
        return jsonify({'success': True, 'message': 'Маршрут обновлен'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@product_workshops_bp.route('/product-workshops/<int:id>', methods=['DELETE'])  # ✅ ИСПРАВЛЕНО: добавлен <int:id>
def delete_product_workshop(id):
    """DELETE /api/product-workshops/{id} - Удалить маршрут"""
    try:
        db = get_db()
        db.execute(text("DELETE FROM product_workshops WHERE product_workshop_id = :id"), {"id": id})
        db.commit()
        return jsonify({'success': True, 'message': 'Маршрут удален'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
