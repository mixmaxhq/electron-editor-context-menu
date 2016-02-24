var noop = function(){};
var defaults = require('lodash.defaults');
var isEmpty = require('lodash.isEmpty');
var BrowserWindow = require('electron').BrowserWindow;
var Menu = require('electron').Menu;


/**
 * Builds a context menu suitable for showing in a text editor.
 *
 * @param {Object=} selection - An object describing the current text selection.
 *   @property {Boolean=false} isMisspelled - `true` if the selection is
 *     misspelled, `false` if it is spelled correctly or is not text.
 *   @property {Array<String>=[]} spellingSuggestions - An array of suggestions
 *     to show to correct the misspelling. Ignored if `isMisspelled` is `false`.
 * @param {Array} mainTemplate - optional
 * @param {Object} suggestionsTemplate - optional
 * @return {Menu}
 */
var buildEditorContextMenu = function(selection, mainTemplate, suggestionsTemplate) {
  var DEFAULT_MAIN_TPL = [{
    label: 'Undo',
    role: 'undo'
  }, {
    label: 'Redo',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: 'Cut',
    role: 'cut'
  }, {
    label: 'Copy',
    role: 'copy'
  }, {
    label: 'Paste',
    role: 'paste'
  }, {
    label: 'Paste and Match Style',
    click: function() {
      BrowserWindow.getFocusedWindow().webContents.pasteAndMatchStyle();
    }
  }, {
    label: 'Select All',
    role: 'selectall'
  }];

  var DEFAULT_SUGGESTIONS_TPL = [
    {
      label: 'No suggestions',
      click: noop
    }, {
      type: 'separator'
    }
  ];

  selection = defaults({}, selection, {
    isMisspelled: false,
    spellingSuggestions: []
  });

  var template = mainTemplate ? mainTemplate : DEFAULT_MAIN_TPL;
  var suggestionsTpl = suggestionsTemplate ? suggestionsTemplate : DEFAULT_SUGGESTIONS_TPL;

  if (selection.isMisspelled) {
    var suggestions = selection.spellingSuggestions;
    if (isEmpty(suggestions)) {
      template.unshift.apply(template, suggestionsTpl);
    } else {
      template.unshift.apply(template, suggestions.map(function(suggestion) {
        return {
          label: suggestion,
          click: function() {
            BrowserWindow.getFocusedWindow().webContents.replaceMisspelling(suggestion);
          }
        };
      }).concat({
        type: 'separator'
      }));
    }
  }

  return Menu.buildFromTemplate(template);
};

module.exports = buildEditorContextMenu;
