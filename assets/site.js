'use strict';
const $ = id => document.getElementById(id);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// A página começa com a mensagem de entrada aberta; o restante só recebe foco depois.
const welcome = $('welcome');
const enter = $('enter');
enter.focus({ preventScroll: true });
function enterSite() {
  document.body.classList.remove('locked');
  document.querySelectorAll('header,main,footer').forEach(el => { el.inert = false; });
  welcome.classList.add('off');
  welcome.setAttribute('aria-hidden', 'true');
  enter.disabled = true;
  $('musicBtn').focus({ preventScroll: true });
}
enter.addEventListener('click', enterSite);

// Barra de progresso e cabeçalho.
function updateScroll() {
  const y = window.scrollY || 0;
  const available = document.documentElement.scrollHeight - window.innerHeight;
  $('header').classList.toggle('stuck', y > 35);
  $('progress').style.width = (available > 0 ? Math.min(100, 100 * y / available) : 0) + '%';
}
window.addEventListener('scroll', updateScroll, { passive: true });
window.addEventListener('resize', updateScroll);
updateScroll();

// Menu móvel.
const nav = $('nav');
const menu = $('menuBtn');
function closeMenu() {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.textContent = '☰';
}
menu.addEventListener('click', () => {
  const next = !nav.classList.contains('open');
  nav.classList.toggle('open', next);
  menu.setAttribute('aria-expanded', String(next));
  menu.textContent = next ? '×' : '☰';
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); }
});
document.addEventListener('click', e => {
  if (nav.classList.contains('open') && !nav.contains(e.target) && !menu.contains(e.target)) closeMenu();
});
$('musicBtn').addEventListener('click', () => {
  closeMenu();
  $('musicas').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
});

// Álbum ampliável: teclado, toque horizontal e controle de foco.
const images = [
  ['assets/fotos/01-lago.jpeg', 'Júlia e Murilo juntos perto da água'],
  ['assets/fotos/02-espelho.jpeg', 'Júlia e Murilo em uma selfie no espelho'],
  ['assets/fotos/03-sorriso.jpeg', 'Júlia e Murilo sorrindo'],
  ['assets/fotos/04-beijo.jpeg', 'Um beijo de Júlia e Murilo'],
  ['assets/fotos/05-noite.jpeg', 'Júlia e Murilo em um momento à noite'],
  ['assets/fotos/06-bagunça.jpeg', 'Uma selfie divertida de Júlia e Murilo'],
  ['assets/fotos/07-ar-livre.jpeg', 'Júlia e Murilo ao ar livre'],
  ['assets/fotos/08-careta.jpeg', 'Uma fotografia descontraída de Júlia e Murilo'],
  ['assets/fotos/09-pedido-luan.jpg', 'Júlia e Murilo se beijando no show do Luan Santana em 26 de setembro de 2026']
];
const zoom = $('lightbox');
let photoIndex = 0;
let focusBeforeZoom = null;
function drawZoom() {
  const item = images[photoIndex];
  $('zoomImage').src = item[0];
  $('zoomImage').alt = item[1];
  $('zoomCaption').textContent = (photoIndex + 1) + ' de ' + images.length + ' · ' + item[1];
}
function showZoom(i) {
  focusBeforeZoom = document.activeElement;
  photoIndex = i;
  drawZoom();
  if (!zoom.open) zoom.showModal();
  $('closeZoom').focus();
}
document.querySelectorAll('[data-photo]').forEach(btn => btn.addEventListener('click', () => showZoom(Number(btn.dataset.photo))));
$('closeZoom').addEventListener('click', () => zoom.close());
function moveZoom(delta) {
  photoIndex = (photoIndex + images.length + delta) % images.length;
  drawZoom();
}
$('prevZoom').addEventListener('click', () => moveZoom(-1));
$('nextZoom').addEventListener('click', () => moveZoom(1));
zoom.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') moveZoom(1);
  if (e.key === 'ArrowLeft') moveZoom(-1);
});
zoom.addEventListener('close', () => {
  if (focusBeforeZoom && focusBeforeZoom.isConnected) focusBeforeZoom.focus();
});
zoom.addEventListener('click', e => { if (e.target === zoom) zoom.close(); });
let touchX = null;
zoom.addEventListener('touchstart', e => { touchX = e.touches[0]?.clientX ?? null; }, { passive: true });
zoom.addEventListener('touchend', e => {
  if (touchX === null) return;
  const delta = (e.changedTouches[0]?.clientX ?? touchX) - touchX;
  if (Math.abs(delta) > 55) moveZoom(delta > 0 ? -1 : 1);
  touchX = null;
}, { passive: true });

// Seleção de músicas: os arquivos locais tocam dentro do próprio site.
const tracks = {
  'te-vivo': {
    title: 'Te Vivo',
    artist: 'Luan Santana',
    note: 'A trilha daquele 26 de setembro de 2026.',
    caption: 'A música do nosso pedido de namoro.',
    audio: 'assets/musicas/te-vivo.mp3'
  },
  'tudo-que-voce-quiser': {
    title: 'Tudo Que Você Quiser',
    artist: 'Luan Santana',
    note: 'Uma canção que também escolhi para acompanhar nossas lembranças.',
    caption: 'Uma das músicas que escolhi com carinho para este cantinho.',
    audio: 'assets/musicas/tudo-que-voce-quiser.mp3'
  },
  'meu-abrigo': {
    title: 'Meu Abrigo',
    artist: 'Melim',
    note: 'Uma música leve, para os dias em que você quiser um pouco de carinho.',
    caption: 'Para acompanhar os dias leves e as lembranças bonitas.',
    audio: 'assets/musicas/meu-abrigo.mp3'
  },
  'just-the-way-you-are': {
    title: 'Just the Way You Are',
    artist: 'Bruno Mars',
    note: 'Uma música que escolhi para lembrar o quanto você é especial.',
    caption: 'Porque você merece se lembrar do seu próprio valor.',
    audio: 'assets/musicas/just-the-way-you-are.mp3'
  }
};

let selectedTrackKey = 'te-vivo';
const musicAudio = $('musicAudio');
const audioToggle = $('audioToggle');
const audioToggleIcon = $('audioToggleIcon');
const audioSeek = $('audioSeek');
const audioCurrentTime = $('audioCurrentTime');
const audioDuration = $('audioDuration');
const audioStatus = $('audioStatus');

function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return minutes + ':' + String(remaining).padStart(2, '0');
}

function updateAudioButton() {
  const track = tracks[selectedTrackKey];
  const playing = !musicAudio.paused && !musicAudio.ended;
  audioToggleIcon.textContent = playing ? 'Ⅱ' : '▶';
  audioToggle.setAttribute('aria-label', (playing ? 'Pausar ' : 'Ouvir ') + track.title);
  audioToggle.title = (playing ? 'Pausar ' : 'Ouvir ') + track.title;
}

function updateAudioProgress() {
  const duration = musicAudio.duration;
  const current = Number.isFinite(musicAudio.currentTime) ? musicAudio.currentTime : 0;
  audioCurrentTime.textContent = formatAudioTime(current);
  audioDuration.textContent = formatAudioTime(duration);
  audioSeek.value = Number.isFinite(duration) && duration > 0
    ? String(Math.round((current / duration) * 1000))
    : '0';
}

function selectTrack(key, startPlayback = false) {
  if (!Object.prototype.hasOwnProperty.call(tracks, key)) return;

  selectedTrackKey = key;
  const track = tracks[key];

  document.querySelectorAll('[data-track]').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.dataset.track === key));
  });

  $('selectedTrackTitle').textContent = track.title;
  $('selectedTrackNote').textContent = track.artist + ' · ' + track.note;
  $('audioCaption').textContent = track.caption;

  if (musicAudio.dataset.track !== key) {
    musicAudio.pause();
    musicAudio.src = track.audio;
    musicAudio.dataset.track = key;
    musicAudio.load();
  }

  // Ao trocar o src, load() reinicia a faixa. Não definimos currentTime
  // antes de loadedmetadata, evitando InvalidStateError em alguns navegadores.
  updateAudioProgress();
  updateAudioButton();

  if (startPlayback) {
    audioStatus.textContent = 'Preparando ' + track.title + '…';
    const playPromise = musicAudio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        audioStatus.textContent = 'Não foi possível iniciar automaticamente. Toque no botão de play para ouvir.';
        updateAudioButton();
      });
    }
  } else {
    audioStatus.textContent = 'Toque no botão para ouvir esta música aqui no site.';
  }
}

audioToggle.addEventListener('click', () => {
  if (musicAudio.paused) {
    const playPromise = musicAudio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        audioStatus.textContent = 'Não foi possível reproduzir. Confira se a pasta assets/musicas está completa.';
      });
    }
  } else {
    musicAudio.pause();
  }
});

audioSeek.addEventListener('input', () => {
  if (Number.isFinite(musicAudio.duration) && musicAudio.duration > 0) {
    musicAudio.currentTime = (Number(audioSeek.value) / 1000) * musicAudio.duration;
    updateAudioProgress();
  }
});

musicAudio.addEventListener('play', () => {
  audioStatus.textContent = 'Tocando agora · ' + tracks[selectedTrackKey].title;
  updateAudioButton();
});
musicAudio.addEventListener('pause', () => {
  if (!musicAudio.ended && musicAudio.dataset.track) {
    audioStatus.textContent = 'Música pausada. Você pode continuar quando quiser.';
  }
  updateAudioButton();
});
musicAudio.addEventListener('timeupdate', updateAudioProgress);
musicAudio.addEventListener('loadedmetadata', updateAudioProgress);
musicAudio.addEventListener('durationchange', updateAudioProgress);
musicAudio.addEventListener('ended', () => {
  audioStatus.textContent = 'A música terminou. Você pode ouvir novamente quando quiser.';
  updateAudioButton();
  updateAudioProgress();
});
musicAudio.addEventListener('error', () => {
  audioStatus.textContent = 'Não foi possível carregar esta música. Confira se o arquivo está em assets/musicas.';
  updateAudioButton();
});

document.querySelectorAll('[data-track]').forEach(btn => {
  btn.addEventListener('click', () => selectTrack(btn.dataset.track, true));
});
selectTrack(selectedTrackKey, false);

// Evita que música e vídeos toquem ao mesmo tempo.
const videos = [...document.querySelectorAll('video')];
videos.forEach(video => video.addEventListener('play', () => {
  videos.forEach(other => { if (other !== video) other.pause(); });
  if (!musicAudio.paused) musicAudio.pause();
}));
musicAudio.addEventListener('play', () => videos.forEach(video => video.pause()));

// Cartinhas para diferentes momentos. Textos escritos para acolher, sem pedir respostas.
const letters = {
  triste: {
    title: 'Quando estiver triste',
    text: `Júlia,\n\nSe hoje estiver sendo um daqueles dias difíceis, queria que você se tratasse com carinho. Nem todo dia precisa terminar com tudo resolvido. Às vezes, tudo o que a gente consegue fazer é respirar, descansar um pouco e tentar de novo amanhã.\n\nNão diminua o seu valor por causa de um dia ruim, de uma fase confusa ou de algo que não saiu como você esperava. Você merece cuidado, respeito e paz.\n\nEspero que estas palavras sejam um abraço de longe. Que amanhã chegue mais leve e que você encontre motivos, mesmo pequenos, para sorrir.\n\nCom carinho,\nMurilo ♡`
  },
  feliz: {
    title: 'Quando estiver feliz',
    text: `Júlia,\n\nSe você abriu esta cartinha num dia feliz, então queria começar dizendo: aproveita. Aproveita muito. Ri alto, comemora, registra o momento e não tenha medo de ser feliz.\n\nMesmo de longe, eu torço para que a vida te dê muitos dias assim. Sua felicidade importa, e espero que você tenha sempre pessoas boas por perto para dividir as alegrias.\n\nQue essa felicidade não seja só de hoje. Que ela se repita em novas conquistas, viagens, encontros, sonhos realizados e coisas simples que fazem bem.\n\nFico feliz por você. De coração. ♡`
  },
  chorando: {
    title: 'Quando estiver chorando',
    text: `Ei, Júlia.\n\nRespira um pouquinho. Não precisa fingir que está tudo bem, nem encontrar uma solução para tudo agora. Se precisar chorar, chore. Sentir não é fraqueza.\n\nQueria que estas palavras chegassem como um carinho de longe: você não precisa carregar tudo sozinha. Se puder, procure alguém em quem confia, aceite um abraço, converse ou simplesmente fique perto de quem te faz bem.\n\nQue a dor passe no seu tempo e que você se lembre de que merece dias tranquilos, amor, cuidado e acolhimento.\n\nCuide de você. ♡`
  },
  saudade: {
    title: 'Quando sentir saudade',
    text: `Júlia,\n\nSe você veio até aqui porque sentiu saudade, talvez algumas lembranças tenham aparecido sem avisar. Eu conheço esse sentimento. Também sinto sua falta e não vou fingir que é simples esquecer alguém que foi tão importante.\n\nSe algum dia a saudade chegar em você também, espero que se lembre de mim com carinho. Não como uma obrigação, nem como um peso, mas como a lembrança de uma história que existiu e significou muito.\n\nVocê não precisa fazer nada com essa saudade. Pode apenas sentir, guardar o que foi bonito e seguir seu caminho no seu tempo.\n\nCom carinho,\nMurilo ♡`
  },
  conquista: {
    title: 'Quando conquistar algo',
    text: `Júlia,\n\nSe você chegou até esta cartinha porque conquistou algo, parabéns! Seja uma grande vitória ou um passo pequeno que só você sabe o quanto custou, reconheça o seu esforço. Você merece comemorar.\n\nEu espero que muitos dos seus planos deem certo. Que você encontre portas abertas, coragem para tentar de novo quando precisar e pessoas que vibrem por cada conquista sua.\n\nMesmo de longe, continuo torcendo por você. Que venham outras vitórias, outros sonhos e muitos motivos para sentir orgulho de si mesma.\n\nFico feliz por cada coisa boa que acontecer na sua vida. ♡`
  },
  duvida: {
    title: 'Quando duvidar de si mesma',
    text: `Júlia,\n\nNão deixe um momento de insegurança fazer você esquecer tudo o que é capaz de fazer. Você tem valor mesmo quando erra, mesmo quando está cansada e mesmo quando ainda não sabe qual caminho escolher.\n\nNão precisa comparar seu tempo com o de ninguém. Continue aprendendo, crescendo e acreditando nos seus passos. Você merece reconhecer a pessoa que está se tornando.\n\nTomara que, quando terminar de ler, você consiga olhar para si com um pouco mais de gentileza.\n\nAcredite em você. ♡`
  },
  historia: {
    title: 'Quando lembrar da nossa história',
    text: `Júlia,\n\nVocê foi meu primeiro amor. Por isso, existem lembranças que vou carregar comigo de um jeito muito especial. Lembro das fotos, dos vídeos, das brincadeiras e também do dia 26 de setembro de 2026, no show do Luan Santana, quando te pedi em namoro enquanto tocava “Te Vivo”.\n\nTalvez hoje a gente olhe para algumas coisas de lugares diferentes. Ainda assim, o que vivemos aconteceu. Fez parte da minha vida e me ensinou muito sobre amar, cuidar e me dedicar a alguém.\n\nEspero que você também consiga guardar o que foi bonito sem precisar esquecer o que aprendeu. Obrigado por ter feito parte dessa história. ♡`
  },
  principal: {
    title: 'Por que fiz este site',
    text: `Júlia,\n\nEu pensei muito em como poderia te mostrar tudo isso. Poderia mandar apenas uma mensagem, mas senti vontade de reunir aqui um pedaço da nossa história: nossas fotos, nossos vídeos, a música do nosso pedido e palavras que preparei pensando em diferentes momentos da sua vida.\n\nVocê foi meu primeiro amor. Foi a pessoa por quem mais me dediquei, por quem tentei fazer de tudo e com quem vivi momentos que nunca vou tratar como se não tivessem significado. Eu ainda te amo e sinto sua falta. Queria que você pudesse acreditar que o sentimento que tive por você foi verdadeiro. Não estou dizendo isso para te cobrar uma resposta ou para mudar a sua decisão. Só não queria deixar de te contar.\n\nO dia 26/09/2026 sempre vai ter um espaço especial na minha memória. No show do Luan Santana, ao som de “Te Vivo”, eu te pedi em namoro. Naquele instante, eu estava muito feliz por estar vivendo aquilo com você. Essa lembrança continua guardada em mim.\n\nSe um dia nossos caminhos seguirem separados, espero que você também sinta saudade em algum momento, como eu sinto. E, quando lembrar de mim, que seja com carinho. Quero que saiba que tudo o que preparei aqui foi feito de coração, para que essa parte da nossa história não se perca.\n\nVolte a este site quando quiser — num dia triste, feliz, quando estiver chorando, quando conquistar algo, quando sentir saudade ou simplesmente quando tiver vontade de rever uma lembrança. Leia uma cartinha quantas vezes precisar. Espero que alguma palavra te faça companhia e te lembre do quanto você é importante.\n\nMesmo de longe, vou continuar torcendo por você. Quero que seja feliz, que realize seus sonhos e que a vida te trate com carinho. Se você estiver bem, vou desejar que fique ainda melhor.\n\nVocê foi meu primeiro amor, Júlia. E tudo isso que fiz foi porque ainda não consegui esquecer o quanto você significou para mim.\n\nCom todo o meu amor e carinho,\nMurilo ♡`
  }
};
const letterDialog = $('letterDialog');
const dialogTitle = $('dialogLetterTitle');
const dialogText = $('dialogLetterText');
function openLetter(key) {
  const letter = letters[key];
  if (!letter) return;
  dialogTitle.textContent = letter.title;
  dialogText.textContent = letter.text;
  if (!letterDialog.open) letterDialog.showModal();
  $('closeLetterDialog').focus();
}
document.querySelectorAll('[data-letter]').forEach(btn => btn.addEventListener('click', () => openLetter(btn.dataset.letter)));
$('closeLetterDialog').addEventListener('click', () => letterDialog.close());
letterDialog.addEventListener('click', e => { if (e.target === letterDialog) letterDialog.close(); });

// Três toquinhos: uma lembrança simples e interativa do código de vocês.
let tapCount = 0;
let tapFinished = false;
const tapHeart = $('tapHeart');
const tapHint = $('tapHint');
tapHeart.addEventListener('click', () => {
  if (tapFinished) {
    tapFinished = false;
    tapCount = 0;
    tapHeart.textContent = '♡';
    tapHint.textContent = '0 de 3 toquinhos';
    tapHeart.setAttribute('aria-label', 'Dar um toquinho no coração, zero de três');
    return;
  }
  tapCount += 1;
  if (!reducedMotion) {
    tapHeart.classList.remove('pulse-tap');
    void tapHeart.offsetWidth;
    tapHeart.classList.add('pulse-tap');
  }
  if (navigator.vibrate) navigator.vibrate(tapCount === 3 ? [35, 60, 35] : 35);
  if (tapCount === 3) {
    tapFinished = true;
    tapHint.textContent = 'Três toquinhos. Eu te amo. ♡';
    tapHeart.textContent = '♥';
    tapHeart.setAttribute('aria-label', 'Três toquinhos: eu te amo. Toque para recomeçar');
  } else {
    tapHint.textContent = tapCount + ' de 3 toquinhos';
    tapHeart.textContent = '♡';
    tapHeart.setAttribute('aria-label', 'Dar um toquinho no coração, ' + tapCount + ' de três');
  }
});

$('year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window && !reducedMotion) {
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
  }), { threshold: .06 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}
