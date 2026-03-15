"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, MapPin, LogOut, Package, Edit2, Check, X, Trash2, Plus, Pencil } from "lucide-react";
import { apiFetch } from "@/services/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // --- Profile Edit State ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: ""
  });

  // --- Address Form State ---
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null); // Track Edit Mode
  const [newAddr, setNewAddr] = useState({
    fullName: "",
    addressLine: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India"
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // 1. Fetch Profile
    apiFetch("/user/profile")
      .then((data) => {
        setUser(data);
        setFormData({
          name: data.name || (data.first_name + " " + data.last_name).trim() || "",
          phone: data.phone_number || data.phone || "" // Backend se phone_number aa sakta hai
        });
      })
      .catch((err) => console.error("Profile fetch failed", err));

    // 2. Fetch Addresses
    apiFetch("/user/address")
      .then(setAddresses)
      .catch((err) => console.error("Address fetch failed", err))
      .finally(() => setLoading(false));

  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
    setTimeout(() => window.location.reload(), 100); 
  };

  // ✅ UPDATE PROFILE
  const handleSaveProfile = async () => {
    try {
      const nameParts = formData.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      const updatedData = await apiFetch("/user/profile", {
        method: "PUT", 
        body: JSON.stringify({
          firstName, 
          lastName,
          phone: formData.phone
        })
      });

      const newUser = { ...user, ...formData, ...updatedData.user };
      if (updatedData.user) Object.assign(newUser, updatedData.user);

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      setIsEditing(false);
      alert("Profile Updated Successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to update profile.");
    }
  };

  // ✅ HANDLE ADDRESS SUBMIT (ADD OR UPDATE)
  const handleAddressSubmit = async () => {
    if(!newAddr.fullName || !newAddr.addressLine || !newAddr.city || !newAddr.zipCode) {
      return alert("Please fill all required address fields.");
    }

    try {
      let res:any;
      if (editingAddressId) {
        // UPDATE Existing Address
        res = await apiFetch(`/user/address/${editingAddressId}`, {
          method: "PUT",
          body: JSON.stringify(newAddr)
        });
        // Update list locally
        setAddresses(addresses.map(a => a.id === editingAddressId ? res.address : a));
        alert("Address Updated Successfully!");
      } else {
        // ADD New Address
        res = await apiFetch("/user/address", {
          method: "POST",
          body: JSON.stringify(newAddr)
        });
        setAddresses([res.address, ...addresses]);
        alert("Address Added Successfully!");
      }

      resetAddressForm();
    } catch (error: any) {
      alert(error.message || "Operation failed.");
    }
  };

  // ✅ EDIT ADDRESS CLICK
  const handleEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    setNewAddr({
      fullName: addr.full_name,
      addressLine: addr.address_line,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zip_code,
      country: addr.country || "India"
    });
    setShowAddressForm(true);
    // Scroll to form if needed
  };

  // ✅ DELETE ADDRESS
  const handleDeleteAddress = async (id: string) => {
    if(!confirm("Are you sure you want to delete this address?")) return;

    try {
      await apiFetch(`/user/address/${id}`, { method: "DELETE" });
      setAddresses(addresses.filter(a => a.id !== id)); // Remove from UI
    } catch (error: any) {
      alert(error.message || "Failed to delete address.");
    }
  };

  const resetAddressForm = () => {
    setNewAddr({ fullName: "", addressLine: "", city: "", state: "", zipCode: "", country: "India" });
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  const handleDeleteAccount = async () => {
    if (confirm("WARNING: This will delete your account, orders, and data permanently! Are you sure?")) {
      try {
        await apiFetch("/user/account", { method: "DELETE" });
        localStorage.clear();
        router.push("/login");
      } catch (error) {
        alert("Failed to delete account.");
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || (user.first_name ? `${user.first_name} ${user.last_name}` : "").trim() || "",
      phone: user.phone_number || user.phone || ""
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        Loading profile...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflowX: 'hidden',
      paddingBottom: '4rem'
    }}>
      
      {/* --- BACKGROUND BLOBS --- */}
      <div style={{ position: 'fixed', inset: '0', overflow: 'hidden', pointerEvents: 'none', zIndex: '0' }}>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div style={{ maxWidth: "64rem", margin: "0 auto", padding: "8rem 1.5rem 0", position: 'relative', zIndex: '10' }}>
        
        {/* --- Header Card --- */}
        <div className="glass-card header-card">
          <div className="avatar-box">
            <User size={48} />
          </div>

          <div style={{ flex: 1 }}>
            {isEditing ? (
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="edit-input title-input"
                placeholder="Enter full name"
              />
            ) : (
              <h1 className="user-name">
                {user.first_name} {user.last_name}
              </h1>
            )}
            
            <p className="user-status">
              <span className="status-dot"></span> 
              Active Member
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isEditing ? (
              <>
                <button onClick={handleSaveProfile} className="action-btn save-btn">
                  <Check size={18} /> Save
                </button>
                <button onClick={handleCancel} className="action-btn cancel-btn">
                  <X size={18} />
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="action-btn edit-btn">
                <Edit2 size={18} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid-layout">
          
          {/* --- Left Column: Personal Details & Address --- */}
          <div className="info-column">
            <div className="glass-card p-8">
              <h2 className="card-title mb-6">
                <User size={20} className="icon-primary" /> Personal Information
              </h2>
              
              <div className="info-list">
                {/* Email */}
                <div className="info-item">
                  <div className="info-icon"><Mail size={18} /></div>
                  <div style={{ flex: 1 }}>
                    <p className="info-label">Email Address</p>
                    <p className="info-value">{user.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="info-item">
                  <div className="info-icon"><Phone size={18} /></div>
                  <div style={{ flex: 1 }}>
                    <p className="info-label">Phone Number</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="edit-input"
                        placeholder="Add phone number"
                      />
                    ) : (
                      <p className="info-value">{user.phone_number || user.phone || "Not added"}</p>
                    )}
                  </div>
                </div>

                {/* --- ADDRESS SECTION --- */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={18} className="icon-primary" /> Saved Addresses
                        </h3>
                        <button 
                            onClick={() => {
                              if(showAddressForm) resetAddressForm(); 
                              else setShowAddressForm(true);
                            }} 
                            style={{ color: '#4f46e5', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <Plus size={16} style={{ transform: showAddressForm ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} /> 
                            {showAddressForm ? "Cancel" : "Add New"}
                        </button>
                    </div>

                    {/* Address Form */}
                    {showAddressForm && (
                        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '1rem', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                            <h4 style={{fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', color: '#475569'}}>
                              {editingAddressId ? "Edit Address" : "New Address"}
                            </h4>
                            <input className="edit-input mb-2" placeholder="Full Name" value={newAddr.fullName} onChange={e=>setNewAddr({...newAddr, fullName: e.target.value})} style={{ marginBottom: '0.5rem' }} />
                            <input className="edit-input mb-2" placeholder="Address Line" value={newAddr.addressLine} onChange={e=>setNewAddr({...newAddr, addressLine: e.target.value})} style={{ marginBottom: '0.5rem' }} />
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input className="edit-input" placeholder="City" value={newAddr.city} onChange={e=>setNewAddr({...newAddr, city: e.target.value})} />
                                <input className="edit-input" placeholder="Zip Code" value={newAddr.zipCode} onChange={e=>setNewAddr({...newAddr, zipCode: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <input className="edit-input" placeholder="State" value={newAddr.state} onChange={e=>setNewAddr({...newAddr, state: e.target.value})} />
                                <input className="edit-input" placeholder="Country" value={newAddr.country} onChange={e=>setNewAddr({...newAddr, country: e.target.value})} />
                            </div>
                            <button onClick={handleAddressSubmit} className="action-btn save-btn" style={{ width: '100%', justifyContent: 'center' }}>
                                {editingAddressId ? "Update Address" : "Save Address"}
                            </button>
                        </div>
                    )}

                    {/* Address List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {addresses.length === 0 ? (
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No addresses saved yet.</p>
                        ) : (
                            addresses.map((addr) => (
                                <div key={addr.id} className="group" style={{ padding: '1rem', background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', position: 'relative' }}>
                                    <div style={{ paddingRight: '4rem' }}>
                                      <p style={{ fontWeight: '700', marginBottom: '2px' }}>{addr.full_name}</p>
                                      <p style={{ color: '#475569', marginBottom: '2px' }}>{addr.address_line}</p>
                                      <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{addr.city}, {addr.state} - {addr.zip_code}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                          onClick={() => handleEditAddress(addr)}
                                          title="Edit"
                                          style={{ padding: '4px', color: '#4f46e5', background: '#e0e7ff', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                        >
                                          <Pencil size={14} />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteAddress(addr.id)}
                                          title="Delete"
                                          style={{ padding: '4px', color: '#dc2626', background: '#fee2e2', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

              </div>
            </div>
          </div>

          {/* --- Right Column: Quick Actions (Same) --- */}
          <div className="action-column">
            
            <div className="glass-card p-6">
              <h3 className="card-title">Account Actions</h3>
              
              <Link href="/orders" className="quick-link">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Package size={20} />
                  <span style={{ fontWeight: "600" }}>My Orders</span>
                </div>
                <span className="arrow-badge">→</span>
              </Link>

              <button onClick={handleLogout} className="quick-link logout">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <LogOut size={20} />
                  <span style={{ fontWeight: "600" }}>Log Out</span>
                </div>
              </button>

              <button onClick={handleDeleteAccount} className="quick-link delete">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Trash2 size={20} />
                  <span style={{ fontWeight: "600" }}>Delete Account</span>
                </div>
              </button>
            </div>

            <div className="premium-banner">
              <h4 style={{ fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Go Premium</h4>
              <p style={{ opacity: 0.9, fontSize: '0.875rem', marginBottom: '1rem' }}>Get free delivery on all orders!</p>
              <button className="upgrade-btn">Upgrade Now</button>
            </div>
          </div>
        </div>
      </div>

      {/* --- STYLES (Kept existing, added a few small tweaks) --- */}
      <style jsx global>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        .blob { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.4; animation: float 6s ease-in-out infinite; }
        .blob-1 { top: -10%; left: -10%; width: 600px; height: 600px; background: #a855f7; }
        .blob-2 { bottom: 10%; right: -10%; width: 500px; height: 500px; background: #22d3ee; animation-delay: 2s; }
        .blob-3 { top: 40%; left: 20%; width: 300px; height: 300px; background: #f472b6; filter: blur(100px); }

        .glass-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.6); border-radius: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header-card { padding: 2rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1.5rem; }
        .grid-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
        
        .avatar-box { width: 6rem; height: 6rem; background: #e0e7ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #4f46e5; border: 4px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .user-name { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2; }
        .user-status { color: #64748b; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }
        .status-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 0 2px #dcfce7; }

        .info-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
        .info-item { display: flex; align-items: center; padding: 1rem; background: rgba(255,255,255,0.6); border-radius: 1rem; border: 1px solid rgba(255,255,255,0.8); transition: transform 0.2s; }
        .info-item:hover { transform: translateY(-2px); background: #fff; }
        .info-icon { width: 2.5rem; height: 2.5rem; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 1rem; color: #94a3b8; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .info-label { font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin: 0; letter-spacing: 0.05em; }
        .info-value { color: #334155; font-weight: 600; margin: 0; font-size: 1rem; }
        .card-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
        .icon-primary { color: #4f46e5; }

        .edit-input { width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 1rem; color: #0f172a; background: #fff; outline: none; transition: border-color 0.2s; }
        .edit-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        .title-input { font-size: 1.5rem; font-weight: 700; padding: 0.25rem 0.5rem; margin-bottom: 0.25rem; }

        .action-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 0.75rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; font-size: 0.875rem; }
        .edit-btn { background: #0f172a; color: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .edit-btn:hover { background: #1e293b; transform: translateY(-2px); }
        .save-btn { background: #22c55e; color: #fff; }
        .save-btn:hover { background: #16a34a; }
        .cancel-btn { background: #ef4444; color: #fff; padding: 0.6rem; }
        .cancel-btn:hover { background: #dc2626; }

        .quick-link { display: flex; align-items: center; justify-content: space-between; padding: 1rem; margin-bottom: 0.75rem; border-radius: 1rem; background: #e0e7ff; color: #4f46e5; text-decoration: none; transition: all 0.2s; border: none; width: 100%; font-size: 1rem; cursor: pointer; }
        .quick-link:hover { transform: scale(1.02); background: #c7d2fe; }
        .quick-link.logout { background: #fef2f2; color: #dc2626; }
        .quick-link.logout:hover { background: #fee2e2; }
        .quick-link.delete { background: #fee2e2; color: #b91c1c; }
        .quick-link.delete:hover { background: #fecaca; }
        
        .arrow-badge { background: #fff; padding: 0.25rem 0.5rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 700; color: #4f46e5; }

        .premium-banner { background: linear-gradient(135deg, #4f46e5, #9333ea); border-radius: 1.5rem; padding: 1.5rem; text-align: center; color: #fff; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3); margin-top: 1.5rem; }
        .upgrade-btn { background: #fff; color: #4f46e5; padding: 0.5rem 1rem; border-radius: 0.75rem; font-weight: 700; border: none; cursor: pointer; transition: transform 0.2s; font-size: 0.875rem; }
        .upgrade-btn:hover { transform: scale(1.05); }

        @media (max-width: 768px) {
          .header-card { flex-direction: column; text-align: center; }
          .grid-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}