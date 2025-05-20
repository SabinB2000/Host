import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import Swal from "sweetalert2";
import { FiX, FiPlus, FiTrash2, FiClock } from "react-icons/fi";
import "../styles/AdminItineraryForm.css";

export default function AdminItineraryForm({ itinerary, onSuccess, onCancel }) {
  const isEdit = Boolean(itinerary);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState([]);

  useEffect(() => {
    if (itinerary) {
      setTitle(itinerary.title);
      setDescription(itinerary.description || "");
      setDays(itinerary.days || []);
    }
  }, [itinerary]);

  const addDay = () => {
    setDays(d => [
      ...d,
      { dayNumber: d.length + 1, activities: [] }
    ]);
  };

  const removeDay = idx => {
    setDays(d => d.filter((_,i) => i !== idx).map((day,i) => ({
      ...day,
      dayNumber: i+1
    })));
  };

  const addActivity = dayIdx => {
    setDays(d => d.map((day,i) => i===dayIdx
      ? { ...day, activities: [...day.activities, { time:"", title:"", notes:"" }] }
      : day
    ));
  };

  const removeActivity = (dayIdx, actIdx) => {
    setDays(d => d.map((day,i) => {
      if (i!==dayIdx) return day;
      return {
        ...day,
        activities: day.activities.filter((_,j) => j!==actIdx)
      };
    }));
  };

  const updateActivity = (dayIdx, actIdx, field, val) => {
    setDays(d => d.map((day,i) => {
      if (i!==dayIdx) return day;
      return {
        ...day,
        activities: day.activities.map((act,j) => j===actIdx
          ? { ...act, [field]: val }
          : act
        )
      };
    }));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      return Swal.fire("Validation", "Title is required", "warning");
    }
    if (days.length === 0) {
      return Swal.fire("Validation", "At least one day is required", "warning");
    }
    for (let day of days) {
      for (let act of day.activities) {
        if (!act.title.trim()) {
          return Swal.fire("Validation", "All activities need a title", "warning");
        }
      }
    }

    try {
      const payload = { title, description, days };
      if (isEdit) {
        await axiosInstance.put(`/admin/itineraries/${itinerary._id}`, payload);
      } else {
        await axiosInstance.post("/admin/itineraries", payload);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Save failed: " + (err.response?.data?.message||err.message), "error");
    }
  };

  return (
    <div className="itinerary-form-modal">
      <div className="form-container">
        <div className="form-header">
          <h2>{isEdit ? "Edit" : "Create"} Itinerary</h2>
          <button className="close-btn" onClick={onCancel}>
            <FiX size={24} />
          </button>
        </div>

        <div className="form-content">
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter itinerary title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief overview of the itinerary"
              rows="3"
            />
          </div>

          <div className="days-section">
            <div className="section-header">
              <h3>Itinerary Days</h3>
              <button className="add-day-btn" onClick={addDay}>
                <FiPlus size={18} /> Add Day
              </button>
            </div>

            {days.length === 0 && (
              <div className="empty-state">
                <p>No days added yet. Click "Add Day" to get started.</p>
              </div>
            )}

            <div className="days-list">
              {days.map((day, di) => (
                <div key={di} className="day-card">
                  <div className="day-header">
                    <div className="day-number">Day {day.dayNumber}</div>
                    <button 
                      className="remove-day-btn"
                      onClick={() => removeDay(di)}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <div className="activities-list">
                    {day.activities.length === 0 && (
                      <div className="empty-activity">
                        <p>No activities for this day</p>
                      </div>
                    )}

                    {day.activities.map((act, ai) => (
                      <div key={ai} className="activity-card">
                        <div className="activity-time">
                          <FiClock className="time-icon" />
                          <input
                            type="time"
                            value={act.time}
                            onChange={e => updateActivity(di, ai, "time", e.target.value)}
                          />
                        </div>
                        <input
                          type="text"
                          value={act.title}
                          onChange={e => updateActivity(di, ai, "title", e.target.value)}
                          placeholder="Activity title"
                          className="activity-title"
                        />
                        <textarea
                          value={act.notes}
                          onChange={e => updateActivity(di, ai, "notes", e.target.value)}
                          placeholder="Additional notes (optional)"
                          className="activity-notes"
                          rows="2"
                        />
                        <button
                          className="remove-activity-btn"
                          onClick={() => removeActivity(di, ai)}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button 
                    className="add-activity-btn"
                    onClick={() => addActivity(di)}
                  >
                    <FiPlus size={16} /> Add Activity
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-footer">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="submit-btn" onClick={handleSubmit}>
            {isEdit ? "Update" : "Create"} Itinerary
          </button>
        </div>
      </div>
    </div>
  );
}