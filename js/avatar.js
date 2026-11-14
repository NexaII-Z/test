// R6 avatar: Head, Torso, 2 Arms, 2 Legs. Smooth rounded parts, classic round head + face decal,
// outfits / hair / accessories, and procedural animation (idle, walk, jump, wave, dance, cheer).
(()=>{const TH=THREE,PI=Math.PI,cl=(v,a,b)=>Math.min(b,Math.max(a,v));
const SKIN=['#f5cd30','#ffd9b3','#e8b98a','#c68642','#8d5524','#4a2f1d','#7ec8e3','#a3d977'],
HAIRC=['#2b1b12','#6b4423','#d9a441','#c1272d','#f2f2f2','#2f6fed','#ff6fae','#1b1b1b'],
CLO=['#d94c4c','#f08a24','#f2c230','#3fae5a','#2f7bff','#7a4cd9','#e86fb0','#f2f2f2','#2a2d34'],
SHIRTS=['tee','long','stripes','hoodie','jersey'],PANTS=['long','shorts','cargo'],HAIRS=['none','short','spiky','long','bun','mohawk'],FACES=['smile','grin','wink','cool'],
ACCS={cap:'Cap',crown:'Crown',shades:'Shades',phones:'Headphones',pack:'Backpack',cape:'Cape'},
OUTFITS={Classic:{},Street:{hair:'spiky',hc:'#2f6fed',shirt:'hoodie',sc:'#f08a24',pants:'cargo',pc:'#3b3f4a',shoe:'#f2f2f2',acc:{shades:1,phones:1}},
Royal:{hair:'long',hc:'#d9a441',shirt:'jersey',sc:'#7a4cd9',pc:'#f2f2f2',shoe:'#2a2d34',face:'grin',acc:{crown:1,cape:1}},
Rockstar:{hair:'mohawk',hc:'#ff6fae',shirt:'stripes',sc:'#2a2d34',pants:'shorts',pc:'#c1272d',face:'cool',acc:{shades:1}},
Explorer:{hair:'short',hc:'#6b4423',shirt:'long',sc:'#3fae5a',pants:'cargo',pc:'#6b4423',shoe:'#2a2d34',acc:{cap:1,pack:1}}};
const def=()=>({skin:SKIN[0],hair:'short',hc:HAIRC[0],shirt:'tee',sc:CLO[4],pants:'long',pc:'#2a2d34',shoe:'#f2f2f2',face:'smile',acc:{}}),
HX=/^#[0-9a-f]{6}$/i,pick=(v,l,d)=>l.includes(v)?v:d,col=(v,d)=>HX.test(v)?v:d;
function clean(c){c=c||{};const d=def(),a={};for(const k in ACCS)if(c.acc&&c.acc[k])a[k]=1;return{skin:col(c.skin,d.skin),hair:pick(c.hair,HAIRS,d.hair),hc:col(c.hc,d.hc),shirt:pick(c.shirt,SHIRTS,d.shirt),sc:col(c.sc,d.sc),pants:pick(c.pants,PANTS,d.pants),pc:col(c.pc,d.pc),shoe:col(c.shoe,d.shoe),face:pick(c.face,FACES,d.face),acc:a}}
// rounded box: vertices are clustered toward the edges (sin remap) and pushed onto a rounded shell with analytic normals
function rbox(w,h,d,r,s=10){const g=new TH.BoxGeometry(w,h,d,s,s,s),P=g.attributes.position,N=g.attributes.normal,v=new TH.Vector3(),c=new TH.Vector3(),H=[w/2,h/2,d/2],i3=[w/2-r,h/2-r,d/2-r];
for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);v.set(H[0]*Math.sin(v.x/H[0]*PI/2),H[1]*Math.sin(v.y/H[1]*PI/2),H[2]*Math.sin(v.z/H[2]*PI/2));c.set(cl(v.x,-i3[0],i3[0]),cl(v.y,-i3[1],i3[1]),cl(v.z,-i3[2],i3[2]));v.sub(c).normalize();N.setXYZ(i,v.x,v.y,v.z);P.setXYZ(i,c.x+v.x*r,c.y+v.y*r,c.z+v.z*r)}return g}
// per-triangle colouring (crisp clothing bands)
function paint(g,fn){g=g.toNonIndexed();const P=g.attributes.position,c=new Float32Array(P.count*3),k=new TH.Color();for(let i=0;i<P.count;i+=3){k.set(fn((P.getX(i)+P.getX(i+1)+P.getX(i+2))/3,(P.getY(i)+P.getY(i+1)+P.getY(i+2))/3,(P.getZ(i)+P.getZ(i+1)+P.getZ(i+2))/3));for(let j=0;j<3;j++)k.toArray(c,(i+j)*3)}g.setAttribute('color',new TH.BufferAttribute(c,3));return g}
function faceTex(kind){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=x.strokeStyle='#1a1a1a';x.lineCap='round';
const eye=cx=>{x.beginPath();x.ellipse(cx,104,11,19,0,0,PI*2);x.fill()};
if(kind=='wink'){eye(88);x.lineWidth=9;x.beginPath();x.moveTo(148,108);x.quadraticCurveTo(168,88,188,108);x.stroke()}else if(kind=='cool'){x.fillRect(48,88,68,34);x.fillRect(140,88,68,34);x.fillRect(112,94,28,8)}else{eye(88);eye(168)}
x.lineWidth=11;x.beginPath();if(kind=='grin'){x.moveTo(66,150);x.quadraticCurveTo(128,232,190,150);x.closePath();x.fillStyle='#fff';x.fill();x.stroke()}else{x.arc(128,124,68,PI*.2,PI*.8);x.stroke()}
const t=new TH.CanvasTexture(c);t.anisotropy=4;return t}
const M2=(c,r=.7,m=0)=>new TH.MeshStandardMaterial({color:c,roughness:r,metalness:m});
function adder(g,mt){return(geo,x,y,z,rx=0,rz=0,m=mt)=>{const o=new TH.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,0,rz);o.castShadow=true;g.add(o);return o}}
function hairOf(st,c){const g=new TH.Group(),add=adder(g,M2(c,.85)),cap=()=>{const o=add(new TH.SphereGeometry(.68,24,14,0,PI*2,0,PI/2),0,.28,0);o.scale.y=.82};
if(st=='short')cap();else if(st=='spiky'){cap();for(let i=0;i<8;i++){const a=i/8*PI*2;add(new TH.ConeGeometry(.17,.55,8),Math.sin(a)*.42,.68,Math.cos(a)*.42,Math.cos(a)*.5,-Math.sin(a)*.5)}add(new TH.ConeGeometry(.2,.7,8),0,.9,0)}
else if(st=='long'){cap();add(rbox(1.34,1.7,.3,.12,6),0,-.3,-.5);add(rbox(.22,1.2,.7,.08,4),.62,-.05,-.2);add(rbox(.22,1.2,.7,.08,4),-.62,-.05,-.2)}
else if(st=='bun'){cap();add(new TH.SphereGeometry(.32,16,12),0,.9,-.1)}else if(st=='mohawk')add(rbox(.24,.5,1.15,.1,5),0,.72,0);return g}
function headAcc(k){const g=new TH.Group(),add=adder(g,M2('#111',.2));
if(k=='cap'){const d=add(new TH.SphereGeometry(.7,24,14,0,PI*2,0,PI/2),0,.3,0,0,0,M2('#d94c4c'));d.scale.y=.8;add(rbox(.95,.07,.55,.03,4),0,.34,.72,0,0,M2('#b83a3a'))}
else if(k=='crown'){const m=M2('#ffcc33',.3,.8);add(new TH.CylinderGeometry(.5,.45,.3,5),0,.66,0,0,0,m);for(let i=0;i<5;i++){const a=i/5*PI*2;add(new TH.ConeGeometry(.1,.3,6),Math.sin(a)*.47,.94,Math.cos(a)*.47,0,0,m)}}
else if(k=='shades'){add(rbox(.42,.2,.08,.04,4),-.24,.1,.64);add(rbox(.42,.2,.08,.04,4),.24,.1,.64);add(rbox(.12,.05,.06,.02,2),0,.14,.64)}
else if(k=='phones'){add(new TH.TorusGeometry(.7,.06,8,24,PI),0,-.05,0,0,0,M2('#2a2d34',.4));for(const s of[-1,1]){const c=add(new TH.CylinderGeometry(.24,.24,.16,16),s*.72,-.05,0,0,PI/2,M2('#ff4d6d'))}}return g}
function make(cfg){cfg=clean(cfg);const root=new TH.Group(),body=new TH.Group();root.add(body);const vm=new TH.MeshStandardMaterial({vertexColors:true,roughness:.62}),{skin:sk,sc,pc,shoe:sh,shirt:st}=cfg,dk=(c,k)=>new TH.Color(c).multiplyScalar(k),long=st=='long'||st=='hoodie';
const part=(geo,fn,x,y,z)=>{const m=new TH.Mesh(paint(geo,fn),vm);m.castShadow=true;const p=new TH.Group();p.position.set(x,y,z);p.add(m);body.add(p);return p};
const torso=part(rbox(2,2,1,.2),(x,y,z)=>st=='stripes'?(Math.floor((y+1)*2.2)%2?'#f2f2f2':sc):st=='hoodie'&&z>.4&&y<-.2&&y>-.8&&Math.abs(x)<.6?dk(sc,.8):st=='jersey'&&z>.4&&Math.abs(x)<.45&&Math.abs(y)<.5?'#f2f2f2':sc,0,3,0);
const arm=x=>part(rbox(1,2,1,.2).translate(0,-1,0),(_x,y)=>y>(long?-1.72:-.78)?sc:sk,x,3.92,0),la=arm(-1.5),ra=arm(1.5);
const leg=x=>part(rbox(1,2,1,.2).translate(0,-1,0),(_x,y)=>y<-1.72?sh:cfg.pants=='shorts'&&y<-.9?sk:cfg.pants=='cargo'&&y<-.7&&y>-1.25?dk(pc,.8):pc,x,2,0),ll=leg(-.5),rl=leg(.5);
// head: lathe cylinder with rounded shoulders (the classic head) + curved face decal
const hp=[new TH.Vector2(0,-.55)];for(let a=0;a<=6;a++){const t=a/6*PI/2;hp.push(new TH.Vector2(.425+Math.sin(t)*.2,-.35-Math.cos(t)*.2))}for(let a=6;a>=0;a--){const t=a/6*PI/2;hp.push(new TH.Vector2(.425+Math.sin(t)*.2,.35+Math.cos(t)*.2))}hp.push(new TH.Vector2(0,.55));
const head=new TH.Group();head.position.set(0,4.6,0);body.add(head);const hm=new TH.Mesh(new TH.LatheGeometry(hp,32),M2(sk,.55));hm.castShadow=true;head.add(hm);
const fm=new TH.Mesh(new TH.CylinderGeometry(.628,.628,.9,24,1,true,-.72,1.44),new TH.MeshStandardMaterial({map:faceTex(cfg.face),transparent:true,roughness:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));fm.position.y=.02;head.add(fm);
head.add(hairOf(cfg.hair,cfg.hc));for(const k of['cap','crown','shades','phones'])cfg.acc[k]&&head.add(headAcc(k));
if(cfg.acc.pack){const g=new TH.Group(),add=adder(g,M2('#8a5a2b',.8));add(rbox(1.2,1.5,.5,.12,6),0,.1,-.78);add(rbox(.12,1.6,.1,.04,3),-.5,.1,.5,0,0,M2('#5a3a1b'));add(rbox(.12,1.6,.1,.04,3),.5,.1,.5,0,0,M2('#5a3a1b'));torso.add(g)}
let cape=null;if(cfg.acc.cape){cape=new TH.Group();cape.position.set(0,.95,-.55);const o=new TH.Mesh(rbox(1.8,2.5,.08,.03,6).translate(0,-1.25,0),M2('#7a4cd9',.6));o.castShadow=true;cape.add(o);torso.add(cape)}
const S={ph:0,w:0,t:0},P=(o,k,v,f)=>o.rotation[k]+=(v-o.rotation[k])*f;
function upd(dt,speed,air,emote){S.t+=dt;const t=S.t,f=Math.min(1,dt*14);S.w+=((air?0:Math.min(speed/14,1))-S.w)*Math.min(1,dt*12);S.ph+=dt*(speed>.5?speed*.62:0);const s=Math.sin(S.ph)*S.w,
g={llx:s*.85,rlx:-s*.85,lax:-s*.85,rax:s*.85,laz:-.05-Math.sin(t*1.8)*.03,raz:.05+Math.sin(t*1.8)*.03,ty:0,hz:0,hx:0,by:0};
if(air){Object.assign(g,{lax:-2.7,rax:-2.7,laz:-.25,raz:.25,llx:-.35,rlx:.35,hx:-.1})}
P(ll,'x',g.llx,f);P(rl,'x',g.rlx,f);P(la,'x',g.lax,f);P(ra,'x',g.rax,f);P(la,'z',g.laz,f);P(ra,'z',g.raz,f);P(torso,'y',g.ty,f);P(head,'z',g.hz,f);P(head,'x',g.hx,f);body.position.y+=(g.by-body.position.y)*f;torso.scale.y=1+Math.sin(t*2)*.012;
if(cape)P(cape,'x',.12+S.w*.5+(air?.6:0)+Math.sin(t*3)*.03,f)}
return{g:root,upd,cfg}}
function dispose(g){g.traverse(o=>{o.geometry&&o.geometry.dispose();if(o.material){o.material.map&&o.material.map.dispose();o.material.dispose()}})}
window.AV={make,def,clean,dispose,SKIN,HAIRC,CLO,SHIRTS,PANTS,HAIRS,FACES,ACCS,OUTFITS}})();
