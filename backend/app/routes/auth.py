from fastapi import APIRouter, HTTPException, status
from app.schemas import (
    RegisterRequest,
    LoginRequest,
    OnboardingRequest,
    ProfileUpdateRequest,
    StudentResponse
)
from app.database import DatabaseService

router = APIRouter(prefix="/api/auth", tags=["Authentication & Student Profile"])


@router.post("/register", response_model=StudentResponse)
def register_student(req: RegisterRequest):
    """Registers a new student account with validation and secure password hashing."""
    if not req.email or "@" not in req.email or "." not in req.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address."
        )
    if not req.password or len(req.password.strip()) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )
    if not req.full_name or len(req.full_name.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter your full name."
        )

    try:
        student = DatabaseService.register_student(
            full_name=req.full_name,
            email=req.email,
            password=req.password
        )
        return StudentResponse(**student)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Registration failed: {str(e)}")


@router.post("/login", response_model=StudentResponse)
def login_student(req: LoginRequest):
    """Logs in an existing student or initializes a judge demo session."""
    email = req.email.strip().lower()
    if not email:
        email = "demo.student@gapfinder.ai"

    try:
        student = DatabaseService.authenticate_student(
            email=email,
            password=req.password,
            full_name=req.full_name
        )
        return StudentResponse(**student)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Login failed: {str(e)}")


@router.post("/onboarding", response_model=StudentResponse)
def complete_onboarding(req: OnboardingRequest):
    """Saves student onboarding preferences (course, exam, study hours)."""
    updated = DatabaseService.update_student_profile(
        student_id=req.student_id,
        data={
            "target_subject": req.target_subject,
            "exam_name": req.exam_name,
            "exam_date": req.exam_date,
            "daily_study_hours": req.daily_study_hours,
            "prep_duration_days": req.prep_duration_days,
            "onboarding_completed": 1
        }
    )
    return StudentResponse(**updated)


@router.get("/me/{student_id}", response_model=StudentResponse)
def get_current_student(student_id: str):
    """Fetches the authenticated student profile."""
    student = DatabaseService.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")
    return StudentResponse(**student)


@router.put("/profile/{student_id}", response_model=StudentResponse)
def update_profile(student_id: str, req: ProfileUpdateRequest):
    """Updates student profile information and preferences."""
    updated = DatabaseService.update_student_profile(
        student_id=student_id,
        data=req.dict(exclude_unset=True)
    )
    return StudentResponse(**updated)


@router.get("/demo", response_model=StudentResponse)
def get_demo_account():
    """Returns the default pre-seeded demo account for interview judges."""
    student = DatabaseService.get_or_create_student("demo.student@gapfinder.ai", "Alex Mercer (Demo Student)")
    return StudentResponse(**student)
