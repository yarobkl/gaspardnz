-- La fonction est appelée uniquement par l’API Vercel avec la clé service_role.
-- Aucun client anon/authenticated ne doit pouvoir invoquer cette fonction SECURITY DEFINER.

revoke execute on function public.create_booking_request(text, text, text, text, text, date, text) from public, anon, authenticated;
grant execute on function public.create_booking_request(text, text, text, text, text, date, text) to service_role;
