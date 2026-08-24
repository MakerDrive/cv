import { css } from '@symbiotejs/symbiote';

export default css`
client-counter {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;

  .value {
    min-width: 2em;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  button {
    padding: 0.35em 0.75em;
    border: none;
    border-radius: var(--sn-radius-sm, 4px);
    background: var(--sn-sys-accent);
    color: contrast-color(var(--sn-sys-accent));
    font-size: 1rem;
    cursor: pointer;

    &:hover {
      opacity: 0.85;
    }
  }
}
`;
