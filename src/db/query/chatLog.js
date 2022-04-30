import { poolPromise } from './connection';
import dayjs from 'dayjs';

const timeFormat = 'YYYY-MM-DD hh:mm:ss';
const timeFormatSQL = '%Y-%m-%d %h:%m:%s';

const saveChatLog = async ({ room_id, chatLog }) => {
  try {
    const { member_id, member_name, member_image, message, time } = chatLog;
    const QUERY_SAVE_CHAT = `INSERT INTO chat_log (room_id, member_id, member_name, member_image, message, time) VALUES('${room_id}', '${member_id}', '${member_name}', '${member_image}', '${message}', '${time}')`;
    const [result, fields] = await poolPromise.query(QUERY_SAVE_CHAT);
    return result;
  } catch (err) {
    return err;
  }
};

const getChatLogList = async ({ room_id, savedId }) => {
  try {
    const timeSince = dayjs().add(-3, 'day').format(timeFormat);
    let QUERY_GET_CHAT = `SELECT id, member_id, member_name, member_image, message, DATE_FORMAT(time, '${timeFormatSQL}') AS time FROM chat_log WHERE room_id='${room_id}' AND DATE_FORMAT(time, '${timeFormatSQL}') > '${timeSince}' order by id`;
    if (savedId) {
      QUERY_GET_CHAT = `SELECT id, member_id, member_name, member_image, message, DATE_FORMAT(time, '${timeFormatSQL}') AS time FROM chat_log WHERE room_id='${room_id}' AND DATE_FORMAT(time, '${timeFormatSQL}') > '${timeSince}' AND id > ${savedId} order by id`;
    }
    const [result, fields] = await poolPromise.query(QUERY_GET_CHAT);
    return [result, timeSince];
  } catch (err) {
    return err;
  }
};

export { saveChatLog, getChatLogList };
