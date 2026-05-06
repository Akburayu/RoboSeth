const fs = require('fs');
const file = 'C:/Users/akbur/roboatlas/src/pages/FirmaDashboard.tsx';
let c = fs.readFileSync(file, 'utf8');
const lines = c.split('\n');

const OLD_START = 1430; // 0-indexed line 1431
const OLD_END   = 1443; // exclusive (covers the 13 old lines)

const ind = '                              ';
const ind2 = ind + '  ';
const ind3 = ind2 + '  ';

const newChunk = [
  ind + "<div className={`relative group/rate ${!isMatched ? 'cursor-not-allowed opacity-60' : ''}`}>",
  ind2 + '{!isMatched && (',
  ind3 + '<div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/rate:block z-50">',
  ind3 + '  <div className="bg-slate-800 text-white text-[11px] rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-lg">',
  ind3 + '    Sadece projeye eklenip e\u015fle\u015filen entegrat\u00f6rler de\u011ferlendirilebilir.',
  ind3 + '  </div>',
  ind3 + '  <div className="flex justify-center">',
  ind3 + '    <span className="border-4 border-transparent border-t-slate-800 block" />',
  ind3 + '  </div>',
  ind3 + '</div>',
  ind2 + ')}',
  ind2 + '<Button',
  ind2 + '  size="sm"',
  ind2 + '  variant="outline"',
  ind2 + '  disabled={!isMatched}',
  ind2 + '  className="h-7 text-[10px] border-slate-200 text-slate-600 hover:bg-slate-50 gap-1 px-2 disabled:pointer-events-none"',
  ind2 + '  onClick={() => openRatingModal(entegrator)}',
  ind2 + '>',
  ind2 + '  <Star className="h-3 w-3" />',
  ind2 + '</Button>',
  ind + '</div>',
];

lines.splice(OLD_START, OLD_END - OLD_START, ...newChunk);
fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Done — tooltip inserted.');
