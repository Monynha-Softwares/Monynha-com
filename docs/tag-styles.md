# Tag Style Mapping

This project displays repository tags as styled badges on the projects page. The mapping between tag names and their visual styles (colors and optional icons) lives in `src/pages/Projects.tsx`.

| Tag name  | Classes                          | Icon    |
|-----------|----------------------------------|---------|
| React     | `bg-sky-100 text-sky-800`        | atom    |
| TypeScript| `bg-blue-100 text-blue-800`      | code    |
| Firebase  | `bg-amber-100 text-amber-800`    | flame   |
| Tailwind  | `bg-teal-100 text-teal-800`      | wind    |
| Node.js   | `bg-lime-100 text-lime-800`      | server  |
| Express   | `bg-zinc-100 text-zinc-800`      | server  |
| Supabase  | `bg-green-100 text-green-800`    | database|
| Vite      | `bg-violet-100 text-violet-800`  | zap     |
| OpenAI    | `bg-emerald-100 text-emerald-800`| bot     |

To add a new tag style, extend the `tagStyles` object in `Projects.tsx` with the desired Tailwind classes and, optionally, an icon from `lucide-react`.
