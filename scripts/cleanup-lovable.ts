import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const ignoreDirs = new Set(['node_modules', '.git', 'dist']);

async function processDir(dir: string): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoreDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await processDir(fullPath);
    } else if (
      ['.ts', '.tsx', '.js', '.jsx', '.html', '.json'].includes(
        path.extname(entry.name)
      )
    ) {
      const content = await fs.readFile(fullPath, 'utf8');
      const newContent = content.split('\n').join('\n');
      await fs.writeFile(fullPath, newContent);
    }
  }
}
processDir(rootDir).catch((err) => {
  console.error(err);
  process.exit(1);
});
