"""
API эндпоинты для работы с цехами
"""
from flask import Blueprint, request, jsonify
from services.workshop_service import WorkshopService
from database import get_db

workshops_bp = Blueprint('workshops', __name__, url_prefix='/api/workshops')


@workshops_bp.route('', methods=['GET'])
def get_workshops():
    """
    GET /api/workshops
    Получить список всех цехов
    """
    try:
        db_session = get_db()
        service = WorkshopService(db_session)
        workshops = service.get_all_workshops()
        return jsonify(workshops), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@workshops_bp.route('/product/<int:product_id>', methods=['GET'])
def get_workshops_for_product(product_id):
    """
    GET /api/workshops/product/<product_id>
    Получить цеха для конкретного продукта
    """
    try:
        db_session = get_db()
        service = WorkshopService(db_session)
        workshops = service.get_workshops_for_product(product_id)
        return jsonify(workshops), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@workshops_bp.route('/<int:workshop_id>', methods=['GET'])
def get_workshop(workshop_id):
    """
    GET /api/workshops/<workshop_id>
    Получить цех по ID
    """
    try:
        db_session = get_db()
        service = WorkshopService(db_session)
        workshop = service.get_workshop_by_id(workshop_id)

        if not workshop:
            return jsonify({'error': 'Цех не найден'}), 404

        return jsonify(workshop), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
