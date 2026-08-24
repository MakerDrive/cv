export default /*css*/ `
login-widget {
  display: flex;
  flex-direction: column;
  margin: auto;
  background-color: var(--sn-sys-surface, var(--clr-2));
  color: var(--sn-sys-on-surface, var(--clr-1));
  gap: var(--sn-step-4, var(--gap-mid));
  padding: var(--sn-step-8, var(--gap-max));
  width: 100%;
  max-width: var(--sn-layout-form-width, 300px);

  input {
    height: var(--sn-size-md, var(--ui-size));
    padding-inline: var(--sn-step-4, var(--gap-mid));
    border: none;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--sn-step-4, var(--gap-mid));
    height: var(--sn-size-md, var(--ui-size));
    background-color: var(--sn-sys-on-surface, var(--clr-1));
    color: var(--sn-sys-surface, var(--clr-2));
    border: none;
    cursor: pointer;
  }
}
`;
