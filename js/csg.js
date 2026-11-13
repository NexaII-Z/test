// Real mesh booleans for Union / Negate / Intersect (BSP CSG, after Evan Wallace's csg.js, MIT).
// Works in world space. Collision for a union is voxel-fitted boxes, so cut holes are walk-through.
(()=>{const TH=THREE,E=1e-5;
class Vx{constructor(p,n){this.p=p;this.n=n}clone(){return new Vx(this.p.clone(),this.n.clone())}flip(){this.n.negate()}lerp(o,t){return new Vx(this.p.clone().lerp(o.p,t),this.n.clone().lerp(o.n,t).normalize())}}
class Pl{constructor(n,w){this.n=n;this.w=w}static from(a,b,c){const n=b.clone().sub(a).cross(c.clone().sub(a)).normalize();return new Pl(n,n.dot(a))}clone(){return new Pl(this.n.clone(),this.w)}flip(){this.n.negate();this.w=-this.w}
split(g,cf,cb,f,b){let ty=0;const t=g.v.map(v=>{const d=this.n.dot(v.p)-this.w,k=d<-E?2:d>E?1:0;ty|=k;return k});
if(ty==0)(this.n.dot(g.pl.n)>0?cf:cb).push(g);else if(ty==1)f.push(g);else if(ty==2)b.push(g);else{const F=[],B=[],n=g.v.length;for(let i=0;i<n;i++){const j=(i+1)%n,ti=t[i],tj=t[j],vi=g.v[i],vj=g.v[j];if(ti!=2)F.push(vi);if(ti!=1)B.push(ti!=2?vi.clone():vi);if((ti|tj)==3){const s=(this.w-this.n.dot(vi.p))/this.n.dot(vj.p.clone().sub(vi.p)),v=vi.lerp(vj,s);F.push(v);B.push(v.clone())}}if(F.length>=3)f.push(new Pg(F));if(B.length>=3)b.push(new Pg(B))}}}
class Pg{constructor(v){this.v=v;this.pl=Pl.from(v[0].p,v[1].p,v[2].p)}clone(){return new Pg(this.v.map(x=>x.clone()))}flip(){this.v.reverse().forEach(x=>x.flip());this.pl.flip()}}
class Nd{constructor(p){this.pl=null;this.f=null;this.b=null;this.p=[];if(p)this.build(p)}
invert(){this.p.forEach(x=>x.flip());this.pl&&this.pl.flip();this.f&&this.f.invert();this.b&&this.b.invert();[this.f,this.b]=[this.b,this.f]}
clip(ps){if(!this.pl)return ps.slice();let f=[],b=[];for(const x of ps)this.pl.split(x,f,b,f,b);if(this.f)f=this.f.clip(f);b=this.b?this.b.clip(b):[];return f.concat(b)}
clipTo(n){this.p=n.clip(this.p);this.f&&this.f.clipTo(n);this.b&&this.b.clipTo(n)}
all(){let r=this.p.slice();this.f&&(r=r.concat(this.f.all()));this.b&&(r=r.concat(this.b.all()));return r}
build(ps){if(!ps.length)return;if(!this.pl)this.pl=ps[0].pl.clone();const f=[],b=[];for(const x of ps)this.pl.split(x,this.p,this.p,f,b);if(f.length){this.f=this.f||new Nd;this.f.build(f)}if(b.length){this.b=this.b||new Nd;this.b.build(b)}}}
const nodes=(A,B)=>[new Nd(A.map(c=>c.clone())),new Nd(B.map(c=>c.clone()))];
const opU=(A,B)=>{const[a,b]=nodes(A,B);a.clipTo(b);b.clipTo(a);b.invert();b.clipTo(a);b.invert();a.build(b.all());return a.all()},
opS=(A,B)=>{const[a,b]=nodes(A,B);a.invert();a.clipTo(b);b.clipTo(a);b.invert();b.clipTo(a);b.invert();a.build(b.all());a.invert();return a.all()},
opI=(A,B)=>{const[a,b]=nodes(A,B);a.invert();b.clipTo(a);b.invert();a.clipTo(b);b.clipTo(a);a.build(b.all());a.invert();return a.all()};
function polys(g){const P=g.attributes.position,N=g.attributes.normal,ix=g.index,n=ix?ix.count:P.count,r=[],vx=i=>{const k=ix?ix.getX(i):i;return new Vx(new TH.Vector3().fromBufferAttribute(P,k),new TH.Vector3().fromBufferAttribute(N,k))};
for(let i=0;i<n;i+=3){const a=vx(i),b=vx(i+1),c=vx(i+2);if(b.p.clone().sub(a.p).cross(c.p.clone().sub(a.p)).lengthSq()<1e-10)continue;r.push(new Pg([a,b,c]))}return r}
function geo(ps){const pos=[],nor=[];for(const p of ps)for(let i=2;i<p.v.length;i++)for(const v of[p.v[0],p.v[i-1],p.v[i]]){pos.push(v.p.x,v.p.y,v.p.z);nor.push(v.n.x,v.n.y,v.n.z)}const g=new TH.BufferGeometry();g.setAttribute('position',new TH.Float32BufferAttribute(pos,3));g.setAttribute('normal',new TH.Float32BufferAttribute(nor,3));g.computeBoundingBox();return g}
const xf=c=>{const k=Math.PI/180,r=c.Orientation,s=c.Size;return new TH.Matrix4().compose(new TH.Vector3(c.Position.X,c.Position.Y,c.Position.Z),new TH.Quaternion().setFromEuler(new TH.Euler(r.X*k,r.Y*k,r.Z*k,'YXZ')),new TH.Vector3(s.X,s.Y,s.Z))};
const partPolys=c=>polys((GEO[c.Shape]||BOX).clone().applyMatrix4(xf(c)));
// point-in-part test (analytic, per shape)
const inside=c=>{const m=xf(c).invert();return p=>{const l=p.clone().applyMatrix4(m),a=l.x,b=l.y,d=l.z;return c.Shape=='Ball'?a*a+b*b+d*d<=.25:c.Shape=='Cylinder'?Math.abs(a)<=.5&&b*b+d*d<=.25:Math.abs(a)<=.5&&Math.abs(b)<=.5&&Math.abs(d)<=.5}};
function boxes(u,g,test){const bb=g.boundingBox,sz=bb.getSize(new TH.Vector3()),st=Math.max(1,Math.max(sz.x,sz.y,sz.z)/40),nx=Math.max(1,Math.round(sz.x/st)),ny=Math.max(1,Math.round(sz.y/st)),nz=Math.max(1,Math.round(sz.z/st)),sx=sz.x/nx,sy=sz.y/ny,sw=sz.z/nz,G=new Uint8Array(nx*ny*nz),ix=(x,y,z)=>(y*nz+z)*nx+x,pt=new TH.Vector3();
for(let y=0;y<ny;y++)for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){pt.set(bb.min.x+(x+.5)*sx,bb.min.y+(y+.5)*sy,bb.min.z+(z+.5)*sw);G[ix(x,y,z)]=test(pt)?1:0}
const S=[];for(let y=0;y<ny;y++){const open=new Map,row=[];S.push(row);for(let z=0;z<nz;z++){let x=0;while(x<nx){if(!G[ix(x,y,z)]){x++;continue}let x1=x;while(x1+1<nx&&G[ix(x1+1,y,z)])x1++;const k=x+'|'+x1,o=open.get(k);if(o&&o.z1==z-1)o.z1=z;else{const s={x0:x,x1,z0:z,z1:z};open.set(k,s);row.push(s)}x=x1+1}}}
const out=[];let prev=new Map;for(let y=0;y<ny;y++){const cur=new Map;for(const s of S[y]){const k=[s.x0,s.x1,s.z0,s.z1].join('|'),o=prev.get(k);if(o){o.y1=y;cur.set(k,o)}else{const b={...s,y0:y,y1:y};cur.set(k,b);out.push(b)}}prev=cur}
return out.map(b=>({C:'Part',Name:u.Name,Id:nid++,Shape:'Block',Position:V(bb.min.x+(b.x0+b.x1+1)/2*sx,bb.min.y+(b.y0+b.y1+1)/2*sy,bb.min.z+(b.z0+b.z1+1)/2*sw),Size:V((b.x1-b.x0+1)*sx,(b.y1-b.y0+1)*sy,(b.z1-b.z0+1)*sw),Orientation:V(0,0,0),Anchored:true,CanCollide:true,CanTouch:true,Friction:u.Friction||.3,Elasticity:.3,Density:1,AssemblyLinearVelocity:V(0,0,0),Touched:u.Touched}))}
window.UC=new WeakMap;
window.buildUnion=function(u){const old=M.get(u);if(old){scene.remove(old);old.geometry.dispose();M.delete(u)}UC.set(u,[]);
const ch=u.K.filter(c=>PART.includes(c.C)),pos=ch.filter(c=>!c.Negative),neg=ch.filter(c=>c.Negative);if(!pos.length)return;
let ps=partPolys(pos[0]);for(const c of pos.slice(1))ps=u.Mode=='Intersect'?opI(ps,partPolys(c)):opU(ps,partPolys(c));for(const c of neg)ps=opS(ps,partPolys(c));
if(!ps.length)return;const g=geo(ps),m=new TH.Mesh(g,new TH.MeshStandardMaterial({roughness:.8}));m.castShadow=m.receiveShadow=true;m.userData.i=u;M.set(u,m);sync(u);inWS(u)&&scene.add(m);
const P=pos.map(inside),N=neg.map(inside),I=u.Mode=='Intersect';UC.set(u,boxes(u,g,p=>(I?P.every(f=>f(p)):P.some(f=>f(p)))&&!N.some(f=>f(p))));dirty=1}})();
