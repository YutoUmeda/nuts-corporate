// 年表示
document.getElementById('year').textContent = new Date().getFullYear().toString();

// Intersection Observer: 汎用reveal
const io = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

// 初期reveal対象
document.querySelectorAll('.reveal').forEach(el => {
  // 個別delay（データ属性で指定）
  const delay = el.getAttribute('data-delay');
  if (delay) el.style.transitionDelay = `${parseInt(delay, 10)}ms`;
  io.observe(el);
});

// スタッガー: .stagger-group 内の .reveal を順次遅延
document.querySelectorAll('.stagger-group').forEach(group => {
  const items = group.querySelectorAll('.reveal');
  items.forEach((el, i) => {
    // data-delayがあればそれを優先
    if (!el.getAttribute('data-delay')) {
      el.style.transitionDelay = `${i * 90}ms`;
    }
    io.observe(el);
  });
});

// 数値カウントアップ（可視時に1回だけ）
function countUp(el, duration = 700) {
  const target = parseInt(el.dataset.target || el.textContent, 10);
  const startVal = 0;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const val = Math.floor(startVal + (target - startVal) * p);
    el.textContent = val.toString().padStart(2, '0');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const ioCount = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      countUp(e.target);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.countup').forEach(el => ioCount.observe(el));
