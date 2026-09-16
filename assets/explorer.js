/* A small, dependency-free knowledge-map product built from public portfolio content.
   No generated answers, external requests, tracking of searches, or private employer data. */
(() => {
  "use strict";
  const root = document.getElementById("explore");
  if (!root) return;
  const nodes = [
    {
      id: "james",
      title: "James Finnie",
      kind: "person",
      label: "The connecting thread",
      x: 0.5,
      y: 0.48,
      description:
        "Senior Product Manager. Hands-on builder. Based in Toronto.",
      question: "The thread through my work",
      answer:
        "Turn a complicated problem into a clear decision, then give people something real to test. These are the projects, ideas, and experiences that shape that approach.",
      href: "#about",
      cta: "More about me",
    },
    {
      id: "sixcut",
      title: "The Six Cut",
      kind: "project",
      label: "Local discovery",
      x: 0.19,
      y: 0.18,
      image: "/assets/six-cut.webp",
      description: "A discovery tool for Toronto’s independent butcher shops.",
      question: "How do you make a local choice easier?",
      answer:
        "Bring shops onto a map, make the scoring transparent, and let people filter by what matters to them. Built end to end, from the scoring method to the discovery experience.",
      href: "https://six-cut.vercel.app/about",
      cta: "Read the project story",
    },
    {
      id: "hermes",
      title: "FinanceHermes",
      kind: "project",
      label: "Research agent",
      x: 0.79,
      y: 0.2,
      image: "/assets/finance-hermes.webp",
      description:
        "A financial-research agent with a visible research process.",
      question: "Can an answer show its working?",
      answer:
        "Search current sources, synthesise the findings, and stream the research progress. An experiment in useful agent workflows that people can inspect.",
      href: "https://finance-hermes.vercel.app/agent.html",
      cta: "Explore the research agent",
    },
    {
      id: "cibc",
      title: "CIBC Investor’s Edge",
      kind: "experience",
      label: "2025 — Present",
      x: 0.51,
      y: 0.11,
      description: "Senior Product Manager / Product Owner · Toronto",
      question: "Making investing more relevant",
      answer:
        "Leading product for self-directed investing, with a focus on AI-enabled experiences, personalisation, and prototype-led discovery.",
      href: "#experience",
      cta: "See my experience",
    },
    {
      id: "trudell",
      title: "Trudell Medical",
      kind: "experience",
      label: "2023 — 2025",
      x: 0.19,
      y: 0.79,
      description: "Manager, IoT & Intelligent Systems · London, Ontario",
      question: "Connecting the physical and digital",
      answer:
        "Led product direction across device data, companion apps, and a connected-device platform, aligning hardware, software, and commercial priorities.",
      href: "#experience",
      cta: "See my experience",
    },
    {
      id: "stonex",
      title: "StoneX",
      kind: "experience",
      label: "2022 — 2023",
      x: 0.49,
      y: 0.88,
      description: "Product Analyst / Associate Product Manager · London",
      question: "Trading depends on reliability",
      answer:
        "Worked across mobile trading and share dealing, including a reliability programme that materially reduced crashes on a mobile-first platform.",
      href: "#experience",
      cta: "See my experience",
    },
    {
      id: "equals",
      title: "Equals Money",
      kind: "experience",
      label: "2021 — 2022",
      x: 0.81,
      y: 0.79,
      description: "Product Analyst · London",
      question: "Reduce friction where it matters",
      answer:
        "Improved onboarding and operations across payments and FX, including identity verification, internal tools, and the customer journey.",
      href: "#experience",
      cta: "See my experience",
    },
    {
      id: "discovery",
      title: "Ask better questions",
      kind: "idea",
      label: "Discovery",
      x: 0.14,
      y: 0.47,
      description: "A clear problem changes what you build.",
      question: "What is actually worth solving?",
      answer:
        "Start with the person, the constraint, and the change that matters. Test assumptions before turning them into a roadmap.",
      href: "#focus",
      cta: "Explore my approach",
    },
    {
      id: "prototype",
      title: "Make it tangible",
      kind: "idea",
      label: "Prototyping",
      x: 0.35,
      y: 0.65,
      description: "Working software gives a team something to react to.",
      question: "What is the smallest useful test?",
      answer:
        "Make strategy tangible early. Connect design systems, engineering constraints, and delivery so a validated idea can survive the journey to production.",
      href: "#focus",
      cta: "Explore my approach",
    },
    {
      id: "context",
      title: "Context systems",
      kind: "idea",
      label: "Knowledge",
      x: 0.87,
      y: 0.46,
      description: "Useful AI starts with useful context.",
      question: "What does the system need to know?",
      answer:
        "Connect scattered research, decisions, and product knowledge into durable context that teams and agents can retrieve and use.",
      href: "#focus",
      cta: "Explore my approach",
    },
    {
      id: "agents",
      title: "Agent workflows",
      kind: "idea",
      label: "AI",
      x: 0.67,
      y: 0.62,
      description: "Human-directed systems with a visible process.",
      question: "Where should an agent act?",
      answer:
        "Design workflows with clear goals, human judgement, evaluation, and accountability. FinanceHermes is an independent experiment in that approach.",
      href: "#focus",
      cta: "Explore my approach",
    },
    {
      id: "trust",
      title: "Trust & control",
      kind: "idea",
      label: "Product judgement",
      x: 0.49,
      y: 0.29,
      description: "Relevance should strengthen a person’s agency.",
      question: "Useful, timely — and trustworthy?",
      answer:
        "Make an experience more relevant without creating pressure or overreach. Trust, transparency, and user control belong in the product decisions.",
      href: "#focus",
      cta: "Explore my approach",
    },
  ];
  const edges = [
    ["james", "sixcut"],
    ["james", "hermes"],
    ["james", "cibc"],
    ["james", "trudell"],
    ["james", "stonex"],
    ["james", "equals"],
    ["james", "prototype"],
    ["sixcut", "discovery"],
    ["sixcut", "prototype"],
    ["sixcut", "trust"],
    ["hermes", "agents"],
    ["hermes", "context"],
    ["cibc", "trust"],
    ["cibc", "prototype"],
    ["trudell", "prototype"],
    ["trudell", "discovery"],
    ["stonex", "trust"],
    ["equals", "trust"],
    ["equals", "discovery"],
    ["agents", "context"],
    ["prototype", "discovery"],
  ];
  const trails = {
    build: {
      title: "Idea → product",
      stops: ["discovery", "prototype", "sixcut"],
    },
    ai: {
      title: "AI that shows its work",
      stops: ["context", "agents", "hermes"],
    },
    trust: {
      title: "Building trust",
      stops: ["equals", "stonex", "cibc", "trust"],
    },
  };
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const stage = document.getElementById("map-stage"),
    world = document.getElementById("map-world"),
    svg = document.getElementById("map-edges"),
    nodeLayer = document.getElementById("map-nodes"),
    list = document.getElementById("map-list"),
    search = document.getElementById("map-search"),
    detail = document.getElementById("detail-body"),
    announcement = document.getElementById("map-announcement");
  const compact = matchMedia("(max-width: 700px)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let selected = "james",
    filter = "all",
    view = "map",
    query = "",
    zoom = 1,
    pan = { x: 0, y: 0 },
    trail = null,
    stop = 0,
    width = 1,
    height = 1,
    drag = null,
    ignoreClickUntil = 0,
    resizeFrame = 0;
  const buttons = new Map(),
    positions = new Map();
  const groupNames = {
    person: "About",
    project: "Project",
    experience: "Experience",
    idea: "Idea",
  };
  const el = (tag, className, text) => {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const related = (id) =>
    edges.filter((e) => e.includes(id)).map((e) => (e[0] === id ? e[1] : e[0]));
  const matches = () =>
    nodes.filter(
      (n) =>
        (filter === "all" || n.kind === filter) &&
        (n.title + " " + n.label + " " + n.description + " " + n.answer)
          .toLowerCase()
          .includes(query),
    );
  const announce = (text) => {
    announcement.textContent = text;
  };
  function select(id, { keepTrail = false, focusDetail = false } = {}) {
    if (!byId.has(id)) return;
    selected = id;
    if (!keepTrail) {
      trail = null;
      stop = 0;
    }
    search.value = "";
    query = "";
    if (filter !== "all" && byId.get(id).kind !== filter) filter = "all";
    zoom = 1;
    pan = { x: 0, y: 0 };
    render();
    if (focusDetail) {
      const heading = document.getElementById("map-detail-title");
      heading.focus({ preventScroll: true });
      if (compact.matches)
        document
          .getElementById("map-detail")
          .scrollIntoView({
            behavior: reduced.matches ? "instant" : "smooth",
            block: "nearest",
          });
    }
    announce(
      byId.get(id).title +
        ". " +
        related(id).length +
        " connections. Details updated.",
    );
  }
  function renderDetail() {
    const n = byId.get(selected);
    detail.replaceChildren();
    const meta = el("div", "detail-meta");
    meta.append(el("span", "", groupNames[n.kind]), el("span", "", n.label));
    detail.append(meta);
    if (n.image) {
      const img = el("img", "detail-image");
      img.src = n.image;
      img.alt = n.title + " interface preview";
      img.width = 1280;
      img.height = 900;
      detail.append(img);
    }
    const title = el("h2", "", n.title);
    title.id = "map-detail-title";
    title.tabIndex = -1;
    detail.append(title, el("p", "detail-description", n.description));
    detail.append(
      el("h3", "detail-question", n.question),
      el("p", "detail-answer", n.answer),
    );
    const link = el("a", "detail-link", n.cta + " ↗");
    link.href = n.href;
    if (n.href.startsWith("https:")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    detail.append(link);
    const connections = el("div", "detail-connections");
    connections.append(el("h3", "", "Connected to"));
    for (const id of related(n.id)) {
      const b = el("button", "connection-chip", byId.get(id).title);
      b.type = "button";
      b.dataset.select = id;
      connections.append(b);
    }
    detail.append(connections);
    const tc = document.getElementById("trail-controls");
    tc.hidden = !trail;
    root
      .querySelectorAll("[data-trail]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.trail === trail)),
      );
    if (trail) {
      const t = trails[trail];
      document.getElementById("trail-position").textContent =
        `${stop + 1} / ${t.stops.length}`;
      document
        .getElementById("trail-position")
        .setAttribute(
          "aria-label",
          t.title + `, stop ${stop + 1} of ${t.stops.length}`,
        );
      document.getElementById("trail-prev").disabled = stop === 0;
      document.getElementById("trail-next").disabled =
        stop === t.stops.length - 1;
    }
  }
  function mapIds() {
    const matched = matches().map((n) => n.id);
    if (!compact.matches || query || filter !== "all")
      return matched.length && !matched.includes("james")
        ? ["james", ...matched]
        : matched;
    if (selected === "james")
      return [
        "james",
        "sixcut",
        "hermes",
        "cibc",
        "trudell",
        "stonex",
        "equals",
      ];
    return [selected, ...related(selected)];
  }
  function layout() {
    if (view !== "map") return;
    width = stage.clientWidth;
    height = stage.clientHeight;
    world.style.width = width + "px";
    world.style.height = height + "px";
    const visible = mapIds();
    if (compact.matches) {
      const main = visible.includes(selected) ? selected : visible[0];
      const others = visible.filter((id) => id !== main);
      const rows = Math.ceil(others.length / 2);
      const required = Math.max(330, rows * 103 + 160);
      stage.style.height = required + "px";
      height = required;
      world.style.height = height + "px";
      if (main) positions.set(main, { x: width * 0.5, y: 75 });
      others.forEach((id, i) =>
        positions.set(id, {
          x: width * (i % 2 === 0 ? 0.255 : 0.745),
          y: 185 + Math.floor(i / 2) * 103,
        }),
      );
    } else {
      stage.style.height = "";
      height = stage.clientHeight;
      world.style.height = height + "px";
      if (filter !== "all" || query) {
        const count = visible.length;
        visible.forEach((id, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(count, 1);
          positions.set(
            id,
            count === 1
              ? { x: width / 2, y: height / 2 }
              : {
                  x: width / 2 + Math.cos(angle) * width * 0.32,
                  y: height / 2 + Math.sin(angle) * height * 0.31,
                },
          );
        });
      } else
        for (const n of nodes)
          positions.set(n.id, { x: n.x * width, y: n.y * height });
    }
    buttons.forEach((b, id) => {
      b.hidden = !visible.includes(id);
      const p = positions.get(id);
      if (p) {
        b.style.left = p.x + "px";
        b.style.top = p.y + "px";
      }
    });
    drawEdges();
    transform();
  }
  function drawEdges() {
    const shown = new Set(mapIds());
    svg.replaceChildren();
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    for (const [a, b] of edges) {
      if (!shown.has(a) || !shown.has(b)) continue;
      const p = positions.get(a),
        q = positions.get(b);
      if (!p || !q) continue;
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      const active = a === selected || b === selected;
      line.setAttribute(
        "d",
        `M ${p.x} ${p.y} Q ${(p.x + q.x) / 2} ${(p.y + q.y) / 2 - 20} ${q.x} ${q.y}`,
      );
      line.setAttribute("class", active ? "map-edge is-connected" : "map-edge");
      svg.append(line);
    }
  }
  function transform() {
    world.style.transform = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
    document.getElementById("map-zoom-out").disabled = zoom <= 0.7;
    document.getElementById("map-zoom-in").disabled = zoom >= 1.6;
  }
  function renderList() {
    list.replaceChildren();
    for (const n of matches()) {
      const b = el("button", "map-list-item");
      b.type = "button";
      b.dataset.select = n.id;
      b.setAttribute("aria-pressed", String(n.id === selected));
      b.append(
        el("span", "list-kind", groupNames[n.kind]),
        el("strong", "", n.title),
        el("span", "list-label", n.label),
        el("span", "list-arrow", "↗"),
      );
      list.append(b);
    }
  }
  function render() {
    root
      .querySelectorAll("[data-map-filter]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.mapFilter === filter)),
      );
    root
      .querySelectorAll("[data-map-view]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.mapView === view)),
      );
    const connected = new Set(related(selected));
    buttons.forEach((b, id) => {
      b.setAttribute("aria-pressed", String(id === selected));
      b.classList.toggle("is-related", connected.has(id));
      b.classList.toggle(
        "is-muted",
        selected !== "james" && id !== selected && !connected.has(id),
      );
    });
    stage.hidden = view !== "map";
    list.hidden = view !== "list";
    renderList();
    renderDetail();
    layout();
    const count = matches().length;
    document.getElementById("map-empty").hidden = count > 0;
    document.getElementById("map-count").textContent = query
      ? `${count} search ${count === 1 ? "result" : "results"}`
      : `${nodes.length} nodes · ${edges.length} connections`;
    document.getElementById("map-caption-detail").textContent = compact.matches
      ? "Select a node to follow its connections."
      : "Choose a node. Follow a connection.";
  }
  for (const n of nodes) {
    const b = el("button", `map-node node-${n.kind}`);
    b.type = "button";
    b.dataset.select = n.id;
    b.setAttribute("aria-label", n.title + ", " + groupNames[n.kind]);
    if (n.kind === "person") {
      b.append(
        el("span", "node-monogram", "jf."),
        el("strong", "node-title", "James Finnie"),
      );
    } else {
      b.append(
        el(
          "span",
          "node-kind",
          n.kind === "project" ? "↗ " + n.label : n.label,
        ),
        el("strong", "node-title", n.title),
      );
    }
    nodeLayer.append(b);
    buttons.set(n.id, b);
  }
  root.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-select]");
    if (choice) {
      if (Date.now() < ignoreClickUntil) return;
      select(choice.dataset.select, {
        focusDetail: compact.matches || !stage.contains(choice),
      });
      return;
    }
    const f = event.target.closest("[data-map-filter]");
    if (f) {
      filter = f.dataset.mapFilter;
      query = "";
      search.value = "";
      trail = null;
      zoom = 1;
      pan = { x: 0, y: 0 };
      render();
      announce(
        `${matches().length} ${f.textContent.trim().toLowerCase()} shown.`,
      );
      return;
    }
    const v = event.target.closest("[data-map-view]");
    if (v) {
      view = v.dataset.mapView;
      render();
      return;
    }
    const t = event.target.closest("[data-trail]");
    if (t) {
      trail = t.dataset.trail;
      stop = 0;
      filter = "all";
      select(trails[trail].stops[0], {
        keepTrail: true,
        focusDetail: compact.matches,
      });
    }
  });
  search.addEventListener("input", () => {
    query = search.value.trim().toLowerCase();
    zoom = 1;
    pan = { x: 0, y: 0 };
    renderList();
    layout();
    const count = matches().length;
    document.getElementById("map-empty").hidden = count > 0;
    document.getElementById("map-count").textContent =
      `${count} search ${count === 1 ? "result" : "results"}`;
    announce(`${count} search results.`);
  });
  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && matches().length) {
      e.preventDefault();
      select(matches()[0].id, { focusDetail: true });
    }
    if (e.key === "Escape") {
      search.value = "";
      query = "";
      render();
      search.blur();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "/" &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      !e.target.closest('input,textarea,[contenteditable="true"]')
    ) {
      e.preventDefault();
      search.focus();
    }
  });
  document.getElementById("map-zoom-in").addEventListener("click", () => {
    zoom = Math.min(1.6, Math.round((zoom + 0.15) * 100) / 100);
    transform();
  });
  document.getElementById("map-zoom-out").addEventListener("click", () => {
    zoom = Math.max(0.7, Math.round((zoom - 0.15) * 100) / 100);
    transform();
  });
  document.getElementById("map-reset").addEventListener("click", () => {
    zoom = 1;
    pan = { x: 0, y: 0 };
    layout();
    announce("Map position and zoom reset.");
  });
  for (const [id, delta] of [
    ["trail-prev", -1],
    ["trail-next", 1],
  ])
    document.getElementById(id).addEventListener("click", () => {
      if (!trail) return;
      stop = Math.max(
        0,
        Math.min(trails[trail].stops.length - 1, stop + delta),
      );
      select(trails[trail].stops[stop], { keepTrail: true });
    });
  document.getElementById("trail-close").addEventListener("click", () => {
    const prior = trail;
    trail = null;
    renderDetail();
    root.querySelector(`[data-trail="${prior}"]`)?.focus();
  });
  // Mouse/pen dragging is enhancement only; native buttons are the keyboard/touch interface.
  stage.addEventListener("pointerdown", (e) => {
    if (
      e.pointerType === "touch" ||
      e.button !== 0 ||
      e.target.closest(".map-controls")
    )
      return;
    const node = e.target.closest(".map-node");
    const id = node?.dataset.select;
    const p = id ? positions.get(id) : pan;
    drag = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      x: p.x,
      y: p.y,
      moved: false,
    };
    (node || stage).setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX,
      dy = e.clientY - drag.startY;
    if (Math.hypot(dx, dy) > 5) drag.moved = true;
    if (!drag.moved) return;
    stage.classList.add("is-dragging");
    if (drag.id) {
      const p = {
        x: Math.max(65, Math.min(width - 65, drag.x + dx / zoom)),
        y: Math.max(45, Math.min(height - 45, drag.y + dy / zoom)),
      };
      positions.set(drag.id, p);
      buttons.get(drag.id).style.left = p.x + "px";
      buttons.get(drag.id).style.top = p.y + "px";
      drawEdges();
    } else {
      pan = { x: drag.x + dx, y: drag.y + dy };
      transform();
    }
  });
  const endDrag = () => {
    if (drag?.moved) ignoreClickUntil = Date.now() + 150;
    drag = null;
    stage.classList.remove("is-dragging");
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("lostpointercapture", endDrag);
  root.hidden = false;
  render();
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => layout());
  }).observe(stage);
  compact.addEventListener("change", () => {
    zoom = 1;
    pan = { x: 0, y: 0 };
    render();
  });
  reduced.addEventListener("change", () =>
    root.classList.toggle("map-reduced", reduced.matches),
  );
  root.classList.toggle("map-reduced", reduced.matches);
})();
