(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const views = $$('.view');

  function showView(name) {
    views.forEach(view => view.classList.toggle('active', view.id === `view-${name}`));
    window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduce-motion') ? 'auto' : 'smooth' });
    if (name === 'experiment') drawGravity();
  }
  $$('[data-view]').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));

  const motionToggle = $('#motion-toggle');
  motionToggle.addEventListener('click', () => {
    const active = document.body.classList.toggle('reduce-motion');
    motionToggle.setAttribute('aria-pressed', String(active));
    motionToggle.querySelector('span').textContent = active ? 'Movimento reduzido' : 'Movimento suave';
  });

  const worldInfo = {
    'Sol': ['☀️', 'O Sol é uma estrela. Sua luz e seu calor tornam a vida na Terra possível.'],
    'Mercúrio': ['⚫', 'Mercúrio é o planeta mais próximo do Sol e tem uma superfície cheia de crateras.'],
    'Vênus': ['🟠', 'Vênus é coberto por nuvens espessas e tem uma atmosfera muito quente.'],
    'Terra': ['🌍', 'A Terra é nossa casa: um planeta com água líquida na superfície e muitas formas de vida.'],
    'Lua': ['🌙', 'A Lua é o satélite natural da Terra. Sua aparência muda conforme vemos diferentes partes iluminadas pelo Sol.'],
    'Marte': ['🔴', 'Marte é conhecido como planeta vermelho por causa dos minerais ricos em ferro em seu solo.'],
    'Júpiter': ['🟤', 'Júpiter é o maior planeta do Sistema Solar. É um gigante gasoso com muitas luas.'],
    'Saturno': ['🪐', 'Saturno é um gigante gasoso rodeado por anéis feitos principalmente de pedaços de gelo e rocha.'],
    'Urano': ['🔵', 'Urano é um gigante gelado que gira de lado em comparação com a maioria dos planetas.'],
    'Netuno': ['🔷', 'Netuno fica muito longe do Sol e tem ventos extremamente rápidos.']
  };
  $$('.world-card').forEach(card => card.addEventListener('click', () => {
    const [emoji, copy] = worldInfo[card.dataset.world];
    $('#detail-emoji').textContent = emoji;
    $('#detail-title').textContent = card.dataset.world;
    $('#detail-copy').textContent = copy;
    $('#world-detail').classList.remove('hidden');
    $('#world-detail').scrollIntoView({ behavior: document.body.classList.contains('reduce-motion') ? 'auto' : 'smooth', block: 'nearest' });
  }));

  // Gravity experiment: simple kinematics, with gravity mapped to a visible acceleration.
  const canvas = $('#gravity-canvas');
  const ctx = canvas.getContext('2d');
  const range = $('#gravity-range');
  const gravityValue = $('#gravity-value');
  const readout = $('#gravity-readout');
  const resultTitle = $('#result-title');
  const resultCopy = $('#result-copy');
  let ball = { x: 0, y: 0, vy: 0, falling: false, landed: false };
  let frame = 0;
  let lastTime = 0;
  let raf = 0;
  let stars = [];

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({length: 42}, (_, i) => ({
      x: (i * 73 + 19) % Math.max(1, rect.width),
      y: (i * 47 + 13) % Math.max(1, rect.height * .72),
      r: i % 5 === 0 ? 1.5 : .8
    }));
    resetBall(false);
  }
  function canvasSize() {
    const r = canvas.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }
  function resetBall(announce = true) {
    const {w,h} = canvasSize();
    ball = { x: w * .5, y: h * .18, vy: 0, falling: false, landed: false };
    if (announce) {
      resultTitle.textContent = 'Pronto para tentar de novo?';
      resultCopy.textContent = 'Ajuste a gravidade e solte a bolinha.';
    }
    drawGravity();
  }
  function drawPlanet(w, h) {
    const groundY = h * .83;
    const gradient = ctx.createLinearGradient(0, groundY, 0, h);
    gradient.addColorStop(0, '#28658b'); gradient.addColorStop(1, '#122c55');
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.ellipse(w*.5, h*1.02, w*.58, h*.24, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#83e6ef'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(w*.5, groundY, w*.58, h*.24, 0, Math.PI, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#8de7ee'; ctx.font = '11px DM Sans, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('PLANETA', w*.5, h*.96);
    return groundY;
  }
  function drawGravity() {
    if (!canvas || !ctx) return;
    const {w,h} = canvasSize();
    if (!w || !h) return;
    ctx.clearRect(0,0,w,h);
    const bg = ctx.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0b1d3a'); bg.addColorStop(1,'#10284b');
    ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);
    stars.forEach(s => { ctx.globalAlpha = .45 + (s.x%3)*.15; ctx.fillStyle = '#d9e9ff'; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); });
    ctx.globalAlpha = 1;
    const groundY = drawPlanet(w,h);
    const radius = 13;
    if (!ball.x) ball = {x:w*.5,y:h*.18,vy:0,falling:false,landed:false};
    // A subtle dotted guide helps make the motion legible.
    ctx.setLineDash([3,7]); ctx.strokeStyle = '#9bb9df44'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ball.x, h*.18+radius); ctx.lineTo(ball.x, groundY-radius); ctx.stroke(); ctx.setLineDash([]);
    const g = Number(range.value);
    const color = g < 4 ? '#b7a4ff' : g > 7 ? '#ffbd8a' : '#8de7ee';
    const glow = ctx.createRadialGradient(ball.x,ball.y,2,ball.x,ball.y,25);
    glow.addColorStop(0,color+'88'); glow.addColorStop(1,color+'00');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ball.x,ball.y,25,0,Math.PI*2); ctx.fill();
    const ballGrad = ctx.createRadialGradient(ball.x-5,ball.y-6,1,ball.x,ball.y,radius);
    ballGrad.addColorStop(0,'#ffffff'); ballGrad.addColorStop(.4,color); ballGrad.addColorStop(1,'#3d6699');
    ctx.fillStyle = ballGrad; ctx.beginPath(); ctx.arc(ball.x,ball.y,radius,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#c2d4f2'; ctx.font = '11px DM Sans, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('SOLTE A BOLINHA', 13, 22);
    ctx.fillStyle = '#8fa9ce'; ctx.font = '10px DM Sans, sans-serif';
    ctx.fillText('A gravidade puxa em direção ao planeta', 13, 38);
  }
  function updateGravityLabel() {
    const g = Number(range.value);
    gravityValue.textContent = g;
    readout.textContent = g <= 3 ? 'Gravidade suave' : g >= 8 ? 'Gravidade forte' : 'Gravidade média';
    if (!ball.falling) drawGravity();
  }
  function animate(timestamp) {
    if (!ball.falling) { raf = 0; return; }
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp-lastTime)/1000, .035);
    lastTime = timestamp;
    const {h} = canvasSize();
    const groundY = h*.83;
    const g = Number(range.value);
    ball.vy += (75 + g*27) * dt;
    ball.y += ball.vy * dt;
    if (ball.y >= groundY - 13) {
      ball.y = groundY - 13; ball.falling = false; ball.landed = true; ball.vy = 0;
      const speed = g <= 3 ? 'devagar' : g >= 8 ? 'bem rápido' : 'numa velocidade intermediária';
      resultTitle.textContent = g <= 3 ? 'A bolinha caiu devagar!' : g >= 8 ? 'Uau! Caiu bem rápido!' : 'A bolinha caiu!';
      resultCopy.textContent = `Com essa gravidade, ela chegou ao planeta ${speed}. O que acontece se você mudar o controle?`;
      lastTime = 0;
    }
    drawGravity();
    if (ball.falling) raf = requestAnimationFrame(animate); else raf = 0;
  }
  function dropBall() {
    if (ball.falling) return;
    const {w,h} = canvasSize();
    if (ball.landed) resetBall(false);
    ball.x = w*.5; ball.y = h*.18; ball.vy = 0; ball.falling = true; ball.landed = false; lastTime = 0;
    resultTitle.textContent = 'Observe a bolinha...';
    resultCopy.textContent = 'Veja como a gravidade muda a queda.';
    if (!raf) raf = requestAnimationFrame(animate);
  }
  range.addEventListener('input', updateGravityLabel);
  $('#drop-button').addEventListener('click', dropBall);
  $('#again-button').addEventListener('click', () => { if (raf) cancelAnimationFrame(raf); raf=0; resetBall(true); });
  $('#reset-gravity').addEventListener('click', () => { if (raf) cancelAnimationFrame(raf); raf=0; range.value=5; updateGravityLabel(); resetBall(true); });
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  updateGravityLabel();

  // Moon phase explorer. The shadow shifts over the illuminated disk.
  const phases = [
    {name:'Lua nova', emoji:'🌑', copy:'A face iluminada está voltada principalmente para longe de nós.'},
    {name:'Lua crescente', emoji:'🌒', copy:'Começamos a ver uma pequena parte iluminada da Lua.'},
    {name:'Quarto crescente', emoji:'🌓', copy:'Vemos aproximadamente metade da face da Lua iluminada.'},
    {name:'Lua gibosa crescente', emoji:'🌔', copy:'Mais da metade da face visível está iluminada.'},
    {name:'Lua cheia', emoji:'🌕', copy:'A face voltada para nós aparece totalmente iluminada.'},
    {name:'Lua gibosa minguante', emoji:'🌖', copy:'A parte iluminada que vemos começa a diminuir.'},
    {name:'Quarto minguante', emoji:'🌗', copy:'Vemos novamente aproximadamente metade da face iluminada.'},
    {name:'Lua minguante', emoji:'🌘', copy:'Resta uma faixa iluminada antes da próxima Lua nova.'}
  ];
  const moonRange = $('#moon-range');
  function updateMoon() {
    const i = Number(moonRange.value);
    const phase = phases[i];
    $('#moon-label').textContent = phase.name;
    $('#phase-emoji').textContent = phase.emoji;
    $('#phase-name').textContent = phase.name;
    $('#phase-copy').textContent = phase.copy;
    // Keep the diagram's illuminated half as a visual model; emoji conveys the named phase.
    const offsets = ['0%','25%','50%','75%','100%','125%','150%','175%'];
    $('#moon-shadow').style.transform = `translateX(${offsets[i]})`;
    $('#moon-shadow').style.opacity = i === 4 ? '0' : i === 0 ? '1' : '.88';
  }
  moonRange.addEventListener('input', updateMoon);
  updateMoon();

  const observationTips = {
    moon: 'Dica: a Lua pode aparecer em horários diferentes. Observe sua forma e onde ela está no céu.',
    stars: 'Dica: escolha um lugar escuro e seguro, longe de luzes fortes. Peça ajuda a um adulto para identificar padrões.',
    planet: 'Dica: alguns planetas parecem pontos muito brilhantes. A posição muda ao longo dos dias; um mapa celeste pode ajudar.'
  };
  $$('.observation-item').forEach(button => button.addEventListener('click', () => {
    $('#observation-feedback').textContent = observationTips[button.dataset.observation];
  }));
})();
