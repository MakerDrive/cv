import { css } from '@symbiotejs/symbiote';

export default css`
  markdown-viewer {
    display: block;
  }

  /* Document images are content, not page furniture: they keep a readable
     card size and never overflow the reading column. */
  markdown-viewer img {
    display: block;
    max-width: 320px;
    height: auto;
    border-radius: 10px;
    margin: 16px 0 8px;
  }
`;
