require('dotenv').config();
const debug = require('debug');
const server = require('./src/app');

if (server.get('env') !== 'development') {
  debug.disable();
}

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => console.log(`Server listening on *:${PORT}`));
