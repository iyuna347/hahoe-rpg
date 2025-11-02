/* 상태 */
const state = {
  locked: true,            // 시작하기 누르기 전 탭 잠금
  character: null,         // 선택 캐릭터
  quests: {                // 5개 퀘스트 완료 상태
    bin: false, photo: false, quiz: false, upcycle: false, local: false
  },
  currentQuest: null
};

/* 유틸 */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function setTab(name){
  // 잠금: story 외 접근 불가
  if(state.locked && name !== 'story') return;
  $$('.tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===name));
  $$('.tab-pane').forEach(p=>p.classList.toggle('show', p.id===`tab-${name}`));
}

function unlockTabs(){
  state.locked = false;
  // 캐릭터 탭만 우선 해제
  $("[data-tab='character']").disabled = false;
}

/* 초기 탭 */
setTab('story');

/* 탭 버튼 */
$$('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>setTab(btn.dataset.tab));
});

/* 시작하기 */
$('#btn-start').addEventListener('click', ()=>{
  unlockTabs();
  setTab('character');
});

/* 캐릭터 선택 → 다음 버튼 활성 */
const nextBtn = $('#btn-next-to-quest');
$$("input[name='character']").forEach(r=>{
  r.addEventListener('change', ()=>{
    state.character = r.value;
    nextBtn.disabled = false;
  });
});

nextBtn.addEventListener('click', ()=>{
  // 퀘스트 탭 해제
  $("[data-tab='quest']").disabled = false;
  setTab('quest');
  updateDone();
});

/* 퀘스트 선택 → 인증 화면 */
$('#quest-list').addEventListener('click', (e)=>{
  const btn = e.target.closest('.quest');
  if(!btn) return;
  const q = btn.dataset.quest;
  state.currentQuest = q;
  showVerify(q);
});

function showVerify(q){
  const title = {
    bin:'분리수거 퀘스트 인증',
    photo:'포토존 정화 인증',
    quiz:'만송정 OX 퀴즈 인증',
    upcycle:'업사이클링 키링 제작 인증',
    local:'로컬상생 미션 인증'
  }[q];

  const desc = {
    bin:'분리수거존 QR 스캔 후 현장 인증 사진(또는 촬영) 제출.',
    photo:'정화 활동 후 인증샷 촬영/업로드.',
    quiz:'OX존 문제 풀이 후 현장 표지판과 함께 인증.',
    upcycle:'체험존에서 제작한 키링을 들고 인증.',
    local:'제휴상점 참여 미션(스탬프/영수증) 인증.'
  }[q];

  $('#verify-title').textContent = title;
  $('#verify-desc').textContent = desc;

  // 버튼 상태 초기화
  $('#btn-verify-complete').disabled = true;
  $('#btn-shot').disabled = true;
  $('#preview').classList.add('hidden');
  $('#snap').classList.add('hidden');
  stopCamera();

  setTab('verify');
}

/* 인증 화면: 카메라 / 파일 업로드 */
let stream;
async function startCamera(){
  try{
    stream = await navigator.mediaDevices.getUserMedia({video:true});
    const v = $('#cam');
    v.srcObject = stream;
    $('#btn-shot').disabled = false;
  }catch(e){
    alert('카메라를 사용할 수 없습니다. 파일 업로드를 이용하세요.');
  }
}
function stopCamera(){
  if(stream){
    stream.getTracks().forEach(t=>t.stop());
    stream = null;
  }
}

$('#btn-open-camera').addEventListener('click', startCamera);

$('#btn-shot').addEventListener('click', ()=>{
  const v = $('#cam');
  const c = $('#snap');
  const ctx = c.getContext('2d');
  c.width = v.videoWidth; c.height = v.videoHeight;
  ctx.drawImage(v, 0, 0, c.width, c.height);
  c.classList.remove('hidden');
  $('#preview').classList.add('hidden');
  $('#btn-verify-complete').disabled = false;
});

$('#file-upload').addEventListener('change', (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  const url = URL.createObjectURL(file);
  const img = $('#preview');
  img.src = url;
  img.classList.remove('hidden');
  $('#snap').classList.add('hidden');
  $('#btn-verify-complete').disabled = false;
});

$('#btn-back-quest').addEventListener('click', ()=>{
  stopCamera();
  setTab('quest');
});

/* 인증 완료 처리 */
$('#btn-verify-complete').addEventListener('click', ()=>{
  if(!state.currentQuest) return;
  state.quests[state.currentQuest] = true;
  state.currentQuest = null;
  stopCamera();
  updateDone();

  // 모두 완료 시 쿠폰 탭 오픈
  if(isAllDone()){
    $("[data-tab='coupon']").disabled = false;
    setTab('coupon');
  }else{
    alert('인증 완료! 다른 퀘스트도 계속해 주세요.');
    setTab('quest');
  }
});

function updateDone(){
  const count = Object.values(state.quests).filter(Boolean).length;
  $('#done-count').textContent = count;
}
function isAllDone(){
  return Object.values(state.quests).every(Boolean);
}

/* 캐시 무효화를 위한 간단한 버전 핀 */
console.log('Hahoe RPG v5');
