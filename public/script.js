const counterEl = document.getElementById('counter');
const statsEl = document.getElementById('stats');
let currentCount = 0;

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
      statsEl.innerHTML = '<h3>Daily Stats</h3>';
      const sorted = Object.entries(data).sort((a, b) => new Date(b[0]) - new Date(a[0]));

      sorted.forEach(([date, count]) => {
        const el = document.createElement('div');
        el.textContent = `${formatDate(date)}: ${count}`;
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
