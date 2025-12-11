// useIPTracker.js - React hook to track user IP
import { useEffect, useState } from 'react';

export function useIPTracker() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Track IP when component mounts
    const trackIP = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/track-ip');
        const data = await response.json();
        
        if (data.success) {
          setLocation(data.data);
        } else {
          setError('Failed to get location');
        }
      } catch (err) {
        console.error('Error tracking IP:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    trackIP();
  }, []); // Empty array = run once on mount

  return { location, loading, error };
}

// Example usage in App.js:
export function IPTrackerExample() {
  const { location, loading, error } = useIPTracker();

  if (loading) return <div>Loading location...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
      <h3>Your Location</h3>
      {location && (
        <div>
          <p>🌍 <strong>Country:</strong> {location.country}</p>
          <p>📍 <strong>City:</strong> {location.city}</p>
          <p>🗺️ <strong>Region:</strong> {location.region}</p>
          <p>⏰ <strong>Timezone:</strong> {location.timezone}</p>
        </div>
      )}
    </div>
  );
}