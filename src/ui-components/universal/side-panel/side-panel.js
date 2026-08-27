import Symbiote from '@symbiotejs/symbiote';
import template, { menuData } from './side-panel.tpl.js';
import styles from './side-panel.css.js';

export class SidePanel extends Symbiote {

  // ISO-flag related documentation: https://github.com/symbiotejs/symbiote.js/blob/main/docs/flags.md#isomode
  isoMode = true;

  init$ = {
    menuItems: menuData.map(item => ({
      ...item,
      icon: 'arrow_forward',
      isCurrent: null,
    })),
  };

  renderCallback() {
    this.tabIndex = 0;
    if (typeof window !== 'undefined') {
      let currentSet = false;
      let path = window.location.pathname;
      let items = this.$.menuItems.map(item => {
        let elHref = item.path.replace('./', '').trim();
        let isCurrent = (elHref && path.includes(elHref)) ? '' : null;
        if (isCurrent !== null) currentSet = true;
        return { ...item, isCurrent };
      });
      if (!currentSet && items.length > 0) {
        items[0].isCurrent = '';
      }
      this.$.menuItems = items;
    }
  }
}

SidePanel.rootStyles = styles;
SidePanel.template = template;
SidePanel.reg('side-panel');