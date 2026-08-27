import { css } from '@symbiotejs/symbiote';

export default css`
tour-player {
  display: block;
  position: fixed;
  inset-block-end: var(--sn-step-5, 20px);
  inset-inline-end: var(--sn-step-5, 20px);
  background: var(--sn-sys-surface, var(--clr-1));
  border: 1px solid var(--sn-sys-outline, currentColor);
  border-radius: var(--sn-radius-md, 8px);
  padding: var(--sn-step-3, 12px);
  box-shadow: var(--sn-shadow-md, 0 4px 12px rgba(0,0,0,0.1));
  z-index: 10000;
  font: inherit;
}

tour-player .controls {
  display: flex;
  gap: var(--sn-step-2, 8px);
  align-items: center;
}

tour-player button {
  background: var(--sn-sys-accent, var(--pulse-accent));
  color: contrast-color(var(--sn-sys-accent, var(--pulse-accent)));
  border: none;
  border-radius: var(--sn-radius-sm, 4px);
  padding: var(--sn-step-1, 6px) var(--sn-step-3, 12px);
  cursor: pointer;
  font: inherit;
  font-size: var(--sn-body-size, 14px);
}

tour-player button:disabled {
  background: var(--sn-sys-on-surface-dim, var(--pulse-text-dim));
  cursor: not-allowed;
}

tour-player button[stop] {
  background: var(--sn-sys-error);
  color: contrast-color(var(--sn-sys-error));
}
`;
