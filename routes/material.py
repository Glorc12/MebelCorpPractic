# routes/material.py
"""
API эндпоинты для расчета необходимого сырья (ЗАДАНИЕ 4)
"""
from flask import Blueprint, request, jsonify
from services.material_service import MaterialCalculationService
from database import get_db

material_bp = Blueprint('material', __name__, url_prefix='/api/material')


@material_bp.route('/calculate-raw-material', methods=['POST'])
def calculate_raw_material():
    """
    POST /api/material/calculate-raw-material
    
    Расчитать количество необходимого сырья для производства
    
    Request Body (JSON):
    {
        "product_type_id": 1,           // ID типа продукции (int > 0)
        "material_type_id": 2,          // ID типа материала (int > 0)
        "quantity": 10,                 // Количество единиц (int > 0)
        "parameter1": 2.5,              // Параметр 1 (float > 0)
        "parameter2": 3.0               // Параметр 2 (float > 0)
    }
    
    Response (Success - 200):
    {
        "success": true,
        "raw_material_quantity": 104
    }
    
    Response (Error - 400):
    {
        "success": false,
        "error": "Invalid input parameters",
        "raw_material_quantity": -1
    }
    """
    try:
        # Получаем JSON данные из запроса
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body must be JSON',
                'raw_material_quantity': -1
            }), 400
        
        # Извлекаем параметры
        product_type_id = data.get('product_type_id')
        material_type_id = data.get('material_type_id')
        quantity = data.get('quantity')
        parameter1 = data.get('parameter1')
        parameter2 = data.get('parameter2')
        
        # Получаем БД сессию
        db_session = get_db()
        
        # Вызываем функцию расчета сырья
        result = MaterialCalculationService.calculate_raw_material(
            product_type_id=product_type_id,
            material_type_id=material_type_id,
            quantity=quantity,
            parameter1=parameter1,
            parameter2=parameter2,
            db_session=db_session
        )
        
        # Если результат -1 (ошибка валидации)
        if result == -1:
            return jsonify({
                'success': False,
                'error': 'Invalid input parameters. Check: product_type_id, material_type_id, quantity (all > 0), parameter1, parameter2 (all > 0)',
                'raw_material_quantity': -1
            }), 400
        
        # Успешный расчет
        return jsonify({
            'success': True,
            'raw_material_quantity': result
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'raw_material_quantity': -1
        }), 500


@material_bp.route('/product-types', methods=['GET'])
def get_product_types():
    """
    GET /api/material/product-types
    
    Получить список всех типов продукции
    
    Response:
    [
        {
            "product_type_id": 1,
            "product_type_name": "Деревянная мебель",
            "coefficient": 1.2,
            "description": "Мебель из натурального дерева"
        },
        ...
    ]
    """
    try:
        from models.material import ProductType
        db_session = get_db()
        
        product_types = db_session.query(ProductType).all()
        
        return jsonify([pt.to_dict() for pt in product_types]), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@material_bp.route('/material-types', methods=['GET'])
def get_material_types():
    """
    GET /api/material/material-types
    
    Получить список всех типов материалов
    
    Response:
    [
        {
            "material_type_id": 1,
            "material_type_name": "Дерево",
            "loss_percentage": 15.0,
            "description": "Потери при обработке дерева"
        },
        ...
    ]
    """
    try:
        from models.material import MaterialType
        db_session = get_db()
        
        material_types = db_session.query(MaterialType).all()
        
        return jsonify([mt.to_dict() for mt in material_types]), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@material_bp.route('/product-parameters/<int:product_id>', methods=['GET'])
def get_product_parameters(product_id):
    """
    GET /api/material/product-parameters/1
    
    Получить параметры продукции
    
    Response:
    {
        "product_id": 1,
        "parameters": [
            {
                "product_parameter_id": 1,
                "parameter1_name": "Длина",
                "parameter1_value": 120.5,
                "parameter2_name": "Ширина",
                "parameter2_value": 80.0
            }
        ]
    }
    """
    try:
        from models.material import ProductParameter
        db_session = get_db()
        
        parameters = db_session.query(ProductParameter).filter_by(
            product_id=product_id
        ).all()
        
        return jsonify({
            'product_id': product_id,
            'parameters': [p.to_dict() for p in parameters]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
