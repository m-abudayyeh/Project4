import axios from "axios";

const PROJECT_ID = "task-manager-najjar";
const API_KEY = "AIzaSyCXMn_UBfWmjBM4AvHTc0axVsYv6-FxaLQ";

const firestore = axios.create({
  baseURL: `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
  params: {
    key: API_KEY,
  },
});

export default firestore;
