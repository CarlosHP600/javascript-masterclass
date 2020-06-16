const sqlCommand =
  "create table author (id number, name string, age number,\
  city string, state string, country string)";

const regExp = /^create\s+table\s+([\w\S]+)\s*\(([\W\S]+)\)$/;
const result = sqlCommand.match(regExp);

const tableName = result && result.length > 1 ? result[1] : null;
const tableColumns = result && result.length > 2 ? result[2].split(",") : null;

if (!tableName || !tableColumns) return;

const database = Object.assign(
  {},
  {
    tables: {
      [tableName]: {
        columns: {},
      },
      data: [],
    },
  }
);
for (let key in tableColumns) {
  const columnProperty = tableColumns[key].trim().split(" ");
  if (!columnProperty || columnProperty.length < 2) continue;

  const columnName = columnProperty[0];
  const columnType = columnProperty[1];
  if (!columnName || !columnType) continue;

  database.tables[tableName].columns[columnName] = columnType;
}
console.log(JSON.stringify(database, null, "    "));
