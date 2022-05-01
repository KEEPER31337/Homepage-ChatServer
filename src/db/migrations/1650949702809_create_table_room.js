module.exports = {
  up: "CREATE TABLE room (id VARCHAR(256) NOT NULL, name TEXT, PRIMARY KEY (id))",
  down: "DROP TABLE room",
};
