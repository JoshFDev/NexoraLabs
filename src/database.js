import "dotenv/config";
import { connect } from "mongoose";

(async () => {
    try {
        const db = await connect(process.env.MONGO_URI);
        console.log("Database conected to", db.connection.name);
    } catch (error) {
        console.log(error);
    }
})();