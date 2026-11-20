// Icon names are ligature text: until the icon font is there they must not show as words.
// A classic, async script of its own, so it runs as soon as it arrives and never waits for the app bundle.
if (document.fonts && document.fonts.load) {
  document.fonts.load('1em "Material Symbols Outlined"').then(function () {
    document.documentElement.setAttribute('data-icons-ready', '');
  }, function () {});
}
