from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Role, User, UserRole
from app.schemas import AssignRoleRequest, RoleCreate, RoleResponse
from app.utils.rbac import ALLOWED_ROLES, require_role


router = APIRouter(tags=["Roles"])


@router.post("/roles/create", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(
    role_data: RoleCreate,
    current_user: User = Depends(require_role("Admin")),
    db: Session = Depends(get_db),
):
    if role_data.name not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Role must be one of: {', '.join(sorted(ALLOWED_ROLES))}",
        )

    existing_role = db.query(Role).filter(Role.name == role_data.name).first()
    if existing_role:
        raise HTTPException(status_code=400, detail="Role already exists")

    role = Role(name=role_data.name)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.post("/users/assign-role")
def assign_role(
    assignment: AssignRoleRequest,
    current_user: User = Depends(require_role("Admin")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == assignment.user_id).first()
    role = db.query(Role).filter(Role.id == assignment.role_id).first()
    if not user or not role:
        raise HTTPException(status_code=404, detail="User or role not found")

    existing = (
        db.query(UserRole)
        .filter(UserRole.user_id == user.id, UserRole.role_id == role.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="User already has this role")

    user_role = UserRole(user_id=user.id, role_id=role.id)
    db.add(user_role)
    db.commit()
    return {"message": "Role assigned successfully"}


@router.get("/users/{user_id}/roles", response_model=list[RoleResponse])
def get_user_roles(
    user_id: int,
    current_user: User = Depends(require_role("Admin")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    roles = db.query(Role).join(UserRole).filter(UserRole.user_id == user_id).all()
    return roles
