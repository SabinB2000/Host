import React, { useState, useEffect } from "react";
import axiosInstance   from "../utils/axiosConfig";
import Swal            from "sweetalert2";
import {
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiMapPin,
  FiEdit2,
  FiSave,
  FiChevronDown,
  FiChevronUp,
  FiClock,
} from "react-icons/fi";
import "../styles/Itinerary.css";

export default function Itinerary() {
  const [title, setTitle]       = useState("");
  const [days, setDays]         = useState(3);
  const [places, setPlaces]     = useState([]);
  const [itins, setItins]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [tab, setTab]           = useState("create"); // "create" | "view"
  const [editMode, setEditMode] = useState(false);
  const [current, setCurrent]   = useState(null);
  const [openId, setOpenId]     = useState(null);

  useEffect(() => {
    fetchItineraries();
  }, []);

  async function fetchItineraries() {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/itineraries");
      setItins(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Couldn’t load itineraries", "error");
    } finally {
      setLoading(false);
    }
  }

  async function saveItinerary() {
    if (!title.trim() || places.length === 0) {
      return Swal.fire("Warning", "Title + at least one place required", "warning");
    }
    setLoading(true);
    const payload = { title, days, places };

    try {
      if (editMode && current?._id) {
        await axiosInstance.put(`/itineraries/${current._id}`, payload);
        Swal.fire("Updated", "Itinerary updated", "success");
      } else {
        await axiosInstance.post("/itineraries", payload);
        Swal.fire("Saved", "Your itinerary was created", "success");
      }
      await fetchItineraries();
      resetForm();
      setEditMode(false);
      setCurrent(null);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Save failed", "error");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setDays(3);
    setPlaces([]);
  }

  function startEdit(it) {
    setTitle(it.title || "");
    setDays(it.days || 1);
    setPlaces(Array.isArray(it.places) ? it.places : []);
    setCurrent(it);
    setEditMode(true);
    setTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteIt(id) {
    const res = await Swal.fire({
      title: "Delete this itinerary?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });
    if (res.isConfirmed) {
      await axiosInstance.delete(`/itineraries/${id}`);
      fetchItineraries();
      Swal.fire("Deleted", "Itinerary removed", "success");
    }
  }

  const toggleExpand = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="itinerary-container">
      {/* Desktop tabs */}
      <div className="itinerary-tabs desktop-tabs">
        <button
          className={`tab-btn ${tab === "create" ? "active" : ""}`}
          onClick={() => {
            setTab("create");
            setEditMode(false);
            resetForm();
          }}
        >
          <FiPlus /> {editMode ? "Cancel Edit" : "New Itinerary"}
        </button>
        <button
          className={`tab-btn ${tab === "view" ? "active" : ""}`}
          onClick={() => setTab("view")}
        >
          <FiCalendar /> My Plans
        </button>
      </div>

      {/* Mobile tabs (bottom bar) */}
      <div className="itinerary-tabs mobile-tabs">
        <button
          className={`tab-btn ${tab === "create" ? "active" : ""}`}
          onClick={() => {
            setTab("create");
            setEditMode(false);
            resetForm();
          }}
        >
          <FiPlus />
        </button>
        <button
          className={`tab-btn ${tab === "view" ? "active" : ""}`}
          onClick={() => setTab("view")}
        >
          <FiCalendar />
        </button>
      </div>

      {tab === "create" ? (
        <div className="form-card">
          <h2 className="form-heading">
            {editMode ? (
              <>
                <FiEdit2 /> Edit Itinerary
              </>
            ) : (
              <>
                <FiPlus /> Build Itinerary
              </>
            )}
          </h2>

          <label className="form-label">Title</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="form-label">Days</label>
          <input
            className="form-input"
            type="number"
            min="1"
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 1)}
          />

          <label className="form-label">Places</label>
          {places.map((p, i) => (
            <div key={i} className="place-row">
              <input
                className="form-input place-input"
                placeholder={`Place #${i + 1}`}
                value={p.name || ""}
                onChange={(e) => {
                  const arr = [...places];
                  arr[i] = { ...arr[i], name: e.target.value };
                  setPlaces(arr);
                }}
              />
              <button
                className="btn btn-secondary btn-square"
                onClick={() => setPlaces(places.filter((_, j) => j !== i))}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}

          <button
            className="btn btn-secondary"
            onClick={() => setPlaces([...places, {}])}
          >
            <FiPlus /> Add Place
          </button>

          <button
            className="btn btn-primary save-btn"
            onClick={saveItinerary}
            disabled={loading}
          >
            <FiSave /> {editMode ? " Update" : " Save"}
          </button>
        </div>
      ) : (
        <div className="list-view">
          {itins.map((it) => {
            // --- Robust support for both user and admin itineraries ---
            let raw = [];
            if (Array.isArray(it.places) && it.places.length) {
              raw = it.places;
            } else if (Array.isArray(it.days) && it.days.length) {
              raw = it.days.flatMap(d =>
                Array.isArray(d.activities)
                  ? d.activities.map(a => ({ name: (a.title || a.notes || '') }))
                  : []
              );
            } else {
              raw = [];
            }
            const placeCnt = raw.filter((x) => x.name).length;
            const dayCnt =
              Array.isArray(it.days) && it.days.length
                ? it.days.length
                : raw.length || it.days || 0;

            return (
              <div key={it._id} className="itinerary-card">
                <div
                  className="card-header"
                  onClick={() => toggleExpand(it._id)}
                >
                  <div className="card-title">{it.title}</div>
                  <div className="card-meta">
                    <span>
                      <FiClock /> {dayCnt} day{dayCnt !== 1 ? "s" : ""}
                    </span>
                    <span>
                      <FiMapPin /> {placeCnt} place{placeCnt !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn btn-square"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(it);
                      }}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn btn-square"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteIt(it._id);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                    {openId === it._id ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                  </div>
                </div>

                {openId === it._id && (
                  <ul className="card-detail">
                    {Array.isArray(it.days) && it.days.length ? (
                      it.days.map((day, dayIdx) => (
                        <li key={dayIdx}>
                          <strong>Day {day.dayNumber || dayIdx + 1}:</strong>
                          <ul style={{ marginLeft: '1em' }}>
                            {Array.isArray(day.activities) && day.activities.length
                              ? day.activities.map((act, ai) => (
                                  <li key={ai}>
                                    {act.time && <span>{act.time} - </span>}
                                    <b>{act.title}</b> {act.notes && <span>({act.notes})</span>}
                                  </li> 
                                ))
                              : <li>No activities</li>}
                          </ul>
                        </li>
                      ))
                    ) : (
                      raw.map((p, idx) => (
                        <li key={idx}>
                          <strong>Day {idx + 1}:</strong> {p.name}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
