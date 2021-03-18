const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExist = users.find(user => user.username === username);

  if(!userExist) {
    response.status(404).json({error: "user not found!"});
  }

  request.user = userExist;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExist = users.some(user => user.username === username);

  if(userExist) {
    response.status(400).json({error: "User exists!"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  } 
  
  users.push(user);

  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title, 
    done: false,
    deadline: deadline,
    created_at: new Date(),
  }

  user.todos.push(todo);

  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {  
  const { title, deadline } = request.body;
  const user = request.user;
  const { id } = request.params;

  const todoIndex = user.todos.find(todo => todo.id === id);

  if(!todoIndex) {
    response.status(404).json({error: "Todo not found!"});
  }
  
  todoIndex.title = title;
  todoIndex.deadline = deadline;
  
  response.json(todoIndex);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const todoIndex = user.todos.find(todo => todo.id === id);

  if(!todoIndex) {
    response.status(404).json({error: "Todo not found!"});
  }

  todoIndex.done = true;

  response.json(todoIndex);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user }= request;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    response.status(404).json({error: "Todo not found!"});
  }

  user.todos.splice(todo, 1);

  response.status(204).send();
});

module.exports = app;