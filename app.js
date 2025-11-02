// app.js (전체 교체)

// DOM 준비된 뒤에만 이벤트 바인딩 (시작 버튼 안 먹는 문제 방지)
document.addEventListener('DOMContentLoaded', () => {

  // 유틸
  const $ = id => document.getElementById(id);
  const show = id => {
    document.querySelectorAll('main section').forEach(s => s.classList.add('hidden'));
    $(id).classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 진행 상태
  const state = { recycle:false, photo:false, ox:false, keyring:false, happy:false };

  const updateProgress = () => {
    const done = Object.values(state).filter(Boolean).length;
    const el = $('qProgress');
    if (el) el.textContent = `진행 현황: ${done}/5 완료`;
    // 완료된 항목 카드에 체크 마크
    document.querySelectorAll('.qitem[data-key]').forEach(card => {
      const k = card.dataset.key;
      card.style.opacity = state[k] ? 0.55 : 1;
      card.style.position = 'relative';
      card.querySelector('.done-badge')?.remove();
      if (state[k]) {
        const b = document.createElement('div');
        b.className = 'done-badge';
        b.textContent = '✅ 완료';
        b.style.position = 'absolute';
        b.style.top = '8px';
        b.style.right = '10px';
        b.style.fontSize = '14px';
        card.appendChild(b);
      }
    });
    return done;
  };

  const markDone = key => {
    state[key] = true;
    const done = updateProgress();
    if (done === 5) {
      // 다 끝나야만 쿠폰 페이지로
      show('coupons');
    } else {
      alert(`퀘스트 완료! (${done}/5) 남은 퀘스트를 이어서 진행해 주세요.`);
      show('quests');
    }
  };

  // 1) 시작하기 → 캐릭터 (버튼이 안 먹는 경우 대비해 널체크 + 위임 모두 처리)
  const startBtn = $('btnStart');
  if (startBtn) startBtn.addEventListener('click', () => show('characters'));
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btnStart') show('characters');
  });

  // 2) 캐릭터 선택
  let selectedChar = null;
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedChar = card.dataset.char;
      $('btnCharNext').disabled = false;
    });
  });
  const nextBtn = $('btnCharNext');
  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (!selectedChar) return;
    show('quests');
    updateProgress();
  });

  // 3) 퀘스트 허브 → 각 페이지
  document.querySelectorAll('.qitem[data-go]').forEach(item => {
    item.addEventListener('click', () => show(item.dataset.go));
  });

  // 4) 업로드형 퀘스트들: 파일 선택만 되면 완료로 처리 (데모)
  const onFileComplete = (inputId, key) => {
    const el = $(inputId);
    if (!el) return;
    // 파일이 선택되면 바로 완료
    el.addEventListener('change', () => {
      if (el.files && el.files.length > 0) {
        markDone(key);
      }
    });
    // 완료 버튼이 있으면 버튼 클릭으로도 완료 가능
    document.querySelector(`[data-done="${key}"]`)?.addEventListener('click', () => markDone(key));
  };
  onFileComplete('recycleInput', 'recycle'); // ① 분리수거
  onFileComplete('photoInput',   'photo');   // ② 포토존
  onFileComplete('keyringInput', 'keyring'); // ④ 키링
  onFileComplete('happyInput',   'happy');   // ⑤ 행복사진

  // 5) O·X 퀴즈 (정답 O)
  let oxAnswer = null;
  document.querySelectorAll('#q-ox [data-ox]').forEach(btn => {
    btn.addEventListener('click', () => {
      oxAnswer = btn.dataset.ox;
      const res = $('oxResult');
      if (oxAnswer === 'O') {
        res.textContent = '정답! 만송정 소나무는 모래 지형을 지지해 생태계 보전에 도움이 됩니다.';
        $('btnOxDone').disabled = false;
      } else {
        res.textContent = '아쉽지만 오답이에요. 정답은 O 입니다.';
        $('btnOxDone').disabled = true;
      }
    });
  });
  $('btnOxDone')?.addEventListener('click', () => markDone('ox'));

  // 6) 처음으로
  $('btnBackHome')?.addEventListener('click', () => show('story'));

  // 초기 화면
  show('story');
});

/* ========= 진행상태 & 유틸 ========= */
const QUEST_KEYS = ["recycle","photo","ox","keyring","happy"];
let progress = JSON.parse(localStorage.getItem("hahoe-progress") || "{}");
QUEST_KEYS.forEach(k => { if(typeof progress[k] !== "boolean") progress[k] = false; });

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function showPanel(id){
  $$('.panel').forEach(p=>p.classList.add('hidden'));
  $('#'+id).classList.remove('hidden');
  window.scrollTo({top:0, behavior:"smooth"});
}

function saveProgress(){
  localStorage.setItem("hahoe-progress", JSON.stringify(progress));
}

/* 0/5 텍스트 & 배지 업데이트 */
function updateProgressUI(){
  const done = QUEST_KEYS.filter(k=>progress[k]).length;
  const t = $("#qProgress");
  if (t) t.textContent = `진행 현황: ${done}/5 완료`;

  QUEST_KEYS.forEach(k=>{
    const b = document.getElementById(`badge-${k}`);
    if (!b) return;
    b.textContent = progress[k] ? "완료" : "진행중";
    b.classList.toggle("done", !!progress[k]);
  });

  // 5개 모두 완료되면 쿠폰 자동 이동
  if (done === QUEST_KEYS.length){
    showPanel("coupons");
  }
}
updateProgressUI();

/* ========= 퀘스트 리스트 클릭 → 디테일 ========= */
$$('#quests .qitem').forEach(card=>{
  card.addEventListener('click', ()=>{
    const target = card.getAttribute('data-go');   // q-recycle, q-photo, q-ox, ...
    if (target) showPanel(target);
  });
});

/* ========= 파일 인증 공통 ========= */
function setupFileQuest(inputSel, doneBtnSel, key, previewSel){
  const input = $(inputSel);
  const doneBtn = $(doneBtnSel);
  const preview = previewSel ? $(previewSel) : null;

  if (!input || !doneBtn) return;

  input.addEventListener('change', ()=>{
    const file = input.files && input.files[0];
    if (!file) return;
    // 미리보기(선택)
    if (preview){
      const url = URL.createObjectURL(file);
      preview.src = url;
      preview.style.display = 'block';
    }
    doneBtn.disabled = false;
  });

  doneBtn.addEventListener('click', ()=>{
    progress[key] = true;
    saveProgress();
    updateProgressUI();
    showPanel('quests'); // 완료 후 목록으로 복귀
  });
}

/* 각 퀘스트 세팅 */
setupFileQuest('#recycleInput', '#btnRecycleDone', 'recycle', '#recyclePrev');
setupFileQuest('#photoInput',   '#btnPhotoDone',   'photo',   '#photoPrev');
setupFileQuest('#keyringInput', '#btnKeyDone',     'keyring', '#keyPrev');
setupFileQuest('#happyInput',   '#btnHappyDone',   'happy',   '#happyPrev');

/* ========= OX 퀘스트 ========= */
const oxBtns = $$('#q-ox .ox .btn');
const oxResult = $('#oxResult');
const oxDone = $('#btnOxDone');
let oxChoice = null;

// 정답 예시: O (필요시 문구 바꿔줘)
const OX_CORRECT = 'O';

oxBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    oxChoice = btn.dataset.ox;  // 'O' or 'X'
    oxBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    if (oxChoice === OX_CORRECT){
      oxResult.textContent = "정답! 만송정의 뿌리는 모래를 단단히 잡아 환경에 도움을 줍니다.";
    }else{
      oxResult.textContent = "아쉬워요! 정답은 O입니다. 만송정의 뿌리는 생태에 큰 역할을 해요.";
    }
    oxDone.disabled = false;
  });
});

oxDone.addEventListener('click', ()=>{
  if (!oxChoice) return;
  progress.ox = true;
  saveProgress();
  updateProgressUI();
  showPanel('quests');
});

/* OX 선택 강조 */
.ox .btn.active{ background:#caa57b; color:#fff; border-color:#b88a5d; }

