const $ = id => document.getElementById(id);
const fields = {query:$("query"),type:$("type"),availability:$("availability"),sort:$("sort")};
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const text = value => escapeHTML(value);
function state(f) {
  if (f.status) return {label:f.status,kind:"consult",rank:1};
  if (f.vacancies > 0) return {label:f.type === "特養" ? `空床 ${f.vacancies}床` : `空室 ${f.vacancies}室`,kind:"open",rank:0};
  if (f.vacancies === 0) return {label:f.type === "特養" ? "集計時の空床 0床" : "掲載時の空室 0室",kind:"zero",rank:2};
  return {label:"空き情報なし",kind:"unknown",rank:3};
}
function renderCard(f) {
  const s=state(f), date=f.statusDate || (f.type==="特養" && (f.vacancies!==null || f.waiting!==null) ? "2026-08-24" : null);
  const source=f.statusSource || f.source;
  const detail=f.type==="特養" ? `<div><span>入所待ち</span><strong>${f.waiting===null?"非掲載":f.waiting+"人"}</strong></div><div><span>うち要介護4以上</span><strong>${f.waitingCare4===null?"非掲載":f.waitingCare4+"人"}</strong></div>` : `<div><span>空室数</span><strong>${f.vacancies===null?"非掲載":f.vacancies+"室"}</strong></div><div><span>待機人数</span><strong>公表なし</strong></div>`;
  return `<article class="facility-card"><div class="card-header"><span class="type-tag">${text(f.type==="特養"?"特養":"介護付有料")}</span><span class="status ${s.kind}">${text(s.label)}</span></div>
    <h3>${text(f.name)}</h3><p class="address">${text(f.address)}</p>
    <div class="numbers">${detail}</div>
    <p class="date">${date?`情報の基準日：${text(date)}`:"空き情報の掲載なし"}</p>
    <details><summary>施設情報・出典を見る</summary><div class="details-body"><p>所在地：${text(f.address)}</p>${f.capacity?`<p>定員：${f.capacity}名</p>`:""}<p>${f.phone?`電話：<a href="tel:${text(f.phone)}">${text(f.phone)}</a>`:"電話番号は原資料または施設ページで確認してください"}</p><p>${f.type==="特養"?"施設・空床情報の出典":"施設名・所在地の出典"}：<a href="${f.source}" target="_blank" rel="noopener">${text(f.sourceLabel)}</a></p>${f.statusSource?`<p>空き情報の出典：<a href="${source}" target="_blank" rel="noopener">運営者の掲載ページ</a></p>`:""}${f.official?`<p><a href="${f.official}" target="_blank" rel="noopener">施設の公式ページを開く</a></p>`:""}</div></details>
    ${f.phone?`<a class="contact" href="tel:${text(f.phone)}">電話で確認</a>`:`<a class="contact secondary" href="${f.official||f.source}" target="_blank" rel="noopener">施設情報を確認</a>`}</article>`;
}
function render() {
  const q=fields.query.value.trim().normalize("NFKC").toLowerCase();
  let list=window.FACILITIES.filter(f=>{
    if(q && !`${f.name} ${f.address}`.normalize("NFKC").toLowerCase().includes(q))return false;
    if(fields.type.value!=="all" && f.type!==fields.type.value)return false;
    const availability=fields.availability.value;
    if(availability==="positive" && !(f.status || f.vacancies>0))return false;
    if(availability==="published" && !f.status && f.vacancies===null)return false;
    if(availability==="unknown" && (f.status || f.vacancies!==null))return false;
    return true;
  });
  list.sort((a,b)=>fields.sort.value==="name"?a.name.localeCompare(b.name,"ja"):fields.sort.value==="waiting"?(a.waiting??9999)-(b.waiting??9999):state(a).rank-state(b).rank||a.name.localeCompare(b.name,"ja"));
  $("count").textContent=list.length;
  $("facilityList").innerHTML=list.length?list.map(renderCard).join(""):'<p class="empty">条件に合う施設がありません。条件を変えてお探しください。</p>';
}
Object.values(fields).forEach(el=>el.addEventListener(el===fields.query?"input":"change",render));
$("reset").addEventListener("click",()=>{fields.query.value="";fields.type.value="all";fields.availability.value="all";fields.sort.value="default";render();});
fetch("data/facilities.json").then(response=>{if(!response.ok)throw new Error("データを取得できません");return response.json();}).then(db=>{
  window.FACILITIES=db.facilities;
  $("dataVersion").textContent=`データ確認 ${db.version}`;
  render();
}).catch(()=>{$("facilityList").innerHTML='<p class="empty">施設データを読み込めませんでした。時間をおいて再読み込みしてください。</p>';});
