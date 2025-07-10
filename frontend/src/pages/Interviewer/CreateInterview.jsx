import { useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios";

export default function CreateInterview() {
  const [formData, setFormData] = useState({
    candidateEmail: "",
    company: "",
    roundType: "DSA",
    datetime: "",
    mode: "Online",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/interview/create", formData);
      toast.success("Interview scheduled successfully!");
      setFormData({
        candidateEmail: "",
        company: "",
        roundType: "DSA",
        datetime: "",
        mode: "Online",
        notes: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create interview");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Create New Interview</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="candidateEmail"
          placeholder="Candidate Email"
          className="input input-bordered w-full"
          value={formData.candidateEmail}
          onChange={handleChange}
        />
        <input
          type="text"
          name="company"
          placeholder="Company"
          className="input input-bordered w-full"
          value={formData.company}
          onChange={handleChange}
        />
        <select
          name="roundType"
          className="select select-bordered w-full"
          value={formData.roundType}
          onChange={handleChange}
        >
          <option>DSA</option>
          <option>System Design</option>
          <option>Behavioral</option>
          <option>HR</option>
        </select>
        <input
          type="datetime-local"
          name="datetime"
          className="input input-bordered w-full"
          value={formData.datetime}
          onChange={handleChange}
        />
        <div className="flex gap-4 items-center">
          <label className="label-text">Mode:</label>
          <label>
            <input
              type="radio"
              name="mode"
              value="Online"
              checked={formData.mode === "Online"}
              onChange={handleChange}
              className="radio radio-primary"
            />
            Online
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="Offline"
              checked={formData.mode === "Offline"}
              onChange={handleChange}
              className="radio radio-primary"
            />
            Offline
          </label>
        </div>
        <textarea
          name="notes"
          className="textarea textarea-bordered w-full"
          placeholder="Optional Notes"
          value={formData.notes}
          onChange={handleChange}
        ></textarea>
        <button className="btn btn-primary w-full" type="submit">
          Create Interview
        </button>
      </form>
    </div>
  );
}
