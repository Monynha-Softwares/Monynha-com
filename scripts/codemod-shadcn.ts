import {
  Project,
  SyntaxKind,
  SourceFile,
  ImportDeclaration,
  JsxAttribute,
  StringLiteral,
} from 'ts-morph';
import path from 'node:path';

const project = new Project({
  tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
});

function ensureImport(sourceFile: SourceFile, name: string, spec: string) {
  const existing = sourceFile
    .getImportDeclarations()
    .find((imp: ImportDeclaration) => imp.getModuleSpecifierValue() === spec);
  if (existing) {
    if (!existing.getNamedImports().some((n) => n.getName() === name)) {
      existing.addNamedImport(name);
    }
  } else {
    sourceFile.addImportDeclaration({
      moduleSpecifier: spec,
      namedImports: [name],
    });
  }
}

function stripLegacyClass(classAttr: JsxAttribute, legacyClass: string) {
  const initializer = classAttr.getInitializer();
  if (!initializer) {
    classAttr.remove();
    return;
  }

  const literal = initializer.asKind(StringLiteral);
  if (literal) {
    const remaining = literal
      .getLiteralText()
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => token !== legacyClass);

    if (remaining.length > 0) {
      literal.setLiteralValue(remaining.join(' '));
    } else {
      classAttr.remove();
    }
    return;
  }

  // Fallback: remove the attribute if we can't safely transform it
  classAttr.remove();
}

for (const sourceFile of project.getSourceFiles('src/**/*.{ts,tsx}')) {
  let changed = false;
  const jsx = sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
    .concat(sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement));
  for (const el of jsx) {
    const tagName = el.getTagNameNode().getText();
    const classAttr = el.getAttribute('className');
    if (tagName === 'Button' && classAttr) {
      const value = classAttr.getInitializer()?.getText() || '';
      if (value.includes('btn-primary')) {
        stripLegacyClass(classAttr, 'btn-primary');
        el.addAttribute({ name: 'variant', initializer: '"brandPrimary"' });
        changed = true;
      }
      if (value.includes('btn-secondary')) {
        stripLegacyClass(classAttr, 'btn-secondary');
        el.addAttribute({ name: 'variant', initializer: '"brandSecondary"' });
        changed = true;
      }
    }
    if (tagName === 'button' && classAttr) {
      const value = classAttr.getInitializer()?.getText() || '';
      if (value.includes('btn-primary') || value.includes('btn-secondary')) {
        el.setTagName('Button');
        if (value.includes('btn-primary')) {
          el.addAttribute({ name: 'variant', initializer: '"brandPrimary"' });
          stripLegacyClass(classAttr, 'btn-primary');
        } else {
          el.addAttribute({ name: 'variant', initializer: '"brandSecondary"' });
          stripLegacyClass(classAttr, 'btn-secondary');
        }
        ensureImport(sourceFile, 'Button', '@/components/ui/button');
        changed = true;
      }
    }
    if (tagName === 'input') {
      el.setTagName('Input');
      ensureImport(sourceFile, 'Input', '@/components/ui/input');
      changed = true;
    }
    if (tagName === 'select') {
      el.setTagName('Select');
      ensureImport(sourceFile, 'Select', '@/components/ui/select');
      changed = true;
    }
  }
  if (changed) sourceFile.saveSync();
}
