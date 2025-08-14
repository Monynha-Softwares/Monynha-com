import { readdir, readFile } from 'fs/promises';
import path from 'node:path';

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip compiled ui components directory
      if (!res.includes(`${path.sep}ui${path.sep}`)) {
        files.push(...(await listFiles(res)));
      }
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(res);
    }
  }
  return files;
}

async function main() {
  const root = path.join(process.cwd(), 'src');
  const files = await listFiles(root);
  const results: { file: string; count: number }[] = [];
  const regex = /<\s*(button|input|select|textarea)([>\s])/g;

  for (const file of files) {
    if (file.includes(`${path.sep}components${path.sep}ui${path.sep}`))
      continue;
    const content = await readFile(file, 'utf8');
    const matches = content.match(regex);
    if (matches) {
      results.push({
        file: path.relative(process.cwd(), file),
        count: matches.length,
      });
    }
  }

  if (results.length === 0) {
    console.log('All components use shadcn UI elements.');
  } else {
    console.log('Files with raw HTML elements:');
    for (const r of results) {
      console.log(` - ${r.file}: ${r.count}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
