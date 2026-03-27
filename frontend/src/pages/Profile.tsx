import React, { useState } from 'react';
import { User, Mail, LogOut, Download, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Sidebar from '../components/layout/Sidebar';
import ExportImport from './exportImport';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [showExportImport, setShowExportImport] = useState(false);

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Profile</h1>
          <p>Manage your account settings and data</p>
        </div>

        <div className="profile-grid">
          <Card className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {user.firstname.charAt(0)}{user.lastname.charAt(0)}
              </div>
              <h2>{user.firstname} {user.lastname}</h2>
              <p>{user.Email}</p>
            </div>
          </Card>

          <Card>
            <h3 className="card-title">Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <User size={20} className="info-icon" />
                <div>
                  <p className="info-label">Full Name</p>
                  <p className="info-value">{user.firstname} {user.lastname}</p>
                </div>
              </div>
              <div className="info-item">
                <Mail size={20} className="info-icon" />
                <div>
                  <p className="info-label">Email Address</p>
                  <p className="info-value">{user.Email}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="card-title">Data Management</h3>
            <div className="actions-list">
              <Button variant="outline" fullWidth onClick={() => setShowExportImport(!showExportImport)}>
                {showExportImport ? <User size={20} /> : <Download size={20} />} 
                {showExportImport ? 'Close Data Management' : 'Export / Import Data'}
              </Button>
            </div>
          </Card>

          {showExportImport && (
            <Card className="full-width-card">
              <ExportImport />
            </Card>
          )}

          <Card>
            <h3 className="card-title">Actions</h3>
            <div className="actions-list">
              <Button variant="outline" fullWidth onClick={logout}>
                <LogOut size={20} /> Logout
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
