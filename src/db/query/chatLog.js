import { poolPromise } from './connection';

const timeFormat = '%Y-%m-%d %h:%m:%s';

const saveChatLog = async ({ room_id, chatLog }) => {
  try {
    const { member_id, member_name, member_image, message, time } = chatLog;
    const QUERY_JOIN_ROOM = `INSERT INTO chat_log (room_id, member_id, member_name, member_image, message, time) VALUES('${room_id}', '${member_id}', '${member_name}', '${member_image}', '${message}', '${time}')`;
    const result = await poolPromise.query(QUERY_JOIN_ROOM);
    return true;
  } catch (err) {
    return err;
  }
};

const getChatLogs = async ({ room_id, timeSince }) => {
  try {
    const QUERY_CHECK_MEMBER = `SELECT member_id, member_name, member_image, message, DATE_FORMAT(time, '${timeFormat}') AS time FROM chat_log WHERE room_id='${room_id}'`;
    const [result, fields] = await poolPromise.query(QUERY_CHECK_MEMBER);
    return result;
  } catch (err) {
    return err;
  }
};

export { saveChatLog, getChatLogs };
