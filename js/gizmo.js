// Gizmos modeled on Roblox draggers: Move = axis arrows, Scale = face handles, Rotate = axis rings.
// Snaps: 1 stud (move/scale), 15 degrees (rotate), like Studio's Snap to Grid defaults.
let tool='select',gh=[],drag=null;const gz=new T.Group(),COL=[0xff4d4d,0x4dff4d,0x4d8dff],AXV=[new T.Vector3(1,0,0),new T.Vector3(0,1,0),new T.Vector3(0,0,1)],D=Math.PI/180,SNAP_R=15*D;
scene.add(gz);gz.visible=false;
const eul=i=>{const r=i.Orientation;return new T.Euler(r.X*D,r.Y*D,r.Z*D,'YXZ')};
function setTool(t){tool=t;document.querySelectorAll('#tools button').forEach(b=>b.classList.toggle('on',b.dataset.t==t));buildGz()}
function buildGz(){gz.clear();gh=[];if(tool=='select')return;
[0,1,2].forEach(a=>{const g=new T.Group(),mt=new T.MeshBasicMaterial({color:COL[a],depthTest:false,transparent:true}),add=(geo,y,ud)=>{const m=new T.Mesh(geo,mt);m.position.y=y;m.renderOrder=999;m.userData=ud;g.add(m);gh.push(m)};
if(tool=='move'){add(new T.CylinderGeometry(.05,.05,1.2),.6,{a});add(new T.ConeGeometry(.2,.5),1.45,{a})}
else if(tool=='scale')[1,-1].forEach(sg=>{add(new T.CylinderGeometry(.03,.03,1.1),sg*.55,{a,sg});add(new T.BoxGeometry(.3,.3,.3),sg*1.25,{a,sg})});
else{const m=new T.Mesh(new T.TorusGeometry(1.5,.07,8,56),mt);m.renderOrder=999;m.userData={a};if(a==0)m.rotation.y=Math.PI/2;if(a==1)m.rotation.x=Math.PI/2;g.add(m);gh.push(m)}
if(tool!='rotate'){if(a==0)g.rotation.z=-Math.PI/2;if(a==2)g.rotation.x=Math.PI/2}gz.add(g)})}
function gzPos(){const on=!playing&&sel&&sel.Position?.X!==undefined&&tool!='select'&&M.has(sel);gz.visible=!!on;if(!on)return;const p=sel.Position;gz.position.set(p.X,p.Y,p.Z);gz.scale.setScalar(cam.position.distanceTo(gz.position)*.1);tool=='scale'?gz.quaternion.setFromEuler(eul(sel)):gz.quaternion.identity()}
function axp(ax,c){const o=ray.ray.origin,d=ray.ray.direction,w=c.clone().sub(o),b=ax.dot(d);return(b*d.dot(w)-ax.dot(w))/(1-b*b||1e-6)}
function ang(n,c,a){const o=ray.ray.origin,d=ray.ray.direction,t=c.clone().sub(o).dot(n)/(d.dot(n)||1e-6),pt=o.clone().addScaledVector(d,t).sub(c);return Math.atan2(pt.dot(AXV[(a+2)%3]),pt.dot(AXV[(a+1)%3]))}
function gzDown(){if(playing||!sel||tool=='select'||!gz.visible)return false;const h=ray.intersectObjects(gh,false)[0];if(!h)return false;const{a,sg=1}=h.object.userData,ax=AXV[a].clone().applyQuaternion(gz.quaternion),c=gz.position.clone();
drag={a,sg,ax,c,p0:{...sel.Position},s0:{...sel.Size},q0:new T.Quaternion().setFromEuler(eul(sel)),v0:tool=='rotate'?ang(ax,c,a):axp(ax,c)};return true}
function gzMove(){const{a,sg,ax,c,p0,s0,q0,v0}=drag,n='XYZ'[a];
if(tool=='move'){const s=Math.round(axp(ax,c)-v0);sel.Position=V(p0.X+ax.x*s,p0.Y+ax.y*s,p0.Z+ax.z*s)}
else if(tool=='scale'){const ns=Math.max(.05,s0[n]+Math.round((axp(ax,c)-v0)*sg)),k=sg*(ns-s0[n])/2;sel.Size={...s0,[n]:ns};sel.Position=V(p0.X+ax.x*k,p0.Y+ax.y*k,p0.Z+ax.z*k)}
else{const da=Math.round((ang(ax,c,a)-v0)/SNAP_R)*SNAP_R,q=new T.Quaternion().setFromAxisAngle(ax,da).multiply(q0),e=new T.Euler().setFromQuaternion(q,'YXZ');sel.Orientation=V(e.x/D,e.y/D,e.z/D)}}
