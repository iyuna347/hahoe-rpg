// 탭 전환 헬퍼
const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

const tabs = {
  story: $('#tab-story'),
  character: $('#tab-character'),
  quest: $('#tab-quest'),
  coupon: $('#tab-coupon')
};
const navTabs = $$('.tab');

function showTab(name){
  Object.values(tabs).forEach(el=>el.hidden=true);
  tabs[name].hidden = false;
  navTabs.forEach(t=>t.classList.toggle('active', t.dataset.tab===name));
}

// ① 시작하기 → 캐릭터 강제 흐름
$('#startBtn').addEventListener('click', ()=>{
  showTab('character');
});

// 내비게이션 탭 클릭(스토리 외엔 캐릭터 선택 전에는 막기)
navTabs.forEach(t=>{
  t.addEventListener('click', ()=>{
    const dest = t.dataset.tab;
    if(dest!=='story' && !localStorage.getItem('hahoe.character')){
      alert('먼저 [시작하기] → 캐릭터를 선택해주세요.');
      return;
    }
    showTab(dest);
  });
});

// ② 캐릭터 선택 → 선택해야만 "다음" 활성화
const charGrid = $('#charGrid');
const toQuest = $('#toQuest');

charGrid.addEventListener('click', e=>{
  const card = e.target.closest('.char');
  if(!card) return;
  $$('.char', charGrid).forEach(c=>c.classList.remove('selected'));
  card.classList.add('selected');
  const id = card.dataset.id;
  localStorage.setItem('hahoe.character', id);
  toQuest.disabled = false;
});

toQuest.addEventListener('click', ()=>{
  showTab('quest');
});

// ③ 퀘스트 더미 로직 (완료 처리/포인트 적립 흉내)
let points = Number(localStorage.getItem('hahoe.points')||0);
function addPoint(n){
  points += n;
  localStorage.setItem('hahoe.points', points);
}

// 분리수거/조각찾기 버튼
$$('[data-quest]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const q = btn.dataset.quest;
    // 실제에선 QR/지도 등으로 연동. 지금은 즉시 완료 처리.
    alert('퀘스트 완료! +10 포인트');
    addPoint(10);
  });
});

// ④ 만송정 OX 퀴즈 (버튼만)
const oxMsg = $('#oxMsg');
$$('.ox').forEach(b=>{
  b.addEventListener('click', ()=>{
    const sel = b.dataset.ox;  // 'O' or 'X'
    // 예시문항: "만송정 숲은 하회마을 모래언덕을 보호한다 – O"
    const correct = 'O';
    if(sel === correct){
      oxMsg.textContent = '정답! +10 포인트';
      addPoint(10);
    }else{
      oxMsg.textContent = '오답! 다음 기회에…';
    }
  });
});

// ⑤ 쿠폰 탭 이동
$('#toCoupon').addEventListener('click', ()=>{
  showTab('coupon');
});

// 첫 진입은 스토리 탭
showTab('story');
