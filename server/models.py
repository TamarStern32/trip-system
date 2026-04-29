from sqlalchemy import Column, String, ForeignKey, Float, DateTime
from server.database import Base

# teachers table
class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    class_name = Column(String, nullable=True)

# students table
class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    class_name = Column(String, nullable=True)

# locations table
class Location(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True)
    time = Column(DateTime, primary_key=True)
    longitude = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    