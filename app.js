
const state = {
  selectedChar: localStorage.getItem('char') || null,
  points: parseInt(localStorage.getItem('points')||'0',10),
  anger: parseInt(localStorage.getItem('anger')||'100',10),
  quests: [
    { id:'Q1', type:'eco',   icon:'♻️', title:'분리수거 퀘스트',  desc:'스마트 쓰레기통 QR 인식 후 분리수거 완료', points:20, key:'qr:bin' },
    { id:'Q2', type:'photo', icon:'📷', title:'강변 정화 인증',    desc:'낙동강변 정화 후 인증샷(현장 근접 200m)', points:15, key:'geo:36.5383,128.5194,200' },
    { id:'Q3', type:'quiz',  icon:'🧠', title:'만송정 OX 퀴즈',   desc:'소나무와 환경 OX 퀴즈(박물관 앞 QR)',   points:15, key:'qr:mask' },
    { id:'Q4', type:'craft', icon:'🧰', title:'업사이클링 공방',   desc:'병뚜껑 녹여 키링/실링왁스 제작(공방 QR)', points:25, key:'qr:craft' },
    { id:'Q5', type:'caps',  icon:'🧴', title:'병뚜껑 10개 기부',  desc:'집에서 가져온 병뚜껑 10개 수거함 투입',   points:10, key:'qr:caps10' }
  ],
  done: JSON.parse(localStorage.getItem('done')||'[]')
};
function save(){
  localStorage.setItem('char', state.selectedChar||'');
  localStorage.setItem('points', String(state.points));
  localStorage.setItem('done', JSON.stringify(state.done));
  localStorage.setItem('anger', String(state.anger));
}

// 탭
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('main > section').forEach(sec=>sec.classList.add('hidden'));
    document.getElementById('tab-'+btn.dataset.tab).classList.remove('hidden');
  });
});

const angerBar = document.getElementById('anger');
const pointsEl = document.getElementById('points');
const questsEl = document.getElementById('quests');

document.querySelectorAll('.char').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.char').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedChar = btn.dataset.char; save();
    document.querySelector('.tab[data-tab=\"quests\"]').click();
    renderQuests();
  });
  if(state.selectedChar===btn.dataset.char) btn.classList.add('active');
});

function renderQuests(){
  pointsEl.textContent = state.points;
  angerBar.style.width = Math.max(0, Math.min(100, state.anger)) + '%';
  questsEl.innerHTML = '';
  state.quests.forEach(q=>{
    const done = state.done.includes(q.id);
    const div = document.createElement('div');
    div.className = 'quest'+(done?' done':'');
    div.innerHTML = `<div class="left"><div class="icon">${q.icon}</div>
      <div><strong>${q.title}</strong><div class="small">${q.desc}</div></div></div>
      <div><span class="badge">+${q.points}p</span></div>`;
    questsEl.appendChild(div);
  });
}
renderQuests();

function markDoneByKey(key){
  const q = state.quests.find(x=>x.key===key);
  if(!q) return alert('해당 퀘스트가 없어요.');
  if(state.done.includes(q.id)) return alert('이미 완료한 퀘스트예요!');
  state.done.push(q.id);
  state.points += q.points;
  state.anger = Math.max(0, state.anger - 15);
  save(); renderQuests();
  alert(`퀘스트 완료! +${q.points}p · 농경신의 분노가 가라앉습니다.`);
  checkCoupon();
}

const params = new URLSearchParams(location.search);
const scan = params.get('scan'); const questKey = params.get('quest');
if(scan) markDoneByKey('qr:'+scan);
if(questKey) markDoneByKey(questKey);

document.getElementById('btn-scan').addEventListener('click',()=>{
  const code = prompt('스캔 코드 입력 (예: bin, mask, craft, caps10)');
  if(code) markDoneByKey('qr:'+code.trim());
});
document.getElementById('btn-locate').addEventListener('click',()=>{
  if(!navigator.geolocation) return alert('이 기기에서 위치 사용 불가');
  navigator.geolocation.getCurrentPosition(pos=>{
    const t = state.quests.find(q=>q.key.startsWith('geo:') && !state.done.includes(q.id));
    if(!t) return alert('현장 인증 퀘스트가 없거나 완료됨');
    const [lat,lng,rad] = t.key.replace('geo:','').split(',').map(Number);
    const d = distance(pos.coords.latitude,pos.coords.longitude,lat,lng);
    if(d<=rad) markDoneByKey(t.key); else alert(`반경 ${rad}m 이내에서 인증(현재 약 ${Math.round(d)}m)`);
  }, e=>alert('위치 인증 실패: '+e.message));
});
document.getElementById('btn-redeem').addEventListener('click',checkCoupon);
document.getElementById('btn-reset').addEventListener('click',()=>{
  if(confirm('초기화할까요?')){ localStorage.clear(); location.reload(); }
});

function checkCoupon(){
  const need=60, box=document.getElementById('couponBox');
  if(state.points>=need){
    const code='HHOE-'+(Math.random().toString(36).slice(2,8)).toUpperCase();
    box.textContent=`쿠폰: ${code} · 유효 24시간 · 10% 할인`;
    document.querySelector('.tab[data-tab="coupon"]').click();
  }else{
    alert(`포인트 ${need}p 이상부터 쿠폰 생성 (현재 ${state.points}p)`);
  }
}
function distance(a,b,c,d){
  const R=6371000, toRad=x=>x*Math.PI/180;
  const dLat=toRad(c-a), dLon=toRad(d-b);
  const x=Math.sin(dLat/2)**2+Math.cos(toRad(a))*Math.cos(toRad(c))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}

// PWA
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
}
