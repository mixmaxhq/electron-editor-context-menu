# electron-editor-context-menu

In Electron, right-clicking in text editors does… nothing.

This module enables the menu you'd expect, with optional
[spell-checker integration][spell-checker integration].

<img src="docs/menu.png" height="300" alt="menu">

## Installation

```js
npm install electron-editor-context-menu --save
```

## Usage

```js
// In the renderer process:
var remote = require('electron').remote;
// `remote.require` since `Menu` is a main-process module.
var buildEditorContextMenu = remote.require('electron-editor-context-menu');

window.addEventListener('contextmenu', function(e) {
  // Only show the context menu in text editors.
  if (!e.target.closest('textarea, input, [contenteditable="true"]')) return;

  var menu = buildEditorContextMenu();

  // The 'contextmenu' event is emitted after 'selectionchange' has fired but possibly before the
  // visible selection has changed. Try to wait to show the menu until after that, otherwise the
  // visible selection will update after the menu dismisses and look weird.
  setTimeout(function() {
    menu.popup(remote.getCurrentWindow());
  }, 30);
});
```

### Spell-checker integration

Show spelling suggestions by passing a _selection_ object when building the menu:

```js
var selection = {
  isMisspelled: true,
  spellingSuggestions: [
    'men',
    'mean',
    'menu'
  ]
};

var menu = buildEditorContextMenu(selection);
```

Get these suggestions when your [spell-check provider][setSpellCheckProvider] runs
&mdash;Electron will poll it immediately before the `'contextmenu'` event fires.

For a complete example using `electron-spell-check-provider`, see
[here][spell-checker integration example].

## Credits

Created by [Jeff Wear][Jeff Wear].

Thanks to https://github.com/atom/electron/pull/942#issuecomment-171445954 for
the initial sketch of this.

## Copyright and License

Copyright 2016 Mixmax, Inc., licensed under the MIT License.

[spell-checker integration]: #spell-checker-integration
[setSpellCheckProvider]: https://github.com/atom/electron/blob/master/docs/api/web-frame.md#webframesetspellcheckproviderlanguage-autocorrectword-provider
[spell-checker integration example]: https://github.com/mixmaxhq/electron-spell-check-provider#but-how-do-i-show-spelling-suggestions-in-the-context-menu
[Jeff Wear]: https://github.com/wearhere

## Release History

* 1.1.1 Fix compatibility with electron-builder
* 1.1.0 Add the ability to customize the main template and the suggestions template.
* 1.0.0 Initial release.

