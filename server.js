const http = require('http');
const url = require('url');
const fs = require('fs');

const PORT = 8000;
const DATA = 'data.json'

const fetchTodo = () => {
    try {
        const data = fs.readFileSync(DATA, 'utf-8');
        return JSON.parse(data)
    
    } catch (error) {
        return []
    }
}


const saveTodo = (todo) => {
    fs.writeFileSync(DATA,JSON.stringify(todo, null, 2))
}
