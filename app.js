document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  const sections = document.querySelectorAll('section[id^="tab-"]');
  function showTab(name){
    tabs.forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    sections.forEach(s => s.hidden = s.id !== `tab-${name}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  tabs.forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.tab)));
  document.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => showTab(b.dataset.goto)));
  const start = document.getElementById('btn-start');
  if (start) start.addEventListener('click', () => showTab('select'));

  const state = {
    points: 0,
    char: null,
    quests: [
      {id:'Q1', icon:'♻️', title:'분리수거 퀘스트', desc:'스마트 쓰레기통 QR 스캔 후 올바르게 분리수거', points:20, key:'qr:bin'},
      {id:'Q2', icon:'📸', title:'강변 정화 인증',   desc:'강변·숲길 오염 취약구역 정화 후 인증샷 업로드', points:20, key:'qr:clean'},
      {id:'Q3', icon:'🌲', title:'만송정 OX 퀴즈',   desc:'소나무와 환경에 관한 OX 퀴즈 풀기', points:20, key:'qr:mask'},
      {id:'Q4', icon:'🛠️', title:'업사이클링 공방', desc:'병뚜껑으로 키링/실링왁스 만들기', points:25, key:'qr:craft'},
      {id:'Q5', icon:'🧃', title:'병뚜껑 10개 기부', desc:'집에서 모아온 병뚜껑 10개 제출', points:30, key:'qr:caps10'},
    ]
  };

  const chars = [
    {id:'yangban', name:'양반',     img:'assets/characters/yangban.png', perk:'문화해설 +10'},
    {id:'yeon',    name:'연이낭자', img:'assets/characters/yeon.png',    perk:'생태감수성 +10'},
    {id:'ttogi',   name:'또기',     img:'assets/characters/ttogi.png',   perk:'민첩 +10'},
    {id:'eojin',   name:'어진할배', img:'assets/characters/eojin.png',   perk:'지식 +10'},
  ];

  const grid = document.getElementById('char-grid');
  grid.innerHTML = chars.map(c => `
    <button class="char" data-id="${c.id}">
      <div class="char-img"><img src="${c.img}" alt="${c.name}"></div>
      <div class="char-name">${c.name}</div>
      <div class="badge">${c.perk}</div>
    </button>
  `).join('');

  grid.querySelectorAll('.char').forEach(el => {
    el.addEventListener('click', () => {
      state.char = el.dataset.id;
      alert(`${chars.find(c=>c.id===state.char).name} 선택! 퀘스트로 이동합니다.`);
      showTab('quests');
    });
  });

  const list = document.getElementById('quest-list');
  list.innerHTML = state.quests.map(q => `
    <div class="item">
      <div class="badge">${q.icon}</div>
      <div class="grow">
        <div><b>${q.title}</b></div>
        <div class="muted">${q.desc}</div>
      </div>
      <button class="btn ghost" data-key="${q.key}">완료</button>
    </div>
  `).join('');

  function award(key){
    const btn = [...document.querySelectorAll('[data-key]')].find(b => b.dataset.key.endsWith(key));
    if (!btn || btn.disabled) return;
    btn.disabled = true; btn.textContent = '완료됨';
    const q = state.quests.find(x=>x.key === btn.dataset.key);
    state.points += q.points;
    updateCoupon();
  }

  const url = new URL(location.href);
  const scan = url.searchParams.get('scan');
  if (scan) award(scan);

  document.querySelectorAll('[data-key]').forEach(b => {
    b.addEventListener('click', () => award(b.dataset.key.split(':')[1]));
  });

  function updateCoupon(){
    const el = document.getElementById('coupon-area');
    const need = 60;
    el.innerHTML = (state.points >= need)
      ? `<div class="card paper"><b>하회 포인트: ${state.points}</b><p>쿠폰이 발급되었습니다. (굿즈/체험 10% 할인)</p></div>`
      : `<div class="card paper"><b>하회 포인트: ${state.points}</b><p>${need - state.points}점 더 모으면 쿠폰 발급!</p></div>`;
  }
  updateCoupon();
});