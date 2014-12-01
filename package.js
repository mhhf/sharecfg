Package.describe({
  summary: "LiquidLearning Markdown AST Parser"
});

Package.on_use(function (api) {
  api.add_files("rlogParser.js", ["client","server"]);

  if (api.export) 
    api.export('RlogParser');
});
