// Image helpers for the publish dialog: pick a file, centre-crop it to a size, return a small JPEG data URL.
window.IMG={
pick(){return new Promise(res=>{const i=document.createElement('input');i.type='file';i.accept='image/png,image/jpeg,image/webp,image/gif';i.onchange=()=>res(i.files[0]||null);i.oncancel=()=>res(null);i.click()})},
load(src){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(Error('That file is not a readable image.'));i.src=src})},
async fit(src,w,h,q=.8){if(!src)return'';const i=await IMG.load(src),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#25262b';x.fillRect(0,0,w,h);
const s=Math.max(w/i.width,h/i.height),dw=i.width*s,dh=i.height*s;x.imageSmoothingQuality='high';x.drawImage(i,(w-dw)/2,(h-dh)/2,dw,dh);
let u=c.toDataURL('image/jpeg',q);for(let k=0;u.length>150000&&k<4;k++){q-=.12;u=c.toDataURL('image/jpeg',q)}return u},
async file(f,w,h){if(!f||!/^image\//.test(f.type))throw Error('Please choose an image file (PNG, JPG or WebP).');if(f.size>8e6)throw Error('That image is too big (max 8 MB).');
const u=URL.createObjectURL(f);try{return await IMG.fit(u,w,h)}finally{URL.revokeObjectURL(u)}}};
