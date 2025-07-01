import { useState } from 'react';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFetchUsers = () => {
    setLoading(true);
    fetch('http://localhost:5001/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div>
      <h2>User List</h2>
      <button onClick={handleFetchUsers}>
        Load Users
      </button>
    
      {loading && <p>Loading...</p>}

      <ul>
        {users.map(user => (
          <li key={user.id}>👤 {user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default UsersList;
