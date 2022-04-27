import { poolPromise } from './connection';

const joinRoom = async ({ room_id, member_id }) => {
  // TODO : Check room exist
  try {
    const QUERY_JOIN_ROOM = `INSERT INTO room_has_member (room_id, member_id, active) VALUES('${room_id}', '${member_id}', TRUE)`;
    const [result, fields] = await poolPromise.query(QUERY_JOIN_ROOM);
    return true;
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      // errno : 1062
      try {
        const QUERY_ACTIVATE_MEMBER = `UPDATE room_has_member SET active=TRUE WHERE room_id='${room_id}' AND member_id=${member_id}`;
        const [result, fields] = await poolPromise.query(QUERY_ACTIVATE_MEMBER);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }
};

const checkMember = async ({ room_id, member_id }) => {
  // TODO : Check room exist
  try {
    const QUERY_CHECK_MEMBER = `SELECT * FROM room_has_member WHERE room_id='${room_id}' AND member_id=${member_id} AND active=TRUE LIMIT 1`;
    const [result, fields] = await poolPromise.query(QUERY_CHECK_MEMBER);
    if (result.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

const leaveRoom = async ({ room_id, member_id }) => {
  try {
    const QUERY_LEAVE_ROOM = `DELETE FROM room_has_member WHERE room_id='${room_id}' AND member_id=${member_id}`;
    const [result, fields] = await poolPromise.query(QUERY_LEAVE_ROOM);
    return true;
  } catch (err) {
    return false;
  }
};

const deactivateMember = async ({ room_id, member_id }) => {
  try {
    const QUERY_DEACTIVATE_MEMBER = `UPDATE room_has_member SET active=FALSE WHERE room_id='${room_id}' AND member_id=${member_id}`;
    const [result, fields] = await poolPromise.query(QUERY_DEACTIVATE_MEMBER);
    return true;
  } catch (err) {
    return false;
  }
};

const deactivateAll = async () => {
  try {
    const QUERY_DEACTIVATE_MEMBER = `UPDATE room_has_member SET active=FALSE`;
    const [result, fields] = await poolPromise.query(QUERY_DEACTIVATE_MEMBER);
    return true;
  } catch (err) {
    return false;
  }
};

const getMembers = async ({ room_id }) => {
  try {
    const QUERY_GET_MEMBER = `SELECT * FROM room_has_member WHERE room_id='${room_id}'`;
    const [result, fields] = await poolPromise.query(QUERY_GET_MEMBER);
    return result;
  } catch (err) {
    return [];
  }
};

const getActiveMembers = async ({ room_id }) => {
  try {
    const QUERY_GET_MEMBER = `SELECT member_id FROM room_has_member WHERE room_id='${room_id}' AND active=TRUE`;
    const [result, fields] = await poolPromise.query(QUERY_GET_MEMBER);
    return result;
  } catch (err) {
    return [];
  }
};

export {
  joinRoom,
  leaveRoom,
  deactivateMember,
  deactivateAll,
  getMembers,
  getActiveMembers,
  checkMember,
};
