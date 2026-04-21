from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import math
from .database import SessionLocal, engine
from .models import Base, Student, Teacher, Location


# create tables in the database
Base.metadata.create_all(bind=engine)

# app instance
app = FastAPI()

################################################################################################

# conection to the database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# convert DMS to decimal degrees
def dms_to_decimal(degrees, minutes, seconds):
    return float(degrees) + float(minutes) / 60 + float(seconds) / 3600

# convert time string to datetime object
def parse_time(time_str):

    return datetime.fromisoformat(
        time_str.replace("Z", "+00:00")
    )

# calculate distance between two points using Haversine formula
def distance_km(lat1, lon1, lat2, lon2):

    r = 6371  # earth radius in km
    d_lat = math.radians(lat2 - lat1) # latitude difference in radians
    d_lon = math.radians(lon2 - lon1) # longitude difference in radians
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)) #atan2 - calculate the angle between two points
    return r * c

################################################################################################

# check if the API is working
@app.get("/")
def read_root():
    return {"message": "API is working"}


# add a student to the database
@app.post("/students")
def create_student(student: dict, db: Session = Depends(get_db)):

    # validate that the student has an ID
    if "id" not in student or not student["id"]:
        raise HTTPException(status_code=400, detail="ID is required")

    # check if student with the same ID already exists
    existing_student = db.query(Student).filter(Student.id == student["id"]).first()
    if existing_student:
        raise HTTPException(status_code=400, detail="Student already exists")

    new_student = Student(
        id=student["id"],
        first_name=student.get("first_name"),
        last_name=student.get("last_name"),
        class_name=student.get("class_name")
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student


# get a specific student by ID
@app.get("/students/{student_id}")
def get_student(student_id: str, db: Session = Depends(get_db)):

    student = db.query(Student).filter(Student.id == student_id).first()
    
    # student with the given ID does not exist
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return student


# get all students
@app.get("/students")
def get_students(db: Session = Depends(get_db)):

    students = db.query(Student).all()
    return students


# add a teacher to the database
@app.post("/teachers")
def create_teacher(teacher: dict, db: Session = Depends(get_db)):

    # validate that the teacher has an ID
    if "id" not in teacher or not teacher["id"]:
        raise HTTPException(status_code=400, detail="ID is required")

    # check if teacher with the same ID already exists
    existing_teacher = db.query(Teacher).filter(Teacher.id == teacher["id"]).first()
    if existing_teacher:
        raise HTTPException(status_code=400, detail="Teacher already exists")

    new_teacher = Teacher(
        id=teacher["id"],
        first_name=teacher.get("first_name"),
        last_name=teacher.get("last_name"),
        class_name=teacher.get("class_name")
    )
    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)
    return new_teacher


# get a specific teacher by ID
@app.get("/teachers/{teacher_id}")
def get_teacher(teacher_id: str, db: Session = Depends(get_db)):

    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    
    # teacher with the given ID does not exist
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    return teacher


# get all teachers
@app.get("/teachers")
def get_teachers(db: Session = Depends(get_db)):

    teachers = db.query(Teacher).all()
    return teachers


# get the list of students in a specific teacher's class
@app.get("/teachers/{teacher_id}/students")
def get_students_of_teacher_class(teacher_id: str, db: Session = Depends(get_db)):

    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()

    # teacher with the given ID does not exist
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    students = db.query(Student).filter(Student.class_name == teacher.class_name).all()
    return students


# add a location to the database
@app.post("/location")
def create_location(data: dict, db: Session = Depends(get_db)):

    # validate that the location data contains the required fields
    if "ID" not in data:
        raise HTTPException(status_code=400, detail="ID is required")
    if "Time" not in data:
        raise HTTPException(status_code=400, detail="Time is required")
    if "Coordinates" not in data:
        raise HTTPException(status_code=400, detail="Coordinates missing")

    longitude = dms_to_decimal(
        data["Coordinates"]["Longitude"]["Degrees"],
        data["Coordinates"]["Longitude"]["Minutes"],
        data["Coordinates"]["Longitude"]["Seconds"]
    )
    latitude = dms_to_decimal(
        data["Coordinates"]["Latitude"]["Degrees"],
        data["Coordinates"]["Latitude"]["Minutes"],
        data["Coordinates"]["Latitude"]["Seconds"]
    )
    new_location = Location(
        id=str(data["ID"]),
        time=parse_time(data["Time"]),
        longitude=longitude,
        latitude=latitude
    )
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return {"message": "location saved"}


# get all locations
@app.get("/locations")
def get_locations(db: Session = Depends(get_db)):

    return db.query(Location).all()


# get all locations of a specific person by ID
@app.get("/locations/{person_id}")
def get_locations_by_person(person_id: str, db: Session = Depends(get_db)):

    locations = db.query(Location).filter(Location.id == person_id).all()
    
    # no locations found for the given person ID
    if not locations:
        raise HTTPException(status_code=404, detail="No locations found")

    return locations


# get the latest location of a specific person by ID
@app.get("/locations/latest/{person_id}")
def get_latest_location(person_id: str, db: Session = Depends(get_db)):

    location = (
        db.query(Location)
        .filter(Location.id == person_id)
        .order_by(Location.time.desc())
        .first()
    )
    # no locations found for the given person ID
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    return location


# get all locations within a certain distance from a given point    
@app.get("/locations/near")
def get_locations_near(latitude: float, longitude: float, max_distance_km: float, db: Session = Depends(get_db)):

    all_locations = db.query(Location).all()
    results = []
    
    for loc in all_locations:
        dist = distance_km( latitude, longitude, loc.latitude, loc.longitude)
        
        if dist <= max_distance_km:
            results.append(loc)

    return results
