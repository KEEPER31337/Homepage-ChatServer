const memberSockets = new Map();

const connectMember = ({ member_id, socketId }) => {
  const sockets = memberSockets.get(member_id);
  if (sockets) {
    sockets.add(socketId);
  } else {
    memberSockets.set(member_id, new Set([socketId]));
  }
};

const disconnectMember = ({ member_id, socketId }) => {
  const sockets = memberSockets.get(member_id);
  if (sockets) {
    sockets.delete(socketId);
  }
};

const getSocketCount = (member_id) => {
  const sockets = memberSockets.get(member_id);
  if (sockets) {
    return sockets.size;
  } else {
    return 0;
  }
};

export { connectMember, disconnectMember, getSocketCount };
