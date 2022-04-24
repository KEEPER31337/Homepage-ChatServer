const rooms = new Map();

const checkMember = ({ roomName, member }) => {
  const room = rooms.get(roomName);
  if (room && room.get(member.id)) {
    return true;
  }
  return false;
};

const joinRoom = ({ roomName, member }) => {
  if (!rooms.get(roomName)) {
    rooms.set(roomName, new Map());
  }
  rooms.get(roomName).set(member.id, member);
};

const leaveRoom = ({ roomName, member }) => {
  if (rooms.get(roomName)) {
    rooms.get(roomName).delete(member.id);
  }
};

const getMembers = ({ roomName }) => {
  const room = rooms.get(roomName);
  if (room) return Array.from(room.values());
  else return [];
};

export { joinRoom, leaveRoom, getMembers, checkMember };
