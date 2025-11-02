/* =========================
   hahoe-rpg / app.js (clean)
   Flow: Story -> Characters -> Quests -> (complete 5) -> Coupons
   ========================= */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Utils ---------- */
  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function showPanel(id) {
    $$('.panel').forEach(p => p.classList.add('hidden'));
    const tgt = document.getElementById(id);
    if (tgt) tgt.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Progress (localStorage) ---------- */
  const KEYS = ['recycle', 'photo', 'ox', 'keyring', 'happy'];
  let progress = JSON.parse(localStorage.getItem('hahoe-progress') || '{}');
  KEYS.forEach(k => { if (typeof progress[k] !== 'boolean') progress[k] = false; });

  function save() {
    localStorage.setItem('hahoe-progress', JSON.stringify(progress));
  }

  function updateUI() {
    // text
    const done = KEYS.filter(k => progress[k]).length;
    const label = $('#qProgress');
    if (label) label.textContent = `진행 현황: ${done}/5 완료`;

    // badges
    KEYS.forEach(k => {
      const b = document.getElementById(`badge-${k}`);
      if (!b) return;
      b.textContent = progress[k] ? '완료' : '대기';
      b.classList.toggle('done', !!progress[k]);
    });

    // auto open coupons if all done
    if (done === KEYS.length) {
      showPanel('coupons');
    }
  }

  function markDone(key) {
    if (!KEYS.includes(key)) return;
    progress[key] = true;
    save();
    const count = KEYS.filter(k => progress[k]).length;
    if (count === KEYS.length) {
      showPanel('coupons');
    } else {
      showPanel('quests');
    }
    updateUI();
  }

  /* ---------- 0) Start ---------- */
  showPanel('story');
  updateUI();

  $('#btnStart')?.addEventListener('click', () => {
    showPanel('characters');
  });

  /* ---------- 1) Character select ---------- */
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
    updateUI();
  });

  /* ---------- 2) Quests hub -> details ---------- */
  $$('#quests .qcard').forEach(card => {
    card.addEventListener('click', () => {
      const target = card.getAttribute('data-go'); // q-recycle / q-photo ...
      if (target) showPanel(target);
    });
  });

  /* ---------- 3) Back buttons ---------- */
  $$('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => showPanel('quests'));
  });

  /* ---------- 4) File quests (4) ---------- */
  [
    ['#recycleInput', '#btnRecycleDone', 'recycle'],
    ['#photoInput',   '#btnPhotoDone',   'photo'  ],
    ['#keyringInput', '#btnKeyDone',     'keyring'],
    ['#happyInput',   '#btnHappyDone',   'happy'  ],
  ].forEach(([inputSel, btnSel, key]) => {
    const input = $(inputSel);
    const btn   = $(btnSel);
    if (!input || !btn) return;

    // enable button when a file selected
    input.addEventListener('change', () => {
      btn.disabled = !(input.files && input.files.length > 0);
    });

    // mark done
    btn.addEventListener('click', () => {
      if (!(input.files && input.files.length > 0)) return;
      markDone(key);
    });
  });

  /* ---------- 5) OX quest ---------- */
  const OX_CORRECT = 'O';
  let oxChoice = null;

  $$('#q-ox [data-ox]').forEach(b => {
    b.addEventListener('click', () => {
      oxChoice = b.dataset.ox;
      $$('#q-ox [data-ox]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');

      const r = $('#oxResult');
      if (oxChoice === OX_CORRECT) {
        r.textContent = '정답! 만송정 소나무의 뿌리는 모래 지형을 지지해 생태계에 도움을 줍니다.';
        r.style.color = '#246b2b';
      } else {
        r.textContent = '아쉬워요. 정답은 O 입니다. 🌲';
        r.style.color = '#a14a2a';
      }
      $('#btnOxDone').disabled = false; // 학습형: 선택하면 진행 가능
    });
  });

  $('#btnOxDone')?.addEventListener('click', () => {
    if (!oxChoice) return;
    markDone('ox');
  });

  /* ---------- 6) Coupons -> Home ---------- */
  $('#btnBackHome')?.addEventListener('click', () => {
    showPanel('story');
  });
});

  // data-back 붙은 버튼은 항상 퀘스트 허브로
  $$('[data-back]').forEach(b => b.addEventListener('click', () => showPanel('quests')));
  // 쿠폰에서 집으로
  $('#btnBackHome')?.addEventListener('click', () => showPanel('story'));
});
