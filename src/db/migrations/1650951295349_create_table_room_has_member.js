module.exports = {
  up: 'CREATE TABLE room_has_member ( id INT NOT NULL AUTO_INCREMENT, room_id VARCHAR(256), member_id INT, active BOOLEAN, PRIMARY KEY (id), UNIQUE KEY (room_id, member_id) )',
  down: 'DROP TABLE room_has_member',
};
