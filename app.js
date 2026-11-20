(function(){
'use strict';
const $=s=>document.querySelector(s);
const DEG=Math.PI/180, TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const FF='"Malgun Gothic","맑은 고딕","Apple SD Gothic Neo","Noto Sans KR","Noto Sans CJK KR","Nanum Gothic",system-ui,sans-serif';
const FS=FF;   // 글꼴은 맑은 고딕으로 통일 (명조·바탕 없음)
const reduceMotion=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ───────── 팔레트 (사용자 제공 3종: A 파스텔 · B 녹청 · C 파랑) ───────── */
const P1='#f5caa0',P2='#f5c7bd',P3='#f8d9be',P4='#ddec9c',P5='#bee295',P6='#a7d794',P7='#89c697',P8='#6db49b',P9='#559ea2',
      P10='#4088a9',P11='#38739b',P12='#325f8d',P13='#284d74',P14='#183d85',P15='#a2deed',P16='#6fc7e0',P17='#dae1dc';
// 옛 색 → 팔레트 색 (같은 장면에서 이웃한 나라끼리 겹치지 않게 배정)
const RECOLOR={
 '#f2c94c':P1,'#e9b43f':P2,'#f0c552':P1,'#e0b24a':P3,'#c4504f':P2,'#c9625a':P1,'#a8453f':P2,'#d46a6a':P2,
 '#d98a39':P6,'#e2ab63':P4,'#d9b25f':P4,'#b4623a':P12,'#c07b49':P12,'#b5834a':P17,
 '#d8b56a':P3,'#cf5f45':P3,'#c4623a':P11,'#74a553':P7,'#d3a15f':P10,'#a9674f':P16,'#a8845c':P17,'#a68a5c':P4,
 '#e0799b':P12,'#8c4fb3':P8,'#7bbd5a':P5,'#4fa3cc':P15,'#5aa89a':P9,'#3f9c6a':P13,'#c7443f':P13,
 '#2e9c8f':P9,'#27a08f':P9,'#a23f4c':P2,'#a6402f':P2,'#3fae8c':P7,'#69b7a8':P8,'#8d5cc2':P13,'#b184d6':P10,'#c98b45':P3,
 '#3b82c4':P9,'#b3303c':P8,'#7d5aa8':P13,'#4f7fb8':P11,'#59a35a':P10,'#a05a7a':P11,'#c2884a':P4,'#a8749a':P5,'#a56fb0':P16,
 '#d58f5c':P3,'#9a7f5a':P17,'#9d9238':P12,'#8f6bb5':P5,'#c9a45e':P3,'#b6865a':P6,'#9b5fa0':P11,'#4aa7a7':P7,'#4eb3a3':P16,
 '#6fc27a':P7,'#5fb4a8':P9,'#b98b5a':P3,'#4f8fd6':P11,'#cf6a3f':P2,'#4fae7a':P7,
 // 12지파
 '#c98a3c':P3,'#e07b6c':P2,'#8aa5d9':P15,'#63b788':P7,'#c07fcf':P8,'#e29b4f':P4,'#5fb3c4':P16,'#9bc25f':P5,
 '#d96f9a':P10,'#7f8fd1':P11,'#cf8f5f':P6,'#b36fc0':P9
};
const HERO=new Set(['#f2c94c','#e9b43f','#c4504f','#c9625a','#a8453f']);   // 이스라엘·유다 계열은 또렷하게
const ROUTEC={'#ffd36a':P1,'#6fd0ff':P15,'#ff9fb5':P2,'#ff8fb5':P2,'#ff9a8a':P3,'#7fb2ee':P16,'#f0a070':P4,'#80d4a4':P5,'#c8a2ff':'#d1eff7'};
const POOL=[P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P15,P16,P17];
function hueOf(h){const n=parseInt(h.slice(1),16),r=(n>>16)/255,g=((n>>8)&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
  if(!d)return 0;let hh=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;return (hh*60+360)%360;}
const recolor=h=>{const k=(h||'').toLowerCase();return RECOLOR[k]||(k[0]==='#'&&k.length===7?POOL[Math.floor(hueOf(k)/360*POOL.length)%POOL.length]:h);};
const recolorRoute=h=>{const k=(h||'').toLowerCase();return ROUTEC[k]||recolor(k);};
const NOWPAL=[P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P15,P16];

/* ───────── 테마: 주간(사용자 팔레트) / 야간(어두운 곳에 맞춘 색) ───────── */
const THEMES={
 day:{id:'day',ink:'#03045a',ink2:'#183d85',ink3:'#325f8d',paper:'#f6edeb',halo:'rgba(246,237,235,.93)',haloSel:'rgba(245,199,189,.96)',sel:'#f5c7bd',
  sea:['#50b1d4','#4294c2','#3375b1','#183d85'],atmo:'rgba(111,199,224,.42)',atmo0:'rgba(111,199,224,0)',
  land:'#eae4dc',coastH1:'rgba(185,230,242,.16)',coastH2:'rgba(162,222,237,.6)',coast:'rgba(40,77,116,.6)',
  desert:'245,202,160',desertA:.52,ice:'#f6edeb',shade:['rgba(255,255,255,.12)','rgba(3,4,90,0)','rgba(3,4,90,.32)'],
  border:'3,4,90',grat:'rgba(3,4,90,.13)',river:'rgba(66,148,194,.95)',lake:'#4294c2',lakeLine:'rgba(40,77,116,.7)',rim:'rgba(162,222,237,.5)',
  polyA:1,nowA:.72,seaLabel:'#d1eff7',seaHalo:'rgba(24,61,133,.9)',seaSub:'rgba(209,239,247,.85)',landLabel:'rgba(24,61,133,.78)',landSub:'rgba(40,77,116,.85)',
  mtn:'#284d74',ghost:'rgba(24,61,133,.62)',route:'rgba(3,4,90,.85)',routeHalo:'rgba(3,4,90,.92)',pulse:'3,4,90',star:'209,239,247',shk:.55,
  fx1:'rgba(245,199,189,.20)',fx2:'rgba(111,199,224,.22)',fxLine:'209,239,247'},
 night:{id:'night',ink:'#eef3fa',ink2:'#c6d6ea',ink3:'#9db6d2',paper:'#050912',halo:'rgba(5,9,18,.9)',haloSel:'rgba(74,54,20,.94)',sel:'#e8b86d',
  sea:['#14395c','#0f2f4e','#0a2238','#050f1d'],atmo:'rgba(70,130,200,.30)',atmo0:'rgba(70,130,200,0)',
  land:'#27303c',coastH1:'rgba(90,140,190,.12)',coastH2:'rgba(110,165,215,.42)',coast:'rgba(125,175,220,.72)',
  desert:'176,128,80',desertA:.36,ice:'#b9c6d6',shade:['rgba(140,170,220,.12)','rgba(0,0,0,0)','rgba(0,0,14,.5)'],
  border:'226,234,246',grat:'rgba(150,180,225,.10)',river:'rgba(90,155,210,.95)',lake:'#0f2f4e',lakeLine:'rgba(125,175,220,.7)',rim:'rgba(120,175,230,.45)',
  polyA:.68,nowA:.5,seaLabel:'#8fb8e0',seaHalo:'rgba(4,10,22,.92)',seaSub:'rgba(143,184,224,.85)',landLabel:'rgba(204,218,238,.82)',landSub:'rgba(170,190,216,.85)',
  mtn:'#dccfae',ghost:'rgba(180,200,226,.62)',route:'rgba(4,8,16,.9)',routeHalo:'rgba(4,8,16,.92)',pulse:'240,224,190',star:'200,220,255',shk:.7,
  fx1:'rgba(232,184,109,.20)',fx2:'rgba(90,160,225,.22)',fxLine:'160,200,255'}
};
THEMES.day.c1=P1;THEMES.day.c2=P2;THEMES.day.c3=P16;THEMES.night.c1='#e8b86d';THEMES.night.c2='#d9a27a';THEMES.night.c3='#5b9bd5';
let TH=THEMES.day;

/* ───────── DOM / 캔버스 ───────── */
const stage=$('#stage'), cvB=$('#base'), cvT=$('#top'), cvS=$('#stars'), cvF=$('#fx');
const cb=cvB.getContext('2d'), ct=cvT.getContext('2d'), cs=cvS.getContext('2d'), cf=cvF.getContext('2d');
const lay=document.createElement('canvas'), cl=lay.getContext('2d');
let W=0,H=0,DPR=1,cx=0,cy=0,D=300,areaL=0,areaR=0,areaT=0,areaB=0,hd=500,sideMode=false;
const proj=d3.geoOrthographic().clipAngle(90).precision(0.5);
const pathB=d3.geoPath(proj,cb), pathT=d3.geoPath(proj,ct);
const view={lon:44,lat:34.5,s:1000};
const kOf=()=>view.s/(D*0.46);
const MAXK=700;
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
  if(s._ok) return; s._ok=true; s._y=yearOf(s.yb);
  s.pol.forEach(p=>{
    if(!p._c0){p._c0=p.col;p.col=recolor(p.col);if(HERO.has((p._c0||'').toLowerCase())&&p.alpha==null)p.alpha=.9;}
    const rs=(isRing(p.poly)?[p.poly]:p.poly).map(fixRing);
    p._r=rs; p._sig=rs.map(r=>r.id).join('-'); p._area=rs.reduce((a,r)=>a+r.area,0);
    const big=rs.reduce((a,b)=>b.area>a.area?b:a); p._lab=p.label||big.c; p._rad=big.rad;
  });
  s._cities=(s.cities||[]).map(c=>{const k=Array.isArray(c)?c[0]:c,d=CITIES[k];if(!d)return null;
    const pl=PLACES[k];   // 그 시대에 불리던 이름으로
    return {key:k,name:Array.isArray(c)?c[1]:((pl&&nameAt(pl,s._y))||d[0]),lon:d[1],lat:d[2],pr:d[3],ty:pl?pl.ty:'city',desc:d[4]};}).filter(Boolean);
  (s.routes||[]).forEach(r=>{
    if(!r._c0){r._c0=r.col;r.col=recolorRoute(r.col);}
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
  [cvB,cvT,cvS,cvF,lay].forEach(c=>{c.width=Math.round(W*DPR);c.height=Math.round(H*DPR);});
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
  for(let i=0,n=TH.id==='night'?230:150;i<n;i++){const x=rnd()*W,y=rnd()*H,r=rnd()*1.1+.2;cs.fillStyle='rgba('+TH.star+','+(0.16+rnd()*.5)+')';cs.beginPath();cs.arc(x,y,r,0,TAU);cs.fill();}
}

/* ───────── 보기 이동 ───────── */
function applyView(){proj.rotate([-view.lon,-view.lat,0]).scale(view.s).translate([cx,cy]);}
function clampView(){view.lat=clamp(view.lat,-85,85);view.lon=wrapLon(view.lon);const R=D*0.46;view.s=clamp(view.s,R*0.7,R*MAXK);}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function flyTo(lon,lat,span,dur){
  const s1=clamp(fitS(span),D*0.46*0.7,D*0.46*MAXK);
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

/* 식생(녹지): 위도에 따라 땅(베이지)에 팔레트 B의 초록을 섞어 칠함 */
const hx=h=>{const n=parseInt(h.slice(1),16);return [n>>16,(n>>8)&255,n&255];};
const mixRGB=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const VEGK={
 day:[[0,'#6db49b',.55],[8,'#89c697',.55],[18,'#bee295',.48],[30,'#ddec9c',.42],[42,'#a7d794',.55],[52,'#89c697',.55],[62,'#6db49b',.45],[70,'#dae1dc',.85],[78,'#f6edeb',1]],
 night:[[0,'#2f5a4c',.62],[8,'#356245',.62],[18,'#42683f',.55],[30,'#5a6238',.5],[42,'#38643f',.6],[52,'#2f5a4c',.6],[62,'#2c505e',.55],[70,'#56636f',.85],[78,'#aab7c6',1]]
};
let VEG=[];
function buildVEG(){const base=hx(TH.land);VEG=VEGK[TH.id].map(k=>({lat:k[0],rgb:mixRGB(base,hx(k[1]),k[2])}));}
function vegRGB(lat){
  const a=Math.min(90,Math.abs(lat));let i=0;while(i<VEG.length-2&&a>VEG[i+1].lat)i++;
  const k0=VEG[i],k1=VEG[i+1],t=clamp((a-k0.lat)/(k1.lat-k0.lat),0,1);
  return mixRGB(k0.rgb,k1.rgb,t).map(Math.round);
}
const VBANDS=[];
for(let a=-78;a<78;a+=3){
  const lo=a===-78?-80:a, hi=a+3===78?80:a+4;     // 위쪽으로 1° 겹치게 칠해 이음선 방지
  VBANDS.push({a:lo,b:hi,mid:a+1.5,col:'',poly:d3.geoGraticule().extent([[-180,lo],[180,hi]]).precision(3).outline()});
}
function recolorVeg(){buildVEG();VBANDS.forEach(b=>{b.col='rgb('+vegRGB(b.mid).join(',')+')';});}
recolorVeg();
const CAP_N=d3.geoCircle().center([0,90]).radius(12).precision(3)(), CAP_S=d3.geoCircle().center([0,-90]).radius(26).precision(3)();
function drawVeg(){
  const vr=visRad()*57.3, lat0=view.lat-vr-4, lat1=view.lat+vr+4;
  const g=d3.geoPath(proj,cl);
  VBANDS.forEach(b=>{ if(b.b<lat0||b.a>lat1) return; cl.beginPath(); g(b.poly); cl.fillStyle=b.col; cl.fill(); });
  cl.fillStyle=TH.ice; cl.beginPath(); g(CAP_N); cl.fill(); cl.beginPath(); g(CAP_S); cl.fill();
}
// 사막(팔레트 A의 살구색): 성지 일대는 data-geo, 그 밖은 대략적인 윤곽
const DESERT_EXTRA=[
 [[51,35],[58,35],[60,31],[58,28.5],[53,29.5],[51,32]],[[69,29],[74,30],[75,26],[71,24],[69,25]],
 [[77,40],[88,41.5],[90,39],[82,37],[77,38]],[[96,43],[105,46],[112,45],[111,41],[104,40],[98,40.5]],
 [[55,42],[62,43],[65,41],[62,38],[56,38.5],[54,40.5]],[[18,-20],[25,-19],[26,-26],[21,-28],[17,-25]],
 [[12,-17],[14.5,-17],[17,-28],[15,-29],[13,-24]],[[120,-21],[135,-19],[140,-25],[135,-31],[122,-31],[118,-26]],
 [[-117,36],[-111,38],[-108,33],[-110,29],[-114,30.5],[-117,33]],[[-71,-18],[-69.5,-18],[-69,-27],[-71,-27]]
];

/* ───────── 시대(연도)·지명 ───────── */
let Ys=-1446, showPlaces=true, showRelief=true;
const yearOf=yb=>{ if(/태초/.test(yb)) return -4000; if(/홍수/.test(yb)) return -2400; const m=/(BC|AD)\s*(\d+)/.exec(yb||''); return m?(m[1]==='BC'?-1:1)*(+m[2]):0; };
const fmtY=y=>y<=-9000||y>=9000?'':(y<0?'BC '+(-y):'AD '+y);
function entryIdx(pl,y){const ns=pl.names;for(let i=ns.length-1;i>=0;i--){if(y>=ns[i][0]&&y<=ns[i][1])return i;}return -1;}
function nameAt(pl,y){const i=entryIdx(pl,y);if(i<0)return null;const n=pl.names[i][2];return n[0]==='('?null:n;}   // '(이름 미상)'인 시대에는 이름표를 달지 않음
const PLKEYS=[], KPR=[0,0,3,7,14,26];   // 중요도(1~5)별로 이 확대 정도부터 보임
function initPlaces(){
  Object.keys(PLACES).forEach(key=>{
    const pl=PLACES[key], c=CITIES[key];
    if(pl.lon==null&&c){pl.lon=c[1];pl.lat=c[2];}
    if(pl.lon==null||pl.ty==='region') return;
    if(!c) CITIES[key]=[pl.names[pl.names.length-1][2],pl.lon,pl.lat,Math.min(pl.pr,3),''];
    PLKEYS.push(key);
  });
}
initPlaces();
const TYPE_KO={city:'도시',town:'마을',ruin:'폐허·유적',oasis:'오아시스',site:'유적지',fortress:'요새',region:'지방',mtn:'산',port:'항구',pass:'고갯길',valley:'골짜기',island:'섬'};
function elevText(el){
  if(el==null) return '';
  if(el<-5) return '해수면보다 '+Math.abs(el).toLocaleString('ko-KR')+'m 낮은 땅';
  if(el<=20) return '해안 · 해수면 높이';
  return '해발 '+el.toLocaleString('ko-KR')+'m'+(el>=1500?' · 고산':el>=600?' · 산지·고원':el>=200?' · 구릉':'');
}

/* ───────── 높낮이(고저): 지구 전체는 4096×2048 고도 그림, 성지 일대는 손으로 보정한 촘촘한 격자 ───────── */
const RL={m:null,gw:0,gh:0,sh:null,reg:null,ok:false,lut:null};
const G2M=new Float32Array(256);
for(let g=0;g<256;g++) G2M[g]=g<=23?(g-23)*26:Math.min(8850,(g-23)*46);
const HYPS={
 day:{neg:[[-450,'#2f7fae',.5],[-150,'#4a97c0',.38],[-30,'#7cb7d3',.14]],
      pos:[[0,'#bee295',0],[250,'#ddec9c',0],[500,'#f5caa0',.17],[1000,'#e2b887',.27],[1800,'#bd9064',.36],[3000,'#8f7a68',.46],[4500,'#dae1dc',.62],[6500,'#f6edeb',.8]],
      sh:{l:[255,255,255],la:.42,d:[3,4,90],da:.5}},
 night:{neg:[[-450,'#2a86b5',.55],[-150,'#2a6f9a',.42],[-30,'#2b5f84',.16]],
      pos:[[0,'#3a4a3e',0],[250,'#4a5340',0],[500,'#6b5a3e',.2],[1000,'#80693f',.3],[1800,'#97805a',.38],[3000,'#aaa194',.46],[4500,'#c9d2dd',.62],[6500,'#e8eef6',.8]],
      sh:{l:[165,190,232],la:.28,d:[0,0,10],da:.55}}
};
function buildLUT(){
  const T=HYPS[TH.id], lut=new Uint8ClampedArray(1101*4);
  const lerpTab=(tab,m)=>{ // tab: [[m,hex,a],…] 오름차순
    if(m<=tab[0][0]){const c=hx(tab[0][1]);return [c[0],c[1],c[2],tab[0][2]];}
    for(let i=1;i<tab.length;i++){ if(m<=tab[i][0]){const a=tab[i-1],b=tab[i],t=(m-a[0])/(b[0]-a[0]),ca=hx(a[1]),cb2=hx(b[1]);
      return [ca[0]+(cb2[0]-ca[0])*t,ca[1]+(cb2[1]-ca[1])*t,ca[2]+(cb2[2]-ca[2])*t,a[2]+(b[2]-a[2])*t];} }
    const c=hx(tab[tab.length-1][1]);return [c[0],c[1],c[2],tab[tab.length-1][2]];
  };
  for(let i=0;i<=1100;i++){
    const m=i*10-500; let v;
    if(m<0){ const neg=T.neg.slice().reverse().map(x=>x); // [-30,-150,-450] → 오름차순으로
      const asc=[[-450,T.neg[0][1],T.neg[0][2]],[-150,T.neg[1][1],T.neg[1][2]],[-30,T.neg[2][1],T.neg[2][2]]];
      v=lerpTab(asc,m); if(m>-30){const f=clamp(-m/30,0,1);v[3]*=f;}
    } else v=lerpTab(T.pos,m);
    lut[i*4]=v[0];lut[i*4+1]=v[1];lut[i*4+2]=v[2];lut[i*4+3]=Math.round(v[3]*255);
  }
  RL.lut=lut; updateLegend();
}
function updateLegend(){
  if(!RL.lut) return;
  const base=hx(TH.land), at=m=>{const i=clamp(Math.round((m+500)/10),0,1100)*4,a=RL.lut[i+3]/255;
    return 'rgb('+[0,1,2].map(j=>Math.round(base[j]*(1-a)+RL.lut[i+j]*a)).join(',')+')';};
  const bar=$('#lgBar'); if(!bar) return; bar.innerHTML='';
  [100,420,900,1700,3200,5200].forEach(m=>{const i=document.createElement('i');i.style.background=at(m);bar.appendChild(i);});
  $('#lgNeg').style.background=at(-300);
}
function hillshade(){
  const w=RL.gw,h=RL.gh,M=RL.m,sh=new Uint8Array(w*h),dy=111320*180/h,VE=3,Lx=-.542,Ly=.542,Lz=.643;
  for(let y=0;y<h;y++){
    const lat=(90-(y+.5)*180/h)*DEG,dx=Math.max(dy*Math.cos(lat),dy*.15),y0=y>0?y-1:0,y1=y<h-1?y+1:h-1;
    for(let x=0;x<w;x++){
      const xm=x===0?w-1:x-1,xp=x===w-1?0:x+1;
      const gx=(M[y*w+xp]-M[y*w+xm])/(2*dx)*VE, gy=(M[y0*w+x]-M[y1*w+x])/((y1-y0)*dy)*VE;
      const d=(-gx*Lx-gy*Ly+Lz)/Math.sqrt(gx*gx+gy*gy+1)-Lz;
      sh[y*w+x]=clamp(128+d*420,0,255);
    }
  }
  RL.sh=sh;
}
function baseM(lon,lat){ // 전 지구 격자에서 해발(m)
  const w=RL.gw,h=RL.gh,u=(lon+180)*(w/360)-.5,v=(90-lat)*(h/180)-.5,iu=Math.floor(u),iv=Math.floor(v),fu=u-iu,fv=v-iv;
  const x0=((iu%w)+w)%w,x1=x0+1===w?0:x0+1,y0=clamp(iv,0,h-1),y1=Math.min(y0+1,h-1),M=RL.m;
  return (M[y0*w+x0]*(1-fu)+M[y0*w+x1]*fu)*(1-fv)+(M[y1*w+x0]*(1-fu)+M[y1*w+x1]*fu)*fv;
}
function buildRegion(){
  const X0=32,X1=38,Y0=28,Y1=35,ST=.02,nx=Math.round((X1-X0)/ST)+1,ny=Math.round((Y1-Y0)/ST)+1,m=new Float32Array(nx*ny);
  const pts=RELIEF_PTS.map(p=>({lon:p[0],lat:p[1],z:p[2],r:p[3]*1.7,res:p[2]-baseM(p[0],p[1])}));
  for(let j=0;j<ny;j++){
    const lat=Y1-j*ST,cl2=Math.cos(lat*DEG);
    for(let i=0;i<nx;i++){
      const lon=X0+i*ST;let sw=0,sr=0;
      for(let q=0;q<pts.length;q++){const p=pts[q],dx=(lon-p.lon)*cl2,dy=lat-p.lat,d2=dx*dx+dy*dy,r2=p.r*p.r;if(d2>=r2)continue;const t=1-d2/r2,w=t*t;sw+=w;sr+=w*p.res;}
      m[j*nx+i]=baseM(lon,lat)+(sw>0?sr/Math.max(1,sw):0);
    }
  }
  const sh=new Uint8Array(nx*ny),VE=7,Lx=-.542,Ly=.542,Lz=.643,dym=ST*111320;
  for(let j=0;j<ny;j++){
    const lat=Y1-j*ST,dxm=dym*Math.cos(lat*DEG);
    for(let i=0;i<nx;i++){
      const i0=Math.max(0,i-1),i1=Math.min(nx-1,i+1),j0=Math.max(0,j-1),j1=Math.min(ny-1,j+1);
      const gx=(m[j*nx+i1]-m[j*nx+i0])/((i1-i0)*dxm)*VE,gy=(m[j0*nx+i]-m[j1*nx+i])/((j1-j0)*dym)*VE;
      const d=(-gx*Lx-gy*Ly+Lz)/Math.sqrt(gx*gx+gy*gy+1)-Lz;
      sh[j*nx+i]=clamp(128+d*420,0,255);
    }
  }
  RL.reg={X0,X1,Y0,Y1,ST,nx,ny,m,sh};
}
function loadRelief(){
  const img=new Image();
  img.onload=()=>{
    try{
      // 4096×2048 그림 → 2×2씩 묶어 해발(m)로 바꾸고 두 번 번지게 해서 계단 무늬를 없앰 (2048×1024)
      const W0=img.naturalWidth,H0=img.naturalHeight,c=document.createElement('canvas');c.width=W0;c.height=H0;
      const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
      const d=x.getImageData(0,0,W0,H0).data,w=W0>>1,h=H0>>1;
      let a=new Float32Array(w*h),b=new Float32Array(w*h);
      for(let j=0;j<h;j++)for(let i=0;i<w;i++){
        const o0=((2*j)*W0+2*i)*4,o1=o0+4,o2=o0+W0*4,o3=o2+4;
        a[j*w+i]=(G2M[d[o0]]+G2M[d[o1]]+G2M[d[o2]]+G2M[d[o3]])*.25;
      }
      c.width=c.height=0;
      for(let pass=0;pass<2;pass++){
        for(let j=0;j<h;j++)for(let i=0;i<w;i++){const im=i===0?w-1:i-1,ip=i===w-1?0:i+1;b[j*w+i]=(a[j*w+im]+a[j*w+i]*2+a[j*w+ip])*.25;}
        for(let j=0;j<h;j++){const jm=j>0?j-1:0,jp=j<h-1?j+1:h-1;for(let i=0;i<w;i++)a[j*w+i]=(b[jm*w+i]+b[j*w+i]*2+b[jp*w+i])*.25;}
      }
      const M=new Int16Array(w*h);for(let i=0;i<M.length;i++)M[i]=Math.round(a[i]);
      a=b=null;RL.m=M;RL.gw=w;RL.gh=h;
      hillshade();
      setTimeout(()=>{buildRegion();RL.ok=true;buildLUT();dirty=true;},20);
    }catch(e){console.error('relief',e);}
  };
  img.src='relief.jpg';
}
const rc1=document.createElement('canvas'), rc2=document.createElement('canvas'); let rid1=null,rid2=null;
function drawRelief(inter){
  if(!showRelief||!RL.ok) return;
  const ds=inter?8:4,rw=Math.ceil(W/ds),rh=Math.ceil(H/ds);
  if(inter) lastCoarse=true;
  if(!rid1||rc1.width!==rw||rc1.height!==rh){rc1.width=rc2.width=rw;rc1.height=rc2.height=rh;rid1=rc1.getContext('2d').createImageData(rw,rh);rid2=rc2.getContext('2d').createImageData(rw,rh);}
  const d1=rid1.data,d2=rid2.data,s=view.s,lam0=view.lon*DEG,phi0=view.lat*DEG,sp=Math.sin(phi0),cp=Math.cos(phi0);
  const G=RL.m,SH=RL.sh,gw=RL.gw,gh=RL.gh,lut=RL.lut,R=RL.reg,T=HYPS[TH.id].sh;
  const lc=T.l,dc=T.d,la=T.la,da=T.da,K=gw/360,KV=gh/180;
  const rm=R.m,rs=R.sh,rnx=R.nx,rny=R.ny;
  for(let py=0;py<rh;py++){
    const Y=(cy-(py*ds+ds/2))/s;
    for(let px=0;px<rw;px++){
      const X=((px*ds+ds/2)-cx)/s,o=(py*rw+px)*4,r2=X*X+Y*Y;
      if(r2>=1){d1[o+3]=0;d2[o+3]=0;continue;}
      const cc=Math.sqrt(1-r2),lat=Math.asin(clamp(cc*sp+Y*cp,-1,1))/DEG;
      let lon=(lam0+Math.atan2(X,cp*cc-Y*sp))/DEG; lon=((lon+540)%360)-180;
      // 전 지구
      const u=(lon+180)*K-.5,v=(90-lat)*KV-.5,iu=Math.floor(u),iv=Math.floor(v),fu=u-iu,fv=v-iv;
      const x0=((iu%gw)+gw)%gw,x1=x0+1===gw?0:x0+1,y0=iv<0?0:iv>=gh?gh-1:iv,y1=y0+1<gh?y0+1:y0;
      const a00=y0*gw+x0,a01=y0*gw+x1,a10=y1*gw+x0,a11=y1*gw+x1,w00=(1-fu)*(1-fv),w01=fu*(1-fv),w10=(1-fu)*fv,w11=fu*fv;
      let m=G[a00]*w00+G[a01]*w01+G[a10]*w10+G[a11]*w11, sb=SH[a00]*w00+SH[a01]*w01+SH[a10]*w10+SH[a11]*w11;
      // 성지 일대는 촘촘한 격자로 바꿔 끼움 (가장자리 0.7°는 서서히 섞음)
      if(lon>R.X0&&lon<R.X1&&lat>R.Y0&&lat<R.Y1){
        const e=Math.min(lon-R.X0,R.X1-lon,lat-R.Y0,R.Y1-lat),wr=e>=.7?1:e/.7;
        const gi=(lon-R.X0)/R.ST,gj=(R.Y1-lat)/R.ST,ii=Math.min(rnx-2,Math.floor(gi)),jj=Math.min(rny-2,Math.floor(gj)),ff=gi-ii,fg=gj-jj;
        const b00=jj*rnx+ii,b10=b00+rnx,q00=(1-ff)*(1-fg),q01=ff*(1-fg),q10=(1-ff)*fg,q11=ff*fg;
        const mr=rm[b00]*q00+rm[b00+1]*q01+rm[b10]*q10+rm[b10+1]*q11, sr=rs[b00]*q00+rs[b00+1]*q01+rs[b10]*q10+rs[b10+1]*q11;
        m=m+(mr-m)*wr; sb=sb+(sr-sb)*wr;
      }
      // 높이별 색
      let li=((m+500)*.1)|0; li=li<0?0:li>1100?1100:li; li<<=2;
      d1[o]=lut[li];d1[o+1]=lut[li+1];d1[o+2]=lut[li+2];d1[o+3]=lut[li+3];
      // 음영
      const dl=(sb-128)/128;
      if(dl>0){const a=Math.min(.4,dl*la*1.9);d2[o]=lc[0];d2[o+1]=lc[1];d2[o+2]=lc[2];d2[o+3]=a*255;}
      else{const a=Math.min(.42,-dl*da*1.9);d2[o]=dc[0];d2[o+1]=dc[1];d2[o+2]=dc[2];d2[o+3]=a*255;}
    }
  }
  rc1.getContext('2d').putImageData(rid1,0,0);rc2.getContext('2d').putImageData(rid2,0,0);
  cl.save();cl.globalCompositeOperation='source-atop';cl.imageSmoothingEnabled=true;
  cl.drawImage(rc1,0,0,rw,rh,0,0,rw*ds,rh*ds);
  cl.drawImage(rc2,0,0,rw,rh,0,0,rw*ds,rh*ds);
  cl.restore();
}

/* ───────── 시대에 따라 달라진 땅·바다 ───────── */
const editOn=e=>Ys>=e.from&&Ys<=e.to;
function drawGeoEdits(k){
  if(typeof GEOEDITS==='undefined') return;
  const c0=[view.lon,view.lat],vr=visRad();
  GEOEDITS.forEach(e=>{
    if(e.kind==='mark'||!editOn(e)) return;
    const r=fixRing(e.ring); if(d3.geoDistance(c0,r.c)-r.rad>vr) return;
    const p2=new Path2D(); d3.geoPath(proj,p2)(r.feat);
    cl.save();cl.lineJoin='round';
    if(e.kind==='land'){
      cl.globalCompositeOperation='source-over';
      cl.lineWidth=3;cl.strokeStyle=TH.coastH2;cl.stroke(p2);
      cl.fillStyle=TH.land;cl.fill(p2);
      cl.lineWidth=.7;cl.strokeStyle=TH.coast;cl.stroke(p2);
    }else{ // sea: 땅을 지워 바다를 드러냄
      cl.globalCompositeOperation='destination-out';cl.fillStyle='#000';cl.fill(p2);
      cl.globalCompositeOperation='source-atop';cl.lineWidth=1.2;cl.strokeStyle=TH.coast;cl.stroke(p2);
    }
    cl.restore();
  });
}

function drawBase(now){
  cb.setTransform(DPR,0,0,DPR,0,0); cb.clearRect(0,0,W,H);
  applyView();
  const s=view.s,k=kOf(),inter=(now-lastInter)<220;
  const fine=!inter||k>=2.2, set=(fine&&set50)?set50:set110;
  lastCoarse=!(fine&&set50)&&!!set50;
  if(!set) return;
  // 대기·바다 (팔레트 C)
  const cover=s>hd*1.02;
  if(!cover){
    const g2=cb.createRadialGradient(cx,cy,s*0.98,cx,cy,s*1.14);
    g2.addColorStop(0,TH.atmo);g2.addColorStop(1,TH.atmo0);
    cb.fillStyle=g2;cb.beginPath();cb.arc(cx,cy,s*1.14,0,TAU);cb.fill();
  }
  const g=cb.createRadialGradient(cx-s*.28,cy-s*.34,s*.04,cx,cy,s);
  g.addColorStop(0,TH.sea[0]);g.addColorStop(.5,TH.sea[1]);g.addColorStop(.86,TH.sea[2]);g.addColorStop(1,TH.sea[3]);
  cb.fillStyle=g;
  if(cover) cb.fillRect(0,0,W,H); else {cb.beginPath();pathB({type:'Sphere'});cb.fill();}
  // 육지 레이어
  cl.setTransform(DPR,0,0,DPR,0,0); cl.globalCompositeOperation='source-over'; cl.globalAlpha=1; cl.setLineDash([]); cl.clearRect(0,0,W,H);
  const items=cull(set), land=new Path2D(), gl=d3.geoPath(proj,land);
  items.forEach(it=>gl(it.f));
  cl.lineJoin='round';
  if(!inter){cl.lineWidth=11; cl.strokeStyle=TH.coastH1; cl.stroke(land);}   // 얕은 바다 번짐
  cl.lineWidth=3; cl.strokeStyle=TH.coastH2; cl.stroke(land);
  cl.fillStyle=TH.land; cl.fill(land);
  cl.lineWidth=.7; cl.strokeStyle=TH.coast; cl.stroke(land);      // 해안선
  drawGeoEdits(k);                                                 // 시대에 따라 달라진 바다·땅 (두로 섬, 파로스 …)
  cl.globalCompositeOperation='source-atop';
  drawVeg();
  if(k>=0.9){
    const dd=[];if(typeof DESERTS!=='undefined')DESERTS.forEach(r=>dd.push(fixDesert(r)));
    DESERT_EXTRA.forEach(r=>dd.push(fixDesert(r)));
    dd.forEach(r=>{const p2=new Path2D();d3.geoPath(proj,p2)({type:'Polygon',coordinates:[r]});
      cl.lineJoin='round';[30,18].forEach((w,i)=>{cl.lineWidth=w;cl.strokeStyle='rgba('+TH.desert+','+(.09+i*.06)*(TH.desertA/.52)+')';cl.stroke(p2);});
      cl.fillStyle='rgba('+TH.desert+','+TH.desertA+')';cl.fill(p2);});
  }
  if(mode==='now'){
    items.forEach(it=>{const p2=new Path2D();d3.geoPath(proj,p2)(it.f);cl.fillStyle=rgba(dimCol(NOWPAL[Math.floor(it.h/360*NOWPAL.length)%NOWPAL.length]),TH.nowA);cl.fill(p2);});
  }else{
    drawPolities();
  }
  drawRelief(inter);                                              // 높낮이: 글자 아래에 은은하게
  // 구체 음영 (둥글게 보이도록, 가장자리만 살짝 어둡게)
  const gs=cl.createRadialGradient(cx-s*.3,cy-s*.36,s*.05,cx,cy,s*1.02);
  gs.addColorStop(0,TH.shade[0]);gs.addColorStop(.55,TH.shade[1]);gs.addColorStop(1,TH.shade[2]);
  cl.fillStyle=gs; cl.fillRect(0,0,W,H);
  if(mode!=='old'){
    cl.globalCompositeOperation='source-over';
    cl.lineWidth=mode==='now'?1:0.9; cl.strokeStyle='rgba('+TH.border+','+(mode==='now'?.62:.5)+')';
    cl.setLineDash(mode==='now'?[]:[4,3]); cl.stroke(land); cl.setLineDash([]);
  }
  cb.setTransform(1,0,0,1,0,0); cb.drawImage(lay,0,0); cb.setTransform(DPR,0,0,DPR,0,0);
  // 위선·경선
  cb.lineWidth=.6; cb.strokeStyle=TH.grat; cb.beginPath(); pathB(grat(k<5?10:(k<20?5:1))); cb.stroke();
  // 호수·강 (시대에 따라 있고 없음)
  const inY=o=>(o.y0==null||Ys>=o.y0)&&(o.y1==null||Ys<=o.y1);
  if(typeof LAKES!=='undefined'&&k>=1.5){
    LAKES.forEach(l=>{
      if(!inY(l)) return;
      cb.beginPath();pathB({type:'Polygon',coordinates:[fixDesert(l.ring)]});cb.fillStyle=TH.lake;cb.fill();
      cb.strokeStyle=TH.lakeLine;cb.lineWidth=.9;cb.setLineDash(l.anc?[3,3]:[]);cb.stroke();cb.setLineDash([]);
    });
  }
  if(typeof RIVERS!=='undefined'){
    cb.lineJoin='round';cb.lineCap='round';
    RIVERS.forEach(r=>{
      if(k<(r.minK||0)||!inY(r)) return;
      cb.beginPath();pathB({type:'LineString',coordinates:r.c});
      cb.strokeStyle=TH.river;cb.lineWidth=Math.max(1,r.w*Math.min(2.4,.55+k*.17));
      if(r.anc){cb.globalAlpha=.8;cb.setLineDash([6,4]);}
      cb.stroke();cb.setLineDash([]);cb.globalAlpha=1;
    });
  }
  // 둘레
  if(!cover){cb.beginPath();pathB({type:'Sphere'});cb.strokeStyle=TH.rim;cb.lineWidth=1.2;cb.stroke();}
}
const deskCache=new Map();
function fixDesert(r){
  let o=deskCache.get(r);if(o)return o;
  const a=r.map(p=>[p[0],p[1]]),f=a[0],l=a[a.length-1];if(f[0]!==l[0]||f[1]!==l[1])a.push([f[0],f[1]]);
  if(d3.geoArea({type:'Polygon',coordinates:[a]})>TAU)a.reverse();
  deskCache.set(r,a);return a;
}
const dimCache=new Map();
function dimCol(c){ // 야간모드: 같은 색상, 밝기만 낮춤
  if(TH.id!=='night') return c;
  let v=dimCache.get(c); if(v) return v;
  const h=d3.hsl(c); h.l=Math.min(h.l,.9)*.5; h.s*=.72; v=h.formatHex(); dimCache.set(c,v); return v;
}
function drawPolities(){
  const c0=[view.lon,view.lat],vr=visRad();
  const ls=layers.slice().sort((a,b)=>b.p._area-a.p._area);
  ls.forEach(l=>{
    const p=l.p; if(l.a<=0.01) return;
    const rs=p._r.filter(r=>d3.geoDistance(c0,r.c)-r.rad<vr); if(!rs.length) return;
    const p2=new Path2D(), g=d3.geoPath(proj,p2); rs.forEach(r=>g(r.feat));
    const al=p.alpha!=null?p.alpha:(p.dash?0.4:0.76);
    if(al>=.6){cl.fillStyle=rgba(TH.land,l.a); cl.fill(p2);}      // 땅 색을 먼저 깔아 녹지 색이 섞이지 않게
    cl.fillStyle=rgba(dimCol(p.col),al*l.a*TH.polyA); cl.fill(p2);
    cl.lineWidth=p.rank===3?1.0:1.5; cl.strokeStyle='rgba('+TH.border+','+((TH.id==='night'?.5:.62)*l.a)+')';
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
      ct.font=l.f; ct.lineWidth=l.sw||3.6; ct.strokeStyle=l.s||TH.halo; ct.strokeText(l.t,lx,yy+l.h/2);
      ct.fillStyle=l.c; ct.fillText(l.t,lx,yy+l.h/2); yy+=l.h;
    });
    ct.restore(); return r;
  }
  return null;
}
function evPos(ev){if(!ev||!ev.at)return null;if(typeof ev.at==='string'){const d=CITIES[ev.at];return d?[d[1],d[2]]:null;}return ev.at;}

// 지명 표시: 종류에 따라 모양을 달리함 (산=삼각형, 폐허=빈 원, 고개·골짜기=마름모)
function dot(x,y,r,ty,isSel){
  ct.lineJoin='round';ct.beginPath();
  if(ty==='mtn'){ct.moveTo(x,y-r*1.5);ct.lineTo(x+r*1.35,y+r*.95);ct.lineTo(x-r*1.35,y+r*.95);ct.closePath();}
  else if(ty==='pass'||ty==='valley'){ct.moveTo(x,y-r*1.3);ct.lineTo(x+r*1.3,y);ct.lineTo(x,y+r*1.3);ct.lineTo(x-r*1.3,y);ct.closePath();}
  else ct.arc(x,y,r,0,TAU);
  ct.fillStyle=isSel?TH.sel:(ty==='ruin'?TH.paper:TH.ink);ct.fill();
  ct.lineWidth=ty==='ruin'?1.6:1.7;ct.strokeStyle=isSel?TH.ink:(ty==='ruin'?TH.ink:TH.paper);ct.stroke();
}
const lum=h=>{const [r,g,b]=hx(h).map(v=>v/255);return .2126*r+.7152*g+.0722*b;};
const accent=h=>(h&&h[0]==='#'&&lum(h)<.3)?toHex(light(h,.62)):h;   // 남색 카드 위에서도 보이게 밝힘
// 학술 지도의 조준 표시: 가는 고리 + 네 개의 눈금 (천천히 도는 정도)
function reticle(x,y,now){
  const r=13+Math.sin(now/420)*1.2, a=(reduceMotion?0:now/2600);
  ct.save();ct.translate(x,y);ct.rotate(a);ct.lineCap='round';
  [[TH.paper,3.6],[TH.ink,1.4]].forEach(([c,w])=>{
    ct.strokeStyle=c;ct.lineWidth=w;
    ct.beginPath();ct.arc(0,0,r,0,TAU);ct.stroke();
    for(let i=0;i<4;i++){const t=i*Math.PI/2;ct.beginPath();ct.moveTo(Math.cos(t)*(r-4),Math.sin(t)*(r-4));ct.lineTo(Math.cos(t)*(r+5),Math.sin(t)*(r+5));ct.stroke();}
  });
  ct.restore();
}
function drawTop(now){
  ct.setTransform(DPR,0,0,DPR,0,0); ct.clearRect(0,0,W,H);
  if(!scene||!set110) return;
  applyView();
  placed.length=0; hits.length=0;
  const k=kOf(), c0=[view.lon,view.lat], oa=overlayA;
  const vis=(lon,lat)=>d3.geoDistance(c0,[lon,lat])<1.5;
  const PX=(lon,lat)=>proj([lon,lat]);
  const items=[];

  // 선택한 나라 윤곽
  if(sel&&sel.type==='polity'){
    ct.save();ct.lineJoin='round';
    sel.p._r.forEach(r=>{ct.beginPath();pathT(r.feat);ct.strokeStyle=TH.paper;ct.lineWidth=5.6;ct.stroke();ct.strokeStyle=TH.ink;ct.lineWidth=2.2;ct.stroke();});
    ct.restore();
  }
  // 경로
  const rts=scene.routes||[];
  rts.forEach(r=>{
    const hl=sel&&sel.type==='route'&&sel.r===r, dim=sel&&sel.type==='route'&&!hl;
    const line={type:'LineString',coordinates:r._pts};
    ct.save();ct.lineCap='round';ct.lineJoin='round';ct.globalAlpha=oa*(dim?.35:1);
    ct.setLineDash([]);ct.beginPath();pathT(line);ct.lineWidth=hl?6.6:5;ct.strokeStyle=TH.route;ct.stroke();
    ct.setLineDash(r.dash?[2,7]:[8,6]);ct.lineDashOffset=-((now/40)%14);
    ct.beginPath();pathT(line);ct.lineWidth=hl?3.6:2.7;ct.strokeStyle=r.col;ct.stroke();
    ct.restore();
    // 화살표
    ct.save();ct.globalAlpha=oa*(dim?.35:1);ct.fillStyle=r.col;ct.strokeStyle=TH.route;ct.lineWidth=1.1;
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
    const s0=r._pts[0];if(vis(s0[0],s0[1])){const p=proj(s0);ct.beginPath();ct.arc(p[0],p[1],5,0,TAU);ct.fillStyle=TH.ink;ct.fill();ct.lineWidth=2.4;ct.strokeStyle=r.col;ct.stroke();}
    ct.restore();
    if(vis(r._mid[0],r._mid[1])){
      const p=PX(r._mid[0],r._mid[1]);
      if(inArea(p[0],p[1])) items.push({pr:hl?400:52,run:()=>put(p[0],p[1]-12,[{t:r.name,f:'700 11.5px '+FF,c:r.col,s:TH.routeHalo}],{alpha:oa*(dim?.4:1),cands:[[0,0,'c'],[0,-16,'c'],[0,16,'c']]})});
    }
  });

  // 나라 이름
  if(mode!=='now'){
    layers.forEach(l=>{
      const p=l.p;if(l.t!==1||l.a<.45||p.nolabel)return;
      const lon=p._lab[0],lat=p._lab[1];if(!vis(lon,lat))return;
      const q=PX(lon,lat);if(!inArea(q[0],q[1]))return;
      const rpx=p._rad*view.s, rk=p.rank||2;
      const th=rk===1?20:rk===2?26:15;if(rpx<th)return;
      const fs=rk===1?clamp(rpx*.15,13,23):rk===2?clamp(rpx*.15,11.5,17):clamp(rpx*.2,10.5,13);
      const lines=[{t:p.name,f:'800 '+fs.toFixed(1)+'px '+FS,c:TH.ink,hh:fs+3}];
      if(p.sub&&fs>=11.5&&rpx>fs*3.2) lines.push({t:p.sub,f:'600 '+Math.max(9.5,fs*.68).toFixed(1)+'px '+FF,c:TH.ink2,hh:Math.max(9.5,fs*.68)+3});
      const sl=sel&&sel.type==='polity'&&sel.p===p;
      items.push({pr:sl?450:(p.id.startsWith('t_')?93:rk===1?100:rk===2?70:45),run:()=>put(q[0],q[1],lines,{alpha:oa*l.a,force:sl})});
    });
  }
  // 지금 나라 이름
  if(mode!=='old'){
    modernLabels.forEach(m=>{
      if(!vis(m.c[0],m.c[1]))return;const q=PX(m.c[0],m.c[1]);if(!inArea(q[0],q[1]))return;
      const rpx=m.r*view.s;if(rpx<24)return;
      const fs=clamp(rpx*.12,10,mode==='now'?17:12.5);
      items.push({pr:mode==='now'?85:18,run:()=>put(q[0],q[1],[{t:m.ko,f:(mode==='now'?'700 ':'italic 500 ')+fs.toFixed(1)+'px '+FF,c:mode==='now'?TH.ink:TH.ink3}],{alpha:mode==='now'?1:.8})});
    });
  }
  // 지리 라벨
  if(showGeo){
    GEO.forEach(g=>{
      if(k<(g.minK||0))return;if(!vis(g.c[0],g.c[1]))return;const q=PX(g.c[0],g.c[1]);if(!inArea(q[0],q[1]))return;
      let f,c,pr,t=g.n,hs;
      if(g.kind==='sea'){f='italic 600 '+clamp(11+k*.9,11,15)+'px '+FS;c=TH.seaLabel;pr=24;hs=TH.seaHalo;}
      else if(g.kind==='land'){f='700 '+clamp(11+k*.6,11,14.5)+'px '+FS;c=TH.landLabel;pr=56;}
      else if(g.kind==='mtn'){f='600 11px '+FF;c=TH.mtn;pr=38;t='▲ '+g.n;}
      else {f='italic 600 11px '+FS;c=TH.ink3;pr=34;}
      const lines=[{t,f,c,s:hs}];if(g.sub&&k>=Math.max(g.minK||0,1.4)*1.1&&g.kind!=='mtn')lines.push({t:g.sub,f:'italic 500 10px '+FF,c:g.kind==='sea'?TH.seaSub:TH.landSub,s:hs,hh:12});
      if(g.el!=null&&k>=Math.max(g.minK||0,1.4)*1.2)lines.push({t:g.el<0?'해수면보다 '+(-g.el).toLocaleString('ko-KR')+'m 낮음':'해발 '+g.el.toLocaleString('ko-KR')+'m',f:'500 10px '+FF,c:g.kind==='sea'?TH.seaSub:TH.landSub,s:hs,hh:12});
      items.push({pr,run:()=>put(q[0],q[1],lines,{alpha:.95})});
    });
    if(typeof RIVERS!=='undefined')RIVERS.forEach(r=>{
      if(k<(r.minK||0)||!r.lab)return;if(!vis(r.lab[0],r.lab[1]))return;const q=PX(r.lab[0],r.lab[1]);if(!inArea(q[0],q[1]))return;
      items.push({pr:30,run:()=>put(q[0],q[1],[{t:r.n,f:'italic 600 11px '+FS,c:TH.ink3}],{})});
    });
  }
  // 장면 고유 라벨
  (scene.labels||[]).forEach(g=>{
    if(!vis(g.c[0],g.c[1]))return;const q=PX(g.c[0],g.c[1]);if(!inArea(q[0],q[1]))return;
    items.push({pr:g.ghost?40:60,run:()=>put(q[0],q[1],[{t:g.n,f:(g.ghost?'italic 600 ':'700 ')+'12px '+FS,c:g.ghost?TH.ghost:TH.ink2}],{alpha:oa})});
  });
  // 시대에 따라 달라진 땅·바다: 점선 윤곽과 이름
  if(typeof GEOEDITS!=='undefined') GEOEDITS.forEach(e=>{
    if(!e.hl||Ys<e.hl[0]||Ys>e.hl[1]||k<e.k0*.5) return;
    const r=fixRing(e.ring); if(d3.geoDistance(c0,r.c)-r.rad>visRad()) return;
    const isSel=sel&&sel.type==='edit'&&sel.e===e;
    if(r.rad*view.s>=7){
    ct.save();ct.globalAlpha=oa;ct.lineJoin='round';ct.setLineDash([5,4]);
    ct.beginPath();pathT(r.feat);ct.strokeStyle=TH.paper;ct.lineWidth=isSel?4.6:3.4;ct.stroke();
    ct.strokeStyle=TH.ink;ct.lineWidth=isSel?2:1.3;ct.stroke();ct.restore();}
    if(k>=e.k0&&vis(e.c[0],e.c[1])){const q=PX(e.c[0],e.c[1]);if(inArea(q[0],q[1]))
      items.push({pr:isSel?460:58,run:()=>put(q[0],q[1],[{t:e.n,f:'italic 700 11.5px '+FS,c:TH.ink}],{alpha:oa,force:isSel,cands:[[0,0,'c'],[0,-14,'c'],[0,14,'c']]})});}
  });
  // 도시·지명
  const cityList=scene._cities.slice();
  const selCity=sel&&(sel.type==='city'?sel.key:sel.type==='event'&&typeof sel.ev.at==='string'?sel.ev.at:null);
  if(selCity&&!cityList.some(c=>c.key===selCity)&&CITIES[selCity]){const d=CITIES[selCity],pl=PLACES[selCity];cityList.push({key:selCity,name:(pl&&nameAt(pl,Ys))||d[0],lon:d[1],lat:d[2],pr:d[3],ty:pl?pl.ty:'city'});}
  const shown=new Set(cityList.map(c=>c.key));
  cityList.forEach(c=>{
    const isSel=c.key===selCity;
    if(!isSel){if(c.pr>=3&&k<2.4)return;if(c.pr===2&&k<1.4)return;}
    if(!vis(c.lon,c.lat))return;const q=PX(c.lon,c.lat);if(!inArea(q[0],q[1]))return;
    hits.push({x:q[0],y:q[1],r:20,city:c});
    const rr=c.pr===1?4.4:c.pr===2?3.7:3.1;
    ct.save();ct.globalAlpha=oa;dot(q[0],q[1],rr,c.ty,isSel);ct.restore();
    if(isSel){ct.save();ct.globalAlpha=oa;reticle(q[0],q[1],now);ct.restore();}
    const fs=c.pr===1?13:c.pr===2?12:11;
    items.push({pr:isSel?500:(c.pr===1?90:c.pr===2?62:36),run:()=>put(q[0],q[1],[{t:c.name,f:(c.pr===1?'700 ':'600 ')+fs+'px '+FF,c:TH.ink,s:isSel?TH.haloSel:null}],{alpha:oa,force:isSel,cands:[[8,0,'l'],[-8,0,'r'],[0,-12,'c'],[0,13,'c']]})});
  });
  // 시대별로 더 자세한 지명: 장면의 도시 목록에 없는 곳 (그 시대에 있던 이름으로)
  if(showPlaces) PLKEYS.forEach(key=>{
    if(shown.has(key)) return;
    const pl=PLACES[key], th=KPR[pl.pr]||99; if(k<th) return;
    const nm=nameAt(pl,Ys); if(!nm) return;
    if(!vis(pl.lon,pl.lat))return;const q=PX(pl.lon,pl.lat);if(!inArea(q[0],q[1]))return;
    const fs=pl.pr<=2?12:11, rr=pl.pr<=2?3.5:2.9, lines=[{t:nm,f:(pl.pr<=2?'700 ':'600 ')+fs+'px '+FF,c:TH.ink}];
    if(pl.ty==='mtn'&&pl.el!=null&&k>=th*1.5) lines.push({t:'해발 '+pl.el.toLocaleString('ko-KR')+'m',f:'500 10px '+FF,c:TH.landSub,hh:12});
    items.push({pr:pl.pr<=2?60:pl.pr===3?34:pl.pr===4?26:20,run:()=>{
      const r=put(q[0],q[1],lines,{alpha:oa,cands:[[8,0,'l'],[-8,0,'r'],[0,-12,'c'],[0,13,'c']]});
      if(!r) return;
      ct.save();ct.globalAlpha=oa;dot(q[0],q[1],rr,pl.ty,false);ct.restore();
      hits.push({x:q[0],y:q[1],r:18,city:{key,name:nm,lon:pl.lon,lat:pl.lat,pr:pl.pr,ty:pl.ty}});
    }});
  });
  // 선택한 사건 표시
  if(sel&&sel.type==='event'){
    const pos=evPos(sel.ev);
    if(pos&&vis(pos[0],pos[1])){
      const q=PX(pos[0],pos[1]),ph=(now%1600)/1600;
      ct.save();ct.beginPath();ct.arc(q[0],q[1],8+ph*20,0,TAU);ct.strokeStyle='rgba('+TH.pulse+','+(1-ph)*.85+')';ct.lineWidth=2.4;ct.stroke();
      ct.beginPath();ct.arc(q[0],q[1],5,0,TAU);ct.fillStyle=TH.sel;ct.fill();ct.lineWidth=1.8;ct.strokeStyle=TH.ink;ct.stroke();ct.restore();
      reticle(q[0],q[1],now);
      if(typeof sel.ev.at!=='string') items.push({pr:480,run:()=>put(q[0],q[1]-16,[{t:sel.ev.t,f:'800 13px '+FS,c:TH.ink,s:TH.haloSel}],{force:true})});
    }
  }
  items.sort((a,b)=>b.pr-a.pr);items.forEach(it=>it.run());
}

/* ───────── 시대 전환 효과: 짧은 글리치 (팔레트 색만, 장면이 바뀔 때 한 번) ───────── */
let fxT=-1e9, fxOn=false, booted=false;
function glitch(){
  if(reduceMotion) return;
  fxT=performance.now();
  ['#yb','#era'].forEach(q=>{const e=$(q);e.classList.remove('glx');void e.offsetWidth;e.classList.add('glx');});
}
function fxStep(now){
  const t=(now-fxT)/580;
  if(t<0||t>1){ if(fxOn){cf.setTransform(1,0,0,1,0,0);cf.clearRect(0,0,cvF.width,cvF.height);fxOn=false;} return; }
  fxOn=true;
  cf.setTransform(1,0,0,1,0,0); cf.clearRect(0,0,cvF.width,cvF.height);
  const step=Math.floor((now-fxT)/60); let sd=step*9301+49297; const rnd=()=>{sd=(sd*9301+49297)%233280;return sd/233280;};
  const k=1-t, n=Math.round(2+7*k);
  for(let i=0;i<n;i++){
    const y=areaT+rnd()*(Math.max(60,areaB-areaT)), h=3+rnd()*26*k, dx=(rnd()-.5)*2*(8+30*k);
    cf.globalAlpha=1;
    cf.drawImage(cvB,0,y*DPR,W*DPR,h*DPR,dx*DPR,y*DPR,W*DPR,h*DPR);          // 찢어진 조각
    cf.drawImage(cvT,0,y*DPR,W*DPR,h*DPR,dx*DPR,y*DPR,W*DPR,h*DPR);
    cf.fillStyle=rnd()<.5?TH.fx1:TH.fx2;     // 팔레트 색 번짐
    cf.fillRect(0,y*DPR,W*DPR,h*DPR);
  }
  // 스캔 라인: 위에서 아래로 한 번 쓸고 지나감
  const sy=(areaT+(areaB-areaT)*ease(t))*DPR, gr=cf.createLinearGradient(0,sy-40*DPR,0,sy);
  gr.addColorStop(0,'rgba('+TH.fxLine+',0)');gr.addColorStop(1,'rgba('+TH.fxLine+','+(.28*k+.06)+')');
  cf.fillStyle=gr;cf.fillRect(0,sy-40*DPR,W*DPR,40*DPR);
  cf.fillStyle='rgba('+TH.fxLine+','+(.75*k+.1)+')';cf.fillRect(0,sy,W*DPR,Math.max(1,1.5*DPR));
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
  else if(scene&&((scene.routes&&scene.routes.length)||(sel&&sel.type==='event')||(sel&&sel.type==='city'))&&now-lastTopT>60){drawTop(now);lastTopT=now;}
  fxStep(now);
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
    if(typeof GEOEDITS!=='undefined'){
      const kk=kOf(),eh=GEOEDITS.filter(e=>e.hl&&Ys>=e.hl[0]&&Ys<=e.hl[1]&&kk>=e.k0*.5&&d3.geoContains(fixRing(e.ring).feat,ll));
      if(eh.length){eh.sort((a,b)=>fixRing(a.ring).area-fixRing(b.ring).area);selectEdit(eh[0]);return;}
    }
    if(mode!=='now'){
      const cand=layers.filter(l=>l.t===1&&l.a>.5&&l.p._r.some(r=>d3.geoContains(r.feat,ll)));
      if(cand.length){cand.sort((a,b)=>a.p._area-b.p._area);selectPolity(cand[0].p);return;}
    }
    if(mode!=='old'&&set110){
      const c=set110.find(it=>d3.geoContains(it.f,ll));
      if(c){const ko=MODERN_KO[c.name];sel={type:'modern'};showCard({title:ko||c.name,sub:ko?c.name:'',ref:'현재의 나라',desc:'지금의 국경 기준입니다. 옛 나라와 비교하며 보세요.',col:TH.c3});dirty=true;return;}
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
 [/^phoen/,'두로와 시돈 등 해상 무역으로 번영한 페니키아 도시국가들. 솔로몬의 성전 건축을 도왔습니다 (왕상 5장).'],
 [/^kush/,'나일강 상류(지금의 수단 북부)에 있던 구스 왕국. 구스 왕조가 한때 이집트를 다스렸습니다 (사 18장; 왕하 19:9).'],
 [/^carthage/,'페니키아 사람들이 북아프리카에 세운 해상 강국. 훗날 로마와 지중해의 패권을 다투었습니다.'],
 [/^assyria/,'티그리스강 상류의 앗시리아. 훗날 강력한 제국이 되어 북이스라엘을 멸망시킵니다 (왕하 17장).'],
 [/^elam/,'이란 고원 남서부의 엘람 왕국. 수산이 중심 도시였습니다 (창 14:1; 단 8:2).'],
 [/^(babylonia|kassite)/,'유브라데·티그리스 하류 메소포타미아 남부의 바빌론. 훗날 신바빌론 제국이 되어 유다를 멸망시킵니다 (왕하 24–25장).'],
 [/^hamath/,'시리아 중부 오론테스강변의 하맛 왕국 (왕하 14:28; 사 10:9).'],
 [/^(egypt|ptol)/,'나일강 유역의 이집트. 이스라엘 역사에서 피난처이자 압제자로 거듭 등장합니다.'],
 [/^urartu/,'아라랏(우라르투) 지방에서 일어난 산악 왕국. 앗시리아와 맞섰습니다.'],
 [/^(mitanni|hittite)/,'가나안 북쪽의 강국. 이집트와 패권을 다투던 나라입니다.']
];
function descOf(p){
  const d=p.desc||'';
  if(d.length>=16) return d;
  for(const [re,t] of DESC_FB) if(re.test(p.id)) return (d&&d!==p.name?d+' ':'')+t;
  return d===p.name?'':d;
}
function selectPolity(p){
  sel={type:'polity',p};
  showCard({title:p.name,sub:p.sub||'',ref:p.ref||'',desc:descOf(p),col:accent(p.col)});dirty=true;
}
function selectCity(c){
  sel={type:'city',key:c.key};
  const pl=PLACES[c.key];
  if(pl) placeCard(pl,c); else showCard({title:c.name,sub:'',ref:'',desc:c.desc||'',col:TH.c1});
  dirty=true;
}
function selectCityKey(key){const d=CITIES[key];if(d)selectCity({key,name:d[0],lon:d[1],lat:d[2],pr:d[3]});}
function selectEdit(e){
  sel={type:'edit',e};
  showCard({title:e.t,sub:e.n===e.t?'':e.n,ref:'땅의 변화',desc:e.d,col:TH.c3});renderInset(insetFor('edit',e.id));dirty=true;
}
function selectEvent(i){
  const ev=scene.events[i];sel={type:'event',ev};
  const pos=evPos(ev);if(pos){const sp=ev.span||8;flyTo(pos[0],pos[1]-sp*0.16,sp,1300);}
  showCard({title:ev.t,sub:'',ref:ev.ref||'',desc:ev.desc||'',col:TH.c2});
  if(typeof ev.at==='string')renderInset(insetFor('place',ev.at));
  document.querySelectorAll('#evs .chip').forEach((c,j)=>c.classList.toggle('on',j===i));
  dirty=true;
}
function selectRoute(i){
  const r=scene.routes[i];sel={type:'route',r};
  let a=1e9,b=-1e9,c=1e9,d=-1e9;r._pts.forEach(p=>{a=Math.min(a,p[0]);b=Math.max(b,p[0]);c=Math.min(c,p[1]);d=Math.max(d,p[1]);});
  const lat=(c+d)/2,span=Math.max((b-a)*Math.cos(lat*DEG),d-c,5)*1.4;
  flyTo((a+b)/2,lat,span,1300);
  showCard({title:r.name,sub:'',ref:'',desc:r.desc||'',col:accent(r.col)});
  document.querySelectorAll('#rts .chip').forEach((c,j)=>c.classList.toggle('on',j===i));
  dirty=true;
}
const mk=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
function rangeText(a,b){const A=a<=-9000?'옛날부터':fmtY(a),B=b>=9000?'지금까지':fmtY(b);return A+' – '+B;}
// 이 연도에 가장 알맞은 장면 번호 ([from,to] 범위 안에 있는 장면을 먼저, 없으면 가장 가까운 장면)
function sceneFor(from,to){
  let best=-1,bd=1e9;
  SCENES.forEach((sc,i)=>{prepScene(sc);const y=sc._y;if(y>=from&&y<=(to==null?from:to)){const d=Math.abs(y-from);if(d<bd){bd=d;best=i;}}});
  if(best>=0)return best;
  SCENES.forEach((sc,i)=>{const d=Math.abs(sc._y-from);if(d<bd){bd=d;best=i;}});
  return best;
}
function goYear(from,to,after){
  const i=sceneFor(from,to);
  if(i!==sceneI) setScene(i,false);
  if(after) after();
}
function goBtn(label,fn){const b=mk('button','chip',label);b.style.cssText='margin-top:6px;padding:4px 10px;font-size:12px';b.onclick=e=>{e.stopPropagation();fn();};return b;}
const SCALEPX={tyre:50,alexandria:60,ephesus:40,miletus:50,caesarea:50};
function renderInset(ins){
  const box=$('#cardIn');box.innerHTML='';
  $('#card').classList.toggle('hasIn',!!ins);
  if(!ins||typeof INSETS==='undefined'){box.style.display='none';return;}
  box.style.display='block';box.appendChild(mk('div','insT','확대 개념도 · '+ins.title));
  let cur=ins.stages.findIndex(st=>Ys>=st.y[0]&&Ys<=st.y[1]);
  if(cur<0){let bd=1e9;ins.stages.forEach((st,i)=>{const d=Math.min(Math.abs(Ys-st.y[0]),Math.abs(Ys-st.y[1]));if(d<bd){bd=d;cur=i;}});}
  const chips=mk('div','insC'),wrap=mk('div');
  const draw=i=>{
    const st=ins.stages[i],px=SCALEPX[ins.id]||50;
    wrap.innerHTML='<svg class="ins" viewBox="0 0 240 150" role="img" aria-label="'+ins.title+' — '+st.n+'">'+st.svg+
      '<text class="ts" x="8" y="17">N ↑</text><path class="hl" style="stroke-dasharray:none;stroke-width:2" d="M'+(232-px)+',142 L232,142"/><text class="tl" x="'+(232-px/2)+'" y="136" text-anchor="middle">'+ins.scale+'</text></svg>';
    wrap.appendChild(mk('div','insN',st.note));wrap.appendChild(mk('div','insS','손으로 그린 약도입니다. 실제 축척·모양과는 다를 수 있습니다.'));
    chips.querySelectorAll('.chip').forEach((c,j)=>c.classList.toggle('on',j===i));
  };
  ins.stages.forEach((st,i)=>{const b=mk('button','chip',st.n);b.onclick=e=>{e.stopPropagation();draw(i);};chips.appendChild(b);});
  box.appendChild(chips);box.appendChild(wrap);draw(cur);
}
const insetFor=(kind,id)=>typeof INSETS==='undefined'?null:INSETS.find(n=>kind==='place'?n.places.includes(id):n.edits.includes(id));
function placeCard(pl){
  const ns=pl.names,idx=entryIdx(pl,Ys),last=ns[ns.length-1][2],cur=idx>=0?ns[idx]:null;
  const known=!!cur&&cur[2][0]!=='(',nameNow=known?cur[2]:last;
  const els=elevText(pl.el);
  $('#cardT').textContent=nameNow;
  $('#cardS').textContent=known?(cur[2]!==last?'지금: '+last:''):(cur?'이 시대의 이름은 알려져 있지 않습니다':'');
  const r=$('#cardR');r.textContent=TYPE_KO[pl.ty]||'';r.style.display=TYPE_KO[pl.ty]?'inline-block':'none';
  $('#cardM').textContent=els;$('#cardM').style.display=els?'block':'none';
  $('#cardD').textContent=cur?cur[3]:'이 시대에는 아직 이 이름이 쓰이지 않았습니다. 아래에서 시대별 이름을 보세요.';
  $('#card').style.setProperty('--c',TH.c1);$('#card').classList.add('show');
  renderInset(insetFor('place',pl.key));
  const box=$('#cardTL');box.innerHTML='';
  if(ns.length>1||pl.ev.length){
    box.appendChild(mk('div','tlh','이름의 변천'));
    const tl=mk('div','tl');
    ns.forEach((n,i)=>{
      const it=mk('div','it'+(i===idx?' now':''));
      it.appendChild(mk('div','yr',rangeText(n[0],n[1])));
      const nm=mk('div','nm',n[2][0]==='('?n[2].replace(/[()]/g,''):n[2]);if(i===idx)nm.appendChild(mk('small','','지금 보는 시대'));it.appendChild(nm);
      const ds=mk('div','ds',n[3]);
      if(i!==idx)ds.appendChild(document.createElement('br')),ds.appendChild(goBtn('이 시대로 가기 ›',()=>goYear(Math.max(n[0],-4000),n[1],()=>selectCityKey(pl.key))));
      it.appendChild(ds);
      if(i!==idx)it.onclick=()=>it.classList.toggle('open');
      tl.appendChild(it);
    });
    box.appendChild(tl);
    if(pl.ev.length){
      box.appendChild(mk('div','tlh','있었던 일'));
      const t2=mk('div','tl');
      pl.ev.forEach(([y,t])=>{
        const it=mk('div','it ev');it.appendChild(mk('div','yr',fmtY(y)));it.appendChild(mk('div','nm',t));
        it.onclick=()=>goYear(y,y,()=>selectCityKey(pl.key));t2.appendChild(it);
      });
      box.appendChild(t2);
    }
  }
  // 이 곳의 땅 모양이 시대에 따라 바뀐 경우
  if(typeof GEOEDITS!=='undefined'&&pl.lon!=null){
    const near=GEOEDITS.filter(e=>Math.abs(e.c[0]-pl.lon)<.25&&Math.abs(e.c[1]-pl.lat)<.25);
    if(near.length){
      box.appendChild(mk('div','tlh','땅의 모양이 바뀐 곳'));
      const t3=mk('div','tl');
      near.forEach(e=>{
        const it=mk('div','it');it.appendChild(mk('div','yr',e.hl?rangeText(e.hl[0],e.hl[1]):rangeText(e.from,e.to)));
        it.appendChild(mk('div','nm',e.t));
        const ds=mk('div','ds',e.d);ds.appendChild(document.createElement('br'));
        ds.appendChild(goBtn('그 시대의 모습 보기 ›',()=>goYear(e.hl?e.hl[0]:e.from,e.hl?e.hl[1]:e.to,()=>{flyTo(e.c[0],e.c[1],Math.max(e.span*2.2,0.5),1300);selectEdit(e);})));
        it.appendChild(ds);it.onclick=()=>it.classList.toggle('open');t3.appendChild(it);
      });
      box.appendChild(t3);
    }
  }
  $('#card').scrollTop=0;
}
function showCard(o){
  $('#cardT').textContent=o.title;$('#cardS').textContent=o.sub||'';
  const r=$('#cardR');r.textContent=o.ref||'';r.style.display=o.ref?'inline-block':'none';
  $('#cardM').style.display='none';$('#cardTL').innerHTML='';$('#cardIn').style.display='none';$('#cardIn').innerHTML='';$('#card').classList.remove('hasIn');
  $('#cardD').textContent=o.desc||'';$('#card').style.setProperty('--c',o.col||TH.c1);$('#card').classList.add('show');$('#card').scrollTop=0;
}
function closeCard(){
  $('#card').classList.remove('show');sel=null;
  document.querySelectorAll('#evs .chip.on,#rts .chip.on').forEach(c=>c.classList.remove('on'));dirty=true;
}
function updateLand(){
  const pl=PLACES.holyland,b=$('#land');if(!pl||!b)return;
  const n=nameAt(pl,Ys);
  if(!n||scene._y<=-2400){b.style.display='none';return;}
  b.style.display='inline-block';b.innerHTML='';b.appendChild(document.createTextNode('이 땅의 이름 · '));b.appendChild(mk('b','',n));
}

/* ───────── 장면 전환·UI ───────── */
function setScene(i,fly){
  i=clamp(i,0,SCENES.length-1);sceneI=i;scene=SCENES[i];prepScene(scene);Ys=scene._y;updateLand();
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
  if(booted)glitch();
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
  $('#tRelief').onclick=()=>{showRelief=!showRelief;$('#tRelief').textContent=showRelief?'고저 ✓':'고저';$('#tRelief').classList.toggle('on',showRelief);$('#legend').classList.toggle('show',showRelief);dirty=true;};
  $('#btnTheme').onclick=()=>setTheme(TH.id==='night'?'day':'night');
  $('#land').onclick=()=>{sel={type:'region'};placeCard(PLACES.holyland);dirty=true;};
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
function setTheme(id){
  TH=THEMES[id]||THEMES.day;document.body.classList.toggle('night',TH.id==='night');
  $('#btnTheme').textContent=TH.id==='night'?'☀':'☾';$('#btnTheme').setAttribute('aria-label',TH.id==='night'?'주간모드로':'야간모드로');
  recolorVeg();if(RL.ok)buildLUT();drawStars();dirty=true;
  try{localStorage.setItem('bible-globe-theme',TH.id);}catch(_){}
}
let toastT=0;
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2600);}

/* ───────── 시작 ───────── */
async function load(u){const r=await fetch(u);return r.json();}
async function start(){
  buildUI();
  const q=new URLSearchParams(location.search);
  let th0=q.get('theme');try{if(!th0)th0=localStorage.getItem('bible-globe-theme');}catch(_){}
  if(th0==='night')setTheme('night');
  resize();
  if(q.get('relief')==='0'){showRelief=false;$('#tRelief').textContent='고저';$('#tRelief').classList.remove('on');$('#legend').classList.remove('show');}
  loadRelief();
  const w110=await load('countries-110m.json');
  set110=buildSet(w110);
  modernLabels=set110.map(it=>({c:it.c,r:it.r,ko:MODERN_KO[it.name]})).filter(m=>m.ko);
  const s0=clamp(parseInt(q.get('s')||'0',10)||0,0,SCENES.length-1);
  if(q.get('mode')&&['old','both','now'].includes(q.get('mode'))){mode=q.get('mode');document.querySelectorAll('#modes button').forEach(x=>x.classList.toggle('on',x.dataset.m===mode));}
  // 첫 화면: 지구 전체에서 장면으로 날아가기
  scene=SCENES[s0];view.lon=scene.view[0]+40;view.lat=scene.view[1]*0.5;view.s=fitS(150);
  setScene(s0,q.get('static')?false:true);
  if(q.get('static')){const v=scene.view;view.lon=v[0];view.lat=v[1];view.s=fitS(+q.get('z')||v[2]);
    if(q.get('c')){const cc=q.get('c').split(',').map(Number);view.lon=cc[0];view.lat=cc[1];}}
  if(q.get('debug'))window.__bg={selectCityKey,setScene,flyTo,selectEdit,setTheme,placeCard,GEOEDITS:typeof GEOEDITS!=='undefined'?GEOEDITS:null};
  requestAnimationFrame(frame);
  booted=true;
  $('#loading').classList.add('hide');
  setTimeout(()=>toast('드래그로 돌리고, 두 손가락으로 확대하세요'),1800);
  // 정밀 지형은 뒤에서 불러오기
  try{const w50=await load('countries-50m.json');setTimeout(()=>{set50=buildSet(w50);dirty=true;},30);}catch(e){}
}
start().catch(e=>{console.error(e);$('#loading').innerHTML='<div>불러오지 못했습니다. 새로고침 해 주세요.</div>';});
})();
