import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import {
  MdBloodtype,
  MdLocalHospital,
  MdSchool,
  MdCardGiftcard,
  MdPark,
  MdVolunteerActivism,
  MdRestaurant,
  MdFemale,
  MdSports,
  MdEco,
  MdFestival,
  MdGroups,
} from 'react-icons/md';
import { activityService } from '../../services';

const initiativeIcons = {
  'Blood Donation Camp': { icon: MdBloodtype, gradient: 'linear-gradient(135deg, #e53935, #ff6f6f)' },
  'Health Checkup Camp': { icon: MdLocalHospital, gradient: 'linear-gradient(135deg, #43a047, #81c784)' },
  'Educational Support': { icon: MdSchool, gradient: 'linear-gradient(135deg, #1565c0, #64b5f6)' },
  'Scholarship Distribution': { icon: MdCardGiftcard, gradient: 'linear-gradient(135deg, #f57c00, #ffb74d)' },
  'Tree Plantation': { icon: MdPark, gradient: 'linear-gradient(135deg, #2e7d32, #81c784)' },
  'Charity Programs': { icon: MdVolunteerActivism, gradient: 'linear-gradient(135deg, #6a1b9a, #ce93d8)' },
  'Food Distribution': { icon: MdRestaurant, gradient: 'linear-gradient(135deg, #e65100, #ff8a65)' },
  "Women's Empowerment": { icon: MdFemale, gradient: 'linear-gradient(135deg, #c2185b, #f48fb1)' },
  'Sports Tournament': { icon: MdSports, gradient: 'linear-gradient(135deg, #00838f, #4dd0e1)' },
  'Environmental Awareness': { icon: MdEco, gradient: 'linear-gradient(135deg, #558b2f, #aed581)' },
  'Cultural Events': { icon: MdFestival, gradient: 'linear-gradient(135deg, #f9a825, #ffd54f)' },
  'Youth Development': { icon: MdGroups, gradient: 'linear-gradient(135deg, #4527a0, #b39ddb)' },
};

const initiativeTitles = Object.keys(initiativeIcons);

export default function SocialInitiatives() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await activityService.getActivities();
        setActivities(data);
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getDescription = (title) => {
    const found = activities.find(a => a.title?.toLowerCase().includes(title.toLowerCase()));
    return found?.description || `Our mandal organizes ${title.toLowerCase()} as part of our community service initiatives throughout the year.`;
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Social Initiatives</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        What Our Mandal Does Throughout the Year
      </Typography>
      <Grid container spacing={3}>
        {initiativeTitles.map(title => {
          const { icon: Icon, gradient } = initiativeIcons[title];
          return (
            <Grid item xs={12} sm={6} md={4} key={title}>
              <Card
                sx={{
                  height: '100%',
                  background: gradient,
                  color: '#fff',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
                  <Box sx={{ fontSize: 56, mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <Icon />
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>{title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {getDescription(title)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
