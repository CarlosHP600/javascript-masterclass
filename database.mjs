import Parser from "./parser.mjs";
import DatabaseError from "./database-error.mjs";

export default class DataBase {
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
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = this.parser.parse(statement);
        if (result) {
          resolve(this[result.command](result.parsedStatement));
        }
        const message = `Syntax error: "${statement}"`;
        reject(new DatabaseError(statement, message));
      }, 1000);   
    });     
  }
}
