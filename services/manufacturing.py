"""
Модуль для расчета параметров производства
"""

from models import ProductWorkshop, ProductType, MaterialType

class ManufacturingService:
    """Сервис для расчета параметров производства"""

    @staticmethod
    def calculate_manufacturing_time(product_id: int, db_session) -> int:
        """
        Расчет времени изготовления продукции
        Время складывается из времени нахождения в каждом цехе.

        Args:
            product_id: ID продукции
            db_session: Сессия БД

        Returns:
            Время изготовления в часах (целое число)
            -1 если продукция не найдена
        """
        try:
            # Получаем все цехи, в которых производится продукция
            product_workshops = db_session.query(ProductWorkshop).filter(
                ProductWorkshop.product_id == product_id
            ).all()

            if not product_workshops:
                return -1

            # Суммируем время во всех цехах
            total_time = sum(
                float(pw.manufacturing_time_hours)
                for pw in product_workshops
            )  # ✅ ИСПРАВЛЕНО: закрыта скобка

            # Возвращаем целое число часов
            return int(round(total_time))

        except Exception as e:
            print(f"Ошибка при расчете времени производства: {str(e)}")
            return -1

    @staticmethod
    def calculate_required_materials(
        product_type_id: int,
        material_type_id: int,
        quantity: int,
        param1: float,
        param2: float,
        db_session
    ) -> int:
        """
        Расчет необходимого количества сырья с учетом потерь
        Формула: raw_material = quantity * (param1 * param2 * product_coefficient) * (1 + loss_percent/100)

        Args:
            product_type_id: ID типа продукции
            material_type_id: ID типа материала
            quantity: Количество единиц продукции
            param1: Первый параметр продукции (вещественное число)
            param2: Второй параметр продукции (вещественное число)
            db_session: Сессия БД

        Returns:
            Количество сырья (целое число)
            -1 если некорректные данные
        """
        try:
            # Валидация входных данных
            if quantity <= 0 or param1 <= 0 or param2 <= 0:
                return -1

            # Получаем тип продукции
            product_type = db_session.query(ProductType).filter(
                ProductType.product_type_id == product_type_id
            ).first()

            if not product_type:
                return -1

            # Получаем тип материала
            material_type = db_session.query(MaterialType).filter(
                MaterialType.material_type_id == material_type_id
            ).first()

            if not material_type:
                return -1

            # Получаем коэффициенты
            product_coefficient = float(product_type.product_type_coefficient)
            loss_percent = float(material_type.raw_material_loss_percent)

            # Расчет необходимого сырья
            raw_material_per_unit = param1 * param2 * product_coefficient
            total_raw_material = quantity * raw_material_per_unit

            # Добавляем потери сырья
            total_raw_material_with_loss = total_raw_material * (1 + loss_percent / 100)

            # Возвращаем целое число
            return int(round(total_raw_material_with_loss))

        except Exception as e:
            print(f"Ошибка при расчете сырья: {str(e)}")
            return -1
