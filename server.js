const express = require('express');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs')

const app = express();
const PORT = 8000;
const DATA_FILE = 'data.json'

app.use(express.json());
const swaggerDocument = YAML.load('./swagger.yaml');

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const fetchTodo = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data)
    
    } catch (error) {
        console.error("Error reading file:", error);
        return []
    }
}

const saveTodo = (todos) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos,null,2));
}

app.get('/api/docs', (req,res) => {
    res.type('application/x-yaml')
    fs.readFile('swagger.yaml', (err,data) => {
        if(err) {
            console.log("Error reading swagger.yaml:", err);
            
            return res.status(500).send("Error reading swagger yaml")
        }
        console.log(data);
        
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

app.get('/todos/:id', (req,res) => {
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
    const todoIndex = todos.findIndex(t => t.id === id);
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
    const todoIndex = todos.findIndex(t => t.id === id);
    if (todoIndex !== -1) {
        todos.splice(todoIndex, 1);
        saveTodo(todos);
        res.status(204).end();
    }else{
        res.status(404).json({ message: 'Todo not found' });
    }
})


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
