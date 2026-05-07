"""Idempotent geliştirme/test seed.

Çalıştırma:
    cd backend && .venv/bin/python seed.py

Oluşturduklarını yazdırır. Aynı kayıtlar varsa atlar (UPDATE yok — idempotent).
"""
from database import SessionLocal, Base, engine
from models.tenant import Tenant, TenantStatus
from models.platform_user import PlatformUser
from models.user import User
from services.security import hash_password
from services.tenant_setup import ensure_permissions, initialize_tenant_roles


PLATFORM_USER = {
    "email": "admin@example.com",
    "password": "Platform1234!",
    "full_name": "Serkan Güngör (platform)",
}

DEMO_TENANT = {
    "name": "Demo A.Ş.",
    "slug": "demo",
    "status": TenantStatus.trial,
}

DEMO_OWNER = {
    "email": "owner@example.com",
    "password": "Demo1234!",
    "first_name": "Demo",
    "last_name": "Owner",
    "phone": "+905551112233",
}

DEMO_MEMBER = {
    "email": "member@example.com",
    "password": "Member1234!",
    "first_name": "Demo",
    "last_name": "Member",
    "phone": "+905554445566",
}


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Permissions (sistem-geneli, tenant'tan bağımsız)
        ensure_permissions(db)
        print("[+]    permissions sync edildi")

        # Platform user
        pu = db.query(PlatformUser).filter(PlatformUser.email == PLATFORM_USER["email"]).first()
        if pu:
            print(f"[skip] platform_user {PLATFORM_USER['email']} zaten var (id={pu.id})")
        else:
            pu = PlatformUser(
                email=PLATFORM_USER["email"],
                full_name=PLATFORM_USER["full_name"],
                password_hash=hash_password(PLATFORM_USER["password"]),
                is_active=True,
            )
            db.add(pu)
            db.commit()
            db.refresh(pu)
            print(f"[+]    platform_user {pu.email} (id={pu.id})")

        # Demo tenant
        tenant = db.query(Tenant).filter(Tenant.slug == DEMO_TENANT["slug"]).first()
        if tenant:
            print(f"[skip] tenant {DEMO_TENANT['slug']} zaten var (id={tenant.id})")
        else:
            tenant = Tenant(
                name=DEMO_TENANT["name"],
                slug=DEMO_TENANT["slug"],
                status=DEMO_TENANT["status"],
            )
            db.add(tenant)
            db.commit()
            db.refresh(tenant)
            print(f"[+]    tenant {tenant.slug} (id={tenant.id}, status={tenant.status.value})")

        # Demo tenant'ın sistem rolleri
        roles = initialize_tenant_roles(db, tenant.id)
        print(f"[+]    sistem rolleri: {', '.join(roles.keys())}")

        # Demo owner user (Owner rolü)
        owner = (
            db.query(User)
            .filter(User.email == DEMO_OWNER["email"], User.tenant_id == tenant.id)
            .first()
        )
        if owner:
            print(f"[skip] user {DEMO_OWNER['email']} @ tenant {tenant.slug} zaten var (id={owner.id})")
        else:
            owner = User(
                tenant_id=tenant.id,
                email=DEMO_OWNER["email"],
                first_name=DEMO_OWNER["first_name"],
                last_name=DEMO_OWNER["last_name"],
                phone=DEMO_OWNER["phone"],
                password_hash=hash_password(DEMO_OWNER["password"]),
                role_id=roles["Owner"].id,
                is_active=True,
            )
            db.add(owner)
            db.commit()
            db.refresh(owner)
            print(f"[+]    user {owner.email} @ tenant {tenant.slug} (id={owner.id}, role=Owner)")

        # Demo member user (RBAC test'i için — Owner'a göre kısıtlı)
        member = (
            db.query(User)
            .filter(User.email == DEMO_MEMBER["email"], User.tenant_id == tenant.id)
            .first()
        )
        if member:
            print(f"[skip] user {DEMO_MEMBER['email']} @ tenant {tenant.slug} zaten var (id={member.id})")
        else:
            member = User(
                tenant_id=tenant.id,
                email=DEMO_MEMBER["email"],
                first_name=DEMO_MEMBER["first_name"],
                last_name=DEMO_MEMBER["last_name"],
                phone=DEMO_MEMBER["phone"],
                password_hash=hash_password(DEMO_MEMBER["password"]),
                role_id=roles["Member"].id,
                is_active=True,
            )
            db.add(member)
            db.commit()
            db.refresh(member)
            print(f"[+]    user {member.email} @ tenant {tenant.slug} (id={member.id}, role=Member)")
    finally:
        db.close()

    print()
    print("Test credentials:")
    print(f"  Platform login: {PLATFORM_USER['email']} / {PLATFORM_USER['password']}")
    print(f"    → POST http://platform.localhost:8000/platform/auth/login")
    print(f"  Tenant Owner:   {DEMO_OWNER['email']} / {DEMO_OWNER['password']}")
    print(f"    → POST http://{DEMO_TENANT['slug']}.localhost:8000/auth/login")
    print(f"  Tenant Member:  {DEMO_MEMBER['email']} / {DEMO_MEMBER['password']}")
    print(f"    → POST http://{DEMO_TENANT['slug']}.localhost:8000/auth/login")


if __name__ == "__main__":
    seed()
