import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import Swal from "sweetalert2";
import "../styles/UserItineraryView.css";

const UserItineraryView = ({ itineraryId }) => {
  const [it, setIt]       = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm]   = useState({ title:"", description:"", places:[] });
  const [allPlaces, setAllPlaces] = useState([]);

  useEffect(() => {
    fetchItinerary();
    fetchAllPlaces();
  }, [itineraryId]);

  const fetchItinerary = async () => {
    const { data } = await axiosInstance.get(`/itineraries/${itineraryId}`);
    setIt(data);
    setForm({
      title: data.title,
      description: data.description,
      places: data.places.map(p=>p._id)
    });
  };

  const fetchAllPlaces = async () => {
    const { data } = await axiosInstance.get("/places/db");
    setAllPlaces(data);
  };

  const handleSave = async () => {
    try {
      const { data } = await axiosInstance.put(`/itineraries/${itineraryId}`, form);
      setIt(data);
      setEditMode(false);
      Swal.fire("Saved","Your changes have been saved","success");
    } catch (e) {
      console.error(e);
      Swal.fire("Error","Could not save","error");
    }
  };

  if (!it) return <p>Loading…</p>;

  return (
    <div className="user-itinerary">
      {!editMode ? (
        <>
          <h2>{it.title}</h2>
          <p>{it.description}</p>
          <h4>Places:</h4>
          <ul>{it.places.map(p=>(
            <li key={p._id}>{p.name}</li>
          ))}</ul>
          <button onClick={()=>setEditMode(true)} className="btn btn-primary">
            Customize
          </button>
        </>
      ) : (
        <div className="itinerary-edit-form">
          <h2>Edit Itinerary</h2>
          <div className="form-group">
            <label>Title:</label>
            <input
              name="title"
              value={form.title}
              onChange={e=>setForm({...form, title:e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={form.description}
              onChange={e=>setForm({...form, description:e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Places (hold Ctrl/Cmd to multi-select):</label>
            <select
              multiple
              value={form.places}
              onChange={e=>{
                const vals = Array.from(e.target.selectedOptions, o=>o.value);
                setForm({...form, places:vals});
              }}
            >
              {allPlaces.map(p=>(
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleSave} className="btn btn-success">
            Save
          </button>
          <button onClick={()=>setEditMode(false)} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default UserItineraryView;
