-- Non-destructive rollback: disable ingestion while retaining all recorded data.
revoke execute on function public.save_contact_intent(uuid,text,text,text,text,text,text,uuid) from service_role;
