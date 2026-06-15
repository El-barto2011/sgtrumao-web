/* ── NAV ── */
window.addEventListener('scroll',()=>{
  document.getElementById('navbar').classList.toggle('scrolled',scrollY>50);
  document.getElementById('backTop').classList.toggle('visible',scrollY>400);
  // Barra de progreso
  const prog = (scrollY / (document.body.scrollHeight - innerHeight)) * 100;
  document.getElementById('progress-bar').style.width = prog + '%';
});
function toggleMenu(){document.getElementById('navLinks').classList.toggle('open')}
document.querySelectorAll('#navLinks a').forEach(a=>a.addEventListener('click',()=>document.getElementById('navLinks').classList.remove('open')));

/* ── CURSOR PERSONALIZADO ── */
const dot = document.getElementById('cursor-dot');
document.addEventListener('mousemove',e=>{
  dot.style.left=e.clientX+'px'; dot.style.top=e.clientY+'px';
  document.body.classList.add('cursor-ready');
});

/* ── SCROLL REVEAL ── */
const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');obs.unobserve(e.target)}}),{threshold:0.12});
document.querySelectorAll('.reveal,.section-line').forEach(el=>obs.observe(el));

/* ── GSAP HERO ENTRANCE ── */
window.addEventListener('load',()=>{
  if(typeof gsap==='undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Polygons stagger in
  gsap.to([...document.querySelectorAll('.poly-bg polygon')],{
    opacity:1, stagger:0.06, duration:0.7, ease:'power2.out', delay:0.2
  });

  // Hero text cascade — from() anima DESDE estos valores, así el fallback sin GSAP muestra todo visible
  const tl = gsap.timeline({defaults:{ease:'power3.out'}});
  tl.from('.hero-eyebrow',{opacity:0,y:20,duration:.7,delay:.3})
    .from('.hero h1',      {opacity:0,y:30,duration:.8},'-=.3')
    .from('.hero-desc',    {opacity:0,y:20,duration:.7},'-=.4')
    .from('.hero-btns',    {opacity:0,y:20,duration:.6},'-=.4')
    .from('.hero-stats',   {opacity:0,y:20,duration:.6},'-=.3')
    .from('#heroCard',     {opacity:0,x:40,y:20,duration:.8,ease:'back.out(1.2)'},'-=.5');

  // ScrollTrigger parallax on polygon
  gsap.to('.poly-bg svg',{
    yPercent:-15,
    scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}
  });
});

/* ── THREE.JS PARTÍCULAS HERO ── */
document.addEventListener('DOMContentLoaded',function(){
  if(!document.getElementById('hero-particles')) return;
  var s=document.createElement('script');
  s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload=initParticles;
  document.body.appendChild(s);
});
function initParticles(){(function(){
  const canvas = document.getElementById('hero-particles');
  const hero   = document.querySelector('.hero');
  if(!canvas||typeof THREE==='undefined') return;

  const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setClearColor(0x000000,0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
  camera.position.z = 20;

  function resize(){
    const w = hero.offsetWidth, h = hero.offsetHeight;
    renderer.setSize(w,h,false);
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize',resize);

  // Partículas en teal/blanco
  const N = 1200;
  const pos = new Float32Array(N*3);
  const col = new Float32Array(N*3);
  const teal1 = new THREE.Color('#148C8C');
  const teal2 = new THREE.Color('#A0C8C8');
  const white = new THREE.Color('#ffffff');

  for(let i=0;i<N;i++){
    pos[i*3]   = (Math.random()-.5)*70;
    pos[i*3+1] = (Math.random()-.5)*40;
    pos[i*3+2] = (Math.random()-.5)*30;
    const c = Math.random()<.5 ? teal1 : Math.random()<.5 ? teal2 : white;
    col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color',   new THREE.BufferAttribute(col,3));
  const mat = new THREE.PointsMaterial({size:.07,vertexColors:true,transparent:true,opacity:.55,sizeAttenuation:true});
  scene.add(new THREE.Points(geo,mat));

  let mx=0,my=0;
  hero.addEventListener('mousemove',e=>{
    mx=(e.clientX/hero.offsetWidth-.5)*2;
    my=(e.clientY/hero.offsetHeight-.5)*2;
  });

  let t=0;
  (function loop(){
    requestAnimationFrame(loop);
    t+=.004;
    scene.rotation.y = t*.015 + mx*.04;
    scene.rotation.x = Math.sin(t*.008)*.03 + my*.02;
    renderer.render(scene,camera);
  })();
})();}

/* ── 3D TILT EN CARDS ── */
document.querySelectorAll('[data-tilt]').forEach(card=>{
  let raf=null;
  card.addEventListener('mousemove',e=>{
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateY(${x*10}deg) rotateX(${-y*10}deg) scale3d(1.02,1.02,1.02)`;
      // Actualizar glow interior
      card.style.setProperty('--mx',(x+.5)*100+'%');
      card.style.setProperty('--my',(y+.5)*100+'%');
    });
  });
  card.addEventListener('mouseleave',()=>{
    cancelAnimationFrame(raf);
    card.style.transform='perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
    card.style.transition='transform .5s ease,box-shadow .25s,border-color .25s';
    setTimeout(()=>card.style.transition='',500);
  });
});

/* ── PARALLAX MOUSE EN HERO-CARD ── */
const heroCard = document.getElementById('heroCard');
if(heroCard){
  document.querySelector('.hero')?.addEventListener('mousemove',e=>{
    const rx=(e.clientX/innerWidth-.5)*8;
    const ry=(e.clientY/innerHeight-.5)*-8;
    heroCard.style.transform=`perspective(1200px) rotateY(${rx}deg) rotateX(${ry}deg) translateZ(10px)`;
  });
  document.querySelector('.hero')?.addEventListener('mouseleave',()=>{
    heroCard.style.transform='perspective(1200px) rotateY(0) rotateX(0) translateZ(0)';
    heroCard.style.transition='transform .6s ease';
    setTimeout(()=>heroCard.style.transition='',600);
  });
}

/* ── CONTADOR ANIMADO ── */
function countUp(el){
  const target=parseInt(el.dataset.target||el.textContent)||0;
  const prefix=el.dataset.prefix?.replace(/\d+/g,'')||'';
  const suffix=el.dataset.suffix||'';
  let cur=0, dur=1600;
  const step=target/dur*16;
  function tick(){
    cur=Math.min(cur+step,target);
    el.textContent=prefix+Math.round(cur)+suffix;
    if(cur<target) requestAnimationFrame(tick);
    else el.textContent=prefix+target+suffix;
  }
  tick();
}
const statObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll('[data-target]').forEach(countUp);
      statObs.unobserve(e.target);
    }
  });
},{threshold:.3});
document.querySelectorAll('.hero-stats,.equip-big').forEach(el=>statObs.observe(el));

/* ── BOTÓN MAGNÉTICO ── */
document.querySelectorAll('.btn-solid,.btn-outline,.btn-enviar,.nav-btn').forEach(btn=>{
  btn.addEventListener('mousemove',e=>{
    const r=btn.getBoundingClientRect();
    const x=(e.clientX-r.left-r.width/2)*.25;
    const y=(e.clientY-r.top-r.height/2)*.25;
    btn.style.transform=`translateX(${x}px) translateY(${y}px)`;
  });
  btn.addEventListener('mouseleave',()=>{
    btn.style.transform='';
    btn.style.transition='transform .4s ease, background .2s, border-color .2s, box-shadow .3s';
    setTimeout(()=>btn.style.transition='',400);
  });
});

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',function(e){
  const t=document.querySelector(this.getAttribute('href'));
  if(t){e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+scrollY-76,behavior:'smooth'});}
}));

/* ── FORM SUBMIT ── */
async function submitForm(){
  const n=document.getElementById('nombre').value.trim();
  const e=document.getElementById('email').value.trim();
  if(!n||!e){alert('Por favor ingresa al menos tu nombre y email.');return;}
  const btn=document.querySelector('.btn-enviar');
  btn.textContent='Enviando...'; btn.disabled=true;
  const data={
    nombre:n,email:e,
    telefono:document.getElementById('tel').value,
    tipo_evento:document.getElementById('tipo').value,
    fecha_lugar:document.getElementById('lugar').value,
    mensaje:document.getElementById('msg').value
  };
  try{
    const res=await fetch('https://formspree.io/f/xykbvqlj',{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(data)
    });
    if(res.ok){
      document.getElementById('formContent').style.display='none';
      document.getElementById('formSuccess').style.display='block';
    }else{
      alert('Hubo un error. Por favor contáctanos por WhatsApp.');
      btn.textContent='Enviar solicitud'; btn.disabled=false;
    }
  }catch(err){
    alert('Hubo un error. Por favor contáctanos por WhatsApp.');
    btn.textContent='Enviar solicitud'; btn.disabled=false;
  }
}
