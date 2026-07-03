import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root element was not found.');
}

app.innerHTML = `
  <section class="page-shell">
    <p class="eyebrow">Vite + TypeScript</p>
    <h1>LLM Request Pipeline Challenge</h1>
    <p class="intro">
      A tiny one-page scaffold running through Vite, ready for the first feature.
    </p>
  </section>
`;
