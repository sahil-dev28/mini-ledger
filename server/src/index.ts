import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 4000;

// 0.0.0.0 so the phone on the same Wi-Fi can reach it
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
