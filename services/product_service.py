"""
Бизнес-логика для работы с продукцией
"""
from datetime import datetime
from models import Product, ProductType, MaterialType

class ProductService:
    """Сервис для работы с продукцией"""

    def __init__(self, db_session):
        self.db = db_session

    def get_all_products(self):
        """Получить все продукты"""
        products = self.db.query(Product).all()
        return [{
            'product_id': p.product_id,
            'article_number': int(p.article_number),
            'product_name': p.product_name,
            'product_type': p.product_type.product_type_name,
            'material_type': p.material_type.material_type_name,
            'minimum_partner_price': float(p.minimum_partner_price)
        } for p in products]

    def get_product_by_id(self, product_id: int):
        """Получить продукт по ID"""
        product = self.db.query(Product).filter(
            Product.product_id == product_id
        ).first()

        if not product:
            return None

        return {
            'product_id': product.product_id,
            'article_number': int(product.article_number),
            'product_name': product.product_name,
            'product_type_id': product.product_type_id,
            'product_type': product.product_type.product_type_name,
            'material_type_id': product.material_type_id,
            'material_type': product.material_type.material_type_name,
            'minimum_partner_price': float(product.minimum_partner_price)
        }

    def create_product(self, data: dict):
        """Создать новый продукт"""
        try:
            new_product = Product(
                product_type_id=data['product_type_id'],
                product_name=data['product_name'],
                article_number=data['article_number'],
                minimum_partner_price=data['minimum_partner_price'],
                material_type_id=data['material_type_id']
            )
            self.db.add(new_product)
            self.db.commit()
            return self.get_product_by_id(new_product.product_id)
        except Exception as e:
            self.db.rollback()
            return {'error': str(e)}

    def update_product(self, product_id: int, data: dict):
        """Обновить продукт"""
        try:
            product = self.db.query(Product).filter(
                Product.product_id == product_id
            ).first()

            if not product:
                return {'error': 'Продукт не найден'}

            for key, value in data.items():
                if hasattr(product, key):
                    setattr(product, key, value)

            product.updated_at = datetime.utcnow()
            self.db.commit()
            return self.get_product_by_id(product_id)
        except Exception as e:
            self.db.rollback()
            return {'error': str(e)}

    def delete_product(self, product_id: int):
        """Удалить продукт"""
        try:
            product = self.db.query(Product).filter(
                Product.product_id == product_id
            ).first()

            if not product:
                return {'error': 'Продукт не найден'}

            self.db.delete(product)
            self.db.commit()
            return {'success': True}
        except Exception as e:
            self.db.rollback()
            return {'error': str(e)}
