// src/pages/GuestProfile.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'https://test-backend-hd6i.onrender.com/api';

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra',
  'Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret',
  'Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda',
  'Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem',
  "M'Sila",'Mascara','Ouargla','Oran','El Bayadh','Illizi',
  'Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt',
  'El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla',
  'Naâma','Aïn Témouchent','Ghardaïa','Relizane','Timimoun',
  'Bordj Badji Mokhtar','Ouled Djellal','Béni Abbès','In Salah',
  'In Guezzam','Touggourt','Djanet',"El M'Ghair",'El Meniaa',
];

const CIVIL_STATES = ['Célibataire', 'Marié', 'Mariée'];

function GuestProfile() {
  const navigate = useNavigate();
  const { user, isGuest, updateGuestData } = useAuth();

  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    full_name:   user?.full_name   || '',
    email:       user?.email       || '',
    username:    user?.username    || '',
    num_tele:    user?.num_tele    || '',
    wilaya:      user?.wilaya      || '',
    age:         user?.age         || '',
    civil_state: user?.civil_state || '',
  });

  if (!user || !isGuest()) { navigate('/'); return null; }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.full_name.trim()) errors.full_name = 'Required';
    if (!formData.email.trim())     errors.email     = 'Required';
    if (!formData.username.trim())  errors.username  = 'Required';
    if (formData.num_tele && !/^0\d{9}$/.test(formData.num_tele))
      errors.num_tele = 'Must be 10 digits starting with 0';
    if (formData.age && (Number(formData.age) < 18 || Number(formData.age) > 120))
      errors.age = 'Must be between 18 and 120';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) return setFieldErrors(errors);
    setLoading(true); setError(null); setSuccess(false);
    try {
      const res  = await fetch(`${API}/guests/${user.user_id}/profile`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      updateGuestData({ ...formData, civil_state: formData.civil_state });
      setSuccess(true);
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Full Name', name: 'full_name', type: 'text'   },
    { label: 'Username',  name: 'username',  type: 'text'   },
    { label: 'Email',     name: 'email',     type: 'email'  },
    { label: 'Phone',     name: 'num_tele',  type: 'text',  placeholder: '0XXXXXXXXX' },
    { label: 'Age',       name: 'age',       type: 'number' },
  ];

  const inputStyle = (name) => ({
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${fieldErrors[name] ? 'rgba(220,50,50,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 8,
    padding: '9px 12px',
    color: '#fff',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  });

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh', background: '#0a1628' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button onClick={() => navigate('/guest')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>←</button>
          <div>
            <div style={{ color: '#c9a84c', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Account</div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>Edit Profile</div>
          </div>
        </div>

        <div style={{ background: '#13213a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 32 }}>
          {error && (
            <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#ff6b6b', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 20 }}>{error}</div>
          )}
          {success && (
            <div style={{ background: 'rgba(100,200,100,0.1)', border: '1px solid rgba(100,200,100,0.3)', color: '#6fcf6f', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 20 }}>✓ Profile updated successfully</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Text / number fields */}
              {fields.map(({ label, name, type, placeholder }) => (
                <div key={name}>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                  <input
                    type={type} name={name} value={formData[name]}
                    onChange={handleChange} placeholder={placeholder || ''}
                    min={name === 'age' ? 18 : undefined}
                    max={name === 'age' ? 120 : undefined}
                    style={inputStyle(name)}
                  />
                  {fieldErrors[name] && <div style={{ color: '#ff6b6b', fontSize: 11, marginTop: 4 }}>{fieldErrors[name]}</div>}
                </div>
              ))}

              {/* Wilaya */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Wilaya</div>
                <select name="wilaya" value={formData.wilaya} onChange={handleChange}
                  style={{ ...inputStyle('wilaya'), cursor: 'pointer' }}>
                  <option value="" style={{ background: '#13213a' }}>Select wilaya</option>
                  {WILAYAS.map(w => <option key={w} value={w} style={{ background: '#13213a' }}>{w}</option>)}
                </select>
              </div>

              {/* Civil State */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Civil State</div>
                <select name="civil_state" value={formData.civil_state} onChange={handleChange}
                  style={{ ...inputStyle('civil_state'), cursor: 'pointer' }}>
                  <option value="" style={{ background: '#13213a' }}>Select civil state</option>
                  {CIVIL_STATES.map(s => (
                    <option key={s} value={s} style={{ background: '#13213a' }}>{s}</option>
                  ))}
                </select>
              </div>

            </div>

            <button type="submit" disabled={loading}
              style={{ marginTop: 24, width: '100%', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GuestProfile;