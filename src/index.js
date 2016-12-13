const noop = function(){};
const defaults = require('lodash.defaults');
const isEmpty = require('lodash.isempty');
const isFunction = require('lodash.isfunction');
const isArray = require('lodash.isarray');
const cloneDeep = require('lodash.clonedeep');
const electron = require('electron');
const remote = electron.remote;
const Menu = electron.Menu || remote.Menu;
const webContents = electron.webContents;

/**
 * this allows us to support users who remote.require this or users who run it
 * directly in the renderer
 * @returns {WebContents}
 */
function currentWebContents() {
  return (process.type === 'browser' ?
    webContents.getFocusedWebContents() :
    remote.getCurrentWebContents()
  );
}

const DEFAULT_MAIN_TPL = [{
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
    currentWebContents().pasteAndMatchStyle();
  }
}, {
  label: 'Select All',
  role: 'selectall'
}];

const DEFAULT_SUGGESTIONS_TPL = [
  {
    label: 'No suggestions',
    click: noop
  }, {
    type: 'separator'
  }
];

/**
 * if passed a function, invoke it and pass a clone of the default (for safe mutations)
 * if passed an array, use as is
 * otherwise, just return a clone of the default
 * @param val {*}
 * @param defaultVal {Array}
 * @returns {Array}
 */
function getTemplate(val, defaultVal) {
  if(isFunction(val)) {
    return val(cloneDeep(defaultVal));
  }
  else if(isArray(val)) {
    return val;
  }
  else {
    return cloneDeep(defaultVal);
  }
}

/**
 * Builds a context menu suitable for showing in a text editor.
 *
 * @param {Object=} selection - An object describing the current text selection.
 *   @property {Boolean=false} isMisspelled - `true` if the selection is
 *     misspelled, `false` if it is spelled correctly or is not text.
 *   @property {Array<String>=[]} spellingSuggestions - An array of suggestions
 *     to show to correct the misspelling. Ignored if `isMisspelled` is `false`.
 * @param {Function|Array} mainTemplate - Optional. If it's an array, use as is.
 *    If it's a function, used to customize the template of always-present menu items.
 *    Receives the default template as a parameter. Should return a template.
 * @param {Function|Array} suggestionsTemplate - Optional. If it's an array, use as is.
 *    If it's a function, used to customize the template of spelling suggestion items.
 *    Receives the default suggestions template as a parameter. Should return a template.
 * @return {Menu}
 */
const buildEditorContextMenu = function(selection, mainTemplate, suggestionsTemplate) {

  selection = defaults({}, selection, {
    isMisspelled: false,
    spellingSuggestions: []
  });

  const template = getTemplate(mainTemplate, DEFAULT_MAIN_TPL);
  const suggestionsTpl = getTemplate(suggestionsTemplate, DEFAULT_SUGGESTIONS_TPL);

  if (selection.isMisspelled) {
    const suggestions = selection.spellingSuggestions;
    if (isEmpty(suggestions)) {
      template.unshift.apply(template, suggestionsTpl);
    } else {
      template.unshift.apply(template, suggestions.map(function(suggestion) {
        return {
          label: suggestion,
          click: function() {
            currentWebContents().replaceMisspelling(suggestion);
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
