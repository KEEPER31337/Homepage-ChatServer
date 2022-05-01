import { poolPromise } from './connection';
import dayjs from 'dayjs';

const timeFormat = 'YYYY-MM-DD hh:mm:ss';
const timeFormatSQL = '%Y-%m-%d %h:%m:%s';

const saveChatLog = async ({ room_id, chatLog }) => {
  try {
    const { member_id, message, time } = chatLog;
    const QUERY_SAVE_CHAT = `INSERT INTO chat_log (room_id, member_id, message, time) VALUES('${room_id}', '${member_id}', '${message}', '${time}')`;
    const [result, fields] = await poolPromise.query(QUERY_SAVE_CHAT);
    return result;
  } catch (err) {
    return false;
  }
};

const getChatLogList = async ({ room_id, savedId }) => {
  try {
    const timeSince = dayjs().add(-3, 'day').format(timeFormat);
    let QUERY_GET_CHAT = `SELECT chat_log.id, member_id, member.nick_name as member_name, member.image_path as member_image, message, DATE_FORMAT(time, '${timeFormatSQL}') AS time FROM chat_log JOIN member ON member_id=member.id AND room_id='${room_id}' AND DATE_FORMAT(time, '${timeFormatSQL}') > '${timeSince}' order by chat_log.id`;
    if (savedId) {
      QUERY_GET_CHAT = `SELECT chat_log.id, member_id, member.nick_name as member_name, member.image_path as member_image, message, DATE_FORMAT(time, '${timeFormatSQL}') AS time FROM chat_log JOIN member ON member_id=member.id AND room_id='${room_id}' AND DATE_FORMAT(time, '${timeFormatSQL}') > '${timeSince}' AND chat_log.id > ${savedId} order by chat_log.id`;
    }
    const [result, fields] = await poolPromise.query(QUERY_GET_CHAT);
    return [result, timeSince];
  } catch (err) {
    return [[], null];
  }
};

export { saveChatLog, getChatLogList };
