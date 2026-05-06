const fs = require('fs');
const file = 'C:/Users/akbur/roboatlas/src/pages/FirmaDashboard.tsx';
let c = fs.readFileSync(file, 'utf8');
const lines = c.split('\n');

// Find the line range: starts at "entegratorComments[commentsEntegrator.id].map"
// ends at the closing </div> of the scroll container (after the empty state)
let mapLine = -1, endLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (mapLine < 0 && lines[i].includes('entegratorComments[commentsEntegrator.id].map')) mapLine = i;
  if (mapLine > 0 && lines[i].includes("İlk yorumu siz yapın") ) { endLine = i + 3; break; }
}
console.log('Map at:', mapLine+1, 'End at:', endLine+1);

const newBlock = `            {commentsEntegrator && entegratorComments[commentsEntegrator.id]?.length > 0 ? (() => {
              const allComments = entegratorComments[commentsEntegrator.id];
              const visibleComments = allComments.slice(0, 2);
              const hiddenCount = allComments.length - 2;
              const isMatched = matches.some(m => m.entegratorId === commentsEntegrator?.id);
              const CommentCard = ({ comment, index }: { comment: any; index: number }) => (
                <div key={index} className="p-4 bg-background border rounded-md shadow-sm space-y-3 hover:border-primary/20 transition-colors">
                  <div className="flex flex-wrap gap-3 text-sm">
                    {[{label:'Kalite', val:comment.kalite_puan},{label:'M.\u0130li\u015fki',val:comment.musteri_iliskisi_puan},{label:'S\u00fcre\u00e7',val:comment.surec_yonetimi_puan}].map(({label,val}) => (
                      <div key={label} className="flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-md">
                        <span className="text-xs font-semibold text-primary">{label}</span>
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(s=>(
                          <Star key={s} className={\`h-3 w-3 \${s<=val?'fill-accent text-accent':'text-slate-200'}\`}/>
                        ))}</div>
                      </div>
                    ))}
                  </div>
                  {comment.yorum && <p className="text-sm text-foreground/90 leading-relaxed font-medium mt-2">{comment.yorum}</p>}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3"/>
                    <span>{new Date(comment.created_at).toLocaleDateString('tr-TR',{year:'numeric',month:'long',day:'numeric'})}</span>
                    {comment.author && <><span className="mx-1">\u2022</span><User className="h-3 w-3"/><span>{comment.author}</span></>}
                  </div>
                </div>
              );
              return (
                <>
                  {visibleComments.map((comment, index) => <CommentCard key={index} comment={comment} index={index} />)}
                  {hiddenCount > 0 && !isMatched && (
                    <div className="relative rounded-md overflow-hidden border border-slate-200 min-h-[100px]">
                      <div className="p-4 bg-slate-50 space-y-2 blur-sm select-none pointer-events-none" aria-hidden>
                        <div className="flex gap-2"><div className="h-4 w-20 bg-slate-200 rounded"/><div className="h-4 w-16 bg-slate-200 rounded"/></div>
                        <div className="h-3 w-full bg-slate-200 rounded"/><div className="h-3 w-4/5 bg-slate-200 rounded"/><div className="h-3 w-3/5 bg-slate-200 rounded"/>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 backdrop-blur-[2px]">
                        <Lock className="h-5 w-5 text-primary"/>
                        <p className="text-sm font-medium text-primary text-center px-4">+{hiddenCount} yorumu daha g\u00f6rmek i\u00e7in e\u015fle\u015fme sa\u011flay\u0131n.</p>
                      </div>
                    </div>
                  )}
                  {hiddenCount > 0 && isMatched && allComments.slice(2).map((comment, index) => <CommentCard key={index+2} comment={comment} index={index+2} />)}
                </>
              );
            })() : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <FileText className="h-6 w-6 text-primary/60"/>
                </div>
                <p className="text-muted-foreground font-medium">Hen\u00fcz de\u011ferlendirme yap\u0131lmam\u0131\u015f.</p>
                <p className="text-sm text-muted-foreground/70 mt-1">\u0130lk yorumu siz yap\u0131n!</p>
              </div>
            )}
          </div>`;

// Replace from mapLine-1 (the ternary open) to endLine
const before = lines.slice(0, mapLine - 1);
const after = lines.slice(endLine + 1);
const result = [...before, newBlock, ...after].join('\n');
fs.writeFileSync(file, result, 'utf8');
console.log('Done — comment gating injected. Lines', mapLine, 'to', endLine, 'replaced.');
