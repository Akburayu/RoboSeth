const fs = require('fs');
const file = 'C:/Users/akbur/roboatlas/src/pages/FirmaDashboard.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

// Line 1268 (0-indexed: 1267) is the extra </div> that wrapped the old grid
// Context: 1267=</Card>, 1268=</div> (EXTRA), 1269=</div>, 1270=)}
// We need to remove line 1268 (0-indexed 1267)
console.log('Lines around 1265-1272:');
for (let i = 1263; i < 1273; i++) {
  console.log((i+1) + ': ' + lines[i]);
}

// Remove the orphan </div> at line 1268 (0-indexed 1267)
// It should be: lines[1267] === '                    </div>'
// after Card closes at 1266 (</Card>) 
if (lines[1267] && lines[1267].trim() === '</div>') {
  lines.splice(1267, 1);
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log('\nRemoved orphan </div> at line 1268. Done.');
} else {
  console.log('\nLine 1268 content:', JSON.stringify(lines[1267]));
  console.log('Pattern did not match, showing more context...');
  for (let i = 1260; i < 1280; i++) {
    console.log((i+1) + ': ' + lines[i]);
  }
}
