-- Offres commerciales initiales.
-- ⚠️ Les allocations de minutes sont PROVISOIRES (voir docs/COST_MODEL.md) et doivent
-- être validées par le fondateur après mesure des coûts réels. Elles se modifient
-- par un simple UPDATE, sans changer le code.
insert into public.plans
  (id, name, price_cents, monthly_source_videos, monthly_source_seconds, max_clips_per_video,
   max_video_seconds, max_upload_bytes, export_max_height, watermark, priority, max_concurrent_jobs,
   features, sort_order)
values
  ('free',     'Free',        0,  3,   30 * 60, 5,  15 * 60,  2::bigint * 1024 ^ 3,  720, true,  0, 1,
   '{"custom_captions": false, "style_choice": false}', 0),
  ('starter',  'Starter',   999, 10,  120 * 60, 5,  60 * 60,  4::bigint * 1024 ^ 3, 1080, false, 0, 1,
   '{"custom_captions": true, "style_choice": true}', 1),
  ('pro',      'Pro',      1999, 30,  300 * 60, 5, 120 * 60,  6::bigint * 1024 ^ 3, 1080, false, 10, 2,
   '{"custom_captions": true, "style_choice": true, "advanced_customization": true}', 2),
  ('ultimate', 'Ultimate', 3999, 80,  700 * 60, 5, 180 * 60,  8::bigint * 1024 ^ 3, 1080, false, 10, 3,
   '{"custom_captions": true, "style_choice": true, "advanced_customization": true}', 3)
on conflict (id) do nothing;
