const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const corsOptions = {
    origin: "http://localhost:3030",
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ message: "Hello there! Welcome to Mookie app" });
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
