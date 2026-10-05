import React from 'react';
import { useLiveStatus } from '../../context/LiveStatusContext';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { connected } = useLiveStatus();
  return (
    <header>
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/live">Live View</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <span>{connected ? '🟢 Connected' : '🔴 Disconnected'}</span>
    </header>
  );
};

export default Header;