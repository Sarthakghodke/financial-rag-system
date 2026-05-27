from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Role, User, UserRole
from app.utils.auth import get_current_user


ALLOWED_ROLES = {"Admin", "Financial Analyst", "Auditor", "Client"}


def user_has_role(db: Session, user_id: int, role_name: str) -> bool:
    return (
        db.query(UserRole)
        .join(Role)
        .filter(UserRole.user_id == user_id, Role.name == role_name)
        .first()
        is not None
    )


def require_role(required_role: str):
    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        if not user_has_role(db, current_user.id, required_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"{required_role} role is required",
            )
        return current_user

    return dependency
