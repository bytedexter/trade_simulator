// import React from 'react';

// const Profile = () => {
//   return (
//     <div className="min-h-screen p-6 bg-gray-100">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>
//       <div className="bg-white p-6 rounded-lg shadow-lg">
//         <h2 className="text-xl font-semibold text-gray-700 mb-4">Account Information</h2>
//         <p>Name: John Doe</p>
//         <p>Email: john.doe@example.com</p>
//         <p>Account Type: Standard</p>
//       </div>
//     </div>
//   );
// };

// export default Profile;

import React from 'react';
import { useAuth } from '../context/AuthContext'; // adjust path if needed

const Profile = () => {
  const { user } = useAuth();
  console.log("✅ Auth user:", user);
  if (!user) {
    return <div className="p-6 text-gray-700">Loading user data...</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Account Information</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Account Type:</strong> Standard</p>
      </div>
    </div>
  );
};

export default Profile;
