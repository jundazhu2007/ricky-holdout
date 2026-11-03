/* ============================================================
   CONFIG — 所有日期集中在這裡,時區一律 Asia/Taipei (+08:00)
   approx: true  => 畫面上標「約略」
   assumed: true => 畫面上標「假設」(非官方資訊)
   ============================================================ */
const CONFIG = {
  // 4G 關台:截至 2026-11 搜尋,NCC/交通部表示 4G 服務持續,沒有官方關台日。
  // 以下為「假設日期」,可自行修改。
  shutdown4G: {
    date: "2033-12-31T23:59:59+08:00",
    assumed: true,
    basis: "尚無官方公告。假設以 4G 頻譜執照到期(約 2033 年底)為關台日 [uncertain],請依最新公告修改。",
    source: { label: "NCC:4G 服務持續(工商時報)", url: "https://www.ctee.com.tw/news/20251107700840-430502" },
  },
  devices: [
    {
      id: "iphone",
      name: "iPhone 13 Pro",
      spec: "智慧型手機",
      launch: { date: "2021-09-14T01:00:00+08:00", approx: false, basis: "Apple 發表日 2021-09-14(開賣 2021-09-24) [本次搜尋未驗證]" },
      eos: {
        date: "2029-09-01T00:00:00+08:00", approx: false,
        basis: "使用者提供:預計支援到 2029/09/01,iOS 28.x 為最後支援版本 [未經官方驗證]。",
      },
    },
    {
      id: "ipad",
      name: "iPad Air (M2)",
      spec: "平板",
      launch: { date: "2024-05-07T22:00:00+08:00", approx: false, basis: "Apple 發表日 2024-05-07 [本次搜尋未驗證]" },
      eos: {
        date: "2032-03-12T00:00:00+08:00", approx: true,
        basis: "定義:停售後滿 7 年列為過時產品。假設 2025-03 M3 版本推出時停售 [uncertain]。",
        source: { label: "Apple 過時/復古產品說明", url: "https://www.idropnews.com/news/heres-what-apple-actually-means-by-vintage-and-obsolete-products/137865/" },
      },
    },
    {
      id: "aorus",
      name: "GIGABYTE AORUS 15 XE5",
      spec: "i7-12700H · RTX 3070 Ti · 16GB · 1TB SSD",
      launch: {
        date: "2022-07-09T00:00:00+08:00", approx: true,
        basis: "未找到技嘉全球官方發表日;日本於 2022-07-09 開賣,評測約 2022-04 出現。",
        source: { label: "PC Watch(日本開賣報導)", url: "https://pc.watch.impress.co.jp/docs/news/1423477.html" },
      },
      eos: {
        date: "2029-01-01T00:00:00+08:00", approx: true,
        basis: "使用者提供:預計支援到 Windows 11 28H2(約 2029/01,日期取當月 1 日) [未經官方驗證]。",
      },
    },
    {
      id: "airpods",
      name: "AirPods Pro 3",
      spec: "無線耳機",
      launch: { date: "2025-09-09T01:00:00+08:00", approx: false, basis: "Apple 新聞稿 2025-09-09(開賣 2025-09-19)", source: { label: "Apple Newsroom", url: "https://www.apple.com/ie/newsroom/archive/airpods/" } },
      eos: {
        date: "2035-09-09T00:00:00+08:00", assumed: true,
        basis: "仍在販售,尚無停售日。假設再販售約 3 年,停售後滿 7 年列為過時產品 [uncertain]。",
        source: { label: "Apple 過時/復古產品說明", url: "https://www.idropnews.com/news/heres-what-apple-actually-means-by-vintage-and-obsolete-products/137865/" },
      },
    },
    {
      id: "sim",
      name: "中華電信 4G 預付卡",
      spec: "釘子戶門號",
      launch: { date: "2014-05-29T00:00:00+08:00", approx: true, basis: "中華電信 4G 開台約 2014-05-29 [uncertain,本次搜尋未驗證]。以服務開台日計算。" },
      eos: { useShutdown4G: true, basis: "停止支援 = 4G 關台(見最上方,同為假設日期)。" },
    },
  ],
};

/* ============================================================
   日期計算:台北時區無日光節約,轉成「+8h 的 UTC 欄位」做日曆差
   ============================================================ */
const TZ_OFFSET_MS = 8 * 3600 * 1000;
const fields = (ms) => {
  const d = new Date(ms + TZ_OFFSET_MS);
  return [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()];
};
const daysInMonth = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

/** 回傳 {y, mo, d, h, mi, s}:從 fromMs 到 toMs 的日曆差(fromMs <= toMs)。月底日期會被截到該月最後一天。 */
function addMonths(f, n) {
  const total = f[1] + n;
  const ny = f[0] + Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12;
  const nd = Math.min(f[2], daysInMonth(ny, nm));
  return Date.UTC(ny, nm, nd, f[3], f[4], f[5]);
}

function calendarDiff(fromMs, toMs) {
  const fa = fields(fromMs);
  const fb = fields(toMs);
  const B = toMs + TZ_OFFSET_MS;
  let months = (fb[0] - fa[0]) * 12 + (fb[1] - fa[1]);
  let anchor = addMonths(fa, months);
  if (anchor > B) { months--; anchor = addMonths(fa, months); }
  let rem = Math.floor((B - anchor) / 1000);
  const s = rem % 60; rem = Math.floor(rem / 60);
  const mi = rem % 60; rem = Math.floor(rem / 60);
  const h = rem % 24;
  const d = Math.floor(rem / 24);
  return { y: Math.floor(months / 12), mo: months % 12, d, h, mi, s };
}

if (typeof module !== "undefined") module.exports = { calendarDiff };

/* ============================================================
   畫面
   ============================================================ */
if (typeof document !== "undefined") {
  const UNITS = [["y", "年"], ["mo", "月"], ["d", "天"], ["h", "時"], ["mi", "分"], ["s", "秒"]];
  const pad2 = (n) => String(n).padStart(2, "0");
  const fmtDate = (iso) =>
    new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date(iso));

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  function buildTimer(container, extraClass) {
    container.classList.add(...(extraClass || "").split(" ").filter(Boolean));
    const nums = {};
    for (const [key, label] of UNITS) {
      const seg = el("span", "seg");
      const b = el("b", null, "0");
      seg.append(b, el("i", null, label));
      container.append(seg);
      nums[key] = { seg, b, last: null };
    }
    return nums;
  }

  function paint(nums, diff) {
    for (const [key] of UNITS) {
      const v = diff[key];
      const text = key === "y" || key === "mo" || key === "d" ? String(v) : pad2(v);
      const n = nums[key];
      if (n.last !== text) {
        n.b.textContent = text;
        if (key === "s") { n.seg.classList.remove("tick"); void n.seg.offsetWidth; n.seg.classList.add("tick"); }
        n.last = text;
      }
    }
  }

  function severity(container, remainingMs) {
    const day = 86400000;
    container.classList.toggle("critical", remainingMs <= 365 * day && remainingMs > 30 * day);
    container.classList.toggle("extreme", remainingMs <= 30 * day && remainingMs > 0);
  }

  function metaLine(date, info, isEos) {
    const p = el("p", "meta");
    p.append(`${isEos ? "預估停止支援日" : "發表日"}:${fmtDate(date)}`);
    if (info.assumed) p.append(el("span", "tag", "假設"));
    else if (info.approx) p.append(el("span", "tag", "約略"));
    p.append(document.createElement("br"), `依據:${info.basis}`);
    if (info.source) {
      p.append(" ");
      const a = el("a", null, info.source.label);
      a.href = info.source.url; a.target = "_blank"; a.rel = "noopener";
      p.append(a);
    }
    return p;
  }

  const clocks = [];
  const tickers = [];

  // Hero:4G 關台
  const heroTimer = document.getElementById("hero-timer");
  const heroNums = buildTimer(heroTimer, "timer-xl");
  const shutdownMs = Date.parse(CONFIG.shutdown4G.date);
  const heroMeta = document.getElementById("hero-meta");
  heroMeta.append(`預估關台日:${fmtDate(CONFIG.shutdown4G.date)}`);
  heroMeta.append(el("span", "tag", "假設"));
  heroMeta.append(document.createElement("br"), `依據:${CONFIG.shutdown4G.basis} `);
  const heroA = el("a", null, CONFIG.shutdown4G.source.label);
  heroA.href = CONFIG.shutdown4G.source.url; heroA.target = "_blank"; heroA.rel = "noopener";
  heroMeta.append(heroA);
  tickers.push((now) => {
    const rem = shutdownMs - now;
    if (rem > 0) {
      paint(heroNums, calendarDiff(now, shutdownMs));
      severity(heroTimer, rem);
      document.getElementById("hero-title").textContent = "距離 4G 關台";
    } else {
      paint(heroNums, calendarDiff(shutdownMs, now));
      document.getElementById("hero-title").textContent = "4G 已關台,已過";
      heroTimer.classList.remove("critical", "extreme");
    }
  });

  // 設備卡片
  const grid = document.getElementById("grid");
  for (const dev of CONFIG.devices) {
    const eosInfo = dev.eos.useShutdown4G
      ? { date: CONFIG.shutdown4G.date, assumed: true, basis: dev.eos.basis, source: CONFIG.shutdown4G.source }
      : dev.eos;
    const launchMs = Date.parse(dev.launch.date);
    const eosMs = Date.parse(eosInfo.date);

    const card = el("article", "card");
    card.append(el("h3", null, dev.name), el("p", "spec", dev.spec));

    const usedBlock = el("div", "block");
    usedBlock.append(el("h4", null, "已使用(自發表日起)"));
    const usedTimer = el("div", "timer amber");
    const usedNums = buildTimer(usedTimer);
    usedBlock.append(usedTimer, metaLine(dev.launch.date, dev.launch, false));

    const eosBlock = el("div", "block");
    const eosTitle = el("h4", null, "距離停止支援");
    const eosTimer = el("div", "timer");
    const eosNums = buildTimer(eosTimer);
    eosBlock.append(eosTitle, eosTimer, metaLine(eosInfo.date, eosInfo, true));

    card.append(usedBlock, eosBlock);
    grid.append(card);

    tickers.push((now) => {
      paint(usedNums, calendarDiff(launchMs, now));
      const rem = eosMs - now;
      if (rem > 0) {
        paint(eosNums, calendarDiff(now, eosMs));
        severity(eosTimer, rem);
        eosTitle.textContent = "距離停止支援";
        eosBlock.classList.remove("expired");
      } else {
        paint(eosNums, calendarDiff(eosMs, now));
        eosTitle.textContent = "已停止支援,已過";
        eosBlock.classList.add("expired");
        eosTimer.classList.remove("critical", "extreme");
      }
    });
  }

  const nowEl = document.getElementById("now");
  const nowFmt = new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  function tick() {
    const now = Date.now();
    nowEl.textContent = nowFmt.format(now);
    for (const t of tickers) t(now);
  }
  tick();
  setInterval(tick, 1000);
}
