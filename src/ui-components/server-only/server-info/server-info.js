import Symbiote from '@symbiotejs/symbiote';
import styles from './server-info.css.js';
import template from './server-info.tpl.js';

class ServerInfo extends Symbiote {
  serverTime = new Date().toISOString();

  // Node.js only code:
  nodeVersion = globalThis.process.version;
}

ServerInfo.template = template;
ServerInfo.rootStyles = styles;
ServerInfo.reg('server-info');

export default ServerInfo;
