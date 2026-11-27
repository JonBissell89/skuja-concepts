/* Clickable demo of the Skuja studio dashboard (board, replies, jobs, progress page).
   Mirrors the real dashboard in skuja-website/app with sample data. Nothing leaves the browser. */
(() => {
  const STAGES = [
    { id: "new", label: "New Customer Submission", hint: "Just arrived from the website" },
    { id: "follow_up", label: "Follow Up", hint: "Talking it through" },
    { id: "in_process", label: "In Process", hint: "Agreed and being made" },
    { id: "completed", label: "Project Completed", done: true, hint: "Delivered" },
    { id: "closed", label: "Closed", done: true, hint: "Didn't go ahead" },
  ];
  const LABEL = Object.fromEntries(STAGES.map((s) => [s.id, s.label]));
  const AUTO = { follow_up: "follow-up", in_process: "in-process", completed: "completed", closed: null };
  const JOB_TEMPLATES = {
    "dining-table": ["Design approved", "Lumber selected & in the shop", "Milling & glue-up", "Top flattened & shaped", "Base, legs & joinery", "Assembly", "Sanding & finishing", "Delivery"],
    cabinetry: ["Site measure", "Drawings approved", "Materials in the shop", "Case construction", "Doors & drawers", "Finishing", "Installation", "Final walk-through"],
    sauna: ["Design with sauna architects", "Site & foundation confirmed", "Materials in", "Frame & shell", "Benches & cladding", "Heater & electrical", "Finishing & first test heat", "Handover"],
    general: ["Design approved", "Materials in the shop", "Milling", "Joinery", "Assembly", "Finishing", "Delivery"],
  };
  const TEMPLATES = [
    { id: "acknowledge", name: "Thank you — request received", subject: "Thank you for your {{project}} inquiry — Skuja Design Studio",
      body: "Hi {{firstName}},\n\nThank you for telling us about your {{project}}. I read every request personally, and I'll get back to you within a few business days.\n\nHere's what you sent:\n“{{summary}}”\nBudget: {{budget}} · Timing: {{timeline}}\n\nIf you have more photos, measurements or ideas, just reply to this email — it comes straight to me.\n\nThank you,\nOleg Skuja\nSkuja Design Studio · Wilmington, Vermont" },
    { id: "follow-up", name: "Let’s talk (follow up)", subject: "Your {{project}} — next steps",
      body: "Hi {{firstName}},\n\nThanks again for getting in touch about your {{project}}. I'd love to learn a bit more so I can suggest the right design, wood and approach for your budget.\n\nCould you reply with two or three times that suit you for a 15-minute call this week, and the best number to reach you? You're also very welcome to visit the workshop.\n\nTalk soon,\nOleg Skuja\nSkuja Design Studio" },
    { id: "more-details", name: "A few more details, please", subject: "A few questions about your {{project}}",
      body: "Hi {{firstName}},\n\nThank you for your request. Before I can give you a useful answer, could you send me:\n\n• a few photos of the room or space\n• approximate measurements\n• any pictures of pieces you love\n\nJust reply to this email with whatever you have.\n\nThank you,\nOleg" },
    { id: "in-process", name: "Your project is underway", subject: "Your {{project}} is underway",
      body: "Hi {{firstName}},\n\nGood news — your {{project}} is now on the bench. I'll send you a few progress photos along the way, and I'll be in touch about delivery as we get close.\n\nIf anything changes on your side, just reply to this email.\n\nThank you for trusting us with it,\nOleg Skuja" },
    { id: "progress", name: "Progress update", subject: "Progress on your {{project}}",
      body: "Hi {{firstName}},\n\nA quick update from the workshop: {{currentStep}}.\n\nYou can see photos and where things stand here:\n{{progressLink}}\n\nWe're on track for {{dueDate}}. Any questions, just reply.\n\nOleg" },
    { id: "completed", name: "Finished — thank you & care tips", subject: "Thank you — caring for your new {{project}}",
      body: "Hi {{firstName}},\n\nThank you for choosing Skuja Design Studio. It was a pleasure making your {{project}}.\n\nA few care tips: dust with a soft dry cloth, wipe spills promptly, keep it out of strong direct sunlight, and refresh the finish with a little oil once a year.\n\nIf you're happy with it, a short review or a photo of it in your home would mean a lot — reply with a photo, or tag @skujadesign on Instagram.\n\nWith thanks,\nOleg" },
    { id: "closed", name: "Not the right fit — kind close", subject: "Your {{project}} inquiry",
      body: "Hi {{firstName}},\n\nThank you again for thinking of Skuja Design Studio for your {{project}}. Unfortunately we aren't able to take this one on right now, but I really appreciate you reaching out.\n\nIf your plans change, or if a smaller piece might suit you, I'd be glad to hear from you again.\n\nAll the best,\nOleg" },
  ];

  const DAY = 86400000, now = Date.now();
  const iso = (d) => new Date(now + d * DAY).toISOString().slice(0, 10);
  const photo = (file, cap) => ({ src: `../img/${file}.webp`, cap });
  const seed = () => [
    { id: "c1", status: "new", seen: false, created: now - 3 * 3600e3, name: "Emily Hartwell", email: "emily@example.com", phone: "(802) 555-0147", location: "Dover, VT",
      category: "Dining table", catId: "dining-table", desc: "A walnut table for our farmhouse kitchen that seats eight for holidays. We love the round table on your site but need something rectangular.",
      budget: "$5,000 – $8,000", assess: ["Within typical range", "ok"], timeline: "3 – 6 months", size: "Rectangular table, seats 8 (about 84–96″ × 40″)", wood: "Walnut", heard: "Instagram / social media", files: 2, emails: 1 },
    { id: "c2", status: "new", seen: false, created: now - 26 * 3600e3, name: "Pat Moreno", email: "pat@hullarchitects.example", location: "Stowe, VT", firm: "Hull Architects",
      category: "Trade & contract partnership", catId: "cabinetry", desc: "Millwork package for a 12-room inn: vanities, bedside tables and a reception desk. Drawings attached.",
      budget: "$25,000 – $50,000", assess: ["Within typical range", "ok"], timeline: "6 – 12 months", heard: "Architect / builder", files: 1, emails: 1 },
    { id: "c3", status: "new", seen: true, created: now - 3 * DAY, name: "Tom Becker", email: "tom@example.com", location: "Brattleboro, VT",
      category: "Built-ins", catId: "cabinetry", desc: "Floor-to-ceiling bookcase around a fireplace, painted, with a few walnut shelves.",
      budget: "Under $5,000", assess: ["Below starting price", "warn"], timeline: "No fixed date — flexible", heard: "Google / online search", files: 0, emails: 1, stageDays: 3 },
    { id: "c4", status: "follow_up", seen: true, created: now - 6 * DAY, name: "Rachel Kim", email: "rachel@example.com", location: "Wilmington, VT",
      category: "Custom sauna", catId: "sauna", desc: "Outdoor garden sauna for 4–5 people near our pond. Love the cedar one with the porch.",
      budget: "$20,000 – $35,000", assess: ["Within typical range", "ok"], timeline: "Within 3 months", size: "Garden cabin (outdoor, with porch) · 4–5 people", heard: "Referral from a friend or client", files: 3, emails: 2, stageDays: 6 },
    { id: "c5", status: "in_process", seen: true, created: now - 30 * DAY, name: "Jane Customer", email: "jane@example.com", location: "Brattleboro, VT",
      category: "Dining table", catId: "dining-table", desc: "A walnut table for our farmhouse kitchen, seating six, with a simple base.",
      budget: "$5,000 – $8,000", assess: ["Within typical range", "ok"], timeline: "Within 3 months", size: "Rectangular table, seats 6 (about 72″ × 38″)", wood: "Walnut", heard: "Instagram / social media", files: 1, emails: 4,
      job: { title: "Walnut dining table for Jane", dimensions: "72″ × 38″, 30″ high", wood: "Black walnut", finish: "Hardwax oil, satin", hardware: "", due: iso(12), price: 4800, deposit: 1500, depositPaid: true, balancePaid: false, share: true,
        steps: JOB_TEMPLATES["dining-table"].map((label, i) => ({ label, done: i < 3, photos: i === 1 ? [photo("walnut-slab", "Boards chosen")] : i === 2 ? [photo("workshop-build", "Glue-up"), photo("walnut-edge-detail", "Edge detail")] : [] })),
        materials: [
          { item: "Black walnut 8/4", qty: "40 bd ft", supplier: "Vermont Hardwoods", cost: 640, status: "in_shop" },
          { item: "Hardwax oil", qty: "1 L", supplier: "Woodcraft", cost: 48, status: "ordered" },
          { item: "Steel table fasteners", qty: "10", supplier: "Rockler", cost: 22, status: "needed" },
        ] } },
    { id: "c6", status: "completed", seen: true, created: now - 70 * DAY, name: "Mark & Ellen Ross", email: "ross@example.com", location: "Jamaica, VT",
      category: "Dining table", catId: "dining-table", desc: "White oak trestle table for a long dining room.", budget: "$8,000 – $12,000", assess: ["Within typical range", "ok"], timeline: "6 – 12 months", files: 2, emails: 6 },
    { id: "c7", status: "closed", seen: true, created: now - 40 * DAY, name: "Chris Dale", email: "chris@example.com", location: "Keene, NH",
      category: "Other custom furniture", catId: "general", desc: "Small side table, needed in a week.", budget: "Under $1,000", assess: ["Below starting price", "warn"], timeline: "As soon as possible", closedReason: "Timing", files: 0, emails: 2 },
  ];

  let S;
  try { S = JSON.parse(localStorage.getItem("skuja-demo-v1")); } catch { S = null; }
  if (!S || !Array.isArray(S.cards)) S = { cards: seed() };
  const persist = () => { try { localStorage.setItem("skuja-demo-v1", JSON.stringify(S)); } catch {} };
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const money = (n) => "$" + Math.round(n || 0).toLocaleString("en-US");
  const card = (id) => S.cards.find((c) => c.id === id);
  const progress = (job) => {
    const st = job?.steps ?? []; const done = st.filter((s) => s.done).length; const next = st.find((s) => !s.done); const last = [...st].reverse().find((s) => s.done);
    return { done, total: st.length, pct: st.length ? Math.round((done / st.length) * 100) : 0, next: next?.label,
      current: last ? `${last.label} is done${next ? ` — next up: ${next.label.toLowerCase()}` : ""}` : next ? `we're starting with: ${next.label.toLowerCase()}` : "everything is finished" };
  };
  const dueText = (d) => { if (!d) return ""; const n = Math.round((new Date(d + "T12:00") - Date.now()) / DAY); return n < 0 ? `${-n}d overdue` : n === 0 ? "due today" : `due in ${n}d`; };
  const longDate = (d) => d ? new Date(d + "T12:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
  const ago = (t) => { const h = (Date.now() - t) / 3600e3; return h < 1 ? "just now" : h < 24 ? `${Math.floor(h)} h ago` : `${Math.floor(h / 24)} d ago`; };

  function toast(text) {
    const el = document.createElement("div"); el.className = "toast"; el.textContent = text; $("#toasts").append(el);
    setTimeout(() => el.remove(), 3800);
  }

  // ── Board ──────────────────────────────────────────────────────────────
  let view = "board";
  function render() {
    $("#newBadge").textContent = S.cards.filter((c) => c.status === "new").length || "";
    if (view === "jobs") return renderJobs();
    const col = (s, compact) => {
      const list = S.cards.filter((c) => c.status === s.id);
      return `<section class="a-col ${compact ? "a-col--compact" : ""}" aria-labelledby="col-${s.id}">
        <header class="a-col__head"><h2 id="col-${s.id}">${s.label}</h2><span class="a-col__count">${list.length}</span></header>
        <ul class="a-col__list" data-col="${s.id}">${list.map(cardHTML).join("") || `<li class="a-col__empty">${s.hint}</li>`}</ul></section>`;
    };
    $("#view").innerHTML = `<p class="a-hint a-board-hint">Drag cards between columns (on a phone: press and hold, then drag). Or use a card’s <strong>Move</strong> button.</p>
      <div class="a-board">${STAGES.filter((s) => !s.done).map((s) => col(s)).join("")}
      <div class="a-done"><p class="a-done__title">Done</p><div class="a-done__cols">${STAGES.filter((s) => s.done).map((s) => col(s, true)).join("")}</div></div></div>`;
    document.querySelectorAll(".a-col__list").forEach((ul) => Sortable.create(ul, {
      group: "board", animation: 150, delay: 180, delayOnTouchOnly: true, filter: ".a-col__empty,.a-kcard__actions", preventOnFilter: false, ghostClass: "sortable-ghost",
      onEnd: (e) => { const id = e.item.dataset.id; const to = e.to.dataset.col; const from = e.from.dataset.col;
        const order = [...e.to.querySelectorAll("[data-id]")].map((li) => li.dataset.id);
        S.cards.sort((a, b) => (order.indexOf(a.id) + 1 || 999) - (order.indexOf(b.id) + 1 || 999));
        if (to !== from) move(id, to); else { persist(); } },
    }));
  }
  function cardHTML(c) {
    const p = c.job ? progress(c.job) : null;
    const brief = c.desc.length > 110 ? c.desc.slice(0, c.desc.lastIndexOf(" ", 110)) + "…" : c.desc;
    const days = c.stageDays;
    return `<li class="a-kcard-wrap" data-id="${c.id}"><div class="a-kcard">
      <div class="a-kcard__body">
        <div class="a-kcard__top">${c.status === "new" && !c.seen ? '<span class="a-dot" aria-label="Not opened yet"></span>' : ""}<strong class="a-kcard__name">${esc(c.name)}</strong><span class="a-muted a-small">${ago(c.created)}</span></div>
        <p class="a-kcard__what"><span class="a-kcard__cat">${esc(c.category)}${c.firm ? " · " + esc(c.firm) : ""}</span> ${esc(brief)}</p>
        <div class="a-kcard__meta"><span>${esc(c.budget)}</span><span class="pill pill--${c.assess[1]}">${c.assess[0]}</span><span class="a-muted">· ${esc(c.timeline)}</span></div>
        ${p ? `<div class="a-kcard__job"><div class="a-bar-track"><i style="width:${p.pct}%"></i></div><span class="a-small">${p.next ? "Next: " + esc(p.next) : "Build finished"}${c.job.due ? " · " + dueText(c.job.due) : ""}</span></div>` : ""}
        <div class="a-kcard__foot a-muted a-small"><span>${esc(c.location)}</span>${c.files ? `<span>· ${c.files} file${c.files > 1 ? "s" : ""}</span>` : ""}${c.emails ? `<span>· ${c.emails} email${c.emails > 1 ? "s" : ""}</span>` : ""}${days >= 2 ? `<span class="${days >= 5 ? "a-stale" : ""}">· ${days} days here</span>` : ""}</div>
      </div>
      <div class="a-kcard__actions">
        <button type="button" class="a-btn a-btn--sm a-btn--primary" data-act="reply">Reply</button>
        <button type="button" class="a-btn a-btn--sm" data-act="open">Open</button>
        <div class="a-movemenu"><button type="button" class="a-btn a-btn--sm" data-act="menu" aria-expanded="false">Move</button></div>
      </div></div></li>`;
  }

  function move(id, to) {
    const c = card(id); if (!c || c.status === to) return render();
    c.status = to; c.stageDays = 0; c.seen = true;
    if (to === "in_process" && !c.job) {
      c.job = { title: `${c.category} for ${c.name.split(" ")[0]}`, dimensions: c.size || "", wood: c.wood || "", finish: "", hardware: "", due: "", price: 0, deposit: 0, depositPaid: false, balancePaid: false, share: false,
        steps: (JOB_TEMPLATES[c.catId] || JOB_TEMPLATES.general).map((label) => ({ label, done: false, photos: [] })), materials: [] };
      toast(`Job sheet started for ${c.name} — size, wood and build steps filled in`);
    }
    persist(); render();
    const t = AUTO[to];
    if (t) openComposer(c, { templateId: t, title: `Moved to ${LABEL[to]} — send ${c.name.split(" ")[0]} this email?`, skip: true });
    else toast(`Moved to ${LABEL[to]}`);
  }

  // ── Composer ───────────────────────────────────────────────────────────
  const dlg = $("#composer");
  let compose = null;
  function values(c) {
    const p = progress(c.job);
    return { firstName: c.name.split(" ")[0], name: c.name, project: c.category.toLowerCase(), summary: c.desc, budget: c.budget, timeline: c.timeline,
      currentStep: p.current, progressLink: location.href.split("#")[0] + "#progress-" + c.id, dueDate: c.job?.due ? longDate(c.job.due) : "the date we agreed" };
  }
  const fill = (txt, v) => txt.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => (k in v ? v[k] : m));
  function applyTpl(c, id) { const t = TEMPLATES.find((x) => x.id === id) || TEMPLATES[0]; const v = values(c); $("#cTpl").value = t.id; $("#cSubj").value = fill(t.subject, v); $("#cBody").value = fill(t.body, v); }
  function openComposer(c, { templateId, title, moveTo, skip }) {
    compose = { c, moveTo };
    $("#cTitle").textContent = title || `Email ${c.name.split(" ")[0]}`;
    $("#cTo").textContent = `To ${c.name} <${c.email}> · replies come to info@skujadesign.studio`;
    $("#cTpl").innerHTML = TEMPLATES.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join("");
    applyTpl(c, templateId || (c.status === "new" || c.status === "follow_up" ? "follow-up" : AUTO[c.status] || "follow-up"));
    $("#cMoveW").hidden = !moveTo; $("#cMoveL").innerHTML = moveTo ? `Also move the card to <strong>${LABEL[moveTo]}</strong>` : ""; $("#cMove").checked = true;
    $("#cCancel").textContent = skip ? "Skip" : "Cancel";
    dlg.showModal();
  }
  $("#cTpl").onchange = (e) => compose && applyTpl(compose.c, e.target.value);
  $("#cCancel").onclick = () => dlg.close();
  $("#cSend").onclick = () => {
    const { c, moveTo } = compose; c.emails = (c.emails || 0) + 1;
    (c.history ||= []).unshift({ subject: $("#cSubj").value, body: $("#cBody").value, at: Date.now() });
    dlg.close(); toast(`Demo: email “${$("#cSubj").value}” would go to ${c.name}`);
    if (moveTo && $("#cMove").checked && c.status !== moveTo) { c.status = moveTo; c.stageDays = 0; }
    persist(); render(); if ($("#sheet").classList.contains("open")) openSheet(c.id);
  };

  // ── Card details / job sheet ───────────────────────────────────────────
  let sheetTab = "request";
  function openSheet(id, tab) {
    const c = card(id); c.seen = true; persist();
    if (tab) sheetTab = tab;
    if (!c.job && sheetTab === "job") sheetTab = "request";
    const p = c.job ? progress(c.job) : null;
    $("#sheetInner").innerHTML = `
      <div class="a-sheet__top"><button class="a-btn" data-act="close">← Board</button><button class="a-btn a-btn--primary" data-act="reply-sheet">Reply</button></div>
      <h1 style="margin:8px 0 4px">${esc(c.name)} — ${esc(c.category)}</h1>
      <p class="a-muted">Received ${new Date(c.created).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</p>
      <div class="a-tabs a-tabs--page" role="tablist">
        <button role="tab" data-tab="request" class="${sheetTab === "request" ? "is-active" : ""}">Request</button>
        <button role="tab" data-tab="job" class="${sheetTab === "job" ? "is-active" : ""}">Job${p ? " · " + p.pct + "%" : ""}</button>
      </div>
      ${sheetTab === "request" ? requestHTML(c) : jobHTML(c)}
      <section class="a-panel"><h2 class="a-panel__title">Where this is on the board</h2>
        <div class="a-seg" role="group">${STAGES.map((s) => `<button data-stage="${s.id}" class="${c.status === s.id ? "is-active" : ""}">${s.label}</button>`).join("")}</div></section>`;
    $("#sheet").dataset.id = id; $("#sheet").classList.add("open"); document.body.style.overflow = "hidden";
  }
  function requestHTML(c) {
    return `<div class="a-summary">
      <div class="a-summary__item"><span>Budget</span><strong>${esc(c.budget)}</strong><span class="pill pill--${c.assess[1]}">${c.assess[0]}</span></div>
      <div class="a-summary__item"><span>Timing</span><strong>${esc(c.timeline)}</strong></div>
      <div class="a-summary__item"><span>Location</span><strong>${esc(c.location)}</strong></div>
      <div class="a-summary__item"><span>Found us via</span><strong>${esc(c.heard || "—")}</strong></div></div>
      <section class="a-panel"><h2 class="a-panel__title">What they’d like</h2><p class="a-pre">${esc(c.desc)}</p>
        <dl class="a-dl">${c.firm ? `<dt>Firm</dt><dd>${esc(c.firm)}</dd>` : ""}${c.size ? `<dt>Size (picked)</dt><dd>${esc(c.size)}</dd>` : ""}${c.wood ? `<dt>Materials</dt><dd>${esc(c.wood)}</dd>` : ""}${c.closedReason ? `<dt>Closed because</dt><dd>${esc(c.closedReason)}</dd>` : ""}</dl></section>
      <section class="a-panel"><h2 class="a-panel__title">Contact</h2><p>${esc(c.name)}<br><a href="#">${esc(c.email)}</a>${c.phone ? "<br>" + esc(c.phone) : ""}</p></section>
      <section class="a-panel"><h2 class="a-panel__title">Emails <span class="a-muted">(${c.emails || 0})</span></h2>
        ${(c.history || []).map((h) => `<details><summary><strong>${esc(h.subject)}</strong> <span class="a-muted a-small">· just now · sent by you</span></summary><p class="a-pre">${esc(h.body)}</p></details>`).join("")}
        <p class="a-hint">Your automatic thank-you went out the moment they submitted. Customers’ replies arrive in your normal inbox.</p></section>`;
  }
  function jobHTML(c) {
    const j = c.job; if (!j) return `<section class="a-panel"><p class="a-hint">Move the card to <strong>In Process</strong> to start a job sheet.</p></section>`;
    const p = progress(j); const mat = j.materials.reduce((n, m) => n + (+m.cost || 0), 0);
    const received = (j.depositPaid ? j.deposit : 0) + (j.balancePaid ? Math.max(0, j.price - j.deposit) : 0);
    const toOrder = j.materials.filter((m) => m.status === "needed").length;
    return `<section class="a-panel"><div class="a-job__progress"><div><strong>${p.pct}%</strong> <span class="a-muted">· ${p.done} of ${p.total} steps</span></div>
        <div class="a-bar-track"><i style="width:${p.pct}%"></i></div><span class="a-small">${p.next ? "Next: <strong>" + esc(p.next) + "</strong>" : "All steps done"}${j.due ? " · due " + longDate(j.due) : ""}</span></div></section>
      <section class="a-panel"><h2 class="a-panel__title">Build steps</h2><ol class="a-steps">${j.steps.map((s, i) => `
        <li class="${s.done ? "is-done" : ""}"><label class="a-step__check"><input type="checkbox" data-step="${i}" ${s.done ? "checked" : ""}><span><span class="a-muted a-small">${String(i + 1).padStart(2, "0")}</span> ${esc(s.label)}</span></label>
          <div class="a-step__tools"><label class="a-btn a-btn--sm">📷 Photo<input type="file" accept="image/*" capture="environment" hidden data-photo="${i}"></label></div>
          ${s.photos.length ? `<ul class="a-step__photos">${s.photos.map((ph) => `<li><img src="${ph.src}" alt="${esc(ph.cap || s.label)}"></li>`).join("")}</ul>` : ""}</li>`).join("")}</ol></section>
      <section class="a-panel"><h2 class="a-panel__title">What was agreed</h2><div class="a-grid-2">
        ${[["title", "Project"], ["dimensions", "Size / dimensions"], ["wood", "Wood"], ["finish", "Finish"]].map(([k, l]) => `<label class="a-field"><span>${l}</span><input data-job="${k}" value="${esc(j[k])}"></label>`).join("")}
        <label class="a-field"><span>Finish by</span><input type="date" data-job="due" value="${esc(j.due)}"></label></div></section>
      <section class="a-panel"><h2 class="a-panel__title">Price &amp; payments</h2><div class="a-grid-2">
        <label class="a-field"><span>Agreed price ($)</span><input inputmode="decimal" data-job="price" value="${j.price || ""}"></label>
        <label class="a-field"><span>Deposit ($)</span><input inputmode="decimal" data-job="deposit" value="${j.deposit || ""}"></label></div>
        <label class="a-check"><input type="checkbox" data-flag="depositPaid" ${j.depositPaid ? "checked" : ""}><span>Deposit received</span></label>
        <label class="a-check"><input type="checkbox" data-flag="balancePaid" ${j.balancePaid ? "checked" : ""}><span>Balance received</span></label>
        <dl class="a-money"><div><dt>Received</dt><dd>${money(received)}</dd></div><div><dt>Still to collect</dt><dd>${money(Math.max(0, j.price - received))}</dd></div><div><dt>Materials</dt><dd>${money(mat)}</dd></div><div><dt>After materials</dt><dd>${money(j.price - mat)}</dd></div></dl></section>
      <section class="a-panel"><h2 class="a-panel__title">Materials ${toOrder ? `<span class="pill pill--warn">${toOrder} to order</span>` : ""}</h2>
        <ul class="a-materials">${j.materials.map((m, i) => `<li><input class="a-mat-wide" data-mat="${i}" data-f="item" value="${esc(m.item)}" aria-label="Item" placeholder="Item"><input data-mat="${i}" data-f="qty" value="${esc(m.qty)}" aria-label="Qty" placeholder="Qty"><input data-mat="${i}" data-f="supplier" value="${esc(m.supplier)}" aria-label="Supplier" placeholder="Supplier"><input data-mat="${i}" data-f="cost" value="${m.cost || ""}" aria-label="Cost" placeholder="$" inputmode="decimal">
          <div class="a-seg a-seg--sm">${[["needed", "Needed"], ["ordered", "Ordered"], ["in_shop", "In the shop"]].map(([s, l]) => `<button data-matstatus="${i}" data-s="${s}" class="${m.status === s ? "is-active" : ""}">${l}</button>`).join("")}</div><span></span></li>`).join("")}</ul>
        <button class="a-btn" data-act="addmat">+ Add material</button></section>
      <section class="a-panel"><h2 class="a-panel__title">Keep the customer in the loop</h2>
        <label class="a-check"><input type="checkbox" data-flag="share" ${j.share ? "checked" : ""}><span>Private progress page for ${esc(c.name.split(" ")[0])} <span class="a-muted">(no login; steps and photos only, never prices)</span></span></label>
        ${j.share ? `<p><button class="a-btn" data-act="custpage">Open ${esc(c.name.split(" ")[0])}’s progress page</button></p>` : ""}
        <button class="a-btn a-btn--primary" data-act="update">Send progress update</button></section>
      ${c.status === "completed" || p.pct === 100 ? `<section class="a-panel"><h2 class="a-panel__title">Add it to your portfolio</h2><button class="a-btn a-btn--primary" data-act="portfolio">Create portfolio project from build photos</button></section>` : ""}`;
  }

  function custPage(c) {
    const j = c.job, p = progress(j);
    const photos = j.steps.flatMap((s) => s.photos.map((ph) => ({ ...ph, cap: ph.cap || s.label }))).reverse();
    $("#custPage").innerHTML = `<header><span>Skuja Design Studio</span><button class="a-btn" data-act="closecust">Close preview</button></header>
      <main><span class="k">Your project with Skuja Design Studio</span><h1>${esc(j.title)}</h1>
      <p>Hi ${esc(c.name.split(" ")[0])} — here’s where your piece stands.${j.due ? ` We’re working towards <strong>${longDate(j.due)}</strong>.` : ""}</p>
      <span class="k">${p.done} of ${p.total} steps done · ${p.pct}%</span><div class="bar"><i style="width:${p.pct}%"></i></div>
      <ol>${j.steps.map((s, i) => `<li class="${s.done ? "done" : s.label === p.next ? "next" : ""}"><span class="k">${s.done ? "✓ Done" : s.label === p.next ? "In progress" : String(i + 1).padStart(2, "0")}</span><h3>${esc(s.label)}</h3></li>`).join("")}</ol>
      <div class="photos">${photos.map((ph) => `<figure style="margin:0"><img src="${ph.src}" alt=""><figcaption class="k" style="margin-top:6px">${esc(ph.cap)}</figcaption></figure>`).join("")}</div></main>`;
    $("#custPage").classList.add("open");
  }

  // ── Jobs & materials view ──────────────────────────────────────────────
  function renderJobs() {
    const jobs = S.cards.filter((c) => c.status === "in_process" && c.job);
    const toBuy = jobs.flatMap((c) => c.job.materials.filter((m) => m.status !== "in_shop").map((m) => ({ ...m, job: c.job.title, id: c.id })));
    const groups = {}; toBuy.forEach((m) => (groups[m.supplier || "No supplier yet"] ||= []).push(m));
    $("#view").innerHTML = !jobs.length ? `<div class="a-empty"><p class="a-empty__title">No jobs in progress</p><p>Move a card to In Process to start one.</p></div>` : `
      <ul class="a-joblist">${jobs.map((c) => { const p = progress(c.job); const recv = (c.job.depositPaid ? c.job.deposit : 0) + (c.job.balancePaid ? c.job.price - c.job.deposit : 0);
        return `<li><a href="#" class="a-jobrow" data-open="${c.id}"><div><strong>${esc(c.job.title)}</strong><span class="a-muted a-small"> · ${esc(c.name)}</span></div><div class="a-bar-track"><i style="width:${p.pct}%"></i></div>
          <div class="a-small">${p.next ? "Next: <strong>" + esc(p.next) + "</strong>" : "Build finished"}${c.job.due ? " · due " + longDate(c.job.due) : ""}</div>
          <div class="a-small a-muted">${c.job.price ? `Price ${money(c.job.price)} · received ${money(recv)}` : "Price not entered yet"}</div></a></li>`; }).join("")}</ul>
      <section class="a-panel"><h2 class="a-panel__title">Shopping list <span class="a-muted">— not in the shop yet</span></h2>
        ${toBuy.length ? Object.entries(groups).map(([sup, list]) => `<div class="a-shop"><h3>${esc(sup)}</h3><ul class="a-list">${list.map((m) => `<li class="a-row"><span>${esc(m.item || "Unnamed")} <span class="a-muted">· ${esc(m.qty)}</span> <span class="pill pill--${m.status === "needed" ? "warn" : "neutral"}">${m.status === "needed" ? "To order" : "Ordered"}</span></span><a href="#" class="a-small" data-open="${m.id}">${esc(m.job)}</a></li>`).join("")}</ul></div>`).join("") : `<p class="a-hint">Everything is in the shop.</p>`}</section>`;
  }

  // ── Events ─────────────────────────────────────────────────────────────
  document.addEventListener("click", (e) => {
    const t = e.target.closest("button,a,[data-open]"); if (!t) { document.querySelectorAll(".a-movemenu__list").forEach((m) => m.remove()); return; }
    const li = t.closest("[data-id]"); const id = li?.dataset.id; const sid = $("#sheet").dataset.id; const c = id ? card(id) : sid ? card(sid) : null;
    if (t.dataset.view) { view = t.dataset.view; document.querySelectorAll("[data-view]").forEach((b) => { b.classList.toggle("is-active", b === t); b.setAttribute("aria-selected", b === t); }); return render(); }
    if (t.dataset.open) { e.preventDefault(); return openSheet(t.dataset.open, "job"); }
    switch (t.dataset.act) {
      case "reply": return openComposer(c, { moveTo: c.status === "new" ? "follow_up" : undefined });
      case "open": return openSheet(id, c.job ? "job" : "request");
      case "menu": {
        document.querySelectorAll(".a-movemenu__list").forEach((m) => m.remove());
        const ul = document.createElement("ul"); ul.className = "a-movemenu__list"; ul.setAttribute("role", "menu");
        ul.innerHTML = STAGES.filter((s) => s.id !== c.status).map((s) => `<li><button type="button" role="menuitem" data-moveto="${s.id}">${s.label}</button></li>`).join("");
        t.parentElement.append(ul); return;
      }
      case "close": $("#sheet").classList.remove("open"); delete $("#sheet").dataset.id; document.body.style.overflow = ""; return render();
      case "reply-sheet": return openComposer(c, { moveTo: c.status === "new" ? "follow_up" : undefined });
      case "addmat": c.job.materials.push({ item: "", qty: "", supplier: "", cost: 0, status: "needed" }); persist(); return openSheet(c.id);
      case "update": c.job.share = true; persist(); openSheet(c.id); return openComposer(c, { templateId: "progress", title: `Progress update for ${c.name.split(" ")[0]}` });
      case "custpage": return custPage(c);
      case "closecust": return $("#custPage").classList.remove("open");
      case "portfolio": return toast("In the real dashboard this creates a draft portfolio project from the build photos.");
    }
    if (t.dataset.moveto) { const cid = t.closest("[data-id]").dataset.id; return move(cid, t.dataset.moveto); }
    if (t.dataset.tab) return openSheet(sid, t.dataset.tab);
    if (t.dataset.stage && c) { move(c.id, t.dataset.stage); return openSheet(c.id, t.dataset.stage === "in_process" ? "job" : undefined); }
    if (t.dataset.matstatus != null) { c.job.materials[+t.dataset.matstatus].status = t.dataset.s; persist(); return openSheet(c.id); }
  });
  document.addEventListener("change", (e) => {
    const t = e.target; const c = card($("#sheet").dataset.id || ""); if (!c) return;
    if (t.dataset.step != null) { c.job.steps[+t.dataset.step].done = t.checked; persist(); return openSheet(c.id); }
    if (t.dataset.flag) { c.job[t.dataset.flag] = t.checked; persist(); return openSheet(c.id); }
    if (t.dataset.photo != null && t.files?.[0]) { const r = new FileReader(); r.onload = () => { c.job.steps[+t.dataset.photo].photos.push({ src: r.result, cap: "" }); try { persist(); } catch {} toast("Photo added"); openSheet(c.id); }; r.readAsDataURL(t.files[0]); return; }
    if (t.dataset.job) { const k = t.dataset.job; c.job[k] = k === "price" || k === "deposit" ? Math.max(0, parseFloat(t.value.replace(/[^0-9.]/g, "")) || 0) : t.value; persist(); return openSheet(c.id); }
    if (t.dataset.mat != null) { const m = c.job.materials[+t.dataset.mat]; m[t.dataset.f] = t.dataset.f === "cost" ? parseFloat(t.value.replace(/[^0-9.]/g, "")) || 0 : t.value; persist(); return openSheet(c.id); }
  });
  $("#reset").onclick = () => { S = { cards: seed() }; persist(); $("#sheet").classList.remove("open"); $("#custPage").classList.remove("open"); document.body.style.overflow = ""; render(); toast("Demo reset"); };
  addEventListener("keydown", (e) => { if (e.key === "Escape") { $("#custPage").classList.remove("open"); } });
  const m = location.hash.match(/^#progress-(\w+)/); if (m && card(m[1])?.job) custPage(card(m[1]));
  render();
})();
