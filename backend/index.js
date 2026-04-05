const express = require('express');
const http = require("http");
const { Server } = require("socket.io");
const { YSocketIO } = require("y-socket.io/dist/server");
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const ySocketIO = new YSocketIO(io);
ySocketIO.initialize();
//yjs setup complete
app.use(express.static("public"));
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})