const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const corsOptions = {
    origin: "http://localhost:3030",
};

const db = require("./app/models");
const Role = db.role;
db.sequelize.sync({ force: true }).then(() => {
    console.log("Drop and Resync DB");
    initial();
});
// all environments
// app.set('port', process.env.PORT || 3030); // 포트 설정
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ message: "Hello there! Welcome to Mookie app" });
});

// routes
require("./app/routes/auth.routes.js")(app);
require("./app/routes/user.routes.js")(app);

const PORT = process.env.PORT || 3030;
// const PORT = app.get('port'); // get 포트
app.listen(PORT, () => {
    console.log("Express server is listening on port : " + app.get("port"));
});

const initial = () => {
    Role.create({
        id: 1,
        name: "user",
    });
    Role.create({
        id: 2,
        name: "moderator",
    });
    Role.create({
        id: 3,
        name: "admin",
    });
};
