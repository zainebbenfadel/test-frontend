import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

const API = 'https://test-backend-hd6i.onrender.com/api/admin'

const STATUS_COLORS = ['#c9a84c', '#1e3356', '#8a8070'];
const TYPE_COLORS   = ['#c9a84c', '#13213a', '#d4cfc4'];

const tooltipStyle = {
  backgroundColor: '#13213a',
  border: '1px solid rgba(201,168,76,0.3)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '13px',
};

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: '#13213a',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px',
      padding: '24px',
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#c9a84c',
        marginBottom: '20px',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function AdminDashboard({ showToast }) {
  const [activeTab, setActiveTab]           = useState('stats')
  const [loading,   setLoading]             = useState(true)
  const [error,     setError]               = useState(null)

  const [stats,            setStats]            = useState({ houses: 0, clients: 0, complaints: 0 })
  const [bookingsPerMonth, setBookingsPerMonth]  = useState([])
  const [revenuePerMonth,  setRevenuePerMonth]   = useState([])
  const [listingsByWilaya, setListingsByWilaya]  = useState([])
  const [bookingStatusData,setBookingStatusData] = useState([])
  const [users,            setUsers]             = useState([])
  const [complaints,       setComplaints]        = useState([])
  const [transactions,     setTransactions]      = useState([])

  const [hosts,          setHosts]          = useState([])
const [selectedHost,   setSelectedHost]   = useState(null)
const [hostModal,      setHostModal]      = useState(false)
const [hostBookings,   setHostBookings]   = useState([])
const [hostBookingsLoading, setHostBookingsLoading] = useState(false)

// Add this at the beginning of AdminDashboard function
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


  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError(null)
  
   


      try {
        const [
          statsRes,
          bookingsRes,
          revenueRes,
          wilayaRes,
          statusRes,
          usersRes,
          complaintsRes,
          transactionsRes,
           hostsRes,  
        ] = await Promise.all([
          fetch(`${API}/stats`),
          fetch(`${API}/bookings-per-month`),
          fetch(`${API}/revenue-per-month`),
          fetch(`${API}/listings-by-wilaya`),
          fetch(`${API}/booking-status`),
          fetch(`${API}/users`),
          fetch(`${API}/complaints`),
          fetch(`${API}/transactions`),
          fetch(`${API}/hosts`),

          
        ])


        const statsData        = await statsRes.json()
        const bookingsData     = await bookingsRes.json()
        const revenueData      = await revenueRes.json()
        const wilayaData       = await wilayaRes.json()
        const statusData       = await statusRes.json()
        const usersData        = await usersRes.json()
        const complaintsData   = await complaintsRes.json()
        const transactionsData = await transactionsRes.json()
        const hostsData = await hostsRes.json()
console.log('hosts', hostsData)
setHosts(Array.isArray(hostsData) ? hostsData : [])

        // Debug logs — check DevTools Console
        console.log('stats',        statsData)
        console.log('bookings',     bookingsData)
        console.log('revenue',      revenueData)
        console.log('wilaya',       wilayaData)
        console.log('status',       statusData)
        console.log('users',        usersData)
        console.log('complaints',   complaintsData)
        console.log('transactions', transactionsData)
   
        console.log('revenue values:', revenueData.map(r => r.revenue))

        setStats(
          statsData?.houses !== undefined
            ? statsData
            : { houses: 0, clients: 0, complaints: 0 }
        )
        setBookingsPerMonth( Array.isArray(bookingsData)     ? bookingsData     : [])
        setRevenuePerMonth(  Array.isArray(revenueData)      ? revenueData      : [])
     //   setRevenuePerMonth(Array.isArray(revenueData) ? revenueData : []);
      //  console.log('Revenue state after set:', revenueData);
        setListingsByWilaya( Array.isArray(wilayaData)       ? wilayaData       : [])
        setBookingStatusData(Array.isArray(statusData)       ? statusData       : [])
      //  setBookingStatusData(Array.isArray(statusData) ? statusData : []);
      //  console.log('Status state after set:', statusData);
        setUsers(            Array.isArray(usersData)        ? usersData        : [])
       const sorted = Array.isArray(complaintsData) ? complaintsData.sort((a, b) => {
  const order = { open: 0, resolved: 1, dismissed: 2 }
  return (order[a.status] ?? 1) - (order[b.status] ?? 1)
}) : []

setComplaints(sorted)
        setTransactions(     Array.isArray(transactionsData) ? transactionsData : [])

      } catch (err) {
        console.error('fetchAll error:', err)
        setError('Failed to connect to the server. Make sure your backend is running on port 5000.')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])



  const handleVerifyHost = async (id, name) => {
  try {
    await fetch(`${API}/hosts/${id}/verify`, { method: 'PATCH' })
    setHosts(prev => prev.map(h => h.host_id === id ? { ...h, is_verified: true } : h))
    showToast(`✅ ${name} has been verified`)
  } catch { showToast('❌ Failed to verify host') }
}

const handleUnverifyHost = async (id, name) => {
  try {
    await fetch(`${API}/hosts/${id}/unverify`, { method: 'PATCH' })
    setHosts(prev => prev.map(h => h.host_id === id ? { ...h, is_verified: false } : h))
    showToast(`⚠️ ${name} has been unverified`)
  } catch { showToast('❌ Failed to unverify host') }
}

const openHostModal = async (host) => {
  setSelectedHost(host)
  setHostModal(true)
  setHostBookingsLoading(true)
  try {
    const res = await fetch(`${API}/hosts/${host.host_id}/bookings`)
    const data = await res.json()
    setHostBookings(Array.isArray(data) ? data : [])
  } catch { setHostBookings([]) }
  finally { setHostBookingsLoading(false) }
}
 
const handleBanUser = async (id, name) => {
  try {
    await fetch(`${API}/users/${id}/ban`, { method: 'PATCH' })
    setUsers(prev => prev.map(u => u.user_id === id ? { ...u, is_banned: true } : u))
    setHosts(prev => prev.map(h => h.host_id === id ? { ...h, is_banned: true } : h))  // ← add
    showToast(`🚫 ${name} has been banned`)
  } catch (err) {
    showToast('❌ Failed to ban user')
  }
}

const handleUnbanUser = async (id, name) => {
  try {
    await fetch(`${API}/users/${id}/unban`, { method: 'PATCH' })
    setUsers(prev => prev.map(u => u.user_id === id ? { ...u, is_banned: false } : u))
    setHosts(prev => prev.map(h => h.host_id === id ? { ...h, is_banned: false } : h))  // ← add
    showToast(`✅ ${name} has been unbanned`)
  } catch (err) {
    showToast('❌ Failed to unban user')
  }
}

const handleDeleteUser = async (id, name) => {
  try {
    await fetch(`${API}/users/${id}`, { method: 'DELETE' })
    setUsers(prev => prev.filter(u => u.user_id !== id))
    setHosts(prev => prev.filter(h => h.host_id !== id))
    showToast(`🗑️ ${name}'s account has been deleted`)
  } catch (err) {
    showToast('❌ Failed to delete account')
  }
}
  const handleResolveComplaint = async (id) => {
    try {
      await fetch(`${API}/complaints/${id}/resolve`, { method: 'PATCH' })
      setComplaints(prev =>
        prev.map(c => c.complaint_id === id ? { ...c, status: 'resolved' } : c)
      )
      showToast('✅ Complaint resolved')
    } catch (err) {
      console.error('Resolve error:', err)
      showToast('❌ Failed to resolve complaint')
    }
  }

  const handleDismissComplaint = async (id) => {
  try {
    await fetch(`${API}/complaints/${id}/dismiss`, { method: 'PATCH' })
    setComplaints(prev =>
      prev.map(c => c.complaint_id === id ? { ...c, status: 'dismissed' } : c)
    )
    showToast('🚫 Complaint dismissed')
  } catch (err) {
    showToast('❌ Failed to dismiss complaint')
  }
}

  // ── Loading state ──
  if (loading) return (
    <div style={{
      color: '#c9a84c',
      padding: '60px',
      textAlign: 'center',
      fontSize: '18px'
    }}>
      Loading dashboard...
    </div>
  )

  // ── Error state ──
  if (error) return (
    <div style={{
      color: '#ff6b6b',
      padding: '60px',
      textAlign: 'center',
      fontSize: '16px',
      background: '#13213a',
      borderRadius: '16px',
      margin: '40px',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
      {error}
    </div>
  )

  return (
  <section className="admin-dashboard" style={{ padding: isMobile ? '16px' : '24px' }}>
    <div className="admin-header" style={{ marginBottom: isMobile ? '24px' : '32px' }}>
      <h1 className="admin-title" style={{ fontSize: isMobile ? '24px' : '32px' }}>Admin Dashboard</h1>
      <p className="admin-sub" style={{ fontSize: isMobile ? '13px' : '14px' }}>Manage hosts, guests, complaints, verification and transactions</p>
    </div>

    {/* Tabs - Make scrollable on mobile */}
    <div className="admin-tabs" style={{
      display: 'flex',
      gap: isMobile ? '8px' : '16px',
      overflowX: 'auto',
      paddingBottom: isMobile ? '8px' : '0',
      marginBottom: isMobile ? '20px' : '24px',
      WebkitOverflowScrolling: 'touch'
    }}>
      {[
        ['stats', 'Statistics'],
        ['users', 'Users'],
        ['complaints', 'Complaints'],
        ['transactions', 'Transactions'],
        ['accounts', 'Accounts'],
      ].map(([key, label]) => (
        <button
          key={key}
          className={`admin-tab ${activeTab === key ? 'active' : ''}`}
          onClick={() => setActiveTab(key)}
          style={{
            padding: isMobile ? '8px 16px' : '10px 24px',
            fontSize: isMobile ? '13px' : '14px',
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </button>
      ))}
    </div>

    {/* Stats cards - responsive grid */}
    <div className="admin-stats" style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'),
      gap: '16px',
      marginBottom: '24px'
    }}>
      {/* Stat cards content... */}
    </div>

    {/* Charts grid - stack on mobile */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? '16px' : '24px',
      marginTop: '36px'
    }}>
      {/* Chart content... */}
    </div>

    {/* Tables - make scrollable */}
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table className="admin-table" style={{ minWidth: isMobile ? '600px' : '100%' }}>
        {/* Table content... */}
      </table>
    </div>
  </section>
);
}


export default AdminDashboard;