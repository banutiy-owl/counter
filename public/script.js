const counterEl = document.getElementById('counter');
const statsEl = document.getElementById('stats');
let currentCount = 0;

const quackSound = new Audio("/quack.mp3");

document.getElementById('quack-button').addEventListener('click', () => {
  quackSound.currentTime = 0;
  quackSound.play().catch(e => console.error("Sound play error:", e));
});


/*
const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  transparent: true,
  backgroundAlpha: 0,
  resizeTo: window
});

app
  .init()
  .then(async () => {
    const container = document.getElementById('duck-container');
    if (!container) {
      console.error('Element #duck-container not found');
      return;
    }

    container.appendChild(app.view);
 const canvas = app.view;
 app.renderer.style.background="rgba(0,0,0,0.1)"
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.background = 'transparent';
    canvas.style.zIndex = '1';



    const duckTexture = await PIXI.Assets.load(
      "https://cdn-icons-png.flaticon.com/512/1521/1521260.png"
    );

    const duck = new PIXI.Sprite(duckTexture);
    duck.anchor.set(0.5);
    duck.width = 72;
    duck.height = 64;
    duck.x = 100;
    duck.y = 100;

    app.stage.addChild(duck);

    let dx = 2, dy = 1.5;

    app.ticker.add(() => {
      duck.x += dx;
      duck.y += dy;

      if (duck.x < 32 || duck.x > window.innerWidth - 32) dx *= -1;
      if (duck.y < 32 || duck.y > window.innerHeight - 32) dy *= -1;
    });
  })
  .catch(err => {
    console.error("PIXI app initialization failed:", err);
  });
*/


let emojiTrailEnabled = false;
let emojiListener = null;

function enableEmojiTrail() {
  if (emojiListener) return; 

  emojiListener = (e) => {
    const emoji = document.createElement('span');
    emoji.textContent = '✨';
    emoji.style.position = 'absolute';
    emoji.style.left = `${e.pageX}px`;
    emoji.style.top = `${e.pageY}px`;
    emoji.style.fontSize = '20px';
    emoji.style.pointerEvents = 'none';
    emoji.style.transition = 'opacity 0.5s ease';
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 500);
  };

  document.addEventListener('mousemove', emojiListener);
}

function disableEmojiTrail() {
  if (emojiListener) {
    document.removeEventListener('mousemove', emojiListener);
    emojiListener = null;
  }
}

document.getElementById('toggleEmojiTrail').addEventListener('click', () => {
  emojiTrailEnabled = !emojiTrailEnabled;
  if (emojiTrailEnabled) {
    enableEmojiTrail();
  } else {
    disableEmojiTrail();
  }
});

let duckTrailEnabled = false;
let duckListener = null;

function enableDuckTrail() {
  if (duckListener) return;

  duckListener = (e) => {
    const duck = document.createElement('span');
    duck.textContent = '🦆';
    duck.style.position = 'absolute';
    duck.style.left = `${e.pageX}px`;
    duck.style.top = `${e.pageY}px`;
    duck.style.fontSize = '20px';
    duck.style.pointerEvents = 'none';
    duck.style.transition = 'opacity 0.5s ease';
    document.body.appendChild(duck);
    setTimeout(() => duck.remove(), 500);
  };

  document.addEventListener('mousemove', duckListener);
}

function disableDuckTrail() {
  if (duckListener) {
    document.removeEventListener('mousemove', duckListener);
    duckListener = null;
  }
}

document.getElementById('toggleDuckTrail').addEventListener('click', () => {
  duckTrailEnabled = !duckTrailEnabled;
  if (duckTrailEnabled) {
    enableDuckTrail();
  } else {
    disableDuckTrail();
  }
});



function changeCounter(delta) {
  fetch('/api/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta }),
  })
    .then(res => res.json())
    .then(data => {
      currentCount = data.count;
      counterEl.textContent = currentCount;
      flareBackground();
      loadStats();
    });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function loadStats() {
  fetch('/api/stats')
    .then(res => res.json())
    .then(data => {
      statsEl.innerHTML = '<h3>Daily stats</h3>';
      const sorted = Object.entries(data).sort((a, b) => new Date(b[0]) - new Date(a[0]));

      sorted.forEach(([date, count]) => {
        const el = document.createElement('div');
        el.className = 'stat-entry';

        const rawDate = new Date(date);

        const dayEl = document.createElement('span');
        dayEl.className = 'stat-day';
        dayEl.textContent = rawDate.getDate().toString().padStart(2, '0');

        const monthEl = document.createElement('span');
        monthEl.className = 'stat-month';
        monthEl.textContent = rawDate.toLocaleString('en-GB', { month: 'long' });

        const yearEl = document.createElement('span');
        yearEl.className = 'stat-year';
        yearEl.textContent = rawDate.getFullYear();

        const dateEl = document.createElement('span');
        dateEl.className = 'stat-date';
        dateEl.appendChild(dayEl);
        dateEl.appendChild(document.createTextNode(' '));
        dateEl.appendChild(monthEl);
        dateEl.appendChild(document.createTextNode(' '));
        dateEl.appendChild(yearEl);


        const countEl = document.createElement('span');
        countEl.className = 'stat-count';
        countEl.textContent = count.toLocaleString(); // makes it like 1,234

        el.appendChild(dateEl);
        el.appendChild(countEl);
        statsEl.appendChild(el);

      });

      const today = new Date().toISOString().split('T')[0];
      currentCount = data[today] || 0;
      counterEl.textContent = currentCount;
    });
}

function flareBackground() {
  const body = document.body;
  body.classList.remove('rainbow');
  void body.offsetWidth; // Force reflow
  requestAnimationFrame(() => {
    body.classList.add('rainbow');
  });
  setTimeout(() => {
    body.classList.remove('rainbow');
    body.style.backgroundColor = 'green';
  }, 2000);
}

function restartCounter() {
  const input = document.getElementById('startValue').value;
  const newValue = input === '' ? 0 : parseInt(input, 10);

  fetch('/api/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta: -currentCount + newValue }),
  })
    .then(res => res.json())
    .then(data => {
      currentCount = data.count;
      counterEl.textContent = currentCount;
      flareBackground();
      loadStats();
    });
}

window.onload = () => {
  loadStats();
};
