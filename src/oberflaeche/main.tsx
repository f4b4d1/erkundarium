import { render } from 'preact';

const wurzel = document.getElementById('app');
if (!wurzel) {
  throw new Error('Element #app fehlt in index.html');
}

render(<h1>Erkundarium</h1>, wurzel);
