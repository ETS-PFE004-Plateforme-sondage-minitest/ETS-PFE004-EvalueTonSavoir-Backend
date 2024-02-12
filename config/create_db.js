
var conn = new Mongo();

var db = conn.getDB("evaluetonsavoir");


db.createCollection("users");
db.createCollection("files");
db.createCollection("folders");

//db.users.insertOne({ "username": "example_user" });
//db.files.insertOne({ "filename": "example_file.txt", "size": 1024 });
//db.folders.insertOne({ "foldername": "example_folder" });

//print("Database 'evaluetonsavoir' and collections created successfully.");

//utiliser mongosh create_db.js