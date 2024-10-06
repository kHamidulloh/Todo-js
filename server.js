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
        console.error("Error reading file:", error);
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
        const todos = fetchTodo();
        if(method === 'GET') {
            res.writeHead(200,{ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(todos));
        } 
        else if(method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', () => {
                const newTodo = { id: Date.now(), ...JSON.parse(body)}
                todos.push(newTodo)
                saveTodo(todos)
                res.writeHead(201, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(newTodo))
            })
        }
    } 
    
    else if(pathname.startsWith('/todos/')) {
        const id = parseInt(pathname.split('/')[2]);
        const todos = fetchTodo();
        const todoIndex = todos.findIndex(t => t.id === id);
        
        
        if (method === 'GET') {
            if (todoIndex !== -1) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(todos[todoIndex]));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Todo not found' }));
            }
        }
        else if(method === 'PATCH') {
            if(todoIndex !== -1){
                let body = '';
                req.on('data', chunk => body += chunk.toString())
                req.on('end', () => {
                    const updateData = JSON.parse(body);
                    
                    todos[todoIndex] = {...todos[todoIndex], ...updateData}
    
                    saveTodo(todos)
                    res.writeHead(201, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify(todos[todoIndex]))
                })
            }
        } else if(method === 'DELETE') {
            if(todoIndex !== -1) {
                const updateTodos = todos.filter(t => t.id !== id);
                saveTodo(updateTodos)
                res.writeHead(204).end();
            }else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Todo not found' }));
            }
        }

    } else {
        res.writeHead(404,{ 'Content-Type': 'application/json' });
        res.end(JSON.stringify({message: 'Not found'}))
    }
})


server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})