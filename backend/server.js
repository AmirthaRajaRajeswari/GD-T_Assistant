const express = require("express");
const cors = require("cors");
const inspectRoute = require("./routes/analyze");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/inspect", inspectRoute);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
