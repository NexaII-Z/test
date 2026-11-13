// Player runtime: avatar in Play, chat + swear filter, and serverless WebRTC multiplayer.
// Multiplayer uses Trystero (peers find each other through public BitTorrent trackers, then talk
// directly browser-to-browser over WebRTC) so a plain static site can host a multiplayer game.
(()=>{const KEY='plaza.profile.v1',TH=THREE,EM=['','wave','dance','cheer'],rcode=()=>Math.random().toString(36).slice(2,7).toUpperCase();
const base=()=>({name:'Player'+(1000+Math.floor(Math.random()*9000)),av:AV.def(),mp:false,room:rcode()});
function load(){try{const p=JSON.parse(localStorage.getItem(KEY));if(p&&p.av)return{...base(),...p,av:AV.clean(p.av)}}catch(e){}return base()}
// ---- swear filter: leetspeak, repeated letters and f.u.c.k-style separators are normalised; hits become ####
const BAD='fuck shit bitch asshole bastard cunt dick cock pussy slut whore nigger nigga fag faggot retard twat wank bollocks motherfucker bullshit dumbass jackass'.split(' '),
RES=BAD.map(w=>new RegExp(w.split('').map(c=>c+'+').join(''))),LT={0:'o',1:'i',3:'e',4:'a',5:'s',7:'t',8:'b','@':'a','$':'s','!':'i','+':'t'},
WL=/^(peacock|cockpit|cocktail|cockatoo|cockatiel|cockney|shiitake|dickens|scunthorpe|hancock|babcock|bassist)$/;
const norm=w=>w.toLowerCase().replace(/[0-9@$!+]/g,c=>LT[c]).replace(/[^a-z]/g,''),bad=w=>{const n=norm(w);return!WL.test(n)&&RES.some(r=>r.test(n))};
const clean=t=>String(t).replace(/\S+/g,w=>bad(w)?'#'.repeat(w.length):w);
let me=null,net=null,tok=0,last=0,emote='',et=0,lastChat=0;const peers=new Map,vp=()=>$('#vp');
function spr(text,fs){const c=document.createElement('canvas'),x=c.getContext('2d'),f=`700 ${fs}px Outfit,system-ui,sans-serif`;x.font=f;const w=Math.ceil(x.measureText(text).width)+30,h=fs+22;c.width=w;c.height=h;x.font=f;x.fillStyle='rgba(10,12,28,.74)';x.beginPath();x.roundRect?x.roundRect(0,0,w,h,h/2):x.rect(0,0,w,h);x.fill();x.fillStyle='#fff';x.textBaseline='middle';x.fillText(text,15,h/2+1);
const s=new TH.Sprite(new TH.SpriteMaterial({map:new TH.CanvasTexture(c),depthTest:false,transparent:true}));s.scale.set(w/h*.9,.9,1);s.renderOrder=9;return s}
function bubble(a,t){if(a.bub){a.g.remove(a.bub);a.bub.material.map.dispose()}t=t.length>46?t.slice(0,44)+'…':t;a.bub=spr(t,30);a.bub.position.y=7.1;a.bub.exp=performance.now()+5000;a.g.add(a.bub)}
function actor(n,cfg){const av=AV.make(cfg),tag=spr(n,28);tag.position.y=6.2;av.g.add(tag);scene.add(av.g);return{av,g:av.g,name:n,tp:new TH.Vector3(),ty:0,sp:0,air:false,em:'',first:1}}
function drop(id){const a=peers.get(id);if(!a)return;sys(a.name+' left the game');scene.remove(a.g);AV.dispose(a.g);peers.delete(id);count()}
const count=()=>{const e=$('#pc');if(e)e.textContent='👥 '+(peers.size+1)+(net&&!(window.PLAZA_GAME&&PLAZA_GAME.room)?' · '+P.prof.room:'')};
function say(n,t,mine){const d=document.createElement('div'),b=document.createElement('b');let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))%360;b.style.color=`hsl(${h},85%,72%)`;b.textContent=n+': ';d.append(b,document.createTextNode(t));if(mine)d.style.background='#2b2478aa';const l=$('#cl');l.append(d);while(l.children.length>40)l.firstChild.remove();l.scrollTop=1e9}
function sys(t){const d=document.createElement('div');d.className='sys';d.textContent=t;const l=$('#cl');l.append(d);l.scrollTop=1e9}
function doEmote(e){if(!EM.includes(e)||!e)return sys('Emotes: /e wave · /e dance · /e cheer');emote=e;et=performance.now()}
function submit(){const i=$('#ci');let t=i.value.trim();i.value='';if(!t)return;const now=performance.now();if(now-lastChat<800)return sys('Slow down a little!');lastChat=now;
if(t[0]=='/'){const m=t.match(/^\/e(?:mote)?\s+(\w+)/i);return m?doEmote(m[1].toLowerCase()):sys('Commands: /e wave|dance|cheer')}
t=clean(t.slice(0,120));say(P.prof.name,t,true);me&&bubble(me,t);net&&net.sC(t)}
async function join(t){const G=window.PLAZA_GAME||{},code=(G.room||P.prof.room||'LOBBY').toUpperCase(),max=G.max||16;
try{const m=await import('https://cdn.jsdelivr.net/npm/trystero@0.21.5/+esm');if(t!==tok)return;const room=m.joinRoom({appId:'plaza-studio-v1'},'r-'+code),[sS,gS]=room.makeAction('st'),[sH,gH]=room.makeAction('hi'),[sC,gC]=room.makeAction('ch');
net={room,sS,sC};room.onPeerJoin(id=>sH({n:P.prof.name,a:P.prof.av},id));room.onPeerLeave(drop);
gH((d,id)=>{if(!d||typeof d.n!='string'||peers.has(id)||peers.size>=max-1)return;const a=actor(clean(d.n.slice(0,20))||'Player',AV.clean(d.a));peers.set(id,a);sys(a.name+' joined');count()});
gS((d,id)=>{const a=peers.get(id);if(!a||!Array.isArray(d))return;a.tp.set(+d[0]||0,(+d[1]||0)-2.5,+d[2]||0);a.ty=+d[3]||0;a.sp=+d[4]||0;a.air=!!d[5];a.em=EM[d[6]]||'';if(a.first){a.g.position.copy(a.tp);a.first=0}});
gC((txt,id)=>{const a=peers.get(id);if(!a||typeof txt!='string')return;txt=clean(txt.slice(0,120));say(a.name,txt);bubble(a,txt)});
sys(G.room?'🌐 Connected! Other players of this game will show up here.':'🌐 Connected to room '+code+'. Share the code or invite link so friends can join!');count()}
catch(e){sys('Multiplayer unavailable ('+(e.message||e)+'). Playing solo.')}}
const r2=v=>Math.round(v*100)/100;
const P=window.PLY={prof:load(),clean,save(){try{localStorage.setItem(KEY,JSON.stringify(P.prof))}catch(e){}},
start(){tok++;const G=window.PLAZA_GAME||{};document.body.classList.add('playing');document.body.classList.toggle('nochat',G.chat===false);me=AV.make(P.prof.av);me.bub=null;scene.add(me.g);$('#cl').innerHTML='';
sys('Welcome, '+P.prof.name+'! Enter = chat · /e wave, /e dance, /e cheer');if(!G.solo&&(P.prof.mp||G.room))join(tok);else sys(G.title?'Solo game.':'Solo mode. Turn on 🌐 Multiplayer (Test tab) to play with friends.');count()},
stop(){tok++;document.body.classList.remove('playing');if(me){scene.remove(me.g);AV.dispose(me.g);me=null}peers.forEach(a=>{scene.remove(a.g);AV.dispose(a.g)});peers.clear();if(net){try{net.room.leave()}catch(e){}net=null}},
frame(dt,fy){if(!me)return;const p=pl.Position,v=pl.AssemblyLinearVelocity,sp=Math.hypot(v.X,v.Z),air=!pl.ground;me.g.visible=p.Y>-400;me.g.position.set(p.X,p.Y-2.5,p.Z);me.g.rotation.y=fy;
if(emote&&(sp>1.5||air))emote='';me.upd(dt,sp,air,emote);
if(me.bub&&performance.now()>me.bub.exp){me.g.remove(me.bub);me.bub=null}
const now=performance.now();if(net&&now-last>100){last=now;net.sS([r2(p.X),r2(p.Y),r2(p.Z),r2(fy),r2(sp),air?1:0,EM.indexOf(emote)])}
for(const a of peers.values()){a.g.position.lerp(a.tp,Math.min(1,dt*10));let d=a.ty-a.g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));a.g.rotation.y+=d*Math.min(1,dt*10);a.av.upd(dt,a.sp,a.air,a.em);if(a.bub&&now>a.bub.exp){a.g.remove(a.bub);a.bub=null}}}};
$('#cs').onclick=submit;$('#ci').onkeydown=e=>{if(e.key=='Enter')submit();if(e.key=='Escape')e.target.blur()};document.querySelectorAll('#em button').forEach(b=>b.onclick=()=>doEmote(b.dataset.e));
addEventListener('keydown',e=>{if(!playing||e.target.tagName=='INPUT')return;if(e.code=='Enter'||e.key=='/'){const i=$('#ci');i.focus();if(e.key=='/')i.value='/';e.preventDefault()}});
})();
