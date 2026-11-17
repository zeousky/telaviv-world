import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

const location = (path) => new URL(path, import.meta.url);
const site = new URL(process.env.RECORD_URL || 'https://telaviv.world/');
const siteBase = site.pathname.replace(/\/$/, '');
const releaseDate = '15 November 2026';
const subjectInfo = [
  {
    id: 'netanyahu',
    first: 'Benjamin',
    last: 'Netanyahu',
    country: 'Israel',
    date: '21 October 1949',
    photoYear: '2009',
    photoHeight: 1134,
    selection: 'The president asks a Knesset member to try to form a government. That cabinet has to win the Knesset’s confidence.',
    rules: ['Knesset · Basic Law and government formation', 'https://main.knesset.gov.il/en/about/lexicon/pages/formation-government.aspx'],
    office: 'Prime Minister of Israel',
    terms: '1996–1999, 2009–2021, from 2022',
    background: 'The army, then diplomacy',
    firstOffice: 'Prime minister, 1996',
    description: 'A commando who became UN ambassador, then prime minister three separate times. The page runs through Oslo, the corruption trial, and the wars that followed.',
    photo: 'https://commons.wikimedia.org/wiki/File:Netanyahu_official_portrait.jpg',
    credit: 'Avi Ohayon / Government Press Office of Israel',
    license: ['CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/'],
  },
  {
    id: 'trump',
    first: 'Donald',
    last: 'Trump',
    country: 'United States',
    date: '14 June 1946',
    photoYear: '2025',
    photoHeight: 1063,
    selection: 'Voters choose electors, and the Electoral College picks the president for four years. The Twenty-Second Amendment says a person can be elected only twice.',
    rules: ['National Archives · Electoral College and constitutional rules', 'https://www.archives.gov/electoral-college/provisions'],
    office: 'President of the United States',
    terms: '2017–2021, from 2025',
    background: 'Property, then television',
    firstOffice: 'President, 2017',
    description: 'A developer from Queens who became a television star, then president twice, with two impeachments in between.',
    photo: 'https://commons.wikimedia.org/wiki/File:Official_Presidential_Portrait_of_President_Donald_J._Trump_(2025).jpg',
    credit: 'Daniel Torok / White House',
  },
  {
    id: 'putin',
    first: 'Vladimir',
    last: 'Putin',
    country: 'Russia',
    date: '7 October 1952',
    photoYear: '2024',
    photoHeight: 1196,
    selection: 'Russians elect the president directly, for six years. A 2020 change left Putin’s earlier terms out of the new two-term limit.',
    rules: ['Russian Constitution · Article 81', 'https://www.minjust.gov.ru/ru/documents/8011/'],
    office: 'President of Russia',
    terms: '2000–2008, from 2012',
    background: 'The KGB, then city hall',
    firstOffice: 'Acting president, 1999',
    description: 'A KGB officer who has run Russia for most of this century, including the full-scale war in Ukraine.',
    photo: 'https://commons.wikimedia.org/wiki/File:Vladimir_Putin_portrait_(2024-02-23).png',
    credit: 'Kremlin.ru, with crop by You for Me and Me for You',
    license: ['CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  },
];

const subjects = await Promise.all(subjectInfo.map(async (subject) => ({
  ...subject,
  name: subject.first + ' ' + subject.last,
  path: '/' + subject.id + '/',
  ...JSON.parse(await readFile(location('./record-data/' + subject.id + '.json'), 'utf8')),
})));

const crossings = [
  {
    date: '9 May 2018',
    title: 'Netanyahu and Putin meet in Moscow',
    detail: 'Netanyahu went to Russia’s Victory Day parade and met Putin at the Kremlin. Israel’s write-up of the visit says he raised Iran’s military presence in Syria.',
    source: ['Israeli Prime Minister’s Office', 'https://www.gov.il/en/pages/event_putin090518'],
  },
  {
    date: '16 July 2018',
    title: 'Trump and Putin meet in Helsinki',
    detail: 'After the summit they took questions together. Syria, nuclear weapons and Russian election interference all came up. Putin said Russia had not interfered. Trump said both of them had talked with Netanyahu about Israeli security in Syria.',
    source: ['Joint press conference transcript', 'https://www.govinfo.gov/content/pkg/DCPD-201800488/html/DCPD-201800488.htm'],
    photo: 'helsinki',
    alt: 'Donald Trump and Vladimir Putin look at one another at the Helsinki summit',
    credit: 'Shealah Craighead / White House',
    photoLink: 'https://commons.wikimedia.org/wiki/File:President_Donald_J._Trump_and_President_Vladimir_Putin_of_the_Russian_Federation_on_July_16,_2018.jpg',
  },
  {
    date: '15 September 2020',
    title: 'The Abraham Accords are signed',
    detail: 'Trump hosted Netanyahu and the foreign ministers of the United Arab Emirates and Bahrain at the White House. The agreements opened formal ties between Israel and those two countries.',
    source: ['Signing ceremony transcript', 'https://trumpwhitehouse.archives.gov/briefings-statements/remarks-president-trump-prime-minister-netanyahu-minister-bin-zayed-minister-al-zayani-abraham-accords-signing-ceremony/'],
    photo: 'accords',
    alt: 'Trump, Netanyahu and the foreign ministers of Bahrain and the United Arab Emirates sign documents at the White House',
    credit: 'Tia Dufour / White House',
    photoLink: 'https://commons.wikimedia.org/wiki/File:President_Trump_and_The_First_Lady_Participate_in_an_Abraham_Accords_Signing_Ceremony_(50345684418).jpg',
  },
  {
    date: '28 February 2026',
    title: 'The United States and Israel strike Iran',
    detail: 'Trump and Netanyahu were both in office when the United States and Israel began joint strikes on Iran. The UN Security Council held an emergency meeting the same day.',
    source: ['United Nations Security Council meeting record', 'https://digitallibrary.un.org/record/4105294/files/S_PV.10112-EN.pdf'],
  },
];

const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const items = (list, render) => list.map(render).join('\n');
const link = (label, url) => '<a href="' + escape(url) + '">' + escape(label) + '</a>';
const external = (label, url) => link(label, url);

function header(current) {
  const pages = [
    ['People', '/#people', ['/', '/netanyahu/', '/trump/', '/putin/']],
    ['Years', '/timeline/', ['/timeline/']],
    ['Sources', '/sources/', ['/sources/']],
  ];
  return '<a class="skip" href="#main">Skip to content</a><header class="masthead"><div class="wrap masthead-inner">' +
    '<div class="masthead-name"><a class="brand" href="/">The Public Record</a>' +
    '<span class="edition">Edition of ' + releaseDate + '</span></div>' +
    '<nav class="mastnav" aria-label="Main navigation">' + items(pages, ([label, url, matches]) =>
      '<a href="' + url + '"' + (matches.includes(current) ? ' aria-current="page"' : '') + '>' + label + '</a>'
    ) + '</nav></div></header>';
}

function footer() {
  return '<footer class="footer"><div class="wrap footer-inner"><p class="footer-brand"><a href="/">The Public Record</a></p>' +
    '<p>Checked through ' + releaseDate + '</p><nav aria-label="Footer navigation">' +
    '<a href="/sources/#method">How this was written</a><a href="/sources/#photography">Photo credits</a></nav></div></footer>';
}

function page({ title, description, path, content }) {
  const canonical = escape(site.origin + siteBase + path);
  const markup = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<meta name="text-scale" content="scale">' +
    '<meta name="theme-color" content="#f5efdf"><title>' + escape(title) + '</title>' +
    '<meta name="description" content="' + escape(description) + '">' +
    '<meta property="og:title" content="' + escape(title) + '">' +
    '<meta property="og:description" content="' + escape(description) + '">' +
    '<meta property="og:url" content="' + canonical + '"><link rel="canonical" href="' + canonical + '">' +
    '<link rel="icon" href="/record/favicon.png" type="image/png">' +
    '<link rel="stylesheet" href="/record/record.css?v=newsprint">' +
    '</head><body>' + header(path) + content + footer() + '</body></html>\n';
  return markup.replace(/\b(href|src)="\/(?!\/)/g, '$1="' + escape(siteBase) + '/');
}

function portrait(subject, alt = '') {
  return '<img class="person-photo" data-subject="' + subject.id + '" src="/record/' + subject.id +
    '.webp" alt="' + escape(alt) + '" width="850" height="' + subject.photoHeight + '" decoding="async">';
}

const findCrossing = (photo) => crossings.find((event) => event.photo === photo);
const photo = (record, lazy = true) =>
  '<figure class="archive-photo"><div class="photo-frame"><img src="/record/' + record.photo + '.webp" alt="' +
  escape(record.alt) + '" width="' + (record.photo === 'helsinki' ? 955 : 1000) + '" height="' +
  (record.photo === 'helsinki' ? 717 : 667) + '"' + (lazy ? ' loading="lazy"' : '') + ' decoding="async"></div>' +
  '<figcaption>' + escape(record.date) + ' · ' + external(record.credit, record.photoLink) + '</figcaption></figure>';

const home = page({
  title: 'The Public Record — Netanyahu, Trump and Putin',
  description: 'Plain-language biographies of Netanyahu, Trump and Putin, plus a shared timeline and the documents behind them.',
  path: '/',
  content: '<main id="main"><div class="wrap">' +
    '<section class="front-page" aria-labelledby="front-title"><header class="intro">' +
    '<p class="dateline">Biographies · 1946–2026</p>' +
    '<h1 id="front-title">Three long careers, with the paperwork attached.</h1>' +
    '<p class="deck">Benjamin Netanyahu, Donald Trump and Vladimir Putin. Where they came from, how they held the job, and the documents behind the parts people still argue about.</p>' +
    '<div class="front-links"><a class="front-action" href="#people">Read the biographies</a>' +
    '<a class="more" href="/timeline/">Explore the timeline</a></div></header>' +
    photo(findCrossing('helsinki'), false) + '</section>' +
    '<section class="people" id="people" aria-labelledby="people-title"><h2 id="people-title">The biographies</h2><div class="people-grid">' +
    items(subjects, (subject) =>
      '<a class="person" href="' + subject.path + '">' + portrait(subject, '') +
      '<div><p class="where">' + subject.country + '</p><h3>' + subject.name + '</h3><p>' +
      escape(subject.description) + '</p><span class="more">Read the biography</span></div></a>'
    ) + '</div></section>' +
    '<section class="cross" aria-labelledby="cross-title"><div><p class="dateline">The overlap</p>' +
    '<h2 id="cross-title">When they ended up in the same story</h2>' +
    '<p class="deck">Helsinki is the photo everyone remembers. The year-by-year list also has the Abraham Accords, and the 2026 strikes on Iran.</p>' +
    '<a class="more" href="/timeline/">See the years side by side</a></div>' +
    photo(findCrossing('accords')) + '</section></div></main>',
});

function profile(subject, index) {
  return page({
    title: subject.name + ' — The Public Record',
    description: subject.description,
    path: subject.path,
    content: '<main id="main"><div class="wrap"><p class="profile-top"><a class="backlink" href="/#people">Back to the three</a></p>' +
      '<header class="profile-head"><p class="where">' + subject.country + '</p><h1>' + subject.name + '</h1>' +
      '<p class="deck">' + escape(subject.description) + '</p><p class="updated">Last checked ' + releaseDate + '</p></header>' +
      '<figure class="shot"><img class="person-photo" data-subject="' + subject.id + '" src="/record/' + subject.id +
      '.webp" alt="Portrait of ' + escape(subject.name) + '" width="850" height="' + subject.photoHeight + '" decoding="async">' +
      '<figcaption>' + subject.photoYear + '. ' + external(subject.credit, subject.photo) + '</figcaption></figure>' +
      '<dl class="facts"><div><dt>Born</dt><dd>' + subject.date + '</dd></div><div><dt>The job</dt><dd>' + subject.office +
      '</dd></div><div><dt>Years in it</dt><dd>' + subject.terms + '</dd></div></dl>' +
      '<div class="reading"><nav class="contents" aria-label="Chapters"><p>On this page</p>' +
      '<ol>' + items(subject.chapters, ({ id, title }) => '<li>' + link(title, '#' + id) + '</li>') + '</ol>' +
      '<a class="related-link" href="/timeline/?person=' + subject.id + '#events">' + subject.last + ' on the timeline</a></nav>' +
      '<article class="article" aria-label="' + subject.name + ' biography">' +
      items(subject.chapters, (chapter) =>
        '<section class="chapter" id="' + escape(chapter.id) + '"><p class="chapter-period">' + escape(chapter.period) +
        '</p><h2>' + escape(chapter.title) + '</h2>' +
        items(chapter.paragraphs, (paragraph) => '<p class="chapter-copy">' + escape(paragraph) + '</p>') +
        '<details class="chapter-sources"><summary>Where this comes from <span>(' + chapter.sources.length + ')</span></summary><ul>' +
        items(chapter.sources, ({ label, url }) => '<li>' + external(label, url) + '</li>') + '</ul></details></section>'
      ) + '</article></div><section class="read-next"><h2>The other two</h2><div>' +
      items(subjects.filter((_, otherIndex) => index !== otherIndex), (other) =>
        '<a href="' + other.path + '"><span class="where">' + other.country + '</span>' + other.name + '</a>'
      ) + '</div></section></div></main>',
  });
}

const timelineEvents = subjects.flatMap((subject) => subject.events.map(([year, title, detail]) => ({
  subject, year, title, detail,
}))).sort((a, b) => Number.parseInt(a.year) - Number.parseInt(b.year));

const timeline = page({
  title: 'The years — The Public Record',
  description: 'One chronology for Netanyahu, Trump and Putin, including the moments their governments crossed.',
  path: '/timeline/',
  content: '<main id="main"><div class="wrap"><header class="page-intro"><p class="dateline">' +
    escape(String(timelineEvents[0].year)) + ' to 2026</p><h1>The years</h1>' +
    '<p class="deck">One list for all three. Narrow it to one person, or search for a war, a city, a court.</p>' +
    '<div class="jump-links"><a href="#events">Everything</a><a href="#crossings">The meetings</a><a href="#offices">The jobs</a></div></header>' +
    '<section id="events" class="timeline-section"><div class="section-head"><h2>What happened</h2></div>' +
    '<div class="timeline-tools" hidden><div class="filters" role="group" aria-label="Filter by person">' +
    '<button type="button" data-filter="all" aria-pressed="true">All three</button>' +
    items(subjects, (subject) => '<button type="button" data-filter="' + subject.id + '" aria-pressed="false">' + subject.last + '</button>') +
    '</div><label class="timeline-search"><span class="sr-only">Search the years</span><input type="search" placeholder="Search a year or a name" autocomplete="off"></label></div>' +
    '<p class="event-count" role="status" hidden></p><ol class="timeline-list">' + items(timelineEvents, ({ subject, year, title, detail }) =>
      '<li class="event" data-person="' + subject.id + '"><span class="event-year">' + escape(year) +
      '</span><div><a class="event-person" href="' + subject.path + '">' + subject.name + '</a><h3>' +
      escape(title) + '</h3><p>' + escape(detail) + '</p></div></li>'
    ) + '</ol></section>' +
    '<section class="shared-events" id="crossings"><div class="section-head"><h2>The meetings</h2><p>Times their governments showed up in the same story.</p></div><div class="crossing-grid">' +
    items(crossings, (event) =>
      '<article class="crossing">' + (event.photo ? photo(event) : '') + '<p class="dateline">' +
      event.date + '</p><h3>' + event.title + '</h3><p>' + event.detail + '</p><p class="crossing-source">' +
      external(...event.source) + '</p></article>'
    ) + '</div></section>' +
    '<section class="offices" id="offices"><div class="section-head"><h2>The jobs, side by side</h2></div><div class="office-grid">' +
    items(subjects, (subject) =>
      '<article><p class="where">' + subject.country + '</p><h3>' + link(subject.name, subject.path) +
      '</h3><dl><div><dt>Started in</dt><dd>' + subject.background + '</dd></div><div><dt>First reached the top</dt><dd>' +
      subject.firstOffice + '</dd></div><div><dt>Time in the job</dt><dd>' + subject.terms +
      '</dd></div><div><dt>How the job is filled</dt><dd>' + escape(subject.selection) +
      '</dd></div></dl><p class="crossing-source">' + external(...subject.rules) + '</p></article>'
    ) + '</div></section></div><script type="module" src="/record/timeline.js"></script></main>',
});

const sources = page({
  title: 'Sources — The Public Record',
  description: 'The court rulings, election counts, interviews and news reports behind the three biographies.',
  path: '/sources/',
  content: '<main id="main"><div class="wrap"><header class="page-intro"><p class="dateline">The paperwork</p>' +
    '<h1>Where it comes from</h1><p class="deck">Court rulings, election counts, interviews and news reports. Each chapter has its own list. If something is still an allegation, the page says so.</p>' +
    '<div class="jump-links">' + items(subjects, (subject) => link(subject.last, '#' + subject.id)) +
    '<a href="#other-records">Shared events</a><a href="#photography">Photos</a></div></header>' +
    '<div class="source-columns">' + items(subjects, (subject) =>
      '<section class="source-group" id="' + subject.id + '"><p class="where">' + subject.country +
      '</p><h2>' + subject.name + '</h2><ul>' +
      items([...new Map(subject.chapters.flatMap((chapter) => chapter.sources).map((source) => [source.url, source])).values()], ({ label, url }) =>
        '<li>' + external(label, url) + '</li>'
      ) + '</ul><p>' + link('Read the biography', subject.path) + '</p></section>'
    ) + '</div>' +
    '<section class="source-method" id="other-records"><h2>Shared events</h2><ul>' +
    items(crossings, (event) => '<li>' + escape(event.title) + '. ' + external(...event.source) + '</li>') +
    '</ul></section><section class="source-method" id="method"><h2>How this was written</h2>' +
    '<p>Each biography runs from childhood to the latest events we cover, and each chapter links the documents it uses. Charges, verdicts, denials and official claims are labeled as what they are. When a government is stating its own position, and that position is disputed, the page says whose position it is.</p>' +
    '<p>We stopped adding new events on ' + releaseDate + '. These are the big public roles and the documented turning points, not every headline.</p></section>' +
    '<section class="source-method" id="photography"><h2>Photos</h2><ul>' +
    items(subjects, (subject) =>
      '<li>' + external(subject.name + ' portrait', subject.photo) + '. ' + escape(subject.credit) + ', ' + subject.photoYear +
      '. ' + (subject.license ? link(...subject.license) : 'Public domain') + '</li>'
    ) + items(crossings.filter((event) => event.photo), (event) =>
      '<li>' + external(event.title, event.photoLink) + '. ' + escape(event.credit) + '. Public domain</li>'
    ) + '</ul><p>The portraits are in color, cropped so the face sits in the frame. The older photos are resized for the page.</p></section></div></main>',
});

const output = location('./record-public/');
await mkdir(output, { recursive: true });
await cp(location('./record-assets/'), new URL('record/', output), { recursive: true });
await Promise.all([
  ['/', home], ['/timeline/', timeline], ['/sources/', sources],
  ...subjects.map((subject, index) => [subject.path, profile(subject, index)]),
].map(async ([path, markup]) => {
  const directory = new URL('.' + path, output);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), markup);
}));
