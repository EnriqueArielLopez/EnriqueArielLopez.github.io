const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let userReducedMotion = false;
let scrollEngine;
const motionToggle = document.querySelector('.motion-toggle');
function configureMotion() {
  const disabled = reducedMotion.matches || userReducedMotion;
  document.body.dataset.motion = disabled ? 'off' : 'on';
  motionToggle.setAttribute('aria-pressed', String(disabled));
  motionToggle.disabled = reducedMotion.matches;
  motionToggle.setAttribute('aria-label', reducedMotion.matches ? 'Movimiento reducido por tu sistema' : disabled ? 'Activar movimiento' : 'Reducir movimiento');
  motionToggle.title = reducedMotion.matches ? 'Movimiento reducido por tu sistema' : disabled ? 'Activar movimiento' : 'Reducir movimiento';
  motionToggle.querySelector('.motion-label').textContent = reducedMotion.matches ? 'Sin efectos' : disabled ? 'Activar efectos' : 'Pausar efectos';
  motionToggle.querySelector('.motion-symbol').textContent = disabled ? '○' : '◉';
  scrollEngine?.destroy();
  scrollEngine = !disabled && window.Lenis ? new Lenis({
    autoRaf: true,
    lerp: 0.085,
    smoothWheel: true,
    syncTouch: false,
    anchors: { offset: -95 },
    stopInertiaOnNavigate: true,
    prevent: node => node.id === 'case-dialog' || node.id === 'menu'
  }) : undefined;
}
configureMotion();
motionToggle.addEventListener('click', () => {
  userReducedMotion = !userReducedMotion;
  configureMotion();
  updateScroll();
});
reducedMotion.addEventListener('change', () => { configureMotion(); updateScroll(); });
const menu = document.querySelector('#menu');
const toggle = document.querySelector('.menu-toggle');
const floatingMenu = document.querySelector('.floating-menu');
let lastFocused;
let menuOpener = toggle;
function updatePageLock() {
  const locked = !menu.hidden || dialog.open;
  document.documentElement.style.overflow = locked ? 'hidden' : '';
  if (locked) scrollEngine?.stop();
  else scrollEngine?.start();
}
function setMenu(open) {
  if (open) menuOpener = document.activeElement;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.querySelector('.menu-label').textContent = open ? 'Cerrar' : 'Menú';
  menu.hidden = !open;
  menu.inert = !open;
  document.body.classList.toggle('menu-open', open);
  document.querySelector('main').inert = open;
  document.querySelector('footer').inert = open;
  floatingMenu.hidden = open || window.scrollY < 600;
  document.querySelectorAll('.header .brand, .header-contact, .desktop-nav, .header .motion-toggle, .skip-link').forEach(element => element.inert = open);
  updatePageLock();
  if (open) menu.querySelector('a').focus({ preventScroll: true });
  else if (menuOpener?.isConnected) menuOpener.focus({ preventScroll: true });
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
floatingMenu.addEventListener('click', () => setMenu(true));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  setMenu(false);
  const destination = link.getAttribute('href');
  if (destination.startsWith('#')) {
    const section = document.querySelector(destination);
    section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
  }
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) { setMenu(false); }
  if (event.key === 'Tab' && !menu.hidden) {
    const focusable = [toggle, ...menu.querySelectorAll('a')];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
const cases = {
  nexo: {
    label: 'PROYECTO PERSONAL / NEXO',
    html: `<div class="case-art nexo-case-art" aria-hidden="true">nexo ↗</div><h2 id="case-title">Conseguir clientes<br>también es laburo.</h2><p class="case-intro">Nexo es un proyecto mío que estoy armando para community managers.</p><div class="case-details"><div><h3>De dónde salió</h3><p>Vi de cerca que un community manager, además de manejar redes, pasa horas buscando clientes nuevos. Quise hacerle esa parte más fácil.</p></div><div><h3>Cómo va</h3><p>Ya lo estoy usando, pero todavía no está listo para mostrar. Cuando lo esté, lo subo acá.</p></div></div><p class="case-discretion">Por ahora no publico pantallas ni código.</p><a class="pill-link" href="mailto:ariellopez2097@gmail.com?subject=Conversemos%20sobre%20Nexo">Conversemos sobre Nexo <span>↗</span></a>`
  },
  sap: {
    label: 'EXPERIENCIA PROFESIONAL / PRACTICAL SOLUTIONS',
    html: `<div class="case-art sap" aria-hidden="true">SAP / ABAP_</div><h2 id="case-title">Mi día a día<br>en SAP.</h2><p class="case-intro">Trabajo en Practical Solutions desde marzo de 2023, sobre todo con los módulos SD y MM.</p><div class="case-details"><div><h3>Desarrollo</h3><p>Reportes ALV y CDS Views, funciones y clases ABAP. Muchas veces el trabajo es mejorar un programa Z que ya anda lento.</p></div><div><h3>Formularios y soporte</h3><p>Armo y mantengo Smartforms y Adobe Forms. También resuelvo incidencias y agrego cambios a desarrollos que ya están en uso.</p></div></div><p class="case-discretion">No muestro código ni datos de clientes porque es trabajo confidencial.</p><a class="pill-link" href="assets/ariel-lopez-cv-publico.pdf" download>Ver experiencia en mi CV <span>↙</span></a>`
  }
};
const dialog = document.querySelector('#case-dialog');
document.querySelectorAll('[data-case]').forEach(button => button.addEventListener('click', () => {
  const content = cases[button.dataset.case];
  lastFocused = button;
  document.querySelector('#case-label').textContent = content.label;
  document.querySelector('#case-body').innerHTML = content.html;
  dialog.showModal();
  dialog.scrollTop = 0;
  updatePageLock();
  updateScroll();
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});
dialog.addEventListener('close', () => { updatePageLock(); lastFocused?.focus({ preventScroll: true }); });
let toastTimeout;
function notify(message) {
  const toast = document.querySelector('.toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('visible'), 3500);
}
document.querySelector('#copy-email').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('ariellopez2097@gmail.com'); notify('Email copiado.'); }
  catch { notify('Mi email: ariellopez2097@gmail.com'); }
});
document.querySelector('#year').textContent = new Date().getFullYear();
function updateClock() {
  document.querySelector('.live-clock').textContent = new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()) + ' ART';
}
updateClock(); setInterval(updateClock, 60000);
let scrollTick = false;
function updateScroll() {
  const range = document.documentElement.scrollHeight - innerHeight;
  document.querySelector('.reading-progress').style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`;
  const contactRect = document.querySelector('#contacto').getBoundingClientRect();
  floatingMenu.hidden = scrollY < 600 || !menu.hidden || dialog.open || contactRect.top < innerHeight;
  const enabled = document.body.dataset.motion !== 'off' && innerWidth > 600;
  const hero = document.querySelector('.hero');
  const heroPinned = getComputedStyle(hero).position === 'sticky';
  const heroCovered = enabled && heroPinned && document.querySelector('.work').getBoundingClientRect().top < innerHeight * .7;
  hero.querySelectorAll('a').forEach(link => { link.inert = heroCovered; });
  const padding = parseFloat(getComputedStyle(document.querySelector('.project-track')).paddingLeft) || 0;
  document.querySelectorAll('.project-track').forEach(track => {
    const rect = track.getBoundingClientRect();
    const entry = Math.min(1, Math.max(0, (innerHeight - rect.top) / (innerHeight * .78)));
    const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - innerHeight)));
    const panel = track.querySelector('.project-panel');
    panel.style.setProperty('--panel-scale', enabled ? String(.91 + .09 * entry) : '1');
    panel.style.setProperty('--panel-radius', enabled ? `${24 * (1 - entry)}px` : '0px');
    panel.style.setProperty('--art-shift', enabled ? `${(progress - .35) * -34}px` : '0px');
    track.querySelector('.project-pin').style.marginInline = enabled ? `${-padding * entry}px` : '0px';
  });
  scrollTick = false;
}
addEventListener('scroll', () => {
  if (!scrollTick) { requestAnimationFrame(updateScroll); scrollTick = true; }
}, { passive: true });
addEventListener('resize', updateScroll, { passive: true });
updateScroll();
dialog.addEventListener('close', updateScroll);
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.body.classList.add('motion-ready');
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
const desk = document.querySelector('.desk');
const stack = desk.querySelector('.stack');
const orbitItems = [...desk.querySelectorAll('.orbit li')];
const rings = [{ count: 6, radius: .8, speed: .00005, tilt: .36 }, { count: orbitItems.length - 6, radius: 1.12, speed: -.000032, tilt: .5 }];
const motionOn = () => document.body.dataset.motion !== 'off';
let open = 0, openTarget = 0, spin = 0, lastFrame = performance.now(), tiltX = 0, tiltY = 0, tiltTargetX = 0, tiltTargetY = 0;
function setDesk(state) {
  openTarget = state ? 1 : 0;
  desk.classList.toggle('is-open', state);
  desk.setAttribute('aria-expanded', String(state));
}
desk.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') setDesk(true); });
desk.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { setDesk(false); tiltTargetX = tiltTargetY = 0; } });
desk.addEventListener('pointermove', event => {
  const rect = desk.getBoundingClientRect();
  tiltTargetY = ((event.clientX - rect.left) / rect.width - .5) * 16;
  tiltTargetX = ((event.clientY - rect.top) / rect.height - .5) * -12;
});
desk.addEventListener('click', event => { if (event.pointerType !== 'mouse') setDesk(openTarget === 0); });
desk.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setDesk(openTarget === 0); }
  if (event.key === 'Escape') setDesk(false);
});
function drawOrbit(now) {
  const delta = Math.min(50, now - lastFrame);
  lastFrame = now;
  const moving = motionOn();
  open += (openTarget - open) * (moving ? .09 : 1);
  if (moving && open > .01) spin += delta;
  tiltX += (tiltTargetX - tiltX) * .08;
  tiltY += (tiltTargetY - tiltY) * .08;
  stack.style.transform = `scale(${1 - .24 * open}) ` + (moving ? `rotateX(${8 + tiltX}deg) rotateY(${-14 + tiltY}deg)` : 'rotateX(8deg) rotateY(-14deg)');
  const rect = desk.getBoundingClientRect();
  const room = Math.min(rect.left + rect.width / 2, document.documentElement.clientWidth - rect.left - rect.width / 2) - 34;
  let index = 0;
  rings.forEach((ring, ringIndex) => {
    const rx = Math.min(rect.width * ring.radius * .5, room) * (.35 + .65 * open);
    const ry = rect.height * ring.tilt * (.35 + .65 * open);
    for (let i = 0; i < ring.count; i++, index++) {
      const angle = (i / ring.count) * Math.PI * 2 + spin * ring.speed * Math.PI * 2 + ringIndex * .4;
      const depth = Math.sin(angle);
      const scale = (.72 + .28 * (depth + 1) / 2) * (.4 + .6 * open);
      const item = orbitItems[index];
      item.style.transform = `translate(-50%, -50%) translate(${Math.cos(angle) * rx}px, ${depth * ry}px) scale(${scale})`;
      item.style.opacity = String(open * (.55 + .45 * (depth + 1) / 2));
      item.style.zIndex = depth > 0 ? 5 : 1;
      item.style.filter = depth > 0 ? '' : `blur(${(-depth * 1.2 * open).toFixed(2)}px)`;
    }
  });
  requestAnimationFrame(drawOrbit);
}
requestAnimationFrame(drawOrbit);
const codeLines = [...desk.querySelectorAll('.code-line')].map(line => ({ line, html: line.innerHTML, length: line.textContent.length }));
const cursor = desk.querySelector('.code-cursor');
function sliceHtml(html, count) {
  let out = '', shown = 0;
  for (const part of html.split(/(<[^>]+>|&[a-z]+;)/)) {
    if (!part) continue;
    if (part.startsWith('<')) { out += part; continue; }
    if (part.startsWith('&')) { if (shown < count) { out += part; shown++; } continue; }
    const take = part.slice(0, Math.max(0, count - shown));
    out += take; shown += take.length;
  }
  return out;
}
let typing;
function typeCode() {
  clearTimeout(typing);
  if (!motionOn()) { codeLines.forEach(item => { item.line.innerHTML = item.html; }); codeLines.at(-1).line.after(cursor); return; }
  codeLines.forEach(item => { item.line.innerHTML = ''; });
  let lineIndex = 0, char = 0;
  const step = () => {
    const item = codeLines[lineIndex];
    item.line.innerHTML = sliceHtml(item.html, ++char);
    item.line.after(cursor);
    if (char >= item.length) { lineIndex++; char = 0; }
    if (lineIndex < codeLines.length) typing = setTimeout(step, char === 0 ? 350 : 40 + Math.random() * 65);
    else typing = setTimeout(typeCode, 4500);
  };
  step();
}
document.fonts.ready.then(typeCode);
motionToggle.addEventListener('click', typeCode);
