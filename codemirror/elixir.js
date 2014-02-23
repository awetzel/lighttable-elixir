CodeMirror.defineMode("elixir", function(config) {

  parseComment = function (stream, state) {
    stream.skipToEnd();

    return "comment";
  }

  parseStringDelimiter = function (stream, state, delimiter) {
    state.inString = !state.inString;

    if (state.inString) { stream.eatWhile(delimiter); };

    return "string";
  }

  parseDocStringDelimiter = function (stream, state, delimiter) {
    state.inDocString = !state.inDocString;

    if (state.inDocString) { stream.eatWhile(delimiter); };

    return "comment";
  }

  matchesAtom = function (stream) {
    return stream.match(/:\w+[\?!]?/)  ||
           stream.match(/\w+[\?!]?:/)  ||
           stream.match(/:"[^"]+"/)    ||
           stream.match(/:'[^']+'/)    ||
           stream.match(/"[^"]+":/)    ||
           stream.match(/'[^']+':/)
  }

  return {
    startState: function () {
      return {
        inDocString: false,
        inString: false,
        defining: false,
      };
    },

    token: function (stream, state) {
      var word, style;

      stream.eatSpace();

      if (stream.match("%B"))                     { style = "string" };
      if (stream.match('"""'))                    { style = parseDocStringDelimiter(stream, state, '"""'); };
      if (stream.match('"'))                      { style = parseStringDelimiter(stream, state, '"'); };
      if (stream.match("#") && !state.inString)   { style = parseComment(stream, state); };
      if (matchesAtom(stream))                    { style = "atom" };
      if (stream.match(/@(_|[a-z])\w*/))          { style = "attribute" };
      if (stream.match(/[A-Z]\w+/))               { style = "constant"; state.defining = false };
      if (state.defining)                         { style = "defined"; stream.eatWhile(/\w/); state.defining = false };
      if (stream.match(/(def|defp|defmodule)\b/)) { style = "def"; state.defining = true };

      if (!style) { stream.next(); }

      if (state.inDocString) { return style = "comment" };
      if (state.inString) { return style = "string" };
      return style;
    },
  };
});

CodeMirror.defineMIME("text/x-elixir", "elixir");
