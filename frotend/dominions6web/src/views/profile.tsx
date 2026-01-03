import { useState, useEffect } from "react";
import { useUserStore } from "../user-store";
import { SERVER_ENDPOINT } from "../constants";
import { globalStyle } from "../global-styles";

export const UserProfilePage = () => {
  const { user, getUser } = useUserStore();
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    getUser();
    console.log(user);
  }, [loading.valueOf()])
  
  useEffect(() => {
    if (!profilePic) return;
    const url = URL.createObjectURL(profilePic);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profilePic]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilePic) {
      setError("Please select a profile picture first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("profilePic", profilePic);

      const res = await fetch(`${SERVER_ENDPOINT}/user/upload-profile-pic`, {
        method: "POST",
        credentials: "include", // send cookies
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={globalStyle.page}>
      <div style={globalStyle.card}>
        <h2 style={globalStyle.title}>User Profile</h2>
        <p style={{...globalStyle.label}}><strong>Username:</strong> {user.username}</p>
        <p style={{...globalStyle.label}}><strong>Nation:</strong> {user.nation}</p>
        {user.profilePicId && <img style = {{alignSelf:"center", width: 250, height: 250, borderRadius: "50%", objectFit: "cover" }} src={`${SERVER_ENDPOINT}/blob/${user.profilePicId}`}></img>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {previewUrl && (
            <img src={previewUrl} alt="Preview" style={{ width: 150, height: 150, borderRadius: "50%", objectFit: "cover" }} />
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button type="submit" disabled={loading}>
            {loading ? "Ülesse laadimine..." : "Lae ülesse profiili pilt"}
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>Profiili pilti uuendati</p>}
      </div>
    </div>
  );
};

