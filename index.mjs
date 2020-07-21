import DataBase from "./database.mjs";

const createCommand =
  "create table author (id number, name string, age number, city string,\
       state string, country string)";

const insertCommands = [
  "insert into author (id, name, age) values (1, Douglas Crockford, 62)",
  "insert into author (id, name, age) values (2, Linus Torvalds, 47)",
  "insert into author (id, name, age) values (3, Martin Fowler, 54)",
];

const selectCommand = "select name, age from author";

(async function(){
  try {    
    const database = new DataBase();
    await database.execute(createCommand);
    await Promise.all([
      database.execute(insertCommands[0]),
      database.execute(insertCommands[1]),
      database.execute(insertCommands[2]),
    ]);
    const result = await database.execute(selectCommand);
    console.log(JSON.stringify(result, undefined, " "));
  } catch (error) {
    console.log(error.message);
  }
})();


