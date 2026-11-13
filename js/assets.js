// Plaza assets: uploads (images/audio/models), toolbox, sound engine, ImageLabel ids, Create hub.
(()=>{const C=()=>window.CLOUD,$=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
EXT={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',mp3:'audio/mpeg',ogg:'audio/ogg',oga:'audio/ogg',opus:'audio/ogg',wav:'audio/wav',m4a:'audio/mp4',aac:'audio/aac',flac:'audio/flac',weba:'audio/webm',webm:'audio/webm'},
IDR=/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,ext=n=>String(n).split('.').pop().toLowerCase(),
kindOf=f=>{const m=EXT[ext(f.name)];return m?(m.startsWith('image')?'image':'audio'):null},
id=v=>{const m=IDR.exec(String(v||''));return m?m[1].toLowerCase():''},
url=v=>{const i=id(v);return i&&C()&&C().on?C().U+'/storage/v1/object/public/assets/'+i:''};
// ---- anonymous account (so private assets are really yours) ----
let ses=null;const SK='plaza_auth';
async function token(){const c=C();if(!ses){try{ses=JSON.parse(localStorage.getItem(SK))}catch(e){}}
const post=(p,b)=>fetch(c.U+'/auth/v1/'+p,{method:'POST',headers:{apikey:c.K,'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.ok?r.json():Promise.reject(Error('Sign-in failed. Turn on anonymous sign-ins in Supabase (see SETUP.md).'))),
keep=j=>{ses={at:j.access_token,rt:j.refresh_token,exp:j.expires_at||Math.floor(Date.now()/1000)+3000};try{localStorage.setItem(SK,JSON.stringify(ses))}catch(e){}};
if(ses&&ses.exp>Date.now()/1000+60)return ses.at;
if(ses&&ses.rt){try{keep(await post('token?grant_type=refresh_token',{refresh_token:ses.rt}));return ses.at}catch(e){}}
keep(await post('signup',{}));return ses.at}
const hdr=async x=>({apikey:C().K,Authorization:'Bearer '+await token(),'Content-Type':'application/json',...x}),
me=async()=>JSON.parse(atob((await token()).split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub;
// ---- sounds ----
const A=new Map(),key=i=>i.p||i;
function aud(i){i=key(i);let a=A.get(i);if(!a){a=new Audio();a.preload='auto';a.onended=()=>{if(!i.Looped)i.Playing=false};A.set(i,a)}return a}
function sprop(i,k){i=key(i);const a=aud(i);
const sync=()=>{const u=url(i.SoundId);if(a.getAttribute('src')!==u){u?a.src=u:a.removeAttribute('src')}a.volume=Math.min(1,Math.max(0,+i.Volume||0));a.loop=!!i.Looped;a.playbackRate=Math.max(.25,Math.min(4,+i.PlaybackSpeed||1))};
if(k=='Playing'){if(i.Playing){sync();a.play().catch(()=>{})}else a.pause()}else if(['SoundId','Volume','Looped','PlaybackSpeed'].includes(k))sync()}
const walk=(n,f)=>{f(n);n.K.forEach(k=>walk(k,f))};
// ---- ImageLabel / ImageButton ----
function gimg(i,d){if(i.C!='ImageLabel'&&i.C!='ImageButton')return;const u=url(i.Image);d.style.backgroundImage=u?'url("'+u+'")':'';d.style.backgroundSize=({Fit:'contain',Crop:'cover'})[i.ScaleType]||'100% 100%';d.style.backgroundPosition='center';d.style.backgroundRepeat='no-repeat'}
// ---- cloud API ----
const PZ=window.PZ={id,url,gimg,sprop,
stop(i){const a=A.get(key(i));if(a){a.pause();a.currentTime=0}},stopAll(){A.forEach(a=>{a.pause();a.removeAttribute('src')});A.clear()},
autoplay(r){try{walk(r,n=>{if(n.C=='Sound'&&n.Playing)sprop(n,'Playing')})}catch(e){}},
async upload(it){const c=C(),i=crypto.randomUUID(),body=it.blob||it.file,mime=it.blob?'application/json':(it.file.type||EXT[ext(it.file.name)]||'application/octet-stream'),
r=await fetch(c.U+'/storage/v1/object/assets/'+i,{method:'POST',headers:await hdr({'Content-Type':mime}),body});if(!r.ok)throw Error((await r.text()).slice(0,160));
await c.J0(await fetch(c.R+'assets',{method:'POST',headers:await hdr(),body:JSON.stringify({id:i,name:(it.name||'Untitled').slice(0,60),descr:(it.desc||'').slice(0,240),kind:it.kind,public:!!it.pub,mime,size:body.size})}));return i},
async list({kind,mine,q,limit=40}={}){const c=C();let u=c.R+'assets?select=id,name,descr,kind,public,created_at&order=created_at.desc&limit='+limit;u+=mine?'&owner=eq.'+await me():'&public=eq.true';if(kind)u+='&kind=eq.'+kind;if(q)u+='&name=ilike.*'+encodeURIComponent(q.replace(/[*,()]/g,''))+'*';return fetch(u,{headers:mine?await hdr():c.H()}).then(c.J)},
async setPublic(i,b){const c=C();await c.J0(await fetch(c.R+'assets?id=eq.'+i,{method:'PATCH',headers:await hdr(),body:JSON.stringify({public:b})}))},
async del(i){const c=C();await c.J0(await fetch(c.R+'assets?id=eq.'+i,{method:'DELETE',headers:await hdr()}));fetch(c.U+'/storage/v1/object/assets/'+i,{method:'DELETE',headers:await hdr()}).catch(()=>{})}};
const noCloud='<div class="mpc"><p>Online features are not set up yet. Fill in js/config.js (see SETUP.md).</p></div>',on=()=>C()&&C().on,
ic=a=>a.kind=='image'?`<img src="${url(a.id)}" loading="lazy" alt="">`:`<div class="pv">${a.kind=='audio'?'🎵':'📦'}</div>`;
// ---- toolbox (studio) ----
function pick(a){const ref='plaza://'+a.id,t=typeof sel!='undefined'?sel:null,P=x=>x.p||x;
try{if(a.kind=='model'){fetch(url(a.id)).then(r=>r.json()).then(j=>{const m=deser(j.o);m.Name=a.name||m.Name;m.Parent=svc.Workspace;select(m);out('📦 Inserted '+a.name)}).catch(e=>out('Could not insert: '+e.message))}
else if(a.kind=='image'){if(t&&'Image' in t){P(t).Image=ref;out('🖼 Image set on '+t.Name)}else if(t&&'Texture' in t){P(t).Texture=ref;out('🖼 Texture set on '+t.Name)}
else if(t&&(GUI.includes(t.C)||t.C=='ScreenGui')){const l=mk('ImageLabel');l.Name=a.name;l.Image=ref;l.Parent=t;select(l);out('🖼 Added ImageLabel')}
else{navigator.clipboard&&navigator.clipboard.writeText(ref);out('🖼 Image ID copied: '+ref+'  (select an ImageLabel first to apply it directly)')}}
else{if(t&&t.C=='Sound'){P(t).SoundId=ref;out('🎵 SoundId set on '+t.Name)}else{const s=mk('Sound');s.Name=a.name;s.SoundId=ref;s.Parent=t||svc.Workspace;select(s);out('🎵 Added Sound. Set Playing=true or call :Play()')}}}catch(e){out('Toolbox: '+e.message)}}
function initTB(){const T={k:'model',q:''},box=$('#tbl');let L=[],tm=0,pv=null,loaded=0;
const tile=a=>`<div class="tt" data-i="${a.id}" title="${esc(a.descr||a.name)}">${a.kind=='image'?`<img src="${url(a.id)}" loading="lazy" alt="">`:`<div class="ti">${a.kind=='audio'?'🎵':'📦'}</div>`}<span>${esc(a.name)}</span>${a.kind=='audio'?`<button class="tp" data-p="${a.id}">▶</button>`:''}</div>`;
async function load(){loaded=1;if(!on()){box.innerHTML='<p class="hint">Set up js/config.js to use the toolbox.</p>';return}box.innerHTML='<p class="hint">Loading…</p>';
try{L=await PZ.list(T.k=='mine'?{mine:true,q:T.q}:{kind:T.k,q:T.q});box.innerHTML=L.length?L.map(tile).join(''):'<p class="hint">Nothing here yet. Upload in Create → Upload and set it to Public.</p>'}catch(e){box.innerHTML='<p class="hint">'+esc(e.message||e)+'</p>'}}
$('#tb .tbp').onclick=e=>{const b=e.target.closest('button');if(!b)return;document.querySelectorAll('#tb .tbp button').forEach(x=>x.classList.toggle('on',x==b));T.k=b.dataset.k;load()};
$('#tbq').oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{T.q=e.target.value.trim();load()},350)};
box.onclick=e=>{const p=e.target.closest('[data-p]');if(p){if(pv){pv.pause();pv=null}else{pv=new Audio(url(p.dataset.p));pv.onended=()=>pv=null;pv.play().catch(()=>{})}return}const t=e.target.closest('.tt');if(t){const a=L.find(x=>x.id==t.dataset.i);a&&pick(a)}};
const tg=()=>{const p=$('#tb');p.classList.toggle('hide');if(!p.classList.contains('hide')&&!loaded)load()};
$('#bt').onclick=$('#vt').onclick=tg;if(innerWidth>900){$('#tb').classList.remove('hide');load()}}
// ---- Create hub: subtabs, upload, my assets ----
const UP={items:[],done:0};
function drawRows(){const ul=$('#ul');if(!ul)return;ul.innerHTML=UP.items.map((it,n)=>`<div class="urow" data-n="${n}"><div class="pv">${it.kind=='image'?`<img src="${it.pv}" style="width:100%;height:100%;border-radius:10px;object-fit:cover" alt="">`:it.kind=='audio'?'🎵':'📦'}</div><div class="fl"><input data-f="name" value="${esc(it.name)}" maxlength="60" placeholder="Name" ${it.id?'disabled':''}><input data-f="desc" value="${esc(it.desc)}" maxlength="240" placeholder="Description (optional)" ${it.id?'disabled':''}><div class="r2"><select data-f="pub" ${it.id?'disabled':''}><option value="0">🔒 Private (only me)</option><option value="1" ${it.pub?'selected':''}>🌍 Public (everyone)</option></select>${it.id?'':'<button data-x="1">✕</button>'}</div><small class="st">${it.id?`✅ ID: <code>plaza://${it.id}</code> <button data-c="${it.id}">Copy</button>`:esc(it.st||'')}</small></div></div>`).join('');
$('#upub').classList.toggle('hide',!UP.items.some(x=>!x.id))}
function addFiles(fs){const m=$('#ums');m.textContent='';for(const f of fs){const k=kindOf(f);if(!k){m.textContent='Skipped '+f.name+': unsupported type.';continue}if(f.size>10485760){m.textContent='Skipped '+f.name+': over 10 MB.';continue}UP.items.push({file:f,name:f.name.replace(/\.[^.]+$/,''),desc:'',pub:false,kind:k,pv:k=='image'?URL.createObjectURL(f):''})}drawRows()}
async function publishAll(){const b=$('#upub');b.disabled=true;for(const it of UP.items){if(it.id)continue;it.st='Uploading…';drawRows();try{it.id=await PZ.upload(it)}catch(e){it.st='⚠ '+(e.message||e)}}b.disabled=false;drawRows()}
function upUI(){const el=$('#c-up');if(!on()){el.innerHTML=noCloud;return}if(UP.done)return;UP.done=1;
el.innerHTML=`<div class="drop" id="dz"><div style="font-size:44px">📤</div><p><b>Upload images, sounds and models</b></p><button id="uo" class="pl">📂 Open files</button><p class="hint">Images: PNG, JPG, GIF, WEBP · Audio: MP3, OGG, WAV, M4A, AAC, FLAC, OPUS, WEBM · up to 10 MB each</p><input id="uf" type="file" multiple hidden accept="image/png,image/jpeg,image/gif,image/webp,audio/*,.mp3,.ogg,.oga,.opus,.wav,.m4a,.aac,.flac,.weba,.webm"></div><div id="ul"></div><div class="row" style="margin-top:12px;flex-wrap:wrap"><button id="um">📦 Add selected object as Model</button><button id="upub" class="pl hide">🚀 Publish</button></div><p id="ums" class="hint"></p>`;
const f=$('#uf'),dz=$('#dz'),ul=$('#ul');$('#uo').onclick=()=>f.click();f.onchange=()=>{addFiles([...f.files]);f.value=''};
dz.ondragover=e=>{e.preventDefault();dz.classList.add('over')};dz.ondragleave=()=>dz.classList.remove('over');dz.ondrop=e=>{e.preventDefault();dz.classList.remove('over');addFiles([...e.dataTransfer.files])};
$('#um').onclick=()=>{if(typeof sel=='undefined'||!sel){$('#ums').textContent='Open a template, select an object in the studio, then come back here.';return}UP.items.push({blob:new Blob([JSON.stringify({v:1,o:ser(sel)})],{type:'application/json'}),name:sel.Name,desc:'',pub:false,kind:'model'});drawRows()};
const upd=e=>{const r=e.target.closest('.urow');if(!r)return;const it=UP.items[+r.dataset.n],k=e.target.dataset.f;if(it&&k)it[k]=k=='pub'?e.target.value=='1':e.target.value};ul.oninput=upd;ul.onchange=upd;
ul.onclick=e=>{const r=e.target.closest('.urow');if(!r)return;if(e.target.dataset.x){UP.items.splice(+r.dataset.n,1);drawRows()}if(e.target.dataset.c){navigator.clipboard&&navigator.clipboard.writeText('plaza://'+e.target.dataset.c);e.target.textContent='Copied!'}};
$('#upub').onclick=publishAll}
async function mineUI(){const el=$('#c-mine');if(!on()){el.innerHTML=noCloud;return}el.innerHTML='<p class="hint">Loading…</p>';
try{const l=await PZ.list({mine:true,limit:100});el.innerHTML=l.length?l.map(a=>`<div class="arow" data-i="${a.id}">${a.kind=='image'?`<img class="pv" src="${url(a.id)}" alt="">`:`<div class="pv">${a.kind=='audio'?'🎵':'📦'}</div>`}<div class="nf"><b>${esc(a.name)}</b><small>${a.kind} · ${a.public?'🌍 Public':'🔒 Private'}</small><br><small><code>plaza://${a.id}</code></small></div><button data-c="1">Copy ID</button><button data-v="${a.public?0:1}">${a.public?'Make private':'Make public'}</button><button data-d="1">🗑</button></div>`).join(''):'<p class="hint">Nothing uploaded yet. Use the Upload tab.</p>'}catch(e){el.innerHTML='<p class="hint">'+esc(e.message||e)+'</p>'}
el.onclick=async e=>{const r=e.target.closest('.arow');if(!r)return;const i=r.dataset.i;try{if(e.target.dataset.c){navigator.clipboard&&navigator.clipboard.writeText('plaza://'+i);e.target.textContent='Copied!'}else if(e.target.dataset.v!=null){await PZ.setPublic(i,e.target.dataset.v=='1');mineUI()}else if(e.target.dataset.d&&confirm('Delete this asset? Games using it will lose it.')){await PZ.del(i);mineUI()}}catch(x){alert(x.message||x)}}}
function hub(){const v=$('#template-view');v.querySelectorAll('.subtabs button').forEach(b=>b.onclick=()=>{v.querySelectorAll('.subtabs button').forEach(x=>x.classList.toggle('on',x==b));['tpl','up','mine'].forEach(s=>$('#c-'+s).classList.toggle('hide',s!=b.dataset.s));if(b.dataset.s=='up')upUI();if(b.dataset.s=='mine')mineUI()});
$('#exd').onclick=()=>fetch('examples/Driving-Demo.plaza').then(r=>r.json()).then(o=>{loadRoot(o);menu(false);out('🏎️ Driving Demo loaded.')}).catch(e=>alert('Could not load example: '+e.message))}
hub();initTB()})();
