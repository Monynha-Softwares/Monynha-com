import {
  Project,
  SyntaxKind,
  SourceFile,
  ImportDeclaration,
  Node,
  JsxAttribute,
  JsxOpeningElement,
  JsxSelfClosingElement,
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

function getLiteralFromAttribute(attr: JsxAttribute) {
  const initializer = attr.getInitializer();
  if (!initializer) return undefined;
  if (Node.isStringLiteral(initializer) || Node.isNoSubstitutionTemplateLiteral(initializer)) {
    return initializer;
  }
  if (Node.isJsxExpression(initializer)) {
    const expression = initializer.getExpression();
    if (!expression) return undefined;
    if (Node.isStringLiteral(expression) || Node.isNoSubstitutionTemplateLiteral(expression)) {
      return expression;
    }
  }
  return undefined;
}

function stripClasses(attr: JsxAttribute, classesToRemove: string[]) {
  const literal = getLiteralFromAttribute(attr);
  if (!literal) return false;
  const initializer = attr.getInitializer();
  const classList = literal.getLiteralText().split(/\s+/).filter(Boolean);
  const filtered = classList.filter((cls) => !classesToRemove.includes(cls));
  if (filtered.length === classList.length) {
    return false;
  }
  if (filtered.length === 0) {
    attr.remove();
    return true;
  }
  const newValue = filtered.join(' ');
  if (literal === initializer) {
    literal.setLiteralValue(newValue);
  } else if (initializer && Node.isJsxExpression(initializer)) {
    initializer.setExpression(`"${newValue}"`);
  }
  return true;
}

function hasClass(attr: JsxAttribute, className: string) {
  const literal = getLiteralFromAttribute(attr);
  if (!literal) return false;
  return literal.getLiteralText().split(/\s+/).includes(className);
}

function upsertAttribute(
  element: JsxOpeningElement | JsxSelfClosingElement,
  name: string,
  value: string,
) {
  const existing = element.getAttribute(name);
  if (existing) {
    existing.setInitializer(`"${value}"`);
  } else {
    element.addAttribute({ name, initializer: `"${value}"` });
  }
}

for (const sourceFile of project.getSourceFiles('src/**/*.{ts,tsx}')) {
  let changed = false;
  const jsx = sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
    .concat(sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement));
  for (const el of jsx) {
    const tagName = el.getTagNameNode().getText();
    let classAttr = el.getAttribute('className');
    if (tagName === 'Button' && classAttr) {
      if (hasClass(classAttr, 'btn-primary')) {
        stripClasses(classAttr, ['btn-primary']);
        upsertAttribute(el, 'variant', 'brandPrimary');
        changed = true;
      }
      classAttr = el.getAttribute('className');
      if (classAttr && hasClass(classAttr, 'btn-secondary')) {
        stripClasses(classAttr, ['btn-secondary']);
        upsertAttribute(el, 'variant', 'brandSecondary');
        changed = true;
      }
    }
    classAttr = el.getAttribute('className');
    if (tagName === 'button' && classAttr) {
      const isPrimary = hasClass(classAttr, 'btn-primary');
      const isSecondary = hasClass(classAttr, 'btn-secondary');
      if (isPrimary || isSecondary) {
        el.setTagName('Button');
        if (isPrimary) {
          stripClasses(classAttr, ['btn-primary']);
          upsertAttribute(el, 'variant', 'brandPrimary');
        } else {
          stripClasses(classAttr, ['btn-secondary']);
          upsertAttribute(el, 'variant', 'brandSecondary');
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
