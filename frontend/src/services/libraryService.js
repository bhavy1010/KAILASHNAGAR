import api from "../config/axios";

export const getLibraryMaterials = async (classKey, subject) => (await api.get("/library/materials", { params: { classKey, subject } })).data;
export const uploadLibraryMaterial = async (data) => (await api.post("/library/materials", data)).data;
export const addTextbookLink = async (data) => (await api.post("/library/textbooks", data)).data;
export const deleteLibraryMaterial = async (id) => (await api.delete(`/library/materials/${id}`)).data;
