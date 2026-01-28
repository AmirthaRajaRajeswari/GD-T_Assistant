import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

export const inspectGDT = (file) => {
  const formData = new FormData();
  formData.append("pdf", file);

  return API.post("/inspect", formData);
};
