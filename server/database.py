from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./trip_system.db"

# create database engine
# check_same_thread allows multiple threads to access the database
engine = create_engine( SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# create a base class for our models
Base = declarative_base()