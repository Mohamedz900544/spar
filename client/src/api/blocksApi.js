// src/api/blocksApi.js

// Change this if you like (e.g. https://api.sparvilab.com/api)
// const API_BASE = "https://sparvy-lab-backend.onrender.com/api";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (res) => {
  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const message = data?.message || "Something went wrong";
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
};

export const getMyProjects = async () => {
  const res = await fetch(`${API_BASE}/api/blocks/projects/my`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  return handleResponse(res);
};

export const createProject = async ({ title, data }) => {
  const res = await fetch(`${API_BASE}/api/blocks/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({
      title,
      data,
    }),
  });

  return handleResponse(res);
};

export const updateProject = async ({ id, title, data }) => {
  const res = await fetch(`${API_BASE}/api/blocks/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({
      title,
      data,
    }),
  });

  return handleResponse(res);
};
