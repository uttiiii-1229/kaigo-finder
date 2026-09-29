const $ = (id) => document.getElementById(id);
const els = {
  area: $("areaFilter"), type: $("typeFilter"), care: $("careFilter"), price: $("priceFilter"),
  distance: $("distanceFilter"), available: $("availableOnly"), sort: $("sortFilter"),
  list: $("facilityList"), count: $("resultCount"), map: $("mapCanvas"), reset: $("resetBtn"),
  dialog: $("facilityDialog"), dialogBody: $("dialogBody"), dialogClose: $("dialogClose")
};

const statusLabel = {
  open: ["status-open", "空きあり"], consult: ["status-consult", "相談可"],
  wait: ["status-wait", "待機あり"], full: ["status-full", "満室"]
};

function getFilters() {
  return {
    area: els.area.value,
    type: els.type.value,
    care: els.care.value,
    price: Number(els.price.value),
    distance: Number(els.distance.value),
    available: els.available.checked,
    sort: els.sort.value
  };
}

function getScore(f) {
  let score = 0;
  if (f.statusKey === "open") score += 50;
  if (f.statusKey === "consult") score += 35;
  if (f.waiting !== null) score += Math.max(0, 20 - f.waiting / 2);
  score += Math.max(0, 15 - f.distance);
  score += Math.max(0, 20 - f.monthly / 2);
  return score;
}

function matches(f, filters) {
  if (filters.area !== "all" && f.area !== filters.area) return false;
  if (filters.type !== "all" && f.type !== filters.type) return false;
  if (filters.care !== "all" && !f.care.includes(Number(filters.care))) return false;
  if (f.monthly > filters.price) return false;
  if (f.distance > filters.distance) return false;
  if (filters.available && !["open", "consult"].includes(f.statusKey)) return false;
  return true;
}

function sortFacilities(items, sort) {
  return [...items].sort((a,b) => {
    if (sort === "distance") return a.distance - b.distance;
    if (sort === "price") return a.monthly - b.monthly;
    if (sort === "waiting") return (a.waiting ?? 999) - (b.waiting ?? 999);
    return getScore(b) - getScore(a);
  });
}

function badge(text, ok) {
  return `<span class="match ${ok ? "yes" : "no"}">${ok ? "✓" : "–"} ${text}</span>`;
}

function cardTemplate(f) {
  const [cls, label] = statusLabel[f.statusKey];
  const waitingText = f.waiting === null ? "—" : `${f.waiting}人`;
  const vacancyText = f.vacancies === null ? "非公開" : `${f.vacancies}床`;
  return `
    <article class="facility-card" data-id="${f.id}">
      <div class="card-topline"><span class="status ${cls}">${label}</span><span class="updated">更新 ${f.updated}</span></div>
      <h3>${f.name}</h3>
      <div class="facility-meta"><span>${f.type === "特別養護老人ホーム" ? "特養" : "介護付有料"}</span><span>${f.area}</span><span>東大宮駅から ${f.distance}km</span></div>
      <div class="stat-grid">
        <div><small>空床</small><strong>${vacancyText}</strong></div>
        <div><small>待機</small><strong>${waitingText}</strong></div>
        <div><small>月額目安</small><strong>${f.monthly.toFixed(1)}万円</strong></div>
      </div>
      <div class="matches">
        ${badge("認知症対応", f.dementia)}
        ${badge("医療対応", f.medical)}
        ${badge("個室", f.privateRoom)}
        ${badge("看取り", f.endOfLife)}
      </div>
      <div class="card-footer"><span>情報源：${f.source}</span><button class="details-btn" type="button">詳細を見る</button></div>
    </article>`;
}

function renderMap(items) {
  els.map.querySelectorAll(".map-pin").forEach(el => el.remove());
  items.forEach(f => {
    const pin = document.createElement("button");
    pin.className = `map-pin pin-${f.statusKey}`;
    pin.style.left = `${f.x}%`;
    pin.style.top = `${f.y}%`;
    pin.textContent = f.id;
    pin.title = f.name;
    pin.addEventListener("click", () => openDialog(f.id));
    els.map.appendChild(pin);
  });
}

function render() {
  const filters = getFilters();
  const filtered = sortFacilities(window.FACILITIES.filter(f => matches(f, filters)), filters.sort);
  els.count.textContent = filtered.length;
  els.list.innerHTML = filtered.length ? filtered.map(cardTemplate).join("") : `<div class="empty-state">条件に合う施設がありません。条件を少し広げてみてください。</div>`;
  els.list.querySelectorAll(".facility-card").forEach(card => {
    card.querySelector(".details-btn").addEventListener("click", () => openDialog(Number(card.dataset.id)));
  });
  renderMap(filtered);
}

function openDialog(id) {
  const f = window.FACILITIES.find(x => x.id === id);
  const [cls, label] = statusLabel[f.statusKey];
  els.dialogBody.innerHTML = `
    <div class="dialog-status"><span class="status ${cls}">${label}</span><span>最終更新 ${f.updated}</span></div>
    <h2>${f.name}</h2>
    <p class="dialog-lead">${f.note}</p>
    <div class="dialog-grid">
      <div><small>施設種別</small><strong>${f.type}</strong></div>
      <div><small>エリア</small><strong>${f.area}</strong></div>
      <div><small>月額目安</small><strong>${f.monthly.toFixed(1)}万円</strong></div>
      <div><small>駅から</small><strong>${f.distance}km</strong></div>
      <div><small>空床</small><strong>${f.vacancies === null ? "非公開" : f.vacancies + "床"}</strong></div>
      <div><small>待機</small><strong>${f.waiting === null ? "—" : f.waiting + "人"}</strong></div>
    </div>
    <h3 class="subheading">対応条件</h3>
    <div class="matches dialog-matches">
      ${badge("要介護 " + f.care.join("・"), true)}
      ${badge("認知症対応", f.dementia)} ${badge("医療対応", f.medical)}
      ${badge("個室", f.privateRoom)} ${badge("看取り", f.endOfLife)}
    </div>
    <div class="source-box">情報源：${f.source}<br><small>※このMVPはデモデータです。実運用では公式情報へのリンクと取得日時を表示します。</small></div>
    <button class="primary-btn" type="button" disabled>施設へ問い合わせる（実装予定）</button>`;
  els.dialog.showModal();
}

[els.area, els.type, els.care, els.price, els.distance, els.available, els.sort].forEach(el => el.addEventListener("change", render));
els.reset.addEventListener("click", () => {
  els.area.value = "all"; els.type.value = "all"; els.care.value = "all"; els.price.value = "999"; els.distance.value = "999"; els.available.checked = false; els.sort.value = "recommended"; render();
});
els.dialogClose.addEventListener("click", () => els.dialog.close());
els.dialog.addEventListener("click", e => { if (e.target === els.dialog) els.dialog.close(); });
render();
