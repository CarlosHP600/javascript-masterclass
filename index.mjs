import DataBase from "./database.mjs";

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
  for (const insertCommand of insertCommands) {
    database.execute(insertCommand);
  }
  const deleteComand = "delete from author where id = 2";
  database.execute(deleteComand);

  const selectCommand = "select name, age from author";
  console.log(JSON.stringify(database.execute(selectCommand), undefined, " "));
} catch (e) {
  console.log(e.message);
}
