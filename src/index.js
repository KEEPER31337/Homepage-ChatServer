import http from 'http';
import { Server } from 'socket.io';
import dayjs from 'dayjs';
// local
import authAPI from './API/auth';
import {
  joinRoom,
  leaveRoom,
  deactivateMember,
  deactivateAll,
  getMembers,
  getActiveMembers,
  checkMember,
} from './db/query/room.js';
import { saveChatLog, getChatLogs } from './db/query/chatLog';
import {
  connectMember,
  disconnectMember,
  getSocketCount,
} from './memory/member';

const PORT = 3002;
const timeFormat = 'YYYY-MM-DD hh:mm:ss';

const event = {
  auth: 'auth',
  connection: 'connection',
  disconnect: 'disconnect',
  disconnecting: 'disconnecting',
  joinRoom: 'join_room',
  leaveRoom: 'leave_room',
  message: 'message',
};

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

// TODO : activate 판단은 메모리에서

io.on(event.connection, (socket) => {
  // deactivateAll();
  socket.on(event.auth, async ({ token }, authDone) => {
    try {
      const data = await authAPI.getAuth({ token });
      if (data.success) {
        const { id, nickName, thumbnailPath } = { ...data.data };
        socket['member'] = { id, nickName, thumbnailPath };
        await connectMember({ member_id: id, socketId: socket.id });
        authDone();
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(event.joinRoom, async ({ room_id }, done) => {
    try {
      const newMember = socket['member'];
      if (!newMember) {
        return;
      }
      socket.join(room_id);
      const check = await checkMember({ room_id, member_id: newMember.id });
      if (!check) {
        socket.to(room_id).emit(event.joinRoom, { newMember });
      }
      const result = await joinRoom({ room_id, member_id: newMember.id });
      const activeMemberIdList = await getActiveMembers({ room_id });
      console.log(activeMemberIdList);
      const chatLogs = await getChatLogs({ room_id });

      // TODO : get Members
      const activeMembers = activeMemberIdList.map((activeMemberId) => ({
        id: activeMemberId.member_id,
        nickName: '???',
        thumbnailPath: null,
        generation: '0',
        jobs: ['사서'],
        type: '정규회원',
      }));
      done({ activeMembers, chatLogs });
    } catch (error) {
      console.log('[joinRoom]:,', error);
    }
  });

  socket.on(event.message, async ({ room_id, message }, done) => {
    try {
      const time = dayjs().format(timeFormat);
      const member = socket['member'];
      if (!member) {
        return;
      }
      if (message) {
        const chatLog = {
          member_id: member.id,
          member_name: member.nickName,
          member_image: member.thumbnailPath,
          message,
          time,
        };
        console.log(chatLog);
        socket.to(room_id).emit(event.message, chatLog);
        saveChatLog({ room_id, chatLog })
          .then((result) => {
            console.log(result, chatLog);
            done(chatLog);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(event.disconnecting, async () => {
    try {
      const disconnectedMember = socket['member'];
      if (!disconnectedMember) {
        return;
      }
      disconnectMember({
        member_id: disconnectedMember.id,
        socketId: socket.id,
      });
      console.log(getSocketCount(disconnectedMember.id));
      if (getSocketCount(disconnectedMember.id) === 0) {
        socket.rooms.forEach((room_id) => {
          if (io.sockets.adapter.rooms.get(room_id)) {
            socket
              .to(room_id)
              .emit(event.leaveRoom, { member_id: disconnectedMember.id });
            deactivateMember({ room_id, member_id: disconnectedMember.id });
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
  socket.on(event.disconnect, () => {});
});
const handleListen = () => console.log(`Listening on ${PORT}`);
httpServer.listen(PORT, handleListen);
