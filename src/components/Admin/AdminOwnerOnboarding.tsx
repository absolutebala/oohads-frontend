import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import MessageIcon from '@mui/icons-material/Message';

const BRAND = '#E8521A';
const AREAS = ['Anna Nagar', 'T. Nagar', 'Velachery', 'Tambaram', 'Chromepet', 'Porur', 'Adyar', 'Mylapore'];

interface AdminOwnerEntry {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'auto' | 'taxi';
  registrationNumber: string;
  area: string;
  monthlyRate: number;
  status: 'pending' | 'active' | 'inactive';
  addedAt: string;
}

const MOCK_OWNERS: AdminOwnerEntry[] = [
  { id: '1', name: 'Rajan Kumar', phone: '9876543210', vehicleType: 'auto', registrationNumber: 'TN01AB1234', area: 'T. Nagar', monthlyRate: 2800, status: 'active', addedAt: '2024-01-10' },
  { id: '2', name: 'Priya Selvam', phone: '9876543211', vehicleType: 'taxi', registrationNumber: 'TN01CD5678', area: 'Velachery', monthlyRate: 3200, status: 'active', addedAt: '2024-01-12' },
  { id: '3', name: 'Murugan P', phone: '9876543212', vehicleType: 'auto', registrationNumber: 'TN01EF9012', area: 'Anna Nagar', monthlyRate: 2500, status: 'pending', addedAt: '2024-01-15' },
];

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: '#EAF3DE', color: '#27500A' },
  pending: { bg: '#FAEEDA', color: '#633806' },
  inactive: { bg: 'rgba(26,21,16,0.06)', color: '#6B5E54' },
};

interface FormData {
  name: string;
  phone: string;
  vehicleType: 'auto' | 'taxi' | '';
  registrationNumber: string;
  area: string;
  monthlyRate: string;
  priceOverride: string;
}

export default function AdminOwnerOnboarding() {
  const [owners, setOwners] = useState<AdminOwnerEntry[]>(MOCK_OWNERS);
  const [form, setForm] = useState<FormData>({
    name: '',
    phone: '',
    vehicleType: '',
    registrationNumber: '',
    area: '',
    monthlyRate: '',
    priceOverride: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [smsSuccess, setSmsSuccess] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!/^\d{10}$/.test(form.phone)) return 'Valid 10-digit phone is required';
    if (!form.vehicleType) return 'Vehicle type is required';
    if (!form.registrationNumber.trim()) return 'Registration number is required';
    if (!form.area) return 'Area is required';
    if (!form.monthlyRate || isNaN(Number(form.monthlyRate))) return 'Monthly rate is required';
    return '';
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);

    setTimeout(() => {
      const effectiveRate = form.priceOverride ? Number(form.priceOverride) : Number(form.monthlyRate);

      if (editId) {
        setOwners((prev) =>
          prev.map((o) =>
            o.id === editId
              ? { ...o, name: form.name, phone: form.phone, vehicleType: form.vehicleType as 'auto' | 'taxi', registrationNumber: form.registrationNumber, area: form.area, monthlyRate: effectiveRate }
              : o
          )
        );
        setEditId(null);
      } else {
        const newOwner: AdminOwnerEntry = {
          id: Date.now().toString(),
          name: form.name,
          phone: form.phone,
          vehicleType: form.vehicleType as 'auto' | 'taxi',
          registrationNumber: form.registrationNumber,
          area: form.area,
          monthlyRate: effectiveRate,
          status: 'pending',
          addedAt: new Date().toISOString().split('T')[0],
        };
        setOwners((prev) => [newOwner, ...prev]);
      }

      setSmsSuccess(`✅ SMS confirmation sent to +91 ${form.phone}`);
      setForm({ name: '', phone: '', vehicleType: '', registrationNumber: '', area: '', monthlyRate: '', priceOverride: '' });
      setLoading(false);

      setTimeout(() => setSmsSuccess(''), 4000);
    }, 1200);
  };

  const handleEdit = (owner: AdminOwnerEntry) => {
    setEditId(owner.id);
    setForm({
      name: owner.name,
      phone: owner.phone,
      vehicleType: owner.vehicleType,
      registrationNumber: owner.registrationNumber,
      area: owner.area,
      monthlyRate: String(owner.monthlyRate),
      priceOverride: '',
    });
    setError('');
  };

  const handleDelete = (id: string) => {
    setOwners((prev) => prev.filter((o) => o.id !== id));
  };

  const handleSendSms = (owner: AdminOwnerEntry) => {
    setSmsSuccess(`📱 SMS sent to ${owner.name} (+91 ${owner.phone})`);
    setTimeout(() => setSmsSuccess(''), 3000);
  };

  const handleStatusToggle = (id: string) => {
    setOwners((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' } : o
      )
    );
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', background: '#F5F2EF', p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Admin: Owner Management</Typography>
          <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem' }}>
            Add and manage vehicle owners · {owners.length} total owners
          </Typography>
        </Box>

        {smsSuccess && (
          <Alert icon={<MessageIcon />} severity="success" sx={{ mb: 2 }}>{smsSuccess}</Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, alignItems: 'start' }}>
          {/* Left: Add Owner Form */}
          <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <PersonAddIcon sx={{ color: BRAND }} />
              <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                {editId ? 'Edit Owner' : 'Add New Owner'}
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth name="name" label="Owner Name *" placeholder="Full name"
                value={form.name} onChange={handleChange} size="small"
              />
              <TextField
                fullWidth name="phone" label="Phone Number *" placeholder="10-digit mobile"
                value={form.phone} onChange={handleChange} size="small"
                inputProps={{ maxLength: 10 }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Vehicle Type *</InputLabel>
                  <Select
                    name="vehicleType"
                    value={form.vehicleType}
                    label="Vehicle Type *"
                    onChange={(e) => setForm((prev) => ({ ...prev, vehicleType: e.target.value as 'auto' | 'taxi' | '' }))}
                  >
                    <MenuItem value="auto">🛺 Auto Rickshaw</MenuItem>
                    <MenuItem value="taxi">🚕 Taxi / Cab</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Area *</InputLabel>
                  <Select
                    name="area"
                    value={form.area}
                    label="Area *"
                    onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
                  >
                    {AREAS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>

              <TextField
                fullWidth name="registrationNumber" label="Registration Number *" placeholder="TN 01 AB 1234"
                value={form.registrationNumber} onChange={handleChange} size="small"
              />

              <TextField
                fullWidth name="monthlyRate" label="Monthly Rate (₹) *" placeholder="e.g. 3000"
                value={form.monthlyRate} onChange={handleChange} size="small" type="number"
              />

              <Divider>
                <Typography sx={{ fontSize: '0.7rem', color: '#6B5E54', px: 1 }}>Admin Price Override</Typography>
              </Divider>

              <TextField
                fullWidth name="priceOverride" label="Override Rate (₹)" placeholder="Leave blank to use owner rate"
                value={form.priceOverride} onChange={handleChange} size="small" type="number"
                helperText="Set a different rate than owner's requested rate"
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
              >
                {loading ? 'Adding...' : editId ? 'Update Owner' : 'Add Owner & Send SMS'}
              </Button>

              {editId && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setEditId(null);
                    setForm({ name: '', phone: '', vehicleType: '', registrationNumber: '', area: '', monthlyRate: '', priceOverride: '' });
                  }}
                  sx={{ borderColor: 'rgba(26,21,16,0.2)', color: '#6B5E54' }}
                >
                  Cancel Edit
                </Button>
              )}
            </Box>
          </Card>

          {/* Right: Owner List */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                Registered Owners ({owners.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['active', 'pending', 'inactive'].map((s) => (
                  <Chip
                    key={s}
                    label={`${owners.filter((o) => o.status === s).length} ${s}`}
                    size="small"
                    sx={{ background: statusColors[s].bg, color: statusColors[s].color, fontWeight: 600, fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 520, overflowY: 'auto', pr: 0.5 }}>
              {owners.map((owner) => (
                <Card
                  key={owner.id}
                  sx={{
                    p: 2,
                    border: `1px solid ${editId === owner.id ? BRAND : 'rgba(26,21,16,0.08)'}`,
                    borderRadius: 2,
                    transition: 'border-color 0.15s',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{owner.name}</Typography>
                        <Chip
                          label={owner.status}
                          size="small"
                          onClick={() => handleStatusToggle(owner.id)}
                          sx={{
                            background: statusColors[owner.status].bg,
                            color: statusColors[owner.status].color,
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '0.78rem', color: '#6B5E54' }}>
                        📱 +91 {owner.phone} · {owner.vehicleType === 'auto' ? '🛺' : '🚕'} {owner.vehicleType.toUpperCase()} · {owner.registrationNumber}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: '#6B5E54', mt: 0.25 }}>
                        📍 {owner.area} · ₹{owner.monthlyRate.toLocaleString()}/mo
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                      <Tooltip title="Send SMS">
                        <IconButton size="small" onClick={() => handleSendSms(owner)} sx={{ color: '#6B5E54' }}>
                          <MessageIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(owner)} sx={{ color: BRAND }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(owner.id)} sx={{ color: '#B83D0F' }}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(26,21,16,0.35)', mt: 0.75 }}>
                    Added: {owner.addedAt}
                  </Typography>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
