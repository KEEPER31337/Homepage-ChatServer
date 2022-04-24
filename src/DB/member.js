const memberSockets = new Map();

const connectMember = ({ memberId, socketId }) => {
  const sockets = memberSockets.get(memberId);
  if (sockets) {
    sockets.add(socketId);
  } else {
    memberSockets.set(memberId, new Set([socketId]));
  }
};

const disconnectMember = ({ memberId, socketId }) => {
  const sockets = memberSockets.get(memberId);
  if (sockets) {
    sockets.delete(socketId);
  }
};

const getSocketCount = (memberId) => {
  const sockets = memberSockets.get(memberId);
  return sockets.size;
};

export { connectMember, disconnectMember, getSocketCount };
