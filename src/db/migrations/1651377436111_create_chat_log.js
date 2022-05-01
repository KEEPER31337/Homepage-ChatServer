module.exports = {
  up: 'CREATE TABLE chat_log (id INT NOT NULL AUTO_INCREMENT, room_id VARCHAR(256), member_id INT, message TEXT, time DATETIME, PRIMARY KEY (id), FOREIGN KEY (member_id) REFERENCES member(id) )',
  down: 'DROP TABLE chat_log',
};
