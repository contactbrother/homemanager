"""T071, T079, T080 audits. Run against the source, not by eye."""
import re, pathlib, sys

def lum(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[(x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4) for x in c]
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def ratio(a,b):
    la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)

css = pathlib.Path("app/globals.css").read_text()
tok = dict(re.findall(r'--([a-z-]+):\s*(#[0-9A-Fa-f]{6})', css))
fails=[]

# T071 contrast: text tokens against both surfaces
print("== T071 contrast (WCAG 2.2 AA, FR-053) ==")
pairs=[("ink","ivory",4.5),("ink","surface",4.5),("ink-soft","ivory",4.5),
       ("mute","ivory",4.5),("mute","surface",4.5),("gold-text","ivory",4.5),
       ("gold-text","surface",4.5),("warn","ivory",4.5),("ok","ivory",4.5),
       ("alert","ivory",4.5),("ink","gold",4.5)]
for a,b,need in pairs:
    r=ratio(tok[a],tok[b]); good = r>=need
    if not good: fails.append(f"contrast {a} on {b} = {r:.2f}, needs {need}")
    print(f"  {'PASS' if good else 'FAIL'}  --{a} on --{b}: {r:.2f} (needs {need})")

# --gold must never be used as a text colour
print("\n== T071 --gold used as text? (must be fill only) ==")
bad=[]
for f in pathlib.Path(".").rglob("*.tsx"):
    if "node_modules" in str(f) or ".next" in str(f): continue
    for i,line in enumerate(f.read_text().splitlines(),1):
        if re.search(r'text-\[var\(--gold\)\]', line):
            bad.append(f"{f}:{i}")
print(f"  {'PASS  none' if not bad else 'FAIL  ' + ', '.join(bad)}")
if bad: fails.append("--gold used as text")

# T079 one primary action per route, following imports one level
print("\n== T079 one primary action per screen (SC-008, Principle I) ==")

def resolve(spec, origin):
    if spec.startswith("@/"):
        base = pathlib.Path(spec[2:])
    elif spec.startswith("."):
        base = (origin.parent / spec).resolve().relative_to(pathlib.Path.cwd())
    else:
        return None
    for ext in (".tsx",".ts"):
        c = pathlib.Path(str(base) + ext)
        if c.exists(): return c
    return None

def primary_count(path, seen, dynamic_is_primary=True):
    if path in seen: return 0, []
    seen.add(path)
    src=path.read_text()
    inside_sheet = "<Sheet" in src
    total=0; where=[]
    for m in re.finditer(r'<Button\b[^>]*>', src, re.S):
        tag=m.group(0)
        if 'variant={' in tag:
            # Variant decided by a prop. Whether it is primary depends on what the
            # caller passed, which the recursion below resolves.
            if not dynamic_is_primary: continue
        elif 'variant=' in tag and 'variant="primary"' not in tag:
            continue
        # A Button rendered inside a Sheet is that sheet's own primary, not the screen's.
        before=src[:m.start()]
        if inside_sheet and before.rfind("<Sheet") > before.rfind("</Sheet>"): continue
        total+=1; where.append(path.name)
    for m in re.finditer(r'import\s+\{([^}]*)\}\s+from\s+"([^"]+)"', src):
        target=resolve(m.group(2), path)
        if target and ("features/" in str(target)) and target.suffix==".tsx":
            # Does this file render that component with an explicit outline variant?
            component = target.stem.replace("-"," ").title().replace(" ","")
            usage = re.search(r'<' + component + r'\b[^>]*>', src, re.S)
            passes_outline = bool(usage and 'ariant="outline"' in usage.group(0))
            # An outline decision made higher up carries all the way down.
            t,w=primary_count(
                target, seen,
                dynamic_is_primary=dynamic_is_primary and not passes_outline,
            )
            total+=t; where+=w
    return total, where

routes=sorted(pathlib.Path("app").rglob("page.tsx"))
for r in routes:
    n,where = primary_count(r, set())
    verdict = "PASS" if n==1 else ("FAIL" if n>1 else "none")
    if n>1: fails.append(f"{r} has {n} primary actions: {', '.join(where)}")
    print(f"  {verdict:4}  {r}: {n} ({', '.join(sorted(set(where))) or '-'})")

# T080 "admin" in user-facing copy
print("\n== T080 'admin' in client-facing copy (finding T1) ==")
leaks=[]
for f in list(pathlib.Path("app/(client)").rglob("*.tsx")) + list(pathlib.Path("features").rglob("*.tsx")):
    text=f.read_text()
    for m in re.finditer(r'>([^<>{}]*\badmin\b[^<>{}]*)<', text, re.I):
        leaks.append(f"{f}: {m.group(1).strip()[:60]}")
print(f"  {'PASS  none' if not leaks else 'FAIL'}")
for l in leaks: print("   ", l)
if leaks: fails.append("'admin' in user-facing copy")


# --- T072 keyboard operability, static checks ---
print("\n== T072 keyboard operability (FR-054) ==")
kb=[]
for f in list(pathlib.Path("app").rglob("*.tsx")) + list(pathlib.Path("features").rglob("*.tsx")) + list(pathlib.Path("components").rglob("*.tsx")):
    src=f.read_text()
    # A div or span carrying onClick is not reachable or operable by keyboard.
    for m in re.finditer(r'<(div|span|li)\b[^>]*onClick', src, re.S):
        kb.append(f"{f}: <{m.group(1)}> with onClick and no keyboard equivalent")
    # An input without an associated label
    for m in re.finditer(r'<(input|select|textarea)\b((?:[^>]|\n)*?)/?>', src):
        attrs=m.group(2)
        if 'aria-label' in attrs or 'aria-labelledby' in attrs: continue
        ident=re.search(r'id="([^"]+)"', attrs)
        if ident and f'htmlFor="{ident.group(1)}"' in src: continue
        if 'type="hidden"' in attrs: continue
        kb.append(f"{f}: <{m.group(1)}> with no label")
# The sheet overlay is a click target by design, with Escape and a Close button.
kb=[k for k in kb if "sheet.tsx" not in k]
print(f"  {'PASS  none' if not kb else 'FAIL'}")
for k in kb: print("   ", k)
if kb: fails.append("keyboard operability")

# --- T073 every route segment has loading and error ---
print("\n== T073 empty, loading and error states (SC-009) ==")
missing=[]
for page in sorted(pathlib.Path("app").rglob("page.tsx")):
    seg=page.parent
    group = str(seg)
    if "(auth)" in group or "auth/callback" in group:
        continue  # sign-in screens are static and have no async segment to suspend
    # loading/error may be inherited from an ancestor segment inside the same group
    def inherited(name):
        cur=seg
        while str(cur) != "app" and str(cur) != ".":
            if (cur / name).exists(): return True
            cur = cur.parent
        return False
    for name in ("loading.tsx","error.tsx"):
        if not inherited(name): missing.append(f"{seg} has no {name}")
print(f"  {'PASS  every segment covered' if not missing else 'FAIL'}")
for m in missing: print("   ", m)
if missing: fails.append("missing loading or error segments")

print("\n== final ==")
print("FAILURES:", len(fails))
for f in fails: print("  -", f)
