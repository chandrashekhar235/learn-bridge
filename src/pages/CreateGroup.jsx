import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:7777";

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "public",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      await axios.post(`${API}/groups`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Group created!");
    } catch (error) {
      console.log(error);
      alert("Error creating group");
    }
  };

  return (
    <div className="p-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Group Name"
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
        />

        <select name="type" onChange={handleChange}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <button type="submit">Create Group</button>
      </form>
    </div>
  );
};

export default CreateGroup;