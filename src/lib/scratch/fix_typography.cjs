const fs = require('fs');
const file = 'C:/Users/akbur/roboatlas/src/pages/FirmaDashboard.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Lines 1210-1220 (0-indexed 1209-1219) — the Uyum Kriterleri box
// Replace just these class strings
let changed = 0;
for (let i = 1208; i <= 1221; i++) {
  const l = lines[i];
  if (l.includes('bg-slate-50 border border-slate-200 rounded-sm p-2.5 mb-3')) {
    lines[i] = l.replace('p-2.5 mb-3', 'p-3 mb-3');
    changed++;
    console.log('Fixed padding at line', i+1);
  }
  if (l.includes('text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest mb-1.5')) {
    lines[i] = l.replace(
      'text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest mb-1.5',
      'text-sm font-semibold text-slate-700 tracking-wide mb-2'
    );
    changed++;
    console.log('Fixed title at line', i+1);
  }
  if (l.includes('space-y-0.5')) {
    lines[i] = l.replace('space-y-0.5', 'space-y-1.5');
    changed++;
    console.log('Fixed space-y at line', i+1);
  }
  if (l.includes('text-[10px] font-mono text-slate-600 leading-relaxed')) {
    lines[i] = l.replace(
      'text-[10px] font-mono text-slate-600 leading-relaxed',
      'text-[13px] font-mono text-slate-700 leading-relaxed'
    );
    changed++;
    console.log('Fixed list item text at line', i+1);
  }
  if (l.includes('"h-3 w-3 text-primary/50 mt-0.5 shrink-0"')) {
    lines[i] = l.replace('"h-3 w-3 text-primary/50 mt-0.5 shrink-0"', '"h-3.5 w-3.5 text-primary/50 mt-0.5 shrink-0"');
    changed++;
    console.log('Fixed chevron size at line', i+1);
  }
}
console.log('Total changes:', changed);
fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Done.');
