import { icon } from '../../../icons/icon.js';

export const menuData = [
  {
    name: 'Template Repo',
    path: './',
  },
  {
    name: 'JSDA Manifest',
    path: './pages/manifest/',
  },
  {
    name: 'Symbiote.js',
    path: './pages/symbiote/',
  },
  {
    name: 'Cloud Images Toolkit',
    path: './pages/cit/',
  },
];

export default /*html*/ `
  <a itemize="menuItems" href="{{path}}" ${{'@current': 'isCurrent'}}>
    <span ${{'innerHTML': 'icon'}}></span> {{name}}
  </a>
  <div collapsed-btn>${icon('chevron_right')}</div>
`;