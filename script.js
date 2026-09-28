/* ===== NEON//TECH — logique ===== */

// ---------- 1. Particules en arrière-plan ----------
(function background() {
  const canvas = document.getElementById("bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.min(90, Math.floor((canvas.width * canvas.height) / 20000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.4
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,240,255,.5)";
      ctx.fill();
    }
    // liens entre particules proches
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "rgba(0,240,255," + (0.16 * (1 - d / 130)).toFixed(3) + ")";
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
})();

// ---------- 2. Horloge + statut + uptime ----------
const bootTime = Date.now();
setInterval(() => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const clock = document.getElementById("clock");
  if (clock) clock.textContent = p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());

  const status = document.getElementById("status");
  if (status) status.textContent = "NODE-" + p(1 + Math.floor(Math.random() * 9));

  const up = document.getElementById("uptime");
  if (up) up.textContent = "UPTIME " + Math.floor((Date.now() - bootTime) / 1000) + "s";
}, 1000);

// ---------- 3. Compteurs animés ----------
const counters = document.querySelectorAll("[data-count]");
counters.forEach((el) => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || "";
  const dur = 1400;
  const start = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
});

// ---------- 4. Révélation au scroll ----------
const revealTargets = document.querySelectorAll(".card, .section, .stats, .terminal, .form");
revealTargets.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(24px)";
  el.style.transition = "opacity .6s ease, transform .6s ease";
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.style.opacity = "1";
      e.target.style.transform = "none";
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
revealTargets.forEach((el) => observer.observe(el));

// ---------- 5. Nav active au scroll ----------
const sections = document.querySelectorAll("main section");
const links = document.querySelectorAll(".nav a");
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });
sections.forEach((s) => navObserver.observe(s));

// ---------- 6. Terminal interactif ----------
const out = document.getElementById("termOut");
const input = document.getElementById("cmd");
const start = Date.now();

const COMMANDS = {
  help: "Commandes : help, whoami, status, ls, date, clear, ping, hack, exit",
  whoami: "utilisateur : root@neontech — privilèges : ADMIN",
  status: "tous les systèmes opérationnels — charge : 12% — latence : 4ms",
  ls: "bin  core  logs  net  scripts  var",
  ping: "PING neontech.io : 64 octets, temps=4ms, TTL=57 — séquence 4\nPING neontech.io : 64 octets, temps=3ms, TTL=57 — séquence 5\nPING neontech.io : 64 octets, temps=4ms, TTL=57 — séquence 6",
  hack: "accès refusé — mais honnêtement, bonne tentative.",
  exit: "déconnexion... (mais vous restez quand même)"
};

function print(text) {
  out.textContent += text + "\n";
  out.scrollTop = out.scrollHeight;
}

if (out && input) {
  print("NEON//TECH shell v2.6.1");
  print("Tapez 'help' pour la liste des commandes.\n");
  input.focus();

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const raw = input.value.trim();
    const cmd = raw.toLowerCase();
    if (!cmd) return;
    print("root@neontech:~$ " + raw);

    if (cmd === "clear") {
      out.textContent = "";
    } else if (cmd === "date") {
      print(new Date().toString());
    } else if (COMMANDS[cmd]) {
      print(COMMANDS[cmd]);
    } else {
      print("commande inconnue : " + cmd);
    }
    print("");
    input.value = "";
  });
}

// ---------- 7. Bouton INITIALISER ----------
function launchSequence() {
  const steps = [
    "INIT : chargement du noyau",
    "CHECK : intégrité des modules",
    "LINK : noeuds réseau OK",
    "SECURE : pare-feu activé",
    "READY : système opérationnel"
  ];
  if (out) out.textContent = "";
  let i = 0;
  const timer = setInterval(() => {
    if (i >= steps.length) { clearInterval(timer); return; }
    print("[" + String(i + 1).padStart(2, "0") + "] " + steps[i]);
    i++;
  }, 350);
}

// ---------- 8. Formulaire ----------
function sendForm(e) {
  e.preventDefault();
  const msg = document.getElementById("formMsg");
  msg.textContent = "> transmission en cours...";
  setTimeout(() => {
    msg.textContent = "> message envoyé. Réponse sous 48h. // CONFIRMÉ: OK";
    e.target.reset();
  }, 800);
}
