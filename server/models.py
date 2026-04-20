from sqlalchemy import Column, String, ForeignKey
from server.database import Base

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    class_name = Column(String, nullable=False)

class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    class_name = Column(String, nullable=False)

class Location(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True)
    time = Column(String, primary_key=True)

    longitude_degrees = Column(String)
    longitude_minutes = Column(String)
    longitude_seconds = Column(String)

    latitude_degrees = Column(String)
    latitude_minutes = Column(String)
    latitude_seconds = Column(String)