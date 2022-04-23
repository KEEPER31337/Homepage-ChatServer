const http = require('http');
const SocketIO = require('socket.io');
const dayjs = require('dayjs');
// local
const authAPI = require('./API/auth');

const PORT = 3002;
const timeFormat = 'YYYY-MM-DD hh:mm:ss';

const event = {
  connection: 'connection',
  disconnect: 'disconnect',
  joinRoom: 'join_room',
  msg: 'msg',
};

const httpServer = http.createServer();
const wsServer = SocketIO(httpServer, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

wsServer.on(event.connection, (socket) => {
  socket.on(event.joinRoom, ({ token, roomName }, done) => {
    authAPI.getAuth({ token }).then((data) => {
      if (data.success) {
        socket.join(roomName);
        const peopleCount = wsServer.sockets.adapter.rooms.get(roomName)?.size;
        socket.to(roomName).emit(event.joinRoom, { peopleCount });
        done({ peopleCount });
      }
    });
  });

  socket.on(event.msg, ({ roomName, token, msg }, done) => {
    const time = dayjs().format(timeFormat);
    console.log(msg);
    authAPI.getAuth({ token }).then((data) => {
      if (data.success && msg) {
        socket.to(roomName).emit(event.msg, {
          member: {
            id: data.data.id,
            nickName: data.data.nickName,
            thumbnailPath: data.data.thumbnailPath,
          },
          msg,
          time,
        });
        done(time);
      }
    });
  });

  socket.on(event.disconnect, () => {
    const peopleCount = wsServer.sockets.adapter.rooms.get('global')?.size;
    if (peopleCount) socket.to('global').emit(event.joinRoom, { peopleCount });
  });
});

const handleListen = () => console.log(`Listening on ${PORT}`);
httpServer.listen(PORT, handleListen);
