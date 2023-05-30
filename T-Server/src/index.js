const express = require("express");
const cors = require("cors");
const uuid = require("uuid");
const app = express();
const LocalStorage = require("node-localstorage").LocalStorage;
const bodyParser = require("body-parser");
const { request } = require("express");
localStorage = new LocalStorage("./data");
app.use(cors());
app.use(bodyParser.json());


/////////////////////////////////////////////////////
app.get("/users", (req, res) => {
  res.send(localStorage.getItem("users"));

});
////////////////////////////////////////////////////////


//////////////////////////////////////////////////////
app.get("/messages", (req, res) => {
  res.send(localStorage.getItem("messages"));
});

app.post("/new-message", (req, res) => {
  const messages = localStorage.getItem("messages");
  const messageNew = messages ? JSON.parse(messages) : [];
  messageNew.push(req.body);
  localStorage.setItem("messages", JSON.stringify(messageNew));
  res.send("addMessage");
});
/////////////////////////////////////////////////////////////////////////////

////////Фильтрация сообщение///////////////////////////////////////////
app.get('/messages-user/:id/:contactid', (req, res) => {
  const { id, contactid } = req.params;
  const messages = localStorage.getItem('messages');
  const fiterMessages = JSON.parse(messages).filter((message) => (
    (message.senderId === contactid && message.receiverId === id)
    || (message.senderId === id && message.receiverId === contactid)
  ))
   res.send(fiterMessages)
});
////////////////////////////////////////////////////////////////////

///////Функция изменение сообщение////////////////////////////////////////
app.put('/edit-messages/:id', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  let messages = localStorage.getItem('messages');
  messages = JSON.parse(messages);
  const updatedMessage = messages.find(message => message.id == id);
  updatedMessage.text = text;
  localStorage.setItem('messages', JSON.stringify(messages));
  res.json(updatedMessage);
});
////////////////////////////////////////////////////////////////////////////

///////Функция удаление сообщение////////////////////////////////////////
app.delete('/delete-message/:id', (req, res) => {
  const { id } = req.params;
  let messages = localStorage.getItem('messages');
  messages = JSON.parse(messages);
  const updatedMessages = messages.filter(message => message.id !== id);
  localStorage.setItem('messages', JSON.stringify(updatedMessages));
  res.sendStatus(204);
});
////////////////////////////////////////////////////////////////////////////

///////Функция регистрация пользователя////////////////////////////////////////
app.post('/user', (req, res) => {
  
  const user = {
    id: uuid.v4(),
    login: req.body.login,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    status: true,
    phone: req.body.phone,
    email: req.body.email,
    img: req.body.img,
  };
  const users = JSON.parse(localStorage.getItem('users'))
  if (!user.login || !user.password) {
    return res.status(400).send('Логин и пароль являются обязательными полями.');
  }

  const existingUser = users.find(u => u.login === user.login);
  if (existingUser) {
    return res.status(409).send('Пользователь с таким логином уже существует.');
  }
  const newUser = [...users, user]
  localStorage.setItem('users', JSON.stringify(newUser));

  res.send(users);
});
////////////////////////////////////////////////////////////////////////////

///////Функция вход пользователя////////////////////////////////////////
app.post('/login', (req, res) => {
  const { login, password } = req.body;
  const users = JSON.parse(localStorage.getItem('users'))

  if (!login || !password) {
    return res.sendStatus(400);
  }

  const currentUser = users.find(user => user.login === login && user.password === password);

  if (currentUser) {
    return res.sendStatus(200);
  } else {
    return res.sendStatus(401);
  }
});
////////////////////////////////////////////////////////////////////////////

const server = app.listen(0, () => {
  const port = server.address().port;
  console.log(`Server listening on port ${port}`);
});

