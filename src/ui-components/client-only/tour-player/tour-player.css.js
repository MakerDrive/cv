import { css } from '@symbiotejs/symbiote';

export default css`
  tour-player {
    display: block;
    min-block-size: 100%;
    padding: var(--sn-step-6);
    color: var(--sn-sys-on-surface);
    background: var(--sn-sys-surface);

    & section {
      display: grid;
      gap: var(--sn-step-4);
    }

    & section[hidden] {
      display: none;
    }

    & header,
    & .tour-start-actions,
    & .tour-controls {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--sn-step-3);
    }

    & header {
      justify-content: space-between;
    }

    & h2,
    & p {
      margin: 0;
    }

    & h2 {
      font-size: var(--sn-text-lg);
      font-weight: 600;
    }

    & p,
    & output {
      font-size: var(--sn-text-sm);
      line-height: 1.55;
    }

    & .tour-description {
      min-block-size: calc(var(--sn-step-12) * 2);
      padding: var(--sn-step-4);
      border-inline-start: var(--sn-step-1) solid var(--sn-sys-primary);
      background: color-mix(in srgb, var(--sn-sys-primary) 8%, transparent);
    }

    & .tour-status:empty {
      display: none;
    }

    & .tour-error {
      color: var(--sn-sys-error, currentColor);
    }

    & button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-block-size: max(44px, var(--sn-button-min-height));
      min-inline-size: 44px;
      padding: var(--sn-button-padding);
      border: var(--sn-button-border-style, solid) var(--sn-button-border-width, thin) var(--sn-button-border);
      border-radius: var(--sn-button-radius);
      background: var(--sn-button-bg);
      color: var(--sn-button-color);
      font: inherit;
      cursor: pointer;
    }

    & [hidden] {
      display: none;
    }

    & button:hover {
      border-color: var(--sn-button-hover-border);
      background: var(--sn-button-hover-bg);
    }

    & button:focus-visible {
      outline: var(--sn-button-focus-ring);
      outline-offset: var(--sn-step-1);
    }

    & button:disabled {
      opacity: var(--sn-button-disabled-opacity);
      cursor: not-allowed;
    }

    & [data-tour-action="short"] {
      border-color: var(--sn-button-primary-border);
      background: var(--sn-button-primary-bg);
      color: var(--sn-button-primary-color);
    }

    & .material-symbols-outlined {
      font-size: var(--sn-button-icon-font-size);
    }

    @media (max-width: 520px) {
      & {
        padding: var(--sn-step-4);
      }

      & .tour-start-actions > button {
        flex: 1 1 100%;
      }

      & .tour-controls {
        justify-content: space-between;
      }
    }
  }
`;
