import { render } from 'preact';
import { lokalerSpeicher } from '../speicher/lokaler-speicher.ts';
import { Anwendung } from './anwendung.tsx';

const wurzel = document.getElementById('app');
if (!wurzel) {
  throw new Error('Element #app fehlt in index.html');
}

render(<Anwendung speicher={lokalerSpeicher()} />, wurzel);
