// 섹션 표시/숨김
const show = id => {
  document.querySelectorAll('main section').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  window.scrollTo({top:0, behavior:'smooth'});
};

// 1) 시작 → 캐릭터
document.getElementById('btnStart').addEventListener('click', ()=> show('characters'));

// 2) 캐릭터 선택
let selectedChar = null;
document.querySelectorAll('.card').forEach(card=>{
  card.addEventListener('click', ()=>{
    document.querySelectorAll('.card').forEach(c=>c.classList.remove('selected'));
    card.classList.add('selected');
    selectedChar = card.dataset.char;
    document.getElementById('btnCharNext').disabled = false;
  });
});
document.getElementById('btnCharNext').addEventListener('click', ()=>{
  if(!selectedChar) return;
  show('quests');
});

// 3) 퀘스트 허브 → 각 페이지
document.querySelectorAll('.qitem[data-go]').forEach(item=>{
  item.addEventListener('click', ()=> show(item.dataset.go));
});

// 4) OX 퀴즈
let oxAnswer = null; // 정답: O
document.querySelectorAll('#q-ox [data-ox]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    oxAnswer = btn.dataset.ox;
    const res = document.getElementById('oxResult');
    if(oxAnswer === 'O'){
      res.textContent = '정답! 만송정 소나무는 모래지형을 지지해 생태계에 도움을 줍니다.';
    }else{
      res.textContent = '아쉬워요! 정답은 O 입니다.';
    }
    document.getElementById('btnOxDone').disabled = false;
  });
});

// 5) 완료 → 포인트 → 쿠폰 (데모: 바로 쿠폰 페이지로)
document.querySelectorAll('[data-done]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    // 여기서 실제로는 업로드 검증/포인트 적립 API를 부를 수 있어요.
    show('coupons');
  });
});

// 처음으로
document.getElementById('btnBackHome').addEventListener('click', ()=> show('story'));
