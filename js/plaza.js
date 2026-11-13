'use strict';
const $=s=>document.querySelector(s),T=THREE,clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const hex=c=>'#'+[c.R,c.G,c.B].map(v=>Math.round(clamp(v,0,1)*255).toString(16).padStart(2,'0')).join('');
let lastOut='';const out=s=>{if(s===lastOut&&/^Error/.test(s))return;lastOut=s;const o=$('#out');o.textContent+=s+'\n';if(o.textContent.length>20000)o.textContent=o.textContent.slice(-10000);o.scrollTop=1e9};
class Sig{f=[];Connect(fn){this.f.push(fn);return{Disconnect:()=>{this.f=this.f.filter(x=>x!==fn)}}}fire(...a){for(const fn of this.f.slice())try{fn(...a)}catch(e){out('Error: '+e)}}}
const C3=(r,g,b)=>({R:r,G:g,B:b}),U2=(a,b,c,d)=>({XS:a,XO:b,YS:c,YO:d}),V=(x,y,z)=>({X:x,Y:y,Z:z});
const gb=()=>({Position:U2(0,20,0,20),Size:U2(0,160,0,48),AnchorPoint:{X:0,Y:0},Rotation:0,BackgroundColor3:C3(.15,.16,.2),BackgroundTransparency:0,BorderColor3:C3(0,0,0),BorderSizePixel:0,Visible:true,ZIndex:1,ClipsDescendants:false,Active:true}),
gt=t=>({...gb(),Text:t,TextColor3:C3(1,1,1),TextSize:16,TextTransparency:0,Font:'SourceSans',TextXAlignment:'Center',TextYAlignment:'Center',TextWrapped:false}),
part=()=>({Position:V(0,5,0),Orientation:V(0,0,0),Size:V(4,1,2),Color:C3(.64,.64,.64),Material:'Plastic',Reflectance:0,Transparency:0,Shape:'Block',Anchored:false,CanCollide:true,CanTouch:true,Locked:false,Negative:false,CastShadow:true,Density:.7,Friction:.3,Elasticity:.5,AssemblyLinearVelocity:V(0,0,0)});
const DEF={Part:part(),SpawnLocation:{...part(),Size:V(6,1,6),Position:V(0,.5,0),Anchored:true,Enabled:true,Neutral:true,Duration:10,AllowTeamChangeOnTouch:false},
Terrain:{Seed:7,Size:512,Resolution:128,Amplitude:45,WaterColor:C3(.05,.33,.36),WaterReflectance:1,WaterTransparency:.3,WaterWaveSize:.15,WaterWaveSpeed:10,Decoration:true},
Sky:{Color:C3(.53,.75,.95)},Lighting:{Brightness:1,ClockTime:14,Ambient:C3(.27,.27,.27),OutdoorAmbient:C3(.27,.27,.27),FogColor:C3(.75,.75,.75),FogStart:0,FogEnd:1e5,GlobalShadows:true,ExposureCompensation:0},
Script:{Source:'print("Hello from Plaza!")',Disabled:false,RunContext:'Legacy'},LocalScript:{Source:'print("LocalScript running")',Disabled:false},ModuleScript:{Source:'local M={}\nreturn M'},
Model:{},Folder:{},ScreenGui:{Enabled:true,DisplayOrder:0,ResetOnSpawn:true,IgnoreGuiInset:false},Frame:gb(),TextLabel:gt('Label'),TextButton:gt('Button')};
// Object catalogue (Insert Object). "Functional" classes are simulated; the rest are stored/saved and scriptable but have no behaviour yet.
const CAT={Parts:['Part','SpawnLocation'],GUI:['ScreenGui','Frame','TextLabel','TextButton'],Scripting:['Script','LocalScript','ModuleScript'],Containers:['Model','Folder']};
const KL=(c,ns,d={})=>ns.split(' ').forEach(n=>{DEF[n]=JSON.parse(JSON.stringify(d));(CAT[c]=CAT[c]||[]).includes(n)||CAT[c].push(n)});
KL('Parts','Seat VehicleSeat TrussPart MeshPart',part());DEF.VehicleSeat={...part(),MaxSpeed:68,Torque:42,BoostSpeed:95,BoostTorque:75,TurnSpeed:1.8,AutoDrive:true,CameraDistance:26,CameraPitch:17};KL('Containers','Configuration Tool NegateOperation');KL('Containers','UnionOperation',{Color:C3(.64,.64,.64),Material:'Plastic',Reflectance:0,Transparency:0,Mode:'Union',Friction:.3,CastShadow:true});KL('Scripting','BindableEvent RemoteEvent');
KL('Values','BoolValue',{Value:false});KL('Values','IntValue NumberValue',{Value:0});KL('Values','StringValue',{Value:''});KL('Values','Color3Value',{Value:C3(1,1,1)});KL('Values','Vector3Value',{Value:V(0,0,0)});KL('Values','ObjectValue');
KL('Physics','WeldConstraint',{Enabled:true});KL('Physics','Attachment',{Position:V(0,0,0),Orientation:V(0,0,0),Visible:false});KL('Physics','HingeConstraint SpringConstraint RopeConstraint BallSocketConstraint RodConstraint PrismaticConstraint',{Enabled:true,Visible:false});KL('Physics','BodyVelocity BodyForce BodyGyro BodyPosition',{MaxForce:V(4e3,4e3,4e3)});
KL('Effects','PointLight SpotLight SurfaceLight',{Brightness:1,Color:C3(1,1,1),Range:16,Enabled:true,Shadows:false});KL('Effects','Fire Smoke Sparkles',{Enabled:true,Color:C3(1,.5,0),Size:5});KL('Effects','ParticleEmitter Beam Trail',{Enabled:true,Color:C3(1,1,1),Rate:20,Lifetime:2,Transparency:0});
KL('Effects','Sound',{SoundId:'',Volume:.5,Looped:false,Playing:false,PlaybackSpeed:1});KL('Effects','Decal Texture',{Texture:'',Face:'Front',Transparency:0});KL('Lighting FX','Atmosphere Clouds BloomEffect BlurEffect ColorCorrectionEffect SunRaysEffect DepthOfFieldEffect',{Enabled:true});
KL('GUI','ScrollingFrame CanvasGroup',gb());KL('GUI','TextBox',{...gt(''),PlaceholderText:'Type...',ClearTextOnFocus:true});KL('GUI','ImageLabel ImageButton',{...gb(),Image:''});KL('GUI','UICorner',{CornerRadius:8});KL('GUI','UIStroke',{Color:C3(1,1,1),Thickness:1,Transparency:0});
KL('GUI','UIListLayout UIGridLayout UIPadding UIGradient UIAspectRatioConstraint UIScale');KL('GUI','SurfaceGui BillboardGui',{Enabled:true});

const PART=['Part','SpawnLocation','Seat','VehicleSeat','TrussPart','MeshPart'],GUI=['Frame','ScrollingFrame','CanvasGroup','TextLabel','TextButton','TextBox','ImageLabel','ImageButton'];
// ---------- instances ----------
let nid=1,root,sel,playing=false,rt=1,dirty=1,snap,pl,list=[],terr=null;
const M=new WeakMap,GD=new WeakMap,svc={},hb=new Sig;
const H={get(t,k,r){if(k in t)return Reflect.get(t,k,r);if(typeof k=='string')return t.K.find(c=>c.Name==k)},
set(t,k,v){if(k=='Parent')reparent(t,v||null);else{t[k]=v;upd(t.p,k)}return true}};
class Inst{constructor(c){Object.assign(this,JSON.parse(JSON.stringify(DEF[c]||{})),{C:c,ClassName:c,Name:c,Parent:null,K:[],Id:nid++,vx:0,vy:0,vz:0,Touched:new Sig,MouseButton1Click:new Sig,Activated:new Sig,MouseButton1Down:new Sig,MouseButton1Up:new Sig,Event:new Sig,OnServerEvent:new Sig,OnClientEvent:new Sig});return this.p=new Proxy(this,H)}
Destroy(){this.Parent=null}Clone(){return deser(ser(this))}get ChildCount(){return this.K.length}ChildAt(k){return this.K[k]}Fire(...a){this.Event.fire(...a)}FireServer(...a){this.OnServerEvent.fire({Name:'Player'},...a)}FireClient(p,...a){this.OnClientEvent.fire(...a)}FireAllClients(...a){this.OnClientEvent.fire(...a)}FindFirstChild(n){return this.K.find(c=>c.Name==n)}IsA(c){return this.C==c}}
const mk=c=>new Inst(c);
function reparent(t,v){const p=t.p,old=t.Parent;if(t.Parent)t.Parent.K=t.Parent.K.filter(c=>c!==p);t.Parent=v;if(v)v.K.push(p);attach(p);[old,v].forEach(u=>u&&u.C=='UnionOperation'&&inWS(u)&&buildUnion(u));dirty=1;rt=1;guiDirty=1}
const inWS=i=>{for(let p=i;p;p=p.Parent)if(p.C=='Workspace')return true;return false};
const find=c=>{let r;(function w(i){if(!r&&i.C==c)r=i;i.K.forEach(w)})(root);return r};
const findT=()=>{terr=null;(function w(i){if(i.C=='Terrain'&&inWS(i))terr=i;i.K.forEach(w)})(root)};
// ---------- scene ----------
const cv=$('#cv'),ren=new T.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true}),scene=new T.Scene(),cam=new T.PerspectiveCamera(60,1,.1,3000);
ren.shadowMap.enabled=true;const sun=new T.DirectionalLight(0xffffff,.9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
const hemi=new T.HemisphereLight(0xffffff,0x667788,.6);Object.assign(sun.shadow.camera,{left:-120,right:120,top:120,bottom:-120,far:600});scene.add(sun,sun.target,hemi);
const BOX=new T.BoxGeometry(1,1,1),box=new T.BoxHelper(new T.Mesh(BOX),0x00aaff);box.visible=false;scene.add(box);
const O={yaw:.6,pitch:.5,dist:60,t:new T.Vector3(0,3,0)};
let sunA=2;
function env(){const s=find('Sky'),l=find('Lighting')||DEF.Lighting,c=s?s.Color:C3(.5,.7,.9),f=l.FogColor,a=l.Ambient,ex=2**l.ExposureCompensation;sunA=(l.ClockTime-6)/12*Math.PI;const day=Math.max(.12,Math.sin(sunA)),bg=new T.Color(c.R*day,c.G*day,c.B*day),far=l.FogEnd>=1e5;
scene.background=bg;scene.fog=new T.Fog(far?bg:new T.Color(f.R,f.G,f.B),far?400:l.FogStart,far?1500:l.FogEnd);sun.intensity=l.Brightness*.9*day*ex;sun.castShadow=!!l.GlobalShadows;hemi.intensity=(.5*day+.1)*ex;hemi.groundColor.setRGB(a.R,a.G,a.B)}
function attach(i){const k=i.C;if(k=='UnionOperation'){if(inWS(i))buildUnion(i);else{const m=M.get(i);m&&scene.remove(m)}}if(PART.includes(k)||k=='Terrain'){const on=inWS(i);if(on&&!M.has(i)){const m=k=='Terrain'?mkT(i):new T.Mesh(BOX,new T.MeshStandardMaterial({roughness:.8}));m.castShadow=m.receiveShadow=true;m.userData.i=i;M.set(i,m)}const m=M.get(i);if(m){on?scene.add(m):scene.remove(m);if(on){sync(i);if(k=='Terrain')findT()}}}i.K.forEach(attach)}
const GEO={Block:BOX,Ball:new T.SphereGeometry(.5,24,16),Cylinder:new T.CylinderGeometry(.5,.5,1,24).rotateZ(Math.PI/2)};
const MAT={Plastic:[.7,0],Wood:[.9,0],Slate:[.8,0],Concrete:[.9,0],Brick:[.9,0],Sand:[1,0],Grass:[1,0],Metal:[.35,.8],Foil:[.2,1],Glass:[.05,.1],Ice:[.1,.1],Neon:[.5,0]};
function sync(i){const m=M.get(i);if(!m)return;if(i.C=='UnionOperation'){const a=m.material,c=i.Color,mt=MAT[i.Material]||MAT.Plastic;a.color.setRGB(c.R,c.G,c.B);a.roughness=Math.max(.05,mt[0]*(1-i.Reflectance*.6));a.metalness=mt[1];a.transparent=i.Transparency>0;a.opacity=1-i.Transparency;m.castShadow=!!i.CastShadow;if(i===sel)box.setFromObject(m);return}if(i.C!='Terrain'){const p=i.Position,s=i.Size,c=i.Color,r=i.Orientation,mt=MAT[i.Material]||MAT.Plastic,a=m.material,neon=i.Material=='Neon',k=Math.PI/180;m.geometry=GEO[i.Shape]||BOX;m.position.set(p.X,p.Y,p.Z);m.rotation.set(r.X*k,r.Y*k,r.Z*k,'YXZ');m.scale.set(s.X,s.Y,s.Z);
a.color.setRGB(c.R,c.G,c.B);a.roughness=Math.max(.05,mt[0]*(1-i.Reflectance*.6));a.metalness=mt[1];a.emissive.setRGB(neon?c.R:0,neon?c.G:0,neon?c.B:0);const gl=i.Material=='Glass';a.transparent=i.Transparency>0||gl;a.opacity=gl?Math.min(1-i.Transparency,.4):1-i.Transparency;m.castShadow=!!i.CastShadow;m.layers.set(i.Parent&&i.Parent.C=='UnionOperation'?1:0);if(i.Negative){a.color.setRGB(1,.2,.2);a.transparent=true;a.opacity=.4;m.castShadow=false}}if(i===sel){box.setFromObject(m)}}
const mv=b=>{const m=M.get(b);if(m){const p=b.Position;m.position.set(p.X,p.Y,p.Z)}};
function upd(i,k){if(k=='Name'){rt=1;return}if(i.C=='UnionOperation'&&k=='Mode'&&inWS(i))buildUnion(i);{const up=i.Parent;if(up&&up.C=='UnionOperation'&&inWS(up)&&['Size','Position','Orientation','Shape','Negative'].includes(k))buildUnion(up)}if(k=='Size'||k=='Orientation')EX.delete(i);OB.delete(i);if(GD.has(i))gsync(i);else if(i.Parent&&GD.has(i.Parent))gsync(i.Parent);if(M.has(i)){if(i.C=='Terrain'&&['Seed','Size','Resolution','Amplitude'].includes(k)){scene.remove(M.get(i));M.delete(i);attach(i)}else sync(i)}if(i.C=='Sky'||i.C=='Lighting')env()}
// ---------- terrain ----------
const hash=(x,y,s)=>{const h=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return h-Math.floor(h)};
const vn=(x,y,s)=>{const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),a=hash(xi,yi,s),b=hash(xi+1,yi,s),c=hash(xi,yi+1,s),d=hash(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
const fbm=(x,y,s)=>{let a=.5,f=1,t=0;for(let o=0;o<5;o++){t+=a*vn(x*f,y*f,s+o);f*=2;a*=.5}return t};
const hf=(x,z,t)=>(fbm(x/180,z/180,t.Seed)-.45)*2*t.Amplitude,hgt=(x,z)=>terr?hf(x,z,terr):-1e9;
function mkT(i){const n=clamp(i.Resolution|0,8,512),g=new T.PlaneGeometry(i.Size,i.Size,n,n);g.rotateX(-Math.PI/2);const P=g.attributes.position,c=new Float32Array(P.count*3);
for(let k=0;k<P.count;k++){const y=hf(P.getX(k),P.getZ(k),i);P.setY(k,y);const e=y/i.Amplitude;c.set(e<-.45?[.76,.7,.5]:e<.3?[.28,.52,.22]:e<.7?[.45,.42,.4]:[.95,.95,1],k*3)}
g.setAttribute('color',new T.BufferAttribute(c,3));g.computeVertexNormals();return new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:1}))}
// ---------- physics (AABB rigid bodies, 4 substeps, heightfield terrain) ----------
let cur=new Set,prv=new Set;
function touch(a,b){const k=a.Id<b.Id?a.Id+'_'+b.Id:b.Id+'_'+a.Id;if(!cur.has(k)){cur.add(k);if(!prv.has(k)){a.Touched.fire(b);b.Touched.fire(a)}}}
const AX=['X','Y','Z'],EX=new WeakMap,OB=new WeakMap,WX=[new T.Vector3(1,0,0),new T.Vector3(0,1,0),new T.Vector3(0,0,1)],rotd=b=>{const r=b.Orientation;return r.X||r.Y||r.Z};let welds=[],tpTo=null;
function basis(b){let m=OB.get(b);if(!m){const r=b.Orientation,k=Math.PI/180,e=new T.Matrix4().makeRotationFromEuler(new T.Euler(r.X*k,r.Y*k,r.Z*k,'YXZ')).elements;m=[0,1,2].map(c=>new T.Vector3(e[c*4],e[c*4+1],e[c*4+2]));OB.set(b,m)}return m}
function ext(b){let e=EX.get(b);if(!e){const s=b.Size,m=basis(b);e=[0,1,2].map(i=>(Math.abs(m[0].getComponent(i))*s.X+Math.abs(m[1].getComponent(i))*s.Y+Math.abs(m[2].getComponent(i))*s.Z)/2);EX.set(b,e)}return e}
function sat(b,o){const pb=b.Position,po=o.Position,d=new T.Vector3(pb.X-po.X,pb.Y-po.Y,pb.Z-po.Z),A=rotd(b)?basis(b):WX,B=rotd(o)?basis(o):WX,sa=b.Size,sb=o.Size,ha=[sa.X/2,sa.Y/2,sa.Z/2],hb=[sb.X/2,sb.Y/2,sb.Z/2];let best=1e9,bn=null;
const test=(L,cross)=>{const l=L.length();if(l<1e-6)return true;L=L.clone().divideScalar(l);let ra=0,rb=0;for(let i=0;i<3;i++){ra+=Math.abs(A[i].dot(L))*ha[i];rb+=Math.abs(B[i].dot(L))*hb[i]}const ov=ra+rb-Math.abs(d.dot(L));if(ov<=0)return false;if(cross?ov<best*.9:ov<best){best=ov;bn=L}return true};
for(const L of A)if(!test(L))return null;for(const L of B)if(!test(L))return null;for(const a of A)for(const c of B)if(!test(new T.Vector3().crossVectors(a,c),1))return null;if(bn.dot(d)<0)bn.negate();return{n:bn,ov:best}}
function collide(b,o){const p=b.Position,q=o.Position;let n,ov;
if(rotd(b)||rotd(o)){const r=sat(b,o);if(!r)return;n=r.n;ov=r.ov}else{const u=ext(b),w=ext(o),d=[0,1,2].map(i=>u[i]+w[i]-Math.abs(p[AX[i]]-q[AX[i]]));if(d[0]<=0||d[1]<=0||d[2]<=0)return;let a=1;if(d[0]<d[a])a=0;if(d[2]<d[a])a=2;n=WX[a].clone().multiplyScalar(Math.sign(p[AX[a]]-q[AX[a]])||1);ov=d[a]}
if(b.CanTouch&&o.CanTouch)touch(b,o);const u=ext(b),w=ext(o),gap=q.Y+w[1]-(p.Y-u[1]),vb=b.AssemblyLinearVelocity,vo=o.AssemblyLinearVelocity;
if(b.player&&Math.abs(n.y)<.5&&gap>.02&&gap<=1.6){p.Y+=Math.min(gap,.45);vb.Y=Math.max(vb.Y,0);b.ground=true;return}
const st=o.Anchored||o._w,mb=Math.max(.01,b.Density)*u[0]*u[1]*u[2],mo=st?1e9:Math.max(.01,o.Density)*w[0]*w[1]*w[2],k=mo/(mb+mo);
p.X+=n.x*ov*k;p.Y+=n.y*ov*k;p.Z+=n.z*ov*k;if(!st){q.X-=n.x*ov*(1-k);q.Y-=n.y*ov*(1-k);q.Z-=n.z*ov*(1-k)}
const rv=(vb.X-(st?0:vo.X))*n.x+(vb.Y-(st?0:vo.Y))*n.y+(vb.Z-(st?0:vo.Z))*n.z;
if(rv<0){const e=b.player||Math.abs(rv)<=3?0:Math.max(b.Elasticity,o.Elasticity)*.6,j=(1+e)*rv;vb.X-=j*n.x*k;vb.Y-=j*n.y*k;vb.Z-=j*n.z*k;if(!st){vo.X+=j*n.x*(1-k);vo.Y+=j*n.y*(1-k);vo.Z+=j*n.z*(1-k)}}
if(n.y>.5){b.ground=true;if(!b.player){const f=1-.08*(b.Friction+o.Friction);vb.X*=f;vb.Z*=f}}}
function step(dt){const h=dt/4;for(let s=0;s<4;s++){
for(const w of welds){const a=w.Part0||w.Parent,c=w.Part1;if(!w.Enabled||!a?.Position||!c?.Position)continue;const p=a.Position,q=c.Position;if(!w._o)w._o=V(q.X-p.X,q.Y-p.Y,q.Z-p.Z);if(!c._w)c._w=1;q.X=p.X+w._o.X;q.Y=p.Y+w._o.Y;q.Z=p.Z+w._o.Z;const v=c.AssemblyLinearVelocity;v.X=v.Y=v.Z=0}
for(const b of list){if(b.Anchored||b._w)continue;const p=b.Position,v=b.AssemblyLinearVelocity;v.Y-=196.2*h;p.X+=v.X*h;p.Y+=v.Y*h;p.Z+=v.Z*h;b.ground=false;
if(terr){const g=hgt(p.X,p.Z),bot=p.Y-ext(b)[1];if(bot<g){p.Y+=g-bot;if(v.Y<0)v.Y=0;b.ground=true;if(!b.player){const f=1-.16*b.Friction;v.X*=f;v.Z*=f}}}
if(b.CanCollide)for(const o of list)if(o!==b&&o.CanCollide)collide(b,o)}}}
// ---------- Lua (Fengari) bridge ----------
const B=f=>(...a)=>f(...(a[0]==null?a.slice(1):a));
Object.assign(window,{__out:(...a)=>out(a.pop()),__v3:B(V),__c3:B(C3),__u2:B(U2),__mki:B(c=>{if(!DEF[c]&&c!='Folder')throw new Error('Unknown class '+c);return mk(c)}),
__game:new Proxy({GetService:n=>svc[n]},{get:(t,k)=>t[k]||svc[k]})});
const PRELUDE=`local G=require"js".global __G=G
local th,cache={},{}
function print(...)local t={}for i=1,select('#',...)do t[i]=tostring((select(i,...)))end G.__out(nil,table.concat(t,"\\t"))end
function wait(n)return coroutine.yield(n or .03)end
task={wait=wait,spawn=function(f,...)local a={...}th[#th+1]={co=coroutine.create(function()f(table.unpack(a))end),t=0}end}
spawn=task.spawn
function __exec(src,inst)local f,e=load(src,"="..(inst and inst.Name or"cmd"),"t",setmetatable({script=inst},{__index=_G}))
if not f then print("Syntax error: "..e)return end task.spawn(f)end
local _rq=require function require(m)if type(m)=="string"then return _rq(m)end local k=m.Id if cache[k]==nil then local f,e=load(m.Source,"="..m.Name,"t",setmetatable({script=m},{__index=_G}))if not f then error(e)end cache[k]=f()or true end return cache[k]end
function __step(dt)for i=#th,1,-1 do local x=th[i]x.t=x.t-dt if x.t<=0 then local ok,r=coroutine.resume(x.co)if not ok then print("Error: "..tostring(r))end
if coroutine.status(x.co)=="dead"then table.remove(th,i)else x.t=tonumber(r)or 0 end end end end
function __reset()th={}cache={}game=G.__game workspace=G.__ws end
function children(i)local t={}for k=0,i.ChildCount-1 do t[#t+1]=i:ChildAt(k)end return t end
Vector3={new=function(x,y,z)return G.__v3(nil,x or 0,y or 0,z or 0)end}
Color3={new=function(r,g,b)return G.__c3(nil,r or 0,g or 0,b or 0)end,fromRGB=function(r,g,b)return G.__c3(nil,(r or 0)/255,(g or 0)/255,(b or 0)/255)end}
UDim2={new=function(a,b,c,d)return G.__u2(nil,a or 0,b or 0,c or 0,d or 0)end,fromOffset=function(x,y)return G.__u2(nil,0,x or 0,0,y or 0)end}
Instance={new=function(c,p)local i=G.__mki(nil,c)if p then i.Parent=p end return i end}`;
fengari.load(PRELUDE)();
const stepF=fengari.load('__step(__G.__dt)'),runF=fengari.load('__exec(__G.__cur.Source,__G.__cur)'),
execF=fengari.load('__exec(__G.__src)'),resetF=fengari.load('__reset()');
// ---------- data / templates ----------
const SG={C:'ScreenGui',N:'Gui',P:{},K:[{C:'TextButton',N:'TextButton',P:{Text:'Click me'},K:[]},{C:'LocalScript',N:'LocalScript',P:{Source:'local b=script.Parent.TextButton\nlocal n=0\nb.MouseButton1Click:Connect(function()\n  n=n+1\n  b.Text="Clicked "..n\nend)'},K:[]}]};
const SP=y=>({C:'SpawnLocation',N:'SpawnLocation',P:{Position:V(0,y,0)},K:[]});
const TPL={base:[{C:'Part',N:'Baseplate',P:{Size:V(512,20,512),Position:V(0,-10,0),Anchored:true},K:[]},SP(.5)],terr:[{C:'Terrain',N:'Terrain',P:{},K:[]},SP(hf(0,0,DEF.Terrain)+.5)]};
const mkn=(c,k,p={})=>({C:c,N:c,P:p,K:k||[]});
const tmpl=k=>mkn('DataModel',[mkn('Workspace',TPL[k]),mkn('Lighting',[mkn('Sky')]),mkn('ReplicatedStorage'),mkn('ServerScriptService',[mkn('Script',[],{Source:'print("Hello from Plaza!")\nworkspace.SpawnLocation.Touched:Connect(function(hit)\n  print("Touched by "..hit.Name)\nend)'})]),mkn('StarterGui',[SG])]);
const ser=i=>({C:i.C,N:i.Name,P:Object.fromEntries(Object.keys(DEF[i.C]||{}).map(k=>[k,JSON.parse(JSON.stringify(i[k]))])),K:i.K.map(ser)});
function deser(o){const i=mk(o.C);i.Name=o.N;Object.assign(i,o.P);for(const k of o.K)deser(k).Parent=i;return i}
function loadRoot(o){scene.children.filter(c=>c.userData.i).forEach(c=>scene.remove(c));root=deser(o);for(const k in svc)delete svc[k];for(const k of root.K)svc[k.Name]=k;
svc.RunService={Heartbeat:hb};svc.UserInputService=UIS;svc.Players={LocalPlayer:{get Name(){return PLY.prof.name}}};window.__ws=svc.Workspace;sel=null;findT();env();resetF();select(null);open.clear();[svc.Workspace,svc.StarterGui].forEach(x=>open.add(x.Id));rt=1;guiDirty=1;O.t.set(0,hf(0,0,DEF.Terrain)>0?hf(0,0,DEF.Terrain):3,0)}
// ---------- GUI (StarterGui -> DOM) ----------
function mkGui(i,par){const c=i.C,d=document.createElement(c=='TextBox'?'input':/Button/.test(c)?'button':'div');GD.set(i,d);par.appendChild(d);if(c=='TextBox')d.oninput=()=>{i.Text=d.value};gsync(i);if(/Button/.test(c)){d.onclick=()=>{i.MouseButton1Click.fire();i.Activated.fire()};d.style.touchAction='none';d.oncontextmenu=e=>e.preventDefault();d.onpointerdown=()=>i.MouseButton1Down.fire();const up=()=>i.MouseButton1Up.fire();d.onpointerup=d.onpointerleave=d.onpointercancel=up}i.K.forEach(k=>GUI.includes(k.C)&&mkGui(k,d))}
let guiDirty=1;
function mountGui(){const g=$('#gui');g.innerHTML='';g.classList.toggle('edit',!playing);guiDirty=0;svc.StarterGui.K.forEach(s=>s.Enabled!==false&&s.K.forEach(k=>GUI.includes(k.C)&&mkGui(k,g)));const e=sel&&GD.get(sel);if(e)e.classList.add('sel')}
const FONTS={Legacy:'Arial',Arial:'Arial',ArialBold:'Arial',SourceSans:'system-ui,sans-serif',Gotham:'Montserrat,system-ui',Code:'monospace',Fantasy:'fantasy',Cartoon:'cursive',SciFi:'monospace'},rgba=(c,a)=>`rgba(${Math.round(c.R*255)},${Math.round(c.G*255)},${Math.round(c.B*255)},${a})`,AL={Left:'flex-start',Center:'center',Right:'flex-end',Top:'flex-start',Bottom:'flex-end'};
function gsync(i){const d=GD.get(i),p=i.Position,s=i.Size,a=i.AnchorPoint;Object.assign(d.style,{position:'absolute',boxSizing:'border-box',left:`calc(${p.XS*100}% + ${p.XO}px)`,top:`calc(${p.YS*100}% + ${p.YO}px)`,width:`calc(${s.XS*100}% + ${s.XO}px)`,height:`calc(${s.YS*100}% + ${s.YO}px)`,transform:`translate(${-a.X*100}%,${-a.Y*100}%) rotate(${i.Rotation}deg)`,background:rgba(i.BackgroundColor3,1-i.BackgroundTransparency),border:i.BorderSizePixel?`${i.BorderSizePixel}px solid ${hex(i.BorderColor3)}`:'0',display:i.Visible?'flex':'none',zIndex:i.ZIndex,overflow:i.ClipsDescendants?'hidden':'visible'});
if(i.Text!==undefined){Object.assign(d.style,{color:rgba(i.TextColor3,1-i.TextTransparency),font:`${i.TextSize}px ${FONTS[i.Font]||'system-ui'}`,justifyContent:AL[i.TextXAlignment],alignItems:AL[i.TextYAlignment],whiteSpace:i.TextWrapped?'normal':'pre',textAlign:'center'});if(i.C=='TextBox'){d.value=i.Text;d.placeholder=i.PlaceholderText}else d.textContent=i.Text}
const cr=i.K.find(k=>k.C=='UICorner'),sk=i.K.find(k=>k.C=='UIStroke');d.style.borderRadius=cr?cr.CornerRadius+'px':'0';if(sk)d.style.border=`${sk.Thickness}px solid ${rgba(sk.Color,1-sk.Transparency)}`;
if(i.Image!==undefined)Object.assign(d.style,{backgroundImage:i.Image?`url(${i.Image})`:'none',backgroundSize:'cover'});if(i.C=='ScrollingFrame')d.style.overflow='auto'}
// ---------- play / stop ----------
const keys={};let joy={x:0,y:0},jump=false;
function play(){if(playing)return;snap=ser(root);const sp=find('SpawnLocation'),q=sp?sp.Position:V(0,5,0);pl=mk('Part');pl.Name='Player';pl.Size=V(2,5,2);pl.Color=C3(.95,.5,.1);pl.player=true;pl.Position=V(q.X,q.Y+(sp?sp.Size.Y/2:0)+3,q.Z);pl.Parent=svc.Workspace;if(tpTo){const q=pl.Position;q.X=tpTo.X;q.Y=tpTo.Y;q.Z=tpTo.Z;tpTo=null}M.get(pl).material.visible=false;PLY.start();
playing=true;dirty=1;select(null);$('#ed').style.display='none';out('▶ Play');resetF();UIS.reset();vInit=0;drv=null;vfs=[];mountGui();
(function w(i){if((i.C=='Script'||i.C=='LocalScript')&&!i.Disabled){window.__cur=i;try{runF()}catch(e){out('Error: '+e)}}i.K.forEach(w)})(root);
touchUI()}
function stop(){if(!playing)return;playing=false;PLY.stop();hb.f=[];UIS.reset();drv=null;vfs=[];$('#gui').innerHTML='';loadRoot(snap);touchUI();out('■ Stopped')}
const UIS={MoveX:0,MoveY:0,Jump:false,ControlsEnabled:true,CameraSubject:null,_t:true,ExtraThrottle:0,ExtraSteer:0,ExtraBrake:false,Boost:false,Respawn:false,Speed:0,SpeedFraction:0,Gear:'N',
get TouchControlsEnabled(){return this._t},set TouchControlsEnabled(v){this._t=!!v;touchUI()},
get CameraYaw(){return O.yaw*180/Math.PI},set CameraYaw(v){O.yaw=v*Math.PI/180},get CameraPitch(){return O.pitch*180/Math.PI},set CameraPitch(v){O.pitch=clamp(v*Math.PI/180,-.2,1.5)},
get CameraDistance(){return O.dist},set CameraDistance(v){O.dist=clamp(v,5,900)},get FieldOfView(){return cam.fov},set FieldOfView(v){cam.fov=clamp(v,30,120);cam.updateProjectionMatrix()},
reset(){Object.assign(this,{ControlsEnabled:true,CameraSubject:null,_t:true,ExtraThrottle:0,ExtraSteer:0,ExtraBrake:false,Boost:false,Respawn:false,Speed:0,SpeedFraction:0,Gear:'N'});cam.fov=60;cam.updateProjectionMatrix()}};
// ---------- vehicles: a VehicleSeat in a Model becomes a drivable car (arcade model, inputs from keyboard/touch/UIS) ----------
let drv=null,vfs=[],vInit=0;const VS=new WeakMap,FO=new WeakMap,RAD=Math.PI/180;
function setupVeh(){drv=list.find(b=>b.C=='VehicleSeat'&&b.AutoDrive)||null;vfs=[];if(!drv)return;const p=drv.Position,h=drv.Orientation.Y*RAD,c=Math.cos(h),s=Math.sin(h);
const col=n=>{if(PART.includes(n.C)&&n!==drv){const q=n.Position,dx=q.X-p.X,dz=q.Z-p.Z;FO.set(n,{x:dx*c-dz*s,y:q.Y-p.Y,z:dx*s+dz*c,o:{...n.Orientation},w:/^Wheel/.test(n.Name),f:/^WheelF/.test(n.Name)});vfs.push(n);n.Anchored=true;n.CanCollide=false;n.CanTouch=false}n.K.forEach(col)};
if(drv.Parent&&drv.Parent.C=='Model')drv.Parent.K.forEach(col);
VS.set(drv,{s:0,ss:0,spin:0,start:{...p},yaw:drv.Orientation.Y});UIS.CameraSubject=drv;UIS.ControlsEnabled=false;UIS._t=false;touchUI();O.dist=drv.CameraDistance;O.pitch=drv.CameraPitch*RAD;O.yaw=h+Math.PI;
pl.Anchored=true;pl.CanCollide=false;pl.CanTouch=false;pl.Position=V(0,-500,0)}
function drive(dt){const b=drv,S=VS.get(b),v=b.AssemblyLinearVelocity,p=b.Position;let h=b.Orientation.Y*RAD,s=S.s;
if(UIS.Respawn||p.Y<-60){UIS.Respawn=false;p.X=S.start.X;p.Y=S.start.Y+1;p.Z=S.start.Z;v.X=v.Y=v.Z=0;h=S.yaw*RAD;s=0}
s+=(v.X*Math.sin(h)+v.Z*Math.cos(h)-s)*Math.min(1,dt*5);
const thr=clamp(UIS.MoveY+UIS.ExtraThrottle,-1,1),st=clamp(UIS.MoveX+UIS.ExtraSteer,-1,1),boost=UIS.Boost&&s>3,top=boost?b.BoostSpeed:b.MaxSpeed,acc=boost?b.BoostTorque:b.Torque;
if(thr>.05){if(s<0)s+=110*dt;else s+=thr*acc*dt}else if(thr<-.05){if(s>0)s-=95*dt;else s+=thr*28*dt}else s*=1-1.1*dt;
if(UIS.Jump||UIS.ExtraBrake)s*=1-3*dt;if(s>top)s-=40*dt;if(s<-22)s=-22;
S.ss+=(st-S.ss)*Math.min(1,dt*10);const grip=Math.min(Math.abs(s)/10,1),dir=s<0?-1:1;h-=S.ss*(b.TurnSpeed-Math.min(Math.abs(s)/b.MaxSpeed,1)*b.TurnSpeed*.5)*grip*dir*dt;
v.X=Math.sin(h)*s;v.Z=Math.cos(h)*s;S.s=s;const rampPose=()=>{const mesh=M.get(b);if(!mesh)return {pitch:0,roll:0};const forward={x:Math.sin(h),z:Math.cos(h)},right={x:Math.cos(h),z:-Math.sin(h)},span=Math.max(1.2,b.Size.Z*.42),side=Math.max(.8,b.Size.X*.42),sample=(x,z)=>{const origin=new T.Vector3(x,p.Y+8,z),down=new T.Vector3(0,-1,0),caster=new T.Raycaster(origin,down,0,30),hits=caster.intersectObjects(scene.children,true).filter(hit=>{let obj=hit.object;while(obj){if(obj.userData?.i===b||obj.userData?.vehiclePart)return false;obj=obj.parent}return true});return hits.length?hits[0].point.y:p.Y};const front=sample(p.X+forward.x*span,p.Z+forward.z*span),back=sample(p.X-forward.x*span,p.Z-forward.z*span),rightY=sample(p.X+right.x*side,p.Z+right.z*side),leftY=sample(p.X-right.x*side,p.Z-right.z*side);return {pitch:Math.atan2(front-back,span*2),roll:Math.atan2(leftY-rightY,side*2)}};const slope=rampPose();b.Orientation=V(slope.pitch/RAD,h/RAD,slope.roll/RAD);
UIS.Speed=Math.round(Math.abs(s)*1.8);UIS.SpeedFraction=clamp(Math.abs(s)/b.MaxSpeed,0,1);UIS.Gear=Math.abs(s)<.8?'N':s<0?'R':'D';
let d=h+Math.PI-O.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));O.yaw+=d*Math.min(1,dt*4);const fv=62+clamp(Math.abs(s)/b.BoostSpeed,0,1)*22;if(Math.abs(fv-cam.fov)>.05){cam.fov=fv;cam.updateProjectionMatrix()}}
function follow(dt){const b=drv,S=VS.get(b),p=b.Position,h=b.Orientation.Y*RAD,c=Math.cos(h),s=Math.sin(h);S.spin=(S.spin+S.s*dt/1.1/RAD)%360;
for(const f of vfs){const o=FO.get(f),q=f.Position,m=M.get(f);q.X=p.X+o.x*c+o.z*s;q.Y=p.Y+o.y;q.Z=p.Z-o.x*s+o.z*c;
if(m){m.position.set(q.X,q.Y,q.Z);m.rotation.set((o.o.X+(o.w?S.spin:0))*RAD,(o.o.Y+h/RAD-(o.f?S.ss*25:0))*RAD,o.o.Z*RAD,'YXZ')}}}
function control(){let ix=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),iz=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);
const gp=navigator.getGamepads?.()[0];if(gp){if(Math.abs(gp.axes[0])>.15)ix+=gp.axes[0];if(Math.abs(gp.axes[1])>.15)iz+=gp.axes[1];if(gp.buttons[0]?.pressed)jump=true}
ix+=joy.x;iz+=joy.y;const l=Math.hypot(ix,iz);if(l>1){ix/=l;iz/=l}UIS.MoveX=ix;UIS.MoveY=-iz;UIS.Jump=!!(keys.Space||jump);if(!UIS.ControlsEnabled){jump=false;return}const c=Math.cos(O.yaw),s=Math.sin(O.yaw);
const v=pl.AssemblyLinearVelocity;v.X=(ix*c+iz*s)*16;v.Z=(-ix*s+iz*c)*16;if((keys.Space||jump)&&pl.ground)v.Y=50;jump=false}
function edcam(dt){if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;const ix=(keys.KeyD?1:0)-(keys.KeyA?1:0)+joy.x,iz=(keys.KeyS?1:0)-(keys.KeyW?1:0)+joy.y,iy=(keys.KeyE?1:0)-(keys.KeyQ?1:0),c=Math.cos(O.yaw),s=Math.sin(O.yaw),sp=60*dt;O.t.x+=(ix*c+iz*s)*sp;O.t.z+=(-ix*s+iz*c)*sp;O.t.y+=iy*sp}
