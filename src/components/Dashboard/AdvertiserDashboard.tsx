import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  Button,
  Tab,
  Tabs,
  LinearProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CampaignIcon from '@mui/icons-material/Campaign';
import SpeedIcon from '@mui/icons-material/Speed';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const BRAND = '#E8521A';

const MOCK_CAMPAIGNS = [
  { id: 'c1', name: 'Diwali Sale 2024', status: 'live' as const, vehicles: 5, startDate: '2024-01-01', endDate: '2024-01-31', kmCovered: 12450, budget: 16000, objective: 'Brand Awareness' },
  { id: 'c2', name: 'App Launch Chennai', status: 'approved' as const, vehicles: 3, startDate: '2024-01-15', endDate: '2024-02-14', kmCovered: 4200, budget: 9600, objective: 'App Install' },
  { id: 'c3', name: 'Store Opening Drive', status: 'completed' as const, vehicles: 8, startDate: '2023-12-01', endDate: '2023-12-31', kmCovered: 28800, budget: 24000, objective: 'Store Traffic' },
];

const MOCK_VEHICLES_KM = [
  { id: 'v1', reg: 'TN01AB1234', type: 'auto', area: 'T. Nagar', kmToday: 82, kmTotal: 2460, target: 100 },
  { id: 'v2', reg: 'TN01CD5678', type: 'taxi', area: 'Velachery', kmToday: 118, kmTotal: 3540, target: 120 },
  { id: 'v3', reg: 'TN01EF9012', type: 'auto', area: 'Anna Nagar', kmToday: 74, kmTotal: 2220, target: 80 },
  { id: 'v4', reg: 'TN01GH3456', type: 'taxi', area: 'Adyar', kmToday: 136, kmTotal: 4080, target: 140 },
  { id: 'v5', reg: 'TN01IJ7890', type: 'auto', area: 'T. Nagar', kmToday: 68, kmTotal: 2040, target: 75 },
];

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  live: { bg: '#EAF3DE', color: '#27500A', label: '🟢 Live' },
  approved: { bg: '#FDF0EB', color: '#B83D0F', label: '🟠 Approved' },
  completed: { bg: 'rgba(26,21,16,0.06)', color: '#6B5E54', label: '⚪ Completed' },
  submitted: { bg: '#FAEEDA', color: '#633806', label: '🟡 Submitted' },
};

const kmChartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const kmChartData = {
  labels: kmChartLabels,
  datasets: [
    {
      label: 'Total Km / Day',
      data: [418, 452, 389, 476, 512, 398, 478],
      fill: true,
      borderColor: BRAND,
      backgroundColor: 'rgba(232,82,26,0.12)',
      tension: 0.4,
      pointBackgroundColor: BRAND,
      pointRadius: 4,
    },
  ],
};

const perVehicleBarData = {
  labels: MOCK_VEHICLES_KM.map((v) => v.reg),
  datasets: [
    {
      label: 'Km Today',
      data: MOCK_VEHICLES_KM.map((v) => v.kmToday),
      backgroundColor: BRAND,
      borderRadius: 6,
    },
    {
      label: 'Daily Target',
      data: MOCK_VEHICLES_KM.map((v) => v.target),
      backgroundColor: 'rgba(26,21,16,0.08)',
      borderRadius: 6,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(26,21,16,0.05)' }, beginAtZero: true },
  },
};

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
}

function MetricCard({ label, value, change, positive = true, icon }: MetricCardProps) {
  return (
    <Card sx={{ p: 2.5, border: '1px solid rgba(26,21,16,0.08)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54', fontWeight: 500 }}>{label}</Typography>
        <Box sx={{ color: BRAND, background: '#FDF0EB', borderRadius: 1.5, p: 0.75, display: 'flex' }}>{icon}</Box>
      </Box>
      <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A1510', lineHeight: 1 }}>{value}</Typography>
      {change && (
        <Typography sx={{ fontSize: '0.75rem', color: positive ? '#27500A' : '#B83D0F', mt: 0.75 }}>
          {positive ? '↑' : '↓'} {change}
        </Typography>
      )}
    </Card>
  );
}

export default function AdvertiserDashboard() {
  const [tab, setTab] = useState(0);

  const totalKmThisWeek = 3123;
  const liveCampaigns = MOCK_CAMPAIGNS.filter((c) => c.status === 'live').length;
  const totalVehicles = MOCK_VEHICLES_KM.length;
  const totalKmCovered = MOCK_CAMPAIGNS.reduce((s, c) => s + c.kmCovered, 0);

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', background: '#F5F2EF', p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Advertiser Dashboard</Typography>
            <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem' }}>
              Overview of your campaigns and vehicle performance
            </Typography>
          </Box>
          <Button variant="contained" href="/campaign" startIcon={<CampaignIcon />}>
            New Campaign
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              background: '#FFFFFF',
              borderRadius: 2,
              border: '1px solid rgba(26,21,16,0.08)',
              '& .MuiTab-root': { fontWeight: 600, fontSize: '0.8rem', textTransform: 'none', minWidth: 120 },
              '& .Mui-selected': { color: BRAND },
              '& .MuiTabs-indicator': { background: BRAND },
            }}
          >
            <Tab label="Overview" />
            <Tab label="Campaigns" />
            <Tab label="Vehicle Km" />
          </Tabs>
        </Box>

        {/* Tab: Overview */}
        {tab === 0 && (
          <Box>
            {/* Metrics */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
              <MetricCard
                label="Live Campaigns"
                value={String(liveCampaigns)}
                change="1 new this week"
                icon={<CampaignIcon fontSize="small" />}
              />
              <MetricCard
                label="Active Vehicles"
                value={String(totalVehicles)}
                change="+2 from last month"
                icon={<DirectionsCarIcon fontSize="small" />}
              />
              <MetricCard
                label="Km This Week"
                value={`${(totalKmThisWeek / 1000).toFixed(1)}K`}
                change="12% above target"
                icon={<SpeedIcon fontSize="small" />}
              />
              <MetricCard
                label="Total Km Covered"
                value={`${(totalKmCovered / 1000).toFixed(1)}K`}
                change="All campaigns combined"
                icon={<TrendingUpIcon fontSize="small" />}
              />
            </Box>

            {/* Km Tracking Chart */}
            <Card sx={{ p: 3, mb: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>Weekly Km Tracking</Typography>
                <Chip label="Last 7 days" size="small" sx={{ background: '#FDF0EB', color: BRAND, fontWeight: 600 }} />
              </Box>
              <Line data={kmChartData} options={chartOptions} />
            </Card>

            {/* Campaign Timeline */}
            <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
              <Typography sx={{ fontWeight: 700, mb: 2 }}>Campaign Timeline</Typography>
              {MOCK_CAMPAIGNS.map((campaign) => {
                const start = new Date(campaign.startDate);
                const end = new Date(campaign.endDate);
                const today = new Date();
                const total = end.getTime() - start.getTime();
                const elapsed = Math.min(today.getTime() - start.getTime(), total);
                const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));

                return (
                  <Box key={campaign.id} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75, flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{campaign.name}</Typography>
                        <Chip
                          label={statusConfig[campaign.status]?.label || campaign.status}
                          size="small"
                          sx={{
                            background: statusConfig[campaign.status]?.bg,
                            color: statusConfig[campaign.status]?.color,
                            fontWeight: 600,
                            fontSize: '0.65rem',
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54' }}>
                        {campaign.startDate} → {campaign.endDate}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(26,21,16,0.08)',
                        '& .MuiLinearProgress-bar': { backgroundColor: BRAND, borderRadius: 3 },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: '#6B5E54' }}>
                        {campaign.vehicles} vehicles · {campaign.objective}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#6B5E54' }}>
                        {campaign.kmCovered.toLocaleString()} km covered
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Card>
          </Box>
        )}

        {/* Tab: Campaigns */}
        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {MOCK_CAMPAIGNS.map((campaign) => (
                <Card key={campaign.id} sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{campaign.name}</Typography>
                        <Chip
                          label={statusConfig[campaign.status]?.label || campaign.status}
                          size="small"
                          sx={{
                            background: statusConfig[campaign.status]?.bg,
                            color: statusConfig[campaign.status]?.color,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54', mb: 0.5 }}>
                        📅 {campaign.startDate} → {campaign.endDate} · 🎯 {campaign.objective}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54' }}>
                        🚗 {campaign.vehicles} vehicles · 📍 {campaign.kmCovered.toLocaleString()} km covered
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#1A1510' }}>
                        ₹{campaign.budget.toLocaleString()}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54' }}>total budget</Typography>
                      <Button variant="outlined" size="small" sx={{ mt: 1, borderColor: 'rgba(26,21,16,0.2)', color: '#1A1510', fontSize: '0.75rem' }}>
                        View Details
                      </Button>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Tab: Vehicle Km */}
        {tab === 2 && (
          <Box>
            <Card sx={{ p: 3, mb: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
              <Typography sx={{ fontWeight: 700, mb: 2 }}>Per-Vehicle Km Performance (Today)</Typography>
              <Bar data={perVehicleBarData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: true } } }} />
            </Card>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {MOCK_VEHICLES_KM.map((v) => {
                const pct = Math.round((v.kmToday / v.target) * 100);
                return (
                  <Card key={v.id} sx={{ p: 2.5, border: '1px solid rgba(26,21,16,0.08)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {v.type === 'auto' ? '🛺' : '🚕'} {v.reg}
                          </Typography>
                          <Chip
                            label={pct >= 100 ? '✅ On Target' : pct >= 80 ? '🔶 Near Target' : '🔴 Below Target'}
                            size="small"
                            sx={{
                              background: pct >= 100 ? '#EAF3DE' : pct >= 80 ? '#FAEEDA' : '#FDF0EB',
                              color: pct >= 100 ? '#27500A' : pct >= 80 ? '#633806' : '#B83D0F',
                              fontWeight: 600,
                              fontSize: '0.65rem',
                            }}
                          />
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54' }}>
                          {v.area} · Total: {v.kmTotal.toLocaleString()} km
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: BRAND }}>{v.kmToday} km</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#6B5E54' }}>today / {v.target} target</Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(pct, 100)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(26,21,16,0.08)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: pct >= 100 ? '#27500A' : pct >= 80 ? '#E8521A' : '#B83D0F',
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography sx={{ fontSize: '0.7rem', color: '#6B5E54', mt: 0.5 }}>
                      {pct}% of daily target
                    </Typography>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
