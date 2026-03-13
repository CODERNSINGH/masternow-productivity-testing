import http from 'http';
const server = http.createServer((req, res) => res.end('ok'));
server.listen(5000, () => console.log('Listening on 5000 via HTTP'));
