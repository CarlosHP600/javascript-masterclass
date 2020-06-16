class DatabaseError {
  constructor(statement, message) {
    this.statement = statement;
    this.message = `${message}: ${statement}`;
  }
}

class Parser {
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

class DataBase {
  constructor() {
    this.tables = {};
    this.parser = new Parser();
  }
  createTable(parsedStatement) {
    let [, tableName, tableColumns] = parsedStatement;

    if (!tableName || !tableColumns) return;

    tableColumns = tableColumns.split(",").map((column) => column.trim());

    this.tables[tableName] = {
      columns: {},
      data: [],
    };

    for (let key in tableColumns) {
      const columnProperty = tableColumns[key].trim().split(" ");
      if (!columnProperty || columnProperty.length < 2) continue;

      const columnName = columnProperty[0];
      const columnType = columnProperty[1];
      if (!columnName || !columnType) continue;

      this.tables[tableName].columns[columnName] = columnType;
    }
  }

  insert(parsedStatement) {
    let [, tableName, tableColumns, tableValues] = parsedStatement;

    if (!tableName || !tableColumns || !tableValues) return;

    tableColumns = tableColumns.split(",").map((column) => column.trim());
    tableValues = tableValues.split(",").map((values) => values.trim());

    let row = {};
    for (let index = 0; index < tableColumns.length; index++) {
      const columnName = tableColumns[index];
      const columnValue = tableValues[index];
      row[columnName] = columnValue;
    }
    this.tables[tableName].data.push(row);
  }

  select(parsedStatement) {
    let [, selectColumns, tableName, whereClause] = parsedStatement;

    if (!selectColumns || !tableName) return;

    tableName = tableName.trim();
    selectColumns = selectColumns.split(",").map((column) => column.trim());

    let rows = this.tables[tableName].data;

    if (whereClause) {
      let [columnWhere, valueWhere] = whereClause
        .split("=")
        .map((column) => column.trim());
      rows = rows.filter(function (row) {
        return row[columnWhere] === valueWhere;
      });
    }

    rows = rows.map(function (row) {
      let selectRow = {};
      selectColumns.forEach(function (column) {
        selectRow[column] = row[column];
      });
      return selectRow;
    });
    return rows;
  }

  delete(parsedStatement) {
    let [, tableName, whereClause] = parsedStatement;

    if (!tableName) return;

    tableName = tableName.trim();

    let rows = this.tables[tableName].data;

    if (whereClause) {
      let [columnWhere, valueWhere] = whereClause
        .split("=")
        .map((column) => column.trim());
      let index = rows.findIndex(function (row) {
        return row[columnWhere] === valueWhere;
      });
      if (index != -1) {
        this.tables[tableName].data = [
          ...rows.slice(0, index),
          ...rows.slice(index + 1),
        ];
      }
    } else {
      this.tables[tableName].data = [];
    }
  }

  execute(statement) {
    const result = this.parser.parse(statement);
    if (result) {
      return this[result.command](result.parsedStatement);
    }
    const message = `Syntax error: "${statement}"`;
    throw new DatabaseError(statement, message);
  }
}

const database = new DataBase();
try {
  const createCommand =
    "create table author (id number, name string, age number, city string,\
       state string, country string)";
  database.execute(createCommand);

  const insertCommands = [
    "insert into author (id, name, age) values (1, Douglas Crockford, 62)",
    "insert into author (id, name, age) values (2, Linus Torvalds, 47)",
    "insert into author (id, name, age) values (3, Martin Fowler, 54)",
  ];
  for (insertCommand of insertCommands) {
    database.execute(insertCommand);
  }
  const deleteComand = "delete from author where id = 2";
  database.execute(deleteComand);

  const selectCommand = "select name, age from author";
  console.log(JSON.stringify(database.execute(selectCommand), undefined, " "));
} catch (e) {
  console.log(e.message);
}
