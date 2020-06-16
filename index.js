let sqlCommand = "create table author (id number, name string, age number,\
  city string, state string, country string)";

let regExp = /^create\s+table\s+([\w\S]+)\s*\(([\W\S]+)\)$/
let result = sqlCommand.match(regExp);

let tableName = result && result.length > 1? result[1] : null; 
let columnsArray = result && result.length > 2? result[2].split(",") : null;

console.log(`tableName -> ${(tableName) ? tableName : 
 "Nome da tabela não localizado!" }`);

console.log(`columns -> ${ (columnsArray) ? columnsArray : 
 "Não foi possivel definir os campos!"}`);