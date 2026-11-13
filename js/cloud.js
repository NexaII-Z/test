// Tiny Supabase REST client (no SDK). Games live in the `games` table; see SETUP.md.
(()=>{const C=window.PLAZA_CLOUD||{},U=(C.url||'').replace(/\/$/,''),K=C.key||'',on=!!(U&&K),T=U+'/rest/v1/games',
H=x=>({apikey:K,...(K.startsWith('eyJ')?{Authorization:'Bearer '+K}:{}),'Content-Type':'application/json',...x}),
J=async r=>{if(!r.ok)throw Error((await r.text()).slice(0,200)||r.status);return r.json()},
shrink=(src,w=480)=>new Promise(res=>{if(!src)return res('');const i=new Image();i.onload=()=>{const c=document.createElement('canvas'),s=Math.min(1,w/i.width);c.width=Math.max(1,i.width*s|0);c.height=Math.max(1,i.height*s|0);c.getContext('2d').drawImage(i,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.7))};i.onerror=()=>res('');i.src=src});
window.CLOUD={on,
list:(n=40)=>fetch(T+'?select=id,title,descr,genre,max_players,thumb&order=created_at.desc&limit='+n,{headers:H()}).then(J),
get:id=>fetch(T+'?id=eq.'+encodeURIComponent(id)+'&select=*',{headers:H()}).then(J).then(a=>a[0]),
async put(m){const body={title:m.title,descr:m.desc,genre:m.genre,max_players:m.max,chat:m.chat,multiplayer:m.multiplayer,thumb:await shrink(m.thumb),project:m.project};
if(JSON.stringify(body).length>3.5e6)throw Error('Game is too big (3.5 MB limit).');
return(await J(await fetch(T,{method:'POST',headers:H({Prefer:'return=representation'}),body:JSON.stringify(body)})))[0]}}})();
