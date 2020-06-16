const database = Object.assign(
  {},
  {
    tables: {},
    createTable: function (sqlCommand) {
      const regExp = /^create\s+table\s+([\w\S]+)\s*\(([\W\S]+)\)$/;
      const result = sqlCommand.match(regExp);

      let [, tableName, tableColumns] = result;

      tableColumns = tableColumns.split(",").map((column) => column.trim());

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

      if (cmd.startsWith("delete ")) return this.delete(sqlCommand);

      if (cmd.startsWith("select ")) return this.select(sqlCommand);

      throw new DatabaseError(sqlCommand, "Syntax error");
    },
    insert: function (sqlCommand) {
      const regExp = /^insert\s+into\s+([\w\S]+)\s*\(([\W\S]+)\)\s+values\s+\(([\W\S]+)\)$/;
      const result = sqlCommand.match(regExp);

      let [, tableName, tableColumns, tableValues] = result;

      tableColumns = tableColumns.split(",").map((column) => column.trim());
      tableValues = tableValues.split(",").map((values) => values.trim());

      if (!tableName || !tableColumns || !tableValues) return;

      let row = {};
      for (let index = 0; index < tableColumns.length; index++) {
        const columnName = tableColumns[index];
        const columnValue = tableValues[index];
        row[columnName] = columnValue;
      }
      this.tables[tableName].data.push(row);
    },
    select: function (sqlCommand) {
      const regExp = /^\s*select\s+(?:distinct\s+)?(?:top\s+\d*\s+)?(.*?)from.*(?<=from)(\s+\w+\b)(?: where (.+)){0,1}$/;
      const result = sqlCommand.match(regExp);

      let [, selectColumns, tableName, whereClause] = result;

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
    },
    delete: function (sqlCommand) {
      const regExp = /^\s*delete\s+.*(?<=from)(\s+\w+\b)(?: where (.+)){0,1}$/;
      const result = sqlCommand.match(regExp);

      let [, tableName, whereClause] = result;

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
  console.log(
    JSON.stringify(database.execute(selectCommand), undefined, "    ")
  );
} catch (e) {
  console.log(e.message);
}
