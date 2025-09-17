import { Project, SyntaxKind, SourceFile, ImportDeclaration } from 'ts-morph';
import path from 'node:path';

const project = new Project({ tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json') });

function ensureImport(sourceFile: SourceFile, name: string, spec: string) {
  const existing = sourceFile
    .getImportDeclarations()
    .find((imp: ImportDeclaration) => imp.getModuleSpecifierValue() === spec);
  if (existing) {
    if (!existing.getNamedImports().some((n) => n.getName() === name)) {
      existing.addNamedImport(name);
    }
  } else {
    sourceFile.addImportDeclaration({ moduleSpecifier: spec, namedImports: [name] });
  }
}

for (const sourceFile of project.getSourceFiles('src/**/*.{ts,tsx}')) {
  let changed = false;
  const jsx = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement).concat(sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement));
  for (const el of jsx) {
    const tagName = el.getTagNameNode().getText();
    const classAttr = el.getAttribute('className');
    if (tagName === 'Button' && classAttr) {
      const value = classAttr.getInitializer()?.getText() || '';
      if (value.includes('btn-primary')) {
        classAttr.remove();
        el.addAttribute({ name: 'variant', initializer: '"default"' });
        changed = true;
      }
      if (value.includes('btn-secondary')) {
        classAttr.remove();
        el.addAttribute({ name: 'variant', initializer: '"secondary"' });
        changed = true;
      }
    }
    if (tagName === 'button' && classAttr) {
      const value = classAttr.getInitializer()?.getText() || '';
      if (value.includes('btn-primary') || value.includes('btn-secondary')) {
        el.setTagName('Button');
        if (value.includes('btn-primary')) {
          el.addAttribute({ name: 'variant', initializer: '"default"' });
        } else {
          el.addAttribute({ name: 'variant', initializer: '"secondary"' });
        }
        classAttr.remove();
        ensureImport(sourceFile, 'Button', '@monynha/ui/button');
        changed = true;
      }
    }
    if (tagName === 'input') {
      el.setTagName('Input');
      ensureImport(sourceFile, 'Input', '@monynha/ui/input');
      changed = true;
    }
    if (tagName === 'select') {
      el.setTagName('Select');
      ensureImport(sourceFile, 'Select', '@monynha/ui/select');
      changed = true;
    }
  }
  if (changed) sourceFile.saveSync();
}
