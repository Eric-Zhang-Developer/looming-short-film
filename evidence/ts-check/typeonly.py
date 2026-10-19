# Is every change in the working tree's .js/.mjs files a comment or a JSDoc cast's parentheses?
# Removes each `/** @type {..} */ (expr)` cast (comment + its paren pair), then every inline `/** .. */`, then compares
# line by line against the base: only comment-only inserted lines and trailing `// ..` comments may remain.
import re, subprocess, sys, difflib
base = sys.argv[1]
files = subprocess.run(['git', 'diff', '--name-only', base, '--', '*.js', '*.mjs'], capture_output=True, text=True).stdout.split()
CAST = re.compile(r'/\*\*\s*@type\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}\s*\*/\s*\(')
def uncast(s):
    while (m := CAST.search(s)):
        i, depth, q = m.end(), 1, None
        while depth:
            c = s[i]
            if q:
                if c == '\\': i += 1
                elif c == q: q = None
            elif c in '\'"`': q = c
            elif c == '(': depth += 1
            elif c == ')': depth -= 1
            i += 1
        s = s[:m.start()] + s[m.end():i - 1] + s[i:]
    return s
bad = 0
comment = lambda l: l.strip() == '' or l.strip().startswith(('//', '/**', '*', '*/'))
same = lambda o, n: n == o or (n.startswith(o.rstrip()) and re.fullmatch(r'\s*//.*', n[len(o.rstrip()):]))   # + a trailing comment
def ok(old, new):   # a changed chunk: its non-comment lines, pairwise, equal but for a trailing comment
    new = [l for l in new if not comment(l)]; old = [l for l in old if not comment(l)]
    return len(old) == len(new) and all(same(o, n) for o, n in zip(old, new))
strip = lambda s: re.sub(r'/\*\*(?:(?!\*/).)*\*/ ?', '', s).splitlines()   # inline /** .. */ on one line
for f in files:
    src = open(f).read()
    old = subprocess.run(['git', 'show', f'{base}:{f}'], capture_output=True, text=True).stdout.splitlines()
    new, kept = strip(uncast(src)), strip(src)   # kept: a cast that wraps parens already in the base keeps them
    assert len(new) == len(kept)
    for op, a0, a1, b0, b1 in difflib.SequenceMatcher(None, old, new, autojunk=False).get_opcodes():
        if op == 'equal' or ok(old[a0:a1], new[b0:b1]) or ok(old[a0:a1], kept[b0:b1]): continue
        bad += 1; print(f'{f}: {op} old {a0+1}-{a1} new {b0+1}-{b1}'); print('  -', *old[a0:a1], sep='\n  - '); print('  +', *new[b0:b1], sep='\n  + ')
print(f'{len(files)} files checked, {bad} non-type changes')
sys.exit(1 if bad else 0)
