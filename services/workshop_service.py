"""
Бизнес-логика для работы с цехами
"""
from models import Workshop, ProductWorkshop

class WorkshopService:
    """Сервис для работы с цехами"""

    def __init__(self, db_session):
        self.db = db_session

    def get_all_workshops(self):
        """Получить все цеха"""
        workshops = self.db.query(Workshop).all()
        return [{
            'workshop_id': w.workshop_id,
            'workshop_name': w.workshop_name,
            'workshop_type': w.workshop_type,
            'staff_count': w.staff_count
        } for w in workshops]

    def get_workshops_for_product(self, product_id: int):
        """Получить цеха для конкретного продукта с временем производства"""
        try:
            product_workshops = self.db.query(ProductWorkshop).filter(
                ProductWorkshop.product_id == product_id
            ).all()

            if not product_workshops:
                return []

            return [{
                'workshop_id': pw.workshop.workshop_id,
                'workshop_name': pw.workshop.workshop_name,
                'workshop_type': pw.workshop.workshop_type,
                'staff_count': pw.workshop.staff_count,
                'manufacturing_time_hours': float(pw.manufacturing_time_hours)
            } for pw in product_workshops]
        except AttributeError as e:
            # Если нет relationship к workshop, возвращаем пустой список
            return []

    def get_workshop_by_id(self, workshop_id: int):
        """Получить цех по ID"""
        workshop = self.db.query(Workshop).filter(
            Workshop.workshop_id == workshop_id
        ).first()

        if not workshop:
            return None

        return {
            'workshop_id': workshop.workshop_id,
            'workshop_name': workshop.workshop_name,
            'workshop_type': workshop.workshop_type,
            'staff_count': workshop.staff_count
        }