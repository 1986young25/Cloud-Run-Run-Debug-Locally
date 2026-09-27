import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  console.log("Testing firestore connection...");
  try {
    await getDocFromServer(doc(db, "_connection_test", "ping"));
    console.log("Success");
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
