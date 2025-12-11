from flask import Blueprint, request, jsonify
from sqlalchemy import text
from database import get_db

material_types_bp = Blueprint('material_types', __name__, url_prefix='/api')


@material_types_bp.route('/material-types', methods=['GET'])
def get_material_types():
    """GET /api/material-types - Получить все типы материалов"""
    try:
        db = get_db()
        result = db.execute(
            text(
                "SELECT material_type_id, material_type_name, raw_material_loss_percent FROM material_types ORDER BY material_type_id")
        ).fetchall()

        return jsonify([{
            'material_type_id': row[0],
            'material_type_name': row[1],
            'loss_percent': float(row[2])
        } for row in result]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@material_types_bp.route('/material-types', methods=['POST'])
def create_material_type():
    """POST /api/material-types - Добавить новый тип материала"""
    try:
        data = request.get_json()
        db = get_db()
        db.execute(
            text("INSERT INTO material_types (material_type_name, raw_material_loss_percent) VALUES (:name, :loss)"),
            {"name": data['material_type_name'], "loss": data['raw_material_loss_percent']}
        )
        db.commit()
        return jsonify({'success': True, 'message': 'Тип материала добавлен'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@material_types_bp.route('/material-types/<int:id>', methods=['PUT'])
def update_material_type(id):
    """PUT /api/material-types/{id} - Обновить тип материала"""
    try:
        data = request.get_json()
        db = get_db()
        db.execute(
            text(
                "UPDATE material_types SET material_type_name = :name, raw_material_loss_percent = :loss WHERE material_type_id = :id"),
            {"name": data['material_type_name'], "loss": data['raw_material_loss_percent'], "id": id}
        )
        db.commit()
        return jsonify({'success': True, 'message': 'Тип материала обновлен'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@material_types_bp.route('/material-types/<int:id>', methods=['DELETE'])
def delete_material_type(id):
    """DELETE /api/material-types/{id} - Удалить тип материала"""
    try:
        db = get_db()
        db.execute(text("DELETE FROM material_types WHERE material_type_id = :id"), {"id": id})
        db.commit()
        return jsonify({'success': True, 'message': 'Тип материала удален'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500