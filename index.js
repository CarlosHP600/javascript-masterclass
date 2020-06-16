const database = Object.assign(
  {},
  {
    tables: {},
    createTable: function (sqlCommand) {
      const regExp = /^create\s+table\s+([\w\S]+)\s*\(([\W\S]+)\)$/;
      const result = sqlCommand.match(regExp);

      let [, tableName, tableColumns] = result;

      tableColumns = tableColumns.split(/\s*,\s*/);

      if (!tableName || !tableColumns) return;

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
    },
    execute: function (sqlCommand) {
      if (!sqlCommand)
        throw new DatabaseError(sqlCommand, "SqlCommand not found");

      const cmd = sqlCommand.toLowerCase();
      if (cmd.startsWith("create table ")) return this.createTable(sqlCommand);

      if (cmd.startsWith("insert into ")) return this.insert(sqlCommand);

      throw new DatabaseError(sqlCommand, "Syntax error");
    },
    insert: function (sqlCommand) {
      const regExp = /^insert\s+into\s+([\w\S]+)\s*\(([\W\S]+)\)\s+values\s+\(([\W\S]+)\)$/;
      const result = sqlCommand.match(regExp);

      let [, tableName, tableColumns, tableValues] = result;

      tableColumns = tableColumns.split(/\s*,\s*/);
      tableValues = tableValues.split(/\s*,\s*/);

      if (!tableName || !tableColumns || !tableValues) return;

      let row = {};
      for (let index = 0; index < tableColumns.length; index++) {
        const columnName = tableColumns[index];
        const columnValue = tableValues[index];
        row[columnName] = columnValue;
      }
      this.tables[tableName].data.push(row);
    },
  }
);

const DatabaseError = function (statement, message) {
  this.message = `${message}: ${statement}`;
  this.statement = statement;
};

try {
  const createCommand =
    "create table author (id number, name string, age number,\
    city string, state string, country string)";

  const insertCommands = [
    "insert into author (id, name, age) values (1, Douglas Crockford, 62)",
    "insert into author (id, name, age) values (2, Linus Torvalds, 47)",
    "insert into author (id, name, age) values (3, Martin Fowler, 54)",
  ];
  database.execute(createCommand);
  for (insertCommand of insertCommands) {
    database.execute(insertCommand);
  }
  //const selectCommand = "select id, name from author";
  //database.execute(selectCommand);
  console.log(JSON.stringify(database, null, "    "));
} catch (e) {
  console.log(e.message);
}
