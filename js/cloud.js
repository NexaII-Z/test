// Tiny Supabase REST client (no SDK). Games live in the `games` table; see SETUP.md.
(()=>{const C=window.PLAZA_CLOUD||{},U=(C.url||'').replace(/\/$/,''),K=C.key||'',on=!!(U&&K),T=U+'/rest/v1/games',
H=x=>({apikey:K,...(K.startsWith('eyJ')?{Authorization:'Bearer '+K}:{}),'Content-Type':'application/json',...x}),
J=async r=>{if(!r.ok)throw Error((await r.text()).slice(0,200)||r.status);return r.json()},
shrink=(src,w=480)=>new Promise(res=>{if(!src)return res('');const i=new Image();i.onload=()=>{const c=document.createElement('canvas'),s=Math.min(1,w/i.width);c.width=Math.max(1,i.width*s|0);c.height=Math.max(1,i.height*s|0);c.getContext('2d').drawImage(i,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.7))};i.onerror=()=>res('');i.src=src});
const R=U+'/rest/v1/',J0=async r=>{if(!r.ok)throw Error((await r.text()).slice(0,160)||r.status)},
GQ=(q)=>fetch(R+q,{headers:H()}).then(J);
const ins=async b=>{try{return(await J(await fetch(T,{method:'POST',headers:H({Prefer:'return=representation'}),body:JSON.stringify(b)})))[0]}catch(e){if(/icon|creator/.test(String(e.message)))throw Error('Your database needs the update. Run SETUP_UPDATE.sql in Supabase (see SETUP.md), then publish again.');throw e}},
iso=ms=>encodeURIComponent(new Date(Date.now()-ms).toISOString()),
lv=(g,v,t)=>fetch(R+'game_live',{method:'POST',headers:H({Prefer:'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify({game_id:g,voter:v,seen:t}),keepalive:true}).catch(()=>{});
window.CLOUD={ins,on,U,K,R,H,J,J0,
me:p=>fetch(R+'players',{method:'POST',headers:H({Prefer:'resolution=merge-duplicates'}),body:JSON.stringify({...p,last_seen:new Date().toISOString()})}).then(J0),
async friends(u){const rows=await GQ('friends?select=*&or=(a.eq.'+u+',b.eq.'+u+')'),ids=[...new Set(rows.map(r=>r.a==u?r.b:r.a))],ps=ids.length?await GQ('players?select=uid,name,code,last_seen,game_id,game_title&uid=in.('+ids.join(',')+')'):[],m=Object.fromEntries(ps.map(p=>[p.uid,p])),o={f:[],inc:[],out:[]};
for(const r of rows){const x=r.a==u?r.b:r.a,it={id:r.id,p:m[x]||{uid:x,name:'Player'}};if(r.status=='accepted')o.f.push(it);else if(r.b==u)o.inc.push(it);else o.out.push(it)}return o},
async add(u,code){const t=(await GQ('players?select=uid,name&code=eq.'+encodeURIComponent(String(code).toUpperCase().trim())))[0];if(!t)throw Error('No player with that code.');if(t.uid==u)throw Error('That is your own code.');
const ex=(await GQ('friends?select=*&or=(and(a.eq.'+u+',b.eq.'+t.uid+'),and(a.eq.'+t.uid+',b.eq.'+u+'))'))[0];
if(ex){if(ex.status=='pending'&&ex.b==u){await CLOUD.accept(ex.id);return t}throw Error('Already friends or pending.')}
await J0(await fetch(R+'friends',{method:'POST',headers:H(),body:JSON.stringify({a:u,b:t.uid})}));return t},
accept:id=>fetch(R+'friends?id=eq.'+id,{method:'PATCH',headers:H(),body:JSON.stringify({status:'accepted'})}).then(J0),
remove:id=>fetch(R+'friends?id=eq.'+id,{method:'DELETE',headers:H()}).then(J0),
async list(n=40){const q=c=>fetch(T+'?select='+c+'&order=created_at.desc&limit='+n,{headers:H()}).then(J);try{return await q('id,title,descr,genre,max_players,thumb,icon,creator')}catch(e){return await q('id,title,descr,genre,max_players,thumb')}},
stat:id=>GQ('game_stats?game_id=eq.'+id+'&select=avg,votes').then(a=>a[0]?{avg:+a[0].avg,votes:+a[0].votes}:null),
async stats(){const m={};(await GQ('game_stats?select=game_id,avg,votes')).forEach(r=>m[r.game_id]={avg:+r.avg,votes:+r.votes});return m},
myRate:(g,v)=>GQ('game_ratings?game_id=eq.'+g+'&voter=eq.'+encodeURIComponent(v)+'&select=stars').then(a=>a[0]?+a[0].stars:0),
rate:(g,v,n)=>fetch(R+'game_ratings',{method:'POST',headers:H({Prefer:'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify({game_id:g,voter:v,stars:n})}).then(J0),
ping:(g,v)=>lv(g,v,new Date().toISOString()),unping:(g,v)=>lv(g,v,'2000-01-01T00:00:00Z'),
live:async g=>(await GQ('game_live?game_id=eq.'+g+'&seen=gte.'+iso(55000)+'&select=voter')).length,
async liveAll(){const m={};(await GQ('game_live?seen=gte.'+iso(55000)+'&select=game_id')).forEach(r=>m[r.game_id]=(m[r.game_id]||0)+1);return m},
get:id=>fetch(T+'?id=eq.'+encodeURIComponent(id)+'&select=*',{headers:H()}).then(J).then(a=>a[0]),
async put(m){const body={title:m.title,descr:m.desc,genre:m.genre,max_players:m.max,chat:m.chat,multiplayer:m.multiplayer,thumb:m.thumb||'',icon:m.icon||'',creator:m.creator||'',project:m.project};
if(JSON.stringify(body).length>3.5e6)throw Error('Game is too big (3.5 MB limit).');
return await ins(body)}}})();
