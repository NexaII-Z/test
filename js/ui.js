// Explorer (collapsible, "+" menus) and Properties panel
const open=new Set(),ICON={Workspace:'🌐',Lighting:'💡',Sky:'☁️',StarterGui:'🖼️',ServerScriptService:'📜',ReplicatedStorage:'📦',Part:'🧱',SpawnLocation:'🏁',Terrain:'⛰️',Model:'🧊',Folder:'📁',Script:'📄',LocalScript:'📝',ModuleScript:'🧩',ScreenGui:'🖥️',UnionOperation:'🧊',Frame:'▭',TextLabel:'🅣',TextButton:'🔘'};
const ENUM={Material:Object.keys(MAT),Shape:['Block','Ball','Cylinder'],Font:Object.keys(FONTS),TextXAlignment:['Left','Center','Right'],TextYAlignment:['Top','Center','Bottom'],RunContext:['Legacy','Server','Client'],Mode:['Union','Intersect']};
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const multi=new Set(),clip=[];let multiMode=false;
const tg=i=>multi.has(i)?[...multi]:[i];
function showMenu(it,x,y){const m=$('#menu');m.innerHTML='';it.forEach(([t,f])=>{const d=el('div','',t);d.onclick=()=>{m.classList.add('hide');f()};m.append(d)});m.style.left=Math.min(x,innerWidth-200)+'px';m.style.top=Math.min(y,innerHeight-it.length*38-10)+'px';m.classList.remove('hide')}
function tree(){const e=$('#ex .bd');e.innerHTML='';const w=(i,d)=>{const r=el('div','r'+(multi.has(i)?' s':'')),has=i.K.length>0;r.style.paddingLeft=4+d*14+'px';
const ar=el('span','ar',has?(open.has(i.Id)?'▾':'▸'):'');ar.onclick=ev=>{ev.stopPropagation();open.has(i.Id)?open.delete(i.Id):open.add(i.Id);rt=1};
const pb=el('button','pb','+');pb.onclick=ev=>{ev.stopPropagation();picker(i,ev)};
r.append(ar,el('span','nm',(ICON[i.C]||'▫')+' '+i.Name),pb);r.onclick=ev=>select(i,ev.ctrlKey||ev.metaKey||ev.shiftKey||multiMode);r.oncontextmenu=ev=>{ev.preventDefault();ctx(i,ev.clientX,ev.clientY)};
let tm;r.onpointerdown=ev=>{if(ev.pointerType=='touch'){const x=ev.clientX,y=ev.clientY;tm=setTimeout(()=>ctx(i,x,y),450)}};r.onpointerup=r.onpointercancel=()=>clearTimeout(tm);
e.appendChild(r);if(open.has(i.Id))i.K.forEach(k=>w(k,d+1))};root.K.forEach(k=>w(k,0))}
function picker(par,ev){const m=$('#menu');m.innerHTML='';const q=el('input');q.placeholder='Search objects…';const L=el('div');L.style.cssText='max-height:50vh;overflow:auto';m.append(q,L);
const draw=()=>{L.innerHTML='';for(const c in CAT){const ns=CAT[c].filter(n=>n.toLowerCase().includes(q.value.toLowerCase()));if(!ns.length)continue;L.append(el('div','mh',c));ns.forEach(n=>{const d=el('div','',(ICON[n]||'▫')+' '+n);d.onclick=()=>{m.classList.add('hide');create(n,par)};L.append(d)})}};q.oninput=draw;draw();
m.style.left=Math.max(4,Math.min(ev.clientX,innerWidth-230))+'px';m.style.top=Math.max(4,Math.min(ev.clientY,innerHeight-340))+'px';m.classList.remove('hide')}
function create(c,par){const i=mk(c);if(c=='TextLabel')i.Text='Label';if(c=='TextButton')i.Text='Button';if(PART.includes(c))i.Position=V(Math.round(O.t.x),Math.round(O.t.y)+5,Math.round(O.t.z));i.Parent=par;open.add(par.Id);select(i);return i}
const cp=l=>{clip.length=0;l.forEach(t=>clip.push(ser(t)))},paste=par=>clip.forEach(o=>{const n=deser(o);n.Parent=par;open.add(par.Id);select(n)});
const del=l=>{select(null);l.forEach(t=>{if(!root.K.includes(t))t.Parent=null})};
const dup=l=>l.forEach(t=>{const n=deser(ser(t));if(n.Position?.X!==undefined)n.Position=V(n.Position.X+2,n.Position.Y,n.Position.Z+2);n.Parent=t.Parent;select(n)});
const union=(ps,mode)=>{const f=ps.find(p=>!p.Negative);if(!f)return out('Need at least one non-negated part.');const n=mk('UnionOperation');n.Mode=mode||'Union';n.Name=mode=='Intersect'?'Intersection':'Union';n.Color=f.Color;n.Material=f.Material;n.Parent=ps[0].Parent;ps.forEach(p=>p.Parent=n);buildUnion(n);open.add(n.Id);select(n);out(n.Name+' created: real mesh boolean. Negated parts were subtracted. Collision is voxel-fitted to the result.')};
const neg=ps=>{ps.forEach(p=>p.Negative=!p.Negative);props();out('Negate toggled (red ghost = cutter). Select it with the part to cut, then press Union.')};
const sep=n=>{const par=n.Parent;n.K.slice().forEach(p=>p.Parent=par);n.Parent=null;select(null)};
const weld=ps=>{ps.slice(1).forEach(p=>{const w=mk('WeldConstraint');w.Part0=ps[0];w.Part1=p;w.Parent=ps[0]});open.add(ps[0].Id);out('Welded '+(ps.length-1)+' part(s) to '+ps[0].Name+' (active in Play).')};
function tp(i){const p=i.Position,top=p.Y+ext(i)[1];if(playing&&pl){const q=pl.Position;q.X=p.X;q.Z=p.Z;q.Y=top+2.6;pl.AssemblyLinearVelocity.Y=0}else{tpTo={X:p.X,Y:top+2.6,Z:p.Z};O.t.set(p.X,top,p.Z);out('Next Play will spawn your character on top of '+i.Name+'.')}}
function ctx(i,x,y){if(!multi.has(i))select(i);const ts=tg(i),ps=ts.filter(p=>PART.includes(p.C)),it=[['✂ Cut',()=>{cp(ts);del(ts)}],['⧉ Copy',()=>cp(ts)],['📋 Paste Into',()=>paste(i)],['⧉ Duplicate',()=>dup(ts)],['✏ Rename',()=>{const n=prompt('Name',i.Name);if(n)i.Name=n}],['🗑 Delete',()=>del(ts)],['＋ Insert Object',()=>picker(i,{clientX:x,clientY:y})]];
if(ps.length)it.push(['➖ Negate / Un-negate',()=>neg(ps)]);if(ps.length>1)it.push(['✂ Intersect',()=>union(ps,'Intersect')],['🧊 Union',()=>union(ps)],['🔗 Weld together',()=>weld(ps)]);if(i.C=='UnionOperation')it.push(['↔ Separate',()=>sep(i)]);if(PART.includes(i.C))it.push(['📍 Teleport To',()=>tp(i)]);showMenu(it,x,y)}
function select(i,add){if(add&&i)multi.has(i)?multi.delete(i):multi.add(i);else{multi.clear();if(i)multi.add(i)}sel=(i&&multi.has(i))?i:([...multi].pop()||null);tree();props();document.querySelectorAll('#gui .sel').forEach(e=>e.classList.remove('sel'));multi.forEach(x=>{const g=GD.get(x);if(g)g.classList.add('sel')});
const m=sel&&M.get(sel);box.visible=!!m;if(m)box.setFromObject(m);const sc=sel&&['Script','LocalScript','ModuleScript'].includes(sel.C);$('#ed').style.display=sc?'flex':'none';if(sc)$('#ea').value=sel.Source}
function props(){const p=$('#pr .bd');p.innerHTML='';if(!sel)return;const inp=(t,v)=>{const e=el('input');e.type=t;e.value=v;return e},row=(k,els)=>{const d=el('div','f');d.append(el('label','',k),...els);p.append(d)};
const cn=el('input');cn.value=sel.C;cn.disabled=true;row('ClassName',[cn]);const nm=inp('text',sel.Name);nm.onchange=()=>sel.Name=nm.value;row('Name',[nm]);
for(const k of Object.keys(DEF[sel.C]||{})){const v=sel[k];if(k=='Source')continue;
if(ENUM[k]){const e=el('select');ENUM[k].forEach(o=>{const op=el('option','',o);e.append(op)});e.value=v;e.onchange=()=>sel[k]=e.value;row(k,[e])}
else if(typeof v=='boolean'){const e=inp('checkbox','');e.checked=v;e.onchange=()=>sel[k]=e.checked;row(k,[e])}
else if(typeof v=='object'&&'R' in v){const e=inp('color',hex(v));e.oninput=()=>{const h=e.value;sel[k]=C3(...[1,3,5].map(j=>parseInt(h.substr(j,2),16)/255))};row(k,[e])}
else if(typeof v=='object')row(k,Object.keys(v).map(f=>{const e=inp('number',v[f]);e.step='any';e.onchange=()=>{sel[k]={...sel[k],[f]:+e.value}};return e}));
else{const n=typeof v=='number',e=inp(n?'number':'text',v);if(n)e.step='any';e.onchange=()=>sel[k]=n?+e.value:e.value;row(k,[e])}}}
addEventListener('pointerdown',e=>{if(!e.target.closest('#menu,.pb'))$('#menu').classList.add('hide')});
