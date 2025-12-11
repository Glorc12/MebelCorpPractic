# services/material_service.py
"""
Сервис для расчета количества сырья при производстве продукции
ГЛАВНОЕ ДЛЯ ЗАДАНИЯ 4
"""


class MaterialCalculationService:
    """Сервис расчета необходимого сырья для производства"""
    
    @staticmethod
    def calculate_raw_material(
        product_type_id: int,
        material_type_id: int,
        quantity: int,
        parameter1: float,
        parameter2: float,
        db_session=None
    ) -> int:
        """
        Расчитывает необходимое количество сырья для производства продукции
        
        Формула:
        raw_material = (параметр1 × параметр2 × коэффициент_типа × количество) 
                     × (1 + процент_потерь/100)
        
        Args:
            product_type_id (int): ID типа продукции (целое число > 0)
            material_type_id (int): ID типа материала (целое число > 0)
            quantity (int): Количество единиц продукции (целое число > 0)
            parameter1 (float): Параметр 1 - длина (вещественное число > 0)
            parameter2 (float): Параметр 2 - ширина (вещественное число > 0)
            db_session: SQLAlchemy сессия для доступа к БД
        
        Returns:
            int: Целое количество необходимого сырья
            int: -1 если любой из параметров неправильный
        
        Example:
            >>> calculate_raw_material(
            ...     product_type_id=1,
            ...     material_type_id=2,
            ...     quantity=10,
            ...     parameter1=2.5,
            ...     parameter2=3.0,
            ...     db_session=session
            ... )
            >>> # Формула: (2.5 × 3.0 × 1.2 × 10) × (1 + 15/100)
            >>> # = (7.5 × 1.2 × 10) × 1.15
            >>> # = 90 × 1.15
            >>> # = 103.5 → 104 (целое число)
            >>> 104
        """
        
        # ===== ВАЛИДАЦИЯ ВХОДНЫХ ДАННЫХ =====
        
        # Проверка типов целых чисел (должны быть int и > 0)
        if not isinstance(product_type_id, int) or product_type_id <= 0:
            return -1
        if not isinstance(material_type_id, int) or material_type_id <= 0:
            return -1
        if not isinstance(quantity, int) or quantity <= 0:
            return -1
        
        # Проверка преобразования параметров в float
        try:
            parameter1 = float(parameter1)
            parameter2 = float(parameter2)
        except (TypeError, ValueError):
            return -1
        
        # Проверка положительности параметров
        if parameter1 <= 0 or parameter2 <= 0:
            return -1
        
        # ===== ПОЛУЧЕНИЕ ДАННЫХ ИЗ БД =====
        
        if db_session is None:
            return -1
        
        try:
            # Импортируем модели
            from models.material import ProductType, MaterialType
            
            # Получаем тип продукции по ID
            product_type = db_session.query(ProductType).filter_by(
                product_type_id=product_type_id
            ).first()
            
            # Если тип продукции не найден - ошибка
            if not product_type:
                return -1
            
            # Получаем тип материала по ID
            material_type = db_session.query(MaterialType).filter_by(
                material_type_id=material_type_id
            ).first()
            
            # Если тип материала не найден - ошибка
            if not material_type:
                return -1
        
        except Exception:
            # Любая ошибка при работе с БД - возвращаем -1
            return -1
        
        # ===== РАСЧЕТ НЕОБХОДИМОГО СЫРЬЯ =====
        
        # Шаг 1: Базовый расчет на одну единицу
        # raw_material_base = параметр1 × параметр2 × коэффициент_типа
        raw_material_base = parameter1 * parameter2 * product_type.coefficient
        
        # Шаг 2: Умножаем на количество единиц
        # raw_material_for_quantity = raw_material_base × количество
        raw_material_for_quantity = raw_material_base * quantity
        
        # Шаг 3: Учитываем потери материала
        # loss_factor = 1 + (процент_потерь / 100)
        loss_factor = 1.0 + (material_type.loss_percentage / 100.0)
        
        # Шаг 4: Финальный расчет с учетом потерь
        # raw_material_total = raw_material_for_quantity × loss_factor
        raw_material_total = raw_material_for_quantity * loss_factor
        
        # ===== ВОЗВРАЩАЕМ ЦЕЛОЕ ЧИСЛО =====
        # Округляем до целого числа
        return int(round(raw_material_total))
