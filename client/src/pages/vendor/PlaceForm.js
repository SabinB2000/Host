import React, { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import { useNavigate, useParams } from "react-router-dom";

export default function PlaceForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    image: null,
  });

  useEffect(() => {
    if (editing) {
      axios.get(`/api/vendor/places/${id}`).then((res) => {
        setForm({ ...res.data, image: null });
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm({ ...form, image: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const submit = async () => {
    const data = new FormData();
    data.append("title", form.title);
    data.append("description", form.description);
    data.append("location", form.location);
    if (form.image) data.append("image", form.image);

    try {
      if (editing) {
        await axios.put(`/api/vendor/places/${id}`, data);
      } else {
        await axios.post("/api/vendor/places", data);
      }
      navigate("/vendor/places");
    } catch (err) {
      alert("Error saving place");
    }
  };

  return (
    <div>
      <h2>{editing ? "Edit Place" : "Add New Place"}</h2>
      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />
      <input
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
      />
      <input type="file" name="image" onChange={handleChange} />
      <button onClick={submit}>{editing ? "Update" : "Create"}</button>
      <button onClick={() => navigate(-1)}>Cancel</button>
    </div>
  );
}
