/* =========================
   hahoe-rpg / app.js (clean)
   ========================= */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Utils ---------- */
  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // 패널 전환
  function showPanel(id) {
    $$('.panel').forEach(p => p.classList.add('hidden'));
    const tgt = document.getElementById(id);
    if (tgt) tgt.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 진행상태 로컬스토리지
  const KEYS = ['recycle', 'photo', 'ox', 'keyring', 'happy'];
  let progress = JSON.parse(localStorage.getItem('hahoe-progress') || '{}');
  KEYS.forEach(k => { if (typeof progress[k] !== 'boolean') progress[k] = false; });
  function save() {
    localStorage.setItem('hahoe-progress', JSON.stringify(progress));
  }

  // 진행 UI 갱신 + 쿠폰 오픈
  function updateProgressUI() {
    const done = KEYS.filter(k => progress[k]).length;
    const label = $('#qProgress');
    if (label) label.textContent = `진행 현황: ${done}/5 완료`;

    // 배지 텍스트/스타일
    KEYS.forEach(k => {
      const b = document.getElementById(`badge-${k}`);
      if (!b) return;
      b.textContent = progress[k] ? '완료' : '진행중';
      b.classList.toggle('done', !!progress[k]);
    });

    // 카드 투명도 & 완료뱃지
    $$('#quests .qitem[data-key]').forEach(card => {
      const k = card.dataset.key;
      const done = !!progress[k];
      card.style.opacity = done ? 0.55 : 1;
      card.querySelector('.done-badge')?.remove();
      if (done) {
        const tag = document.createElement('div');
        tag.className = 'done-badge';
        tag.textContent = '✅ 완료';
        Object.assign(tag.style, {
          position: 'absolute', top: '6px', right: '10px',
          fontSize: '12px', fontWeight: '700'
        });
        card.style.position = 'relative';
        card.appendChild(tag);
      }
    });

    if (done === KEYS.length) showPanel('coupons');
  }

  // 완료 처리 공통
  function markDone(key) {
    if (!KEYS.includes(key)) return;
    progress[key] = true;
    save();
    updateProgressUI();

    // 전부 끝났으면 쿠폰으로, 아니면 허브로
    const done = KEYS.filter(k => progress[k]).length;
    showPanel(done === KEYS.length ? 'coupons' : 'quests');
  }

  /* ---------- 0) 첫 화면 ---------- */
  showPanel('story');      // 항상 스토리부터
  updateProgressUI();      // 진행 뱃지/숫자 갱신

  /* ---------- 1) 시작하기 → 캐릭터 ---------- */
  $('#btnStart')?.addEventListener('click', () => {
    showPanel('characters');
    $('#characters .card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- 2) 캐릭터 선택 ---------- */
  let selectedChar = null;
  $$('#characters .card').forEach(card => {
    card.addEventListener('click', () => {
      $$('#characters .card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedChar = card.dataset.char || null;
      $('#btnCharNext').disabled = !selectedChar;
    });
  });

  $('#btnCharNext')?.addEventListener('click', () => {
    if (!selectedChar) return;
    showPanel('quests');
  });

  /* ---------- 3) 퀘스트 허브: 카드 클릭 → 상세로 ---------- */
  // 이벤트 위임이라 .qitem 내부 어디를 눌러도 이동
  document.getElementById('quests')?.addEventListener('click', (e) => {
    const card = e.target.closest('.qitem[data-go]');
    if (!card) return;
    const target = card.dataset.go; // 예: q-recycle
    if (target) showPanel(target);
  });

  /* ---------- 4) 파일 인증형 퀘스트(4개) ---------- */
  function setupFileQuest({ inputId, doneBtnSel, key, previewSel }) {
    const input   = document.getElementById(inputId);
    const doneBtn = doneBtnSel ? $(doneBtnSel) : document.querySelector(`[data-done="${key}"]`);
    const preview = previewSel ? $(previewSel) : null;
    if (!input) return;

    // 파일 선택 시 미리보기 + 완료 버튼 활성화
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (preview) {
        const url = URL.createObjectURL(file);
        preview.src = url;
        preview.style.display = 'block';
      }
      if (doneBtn) doneBtn.disabled = false;
      else {
        // 완료 버튼이 없는 구성이라면 파일 선택 즉시 완료 처리
        markDone(key);
      }
    });

    // 완료 버튼 클릭으로 확정
    doneBtn?.addEventListener('click', () => markDone(key));
  }

  setupFileQuest({ inputId: 'recycleInput', doneBtnSel: '#btnRecycleDone', key: 'recycle', previewSel: '#recyclePrev' });
  setupFileQuest({ inputId: 'photoInput',   doneBtnSel: '#btnPhotoDone',   key: 'photo',   previewSel: '#photoPrev'   });
  setupFileQuest({ inputId: 'keyringInput', doneBtnSel: '#btnKeyDone',     key: 'keyring', previewSel: '#keyPrev'     });
  setupFileQuest({ inputId: 'happyInput',   doneBtnSel: '#btnHappyDone',   key: 'happy',   previewSel: '#happyPrev'   });

  /* ---------- 5) 만송정 O·X ---------- */
  const OX_CORRECT = 'O'; // 정답은 O
  let oxChoice = null;

  // 선택
  $$('#q-ox [data-ox]').forEach(btn => {
    btn.addEventListener('click', () => {
      oxChoice = btn.dataset.ox;
      $$('#q-ox [data-ox]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const r = $('#oxResult');
      if (oxChoice === OX_CORRECT) {
        r.textContent = '정답! 만송정 소나무의 뿌리는 모래 지형을 지지해 생태계에 도움을 줍니다.';
        r.style.color = '#246b2b';
        $('#btnOxDone').disabled = false;
      } else {
        r.textContent = '아쉬워요. 정답은 O 입니다. 🌲';
        r.style.color = '#a14a2a';
        $('#btnOxDone').disabled = false; // 학습형: 오답이어도 진행 가능
      }
    });
  });

  // 완료
  $('#btnOxDone')?.addEventListener('click', () => {
    if (!oxChoice) return;
    markDone('ox');
  });

  /* ---------- 6) 공통: 뒤로가기 / 처음으로 ---------- */
  // data-back 붙은 버튼은 항상 퀘스트 허브로
  $$('[data-back]').forEach(b => b.addEventListener('click', () => showPanel('quests')));
  // 쿠폰에서 집으로
  $('#btnBackHome')?.addEventListener('click', () => showPanel('story'));
});
