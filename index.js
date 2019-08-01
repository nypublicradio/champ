require('dotenv').config();
const server = require('./src/app');

const PORT = process.env.PORT || 8000;


server.listen(8000, () => console.log(`Server listening on *:${PORT}`));
