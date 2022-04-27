module.exports = {
  up: 'CREATE TABLE chat_log (id INT NOT NULL AUTO_INCREMENT, room_id VARCHAR(256), member_id INT, member_name VARCHAR(40), member_image VARCHAR(512), message TEXT, time DATETIME, PRIMARY KEY (id))',
  down: 'DROP TABLE chat_log',
};
