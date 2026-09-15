import "dotenv/config";
import dns from "dns";
import { connect } from "mongoose";

const URI_MONGO = process.env.MONGO_URI;
const ES_ATLAS = URI_MONGO && URI_MONGO.startsWith("mongodb+srv://");

if (ES_ATLAS) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

(async () => {
  try {
    const db = await connect(URI_MONGO);
    console.log("Database connected to", db.connection.name);
    console.log("MongoDB readyState:", db.connection.readyState);
  } catch (error) {
    console.log("ERROR DE MONGODB:", error);
  }
})();