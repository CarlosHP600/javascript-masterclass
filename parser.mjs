export default class Parser {
  constructor() {
    this.commands = new Map();
    this.initCommands();
  }

  initCommands() {
    this.commands.set(
      "createTable",
      /^create\s+table\s+([\w\S]+)\s*\(([\W\S]+)\)$/
    );
    this.commands.set(
      "insert",
      /^insert\s+into\s+([\w\S]+)\s*\(([\W\S]+)\)\s+values\s+\(([\W\S]+)\)$/
    );
    this.commands.set(
      "delete",
      /^\s*delete\s+.*(?<=from)(\s+\w+\b)(?: where (.+)){0,1}$/
    );
    this.commands.set(
      "select",
      /^\s*select\s+(?:distinct\s+)?(?:top\s+\d*\s+)?(.*?)from.*(?<=from)(\s+\w+\b)(?: where (.+)){0,1}$/
    );
  }

  parse(statement) {
    for (let [command, regexp] of this.commands) {
      const parsedStatement = statement.match(regexp);
      if (parsedStatement) {
        return {
          command,
          parsedStatement,
        };
      }
    }
  }
}
