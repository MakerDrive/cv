import Symbiote from '@symbiotejs/symbiote';
import styles from './client-counter.css.js';
import template from './client-counter.tpl.js';

class ClientCounter extends Symbiote {
  count = 0;
  onIncrement() {
    this.$.count++;
  };
}

ClientCounter.template = template;
ClientCounter.rootStyles = styles;
ClientCounter.reg('client-counter');

export default ClientCounter;
