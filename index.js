const express = require("express");
const cors = require("cors");
const router = require("./Routes/blogRoutes");
const app = express();
require("dotenv").config();
const port = process.env.PORT;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://blogapp-eaa3d.web.app",
      "https://mblogapp.netlify.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(router);

// async function run() {
//   try {
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. Successfully connected to MongoDB!");
//   } finally {
//     // await client.close();
//   }
// }
// run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Blog app Server");
});

app.listen(port, () => {
  console.log(`CRUD IS RUNNING ON PORT ${port}`);
});
