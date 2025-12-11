# models/material.py
"""
Модели для управления типами продукции, материалов и их параметров
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class ProductType(db.Model):
    """Тип продукции с коэффициентом расчета сырья"""
    __tablename__ = 'product_types'
    
    product_type_id = db.Column(db.Integer, primary_key=True)
    product_type_name = db.Column(db.String(100), nullable=False, unique=True)
    coefficient = db.Column(db.Float, nullable=False)  # Коэффициент типа продукции
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'product_type_id': self.product_type_id,
            'product_type_name': self.product_type_name,
            'coefficient': float(self.coefficient),
            'description': self.description
        }


class MaterialType(db.Model):
    """Тип материала с процентом потерь при производстве"""
    __tablename__ = 'material_types'
    
    material_type_id = db.Column(db.Integer, primary_key=True)
    material_type_name = db.Column(db.String(100), nullable=False, unique=True)
    loss_percentage = db.Column(db.Float, nullable=False)  # % потерь сырья
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'material_type_id': self.material_type_id,
            'material_type_name': self.material_type_name,
            'loss_percentage': float(self.loss_percentage),
            'description': self.description
        }


class ProductParameter(db.Model):
    """Параметры продукции для расчета необходимого сырья"""
    __tablename__ = 'product_parameters'
    
    product_parameter_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'), nullable=False)
    product_type_id = db.Column(db.Integer, db.ForeignKey('product_types.product_type_id'), nullable=False)
    parameter1_name = db.Column(db.String(100), default='Длина')
    parameter1_value = db.Column(db.Float, nullable=False)  # в см
    parameter2_name = db.Column(db.String(100), default='Ширина')
    parameter2_value = db.Column(db.Float, nullable=False)  # в см
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'product_parameter_id': self.product_parameter_id,
            'product_id': self.product_id,
            'product_type_id': self.product_type_id,
            'parameter1_name': self.parameter1_name,
            'parameter1_value': float(self.parameter1_value),
            'parameter2_name': self.parameter2_name,
            'parameter2_value': float(self.parameter2_value)
        }
