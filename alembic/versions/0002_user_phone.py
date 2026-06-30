"""add phone + phone_verified to users (SMS OTP verification)

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-01
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("phone", sa.String(), nullable=True))
    op.add_column(
        "users",
        sa.Column(
            "phone_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "phone_verified")
    op.drop_column("users", "phone")
