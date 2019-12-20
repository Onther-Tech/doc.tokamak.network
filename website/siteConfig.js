const siteConfig = {
  title: 'Tokamak Network Documents',
  disableHeaderTitle: true,
  tagline: 'Plasma evm documents',
  url: 'https://onther-tech.github.io',
  baseUrl: '/',
  projectName: 'docs.tokamak.network',
  organizationName: 'onther-tech',

  // Header links
  headerLinks: [
    {
      doc: 'learn/basic/tokamak-network',
      label: 'Docs'
    },
    {
      doc: 'guides/getting-started/how-to-open-private-testnet-rootchain',
      label: 'Getting Started'
    },
  ],

  scrollToTop:true,

  /* path to images for header/footer */
  headerIcon: 'img/tokamak_white.png',
  favicon: 'img/tokamak_favicon.svg',

  colors: {
    primaryColor: '#006CB6',
    secondaryColor: '#0080C7',
  },

  /* Custom fonts for website */

  fonts: {
    myFont: [
      "Muli",
      "sans-serif"
    ]
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Onther Inc.`,
  usePrism: ['python', 'solidity','jsx', 'go'],
  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    // theme: 'a11y-dark',
    // theme: 'a11y-light',
    // theme: 'agate',
    // theme: 'an-old-hope',
    // theme: 'androidstudio',
    // theme: 'arduino-light',
    // theme: 'arta',
    // theme: 'ascetic',
    // theme: 'atelier-cave-dark',
    // theme: 'atelier-cave-light',
    // theme: 'atelier-dune-dark',
    // theme: 'atelier-dune-light',
    // theme: 'atelier-estuary-dark',
    // theme: 'atelier-estuary-light',
    // theme: 'atelier-forest-dark',
    // theme: 'atelier-forest-light',
    // theme: 'atelier-heath-dark',
    // theme: 'atelier-heath-light',
    // theme: 'atelier-lakeside-dark',
    // theme: 'atelier-lakeside-light',
    // theme: 'atelier-plateau-dark',
    // theme: 'atelier-plateau-light',
    // theme: 'atelier-savanna-dark',
    // theme: 'atelier-savanna-light',
    // theme: 'atelier-seaside-dark',
    // theme: 'atelier-seaside-light',
    // theme: 'atelier-sulphurpool-dark',
    // theme: 'atelier-sulphurpool-light',
    // theme: 'atom-one-dark-reasonable',
    // theme: 'atom-one-dark',
    // theme: 'atom-one-light',
    // theme: 'brown-paper',
    // theme: 'codepen-embed',
    // theme: 'color-brewer',
    // theme: 'darcula',
    // theme: 'dark',
    // theme: 'darkula',
    theme: 'default',
    // theme: 'docco',
    // theme: 'dracula',
    // theme: 'far',
    // theme: 'foundation',
    // theme: 'github-gist',
    // theme: 'github',
    // theme: 'gml',
    // theme: 'googlecode',
    // theme: 'grayscale',
    // theme: 'gruvbox-dark',
    // theme: 'gruvbox-light',
    // theme: 'hopscotch',
    // theme: 'hybrid',
    // theme: 'idea',
    // theme: 'ir-black',
    // theme: 'isbl-editor-dark',
    // theme: 'isbl-editor-light',
    // theme: 'kimbie.dark',
    // theme: 'kimbie.light',
    // theme: 'lightfair',
    // theme: 'magula',
    // theme: 'mono-blue',
    // theme: 'monokai-sublime',
    // theme: 'monokai',
    // theme: 'night-owl',
    // theme: 'nord',
    // theme: 'obsidian',
    // theme: 'ocean',
    // theme: 'paraiso-dark',
    // theme: 'paraiso-light',
    // theme: 'pojoaque',
    // theme: 'purebasic',
    // theme: 'qtcreator_dark',
    // theme: 'qtcreator_light',
    // theme: 'railscasts',
    // theme: 'rainbow',
    // theme: 'routeros',
    // theme: 'school-book',
    // theme: 'shades-of-purple',
    // theme: 'solarized-dark',
    // theme: 'solarized-light',
    // theme: 'sunburst',
    // theme: 'tomorrow-night-blue',
    // theme: 'tomorrow-night-bright',
    // theme: 'tomorrow-night-eighties',
    // theme: 'tomorrow-night',
    // theme: 'tomorrow',
    // theme: 'vs',
    // theme: 'vs2015',
    // theme: 'xcode',
    // theme: 'xt256',
    // theme: 'zenburn',
  },

  docsSideNavCollapsible: true,

  enableUpdateBy: true,

  enableUpdateTime: true,

  markdownPlugins: [
    (md) => {
      md.use(require('remarkable-katex'));
    }
  ],

  editUrl: 'https://github.com/onther-tech/doc.tokamak.network/edit/master/docs/',

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js',
            'https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.js'],

  stylesheets: ['https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,
};

module.exports = siteConfig;
