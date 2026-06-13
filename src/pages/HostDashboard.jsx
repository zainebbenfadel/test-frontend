// src/pages/HostDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatList from '../components/conversationList.jsx';

function HostDashboard({ showToast }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activeTab, setActiveTab] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  const [unreadCount, setUnreadCount] = useState(0);  
  
  // Profile states
  const [hostProfile, setHostProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    age: '',
    num_tele: '',
    email: '',
    emploi: '',
    wilaya: '',
    username: '',
    profile_image: ''
  });
  const profileImageInputRef = useRef(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  
  // Image upload states
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  
  // Video upload states
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoFileName, setVideoFileName] = useState('');
  const videoInputRef = useRef(null);
  
  const [tagInput, setTagInput] = useState('');
  
  const algerianWilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M’Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane'
  ];

  const [propertyForm, setPropertyForm] = useState({
    title: '',
    location: '',
    google_maps_url: '',
    price: '',
    rental_type: 'day',
    tags: [],
    badge: '',
    category: '',
    description: '',
    video: '',
    status: 'pending',
    voyageurs: '',
    chambres: '',
    salle_de_bain: '',
    surface: '',
    wilaya: ''
  });

  useEffect(() => {
    fetchProperties();
    fetchBookings();
    fetchHostProfile();
  }, []);

  const fetchHostProfile = async () => {
    try {
      const host = JSON.parse(localStorage.getItem('host_user'));
      if (!host) return;
      
      const response = await fetch(`https://test-backend-hd6i.onrender.com/api/hosts/${host.host_id}/profile`);
      if (response.ok) {
        const data = await response.json();
        setHostProfile(data);
        setProfileForm({
          full_name: data.full_name || '',
          age: data.age || '',
          num_tele: data.num_tele || '',
          email: data.email || '',
          emploi: data.emploi || '',
          wilaya: data.wilaya || '',
          username: data.username || '',
          profile_image: data.profile_image || ''
        });
        if (data.profile_image) {
          setProfileImagePreview(data.profile_image);
        }
      }
    } catch (err) {
      console.error('Error fetching host profile:', err);
    }
  };

  const handleProfileImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Please select a valid image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ Image size should be less than 5MB');
      return;
    }
    
    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadProfileImage = async () => {
    if (!profileImageFile) return null;
    
    const formData = new FormData();
    formData.append('image', profileImageFile);
    
    try {
      const response = await fetch('https://test-backend-hd6i.onrender.com/api/upload/profile-image', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      }
      return null;
    } catch (err) {
      console.error('Error uploading profile image:', err);
      return null;
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUploadingProfileImage(true);
      const host = JSON.parse(localStorage.getItem('host_user'));
      if (!host) return;
      
      let profileImageUrl = profileForm.profile_image;
      
      if (profileImageFile) {
        const uploadedUrl = await uploadProfileImage();
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        }
      }
      
      const response = await fetch(`https://test-backend-hd6i.onrender.com/api/hosts/${host.host_id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profileForm.full_name,
          age: profileForm.age ? parseInt(profileForm.age) : null,
          num_tele: profileForm.num_tele,
          email: profileForm.email,
          emploi: profileForm.emploi,
          wilaya: profileForm.wilaya,
          username: profileForm.username,
          profile_image: profileImageUrl
        })
      });
      
      if (response.ok) {
        showToast('✅ Profile updated successfully!');
        setEditingProfile(false);
        fetchHostProfile();
      } else {
        const data = await response.json();
        showToast(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast('❌ Error updating profile');
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const host = JSON.parse(localStorage.getItem('host_user'));
      if (!host) return;
      const response = await fetch(`https://test-backend-hd6i.onrender.com/api/host/properties?host_id=${host.host_id}`);
      const data = await response.json();
      if (response.ok) setProperties(data);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const host = JSON.parse(localStorage.getItem('host_user'));
      if (!host || !host.host_id) {
        console.log('No host found in localStorage');
        return;
      }
      
      const response = await fetch(`https://test-backend-hd6i.onrender.com/api/bookings/host/${host.host_id}`);
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setBookings([]);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      showToast('⚠️ Please select valid image files');
      return;
    }
    
    const currentCount = imageFiles.length;
    const newCount = validFiles.length;
    const totalCount = currentCount + newCount;
    
    if (totalCount > 5) {
      showToast(`⚠️ You can only upload exactly 5 photos. You currently have ${currentCount} photo(s) and are trying to add ${newCount} more. Maximum is 5 photos total.`);
      return;
    }
    
    setImageFiles(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removeImage = (indexToRemove) => {
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      showToast('⚠️ Please select a valid video file');
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) {
      showToast('⚠️ Video file size should be less than 100MB');
      return;
    }
    
    setVideoFile(file);
    setVideoFileName(file.name);
    const videoUrl = URL.createObjectURL(file);
    setVideoPreview(videoUrl);
  };
  
  const removeVideo = () => {
    if (videoPreview && videoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    setVideoFileName('');
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };
  
  const uploadImagesToServer = async () => {
    if (imageFiles.length === 0) return [];
    
    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
    
    try {
      const response = await fetch('https://test-backend-hd6i.onrender.com/api/upload/property-images', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.imageUrls;
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error('Error uploading images:', err);
      showToast('❌ Failed to upload images');
      return [];
    }
  };
  
  const uploadVideoToServer = async () => {
    if (!videoFile) return null;
    
    const formData = new FormData();
    formData.append('video', videoFile);
    
    try {
      const response = await fetch('https://test-backend-hd6i.onrender.com/api/upload/property-video', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.videoUrl;
      } else {
        throw new Error('Video upload failed');
      }
    } catch (err) {
      console.error('Error uploading video:', err);
      showToast('❌ Failed to upload video');
      return null;
    }
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setPropertyForm({
      title: '',
      location: '',
      google_maps_url: '',
      price: '',
      rental_type: 'day',
      tags: [],
      badge: '',
      category: '',
      description: '',
      video: '',
      status: 'pending',
      voyageurs: '',
      chambres: '',
      salle_de_bain: '',
      surface: '',
      wilaya: ''
    });
    setImageFiles([]);
    setImagePreviews([]);
    setVideoFile(null);
    setVideoPreview(null);
    setVideoFileName('');
    setShowPropertyModal(true);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setPropertyForm({
      title: property.title || '',
      location: property.location || '',
      google_maps_url: property.google_maps_url || '',
      price: property.price || '',
      rental_type: property.rental_type || 'day',
      tags: property.tags || [],
      badge: property.badge || '',
      category: property.category || '',
      description: property.description || '',
      video: property.video || '',
      status: property.status || 'pending',
      voyageurs: property.voyageurs || '',
      chambres: property.chambres || '',
      salle_de_bain: property.salle_de_bain || '',
      surface: property.surface || '',
      wilaya: property.wilaya || ''
    });
    if (property.img && Array.isArray(property.img)) {
      setImagePreviews(property.img);
    } else if (property.img) {
      setImagePreviews([property.img]);
    }
    if (property.video) {
      setVideoPreview(property.video);
      setVideoFileName('Existing video');
    }
    setImageFiles([]);
    setVideoFile(null);
    setShowPropertyModal(true);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      const host = JSON.parse(localStorage.getItem('host_user'));
      const response = await fetch(
        `https://test-backend-hd6i.onrender.com/api/host/properties/${propertyId}?host_id=${host.host_id}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        showToast('✅ Property deleted!');
        fetchProperties();
      }
    } catch (err) {
      showToast('❌ Error deleting property');
    }
  };

  const handleSubmitProperty = async (e) => {
    e.preventDefault();
    
    if (!propertyForm.title || !propertyForm.location || !propertyForm.price) {
      showToast('⚠️ Please fill in all required fields.');
      return;
    }
    
    if (!editingProperty && imageFiles.length + imagePreviews.filter(url => url.startsWith('http')).length !== 5) {
      showToast('⚠️ Please upload exactly 5 photos for your property.');
      return;
    }
    
    if (editingProperty && imageFiles.length === 0 && imagePreviews.length === 0) {
      showToast('⚠️ Please upload at least one image.');
      return;
    }
    
    setUploadingImages(true);
    setUploadingVideo(true);
    
    try {
      let imageUrls = imagePreviews;
      let videoUrl = propertyForm.video;
      
      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadImagesToServer();
        if (uploadedUrls.length > 0) {
          const existingUrls = imagePreviews.filter(url => url.startsWith('http'));
          imageUrls = [...existingUrls, ...uploadedUrls];
        }
      }
      
      if (videoFile) {
        const uploadedVideoUrl = await uploadVideoToServer();
        if (uploadedVideoUrl) {
          videoUrl = uploadedVideoUrl;
        }
      }
      
      const host = JSON.parse(localStorage.getItem('host_user'));
      const url = editingProperty
        ? `https://test-backend-hd6i.onrender.com/api/host/properties/${editingProperty.property_id}`
        : 'https://test-backend-hd6i.onrender.com/api/host/properties';
      
      const method = editingProperty ? 'PUT' : 'POST';
      
      const requestBody = {
        host_id: host.host_id,
        title: propertyForm.title,
        location: propertyForm.location,
        google_maps_url: propertyForm.google_maps_url,
        price_per_night: parseFloat(propertyForm.price),
        rental_type: propertyForm.rental_type,
        img: imageUrls,
        tags: propertyForm.tags,
        badge: propertyForm.badge || null,
        category: propertyForm.category || null,
        description: propertyForm.description || null,
        video: videoUrl,
        status: propertyForm.status,
        voyageurs: propertyForm.voyageurs ? parseInt(propertyForm.voyageurs) : null,
        chambres: propertyForm.chambres ? parseInt(propertyForm.chambres) : null,
        salle_de_bain: propertyForm.salle_de_bain ? parseInt(propertyForm.salle_de_bain) : null,
        surface: propertyForm.surface || null,
        wilaya: propertyForm.wilaya || null
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(editingProperty ? '✅ Property updated!' : '✅ Property added!');
        setShowPropertyModal(false);
        fetchProperties();
      } else {
        console.error('Error response:', data);
        showToast(`❌ ${data.error || 'Failed to save property'}`);
      }
    } catch (err) {
      console.error('Error saving property:', err);
      showToast('❌ Error saving property');
    } finally {
      setUploadingImages(false);
      setUploadingVideo(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const status = action === 'approve' ? 'confirmed' : 'cancelled';
      
      const response = await fetch(`https://test-backend-hd6i.onrender.com/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        showToast(`✅ Réservation ${status === 'confirmed' ? 'confirmée' : 'refusée'} !`);
        if (status === 'confirmed') {
          const confirmedBooking = bookings.find(b => b.booking_id === bookingId)
          if (confirmedBooking) {
            await cancelOverlappingBookings(confirmedBooking)
          }
        }
        fetchBookings();
      } else {
        const data = await response.json();
        showToast(`❌ ${data.error || 'Erreur lors du traitement'}`);
      }
    } catch (err) {
      showToast('❌ Erreur lors du traitement');
    }
  }

  const cancelOverlappingBookings = async (confirmedBooking) => {
    try {
      await fetch(`https://test-backend-hd6i.onrender.com/api/bookings/cancel-overlapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: confirmedBooking.booking_id,
          property_id: confirmedBooking.property_id,
          arrival: confirmedBooking.arrival,
          departure: confirmedBooking.departure
        })
      })
    } catch (err) {
      console.error('Error cancelling overlapping bookings:', err)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !propertyForm.tags.includes(tagInput.trim())) {
      setPropertyForm({
        ...propertyForm,
        tags: [...propertyForm.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setPropertyForm({
      ...propertyForm,
      tags: propertyForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/host');
    showToast('👋 Logged out successfully');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Responsive Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: isMobile ? '16px 20px' : '20px 48px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '16px' : '0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: isMobile ? '24px' : '28px',
            color: '#2c1810',
            margin: 0
          }}>
            Host Dashboard
          </h1>
          <p style={{ color: '#666', margin: '4px 0 0', fontSize: isMobile ? '12px' : '14px' }}>
            Welcome back, {user?.full_name || 'Host'}!
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '8px' : '16px', 
          flexWrap: 'wrap',
          width: isMobile ? '100%' : 'auto'
        }}>
          <button
            onClick={() => setActiveTab('properties')}
            style={{
              padding: isMobile ? '8px 12px' : '10px 20px',
              background: activeTab === 'properties' ? '#c9a84c' : 'transparent',
              color: activeTab === 'properties' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: isMobile ? '13px' : '14px'
            }}
          >
            My Properties
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: isMobile ? '8px 12px' : '10px 20px',
              background: activeTab === 'bookings' ? '#c9a84c' : 'transparent',
              color: activeTab === 'bookings' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: isMobile ? '13px' : '14px'
            }}
          >
            Booking Requests
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: isMobile ? '8px 12px' : '10px 20px',
              background: activeTab === 'profile' ? '#c9a84c' : 'transparent',
              color: activeTab === 'profile' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: isMobile ? '13px' : '14px'
            }}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            style={{
              padding: isMobile ? '8px 12px' : '10px 20px',
              background: activeTab === 'messages' ? '#c9a84c' : 'transparent',
              color: activeTab === 'messages' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              position: 'relative',
              fontSize: isMobile ? '13px' : '14px'
            }}
          >
            💬 Messages
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: isMobile ? '8px 12px' : '10px 20px',
              background: '#4c9aff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: isMobile ? '13px' : '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🏠 Home
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: isMobile ? '8px 12px' : '10px 20px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: isMobile ? '13px' : '14px'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: isMobile ? '100px 16px 48px' : '140px 48px 48px' 
      }}>
        
        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between', 
              alignItems: isMobile ? 'flex-start' : 'center', 
              gap: isMobile ? '16px' : '0',
              marginBottom: '32px' 
            }}>
              <div>
                <h2 style={{ fontSize: isMobile ? '22px' : '24px', color: '#333', marginBottom: '8px' }}>My Properties</h2>
                <p style={{ color: '#666', fontSize: isMobile ? '13px' : '14px' }}>Manage your listings, add new spaces, or update existing ones.</p>
              </div>
              <button
                onClick={handleAddProperty}
                style={{
                  background: '#c9a84c',
                  color: 'white',
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: isMobile ? '13px' : '14px'
                }}
              >
                + Add New Property
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>
            ) : properties.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: isMobile ? '40px' : '80px',
                background: 'white',
                borderRadius: '12px',
                color: '#999'
              }}>
                <p>No properties yet. Click "Add New Property" to get started!</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(350px, 1fr))'),
                gap: '24px'
              }}>
                {properties.map(property => (
                  <div key={property.property_id} 
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {(property.img?.length > 0 || property.images?.length > 0) && (
                      <img 
                        src={property.img?.[0] || property.images?.[0]}
                        alt={property.title}
                        style={{ width: '100%', height: isMobile ? '180px' : '200px', objectFit: 'cover' }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <div style={{ padding: isMobile ? '16px' : '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 style={{ fontSize: isMobile ? '16px' : '18px', color: '#333', margin: 0 }}>{property.title}</h3>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: isMobile ? '10px' : '12px',
                          background: property.status === 'approved' ? '#e8f5e9' : '#fff3e0',
                          color: property.status === 'approved' ? '#2e7d32' : '#ed6c02'
                        }}>
                          {property.status || 'pending'}
                        </span>
                      </div>
                      
                      <p style={{ color: '#666', fontSize: isMobile ? '12px' : '14px', marginBottom: '8px' }}>
                        📍 {property.location}
                      </p>
                      
                      {property.wilaya && (
                        <p style={{ color: '#666', fontSize: isMobile ? '12px' : '14px', marginBottom: '8px' }}>
                          🏙️ Wilaya: {property.wilaya}
                        </p>
                      )}
                      
                      <p style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 'bold', color: '#c9a84c', marginBottom: '12px' }}>
                        {property.price} DA
                        <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#999' }}>
                          /{property.rental_type === 'day' ? 'night' : property.rental_type === 'month' ? 'month' : 'year'}
                        </span>
                      </p>
                      
                      {(property.chambres || property.voyageurs || property.salle_de_bain) && (
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: isMobile ? '11px' : '13px', color: '#666', flexWrap: 'wrap' }}>
                          {property.voyageurs && <span>👥 {property.voyageurs} guests</span>}
                          {property.chambres && <span>🛏️ {property.chambres} beds</span>}
                          {property.salle_de_bain && <span>🚿 {property.salle_de_bain} baths</span>}
                        </div>
                      )}
                      
                      {property.tags && property.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                          {property.tags.slice(0, 3).map(tag => (
                            <span key={tag} style={{
                              padding: '4px 8px',
                              background: '#f0f0f0',
                              borderRadius: '4px',
                              fontSize: isMobile ? '10px' : '12px',
                              color: '#666'
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #e0e0e0', paddingTop: '16px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEditProperty(property)}
                          style={{
                            flex: 1,
                            padding: isMobile ? '6px' : '8px',
                            background: '#4c9aff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: isMobile ? '11px' : '13px'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.property_id)}
                          style={{
                            flex: 1,
                            padding: isMobile ? '6px' : '8px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: isMobile ? '11px' : '13px'
                          }}
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={() => navigate(`/host/property/${property.property_id}`)}
                          style={{
                            flex: 1,
                            padding: isMobile ? '6px' : '8px',
                            background: '#c9a84c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: isMobile ? '11px' : '13px'
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'messages' && (
          <ChatList currentUser={user} showToast={showToast} />
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <>
            <h2 style={{ fontSize: isMobile ? '22px' : '24px', color: '#333', marginBottom: '8px' }}>Guest Booking Requests</h2>
            <p style={{ color: '#666', marginBottom: '32px', fontSize: isMobile ? '13px' : '14px' }}>Guests who want to rent your properties.</p>

            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: isMobile ? '40px' : '80px', background: 'white', borderRadius: '12px', color: '#999' }}>
                <p>No booking requests yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bookings.map(booking => {
                  const nights = Math.max(0, Math.floor((new Date(booking.departure) - new Date(booking.arrival)) / 86400000));
                  
                  return (
                    <div key={booking.booking_id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: isMobile ? '16px' : '20px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: isMobile ? '16px' : '18px', color: '#333', marginBottom: '4px' }}>
                            {booking.guest_name || booking.guest?.full_name || 'Guest'}
                          </h3>
                          <p style={{ color: '#666', fontSize: isMobile ? '12px' : '14px' }}>
                            📧 {booking.guest_email || booking.guest?.email || 'Email non disponible'}
                          </p>
                          {booking.guest_phone && (
                            <p style={{ color: '#666', fontSize: isMobile ? '12px' : '14px' }}>
                              📞 {booking.guest_phone}
                            </p>
                          )}
                        </div>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: isMobile ? '11px' : '12px',
                          background: booking.status === 'pending' ? '#fff3e0' : 
                                    booking.status === 'confirmed' ? '#e8f5e9' : 
                                    booking.status === 'cancelled' ? '#ffebee' : '#f0f0f0',
                          color: booking.status === 'pending' ? '#ed6c02' : 
                                booking.status === 'confirmed' ? '#2e7d32' : 
                                booking.status === 'cancelled' ? '#d32f2f' : '#666'
                        }}>
                          {booking.status === 'pending' ? 'En attente' : 
                          booking.status === 'confirmed' ? 'Confirmée' : 
                          booking.status === 'cancelled' ? 'Annulée' : booking.status}
                        </span>
                      </div>
                      
                      <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px', marginBottom: '16px' }}>
                        <p style={{ marginBottom: '8px', fontSize: isMobile ? '13px' : '14px' }}>
                          <strong>Property:</strong> {booking.property_name || '—'}
                        </p>
                        <p style={{ marginBottom: '8px', fontSize: isMobile ? '13px' : '14px' }}>
                          <strong>Dates:</strong> {new Date(booking.arrival).toLocaleDateString()} - {new Date(booking.departure).toLocaleDateString()}
                          ({nights} nuit{nights > 1 ? 's' : ''})
                        </p>
                        <p style={{ marginBottom: '8px', fontSize: isMobile ? '13px' : '14px' }}>
                          <strong>Guests:</strong> {booking.travelers || 'Non spécifié'}
                        </p>
                        <p style={{ marginBottom: '8px', fontSize: isMobile ? '13px' : '14px' }}>
                          <strong>Total Price:</strong> <span style={{ color: '#c9a84c', fontWeight: 'bold' }}>
                            {Number(booking.total_price).toLocaleString('fr-DZ')} DA
                          </span>
                        </p>
                      </div>
                      
                      {booking.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleBookingAction(booking.booking_id, 'approve')}
                            style={{
                              flex: 1,
                              padding: isMobile ? '8px' : '10px',
                              background: '#22c55e',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: isMobile ? '13px' : '14px'
                            }}
                          >
                            ✓ Confirmer
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking.booking_id, 'reject')}
                            style={{
                              flex: 1,
                              padding: isMobile ? '8px' : '10px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: isMobile ? '13px' : '14px'
                            }}
                          >
                            ✗ Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}          
          </>
        )}
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: isMobile ? '22px' : '24px', color: '#333', marginBottom: '8px' }}>My Profile</h2>
                <p style={{ color: '#666', fontSize: isMobile ? '13px' : '14px' }}>View and manage your personal information</p>
              </div>
              {!editingProfile ? (
                <button
                  onClick={() => setEditingProfile(true)}
                  style={{
                    background: '#c9a84c',
                    color: 'white',
                    padding: isMobile ? '10px 20px' : '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setEditingProfile(false);
                      fetchHostProfile();
                    }}
                    style={{
                      padding: isMobile ? '10px 20px' : '12px 24px',
                      background: '#f0f0f0',
                      color: '#666',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: isMobile ? '13px' : '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={uploadingProfileImage}
                    style={{
                      padding: isMobile ? '10px 20px' : '12px 24px',
                      background: '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: uploadingProfileImage ? 'not-allowed' : 'pointer',
                      fontWeight: 500,
                      opacity: uploadingProfileImage ? 0.6 : 1,
                      fontSize: isMobile ? '13px' : '14px'
                    }}
                  >
                    {uploadingProfileImage ? 'Uploading...' : '💾 Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: isMobile ? '20px' : '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {/* Profile Image */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div 
                    style={{
                      width: isMobile ? '100px' : '120px',
                      height: isMobile ? '100px' : '120px',
                      borderRadius: '60px',
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      marginBottom: '12px',
                      cursor: editingProfile ? 'pointer' : 'default'
                    }}
                    onClick={() => editingProfile && profileImageInputRef.current?.click()}
                  >
                    {profileImagePreview ? (
                      <img 
                        src={profileImagePreview} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: isMobile ? '40px' : '48px' }}>👤</span>
                    )}
                    {editingProfile && (
                      <input
                        ref={profileImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageSelect}
                        style={{ display: 'none' }}
                      />
                    )}
                  </div>
                  {editingProfile && (
                    <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#999' }}>Click to change profile picture</p>
                  )}
                </div>
              </div>

              {/* Profile Information */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>Full Name</label>
                  {editingProfile ? (
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: isMobile ? '14px' : '14px' }}
                    />
                  ) : (
                    <p style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', color: '#666', fontSize: isMobile ? '13px' : '14px' }}>
                      {hostProfile?.full_name || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>Username</label>
                  {editingProfile ? (
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: isMobile ? '14px' : '14px' }}
                    />
                  ) : (
                    <p style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', color: '#666', fontSize: isMobile ? '13px' : '14px' }}>
                      {hostProfile?.username || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>Email</label>
                  {editingProfile ? (
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: isMobile ? '14px' : '14px' }}
                    />
                  ) : (
                    <p style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', color: '#666', fontSize: isMobile ? '13px' : '14px' }}>
                      {hostProfile?.email || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>Phone Number</label>
                  {editingProfile ? (
                    <input
                      type="tel"
                      value={profileForm.num_tele}
                      onChange={(e) => setProfileForm({...profileForm, num_tele: e.target.value})}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: isMobile ? '14px' : '14px' }}
                    />
                  ) : (
                    <p style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', color: '#666', fontSize: isMobile ? '13px' : '14px' }}>
                      {hostProfile?.num_tele || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>Age</label>
                  {editingProfile ? (
                    <input
                      type="number"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({...profileForm, age: e.target.value})}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: isMobile ? '14px' : '14px' }}
                    />
                  ) : (
                    <p style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', color: '#666', fontSize: isMobile ? '13px' : '14px' }}>
                      {hostProfile?.age || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>Employment / Job</label>
                  {editingProfile ? (
                    <input
                      type="text"
                      value={profileForm.emploi}
                      onChange={(e) => setProfileForm({...profileForm, emploi: e.target.value})}
                      placeholder="e.g., Engineer, Teacher, Student, etc."
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: isMobile ? '14px' : '14px' }}
                    />
                  ) : (
                    <p style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', color: '#666', fontSize: isMobile ? '13px' : '14px' }}>
                      {hostProfile?.emploi || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>Wilaya</label>
                  {editingProfile ? (
                    <select
                      value={profileForm.wilaya}
                      onChange={(e) => setProfileForm({...profileForm, wilaya: e.target.value})}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: isMobile ? '14px' : '14px' }}
                    >
                      <option value="">Select Wilaya</option>
                      {algerianWilayas.map(wilaya => (
                        <option key={wilaya} value={wilaya}>{wilaya}</option>
                      ))}
                    </select>
                  ) : (
                    <p style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', color: '#666', fontSize: isMobile ? '13px' : '14px' }}>
                      {hostProfile?.wilaya || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Property Modal */}
      {showPropertyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          overflow: 'auto',
          padding: isMobile ? '16px' : '0'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: isMobile ? '95%' : '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: isMobile ? '20px' : '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: isMobile ? '20px' : '24px', color: '#333' }}>
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h2>
              <button
                onClick={() => setShowPropertyModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitProperty}>
              {/* Basic Information - responsive grid */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: isMobile ? '16px' : '18px', marginBottom: '16px', color: '#c9a84c' }}>Basic Information</h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>
                    Property Title *
                  </label>
                  <input
                    type="text"
                    value={propertyForm.title}
                    onChange={(e) => setPropertyForm({...propertyForm, title: e.target.value})}
                    placeholder="e.g., Beautiful Touristic Villa"
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px' : '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '14px' : '14px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>
                    Wilaya (Algerian Province) *
                  </label>
                  <select
                    value={propertyForm.wilaya}
                    onChange={(e) => setPropertyForm({...propertyForm, wilaya: e.target.value})}
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px' : '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '14px' : '14px'
                    }}
                    required
                  >
                    <option value="">Select Wilaya</option>
                    {algerianWilayas.map(wilaya => (
                      <option key={wilaya} value={wilaya}>{wilaya}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>
                    Address / Location
                  </label>
                  <input
                    type="text"
                    value={propertyForm.location}
                    onChange={(e) => setPropertyForm({...propertyForm, location: e.target.value})}
                    placeholder="Full address of the property"
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px' : '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '14px' : '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>
                    Google Maps URL *
                  </label>
                  <input
                    type="url"
                    value={propertyForm.google_maps_url}
                    onChange={(e) => setPropertyForm({...propertyForm, google_maps_url: e.target.value})}
                    placeholder="https://maps.google.com/..."
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px' : '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '14px' : '14px'
                    }}
                    required
                  />
                  <p style={{ fontSize: isMobile ? '10px' : '12px', color: '#999', marginTop: '4px' }}>
                    Paste the Google Maps share link for your property location
                  </p>
                </div>
              </div>

              {/* Property Details - responsive grid */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: isMobile ? '16px' : '18px', marginBottom: '16px', color: '#c9a84c' }}>Property Details</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>
                      Max Guests (voyageurs)
                    </label>
                    <input
                      type="number"
                      value={propertyForm.voyageurs}
                      onChange={(e) => setPropertyForm({...propertyForm, voyageurs: e.target.value})}
                      placeholder="Number of guests"
                      style={{
                        width: '100%',
                        padding: isMobile ? '10px' : '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: isMobile ? '14px' : '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>
                      Bedrooms (chambres)
                    </label>
                    <input
                      type="number"
                      value={propertyForm.chambres}
                      onChange={(e) => setPropertyForm({...propertyForm, chambres: e.target.value})}
                      placeholder="Number of bedrooms"
                      style={{
                        width: '100%',
                        padding: isMobile ? '10px' : '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: isMobile ? '14px' : '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>
                      Bathrooms (salle de bain)
                    </label>
                    <input
                      type="number"
                      value={propertyForm.salle_de_bain}
                      onChange={(e) => setPropertyForm({...propertyForm, salle_de_bain: e.target.value})}
                      placeholder="Number of bathrooms"
                      style={{
                        width: '100%',
                        padding: isMobile ? '10px' : '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: isMobile ? '14px' : '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>
                      Surface Area (m²)
                    </label>
                    <input
                      type="text"
                      value={propertyForm.surface}
                      onChange={(e) => setPropertyForm({...propertyForm, surface: e.target.value})}
                      placeholder="e.g., 120 m²"
                      style={{
                        width: '100%',
                        padding: isMobile ? '10px' : '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: isMobile ? '14px' : '14px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: isMobile ? '16px' : '18px', marginBottom: '16px', color: '#c9a84c' }}>Pricing Information</h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>
                    Rental Type *
                  </label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[
                      { value: 'day', emoji: '📅', label: 'Per Day' },
                      { value: 'month', emoji: '📆', label: 'Per Month' },
                      { value: 'year', emoji: '🗓️', label: 'Per Year' }
                    ].map(opt => (
                      <label key={opt.value} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        cursor: 'pointer',
                        padding: isMobile ? '8px 12px' : '10px 20px',
                        border: propertyForm.rental_type === opt.value ? '2px solid #c9a84c' : '1px solid #ddd',
                        borderRadius: '8px',
                        background: propertyForm.rental_type === opt.value ? '#c9a84c10' : 'white',
                      }}>
                        <input
                          type="radio"
                          name="rental_type"
                          value={opt.value}
                          checked={propertyForm.rental_type === opt.value}
                          onChange={(e) => setPropertyForm({...propertyForm, rental_type: e.target.value})}
                          style={{ margin: 0 }}
                        />
                        <span style={{ fontSize: isMobile ? '12px' : '14px' }}>{opt.emoji} {opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>
                    Price (DA) *
                  </label>
                  <input
                    type="number"
                    value={propertyForm.price}
                    onChange={(e) => setPropertyForm({...propertyForm, price: e.target.value})}
                    placeholder={`Enter price ${propertyForm.rental_type === 'day' ? 'per night' : propertyForm.rental_type === 'month' ? 'per month' : 'per year'}`}
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px' : '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '14px' : '14px'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Images Upload */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: isMobile ? '16px' : '18px', marginBottom: '16px', color: '#c9a84c' }}>
                  Property Images 
                  <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#666', marginLeft: '8px' }}>
                    ({imagePreviews.filter(url => url.startsWith('http')).length + imageFiles.length} / 5 photos)
                  </span>
                </h3>
                
                <div
                  onClick={() => {
                    const currentCount = imagePreviews.filter(url => url.startsWith('http')).length + imageFiles.length;
                    if (currentCount >= 5) {
                      showToast('⚠️ You can only upload exactly 5 photos. Remove some photos first.');
                      return;
                    }
                    fileInputRef.current?.click();
                  }}
                  style={{
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    padding: isMobile ? '30px' : '40px',
                    textAlign: 'center',
                    cursor: imagePreviews.filter(url => url.startsWith('http')).length + imageFiles.length >= 5 ? 'not-allowed' : 'pointer',
                    backgroundColor: '#f9f9f9',
                    marginBottom: '16px'
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: isMobile ? '36px' : '48px', marginBottom: '8px' }}>📸</div>
                  <p style={{ color: '#666', fontSize: isMobile ? '13px' : '14px' }}>Click to upload images from your device</p>
                  <p style={{ fontSize: isMobile ? '10px' : '12px', color: '#999' }}>Exactly 5 photos required (JPG, PNG, GIF)</p>
                </div>
                
                {imagePreviews.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: isMobile ? '16px' : '18px', marginBottom: '16px', color: '#c9a84c' }}>Video Tour</h3>
                
                <div
                  onClick={() => videoInputRef.current?.click()}
                  style={{
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    padding: isMobile ? '30px' : '40px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: isMobile ? '36px' : '48px', marginBottom: '8px' }}>🎥</div>
                  <p style={{ color: '#666', fontSize: isMobile ? '13px' : '14px' }}>Click to upload a video tour</p>
                  <p style={{ fontSize: isMobile ? '10px' : '12px', color: '#999' }}>MP4, WebM, MOV (Max 100MB)</p>
                </div>
                
                {videoPreview && (
                  <div style={{ marginTop: '16px' }}>
                    {videoPreview.startsWith('http') && !videoPreview.startsWith('blob:') ? (
                      <div style={{ background: '#f0f0f0', borderRadius: '8px', padding: '12px' }}>
                        <a href={videoPreview} target="_blank" rel="noopener noreferrer" style={{ color: '#4c9aff', fontSize: isMobile ? '12px' : '13px', wordBreak: 'break-all' }}>
                          {videoPreview.substring(0, 50)}...
                        </a>
                      </div>
                    ) : (
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                        <video src={videoPreview} controls style={{ width: '100%', maxHeight: '200px' }} />
                        <div style={{ padding: '12px', background: '#f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ fontSize: isMobile ? '11px' : '13px', color: '#666' }}>📹 {videoFileName}</div>
                          <button type="button" onClick={removeVideo} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: isMobile ? '11px' : '12px' }}>Remove</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description & Amenities */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: isMobile ? '16px' : '18px', marginBottom: '16px', color: '#c9a84c' }}>Description & Amenities</h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>Description</label>
                  <textarea
                    value={propertyForm.description}
                    onChange={(e) => setPropertyForm({...propertyForm, description: e.target.value})}
                    rows="4"
                    placeholder="Describe your property..."
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px' : '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '14px' : '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>Tags (Amenities)</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="e.g., WiFi, Pool, Parking"
                      style={{
                        flex: 1,
                        padding: isMobile ? '10px' : '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: isMobile ? '14px' : '14px'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      style={{
                        padding: isMobile ? '8px 16px' : '12px 20px',
                        background: '#4c9aff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '13px' : '14px'
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {propertyForm.tags.map(tag => (
                      <span key={tag} style={{
                        padding: '4px 12px',
                        background: '#f0f0f0',
                        borderRadius: '20px',
                        fontSize: isMobile ? '11px' : '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#999',
                            fontSize: '14px'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>Category</label>
                  <select
                    value={propertyForm.category}
                    onChange={(e) => setPropertyForm({...propertyForm, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px' : '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '14px' : '14px'
                    }}
                  >
                    <option value="">Select category</option>
                    <option value="Touristic">Touristic</option>
                    <option value="Quotidian">Quotidian</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>Badge (Optional)</label>
                  <input
                    type="text"
                    value={propertyForm.badge}
                    onChange={(e) => setPropertyForm({...propertyForm, badge: e.target.value})}
                    placeholder="e.g., Popular, New, Featured"
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px' : '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '14px' : '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowPropertyModal(false)}
                  style={{
                    padding: isMobile ? '10px 20px' : '12px 24px',
                    background: '#f0f0f0',
                    color: '#666',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImages || uploadingVideo}
                  style={{
                    padding: isMobile ? '10px 20px' : '12px 24px',
                    background: '#c9a84c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (uploadingImages || uploadingVideo) ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    opacity: (uploadingImages || uploadingVideo) ? 0.6 : 1,
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                >
                  {(uploadingImages || uploadingVideo) ? 'Uploading...' : (editingProperty ? 'Update Property' : 'Add Property')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HostDashboard;