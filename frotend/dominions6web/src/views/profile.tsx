import { useState, useEffect } from "react";
import { useUserStore } from "../user-store";

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
  }, [])
  
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

      const res = await fetch("http://localhost:3000/user/upload-profile-pic", {
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
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>User Profile</h2>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Nation:</strong> {user.nation}</p>
        {user.profile_pic_id&& <img src={`http://localhost:3000/blob/${user.profile_pic_id}`}></img>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {previewUrl && (
            <img src={previewUrl} alt="Preview" style={{ width: 150, height: 150, borderRadius: "50%", objectFit: "cover" }} />
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload Profile Picture"}
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>Profile picture updated!</p>}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fa",
    padding: 16,
  },
  card: {
    width: 400,
    padding: 24,
    background: "#0e0e0eff",
    borderRadius: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  title: {
    textAlign: "center" as const,
    marginBottom: 16,
  },
};
