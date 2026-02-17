// src/pages/blocks/hooks/useBlockProject.js
// Custom hook to manage block-based page projects for kids frontend lab

import { useState } from "react";
import {
  getMyProjects,
  createProject,
  updateProject,
} from "../../../api/blocksApi";

/**
 * Shape of project:
 * {
 *   _id,
 *   title,
 *   data: {
 *     builder?: {...},
 *     zoom?: number,
 *     blocks?: legacyBlocks[]
 *   },
 *   createdAt,
 *   updatedAt
 * }
 */
export default function useBlockProjects() {
  const [projects, setProjects] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadMyProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const { projects: list } = await getMyProjects();
      const safeList = Array.isArray(list) ? list : [];
      setProjects(safeList);
      return safeList;
    } catch (err) {
      console.error("useBlockProjects.loadMyProjects error:", err);
      setError(err.message || "Failed to load projects");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadLastProject = async () => {
    const list = await loadMyProjects();
    if (!list || list.length === 0) {
      setCurrent(null);
      return null;
    }

    const latest = list[0];
    setCurrent(latest);
    return latest;
  };

  /**
   * Save current builder data (create or update)
   * @param {Object} params
   * @param {string} params.title
   * @param {Object} params.data - { builder, zoom, ... }
   */
  const saveProject = async ({ title, data }) => {
    if (!data || typeof data !== "object") {
      const err = new Error("Nothing to save (data missing).");
      setError(err.message);
      throw err;
    }

    setSaving(true);
    setError("");

    try {
      let result;
      if (current?._id) {
        // update existing project
        result = await updateProject({
          id: current._id,
          title: title || current.title || "My page",
          data,
        });
      } else {
        // create new project
        result = await createProject({
          title: title || "My page",
          data,
        });
      }

      const { project } = result || {};
      if (project) {
        setCurrent(project);

        setProjects((prev) => {
          const idx = prev.findIndex((p) => p._id === project._id);
          if (idx === -1) {
            return [project, ...prev];
          }
          const clone = [...prev];
          clone[idx] = project;
          clone.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          return clone;
        });
      }

      return project;
    } catch (err) {
      console.error("useBlockProjects.saveProject error:", err);
      setError(err.message || "Failed to save project");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Helper: flatten blocks for legacy / debugging
   */
  const getCurrentBlocks = () => {
    if (!current || !current.data) return [];

    const d = current.data;

    if (Array.isArray(d.blocks)) {
      return d.blocks;
    }

    if (d.builder && d.builder.blocks) {
      return Object.values(d.builder.blocks);
    }

    return [];
  };

  return {
    // state
    projects,
    current,
    loading,
    saving,
    error,

    // setters
    setCurrent,
    setProjects,
    setError,

    // actions
    loadMyProjects,
    loadLastProject,
    saveProject,

    // helpers
    getCurrentBlocks,
  };
}
