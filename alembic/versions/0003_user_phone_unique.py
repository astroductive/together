"""make users.phone unique (one account per phone number)

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-01

users.phone was added non-unique in 0002, so a live DB may already hold rows that
share a phone — or hold phones in an older, non-canonical spelling (``20…`` /
``0020…`` vs the new ``+20…``). Adding the UNIQUE constraint blindly would abort
on duplicates and, because entrypoint.sh runs ``alembic upgrade head`` under
``set -e``, block startup entirely. So we (1) re-canonicalize every stored phone
to the same ``+E.164`` form sms_otp.normalize_phone now produces, (2) keep the
earliest account for each number and NULL the phone on the rest, then (3) add the
constraint. Postgres treats NULLs as distinct, so phone-less accounts are
unaffected. All three steps are idempotent.
"""
from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1) Re-canonicalize existing phones to match normalize_phone():
    #    strip non-digits (incl. '+'), drop a leading international '00', force '+'.
    op.execute(
        r"""
        UPDATE users
        SET phone = '+' || regexp_replace(
                              regexp_replace(phone, '\D', '', 'g'),  -- digits only
                              '^00', ''                              -- 00<cc> -> <cc>
                          )
        WHERE phone IS NOT NULL AND phone ~ '[0-9]';
        """
    )
    # Any phone with no digits at all (e.g. a stray '+') becomes NULL.
    op.execute("UPDATE users SET phone = NULL WHERE phone IS NOT NULL AND phone !~ '[0-9]';")

    # 2) Resolve duplicates: keep the earliest account (MIN(id)) per number,
    #    clear the phone on the others so the unique index can be built.
    op.execute(
        """
        UPDATE users
        SET phone = NULL, phone_verified = false
        WHERE phone IS NOT NULL
          AND id NOT IN (
              SELECT MIN(id) FROM users WHERE phone IS NOT NULL GROUP BY phone
          );
        """
    )

    # 3) Add the unique constraint (skip if it somehow already exists, e.g. a
    #    fresh dev DB that ran Base.metadata.create_all first).
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conrelid = 'users'::regclass
                  AND contype = 'u'
                  AND conname = 'uq_users_phone'
            ) THEN
                ALTER TABLE users ADD CONSTRAINT uq_users_phone UNIQUE (phone);
            END IF;
        END$$;
        """
    )


def downgrade() -> None:
    op.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS uq_users_phone")
