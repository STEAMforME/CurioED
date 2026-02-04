from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime, timedelta
from jose import JWTError, jwt

app = FastAPI(title="CRAFT the Future API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = "craft-future-secret-dev-only-change-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Models
RoleType = Literal["learner", "parent", "mentor", "instructor", "principal", "superintendent", "admin"]

class User(BaseModel):
    id: str
    email: str
    name: str
    role: RoleType

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    accessToken: str
    user: User

class Course(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = None
    subject: Optional[str] = None
    gradeBand: Optional[str] = None

class Quest(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    difficulty: int
    xpReward: int

class MentorProfile(BaseModel):
    id: str
    userId: str
    bio: Optional[str] = None
    expertiseTags: list[str]

class MentorSession(BaseModel):
    id: str
    learnerId: str
    mentorId: str
    status: str
    topic: Optional[str] = None

class KPIDashboard(BaseModel):
    totalLearners: int
    activeEnrollments: int
    completionRate: float
    avgXpPerLearner: float
    mentorSessionsThisMonth: int
    atRiskLearners: int

# Mock Database (using simple password for dev - all passwords are "password123")
MOCK_USERS = {
    "learner@craft.edu": {
        "id": "1", "email": "learner@craft.edu", 
        "name": "Jamie Student", "role": "learner",
        "password": "password123"
    },
    "parent@craft.edu": {
        "id": "2", "email": "parent@craft.edu", 
        "name": "Pat Parent", "role": "parent",
        "password": "password123"
    },
    "mentor@craft.edu": {
        "id": "3", "email": "mentor@craft.edu", 
        "name": "Morgan Mentor", "role": "mentor",
        "password": "password123"
    },
    "instructor@craft.edu": {
        "id": "4", "email": "instructor@craft.edu", 
        "name": "Taylor Teacher", "role": "instructor",
        "password": "password123"
    },
    "principal@craft.edu": {
        "id": "5", "email": "principal@craft.edu", 
        "name": "River Principal", "role": "principal",
        "password": "password123"
    },
    "super@craft.edu": {
        "id": "6", "email": "super@craft.edu", 
        "name": "Dr. Casey Superintendent", "role": "superintendent",
        "password": "password123"
    },
    "admin@craft.edu": {
        "id": "7", "email": "admin@craft.edu", 
        "name": "Alex Admin", "role": "admin",
        "password": "password123"
    },
}

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_data = MOCK_USERS.get(email)
        if not user_data:
            raise HTTPException(status_code=401, detail="User not found")
        return User(
            id=user_data["id"],
            email=user_data["email"],
            name=user_data["name"],
            role=user_data["role"]
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@app.get("/")
def root():
    return {"message": "CRAFT the Future API", "version": "0.1.0", "roles": list(MOCK_USERS.keys())}

@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    user_data = MOCK_USERS.get(payload.email)
    if not user_data or payload.password != user_data["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(
        id=user_data["id"],
        email=user_data["email"],
        name=user_data["name"],
        role=user_data["role"]
    )
    token = create_access_token({"sub": user.email})
    return LoginResponse(accessToken=token, user=user)

@app.get("/auth/me", response_model=User)
def me(current_user: User = Depends(get_current_user)):
    return current_user

# Learning endpoints
@app.get("/learn/courses")
def list_courses(current_user: User = Depends(get_current_user)):
    return [
        {"id": "1", "title": "Introduction to Python", "subject": "Computer Science", "gradeBand": "9-12"},
        {"id": "2", "title": "STEAM Design Thinking", "subject": "STEAM", "gradeBand": "6-8"},
        {"id": "3", "title": "Newark Community Leadership", "subject": "Civic Engagement", "gradeBand": "9-12"},
    ]

@app.get("/quests")
def list_quests(current_user: User = Depends(get_current_user)):
    return [
        {"id": "1", "title": "Build Your First Robot", "difficulty": 2, "xpReward": 500},
        {"id": "2", "title": "Newark History Explorer", "difficulty": 1, "xpReward": 300},
        {"id": "3", "title": "Create a Community App", "difficulty": 3, "xpReward": 1000},
    ]

@app.get("/mentor/mentors")
def list_mentors(current_user: User = Depends(get_current_user)):
    return [
        {"id": "1", "userId": "3", "bio": "STEAM educator with 10 years experience", "expertiseTags": ["Python", "Robotics"]},
    ]

@app.get("/mentor/sessions")
def list_sessions(current_user: User = Depends(get_current_user)):
    return []

# KPI endpoints for leadership roles
@app.get("/admin/kpis", response_model=KPIDashboard)
def get_kpis(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "principal", "superintendent", "instructor"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Different KPIs based on role
    if current_user.role == "superintendent":
        # District-wide metrics
        return KPIDashboard(
            totalLearners=1250,
            activeEnrollments=3420,
            completionRate=72.3,
            avgXpPerLearner=1580,
            mentorSessionsThisMonth=342,
            atRiskLearners=87
        )
    elif current_user.role == "principal":
        # School-level metrics
        return KPIDashboard(
            totalLearners=245,
            activeEnrollments=612,
            completionRate=67.5,
            avgXpPerLearner=1250,
            mentorSessionsThisMonth=89,
            atRiskLearners=18
        )
    elif current_user.role == "instructor":
        # Course-level metrics
        return KPIDashboard(
            totalLearners=32,
            activeEnrollments=64,
            completionRate=78.2,
            avgXpPerLearner=980,
            mentorSessionsThisMonth=12,
            atRiskLearners=3
        )
    else:
        # Admin gets full access
        return KPIDashboard(
            totalLearners=1250,
            activeEnrollments=3420,
            completionRate=72.3,
            avgXpPerLearner=1580,
            mentorSessionsThisMonth=342,
            atRiskLearners=87
        )

# Admin impersonation
@app.post("/admin/impersonate/{user_id}")
def impersonate_user(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can impersonate")
    
    for email, data in MOCK_USERS.items():
        if data["id"] == user_id:
            user = User(
                id=data["id"],
                email=data["email"],
                name=f"{data['name']} [IMPERSONATED]",
                role=data["role"]
            )
            token = create_access_token({"sub": data["email"], "impersonated": True})
            return LoginResponse(accessToken=token, user=user)
    
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/admin/users")
def list_all_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return [
        {"id": data["id"], "email": email, "name": data["name"], "role": data["role"]}
        for email, data in MOCK_USERS.items()
    ]
