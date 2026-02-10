import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import './MemberManagement.css';

function MemberManagement({ socket }) {
  const [members, setMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    fetchMembers();
    
    socket.on('member_added', fetchMembers);

    return () => {
      socket.off('member_added');
    };
  }, [socket]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get('/api/members');
      setMembers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching members:', error);
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/members', formData);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      });
      setShowAddModal(false);
      fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error adding member: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="member-management">
      <div className="container">
        <div className="members-header">
          <h2>👥 Member Management</h2>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={20} /> Add Member
          </button>
        </div>

        <div className="members-table-wrapper">
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Member Since</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    No members yet. Add your first member!
                  </td>
                </tr>
              ) : (
                members.map(member => (
                  <tr 
                    key={member.id}
                    className="clickable-row"
                    onClick={() => setSelectedMember(member)}
                    title="Click to view details"
                  >
                    <td>
                      <strong>{member.name}</strong>
                    </td>
                    <td>{member.email || '—'}</td>
                    <td>{member.phone || '—'}</td>
                    <td>{member.city || '—'}</td>
                    <td>{new Date(member.membershipDate).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-success">{member.status}</span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon btn-danger" title="Remove">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Add New Member</h3>
              <form onSubmit={handleAddMember}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Add Member</button>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{background: '#e5e7eb', color: '#1f2937'}}
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedMember && (
          <div className="modal" onClick={() => setSelectedMember(null)}>
            <div className="modal-content member-details-modal" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal-close"
                onClick={() => setSelectedMember(null)}
              >
                ✕
              </button>
              <div className="member-details">
                <div className="detail-header">
                  <div className="member-avatar">{selectedMember.name.charAt(0).toUpperCase()}</div>
                  <div className="member-info">
                    <h2>{selectedMember.name}</h2>
                    <p className="member-status">
                      <span className="badge badge-success">{selectedMember.status}</span>
                    </p>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>👤 Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedMember.email || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedMember.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>📍 Address</h3>
                  <div className="info-grid">
                    <div className="info-item full-width">
                      <span className="label">Street Address:</span>
                      <span className="value">{selectedMember.address || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">City:</span>
                      <span className="value">{selectedMember.city || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">State:</span>
                      <span className="value">{selectedMember.state || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">ZIP Code:</span>
                      <span className="value">{selectedMember.zipCode || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>📅 Membership</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Member Since:</span>
                      <span className="value">{new Date(selectedMember.membershipDate).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Member ID:</span>
                      <span className="value">{selectedMember.id.substring(0, 8)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-actions">
                  <button className="btn btn-primary">View Borrow History</button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setSelectedMember(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberManagement;
