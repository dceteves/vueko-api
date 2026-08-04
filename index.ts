import app from "./src/app.ts";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
  console.log("Available URLs:");
  console.log(`http://localhost:${port}`);
});
