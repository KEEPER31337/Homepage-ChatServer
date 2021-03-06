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
import { saveChatLog, getChatLogList } from './db/query/chatLog';
import { registerMember } from './db/query/member';
import {
  connectMember,
  disconnectMember,
  getSocketCount,
} from './memory/member';

// TODO : Error Handling

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
// TODO : 서버 재시작시 deactivateAll

io.on(event.connection, (socket) => {
  socket.on(event.auth, async ({ token }, authDone) => {
    try {
      const data = await authAPI.getAuth({ token });
      if (data.success) {
        const { id, nickName, thumbnailPath } = { ...data.data };
        await registerMember({ id, nickName, thumbnailPath });
        socket['member'] = {
          id,
          nick_name: nickName,
          image_path: thumbnailPath,
        };
        await connectMember({ member_id: id, socketId: socket.id });
        authDone();
      }
    } catch (error) {
      console.log('[auth]:,', error);
    }
  });

  socket.on(event.joinRoom, async ({ room_id, savedId }, done) => {
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
      const activeMembers = await getActiveMembers({ room_id });
      const [chatLogList, timeSince] = await getChatLogList({
        room_id,
        savedId,
      });
      // TODO : get Members
      done({ activeMembers, chatLogList, timeSince });
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
          member_name: member.nick_name,
          member_image: member.image_path,
          message,
          time,
        };

        const result = await saveChatLog({ room_id, chatLog });
        if (result) {
          done({ id: result.insertId, ...chatLog });
          socket
            .to(room_id)
            .emit(event.message, { ...chatLog, id: result.insertId });
        }
      }
    } catch (error) {
      console.log('[message]:,', error);
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
      console.log('[disconnecting]:,', error);
    }
  });
  socket.on(event.disconnect, () => {});
});

deactivateAll();
const handleListen = () => console.log(`Listening on ${PORT}`);
httpServer.listen(PORT, handleListen);
