import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import VideoFrame from '../components/player/VideoFrame';
import { getVideoById } from '../services/api';

const Watch = () => {
  const { id } = useParams();
  const location = useLocation();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchVideo = async () => {
        try {
          const { data } = await getVideoById(id);
          setVideo(data);
        } catch (err) {
          console.error("Error fetching video:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchVideo();
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-primary font-black uppercase tracking-widest">Loading Cinema...</div>
    </div>
  );

  return (
    <div className="pt-0 sm:pt-4 pb-20">
      <VideoFrame video={video} />
    </div>
  );
};

export default Watch;
