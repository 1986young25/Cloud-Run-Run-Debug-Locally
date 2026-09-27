import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  console.log("Testing firestore connection...");
  try {
    await getDocFromServer(doc(db, "_connection_test", "ping"));
    console.log("Success");
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}
run();
