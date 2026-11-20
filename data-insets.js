/* 확대 개념도: 지도의 해안선 자료로는 그릴 수 없는 작은 땅의 변화를, 단계별 약도로 보여 줍니다.
   손으로 그린 약도라 실제 축척·모양과 다를 수 있습니다. 좌표는 0~240 × 0~150, 북쪽이 위입니다.
   클래스: sea(바다) land(땅) mole(둑·방파제) hl(점선) river(강) wat(호수) ts(바다 위 글자) tl(땅 위 글자) */
const INSETS=[
 {id:'tyre',title:'두로 — 섬에서 반도로',edits:['tyre-isle','tyre-causeway'],places:['tyre'],scale:'500m',
  stages:[
   {n:'BC 332년 이전',y:[-2400,-333],note:'바다 위의 섬 도시. 해안에서 약 800m 떨어져 있었습니다. 땅에 있는 옛 두로(우슈)에서 물과 건축 재료를 가져다 썼고, 높은 성벽 덕분에 느부갓네살도 13년을 에워싸고도 섬은 얻지 못했습니다.',
    svg:`<rect class="sea" width="240" height="150"/><path class="land" d="M206,0 L200,38 L194,76 L190,112 L186,150 L240,150 L240,0Z"/>
     <path class="land" d="M72,42 L96,36 L116,46 L122,70 L118,98 L104,114 L84,112 L68,94 L64,64Z"/>
     <path class="hl" d="M122,66 L190,66"/><text class="ts" x="156" y="58" text-anchor="middle">바닷길 약 800m</text>
     <text class="tl" x="92" y="78" text-anchor="middle">섬 두로</text><text class="ts" x="92" y="132" text-anchor="middle">성벽 요새 · 두 항구</text>
     <text class="tl" x="219" y="76" text-anchor="middle">옛 두로</text><text class="tl" x="219" y="90" text-anchor="middle">(우슈)</text>`},
   {n:'BC 332년 — 방파제',y:[-332,-300],note:'알렉산더 대왕은 7개월 동안 옛 두로를 헐어 그 돌과 흙으로 섬까지 이르는 둑길을 쌓아 두로를 함락했습니다. 에스겔 26:12의 예언과 연결해 읽기도 합니다.',
    svg:`<rect class="sea" width="240" height="150"/><path class="land" d="M206,0 L200,38 L194,76 L190,112 L186,150 L240,150 L240,0Z"/>
     <path class="hl" d="M198,56 L232,56 L232,96 L196,96Z"/>
     <path class="land" d="M72,42 L96,36 L116,46 L122,70 L118,98 L104,114 L84,112 L68,94 L64,64Z"/>
     <path class="mole" d="M120,68 L192,66 L192,80 L120,82Z"/><text class="ts" x="156" y="58" text-anchor="middle">알렉산더의 방파제</text>
     <text class="tl" x="92" y="78" text-anchor="middle">두로(함락)</text><text class="tl" x="219" y="108" text-anchor="middle">헐린</text><text class="tl" x="219" y="121" text-anchor="middle">옛 두로</text>`},
   {n:'오늘 — 반도',y:[-299,9999],note:'방파제 양옆에 파도가 실어 온 모래가 쌓여 둑길이 점점 넓어졌습니다. 섬은 영영 육지와 이어졌고, 오늘날의 두로(수르)는 이 모래톱 위의 반도에 있습니다.',
    svg:`<rect class="sea" width="240" height="150"/><path class="land" d="M206,0 L200,38 L194,76 L190,112 L186,150 L240,150 L240,0Z"/>
     <path class="land" d="M72,42 L96,36 L116,46 L122,70 L118,98 L104,114 L84,112 L68,94 L64,64Z"/>
     <path class="land" d="M116,54 C140,64 168,62 194,52 L194,106 C168,92 140,92 116,100Z"/>
     <text class="tl" x="92" y="78" text-anchor="middle">두로</text><text class="tl" x="156" y="80" text-anchor="middle">모래톱</text>
     <text class="ts" x="150" y="130" text-anchor="middle">쌓인 모래 · 지금의 반도</text>`}
  ]},
 {id:'alexandria',title:'알렉산드리아 — 파로스 섬과 둑길',edits:['pharos','heptastadion'],places:['alexandria'],scale:'1km',
  stages:[
   {n:'BC 331년 — 섬',y:[-2400,-291],note:'알렉산더가 도시를 세울 때 파로스 섬은 본토에서 약 1km 떨어져 있었습니다. 건축가는 이 섬을 천연 방파제로 삼아 항구를 만들 계획을 세웠습니다.',
    svg:`<rect class="sea" width="240" height="150"/><path class="land" d="M0,126 C40,124 80,128 110,122 C140,118 170,116 200,118 C220,118 232,122 240,122 L240,150 L0,150Z"/>
     <path class="land" d="M16,64 C46,56 100,54 150,54 C176,54 196,56 208,62 C198,72 170,74 140,72 C100,74 50,74 16,64Z"/>
     <text class="tl" x="112" y="68" text-anchor="middle">파로스 섬</text><text class="ts" x="120" y="100" text-anchor="middle">바닷길 약 1km</text>
     <text class="tl" x="110" y="142" text-anchor="middle">라코티스(어촌) → 알렉산드리아</text>`},
   {n:'BC 290년경 — 헵타스타디온',y:[-290,-120],note:'프톨레마이오스 왕조가 길이 7스타디온(약 1.3km)의 둑길을 쌓아 섬과 본토를 이었고, 양쪽에 동항구와 서항구가 생겼습니다. 섬 끝에는 높이 100m가 넘는 파로스 등대가 섰습니다(세계 7대 불가사의).',
    svg:`<rect class="sea" width="240" height="150"/><path class="land" d="M0,126 C40,124 80,128 110,122 C140,118 170,116 200,118 C220,118 232,122 240,122 L240,150 L0,150Z"/>
     <path class="land" d="M16,64 C46,56 100,54 150,54 C176,54 196,56 208,62 C198,72 170,74 140,72 C100,74 50,74 16,64Z"/>
     <path class="mole" d="M70,72 L86,72 L82,125 L66,125Z"/>
     <rect class="mole" x="200" y="50" width="7" height="9"/><text class="ts" x="200" y="44" text-anchor="middle">파로스 등대</text>
     <text class="ts" x="140" y="100" text-anchor="middle">동항구</text><text class="ts" x="34" y="100" text-anchor="middle">서항구</text>`},
   {n:'오늘 — 시가지',y:[-119,9999],note:'둑길 양쪽에 모래가 쌓여 폭 1km가 넘는 땅이 되었고, 지금은 그 위에 시가지가 있습니다. 옛 파로스 섬은 육지에 붙은 곶(라스 엘틴)이 되었습니다.',
    svg:`<rect class="sea" width="240" height="150"/><path class="land" d="M0,126 C40,124 80,128 110,122 C140,118 170,116 200,118 C220,118 232,122 240,122 L240,150 L0,150Z"/>
     <path class="land" d="M16,64 C46,56 100,54 150,54 C176,54 196,56 208,62 C198,72 170,74 140,72 C100,74 50,74 16,64Z"/>
     <path class="land" d="M46,70 L112,70 C106,88 104,106 112,124 L38,124 C48,106 52,88 46,70Z"/>
     <text class="tl" x="76" y="102" text-anchor="middle">시가지</text><text class="ts" x="168" y="100" text-anchor="middle">동항구</text>`}
  ]},
 {id:'ephesus',title:'에베소 — 바다에서 멀어진 항구',edits:['ephesus-bay'],places:['ephesus'],scale:'2km',
  stages:[
   {n:'항구 시대 (BC 1000~AD 3세기)',y:[-1000,262],note:'에베소는 카이스터 강 하구의 만에 항구를 둔 바닷가 도시였습니다. 바울이 에베소에 머물던 때에도 항구는 도시와 가까웠습니다 (행 19장).',
    svg:`<rect class="land" width="240" height="150"/><path class="sea" d="M0,0 L108,0 L118,30 L140,52 L152,70 L146,86 L128,92 L108,104 L96,150 L0,150Z"/>
     <path class="river" d="M240,40 C212,52 190,66 154,76"/><circle class="pt" cx="164" cy="82" r="3.2"/>
     <text class="tl" x="188" y="96" text-anchor="middle">에베소</text><text class="ts" x="50" y="70" text-anchor="middle">에게 해</text>
     <text class="ts" x="108" y="120" text-anchor="middle">항구가 있던 만</text><text class="tl" x="205" y="34" text-anchor="middle">카이스터 강</text>`},
   {n:'지금',y:[263,9999],note:'강이 실어 온 흙이 만을 메워 항구는 계속 막혔고, 로마 시대에 여러 번 준설했지만 결국 도시는 바다에서 멀어졌습니다. 지금 해안은 6~8km 서쪽에 있습니다.',
    svg:`<rect class="land" width="240" height="150"/><path class="sea" d="M0,0 L38,0 L34,40 L40,90 L30,150 L0,150Z"/>
     <path class="hl" d="M108,0 L118,30 L140,52 L152,70 L146,86 L128,92 L108,104 L96,150"/>
     <path class="river" d="M240,40 C212,52 190,66 154,76 L100,88 L44,92"/><circle class="pt" cx="164" cy="82" r="3.2"/>
     <text class="tl" x="188" y="96" text-anchor="middle">에베소 유적</text><text class="ts" x="18" y="75" text-anchor="middle">바다</text>
     <path class="hl" d="M40,126 L166,126"/><text class="tl" x="104" y="118" text-anchor="middle">6~8km</text><text class="tl" x="104" y="142" text-anchor="middle">메워진 옛 만(점선)</text>`}
  ]},
 {id:'miletus',title:'밀레도 — 메워진 만',edits:['miletus-gulf'],places:['miletus'],scale:'5km',
  stages:[
   {n:'항구 시대',y:[-1500,300],note:'밀레도는 메안데르 강 하구의 깊은 만(라트모스 만)에 면한 항구 도시였습니다. 바울이 에베소 장로들을 이곳으로 불러 작별했습니다 (행 20:15-38).',
    svg:`<rect class="land" width="240" height="150"/><path class="sea" d="M0,0 L86,0 L92,40 L108,58 L150,56 L200,64 L224,84 L214,110 L170,120 L126,116 L96,128 L70,150 L0,150Z"/>
     <path class="river" d="M240,40 C226,52 222,66 218,84"/><circle class="pt" cx="104" cy="80" r="3.2"/>
     <text class="tl" x="128" y="96" text-anchor="start">밀레도</text><text class="ts" x="40" y="70" text-anchor="middle">에게 해</text><text class="ts" x="170" y="92" text-anchor="middle">라트모스 만</text>`},
   {n:'지금',y:[301,9999],note:'메안데르 강이 흙을 계속 실어 와 만이 메워졌고, 도시는 바다에서 10km 넘게 멀어졌습니다. 옛 만의 흔적은 바프 호수로만 남아 있습니다.',
    svg:`<rect class="land" width="240" height="150"/><path class="sea" d="M0,0 L52,0 L46,60 L58,110 L40,150 L0,150Z"/>
     <path class="hl" d="M86,0 L92,40 L108,58 L150,56 L200,64 L224,84 L214,110 L170,120 L126,116 L96,128 L70,150"/>
     <ellipse class="wat" cx="196" cy="94" rx="16" ry="9"/><path class="river" d="M240,40 C214,48 150,60 104,70 L56,76"/>
     <circle class="pt" cx="104" cy="80" r="3.2"/><text class="tl" x="112" y="98" text-anchor="start">밀레도 유적</text>
     <text class="tl" x="196" y="114" text-anchor="middle">바프 호수</text><text class="ts" x="22" y="75" text-anchor="middle">바다</text>`}
  ]},
 {id:'caesarea',title:'가이사랴 — 바다에 쌓은 항구',edits:['caesarea-harbor'],places:['caesarea'],scale:'500m',
  stages:[
   {n:'헤롯의 항구 (BC 22~10)',y:[-22,700],note:'천연 항구가 없는 해안에 헤롯 대왕이 방파제를 바다에 쌓아 만든 인공 항구입니다. 물속에서 굳는 로마 시멘트와 나무 틀로 돌 방파제를 세웠고, 바울도 이곳에서 배를 탔습니다 (행 9:30; 18:22).',
    svg:`<rect class="sea" width="240" height="150"/><path class="land" d="M130,0 L128,50 L126,100 L124,150 L240,150 L240,0Z"/>
     <path class="mole" d="M126,104 C100,112 60,108 38,86 L42,80 C62,98 100,100 126,96Z"/>
     <path class="mole" d="M128,36 C108,34 84,40 70,52 L74,58 C90,48 110,44 128,44Z"/>
     <text class="ts" x="92" y="76" text-anchor="middle">세바스토스 항구</text><text class="ts" x="54" y="30" text-anchor="middle">입구(북쪽)</text>
     <text class="ts" x="64" y="130" text-anchor="middle">남쪽 방파제</text><text class="tl" x="186" y="76" text-anchor="middle">가이사랴</text><text class="tl" x="186" y="92" text-anchor="middle">(로마 총독의 수도)</text>`}
  ]}
];
