from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
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

    location_id = Column(Integer, primary_key=True, autoincrement=True) 
    id = Column(String, primary_key=False)
    time = Column(DateTime, primary_key=False)
    longitude = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)