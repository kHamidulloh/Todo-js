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


const server = http.createServer((req,res) => {
    const { pathname } = url.parse(req.url, true);
    const method = req.method;

    if(pathname === '/todos') {
        if(method === 'GET') {
            const todos = fetchTodo();
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify(todos));
        } 
        else if(method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', () => {
                const newTodo = {...JSON.parse(body), id: Date.now, completed: false}
                const todos = fetchTodo();
                todos.push(newTodo)
                saveTodo(todos)
                res.writeHead(201, {'Content-Type':'application/json'})
                res.end(JSON.stringify(newTodo))
            })
        }
    } 
    else if(pathname === '/todos/') {
        const id = parseInt(pathname.split('/')[2]);
        const todos = fetchTodo();
        const todo = todos.find(t => t.id === id);
        
        if(method === 'PATCH' && todo) {
            todo.completed = true;
            saveTodo(todo)
            res.writeHead(201, {'Content-Type':'application/json'})
            res.end(JSON.stringify(todo))
        } else if(method === 'DELETE') {
            const updateTodos = todos.filter(t => t.id != id);
            saveTodo(updateTodos)
            res.writeHead(204).end();
        }

    } else {
        res.writeHead(404,{'Content-Type': 'application/json'});
        res.end(JSON.stringify({message: 'Not found'}))
    }
})


server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})