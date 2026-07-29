// Firebase Config + Offline Persistence
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBY0bN1N6ECNoJZqhJYoM3fx8y2VqPtv-o",
  authDomain: "atqallah-e616c.firebaseapp.com",
  databaseURL: "https://atqallah-e616c-default-rtdb.firebaseio.com",
  projectId: "atqallah-e616c",
  storageBucket: "atqallah-e616c.firebasestorage.app",
  messagingSenderId: "1024323751672",
  appId: "1:1024323751672:web:2d5f6f7b39bf28d7c4b50d",
  measurementId: "G-HHCHZTGYN2"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// تفعيل Offline Persistence (Cache محلي)
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Offline persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.warn('Offline persistence not supported by browser');
    }
});

window.app = app;
window.analytics = analytics;
window.auth = auth;
window.db = db;
window.storage = storage;

export { app, analytics, auth, db, storage };
