Package.describe({
  summary: "LiquidLearning Markdown AST Parser"
});

Package.on_use(function (api) {
  api.add_files("llmdParser.js", "client");

  if (api.export) 
    api.export('LlmdParser');
});
