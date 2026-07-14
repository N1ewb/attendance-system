from supabase import create_client, Client
from server.config import get_settings

settings = get_settings()

supabase: Client = create_client(
    supabase_url=settings.supabase_url,
    supabase_key=settings.supabase_anon_key
)


def get_supabase() -> Client:
    return supabase


def get_service_client() -> Client:
    return create_client(
        supabase_url=settings.supabase_url,
        supabase_key=settings.supabase_service_key
    )
