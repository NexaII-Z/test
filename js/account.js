// Accounts: sign up / log in / stay signed in / settings (username, nickname, log out).
(()=>{const C=window.CLOUD;if(!C)return;
const SK='plaza_auth',PK='plaza_profile',$=s=>document.querySelector(s),
esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
rd=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
wr=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v))}catch(e){}},
cl=t=>{try{return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch(e){return{}}};
let ses=rd(SK);if(ses&&!ses.u){const c=cl(ses.at||'');ses.anon=!!c.is_anonymous;ses.u={id:c.sub,email:c.email||''}}
const isIn=()=>!!(ses&&ses.u&&ses.u.id&&!ses.anon);
const A=window.ACC={on:!!C.on,get loggedIn(){return isIn()},get user(){return ses&&ses.u},profile:rd(PK)};
async function post(p,b,tok){const r=await fetch(C.U+'/auth/v1/'+p,{method:'POST',headers:{apikey:C.K,'Content-Type':'application/json',...(tok?{Authorization:'Bearer '+tok}:{})},body:JSON.stringify(b||{})});let j={};try{j=await r.json()}catch(e){}
if(!r.ok){const e=Error(j.msg||j.error_description||j.message||'Request failed ('+r.status+')');e.status=r.status;throw e}return j}
const keep=j=>{ses={at:j.access_token,rt:j.refresh_token,exp:j.expires_at||Math.floor(Date.now()/1000)+3000,u:{id:j.user&&j.user.id,email:(j.user&&j.user.email)||''},anon:!!(j.user&&j.user.is_anonymous)};wr(SK,ses)};
A.token=async()=>{if(ses&&ses.exp>Date.now()/1000+60)return ses.at;
if(ses&&ses.rt){try{keep(await post('token?grant_type=refresh_token',{refresh_token:ses.rt}));return ses.at}catch(e){if(e.status>=400&&e.status<500){const was=isIn();ses=null;wr(SK,null);if(was){location.reload();throw e}}else throw e}}
keep(await post('signup',{}));return ses.at};
const H=async x=>({apikey:C.K,Authorization:'Bearer '+await A.token(),'Content-Type':'application/json',...x});
A.setProfile=p=>{if(!p)return;A.profile={...p,email:ses.u.email};wr(PK,A.profile);PLY.prof.name=p.nickname;PLY.prof.uid=ses.u.id;PLY.save()};
A.ensureProfile=async()=>{const u=ses.u.id,h=await H();let r=await fetch(C.R+'profiles?select=*&user_id=eq.'+u,{headers:h}).then(C.J);
if(!r.length){const un=rd('plaza_pending')||'';for(let i=0;i<4&&!r.length;i++){const name=(un&&i==0)?un:(un||'Player').slice(0,16)+Math.floor(1000+Math.random()*9000);
const res=await fetch(C.R+'profiles',{method:'POST',headers:await H({Prefer:'return=representation'}),body:JSON.stringify({user_id:u,username:name,nickname:name})});if(res.ok)r=await res.json()}}
wr('plaza_pending',null);if(r[0]&&r[0].banned){alert('This account has been banned.');A.signOut();return}A.setProfile(r[0]);return r[0]};
A.signUp=async(un,email,pw)=>{un=String(un||'').trim();email=String(email||'').trim();
if(!/^[A-Za-z0-9_]{3,20}$/.test(un))throw Error('Username: 3-20 letters, numbers or _');if(!/^\S+@\S+\.\S+$/.test(email))throw Error('Enter a valid email.');if(String(pw||'').length<6)throw Error('Password must be 6+ characters.');
const ex=await fetch(C.R+'profiles?select=user_id&username_lc=eq.'+encodeURIComponent(un.toLowerCase()),{headers:C.H()}).then(C.J);if(ex.length)throw Error('That username is taken.');
const j=await post('signup',{email,password:pw});if(!j.access_token)return{confirm:true};keep(j);wr('plaza_pending',un);await A.ensureProfile();return{ok:true}};
A.signIn=async(email,pw)=>{keep(await post('token?grant_type=password',{email:String(email||'').trim(),password:pw}));await A.ensureProfile()};
A.update=async patch=>{const r=await fetch(C.R+'profiles?user_id=eq.'+ses.u.id,{method:'PATCH',headers:await H({Prefer:'return=representation'}),body:JSON.stringify(patch)});
if(!r.ok){let m=await r.text();try{m=JSON.parse(m).message||m}catch(e){}if(/duplicate key/.test(m))m='That username is taken.';throw Error(m)}
const p=(await r.json())[0];if(!p)throw Error('Could not save.');A.setProfile(p);return p};
A.signOut=()=>{const t=ses&&ses.at;if(t)fetch(C.U+'/auth/v1/logout',{method:'POST',headers:{apikey:C.K,Authorization:'Bearer '+t}}).catch(()=>{});ses=null;wr(SK,null);wr(PK,null);wr('plaza_pending',null);delete PLY.prof.uid;PLY.prof.name='Player';PLY.save();location.reload()};
function change(kind,cb){const un=kind=='username',d=document.createElement('div');d.className='sheet';
d.innerHTML=`<div class="sb"><h2>Change ${un?'username':'nickname'}</h2><p class="hint">You can only change your ${un?'username once a month':'nickname every 3 days'}.</p><input id="cv" maxlength="20" value="${esc(A.profile[kind])}" autocomplete="off" style="width:100%;box-sizing:border-box"><p id="ce" class="hint" style="color:#ff8a8a"></p><div class="row"><button id="cx">Cancel</button><button id="cs" class="pl">Save</button></div></div>`;
document.body.append(d);d.onclick=e=>{if(e.target==d)d.remove()};const e=d.querySelector('#ce');d.querySelector('#cx').onclick=()=>d.remove();
d.querySelector('#cs').onclick=async()=>{const v=d.querySelector('#cv').value.trim();if(un?!/^[A-Za-z0-9_]{3,20}$/.test(v):(v.length<2||v.length>20||/[<>]/.test(v))){e.textContent=un?'3-20 letters, numbers or _':'2-20 characters, no < or >';return}
if(v==A.profile[kind]){d.remove();return}try{await A.update({[kind]:v});d.remove();cb()}catch(x){e.textContent=x.message}}}
A.settings=el=>{const p=A.profile;if(!A.loggedIn||!p){el.innerHTML='<div class="mpc"><p>Accounts are not set up yet (see SETUP.md).</p></div>';return}
const nx=(t,days)=>t?new Date(new Date(t).getTime()+days*864e5):null,u=nx(p.username_changed_at,30),n=nx(p.nickname_changed_at,3),can=x=>!x||x<=new Date(),fmt=x=>x.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
el.innerHTML=`<div class="sec">Account</div><p class="hint">${esc(p.email||'')}</p>
<div class="arow"><div class="nf"><small>Username</small><b>@${esc(p.username)}</b><small>${can(u)?'You can change it now.':'Next change: '+fmt(u)}</small></div><button data-e="username" ${can(u)?'':'disabled'}>Change</button></div>
<div class="arow"><div class="nf"><small>Nickname (shown in games)</small><b>${esc(p.nickname)}</b><small>${can(n)?'You can change it now.':'Next change: '+fmt(n)}</small></div><button data-e="nickname" ${can(n)?'':'disabled'}>Change</button></div>
<div style="margin-top:18px"><button id="alo" class="pl">Log out</button></div>`;
el.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>change(b.dataset.e,()=>A.settings(el)));el.querySelector('#alo').onclick=()=>{if(confirm('Log out of Plaza?'))A.signOut()}};
function gate(){const d=document.createElement('div');d.id='auth';
d.innerHTML='<div class="ac"><div class="logo">PLAZA</div><p class="hint">Create your free account to build, play and make friends.</p><div class="subtabs"><button data-m="up" class="on">Sign up</button><button data-m="in">Log in</button></div><div id="afs"></div><p id="aer" class="hint"></p></div>';
let mode='up';const f=d.querySelector('#afs'),er=d.querySelector('#aer');
const go=async()=>{const g=i=>(f.querySelector(i)||{}).value||'',b=f.querySelector('#ago');b.disabled=true;er.textContent='';
try{if(mode=='up'){const r=await A.signUp(g('#au'),g('#ae'),g('#ap'));if(r.confirm){er.style.color='#9ec1ff';er.textContent='Check your email to confirm your account, then log in.';b.disabled=false;return}}else await A.signIn(g('#ae'),g('#ap'));location.reload()}
catch(e){er.style.color='#ff8a8a';er.textContent=e.message||String(e);b.disabled=false}};
const draw=()=>{f.innerHTML=(mode=='up'?'<input id="au" placeholder="Username" maxlength="20" autocomplete="username">':'')+'<input id="ae" type="email" placeholder="Email" autocomplete="email"><input id="ap" type="password" placeholder="Password (6+ characters)" autocomplete="'+(mode=='up'?'new-password':'current-password')+'"><button id="ago" class="pl big">'+(mode=='up'?'Create account':'Log in')+'</button>';f.querySelector('#ago').onclick=go;er.textContent=''};
f.onkeydown=e=>{if(e.key=='Enter')go()};
d.querySelectorAll('.subtabs button').forEach(b=>b.onclick=()=>{mode=b.dataset.m;d.querySelectorAll('.subtabs button').forEach(x=>x.classList.toggle('on',x==b));draw()});
document.body.append(d);draw()}
if(!window.PLAZA_GAME&&A.on){if(isIn()){PLY.prof.uid=ses.u.id;if(A.profile&&A.profile.nickname)PLY.prof.name=A.profile.nickname;PLY.save();A.ensureProfile().catch(()=>{})}else gate()}
})();
