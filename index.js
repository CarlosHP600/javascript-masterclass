const database = Object.assign(
  {},
  {
    tables: {},
    createTable: function (sqlCommand) {
      const regExp = /^create\s+table\s+([\w\S]+)\s*\(([\W\S]+)\)$/;
      const result = sqlCommand.match(regExp);

      const tableName = result && result.length > 1 ? result[1] : null;
      const tableColumns =
        result && result.length > 2 ? result[2].split(",") : null;

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
      if (!cmd.startsWith("create table "))
        throw new DatabaseError(sqlCommand, "Syntax error");

      return this.createTable(sqlCommand);
    },
  }
);

const DatabaseError = function (statement, message) {
  this.message = `${message}: ${statement}`;
  this.statement = statement;
};

try {
  const sqlCommand =
    "create table author (id number, name string, age number,\
    city string, state string, country string)";

  database.execute(sqlCommand);
  database.execute("select id, name from author");

  console.log(JSON.stringify(database, null, "    "));
} catch (e) {
  console.log(e.message);
}
