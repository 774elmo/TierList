import React, { useEffect, useState } from "react";
import TopBar from "../../components/TopBar";
import "../../css/Posts.css"; // import the same CSS

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://api.tridentmace.xyz/api/v1/announcements")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch announcements");
        return res.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load announcements.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="outer-wrapper">
      <TopBar />
      <div className="container leaderboard-container">
        <h1 className="leaderboard-title">Announcements</h1>

        {loading && <p className="message">Loading announcements...</p>}
        {error && <p className="message error">{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="message">No announcements found.</p>
        )}

        {!loading &&
          !error &&
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <h2 className="post-title">{post.title}</h2>
              <p className="post-content">{post.body}</p>
              <small className="post-time">
                {new Date(post.created_at).toLocaleString()}
              </small>
            </div>
          ))}
      </div>
    </div>
  );
}
