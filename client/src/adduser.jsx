import { useState } from 'react';

function AddUserForm() {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload

    const res = await fetch('http://localhost:5001/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    if (res.ok) {
      console.log('A user was added!');
      setName('');
    } else {
      console.error('Error adding user.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <button type="submit">Add User</button>
    </form>
  );
}

export default AddUserForm;
