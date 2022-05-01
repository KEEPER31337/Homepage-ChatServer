module.exports = {
  up: 'CREATE TABLE member (id INT NOT NULL, nick_name VARCHAR(40) NOT NULL, image_path VARCHAR(512), PRIMARY KEY (id))',
  down: 'DROP TABLE member',
};
