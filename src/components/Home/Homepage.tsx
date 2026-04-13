import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, Chip, keyframes } from '@mui/material';
import { Link } from 'react-router-dom';
import CampaignIcon from '@mui/icons-material/Campaign';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BarChartIcon from '@mui/icons-material/BarChart';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuthContext } from '../../context/AuthContext';

const BRAND = '#E8521A';

const FEATURES = [
  {
    icon: <LocationOnIcon sx={{ fontSize: 28 }} />,
    title: 'Hyperlocal Targeting',
    desc: "Target specific neighbourhoods in Chennai with precision routing across the city's auto and taxi network.",
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 28 }} />,
    title: 'Real-Time Km Tracking',
    desc: 'Monitor exactly how many kilometres your ad has traveled every day with live GPS data from every vehicle.',
  },
  {
    icon: <BarChartIcon sx={{ fontSize: 28 }} />,
    title: 'Campaign Analytics',
    desc: 'Full dashboard visibility into impressions, routes, vehicle performance, and campaign ROI in one place.',
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 28 }} />,
    title: 'Verified Fleet',
    desc: 'Every vehicle is registered, documented, and approved before your ad goes live — quality guaranteed.',
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
    title: 'Cost-Effective Reach',
    desc: 'Reach lakhs of daily commuters at a fraction of traditional billboard costs with flexible monthly pricing.',
  },
  {
    icon: <CampaignIcon sx={{ fontSize: 28 }} />,
    title: 'Easy Campaign Booking',
    desc: 'Launch your campaign in minutes with our guided 5-step booking flow — no agency needed.',
  },
];

const HOW_IT_WORKS_ADVERTISER = [
  { step: '01', title: 'Sign Up', desc: 'Create your advertiser account in under a minute.' },
  { step: '02', title: 'Choose Vehicles', desc: 'Browse available autos and taxis by area and daily km.' },
  { step: '03', title: 'Upload Artwork', desc: 'Upload your banner design — we handle the printing.' },
  { step: '04', title: 'Go Live', desc: 'Your ad hits the streets once approved. Track it live.' },
];

const HOW_IT_WORKS_OWNER = [
  { step: '01', title: 'Register Your Vehicle', desc: 'Submit your RC, insurance, and vehicle details online.' },
  { step: '02', title: 'Get Approved', desc: 'Our team reviews your submission within 24–48 hours.' },
  { step: '03', title: 'Ad Gets Installed', desc: 'We print and fit the banner on your vehicle for free.' },
  { step: '04', title: 'Earn Monthly', desc: 'Receive your payment directly to your UPI ID every month.' },
];

const STATS = [
  { value: '5,000+', label: 'Vehicles on network' },
  { value: '2M+', label: 'Daily commuters reached' },
  { value: '₹3,000', label: 'Avg. monthly owner earning' },
  { value: '50+', label: 'Active brand campaigns' },
];

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const AD_BANNERS = [
  { text: '🍕 ZOMATO — ORDER YOUR FAVOURITE FOOD NOW', bg: '#FF4D4D', color: '#fff' },
  { text: '🏦 HDFC BANK — OPEN AN ACCOUNT TODAY', bg: '#0D47A1', color: '#fff' },
  { text: '🛍 DECATHLON — SPORTS FOR EVERYONE', bg: '#1B5E20', color: '#fff' },
  { text: '💜 NYKAA — YOUR BEAUTY DESTINATION', bg: '#6A1B9A', color: '#fff' },
];

export default function Homepage() {
  const { isAuthenticated } = useAuthContext();
  const [adIndex, setAdIndex] = useState(0);
  const [adOpacity, setAdOpacity] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setAdOpacity(0);
      setTimeout(() => {
        setAdIndex((prev) => (prev + 1) % AD_BANNERS.length);
        setAdOpacity(1);
      }, 300);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ background: '#F5F2EF', minHeight: '100vh' }}>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1A1510 0%, #2D2520 100%)',
          color: '#fff',
          px: { xs: 3, md: 8, lg: 14 },
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative circle */}
        <Box
          sx={{
            position: 'absolute',
            right: -80,
            top: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${BRAND}22 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Two-column grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            alignItems: 'center',
            gap: { xs: 4, md: 6 },
          }}
        >
          {/* ── Left column: text content ── */}
          <Box>
            <Chip
              label="🚀 Now in Chennai"
              size="small"
              sx={{
                background: `${BRAND}22`,
                color: BRAND,
                fontWeight: 700,
                mb: 2,
                fontSize: '0.8rem',
                border: `1px solid ${BRAND}44`,
              }}
            />

            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 800,
                fontSize: { xs: '2.2rem', md: '2.8rem', lg: '3.4rem' },
                lineHeight: 1.1,
                mb: 2,
              }}
            >
              Turn Every Auto & Taxi Into a{' '}
              <Box component="span" sx={{ color: BRAND }}>
                Moving Billboard
              </Box>
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: { xs: '1rem', md: '1.1rem' },
                mb: 4,
                maxWidth: 480,
                lineHeight: 1.7,
              }}
            >
              AdRide connects advertisers with Chennai's largest fleet of autos and
              taxis. Launch hyper-local campaigns, track every kilometre live, and
              reach millions of daily commuters.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {isAuthenticated ? (
                <>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/dashboard"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ fontWeight: 700, px: 3, py: 1.5 }}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/campaign"
                    size="large"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.35)',
                      color: '#fff',
                      '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.06)' },
                      px: 3,
                      py: 1.5,
                    }}
                  >
                    New Campaign
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/campaign"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ fontWeight: 700, px: 3, py: 1.5 }}
                  >
                    Start a Campaign
                  </Button>
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/login"
                    size="large"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.35)',
                      color: '#fff',
                      '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.06)' },
                      px: 3,
                      py: 1.5,
                    }}
                  >
                    Register Your Vehicle
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* ── Right column: animated illustration ── */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 340, md: 440 },
              }}
            >
              {/* City background — fills the container */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(160deg, #FDF0EB 0%, #F5EDE7 100%)',
                  borderRadius: '24px',
                  overflow: 'hidden',
                }}
              >
                {/* Buildings */}
                {/* Building 1 */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 90,
                    left: 30,
                    width: 50,
                    height: 110,
                    background: 'rgba(255,255,255,0.5)',
                    borderRadius: '6px 6px 0 0',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                />
                {/* Building 2 */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 90,
                    left: 90,
                    width: 40,
                    height: 80,
                    background: 'rgba(255,255,255,0.5)',
                    borderRadius: '6px 6px 0 0',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                />
                {/* Building 3 */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 90,
                    right: 30,
                    width: 60,
                    height: 140,
                    background: 'rgba(255,255,255,0.5)',
                    borderRadius: '6px 6px 0 0',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                />
                {/* Building 4 */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 90,
                    right: 100,
                    width: 35,
                    height: 95,
                    background: 'rgba(255,255,255,0.5)',
                    borderRadius: '6px 6px 0 0',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                />

                {/* Auto-rickshaw wrapper */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 50,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 180,
                  }}
                >
                  {/* Ad banner on top */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -56,
                      left: 8,
                      right: 8,
                      height: 52,
                      background: 'white',
                      borderRadius: '8px',
                      border: '2px solid rgba(26,21,16,0.1)',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: AD_BANNERS[adIndex].bg,
                        color: AD_BANNERS[adIndex].color,
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        opacity: adOpacity,
                        transition: 'opacity 0.3s',
                        textAlign: 'center',
                        px: 1,
                      }}
                    >
                      {AD_BANNERS[adIndex].text}
                    </Box>
                  </Box>

                  {/* Body */}
                  <Box
                    sx={{
                      width: 180,
                      height: 80,
                      background: '#F5C842',
                      borderRadius: '14px 14px 6px 6px',
                      position: 'relative',
                      boxShadow: '0 4px 0 #B89800',
                    }}
                  >
                    {/* Driver */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 16,
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: '#E8521A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                      }}
                    >
                      👨
                    </Box>
                  </Box>

                  {/* Left wheel */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -14,
                      left: 18,
                      width: 28,
                      height: 28,
                      background: '#1A1510',
                      borderRadius: '50%',
                      border: '4px solid #444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ inset: 4, position: 'absolute', background: '#888', borderRadius: '50%' }} />
                  </Box>

                  {/* Right wheel */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -14,
                      right: 18,
                      width: 28,
                      height: 28,
                      background: '#1A1510',
                      borderRadius: '50%',
                      border: '4px solid #444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ inset: 4, position: 'absolute', background: '#888', borderRadius: '50%' }} />
                  </Box>
                </Box>

                {/* Road */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 90,
                    background: '#2C2520',
                    borderRadius: '0 0 24px 24px',
                  }}
                >
                  {/* Dashed center line */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '10%',
                      right: '10%',
                      height: 3,
                      transform: 'translateY(-50%)',
                      background: 'repeating-linear-gradient(90deg, #F5C842 0px, #F5C842 30px, transparent 30px, transparent 55px)',
                    }}
                  />
                </Box>
              </Box>

              {/* Floating info card — top-left */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  background: 'white',
                  border: '1px solid rgba(26,21,16,0.1)',
                  borderRadius: '12px',
                  padding: '0.65rem 0.9rem',
                  fontSize: '0.75rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  animation: `${floatAnimation} 3s ease-in-out infinite`,
                  animationDelay: '0s',
                }}
              >
                <Typography sx={{ fontSize: '0.68rem', color: '#6B5E54', lineHeight: 1.3 }}>Campaign live in</Typography>
                <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 700, fontSize: '0.9rem', color: '#1A1510', lineHeight: 1.3 }}>
                  Anna Nagar
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: BRAND, lineHeight: 1.3 }}>24 vehicles · active now</Typography>
              </Box>

              {/* Floating info card — top-right */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'white',
                  border: '1px solid rgba(26,21,16,0.1)',
                  borderRadius: '12px',
                  padding: '0.65rem 0.9rem',
                  fontSize: '0.75rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  animation: `${floatAnimation} 3s ease-in-out infinite`,
                  animationDelay: '1s',
                }}
              >
                <Typography sx={{ fontSize: '0.68rem', color: '#6B5E54', lineHeight: 1.3 }}>Impressions today</Typography>
                <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 700, fontSize: '0.9rem', color: '#1A1510', lineHeight: 1.3 }}>
                  18,240
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#2e7d32', lineHeight: 1.3 }}>↑ 12% vs yesterday</Typography>
              </Box>

              {/* Floating info card — middle-right */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 165,
                  right: 15,
                  background: 'white',
                  border: '1px solid rgba(26,21,16,0.1)',
                  borderRadius: '12px',
                  padding: '0.65rem 0.9rem',
                  fontSize: '0.75rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  animation: `${floatAnimation} 3s ease-in-out infinite`,
                  animationDelay: '0.5s',
                }}
              >
                <Typography sx={{ fontSize: '0.68rem', color: '#6B5E54', lineHeight: 1.3 }}>Areas covered</Typography>
                <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 700, fontSize: '0.9rem', color: '#1A1510', lineHeight: 1.3 }}>
                  T. Nagar · Adyar
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#6B5E54', lineHeight: 1.3 }}>+ 6 more zones</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Stats row — full width below both columns */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, auto)' },
            gap: { xs: 2, md: 4 },
            mt: 7,
            pt: 5,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {STATS.map((stat) => (
            <Box key={stat.label}>
              <Typography
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 800,
                  fontSize: { xs: '1.6rem', md: '2rem' },
                  color: BRAND,
                  lineHeight: 1,
                  mb: 0.5,
                }}
              >
                {stat.value}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Features ─────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 3, md: 8, lg: 14 }, py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            label="Why AdRide"
            size="small"
            sx={{ background: '#FDF0EB', color: BRAND, fontWeight: 700, mb: 1.5 }}
          />
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 800,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              mb: 1,
            }}
          >
            Everything you need to run{' '}
            <Box component="span" sx={{ color: BRAND }}>
              great ad campaigns
            </Box>
          </Typography>
          <Typography sx={{ color: '#6B5E54', maxWidth: 520, mx: 'auto', fontSize: '0.95rem', lineHeight: 1.7 }}>
            From booking to live tracking, AdRide gives advertisers and vehicle
            owners a seamless, transparent platform.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}
        >
          {FEATURES.map((feat) => (
            <Card
              key={feat.title}
              sx={{
                p: 3,
                border: '1px solid rgba(26,21,16,0.08)',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 4px 20px rgba(232,82,26,0.12)' },
              }}
            >
              <Box
                sx={{
                  color: BRAND,
                  background: '#FDF0EB',
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                {feat.icon}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.75 }}>{feat.title}</Typography>
              <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem', lineHeight: 1.6 }}>{feat.desc}</Typography>
            </Card>
          ))}
        </Box>
      </Box>

      {/* ── How It Works ─────────────────────────────────────── */}
      <Box
        sx={{
          background: '#fff',
          px: { xs: 3, md: 8, lg: 14 },
          py: { xs: 6, md: 10 },
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            label="How it works"
            size="small"
            sx={{ background: '#FDF0EB', color: BRAND, fontWeight: 700, mb: 1.5 }}
          />
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 800,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
            }}
          >
            Simple for everyone
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4,
          }}
        >
          {/* For Advertisers */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  background: BRAND,
                  color: '#fff',
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CampaignIcon fontSize="small" />
              </Box>
              <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
                For Advertisers
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {HOW_IT_WORKS_ADVERTISER.map((item) => (
                <Box key={item.step} sx={{ display: 'flex', gap: 2 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 800,
                      fontSize: '1.4rem',
                      color: `${BRAND}30`,
                      lineHeight: 1,
                      minWidth: 36,
                    }}
                  >
                    {item.step}
                  </Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.25 }}>{item.title}</Typography>
                    <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem', lineHeight: 1.5 }}>{item.desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Button
              variant="contained"
              component={Link}
              to="/campaign"
              endIcon={<ArrowForwardIcon />}
              sx={{ mt: 3 }}
            >
              Book a Campaign
            </Button>
          </Box>

          {/* For Vehicle Owners */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  background: '#1A1510',
                  color: '#fff',
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DirectionsCarIcon fontSize="small" />
              </Box>
              <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
                For Vehicle Owners
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {HOW_IT_WORKS_OWNER.map((item) => (
                <Box key={item.step} sx={{ display: 'flex', gap: 2 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 800,
                      fontSize: '1.4rem',
                      color: 'rgba(26,21,16,0.12)',
                      lineHeight: 1,
                      minWidth: 36,
                    }}
                  >
                    {item.step}
                  </Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.25 }}>{item.title}</Typography>
                    <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem', lineHeight: 1.5 }}>{item.desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Button
              variant="outlined"
              component={Link}
              to="/owner-onboarding"
              endIcon={<ArrowForwardIcon />}
              sx={{ mt: 3, borderColor: 'rgba(26,21,16,0.2)', color: '#1A1510', '&:hover': { borderColor: '#1A1510' } }}
            >
              Register My Vehicle
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${BRAND} 0%, #B83D0F 100%)`,
          color: '#fff',
          px: { xs: 3, md: 8, lg: 14 },
          py: { xs: 6, md: 8 },
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 800,
            fontSize: { xs: '1.8rem', md: '2.4rem' },
            mb: 1.5,
          }}
        >
          Ready to put your brand on the move?
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, fontSize: '1rem', maxWidth: 480, mx: 'auto' }}>
          Join hundreds of brands already advertising across Chennai's streets with AdRide.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            component={Link}
            to="/login"
            size="large"
            sx={{
              background: '#fff',
              color: BRAND,
              fontWeight: 700,
              '&:hover': { background: '#f5e9e4' },
              px: 3.5,
              py: 1.5,
            }}
          >
            Get Started Free
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to="/dashboard"
            size="large"
            sx={{
              borderColor: 'rgba(255,255,255,0.5)',
              color: '#fff',
              '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.1)' },
              px: 3.5,
              py: 1.5,
            }}
          >
            View Demo Dashboard
          </Button>
        </Box>
      </Box>

      {/* ── Footer ───────────────────────────────────────────── */}
      <Box
        sx={{
          background: '#1A1510',
          color: 'rgba(255,255,255,0.5)',
          px: { xs: 3, md: 8, lg: 14 },
          py: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}
        >
          Ad<span style={{ color: BRAND }}>Ride</span>
        </Typography>
        <Typography sx={{ fontSize: '0.8rem' }}>© 2024 AdRide. All rights reserved.</Typography>
      </Box>
    </Box>
  );
}
