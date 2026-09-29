window.FACILITIES = [
  {
    id: 1, name: "ひがし大宮ケアホーム（デモ）", type: "介護付有料老人ホーム", area: "さいたま市",
    status: "空室あり", statusKey: "open", vacancies: 2, waiting: null, monthly: 21.8, distance: 1.7,
    care: [1,2,3,4,5], dementia: true, medical: true, privateRoom: true, endOfLife: true,
    updated: "2026-09-27", source: "施設公式（想定）", x: 63, y: 42,
    note: "駅から近く、医療対応・看取り対応を想定したデモ施設です。"
  },
  {
    id: 2, name: "瓦葺みどり苑（デモ）", type: "特別養護老人ホーム", area: "上尾市",
    status: "空床あり", statusKey: "open", vacancies: 1, waiting: 14, monthly: 10.4, distance: 2.5,
    care: [3,4,5], dementia: true, medical: false, privateRoom: true, endOfLife: true,
    updated: "2026-09-01", source: "自治体公開情報（想定）", x: 33, y: 35,
    note: "要介護3以上を主対象とする特養のデモデータです。"
  },
  {
    id: 3, name: "上尾さくら特養（デモ）", type: "特別養護老人ホーム", area: "上尾市",
    status: "待機あり", statusKey: "wait", vacancies: 0, waiting: 31, monthly: 9.8, distance: 5.8,
    care: [3,4,5], dementia: true, medical: false, privateRoom: false, endOfLife: true,
    updated: "2026-09-01", source: "自治体公開情報（想定）", x: 19, y: 62,
    note: "費用を抑えやすい一方、待機が多い想定のデモ施設です。"
  },
  {
    id: 4, name: "蓮田リビングケア（デモ）", type: "介護付有料老人ホーム", area: "蓮田市",
    status: "入居相談可", statusKey: "consult", vacancies: null, waiting: null, monthly: 18.6, distance: 5.1,
    care: [1,2,3,4,5], dementia: true, medical: true, privateRoom: true, endOfLife: false,
    updated: "2026-09-25", source: "施設公式（想定）", x: 77, y: 23,
    note: "空室数は非公開でも、相談受付中と表示するケースを想定しています。"
  },
  {
    id: 5, name: "伊奈あんしんホーム（デモ）", type: "介護付有料老人ホーム", area: "伊奈町",
    status: "満室", statusKey: "full", vacancies: 0, waiting: null, monthly: 16.9, distance: 6.4,
    care: [1,2,3,4,5], dementia: true, medical: false, privateRoom: true, endOfLife: false,
    updated: "2026-09-24", source: "施設公式（想定）", x: 48, y: 17,
    note: "満室時も候補保存できるように残す想定です。"
  },
  {
    id: 6, name: "桶川中央特養（デモ）", type: "特別養護老人ホーム", area: "桶川市",
    status: "空床あり", statusKey: "open", vacancies: 3, waiting: 9, monthly: 11.5, distance: 9.4,
    care: [3,4,5], dementia: true, medical: true, privateRoom: true, endOfLife: true,
    updated: "2026-09-01", source: "自治体公開情報（想定）", x: 10, y: 21,
    note: "距離はあるものの空床・待機人数が比較的良好な想定です。"
  }
];
