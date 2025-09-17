begin;

insert into public.site_settings (key, value, description)
values (
  'about_stats',
  '[{"number": "25+", "label": "Open source repositories"}, {"number": "10+", "label": "Active client solutions"}, {"number": "5", "label": "Countries with partners"}, {"number": "100%", "label": "Accessibility-first"}]'::jsonb,
  'Metrics presented on the About page'
)
on conflict (key) do update
set value = excluded.value,
    description = excluded.description,
    updated_at = now();

commit;
