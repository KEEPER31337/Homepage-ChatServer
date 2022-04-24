import http from 'http';
import { Server } from 'socket.io';
import dayjs from 'dayjs';
// local
import authAPI from './API/auth';
import { joinRoom, leaveRoom, getMembers, checkMember } from './DB/room.js';
import { connectMember, disconnectMember, getSocketCount } from './DB/member';

const PORT = 3002;
const timeFormat = 'YYYY-MM-DD hh:mm:ss';

const event = {
  auth: 'auth',
  connection: 'connection',
  disconnect: 'disconnect',
  disconnecting: 'disconnecting',
  joinRoom: 'join_room',
  leaveRoom: 'leave_room',
  msg: 'msg',
};

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

io.on(event.connection, (socket) => {
  socket.on(event.auth, function ({ token }, authDone) {
    try {
      authAPI.getAuth({ token }).then((data) => {
        if (data.success) {
          const { id, nickName, thumbnailPath } = { ...data.data };
          socket['member'] = { id, nickName, thumbnailPath };
          authDone();
          connectMember({ memberId: id, socketId: socket.id });
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(event.joinRoom, ({ roomName }, done) => {
    try {
      const newMember = socket['member'];
      if (!checkMember({ roomName, member: newMember })) {
        socket.to(roomName).emit(event.joinRoom, { newMember });
      }
      socket.join(roomName);
      joinRoom({ roomName, member: newMember });
      const activeMembers = getMembers({ roomName });
      done({ activeMembers });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(event.msg, ({ roomName, msg }, done) => {
    try {
      const time = dayjs().format(timeFormat);
      const member = socket['member'];
      if (msg) {
        socket.to(roomName).emit(event.msg, {
          member,
          msg,
          time,
        });
        done(time);
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(event.disconnecting, () => {
    try {
      const leaveMember = socket['member'];
      disconnectMember({ memberId: leaveMember.id, socketId: socket.id });
      if (getSocketCount(leaveMember.id) === 0) {
        socket.rooms.forEach((roomName) => {
          if (io.sockets.adapter.rooms.get(roomName)) {
            socket.to(roomName).emit(event.leaveRoom, { leaveMember });
            leaveRoom({ roomName, member: leaveMember });
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
