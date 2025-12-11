from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Workshop(db.Model):
    __tablename__ = 'workshops'

    workshop_id = db.Column(db.Integer, primary_key=True)
    workshop_name = db.Column(db.String(255), nullable=False, unique=True)
    workshop_type = db.Column(db.String(100), nullable=False)
    staff_count = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ✅ ДОБАВЛЕНО: обратное relationship
    product_workshops = db.relationship('ProductWorkshop', back_populates='workshop', lazy='joined')


class ProductWorkshop(db.Model):
    __tablename__ = 'product_workshops'

    product_workshop_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'), nullable=False)
    workshop_id = db.Column(db.Integer, db.ForeignKey('workshops.workshop_id'), nullable=False)
    manufacturing_time_hours = db.Column(db.Numeric(8, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ✅ ИСПРАВЛЕНО: добавлены back_populates и lazy
    workshop = db.relationship('Workshop', back_populates='product_workshops', lazy='joined')

