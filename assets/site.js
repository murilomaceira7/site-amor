'use strict';
const $=id=>document.getElementById(id);
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const welcome=$('welcome'), enter=$('enter');
// Enquanto a mensagem inicial estiver aberta, o restante da página não recebe foco.
enter.focus({preventScroll:true});
function enterSite(){
  document.body.classList.remove('locked');
  document.querySelectorAll('header,main,footer').forEach(el=>el.inert=false);
  welcome.classList.add('off');welcome.setAttribute('aria-hidden','true');enter.disabled=true;
  $('musicBtn').focus({preventScroll:true});
}
enter.addEventListener('click',enterSite);
function updateScroll(){
  const y=window.scrollY||0, available=document.documentElement.scrollHeight-window.innerHeight;
  $('header').classList.toggle('stuck',y>35);
  $('progress').style.width=(available>0?Math.min(100,100*y/available):0)+'%';
}
window.addEventListener('scroll',updateScroll,{passive:true});window.addEventListener('resize',updateScroll);updateScroll();
const nav=$('nav'),menu=$('menuBtn');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'}
menu.addEventListener('click',()=>{
 const next=!nav.classList.contains('open');nav.classList.toggle('open',next);
 menu.setAttribute('aria-expanded',String(next));menu.textContent=next?'×':'☰';
});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus()}});
document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!nav.contains(e.target)&&!menu.contains(e.target))closeMenu()});
// Música é ativada apenas pela pessoa que visita a página. Os vídeos pausam a música para não sobrepor os sons.
const music=$('music'),musicBtn=$('musicBtn'),musicFeature=$('musicFeature'),musicHint=$('musicHint');
function musicState(){
 const playing=!music.paused;
 musicBtn.textContent=playing?'♫ Pausar música':'♫ Ouvir música';musicFeature.textContent=playing?'♫ Pausar nossa música':'♫ Ouvir nossa música';
 musicBtn.setAttribute('aria-pressed',String(playing));musicFeature.setAttribute('aria-pressed',String(playing));
}
async function toggleMusic(){
 if(music.paused){videos.forEach(v=>v.pause());try{await music.play();musicHint.textContent='Agora é só aproveitar. ♡'}catch(e){musicHint.textContent='Não foi possível tocar a música. Verifique a conexão com a internet.'}}
 else music.pause();musicState();
}
musicBtn.addEventListener('click',toggleMusic);musicFeature.addEventListener('click',toggleMusic);
music.addEventListener('play',musicState);music.addEventListener('pause',musicState);
music.addEventListener('error',()=>{musicHint.textContent='Música indisponível. Você ainda pode ver as fotos e os vídeos.'});
const videos=[...document.querySelectorAll('video')];videos.forEach(video=>video.addEventListener('play',()=>{music.pause();videos.forEach(other=>{if(other!==video)other.pause()})}));
// Álbum ampliável: teclado, toque horizontal e controle de foco.
const images=[
 ['assets/fotos/01-lago.jpeg','Nosso beijo perto da água'],
 ['assets/fotos/02-espelho.jpeg','Nosso momento no espelho'],
 ['assets/fotos/03-sorriso.jpeg','Nossa selfie sorrindo'],
 ['assets/fotos/04-beijo.jpeg','Nosso beijo de casaco'],
 ['assets/fotos/05-noite.jpeg','Nosso beijo à noite'],
 ['assets/fotos/06-bagunça.jpeg','Uma selfie engraçada'],
 ['assets/fotos/07-ar-livre.jpeg','Um momento nosso ao ar livre'],
 ['assets/fotos/08-careta.jpeg','Nosso momento divertido']
];
const zoom=$('lightbox');let photoIndex=0,focusBeforeZoom=null;
function drawZoom(){const item=images[photoIndex];$('zoomImage').src=item[0];$('zoomImage').alt=item[1];$('zoomCaption').textContent=(photoIndex+1)+' de '+images.length+' · '+item[1]}
function showZoom(i){focusBeforeZoom=document.activeElement;photoIndex=i;drawZoom();if(!zoom.open)zoom.showModal();$('closeZoom').focus()}
document.querySelectorAll('[data-photo]').forEach(btn=>btn.addEventListener('click',()=>showZoom(Number(btn.dataset.photo))));
$('closeZoom').addEventListener('click',()=>zoom.close());
function moveZoom(delta){photoIndex=(photoIndex+images.length+delta)%images.length;drawZoom()}
$('prevZoom').addEventListener('click',()=>moveZoom(-1));$('nextZoom').addEventListener('click',()=>moveZoom(1));
zoom.addEventListener('keydown',e=>{if(e.key==='ArrowRight')moveZoom(1);if(e.key==='ArrowLeft')moveZoom(-1)});
zoom.addEventListener('close',()=>{if(focusBeforeZoom&&focusBeforeZoom.isConnected)focusBeforeZoom.focus()});
zoom.addEventListener('click',e=>{if(e.target===zoom)zoom.close()});
let touchX=null;zoom.addEventListener('touchstart',e=>{touchX=e.touches[0]?.clientX??null},{passive:true});
zoom.addEventListener('touchend',e=>{if(touchX===null)return;const delta=(e.changedTouches[0]?.clientX??touchX)-touchX;if(Math.abs(delta)>55)moveZoom(delta>0?-1:1);touchX=null},{passive:true});
// Carta atualizada com as lembranças e expressões pessoais de Murilo.
const letter=`Meu amoreco, minha princesa,

Eu podia escrever um monte de coisas bonitas, mas acho que nenhuma delas consegue explicar direitinho o que acontece comigo quando você sorri. Eu adoro aquele seu cabelo, o brilho do seu olhar e esse seu jeitinho encantador. Até quando eu te irrito e você fica brava, eu olho pra você e penso: como pode ser tão linda assim?

Gosto da gente do jeito que a gente é. Das nossas brincadeiras, de fazer cosquinha em você, da massagem e do carinho nas suas costas, de ficar pertinho sem precisar de nenhum motivo especial. Gosto de sentir que posso ser eu mesmo ao seu lado. E gosto de você inteira, de cada detalhe, até dos que talvez você nem perceba.

Tem uma coisa nossa de que eu gosto demais: os três toquinhos. Pra qualquer outra pessoa, parecem só três toques. Pra mim, eles dizem tudo o que às vezes nem cabe em palavras: eu te amo. Sempre que a gente faz isso, eu lembro que existe um jeito só nosso de dizer tanta coisa.

Quando eu falo “eu te vivo”, é porque não quero guardar você só nas fotos ou nos dias especiais. Quero estar por perto nos dias comuns também, nas nossas risadas, nos carinhos e em cada lembrança nova que a vida deixar a gente criar. Hoje, amanhã e para sempre, eu quero continuar escolhendo estar ao seu lado.

E tem umas coisas bonitas que eu ainda quero te dizer olhando nos seus olhos. Sem pressa. Por enquanto, fica aqui mais um pouquinho comigo?

Eu te vivo, princesa. ♡

Com todo o meu carinho,
Murilo

Nem tudo que o coração guarda cabe numa tela. Algumas coisas eu prefiro te contar bem pertinho. ♡`;
let typingTimer=null;const letterText=$('letterText'),letterBtn=$('openLetter'),letterAll=$('allLetter'),letterClose=$('closeLetter');
function finishLetter(){clearTimeout(typingTimer);letterText.textContent=letter;letterAll.hidden=true;letterClose.hidden=false}
letterBtn.addEventListener('click',()=>{
 letterText.hidden=false;letterBtn.hidden=true;letterBtn.setAttribute('aria-expanded','true');letterClose.hidden=false;envelope.classList.add('opened');envelopeOpen.textContent='Carta aberta ♡';envelopeOpen.setAttribute('aria-expanded','true');
 if(reducedMotion){finishLetter();return}
 let i=0;letterAll.hidden=false;function type(){i=Math.min(i+4,letter.length);letterText.textContent=letter.slice(0,i);if(i<letter.length)typingTimer=setTimeout(type,25);else letterAll.hidden=true}type();
});

const envelopeOpen=$('envelopeOpen'),envelope=$('envelope');
envelopeOpen.addEventListener('click',()=>{letterBtn.click();letterBtn.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'nearest'});});
letterAll.addEventListener('click',()=>{finishLetter();letterText.focus()});
letterClose.addEventListener('click',()=>{clearTimeout(typingTimer);letterText.hidden=true;letterAll.hidden=true;letterClose.hidden=true;letterBtn.hidden=false;letterBtn.setAttribute('aria-expanded','false');envelope.classList.remove('opened');envelopeOpen.textContent='Abrir o envelope ♡';envelopeOpen.setAttribute('aria-expanded','false');letterBtn.focus()});
// Bilhetinhos simples: não contêm informações sobre planos ou datas futuras.
const notes=[
 'Amoreco, seu sorriso muda o clima do meu dia. Até quando você faz aquela carinha brava, eu me derreto por você.',
 'Eu gosto das nossas brincadeiras, das cosquinhas e daqueles momentos em que faço carinho nas suas costas e o mundo fica quietinho.',
 'Eu te vivo, princesa. Hoje, amanhã e para sempre, quero continuar colecionando os nossos momentos. ♡'
];
let noteIndex=0;$('nextNote').addEventListener('click',()=>{noteIndex=(noteIndex+1)%notes.length;$('noteIndex').textContent=String(noteIndex+1).padStart(2,'0')+' / 03';$('noteMessage').textContent=notes[noteIndex];$('nextNote').textContent=noteIndex===2?'Ler desde o começo ♡':'Ler o próximo bilhetinho ♡'});
const hiddenHearts=[
 {title:'Uma lembrança',image:'assets/fotos/03-sorriso.jpeg',alt:'Nós dois sorrindo no espelho',text:'Sabe aquelas lembranças que chegam do nada e fazem a gente sorrir? Muitas das minhas têm você no meio. E eu adoro isso.'},
 {title:'Uma música',image:'assets/fotos/07-ar-livre.jpeg',alt:'Nós dois em uma selfie ao ar livre',text:'Tem música que muda de significado quando alguém especial aparece na vida da gente. Algumas agora sempre vão me lembrar de você.'},
 {title:'Uma vontade',image:'assets/fotos/01-lago.jpeg',alt:'Um beijo nosso perto da água',text:'Minha vontade é simples: continuar vivendo as coisas pequenas ao seu lado. Mais risadas, abraços, carinhos nas costas e nossos três toquinhos. ♡'}
];
const heartButtons=[...document.querySelectorAll('[data-heart]')],heartReveal=$('heartReveal');
heartButtons.forEach((btn,i)=>btn.addEventListener('click',()=>{
 const item=hiddenHearts[i];heartButtons.forEach((b,j)=>{b.setAttribute('aria-pressed',String(i===j));b.querySelector('small').textContent=i===j?'Bilhetinho aberto':'Toque para abrir'});
 $('heartImage').src=item.image;$('heartImage').alt=item.alt;$('heartTitle').textContent=item.title;$('heartMessage').textContent=item.text;heartReveal.hidden=false;
 heartReveal.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'nearest'});
}));
$('closeHeart').addEventListener('click',()=>{heartReveal.hidden=true;heartButtons.forEach(b=>{b.setAttribute('aria-pressed','false');b.querySelector('small').textContent='Toque para abrir'});heartButtons[0].focus({preventScroll:true})});
const last=$('finalMessage'),finalBtn=$('finalBtn');finalBtn.addEventListener('click',()=>{const show=last.hidden;last.hidden=!show;finalBtn.setAttribute('aria-expanded',String(show));finalBtn.textContent=show?'Guardar essa coisinha ♡':'Uma última coisinha ♡';if(show)last.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'nearest'})});
// Nosso pequeno código: três toquinhos, sem mistério para quem é de fora.
let tapCount=0,tapFinished=false;const tapHeart=$('tapHeart'),tapHint=$('tapHint');
tapHeart.addEventListener('click',()=>{
 if(tapFinished){tapFinished=false;tapCount=0;tapHeart.textContent='♡';tapHint.textContent='0 de 3 toquinhos';tapHeart.setAttribute('aria-label','Dar um toquinho no coração, zero de três');return;}
 tapCount++;
 if(!reducedMotion){tapHeart.classList.remove('pulse-tap');void tapHeart.offsetWidth;tapHeart.classList.add('pulse-tap');}
 if(navigator.vibrate)navigator.vibrate(tapCount===3?[35,60,35]:35);
 if(tapCount===3){tapFinished=true;tapHint.textContent='Eu te amo, amoreco. Hoje, amanhã e para sempre. ♡';tapHeart.textContent='♥';tapHeart.setAttribute('aria-label','Três toquinhos: eu te amo. Toque para recomeçar');}
 else{tapHint.textContent=tapCount+' de 3 toquinhos';tapHeart.textContent='♡';tapHeart.setAttribute('aria-label','Dar um toquinho no coração, '+tapCount+' de três');}
});
$('year').textContent=new Date().getFullYear();
if('IntersectionObserver' in window&&!reducedMotion){const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}}),{threshold:.06});document.querySelectorAll('.reveal').forEach(el=>io.observe(el))}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
