import { readFile, readdir, lstat, access } from 'node:fs/promises';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const names = ['business-lead-research', 'business-website-delivery'];
const version = (await readFile(resolve(root, 'version.txt'), 'utf8')).trim();
assert.match(version, /^\d+\.\d+\.\d+$/);
if (process.argv[2]) assert.equal(version, process.argv[2], 'Tag/version mismatch');

async function walk(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory)) {
    const path = resolve(directory, entry);
    const stat = await lstat(path);
    assert(!stat.isSymbolicLink(), `Symlink prohibited: ${path}`);
    if (stat.isDirectory()) result.push(...await walk(path));
    else if (stat.isFile()) result.push(path);
    else assert.fail(`Unsupported file type: ${path}`);
  }
  return result;
}

for (const name of names) {
  const directory = resolve(root, 'skills', name);
  const skill = await readFile(resolve(directory, 'SKILL.md'), 'utf8');
  assert(skill.startsWith('---\n'), `${name}: missing frontmatter`);
  const frontmatter = skill.split('---\n')[1];
  assert(frontmatter.includes(`name: ${name}\n`));
  assert.match(frontmatter, /description: ".+"/);
  assert(frontmatter.includes(`version: "${version}" # x-release-please-version`));
  assert(skill.length < 18000, `${name}: entrypoint too large; use references`);
  const metadata = await readFile(resolve(directory, 'agents/openai.yaml'), 'utf8');
  assert(metadata.includes(`$${name}`), `${name}: missing invocation prompt`);
  assert(metadata.includes('allow_implicit_invocation: true'));
  const description = metadata.match(/short_description: "([^"]+)"/)?.[1] ?? '';
  assert(description.length >= 25 && description.length <= 64);
  assert.equal(await readFile(resolve(directory, 'INSTALL.md'), 'utf8'), await readFile(resolve(root, 'INSTALL.md'), 'utf8'));
  assert.equal(await readFile(resolve(directory, 'LICENSE'), 'utf8'), await readFile(resolve(root, 'LICENSE'), 'utf8'));
  for (const path of await walk(directory)) {
    assert(!/\.(?:zip|pem|key)$/.test(path), `Unexpected artifact: ${path}`);
    if (path.endsWith('.json')) JSON.parse(await readFile(path, 'utf8'));
    if (!path.endsWith('.md')) continue;
    const text = await readFile(path, 'utf8');
    assert(!/\b(?:TODO|FIXME|TBD)\b/.test(text), `${path}: unfinished scaffold`);
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^(?:https?:|#|mailto:)/.test(target)) continue;
      const local = resolve(dirname(path), target.split('#')[0]);
      assert(!relative(directory, local).startsWith(`..${sep}`), `${path}: link escapes portable skill`);
      await access(local);
    }
  }
  console.log(`OK ${name} ${version}`);
}
const config = JSON.parse(await readFile(resolve(root, 'release-please-config.json'), 'utf8'));
assert.deepEqual(config.packages['.']['extra-files'].map((item: { path: string }) => item.path).sort(), names.map(name => `skills/${name}/SKILL.md`).sort());
console.log('OK portable links, metadata, templates and release version markers');
