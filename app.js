window.FACILITIES = [];
const $ = id => document.getElementById(id);
const fields = {query:$("query"),area:$("area"),type:$("type"),availability:$("availability"),sort:$("sort")};
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const text = value => escapeHTML(value);
function state(f) {
  if (f.status) return {label:f.status,kind:"consult",rank:1};
  if (f.vacancies > 0) return {label:f.type === "特養" ? `空床 ${f.vacancies}床` : `空室 ${f.vacancies}室${f.vacanciesMinimum?"以上":""}`,kind:"open",rank:0};
  if (f.vacancies === 0) return {label:f.type === "特養" ? "集計時の空床 0床" : "掲載時の空室 0室",kind:"zero",rank:2};
  return {label:"空き情報なし",kind:"unknown",rank:3};
}
function renderCard(f) {
  const s=state(f), date=f.statusDate;
  const source=f.statusSource || f.source;
  const fee=f.monthlyYenFrom?`公表料金 月額 ${f.monthlyYenFrom.toLocaleString("ja-JP")}円〜`:f.type==="特養"?'一般的な概算 月額 約10〜16万円':'周辺施設の参考額 月額 約17〜30万円';
  const detail=f.type==="特養" ? `<div><span>入所待ち</span><strong>${f.waiting===null?"非掲載":f.waiting+"人"}</strong></div><div><span>うち要介護4以上</span><strong>${f.waitingCare4===null?"非掲載":f.waitingCare4+"人"}</strong></div>` : `<div><span>空室数</span><strong>${f.vacancies===null?"非掲載":f.vacancies+"室"+(f.vacanciesMinimum?"以上":"")}</strong></div><div><span>待機人数</span><strong>公表なし</strong></div>`;
  return `<article class="facility-card">${f.photo?`<img class="facility-photo" src="${text(f.photo.url)}" alt="${text(f.photo.alt||f.name+'の外観')}" loading="lazy" width="640" height="360">`:f.official?`<a class="photo-link" href="${text(f.official)}" target="_blank" rel="noopener">施設の写真を見る（公式サイト） ↗</a>`:""}<div class="card-header"><span class="type-tag">${text(f.type==="特養"?"特養":"介護付有料")}</span><span class="status ${s.kind}">${text(s.label)}</span></div>
    <h3>${text(f.name)}</h3><p class="fee">${text(fee)}</p><p class="address">${text(f.address)}</p>
    <div class="numbers">${detail}</div>
    <p class="date">${date?`情報の基準日：${text(date)}`:f.status?"掲載日：公表なし":"空き情報の掲載なし"}${f.checkedAt?` ／ 確認日：${text(f.checkedAt)}`:""}</p>
    <details><summary>施設情報を見る</summary><div class="details-body"><p>所在地：${text(f.address)}</p>${f.capacity?`<p>定員：${f.capacity}名</p>`:""}<p>${f.phone?`電話：<a href="tel:${text(f.phone)}">${text(f.phone)}</a>`:"電話番号は原資料または施設ページで確認してください"}</p><p>費用：${f.monthlyYenFrom?`運営者の公表料金は月額${f.monthlyYenFrom.toLocaleString("ja-JP")}円〜（${text(f.feeNote||"プランによる")}）。介護保険自己負担・医療費など別途。<a href="${f.feeSource}" target="_blank" rel="noopener">料金の出典</a>`:f.type==="特養"?'一般的な概算は月額約10〜16万円。要介護3・1割負担・30日の例で、居室や所得によって変わります。この施設の料金ではありません。':'上尾市内の料金公表施設を参考にした月額約17〜30万円。この施設の料金ではありません。前払金や介護保険自己負担などは別途確認してください。'} <a href="guide.html#costs">計算の前提</a></p><p>${f.type==="特養"?"施設・空床情報の出典":"施設名・所在地の出典"}：<a href="${f.source}" target="_blank" rel="noopener">${text(f.sourceLabel)}</a></p>${f.statusSource?`<p>空き情報の出典：<a href="${source}" target="_blank" rel="noopener">${text(f.statusSourceLabel||"運営者の掲載ページ")}</a>（${f.statusSourceKind==="directory"?"紹介サイト":"公式"}）</p>`:""}${f.statusNote?`<p>${text(f.statusNote)}</p>`:""}${f.photo?`<p>写真：<a href="${text(f.photo.source)}" target="_blank" rel="noopener">${text(f.photo.credit)}</a></p>`:""}${f.official?`<p><a href="${f.official}" target="_blank" rel="noopener">施設の公式ページを開く</a></p>`:""}${f.phone?`<a class="contact" href="tel:${text(f.phone)}">電話で確認</a>`:""}</div></details></article>`;
}
function render() {
  const q=fields.query.value.trim().normalize("NFKC").toLowerCase();
  let list=window.FACILITIES.filter(f=>{
    if(q && !`${f.name} ${f.address}`.normalize("NFKC").toLowerCase().includes(q))return false;
    if(fields.area.value!=="all" && f.area!==fields.area.value)return false;
    if(fields.type.value!=="all" && f.type!==fields.type.value)return false;
    const availability=fields.availability.value;
    if(availability==="positive" && !(f.status==="申込受付中" || f.vacancies>0))return false;
    if(availability==="published" && !f.status && f.vacancies===null)return false;
    if(availability==="unknown" && (f.status || f.vacancies!==null))return false;
    return true;
  });
  list.sort((a,b)=>fields.sort.value==="name"?a.name.localeCompare(b.name,"ja"):fields.sort.value==="waiting"?(a.waiting??9999)-(b.waiting??9999):state(a).rank-state(b).rank||a.name.localeCompare(b.name,"ja"));
  $("count").textContent=list.length;
  $("facilityList").innerHTML=list.length?list.map(renderCard).join(""):'<p class="empty">条件に合う施設がありません。条件を変えてお探しください。</p>';
}
Object.values(fields).forEach(el=>el.addEventListener(el===fields.query?"input":"change",render));
$("reset").addEventListener("click",()=>{fields.query.value="";fields.area.value="all";fields.type.value="all";fields.availability.value="all";fields.sort.value="default";render();});
fetch("data/facilities.json").then(response=>{if(!response.ok)throw new Error("データを取得できません");return response.json();}).then(db=>{
  window.FACILITIES=db.facilities;
  $("dataVersion").textContent=`データ確認 ${db.version}`;
  render();
}).catch(()=>{$("facilityList").innerHTML='<p class="empty">施設データを読み込めませんでした。時間をおいて再読み込みしてください。</p>';});
