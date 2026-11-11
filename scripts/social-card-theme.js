import styles from '../src/static-pages/css/notchset.css.js';

let token = (name) => {
  let value = styles.match(new RegExp(`--notchset-${name}:\\s*([^;]+);`))?.[1];
  if (!value) throw new Error(`Missing Notchset ${name} token; update the social card theme reader.`);
  return value.trim();
};

export const SOCIAL_CARD_THEME = Object.freeze({
  paper: token('background'),
  ink: token('foreground'),
  surface: token('card'),
  signal: token('signal'),
  muted: token('muted-foreground'),
});

export const SOCIAL_CARD_DISPLAY_AXES = Object.freeze({
  wght: Number.parseFloat(token('heading-weight')),
  wdth: Number.parseFloat(token('heading-width')),
});

export const SOCIAL_CARD_MONO_AXES = Object.freeze({
  wght: Number.parseFloat(token('control-weight')),
  wdth: 100,
});
