const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
	cors: {
		origin: "https://gideonpeer2peer.netlify.app",
	},
});
const { ExpressPeerServer } = require("peer");
const opinions = {
	debug: true,
	allow_discovery: true,
	origins: ["https://gideonpeer2peer.netlify.app"],
};

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));

app.get("/", (req, res) => {
	res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
	res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
	socket.on("join-room", (roomId, userId, userName) => {
		socket.join(roomId);
		// console.log("connected", userId);
		setTimeout(() => {
			socket.to(roomId).broadcast.emit("user-connected", userId);
			// console.log("user connected");
		}, 1000);
		socket.on("message", (message) => {
			io.to(roomId).emit("createMessage", message, userName);
		});
	});
});

server.listen(process.env.PORT || 3030);
