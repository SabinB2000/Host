import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosConfig";
import { useParams, useNavigate } from "react-router-dom";

export default function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    axios.get(`/api/vendor/places/${id}`).then((res) => setPlace(res.data));
  }, [id]);

  if (!place) return <p>Loading…</p>;

  const remove = async () => {
    if (window.confirm("Delete this place?")) {
      await axios.delete(`/api/vendor/places/${id}`);
      navigate("/vendor/places");
    }
  };

  return (
    <div>
      <h2>{place.title}</h2>
      {place.image && <img src={place.image} alt="" width={200} />}
      <p>{place.description}</p>
      <p><i>{place.location}</i></p>
      <button onClick={() => navigate(`/vendor/places/${id}/edit`)}>Edit</button>
      <button onClick={remove}>Delete</button>
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}
