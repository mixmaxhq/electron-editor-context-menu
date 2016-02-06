var _ = require('underscore');
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
 *
 * @return {Menu}
 */
var buildEditorContextMenu = function(selection) {
  selection = _.defaults({}, selection, {
    isMisspelled: false,
    spellingSuggestions: []
  });

  var template = [{
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

  if (selection.isMisspelled) {
    var suggestions = selection.spellingSuggestions;
    if (_.isEmpty(suggestions)) {
      template.unshift({
        label: 'No suggestions',
        click: _.noop
      }, {
        type: 'separator'
      });
    } else {
      template.unshift.apply(template, _.map(suggestions, function(suggestion) {
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
