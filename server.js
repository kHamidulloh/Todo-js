const express = require('express');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;
const DATA_FILE = 'data.json'

app.use(express.json());
app.use('/api/docs/ui', express.static(path.json(__dirname, 'node_modules', 'swagger-ui-dist')));

const fetchTodo = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data)
    
    } catch (error) {
        console.error("Error reading file:", error);
        return []
    }
}


app.get('api/docs', (req,res) => {
    res.type('application/x-yaml')
    fs.readFile('swagger.yaml', (err,data) => {
        if(err) {
            return res.status(500).send("Error reading swagger yaml")
        }
        res.send(data);
    });
});

app.get('/todos', (req,res) => {
    const todos = fetchTodo();
    res.json(todos);
})

app.post('/todos', (req,res) => {
    const newTodo = {id: Date.now(), ...req.body };
    const todos = fetchTodo();
    todos.push(newTodo);
    saveTodo(todos);
    res.status(201).json(newTodo);
})

app.get('/toodo/:id', (req,res) => {
    const id = parseInt(req.params.id);
    const todos = fetchTodo();
    const todo = todos.find(t => t.id === id);
    if(todo){
        res.json(todo);
    }else{
        res.status(404).json({ message: 'Todo not found' })
    }
});

app.patch('/todos/:id', (req,res) => {
    const id = parseInt(req.params.id);
    const todos = fetchTodo();
    const todo = todos.find(t => t.id === id);
    if (todoIndex !== -1) {
        todos[todoIndex] = {...todos[todoIndex], ...req.body}
        saveTodo(todos);
        res.json(todos[todoIndex])
    }else{
        res.status(404).json({ message: 'Todo not found' })
    }
})

app.delete('/todos/:id', (req,res) => {
    const id = parseInt(req.params.id);
    const todos = fetchTodo();
    const todo = todos.find(t => t.id === id);
    if (todoIndex !== -1) {
        todos.splice(todoIndex, 1);
        saveTodo(todos);
        res.status(200).end();
    }else{
        res.status(404).json({ message: 'Todo not found' });
    }
})


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
