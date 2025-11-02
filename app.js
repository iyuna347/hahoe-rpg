/* =========================
   hahoe-rpg / app.js  (FINAL)
   ========================= */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Shorthands ---------- */
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => root.querySelectorAll(sel);

  /* ---------- Panels ---------- */
  function showPanel(id){
    $$('.panel').forEach(p => p.classList.add('hidden'));
    const tgt = document.getElementById(id);
    if (tgt) {
      tgt.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /* ---------- Progress (localStorage) ---------- */
  const STORE_KEY = 'hahoe-progress';
  const KEYS = ['recycle','photo','ox','keyring','happy']; // 5개

  function loadProgress(){
    try{
      const p = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      KEYS.forEach(k => { if (typeof p[k] !== 'boolean') p[k] = false; });
      return p;
    }catch(e){
      return { recycle:false, photo:false, ox:false, keyring:false, happy:false };
    }
  }
  function saveProgress(p){ localStorage.setItem(STORE_KEY, JSON.stringify(p)); }

  let progress = loadProgress();

  function updateBadgesAndCounter(){
    // 진행 텍스트
    const doneCount = KEYS.filter(k => progress[k]).length;
    const progEl = $('#qProgress');
    if (progEl) progEl.textContent = `진행 현황: ${doneCount}/5 완료`;

    // 배지 업데이트
    KEYS.forEach(k => {
      const b = document.getElementById(`badge-${k}`);
      if (!b) return;
      if (progress[k]) {
        b.textContent = '완료';
        b.classList.add('done');
      } else {
        b.textContent = '대기';
        b.classList.remove('done');
      }
    });

    // 전부 완료 → 쿠폰
    if (doneCount === KEYS.length) showPanel('coupons');
  }

  function markDone(key){
    if (!KEYS.includes(key)) return;
    progress[key] = true;
    saveProgress(progress);
    updateBadgesAndCounter();

    // 모두 완료면 쿠폰, 아니면 허브로 복귀
    const doneCount = KEYS.filter(k => progress[k]).length;
    showPanel(doneCount === KEYS.length ? 'coupons' : 'quests');
  }

  /* ---------- 0) 초기 화면 ---------- */
  showPanel('story');          // 스토리부터 시작
  updateBadgesAndCounter();    // 진행도 & 배지 반영

  /* ---------- 1) 시작하기 → 캐릭터 ---------- */
  // (중복 방지 + 방어적 바인딩)
  const startBtn = document.getElementById('btnStart');
  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showPanel('characters');
      $('#characters .card')?.scrollIntoView({ behavior:'smooth', block:'start' });
    }, { once:true });
  }

  /* ---------- 2) 캐릭터 선택 → 다음 ---------- */
  let selectedChar = null;
  const charCards = $$('#characters .card');
  const btnCharNext = document.getElementById('btnCharNext');

  charCards.forEach(card => {
    card.addEventListener('click', () => {
      charCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedChar = card.dataset.char || null;
      if (btnCharNext) btnCharNext.disabled = !selectedChar;
    });
  });

  btnCharNext?.addEventListener('click', () => {
    if (!selectedChar) return;
    showPanel('quests');
    updateBadgesAndCounter();
  });

  /* ---------- 3) 퀘스트 허브: 카드 클릭 → 상세 ---------- */
  // HTML에서 퀘스트 카드는 .qcard (button) 이고, data-go 로 이동할 타겟 id를 가짐.
  $$('#quests .qcard').forEach(card => {
    card.addEventListener('click', () => {
      const target = card.getAttribute('data-go'); // 예: "q-recycle"
      if (target) showPanel(target);
    });
  });

  /* ---------- 4) 파일 인증형 4개 퀘스트 ---------- */
  // 파일 고르면 완료 버튼 활성화 → 완료 클릭 시 markDone
  const fileQuests = [
    { input:'#recycleInput', done:'#btnRecycleDone', key:'recycle' },
    { input:'#photoInput',   done:'#btnPhotoDone',   key:'photo'   },
    { input:'#keyringInput', done:'#btnKeyDone',     key:'keyring' },
    { input:'#happyInput',   done:'#btnHappyDone',   key:'happy'   },
  ];

  fileQuests.forEach(({input, done, key}) => {
    const $input = $(input);
    const $done  = $(done);
    if (!$input || !$done) return;

    $input.addEventListener('change', () => {
      $done.disabled = !($input.files && $input.files.length > 0);
    });
    $done.addEventListener('click', () => markDone(key));
  });

  /* ---------- 5) 만송정 O·X 퀴즈 ---------- */
  const OX_CORRECT = 'O';
  let oxChoice = null;

  $$('#q-ox [data-ox]').forEach(btn => {
    btn.addEventListener('click', () => {
      oxChoice = btn.dataset.ox;
      // active 스타일 토글
      $$('#q-ox [data-ox]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 피드백
      const r = $('#oxResult');
      if (oxChoice === OX_CORRECT) {
        r.textContent = '정답입니다! 🌲 만송정 소나무는 모래 지형을 단단히 잡아줍니다.';
        r.style.color = '#246b2b';
      } else {
        r.textContent = '아쉬워요! 정답은 O 입니다.';
        r.style.color = '#a14a2a';
      }
      // 학습형: 선택만 하면 완료 버튼 활성화
      const oxDone = $('#btnOxDone');
      if (oxDone) oxDone.disabled = false;
    });
  });

  $('#btnOxDone')?.addEventListener('click', () => {
    if (!oxChoice) return;
    markDone('ox');
  });

  /* ---------- 6) 공통: 뒤로가기 / 처음으로 ---------- */
  // 상세 퀘스트에서 "목록으로" 버튼 → 허브
  $$('[data-back]').forEach(b => b.addEventListener('click', () => showPanel('quests')));
  // 쿠폰에서 "처음으로"
  $('#btnBackHome')?.addEventListener('click', () => showPanel('story'));
});
