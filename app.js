(function(){
'use strict';
const $=s=>document.querySelector(s);
const DEG=Math.PI/180, TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const FF='-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif';
const LANDC='#3a4d41';

/* ───────── DOM / 캔버스 ───────── */
const stage=$('#stage'), cvB=$('#base'), cvT=$('#top'), cvS=$('#stars');
const cb=cvB.getContext('2d'), ct=cvT.getContext('2d'), cs=cvS.getContext('2d');
const lay=document.createElement('canvas'), cl=lay.getContext('2d');
let W=0,H=0,DPR=1,cx=0,cy=0,D=300,areaL=0,areaR=0,areaT=0,areaB=0,hd=500,sideMode=false;
const proj=d3.geoOrthographic().clipAngle(90).precision(0.5);
const pathB=d3.geoPath(proj,cb), pathT=d3.geoPath(proj,ct);
const view={lon:44,lat:34.5,s:1000};
const kOf=()=>view.s/(D*0.46);
const fitS=span=>D/(span*DEG);
const wrapLon=l=>((l+540)%360)-180;

/* ───────── 상태 ───────── */
let mode='old', showGeo=true, sceneI=0, scene=null, overlayA=1;
let layers=[], sel=null, dirty=true, lastCoarse=false, lastInter=0, anim=null;
const vel={lon:0,lat:0,on:false};
const placed=[], hits=[];
let set110=null,set50=null, modernLabels=[];

/* ───────── 지형 데이터 ───────── */
function maxDist(geom,c){let r=0;const rec=a=>{if(typeof a[0]==='number'){const d=d3.geoDistance(c,a);if(d>r)r=d;}else a.forEach(rec);};rec(geom.coordinates);return r;}
function buildSet(world){
  const feats=topojson.feature(world,world.objects.countries).features;
  return feats.map((f,i)=>{const c=d3.geoCentroid(f);return {f,c,r:maxDist(f.geometry,c),name:(f.properties&&f.properties.name)||'',h:(i*137.5)%360};});
}
function visRad(){const q=hd/view.s;return q>=1?Math.PI/2+0.02:Math.asin(q)+0.03;}
function cull(set){const c=[view.lon,view.lat],vr=visRad();return set.filter(it=>d3.geoDistance(c,it.c)-it.r<vr);}

/* ───────── 장면 준비 ───────── */
const ringCache=new Map(); let ringId=0;
const isRing=r=>Array.isArray(r)&&r.length>2&&Array.isArray(r[0])&&typeof r[0][0]==='number';
function fixRing(r){
  let o=ringCache.get(r); if(o) return o;
  const a=r.map(p=>[p[0],p[1]]), f=a[0], l=a[a.length-1];
  if(f[0]!==l[0]||f[1]!==l[1]) a.push([f[0],f[1]]);
  let feat={type:'Feature',geometry:{type:'Polygon',coordinates:[a]}};
  if(d3.geoArea(feat)>TAU){a.reverse();feat={type:'Feature',geometry:{type:'Polygon',coordinates:[a]}};}
  const c=d3.geoCentroid(feat); let rad=0; a.forEach(p=>{const d=d3.geoDistance(c,p);if(d>rad)rad=d;});
  o={feat,area:d3.geoArea(feat),id:++ringId,c,rad}; ringCache.set(r,o); return o;
}
const resolve=p=>typeof p==='string'?[CITIES[p][1],CITIES[p][2]]:p;
function prepScene(s){
  if(s._ok) return; s._ok=true;
  s.pol.forEach(p=>{
    const rs=(isRing(p.poly)?[p.poly]:p.poly).map(fixRing);
    p._r=rs; p._sig=rs.map(r=>r.id).join('-'); p._area=rs.reduce((a,r)=>a+r.area,0);
    const big=rs.reduce((a,b)=>b.area>a.area?b:a); p._lab=p.label||big.c; p._rad=big.rad;
  });
  s._cities=(s.cities||[]).map(c=>{const k=Array.isArray(c)?c[0]:c,d=CITIES[k];if(!d)return null;
    return {key:k,name:Array.isArray(c)?c[1]:d[0],lon:d[1],lat:d[2],pr:d[3],desc:d[4]};}).filter(Boolean);
  (s.routes||[]).forEach(r=>{
    r._pts=r.pts.map(resolve);
    let len=0;const seg=[];for(let i=1;i<r._pts.length;i++){const d=d3.geoDistance(r._pts[i-1],r._pts[i]);seg.push(d);len+=d;}
    let h=len/2,i=0;while(i<seg.length-1&&h>seg[i]){h-=seg[i];i++;}
    r._mid=seg.length?d3.geoInterpolate(r._pts[i],r._pts[i+1])(seg[i]?clamp(h/seg[i],0,1):0.5):r._pts[0];
  });
}
function setScenePolys(s){
  const want=new Map(s.pol.map(p=>[p.id+'|'+p._sig,p]));
  layers.forEach(l=>{l.t=want.has(l.key)?1:0;});
  want.forEach((p,key)=>{const ex=layers.find(l=>l.key===key);if(ex){ex.p=p;ex.t=1;}else layers.push({key,p,a:0,t:1});});
}

/* ───────── 크기 ───────── */
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  const oldD=D;
  W=stage.clientWidth; H=stage.clientHeight;
  [cvB,cvT,cvS,lay].forEach(c=>{c.width=Math.round(W*DPR);c.height=Math.round(H*DPR);});
  const sh=$('#sheet').getBoundingClientRect();
  sideMode=sh.width<W*0.85;
  areaT=96; areaL=0; areaR=sideMode?sh.left:W; areaB=sideMode?H:sh.top;
  if(areaB-areaT<200) areaB=areaT+200;
  cx=(areaL+areaR)/2; cy=(areaT+areaB)/2;
  D=Math.max(180,Math.min(areaR-areaL,areaB-areaT));
  hd=Math.max(Math.hypot(cx,cy),Math.hypot(W-cx,cy),Math.hypot(cx,H-cy),Math.hypot(W-cx,H-cy));
  if(oldD&&oldD!==D&&view.s) view.s*=D/oldD;
  const card=$('#card'); if(!sideMode) card.style.bottom=(H-sh.top+10)+'px'; else card.style.bottom='16px';
  drawStars(); dirty=true;
}
function drawStars(){
  cs.setTransform(DPR,0,0,DPR,0,0); cs.clearRect(0,0,W,H);
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  for(let i=0;i<150;i++){const x=rnd()*W,y=rnd()*H,r=rnd()*1.1+.2;cs.fillStyle='rgba(200,220,255,'+(0.18+rnd()*.5)+')';cs.beginPath();cs.arc(x,y,r,0,TAU);cs.fill();}
}

/* ───────── 보기 이동 ───────── */
function applyView(){proj.rotate([-view.lon,-view.lat,0]).scale(view.s).translate([cx,cy]);}
function clampView(){view.lat=clamp(view.lat,-85,85);view.lon=wrapLon(view.lon);const R=D*0.46;view.s=clamp(view.s,R*0.7,R*80);}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function flyTo(lon,lat,span,dur){
  const s1=clamp(fitS(span),D*0.46*0.7,D*0.46*80);
  const from={lon:view.lon,lat:view.lat,s:view.s};
  const gi=d3.geoInterpolate([view.lon,view.lat],[lon,lat]);
  const dist=d3.geoDistance([view.lon,view.lat],[lon,lat]);
  anim={t0:performance.now(),dur:dur||1500,from,s1,gi,dist};vel.on=false;
}
function stepAnim(now){
  const a=anim,t=clamp((now-a.t0)/a.dur,0,1),e=ease(t);
  const p=a.gi(e);view.lon=p[0];view.lat=p[1];
  const dip=Math.min(0.9,a.dist*1.1)*Math.sin(Math.PI*e);
  view.s=Math.exp(Math.log(a.from.s)+(Math.log(a.s1)-Math.log(a.from.s))*e-dip);
  if(t>=1){view.s=a.s1;anim=null;}
  clampView();
}

/* ───────── 그리기: 바탕 ───────── */
const gratCache={};
const grat=step=>gratCache[step]||(gratCache[step]=d3.geoGraticule().step([step,step])());
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')';};
const light=(hex,f)=>{const n=parseInt(hex.slice(1),16);const m=v=>Math.round(v+(255-v)*f);return 'rgb('+m(n>>16)+','+m((n>>8)&255)+','+m(n&255)+')';};

function drawBase(now){
  cb.setTransform(DPR,0,0,DPR,0,0); cb.clearRect(0,0,W,H);
  applyView();
  const s=view.s,k=kOf(),inter=(now-lastInter)<220;
  const fine=!inter||k>=2.2, set=(fine&&set50)?set50:set110;
  lastCoarse=!(fine&&set50)&&!!set50;
  if(!set) return;
  // 대기·바다
  const cover=s>hd*1.02;
  if(!cover){
    const g2=cb.createRadialGradient(cx,cy,s*0.98,cx,cy,s*1.13);
    g2.addColorStop(0,'rgba(120,190,255,.40)');g2.addColorStop(1,'rgba(120,190,255,0)');
    cb.fillStyle=g2;cb.beginPath();cb.arc(cx,cy,s*1.13,0,TAU);cb.fill();
  }
  const g=cb.createRadialGradient(cx-s*.28,cy-s*.34,s*.04,cx,cy,s);
  g.addColorStop(0,'#1d5782');g.addColorStop(.55,'#133f66');g.addColorStop(1,'#08223b');
  cb.fillStyle=g;
  if(cover) cb.fillRect(0,0,W,H); else {cb.beginPath();pathB({type:'Sphere'});cb.fill();}
  // 육지 레이어
  cl.setTransform(DPR,0,0,DPR,0,0); cl.globalCompositeOperation='source-over'; cl.globalAlpha=1; cl.setLineDash([]); cl.clearRect(0,0,W,H);
  const items=cull(set), land=new Path2D(), gl=d3.geoPath(proj,land);
  items.forEach(it=>gl(it.f));
  cl.lineJoin='round'; cl.lineWidth=2.8; cl.strokeStyle='rgba(150,205,240,.5)'; cl.stroke(land);
  cl.fillStyle=LANDC; cl.fill(land);
  cl.globalCompositeOperation='source-atop';
  if(k>=0.9&&typeof DESERTS!=='undefined'){
    cl.lineJoin='round';
    DESERTS.forEach(r=>{const p2=new Path2D();d3.geoPath(proj,p2)({type:'Polygon',coordinates:[fixDesert(r)]});
      cl.strokeStyle='rgba(224,186,122,.035)';[28,17].forEach(w=>{cl.lineWidth=w;cl.stroke(p2);});
      cl.fillStyle='rgba(224,186,122,.12)';cl.fill(p2);});
  }
  if(mode==='now'){
    items.forEach(it=>{const p2=new Path2D();d3.geoPath(proj,p2)(it.f);cl.fillStyle='hsla('+it.h+',42%,52%,.42)';cl.fill(p2);});
  }else{
    drawPolities();
  }
  if(mode!=='old'){
    cl.globalCompositeOperation='source-over';
    cl.lineWidth=mode==='now'?1:0.9; cl.strokeStyle=mode==='now'?'rgba(255,255,255,.55)':'rgba(255,255,255,.4)';
    cl.setLineDash(mode==='now'?[]:[4,3]); cl.stroke(land); cl.setLineDash([]);
  }
  cb.setTransform(1,0,0,1,0,0); cb.drawImage(lay,0,0); cb.setTransform(DPR,0,0,DPR,0,0);
  // 위선·경선
  cb.lineWidth=.6; cb.strokeStyle='rgba(190,220,255,.10)'; cb.beginPath(); pathB(grat(k<5?10:(k<20?5:1))); cb.stroke();
  // 호수·강
  if(typeof LAKES!=='undefined'&&k>=1.5){
    LAKES.forEach(l=>{cb.beginPath();pathB({type:'Polygon',coordinates:[fixDesert(l.ring)]});cb.fillStyle='#2a6a9c';cb.fill();cb.strokeStyle='rgba(150,205,240,.7)';cb.lineWidth=.9;cb.stroke();});
  }
  if(typeof RIVERS!=='undefined'){
    cb.lineJoin='round';cb.lineCap='round';
    RIVERS.forEach(r=>{
      if(k<(r.minK||0)) return;
      cb.beginPath();pathB({type:'LineString',coordinates:r.c});
      cb.strokeStyle='rgba(120,190,240,.9)';cb.lineWidth=Math.max(1,r.w*Math.min(2.4,.55+k*.17));cb.stroke();
    });
  }
  // 둘레
  if(!cover){cb.beginPath();pathB({type:'Sphere'});cb.strokeStyle='rgba(170,215,255,.35)';cb.lineWidth=1.2;cb.stroke();}
}
const deskCache=new Map();
function fixDesert(r){
  let o=deskCache.get(r);if(o)return o;
  const a=r.map(p=>[p[0],p[1]]),f=a[0],l=a[a.length-1];if(f[0]!==l[0]||f[1]!==l[1])a.push([f[0],f[1]]);
  if(d3.geoArea({type:'Polygon',coordinates:[a]})>TAU)a.reverse();
  deskCache.set(r,a);return a;
}
function drawPolities(){
  const c0=[view.lon,view.lat],vr=visRad();
  const ls=layers.slice().sort((a,b)=>b.p._area-a.p._area);
  ls.forEach(l=>{
    const p=l.p; if(l.a<=0.01) return;
    const rs=p._r.filter(r=>d3.geoDistance(c0,r.c)-r.rad<vr); if(!rs.length) return;
    const p2=new Path2D(), g=d3.geoPath(proj,p2); rs.forEach(r=>g(r.feat));
    const al=p.alpha!=null?p.alpha:(p.dash?0.32:0.52);
    cl.fillStyle=rgba(p.col,al*l.a); cl.fill(p2);
    cl.lineWidth=p.rank===3?1.1:1.6; cl.strokeStyle=rgba(toHex(light(p.col,.35)),.95*l.a);
    cl.setLineDash(p.dash?[5,4]:[]); cl.stroke(p2); cl.setLineDash([]);
  });
}
function toHex(rgb){const m=rgb.match(/\d+/g).map(Number);return '#'+m.map(v=>v.toString(16).padStart(2,'0')).join('');}

/* ───────── 그리기: 라벨·경로 ───────── */
const wcache=new Map();
function tw(font,text){const k=font+'|'+text;let v=wcache.get(k);if(v==null){ct.font=font;v=ct.measureText(text).width;wcache.set(k,v);}return v;}
const free=r=>{for(const q of placed){if(r.x<q.x+q.w&&r.x+r.w>q.x&&r.y<q.y+q.h&&r.y+r.h>q.y)return false;}return true;};
const inArea=(x,y)=>x>areaL+4&&x<areaR-4&&y>areaT-24&&y<areaB+10&&!(x<210&&y<196)&&!(x>areaR-82&&y<252);
function put(x,y,lines,o){
  let w=0,h=0;lines.forEach(l=>{l.w=tw(l.f,l.t);l.h=l.hh||15;w=Math.max(w,l.w);h+=l.h;});
  const cands=o.cands||[[0,0,'c']];
  for(let i=0;i<cands.length;i++){
    const [ox,oy,an]=cands[i];
    const rx=an==='c'?x+ox-w/2:an==='l'?x+ox:x+ox-w, ry=y+oy-h/2;
    const r={x:rx-3,y:ry-1,w:w+6,h:h+2};
    if(!o.force&&!free(r)) continue;
    placed.push(r);
    ct.save(); ct.globalAlpha=o.alpha==null?1:o.alpha; ct.textBaseline='middle'; ct.textAlign='left'; ct.lineJoin='round';
    let yy=ry;
    lines.forEach(l=>{
      const lx=an==='c'?rx+(w-l.w)/2:an==='l'?rx:rx+(w-l.w);
      ct.font=l.f; ct.lineWidth=3.4; ct.strokeStyle='rgba(5,11,21,.9)'; ct.strokeText(l.t,lx,yy+l.h/2);
      ct.fillStyle=l.c; ct.fillText(l.t,lx,yy+l.h/2); yy+=l.h;
    });
    ct.restore(); return r;
  }
  return null;
}
function evPos(ev){if(!ev||!ev.at)return null;if(typeof ev.at==='string'){const d=CITIES[ev.at];return d?[d[1],d[2]]:null;}return ev.at;}

function drawTop(now){
  ct.setTransform(DPR,0,0,DPR,0,0); ct.clearRect(0,0,W,H);
  if(!scene||!set110) return;
  applyView();
  placed.length=0; hits.length=0;
  const k=kOf(), c0=[view.lon,view.lat], oa=overlayA;
  const vis=(lon,lat)=>d3.geoDistance(c0,[lon,lat])<1.5;
  const P2=(lon,lat)=>proj([lon,lat]);
  const items=[];

  // 선택한 나라 윤곽
  if(sel&&sel.type==='polity'){
    ct.save();ct.lineJoin='round';
    sel.p._r.forEach(r=>{ct.beginPath();pathT(r.feat);ct.strokeStyle='rgba(0,0,0,.55)';ct.lineWidth=5;ct.stroke();ct.strokeStyle='#fff';ct.lineWidth=2.2;ct.stroke();});
    ct.restore();
  }
  // 경로
  const rts=scene.routes||[];
  rts.forEach(r=>{
    const hl=sel&&sel.type==='route'&&sel.r===r, dim=sel&&sel.type==='route'&&!hl;
    const line={type:'LineString',coordinates:r._pts};
    ct.save();ct.lineCap='round';ct.lineJoin='round';ct.globalAlpha=oa*(dim?.35:1);
    ct.setLineDash([]);ct.beginPath();pathT(line);ct.lineWidth=hl?6.4:4.8;ct.strokeStyle='rgba(4,9,18,.6)';ct.stroke();
    ct.setLineDash(r.dash?[2,7]:[8,6]);ct.lineDashOffset=-((now/40)%14);
    ct.beginPath();pathT(line);ct.lineWidth=hl?3.6:2.7;ct.strokeStyle=r.col;ct.stroke();
    ct.restore();
    // 화살표
    ct.save();ct.globalAlpha=oa*(dim?.35:1);ct.fillStyle=r.col;ct.strokeStyle='rgba(4,9,18,.7)';ct.lineWidth=1;
    for(let i=1;i<r._pts.length;i++){
      const a=r._pts[i-1],b=r._pts[i];if(a[0]===b[0]&&a[1]===b[1])continue;
      const gi=d3.geoInterpolate(a,b),m=gi(.5);if(!vis(m[0],m[1]))continue;
      const pa=proj(a),pb=proj(b);if(!pa||!pb)continue;
      if(Math.hypot(pa[0]-pb[0],pa[1]-pb[1])<44)continue;
      const q1=proj(gi(.46)),q2=proj(gi(.54));if(!q1||!q2)continue;
      const ang=Math.atan2(q2[1]-q1[1],q2[0]-q1[0]),pm=proj(m),sz=hl?8:6.5;
      ct.save();ct.translate(pm[0],pm[1]);ct.rotate(ang);ct.beginPath();ct.moveTo(sz,0);ct.lineTo(-sz*.7,-sz*.75);ct.lineTo(-sz*.7,sz*.75);ct.closePath();ct.fill();ct.stroke();ct.restore();
    }
    // 시작점
    const s0=r._pts[0];if(vis(s0[0],s0[1])){const p=proj(s0);ct.beginPath();ct.arc(p[0],p[1],5,0,TAU);ct.fillStyle='#0b1424';ct.fill();ct.lineWidth=2.4;ct.strokeStyle=r.col;ct.stroke();}
    ct.restore();
    if(vis(r._mid[0],r._mid[1])){
      const p=P2(r._mid[0],r._mid[1]);
      if(inArea(p[0],p[1])) items.push({pr:hl?400:52,run:()=>put(p[0],p[1]-12,[{t:r.name,f:'700 11.5px '+FF,c:r.col}],{alpha:oa*(dim?.4:1),cands:[[0,0,'c'],[0,-16,'c'],[0,16,'c']]})});
    }
  });

  // 나라 이름
  if(mode!=='now'){
    layers.forEach(l=>{
      const p=l.p;if(l.t!==1||l.a<.45||p.nolabel)return;
      const lon=p._lab[0],lat=p._lab[1];if(!vis(lon,lat))return;
      const q=P2(lon,lat);if(!inArea(q[0],q[1]))return;
      const rpx=p._rad*view.s, rk=p.rank||2;
      const th=rk===1?20:rk===2?26:15;if(rpx<th)return;
      const fs=rk===1?clamp(rpx*.15,13,23):rk===2?clamp(rpx*.15,11.5,17):clamp(rpx*.2,10.5,13);
      const lines=[{t:p.name,f:'800 '+fs.toFixed(1)+'px '+FF,c:'#fff',hh:fs+3}];
      if(p.sub&&fs>=11.5&&rpx>fs*3.2) lines.push({t:p.sub,f:'500 '+Math.max(9.5,fs*.68).toFixed(1)+'px '+FF,c:'#d4deec',hh:Math.max(9.5,fs*.68)+3});
      const sl=sel&&sel.type==='polity'&&sel.p===p;
      items.push({pr:sl?450:(p.id.startsWith('t_')?93:rk===1?100:rk===2?70:45),run:()=>put(q[0],q[1],lines,{alpha:oa*l.a,force:sl})});
    });
  }
  // 지금 나라 이름
  if(mode!=='old'){
    modernLabels.forEach(m=>{
      if(!vis(m.c[0],m.c[1]))return;const q=P2(m.c[0],m.c[1]);if(!inArea(q[0],q[1]))return;
      const rpx=m.r*view.s;if(rpx<24)return;
      const fs=clamp(rpx*.12,10,mode==='now'?17:12.5);
      items.push({pr:mode==='now'?85:18,run:()=>put(q[0],q[1],[{t:m.ko,f:(mode==='now'?'700 ':'italic 500 ')+fs.toFixed(1)+'px '+FF,c:mode==='now'?'#fff':'#c3cfdf'}],{alpha:mode==='now'?1:.8})});
    });
  }
  // 지리 라벨
  if(showGeo){
    GEO.forEach(g=>{
      if(k<(g.minK||0))return;if(!vis(g.c[0],g.c[1]))return;const q=P2(g.c[0],g.c[1]);if(!inArea(q[0],q[1]))return;
      let f,c,pr,t=g.n;
      if(g.kind==='sea'){f='italic 600 '+clamp(11+k*.9,11,15)+'px '+FF;c='#8cc4f2';pr=24;}
      else if(g.kind==='land'){f='700 '+clamp(11+k*.6,11,14.5)+'px '+FF;c='rgba(236,241,250,.7)';pr=56;}
      else if(g.kind==='mtn'){f='600 11px '+FF;c='#d9c392';pr=38;t='▲ '+g.n;}
      else {f='italic 600 11px '+FF;c='#bcd3ea';pr=34;}
      const lines=[{t,f,c}];if(g.sub&&k>=Math.max(g.minK||0,1.4)*1.1&&g.kind!=='mtn')lines.push({t:g.sub,f:'italic 500 10px '+FF,c:'rgba(200,215,235,.7)',hh:12});
      items.push({pr,run:()=>put(q[0],q[1],lines,{alpha:.95})});
    });
    if(typeof RIVERS!=='undefined')RIVERS.forEach(r=>{
      if(k<(r.minK||0)||!r.lab)return;if(!vis(r.lab[0],r.lab[1]))return;const q=P2(r.lab[0],r.lab[1]);if(!inArea(q[0],q[1]))return;
      items.push({pr:30,run:()=>put(q[0],q[1],[{t:r.n,f:'italic 600 11px '+FF,c:'#8fc8f3'}],{})});
    });
  }
  // 장면 고유 라벨
  (scene.labels||[]).forEach(g=>{
    if(!vis(g.c[0],g.c[1]))return;const q=P2(g.c[0],g.c[1]);if(!inArea(q[0],q[1]))return;
    items.push({pr:g.ghost?40:60,run:()=>put(q[0],q[1],[{t:g.n,f:(g.ghost?'italic 600 ':'700 ')+'12px '+FF,c:g.ghost?'rgba(215,224,238,.55)':'rgba(240,244,252,.8)'}],{alpha:oa})});
  });
  // 도시
  const cityList=scene._cities.slice();
  const selCity=sel&&(sel.type==='city'?sel.key:sel.type==='event'&&typeof sel.ev.at==='string'?sel.ev.at:null);
  if(selCity&&!cityList.some(c=>c.key===selCity)&&CITIES[selCity]){const d=CITIES[selCity];cityList.push({key:selCity,name:d[0],lon:d[1],lat:d[2],pr:d[3],desc:d[4]});}
  cityList.forEach(c=>{
    const isSel=c.key===selCity;
    if(!isSel){if(c.pr>=3&&k<2.4)return;if(c.pr===2&&k<1.4)return;}
    if(!vis(c.lon,c.lat))return;const q=P2(c.lon,c.lat);if(!inArea(q[0],q[1]))return;
    hits.push({x:q[0],y:q[1],r:20,city:c});
    const rr=c.pr===1?4.4:c.pr===2?3.7:3.1;
    ct.save();ct.globalAlpha=oa;ct.beginPath();ct.arc(q[0],q[1],rr,0,TAU);ct.fillStyle=isSel?'#fff':'#f7d775';ct.fill();ct.lineWidth=1.6;ct.strokeStyle='rgba(8,14,26,.95)';ct.stroke();ct.restore();
    const fs=c.pr===1?13:c.pr===2?12:11;
    items.push({pr:isSel?500:(c.pr===1?90:c.pr===2?62:36),run:()=>put(q[0],q[1],[{t:c.name,f:(c.pr===1?'700 ':'600 ')+fs+'px '+FF,c:isSel?'#fff':'#fff3cf'}],{alpha:oa,force:isSel,cands:[[8,0,'l'],[-8,0,'r'],[0,-12,'c'],[0,13,'c']]})});
  });
  // 선택한 사건 표시
  if(sel&&sel.type==='event'){
    const pos=evPos(sel.ev);
    if(pos&&vis(pos[0],pos[1])){
      const q=P2(pos[0],pos[1]),ph=(now%1600)/1600;
      ct.save();ct.beginPath();ct.arc(q[0],q[1],8+ph*20,0,TAU);ct.strokeStyle='rgba(255,230,140,'+(1-ph)*.9+')';ct.lineWidth=2.4;ct.stroke();
      ct.beginPath();ct.arc(q[0],q[1],5,0,TAU);ct.fillStyle='#ffe28a';ct.fill();ct.lineWidth=1.8;ct.strokeStyle='#0b1424';ct.stroke();ct.restore();
      if(typeof sel.ev.at!=='string') items.push({pr:480,run:()=>put(q[0],q[1]-16,[{t:sel.ev.t,f:'800 13px '+FF,c:'#ffe9a8'}],{force:true})});
    }
  }
  items.sort((a,b)=>b.pr-a.pr);items.forEach(it=>it.run());
}

/* ───────── 메인 루프 ───────── */
let last=performance.now(), lastTopT=0, needFine=false;
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(64,now-last); last=now;
  let d=dirty;
  if(anim){stepAnim(now);d=true;lastInter=now;}
  if(vel.on){
    view.lon+=vel.lon*dt;view.lat+=vel.lat*dt;clampView();
    const f=Math.exp(-dt/300);vel.lon*=f;vel.lat*=f;
    if(Math.abs(vel.lon)+Math.abs(vel.lat)<0.0004)vel.on=false;
    d=true;lastInter=now;
  }
  let fading=false;
  layers.forEach(l=>{const t=l.t;if(l.a!==t){l.a=t>l.a?Math.min(t,l.a+dt/430):Math.max(t,l.a-dt/430);fading=true;}});
  if(fading){layers=layers.filter(l=>!(l.t===0&&l.a<=0));d=true;}
  if(overlayA<1){overlayA=Math.min(1,overlayA+dt/450);d=true;}
  if(lastCoarse&&now-lastInter>=220){d=true;}
  if(d){dirty=false;drawBase(now);drawTop(now);lastTopT=now;}
  else if(scene&&((scene.routes&&scene.routes.length)||(sel&&sel.type==='event'))&&now-lastTopT>60){drawTop(now);lastTopT=now;}
}

/* ───────── 입력 ───────── */
const ptrs=new Map(); let drag=null, pinch=null;
function markInter(){lastInter=performance.now();}
stage.addEventListener('pointerdown',e=>{
  try{stage.setPointerCapture(e.pointerId);}catch(_){}ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  anim=null;vel.on=false;
  if(ptrs.size===1)drag={x:e.clientX,y:e.clientY,moved:0,t:performance.now(),vl:0,vt:0};
  else if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:view.s};drag=null;}
});
stage.addEventListener('pointermove',e=>{
  const p=ptrs.get(e.pointerId);if(!p)return;
  const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(ptrs.size===1&&drag){
    drag.moved+=Math.abs(dx)+Math.abs(dy);
    const dg=57.2958/view.s,now=performance.now(),dtm=Math.max(1,now-drag.t);
    view.lon-=dx*dg;view.lat+=dy*dg;clampView();
    drag.vl=drag.vl*.6+(-dx*dg/dtm)*.4;drag.vt=drag.vt*.6+(dy*dg/dtm)*.4;drag.t=now;
    dirty=true;markInter();
  }else if(ptrs.size===2&&pinch){
    const [a,b]=[...ptrs.values()],dd=Math.hypot(a.x-b.x,a.y-b.y);
    view.s=pinch.s*dd/pinch.d;clampView();dirty=true;markInter();
  }
});
function up(e){
  const had=ptrs.delete(e.pointerId);if(!had)return;
  if(ptrs.size===0&&drag){
    const d=drag;drag=null;
    if(d.moved<7){tap(e.clientX,e.clientY);}
    else if(performance.now()-d.t<90&&Math.abs(d.vl)+Math.abs(d.vt)>0.004){vel.lon=d.vl;vel.lat=d.vt;vel.on=true;}
  }
  if(ptrs.size<2)pinch=null;
}
stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
stage.addEventListener('wheel',e=>{e.preventDefault();anim=null;view.s*=Math.exp(-e.deltaY*0.0016);clampView();dirty=true;markInter();},{passive:false});

function tap(x,y){
  // 도시
  let best=null,bd=1e9;
  hits.forEach(h=>{const d=Math.hypot(h.x-x,h.y-y);if(d<h.r&&d<bd){bd=d;best=h;}});
  if(best){selectCity(best.city);return;}
  applyView();
  const ll=proj.invert([x,y]);
  if(ll){
    if(mode!=='now'){
      const cand=layers.filter(l=>l.t===1&&l.a>.5&&l.p._r.some(r=>d3.geoContains(r.feat,ll)));
      if(cand.length){cand.sort((a,b)=>a.p._area-b.p._area);selectPolity(cand[0].p);return;}
    }
    if(mode!=='old'&&set110){
      const c=set110.find(it=>d3.geoContains(it.f,ll));
      if(c){const ko=MODERN_KO[c.name];sel={type:'modern'};showCard({title:ko||c.name,sub:ko?c.name:'',ref:'현재의 나라',desc:'지금의 국경 기준입니다. 옛 나라와 비교하며 보세요.',col:'#9fb4d0'});dirty=true;return;}
    }
  }
  closeCard();
}

const DESC_FB=[
 [/^moab/,'롯의 딸에게서 난 모압 사람의 나라. 요단 동편 사해 동쪽 고원에 있었고, 룻의 고향입니다 (창 19:37; 룻 1장).'],
 [/^ammon/,'롯의 딸에게서 난 암몬 사람의 나라. 랍바(지금의 암만)가 수도였고 이스라엘과 자주 충돌했습니다 (창 19:38; 삿 11장).'],
 [/^edom/,'에서(에돔)의 후손이 세일 산지에 세운 나라. 이스라엘의 형제 나라이지만 오래 대립했습니다 (창 36장; 민 20:14–21).'],
 [/^amalek/,'에서의 손자 아말렉에게서 난 유목 부족. 광야에서 이스라엘을 처음 공격했고 오랜 적이 되었습니다 (출 17:8–16; 삼상 15장).'],
 [/^philistia/,'가사·아스글론·아스돗·가드·에그론, 다섯 도시를 중심으로 한 해안의 블레셋 사람들의 땅. 철제 무기로 이스라엘을 압박했습니다 (삿 13–16장; 삼상 4–7장).'],
 [/^phoen/,'두로와 시돈 등 해상 무역으로 번영한 베니게(페니키아) 도시국가들. 솔로몬의 성전 건축을 도왔습니다 (왕상 5장).'],
 [/^kush/,'나일강 상류(지금의 수단 북부)에 있던 구스 왕국. 구스 왕조가 한때 애굽을 다스렸습니다 (사 18장; 왕하 19:9).'],
 [/^carthage/,'페니키아 사람들이 북아프리카에 세운 해상 강국. 훗날 로마와 지중해의 패권을 다투었습니다.'],
 [/^assyria/,'티그리스강 상류의 앗수르. 훗날 강력한 제국이 되어 북이스라엘을 멸망시킵니다 (왕하 17장).'],
 [/^elam/,'이란 고원 남서부의 엘람 왕국. 수산이 중심 도시였습니다 (창 14:1; 단 8:2).'],
 [/^(babylonia|kassite)/,'유브라데·티그리스 하류 메소포타미아 남부의 바벨론. 훗날 신바벨론 제국이 되어 유다를 멸망시킵니다 (왕하 24–25장).'],
 [/^hamath/,'시리아 중부 오론테스강변의 하맛 왕국 (왕하 14:28; 사 10:9).'],
 [/^(egypt|ptol)/,'나일강 유역의 애굽. 이스라엘 역사에서 피난처이자 압제자로 거듭 등장합니다.'],
 [/^urartu/,'아라랏(우라르투) 지방에서 일어난 산악 왕국. 앗수르와 맞섰습니다.'],
 [/^(mitanni|hittite)/,'가나안 북쪽의 강국. 애굽과 패권을 다투던 나라입니다.']
];
function descOf(p){
  const d=p.desc||'';
  if(d.length>=16) return d;
  for(const [re,t] of DESC_FB) if(re.test(p.id)) return (d&&d!==p.name?d+' ':'')+t;
  return d===p.name?'':d;
}
function selectPolity(p){
  sel={type:'polity',p};
  showCard({title:p.name,sub:p.sub||'',ref:p.ref||'',desc:descOf(p),col:p.col});dirty=true;
}
function selectCity(c){
  sel={type:'city',key:c.key};
  showCard({title:c.name,sub:'',ref:'',desc:c.desc||'',col:'#f7d775'});dirty=true;
}
function selectEvent(i){
  const ev=scene.events[i];sel={type:'event',ev};
  const pos=evPos(ev);if(pos){const sp=ev.span||8;flyTo(pos[0],pos[1]-sp*0.16,sp,1300);}
  showCard({title:ev.t,sub:'',ref:ev.ref||'',desc:ev.desc||'',col:'#ffe28a'});
  document.querySelectorAll('#evs .chip').forEach((c,j)=>c.classList.toggle('on',j===i));
  dirty=true;
}
function selectRoute(i){
  const r=scene.routes[i];sel={type:'route',r};
  let a=1e9,b=-1e9,c=1e9,d=-1e9;r._pts.forEach(p=>{a=Math.min(a,p[0]);b=Math.max(b,p[0]);c=Math.min(c,p[1]);d=Math.max(d,p[1]);});
  const lat=(c+d)/2,span=Math.max((b-a)*Math.cos(lat*DEG),d-c,5)*1.4;
  flyTo((a+b)/2,lat,span,1300);
  showCard({title:r.name,sub:'',ref:'',desc:r.desc||'',col:r.col});
  document.querySelectorAll('#rts .chip').forEach((c,j)=>c.classList.toggle('on',j===i));
  dirty=true;
}
function showCard(o){
  $('#cardT').textContent=o.title;$('#cardS').textContent=o.sub||'';
  const r=$('#cardR');r.textContent=o.ref||'';r.style.display=o.ref?'inline-block':'none';
  $('#cardD').textContent=o.desc||'';$('#card').style.setProperty('--c',o.col||'#f0c552');$('#card').classList.add('show');
}
function closeCard(){
  $('#card').classList.remove('show');sel=null;
  document.querySelectorAll('#evs .chip.on,#rts .chip.on').forEach(c=>c.classList.remove('on'));dirty=true;
}

/* ───────── 장면 전환·UI ───────── */
function setScene(i,fly){
  i=clamp(i,0,SCENES.length-1);sceneI=i;scene=SCENES[i];prepScene(scene);
  setScenePolys(scene);overlayA=0;
  sel=null;$('#card').classList.remove('show');
  $('#yb').textContent=scene.yb;$('#ys').textContent=scene.ys||'';
  $('#era').textContent=ERA_NAME[scene.era]||'';$('#korea').textContent=scene.korea?'🇰🇷 '+scene.korea.replace(/^한반도:\s*/,'한반도: '):'';
  $('#st').textContent=scene.title;$('#sref').textContent=scene.ref||'';
  const sum=$('#sum');sum.textContent=scene.sum||'';sum.classList.remove('open');
  $('#sl').value=i;
  const evs=$('#evs');evs.innerHTML='';
  scene.events.forEach((ev,j)=>{const b=document.createElement('button');b.className='chip';b.textContent=ev.t;b.onclick=()=>selectEvent(j);evs.appendChild(b);});
  evs.scrollLeft=0;
  const rts=$('#rts');rts.innerHTML='';
  (scene.routes||[]).forEach((r,j)=>{const b=document.createElement('button');b.className='chip rt';b.style.setProperty('--rc',r.col);b.textContent=r.name;b.onclick=()=>selectRoute(j);rts.appendChild(b);});
  $('#rtrow').style.display=(scene.routes&&scene.routes.length)?'flex':'none';
  document.querySelectorAll('#eras .chip').forEach(c=>{const on=c.dataset.era===scene.era;c.classList.toggle('on',on);if(on)c.scrollIntoView({inline:'center',block:'nearest'});});
  if(fly!==false)flyTo(scene.view[0],scene.view[1],scene.view[2],fly===0?1:1700);
  dirty=true;setTimeout(resize,30);
}
function buildUI(){
  const eras=$('#eras');
  ERAS.forEach(e=>{const b=document.createElement('button');b.className='chip era';b.textContent=e.n;b.dataset.era=e.id;b.onclick=()=>setScene(e.s);eras.appendChild(b);});
  const ticks=$('#ticks'),n=SCENES.length,starts=new Set(ERAS.map(e=>e.s));
  for(let i=0;i<n;i++){const t=document.createElement('i');t.style.left=(i/(n-1)*100)+'%';if(starts.has(i))t.className='e';ticks.appendChild(t);}
  $('#sl').max=n-1;
  $('#sl').addEventListener('input',e=>setScene(+e.target.value));
  $('#prev').onclick=()=>setScene(sceneI-1);$('#next').onclick=()=>setScene(sceneI+1);
  document.querySelectorAll('#modes button').forEach(b=>b.onclick=()=>{
    mode=b.dataset.m;document.querySelectorAll('#modes button').forEach(x=>x.classList.toggle('on',x===b));dirty=true;
    toast(mode==='old'?'옛 나라만 보입니다':mode==='both'?'옛 나라 위에 지금 국경을 겹쳤습니다':'지금의 나라 지도입니다');
  });
  $('#tHoly').onclick=()=>flyTo(35.2,31.9,7,1500);
  $('#tKorea').onclick=()=>flyTo(127.8,36.3,12,1900);
  let globeOn=false;
  $('#tGlobe').onclick=()=>{globeOn=!globeOn;$('#tGlobe').textContent=globeOn?'장면으로':'지구 전체';
    if(globeOn)flyTo(view.lon,view.lat,150,1500);else flyTo(scene.view[0],scene.view[1],scene.view[2],1500);};
  $('#tGeo').onclick=()=>{showGeo=!showGeo;$('#tGeo').textContent=showGeo?'지리 ✓':'지리';$('#tGeo').classList.toggle('on',showGeo);dirty=true;};
  $('#cardX').onclick=closeCard;
  $('#sum').onclick=()=>$('#sum').classList.toggle('open');
  $('#grab').onclick=()=>{$('#sheet').classList.toggle('collapsed');setTimeout(resize,30);};
  $('#btnInfo').onclick=()=>$('#about').classList.add('show');
  $('#aboutX').onclick=()=>$('#about').classList.remove('show');
  $('#about').addEventListener('click',e=>{if(e.target.id==='about')$('#about').classList.remove('show');});
  window.addEventListener('keydown',e=>{if(e.key==='ArrowRight')setScene(sceneI+1);else if(e.key==='ArrowLeft')setScene(sceneI-1);});
  if(window.ResizeObserver)new ResizeObserver(()=>resize()).observe($('#sheet'));
  window.addEventListener('resize',resize);
}
let toastT=0;
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2600);}

/* ───────── 시작 ───────── */
async function load(u){const r=await fetch(u);return r.json();}
async function start(){
  buildUI();resize();
  const q=new URLSearchParams(location.search);
  const w110=await load('countries-110m.json');
  set110=buildSet(w110);
  modernLabels=set110.map(it=>({c:it.c,r:it.r,ko:MODERN_KO[it.name]})).filter(m=>m.ko);
  const s0=clamp(parseInt(q.get('s')||'0',10)||0,0,SCENES.length-1);
  if(q.get('mode')&&['old','both','now'].includes(q.get('mode'))){mode=q.get('mode');document.querySelectorAll('#modes button').forEach(x=>x.classList.toggle('on',x.dataset.m===mode));}
  // 첫 화면: 지구 전체에서 장면으로 날아가기
  scene=SCENES[s0];view.lon=scene.view[0]+40;view.lat=scene.view[1]*0.5;view.s=fitS(150);
  setScene(s0,q.get('static')?false:true);
  if(q.get('static')){const v=scene.view;view.lon=v[0];view.lat=v[1];view.s=fitS(+q.get('z')||v[2]);}
  requestAnimationFrame(frame);
  $('#loading').classList.add('hide');
  setTimeout(()=>toast('드래그로 돌리고, 두 손가락으로 확대하세요'),1800);
  // 정밀 지형은 뒤에서 불러오기
  try{const w50=await load('countries-50m.json');setTimeout(()=>{set50=buildSet(w50);dirty=true;},30);}catch(e){}
}
start().catch(e=>{console.error(e);$('#loading').innerHTML='<div>불러오지 못했습니다. 새로고침 해 주세요.</div>';});
})();
