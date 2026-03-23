from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging
from ..database import get_db
from ..models.meeting import Meeting
from ..models.user import User
from ..schemas.meeting import MeetingCreate, MeetingUpdate, MeetingResponse
from ..dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/meetings", tags=["Meetings"])


# CREATE
@router.post("/", response_model=MeetingResponse)
def create_meeting(
    meeting: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создать новую встречу (текущий пользователь - владелец)"""
    db_meeting = Meeting(
        title=meeting.title,
        description=meeting.description,
        notes=meeting.notes,
        summary=meeting.summary,
        meeting_date=meeting.meeting_date,
        owner_id=current_user.id
    )

    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    
    logger.info(f"Meeting created by user {current_user.username}: {meeting.title} (ID: {db_meeting.id})")

    return db_meeting


# READ ALL
@router.get("/", response_model=list[MeetingResponse])
def get_meetings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить все встречи текущего пользователя"""
    meetings = db.query(Meeting).filter(Meeting.owner_id == current_user.id).all()
    logger.info(f"User {current_user.username} retrieved {len(meetings)} meetings")
    return meetings

# READ ONE
@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить встречу (только владелец)"""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        logger.warning(f"User {current_user.username} tried to access non-existent meeting {meeting_id}")
        raise HTTPException(status_code=404, detail="Meeting not found")

    if meeting.owner_id != current_user.id:
        logger.warning(f"Unauthorized access attempt by {current_user.username} to meeting {meeting_id} (owner: {meeting.owner_id})")
        raise HTTPException(status_code=403, detail="Access denied")

    logger.info(f"User {current_user.username} accessed meeting {meeting_id}")
    return meeting


# UPDATE
@router.put("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(
    meeting_id: int,
    meeting_data: MeetingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Обновить встречу (только владелец)"""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        logger.warning(f"User {current_user.username} tried to update non-existent meeting {meeting_id}")
        raise HTTPException(status_code=404, detail="Meeting not found")

    if meeting.owner_id != current_user.id:
        logger.warning(f"Unauthorized update attempt by {current_user.username} to meeting {meeting_id}")
        raise HTTPException(status_code=403, detail="Access denied")

    for key, value in meeting_data.model_dump(exclude_unset=True).items():
        setattr(meeting, key, value)

    db.commit()
    db.refresh(meeting)

    logger.info(f"Meeting {meeting_id} updated by user {current_user.username}")
    return meeting


# DELETE
@router.delete("/{meeting_id}")
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Удалить встречу (только владелец)"""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        logger.warning(f"User {current_user.username} tried to delete non-existent meeting {meeting_id}")
        raise HTTPException(status_code=404, detail="Meeting not found")

    if meeting.owner_id != current_user.id:
        logger.warning(f"Unauthorized delete attempt by {current_user.username} to meeting {meeting_id}")
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(meeting)
    db.commit()

    logger.info(f"Meeting {meeting_id} deleted by user {current_user.username}")
    return {"message": "Meeting deleted"}