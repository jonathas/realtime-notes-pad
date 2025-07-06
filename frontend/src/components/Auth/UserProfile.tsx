import { useState } from 'react';
import { useAuth } from '../../contexts/context';

export default function UserProfile() {
  const { currentUser, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!currentUser) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={currentUser.displayName || 'Profile'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {currentUser.displayName?.[0] || currentUser.email?.[0] || '?'}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
          {currentUser.displayName || currentUser.email}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <button 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-4 border-b">
              <p className="text-sm font-medium text-gray-900">
                {currentUser.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>
            
            <div className="p-2">
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}