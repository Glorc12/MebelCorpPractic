from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class ProductType(db.Model):
    __tablename__ = 'product_types'

    product_type_id = db.Column(db.Integer, primary_key=True)
    product_type_name = db.Column(db.String(255), nullable=False, unique=True)
    product_type_coefficient = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MaterialType(db.Model):
    __tablename__ = 'material_types'

    material_type_id = db.Column(db.Integer, primary_key=True)
    material_type_name = db.Column(db.String(255), nullable=False, unique=True)
    raw_material_loss_percent = db.Column(db.Numeric(5, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Product(db.Model):
    __tablename__ = 'products'

    product_id = db.Column(db.Integer, primary_key=True)
    product_type_id = db.Column(db.Integer, db.ForeignKey('product_types.product_type_id'), nullable=False)
    product_name = db.Column(db.String(500), nullable=False, unique=True)
    article_number = db.Column(db.BigInteger, nullable=False, unique=True)
    minimum_partner_price = db.Column(db.Numeric(12, 2), nullable=False)
    material_type_id = db.Column(db.Integer, db.ForeignKey('material_types.material_type_id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product_type = db.relationship("ProductType")
    material_type = db.relationship("MaterialType")

