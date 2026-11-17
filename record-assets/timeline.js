const controls = document.querySelector('.timeline-tools');
const filters = [...controls.querySelectorAll('[data-filter]')];
const search = controls.querySelector('input');
const summary = document.querySelector('.event-count');
const events = [...document.querySelectorAll('.event')];
const query = new URLSearchParams(location.search);
const people = filters.map((button) => button.dataset.filter);
let selected = people.includes(query.get('person')) ? query.get('person') : 'all';
search.value = query.get('q') ?? '';

function render() {
  const words = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  for (const button of filters) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === selected));
  }

  let count = 0;
  for (const event of events) {
    const text = event.textContent.toLowerCase();
    const match = (selected === 'all' || event.dataset.person === selected) &&
      words.every((word) => text.includes(word));
    event.hidden = !match;
    if (match) count++;
  }

  summary.textContent = count === 0
    ? 'Nothing matches that. Try another name, or a shorter search.'
    : count + (count === 1 ? ' entry' : ' entries');
}

function update() {
  if (selected === 'all') query.delete('person');
  else query.set('person', selected);
  if (search.value.trim()) query.set('q', search.value.trim());
  else query.delete('q');

  const params = query.toString();
  history.replaceState(null, '', location.pathname + (params ? '?' + params : '') + location.hash);
  render();
}

for (const button of filters) {
  button.addEventListener('click', () => {
    selected = button.dataset.filter;
    update();
  });
}
search.addEventListener('input', update);
controls.hidden = false;
summary.hidden = false;
render();
