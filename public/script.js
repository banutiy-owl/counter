const counterEl = document.getElementById('counter');
const statsEl = document.getElementById('stats');
let currentCount = 0;

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
