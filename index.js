const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require("./Routes/blogRoutes");
const app = express();
require("dotenv").config();
const port = process.env.PORT;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://blogapp-eaa3d.web.app",
      "https://blog-appweb.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(router);

app.get("/", (req, res) => {
  const currentTime = new Date().toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  res.send(`
    Blog app server is running smoothly<br>
    Today: ${currentTime}
  `);
});

app.listen(port, () => {
  console.log(`BLOG is Running On http://localhost:${port}`);
});
