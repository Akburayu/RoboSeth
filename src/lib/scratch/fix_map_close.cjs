const fs = require('fs');
const file = 'C:/Users/akbur/roboatlas/src/pages/FirmaDashboard.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

// The broken block spans from line 1168 (0-indexed 1167) to line 1268 (0-indexed 1267)
// Line 1168: <div className="flex flex-col gap-3">
// Line 1169: {aiResults.map(({ ... }, idx) => (   <-- map opens with (
// Lines 1170-1267: Card content
// Line 1267: </Card>   <-- map never closes with )) }
// Line 1268: </div>    <-- closes the flex div but map is still open

// The fix: after </Card> we need    ))}    then </div>
// Current lines 1267, 1268 (0-indexed 1266, 1267):
console.log('Current lines 1265-1270 (0-indexed 1264-1269):');
for (let i = 1264; i <= 1270; i++) console.log((i+1)+':', JSON.stringify(lines[i]));

// Replace line 1267 (0-indexed 1266): </Card>  ->  </Card>
// Insert after it: ))} (closing the map callback ) , the .map() call ), and { expression }
// Then line 1268 (0-indexed 1267): </div>  stays as the flex-col wrapper close

// Splice: after index 1266 (</Card>), insert the missing closing characters
lines.splice(1267, 0, '                    ))}');
// Now line 1268 becomes </div> which closes <div className="flex flex-col gap-3">

console.log('\nAfter fix, lines 1265-1272:');
for (let i = 1264; i <= 1272; i++) console.log((i+1)+':', lines[i]);

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('\nDone — inserted missing map closing ))} after </Card>');
