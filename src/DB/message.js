const roomChatLogs = new Map();

const saveChatLog = ({ roomName, chatLog }) => {
  const room = roomChatLogs.get(roomName);
  if (room) {
    room.push(chatLog);
  } else {
    roomChatLogs.set(roomName, [chatLog]);
  }
};

const getChatLogs = ({ roomName, timeSince }) => {
  const chatLogs = roomChatLogs.get(roomName);
  if (chatLogs) {
    return chatLogs;
  } else {
    return [];
  }
};

export { saveChatLog, getChatLogs };
