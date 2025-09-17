begin;

insert into public.site_settings (key, value, description)
values (
  'about_stats',
  '[
    {"number": "25+", "label": "Open source repositories"},
    {"number": "15+", "label": "Active contributors"},
    {"number": "3", "label": "Main platforms (Web, Mobile, Infra)"},
    {"number": "100%", "label": "Accessibility-first design"}
  ]'::jsonb,
  'Key metrics presented on the About page, focused on community and technical achievements'
)
on conflict (key) do update
set value = excluded.value,
    description = excluded.description,
    updated_at = now();

commit;
