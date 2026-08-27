export default /*css*/ `
side-panel {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  display: flex;
  flex-flow: column;
  background-color: var(--sn-sys-surface, var(--clr-1));
  color: var(--sn-sys-on-surface, var(--clr-2));
  z-index: 10000;
  padding: var(--sn-step-4, var(--gap-mid));
  gap: var(--sn-step-4, var(--gap-mid));
  min-width: 240px;
  box-shadow: var(--sn-shadow-md, 0 0 6px 2px rgba(0, 0, 0, 0.2));
  transform: translateX(calc(-100% + var(--sn-size-md, var(--ui-size))));
  transition: var(--sn-transition-normal, 0.3s);
  border-right: var(--sn-size-md, var(--ui-size)) solid var(--sn-sys-on-surface, var(--clr-2));
  cursor: pointer;

  &:focus-within {
    transform: translateX(0);
    border-right: var(--sn-border-width, 2px) solid var(--sn-sys-on-surface, var(--clr-2));
    cursor: default;

    [collapsed-btn] {
      opacity: 0;
    }
  }

  a {
    display: flex;
    gap: var(--sn-step-4, var(--gap-mid));
    align-items: center;
    height: var(--sn-size-md, var(--ui-size));
    background-color: var(--sn-sys-surface, var(--clr-1));
    color: var(--sn-sys-on-surface, var(--clr-2));
    align-items: center;
    padding-left: var(--sn-step-4, var(--gap-mid));
    padding-right: var(--sn-step-8, var(--gap-max));
    cursor: pointer;
    text-decoration: none;
    border: var(--sn-border-width, 2px) solid transparent;
    transition: var(--sn-transition-normal, 0.3s);

    &[current] {
      background-color: var(--sn-sys-on-surface, var(--clr-2));
      color: var(--sn-sys-surface, var(--clr-1));
      pointer-events: none;
    }

    &:hover {
      border: var(--sn-border-width, 2px) solid var(--sn-sys-on-surface, var(--clr-2));
    }
  }

  [collapsed-btn] {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 50%;
    right: calc(-1 * var(--sn-size-md, var(--ui-size)));
    width: var(--sn-size-md, var(--ui-size));
    height: var(--sn-size-md, var(--ui-size));
    color: var(--sn-sys-surface, var(--clr-1));
    pointer-events: none;
    opacity: 1;
    transition: var(--sn-transition-normal, 0.3s);
  }
}

@media (min-width: 1420px) {
  side-panel {
    transform: translateX(0);
    border-right: var(--sn-border-width, 2px) solid var(--sn-sys-on-surface, var(--clr-2));
    cursor: default;
    box-shadow: none;

    [collapsed-btn] {
      opacity: 0;
    }
  }
}
`;