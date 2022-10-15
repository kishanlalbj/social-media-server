let users = [];

const socketServer = (socket) => {
  socket.on('joinUser', (data) => {
    users.push({ id: data.message, socketId: socket.id });
    console.log(users);
  });

  socket.on('disconnect', (data) => {
    console.log('A user disconnected', data);
    users = users.filter((item) => item.socketId !== socket.id);
  });

  socket.on('like_post', (data) => {
    console.log(data);
    let user = users.find((item) => item.id === data.receiverId);
    console.log('user found', user);
    if (!user) return;
    socket.to(user.socketId).emit('notify_liked', data);
  });
};

module.exports = socketServer;
