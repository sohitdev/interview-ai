require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/database");

const port = Number(process.env.PORT) || 3000;

connectDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
