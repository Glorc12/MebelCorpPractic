"""
API эндпоинты для работы с типами материалов
Автоматически определяет имя колонки для потерь
"""

from flask import Blueprint, request, jsonify
from database import get_db
from sqlalchemy import text, inspect

material_types_bp = Blueprint('material_types', __name__, url_prefix='/api')

def get_loss_column_name(db):
    """
    🔍 Автоматически определяет название колонки потерь
    """
    inspector = inspect(db.connection())
    columns = inspector.get_columns('material_types')

    column_names = [col['name'] for col in columns]
    print(f"📊 Колонки в material_types: {column_names}")

    # Пробуем разные варианты названий
    possible_names = [
        'raw_material_loss_percent',
        'loss_percentage',
        'loss_percent',
        'material_loss_percent',
        'losses',
        'raw_material_losses'
    ]

    for name in possible_names:
        if name in column_names:
            print(f"✅ Найдена колонка потерь: {name}")
            return name

    # Если ничего не найдено - ищем любую колонку которая может быть потерями
    for col in column_names:
        if 'loss' in col.lower() or 'percent' in col.lower():
            print(f"✅ Найдена похожая колонка: {col}")
            return col

    raise Exception(f"❌ Не найдена колонка потерь. Доступные: {column_names}")


@material_types_bp.route('/material-types', methods=['GET'])
def get_material_types():
    """GET /api/material-types - Получить все типы материалов"""
    try:
        db = get_db()
        loss_col = get_loss_column_name(db)

        # Динамический SQL запрос
        query = f"""
        SELECT material_type_id, material_type_name, {loss_col} as loss_percentage
        FROM material_types 
        ORDER BY material_type_id
        """

        result = db.execute(text(query)).fetchall()

        materials = [{
            'material_type_id': row[0],
            'material_type_name': row[1],
            'loss_percentage': float(row[2]) if row[2] else 0
        } for row in result]

        print(f"✅ Возвращаем {len(materials)} типов материалов")
        return jsonify(materials), 200

    except Exception as e:
        print(f"❌ Ошибка GET material-types: {str(e)}")
        return jsonify({'error': str(e)}), 500


@material_types_bp.route('/material-types', methods=['POST'])
def create_material_type():
    """POST /api/material-types - Добавить новый тип материала"""
    try:
        data = request.get_json()

        if not data.get('material_type_name') or data.get('loss_percentage') is None:
            return jsonify({'error': 'Заполни все поля'}), 400

        db = get_db()
        loss_col = get_loss_column_name(db)

        # Проверяем дублирование
        existing = db.execute(
            text("SELECT * FROM material_types WHERE material_type_name = :name"),
            {"name": data['material_type_name']}
        ).first()

        if existing:
            return jsonify({'error': 'Такой тип материала уже существует'}), 400

        # Вставляем в БД
        insert_query = f"""
        INSERT INTO material_types (material_type_name, {loss_col})
        VALUES (:name, :loss)
        """

        db.execute(text(insert_query), {
            "name": data['material_type_name'],
            "loss": float(data['loss_percentage'])
        })
        db.commit()

        print(f"✅ Добавлен новый материал: {data['material_type_name']}")

        return jsonify({
            'success': True,
            'message': 'Тип материала добавлен'
        }), 201

    except Exception as e:
        print(f"❌ Ошибка POST material-types: {str(e)}")
        db.rollback()
        return jsonify({'error': str(e)}), 500


@material_types_bp.route('/material-types/<int:material_type_id>', methods=['PUT'])
def update_material_type(material_type_id):
    """PUT /api/material-types/{id} - Обновить тип материала"""
    try:
        data = request.get_json()
        db = get_db()
        loss_col = get_loss_column_name(db)

        # Проверяем существование
        existing = db.execute(
            text("SELECT * FROM material_types WHERE material_type_id = :id"),
            {"id": material_type_id}
        ).first()

        if not existing:
            return jsonify({'error': 'Тип материала не найден'}), 404

        # Обновляем
        updates = []
        params = {"id": material_type_id}

        if 'material_type_name' in data:
            updates.append("material_type_name = :name")
            params['name'] = data['material_type_name']

        if 'loss_percentage' in data:
            updates.append(f"{loss_col} = :loss")
            params['loss'] = float(data['loss_percentage'])

        if not updates:
            return jsonify({'error': 'Нечего обновлять'}), 400

        update_query = "UPDATE material_types SET " + ", ".join(updates) + " WHERE material_type_id = :id"

        db.execute(text(update_query), params)
        db.commit()

        print(f"✅ Обновлён материал ID={material_type_id}")

        return jsonify({'success': True, 'message': 'Тип материала обновлен'}), 200

    except Exception as e:
        print(f"❌ Ошибка PUT material-types: {str(e)}")
        db.rollback()
        return jsonify({'error': str(e)}), 500


@material_types_bp.route('/material-types/<int:material_type_id>', methods=['DELETE'])
def delete_material_type(material_type_id):
    """DELETE /api/material-types/{id} - Удалить тип материала"""
    try:
        db = get_db()

        # Проверяем существование
        existing = db.execute(
            text("SELECT * FROM material_types WHERE material_type_id = :id"),
            {"id": material_type_id}
        ).first()

        if not existing:
            return jsonify({'error': 'Тип материала не найден'}), 404

        # Удаляем
        db.execute(
            text("DELETE FROM material_types WHERE material_type_id = :id"),
            {"id": material_type_id}
        )
        db.commit()

        print(f"✅ Удалён материал ID={material_type_id}")

        return jsonify({'success': True, 'message': 'Тип материала удален'}), 200

    except Exception as e:
        print(f"❌ Ошибка DELETE material-types: {str(e)}")
        db.rollback()
        return jsonify({'error': str(e)}), 500