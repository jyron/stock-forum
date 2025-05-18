import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllStocks } from '../services/stockService';
import StockCard from '../components/StockCard';

const Profile = () => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserStocks = async () => {
      setLoading(true);
      const result = await getAllStocks();
      
      if (result.success) {
        // Filter stocks created by the current user
        const userStocks = result.data.filter(
          stock => stock.createdBy && stock.createdBy._id === user.id
        );
        setStocks(userStocks);
        setError('');
      } else {
        setError(result.error || 'Failed to fetch your stocks');
      }
      
      setLoading(false);
    };

    fetchUserStocks();
  }, [user]);

  return (
    <div className="profile-page">
      <h1>Your Profile</h1>
      
      <div className="profile-info">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      
      <div className="user-stocks">
        <h2>Your Stocks</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading your stocks...</div>
        ) : stocks.length === 0 ? (
          <div className="alert alert-info">
            You haven't added any stocks yet. <a href="/add-stock">Add your first stock</a>
          </div>
        ) : (
          <div className="stock-grid">
            {stocks.map(stock => (
              <StockCard 
                key={stock._id} 
                stock={stock} 
                onUpdate={() => setStocks(stocks.filter(s => s._id !== stock._id))} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
