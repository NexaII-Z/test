// Tiny Supabase REST client (no SDK). Games live in the `games` table; see SETUP.md.
(()=>{const C=window.PLAZA_CLOUD||{},U=(C.url||'').replace(/\/$/,''),K=C.key||'',on=!!(U&&K),T=U+'/rest/v1/games',
H=x=>({apikey:K,...(K.startsWith('eyJ')?{Authorization:'Bearer '+K}:{}),'Content-Type':'application/json',...x}),
J=async r=>{if(!r.ok)throw Error((await r.text()).slice(0,200)||r.status);return r.json()},
shrink=(src,w=480)=>new Promise(res=>{if(!src)return res('');const i=new Image();i.onload=()=>{const c=document.createElement('canvas'),s=Math.min(1,w/i.width);c.width=Math.max(1,i.width*s|0);c.height=Math.max(1,i.height*s|0);c.getContext('2d').drawImage(i,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.7))};i.onerror=()=>res('');i.src=src});
const R=U+'/rest/v1/',J0=async r=>{if(!r.ok)throw Error((await r.text()).slice(0,160)||r.status)},
GQ=(q)=>fetch(R+q,{headers:H()}).then(J);
window.CLOUD={on,U,K,R,H,J,J0,
me:p=>fetch(R+'players',{method:'POST',headers:H({Prefer:'resolution=merge-duplicates'}),body:JSON.stringify({...p,last_seen:new Date().toISOString()})}).then(J0),
async friends(u){const rows=await GQ('friends?select=*&or=(a.eq.'+u+',b.eq.'+u+')'),ids=[...new Set(rows.map(r=>r.a==u?r.b:r.a))],ps=ids.length?await GQ('players?select=uid,name,code,last_seen,game_id,game_title&uid=in.('+ids.join(',')+')'):[],m=Object.fromEntries(ps.map(p=>[p.uid,p])),o={f:[],inc:[],out:[]};
for(const r of rows){const x=r.a==u?r.b:r.a,it={id:r.id,p:m[x]||{uid:x,name:'Player'}};if(r.status=='accepted')o.f.push(it);else if(r.b==u)o.inc.push(it);else o.out.push(it)}return o},
async add(u,code){const t=(await GQ('players?select=uid,name&code=eq.'+encodeURIComponent(String(code).toUpperCase().trim())))[0];if(!t)throw Error('No player with that code.');if(t.uid==u)throw Error('That is your own code.');
const ex=(await GQ('friends?select=*&or=(and(a.eq.'+u+',b.eq.'+t.uid+'),and(a.eq.'+t.uid+',b.eq.'+u+'))'))[0];
if(ex){if(ex.status=='pending'&&ex.b==u){await CLOUD.accept(ex.id);return t}throw Error('Already friends or pending.')}
await J0(await fetch(R+'friends',{method:'POST',headers:H(),body:JSON.stringify({a:u,b:t.uid})}));return t},
accept:id=>fetch(R+'friends?id=eq.'+id,{method:'PATCH',headers:H(),body:JSON.stringify({status:'accepted'})}).then(J0),
remove:id=>fetch(R+'friends?id=eq.'+id,{method:'DELETE',headers:H()}).then(J0),
list:(n=40)=>fetch(T+'?select=id,title,descr,genre,max_players,thumb&order=created_at.desc&limit='+n,{headers:H()}).then(J),
get:id=>fetch(T+'?id=eq.'+encodeURIComponent(id)+'&select=*',{headers:H()}).then(J).then(a=>a[0]),
async put(m){const body={title:m.title,descr:m.desc,genre:m.genre,max_players:m.max,chat:m.chat,multiplayer:m.multiplayer,thumb:await shrink(m.thumb),project:m.project};
if(JSON.stringify(body).length>3.5e6)throw Error('Game is too big (3.5 MB limit).');
return(await J(await fetch(T,{method:'POST',headers:H({Prefer:'return=representation'}),body:JSON.stringify(body)})))[0]}}})();
