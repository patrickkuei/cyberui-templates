import { describe, it, expect } from 'vitest';
import ts from 'typescript';

// This template keeps all styling in CSS classes (App.css). The check exists
// so that stays true: it parses every component's source and fails if a JSX
// `style` attribute appears. It looks at the syntax tree, not the text, so
// spacing (`style = {…}`), comments and strings that mention style={ cannot
// fool it. Limit: it reads attributes written in the file, so a style passed
// inside a spread (`{...props}`) is not seen.
const sources = import.meta.glob('./**/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function hasStyleAttribute(code: string): boolean {
  const sourceFile = ts.createSourceFile('component.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found = false;
  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && node.name.getText(sourceFile) === 'style') found = true;
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

describe('hasStyleAttribute', () => {
  it('finds a style attribute however it is spaced', () => {
    expect(hasStyleAttribute('const a = <div style={{ color: "red" }} />;')).toBe(true);
    expect(hasStyleAttribute('const a = <div style = {{ color: "red" }} />;')).toBe(true);
    expect(hasStyleAttribute('const a = <div\n  style={s}\n/>;')).toBe(true);
  });

  it('ignores comments and strings that merely mention it, and non-JSX uses of the word', () => {
    expect(hasStyleAttribute('// never write style={{}} here\nconst a = <div className="x" />;')).toBe(false);
    expect(hasStyleAttribute('const note = "style={{}}"; const a = <div />;')).toBe(false);
    expect(hasStyleAttribute('const style = {}; const a = <Chart contentStyle={style} />;')).toBe(false);
  });
});

describe('no inline styles', () => {
  it('finds the source files it is meant to scan', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(10);
  });

  it('has no style attribute in any component or page', () => {
    const offenders = Object.entries(sources)
      .filter(([file]) => !/\.test\.tsx$/.test(file))
      .filter(([, code]) => hasStyleAttribute(code))
      .map(([file]) => file);
    expect(offenders).toEqual([]);
  });
});
