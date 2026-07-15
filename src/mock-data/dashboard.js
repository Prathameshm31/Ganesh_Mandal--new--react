// Mock dashboard data computed from members and donations
import members from './members';
import donations from './donations';

const toNumber = (v) => (v != null ? Number(v) : 0);

export function getDashboardStats() {
  const activeMembers = members.filter((m) => m.status === 'Active').length;
  const totalDonations = donations.reduce((sum, d) => sum + toNumber(d.amount), 0);
  const avgDonation = donations.length > 0 ? Math.round(totalDonations / donations.length) : 0;

  const colonySet = new Set(members.map((m) => m.colony).filter(Boolean));

  const now = new Date();
  const currentYear = now.getFullYear();
  const thisYearDonations = donations.filter((d) => {
    const year = new Date(d.donationDate).getFullYear();
    return year === currentYear;
  });
  const thisYearCollection = thisYearDonations.reduce((sum, d) => sum + toNumber(d.amount), 0);

  const todayStr = now.toISOString().split('T')[0];
  const todayCollection = donations
    .filter((d) => d.donationDate === todayStr)
    .reduce((sum, d) => sum + toNumber(d.amount), 0);

  const onlineModes = ['UPI', 'Bank Transfer', 'Google Pay', 'Paytm', 'PhonePe'];
  const onlineCollection = donations
    .filter((d) => onlineModes.includes(d.paymentMode))
    .reduce((sum, d) => sum + toNumber(d.amount), 0);
  const cashCollection = donations
    .filter((d) => d.paymentMode === 'Cash')
    .reduce((sum, d) => sum + toNumber(d.amount), 0);

  const inactiveMembers = members.filter((m) => m.status === 'Inactive').length;

  return {
    totalMembers: members.length,
    activeMembers,
    totalDonations,
    totalDonationCount: donations.length,
    avgDonation,
    totalColonies: colonySet.size,
    totalActivities: 0,
    upcomingActivities: 0,
    todayCollection,
    onlineCollection,
    cashCollection,
    thisYearCollection,
    pendingMembers: inactiveMembers,
    collectionGoal: 500000,
    currentYearMurti: null,
  };
}

export function getMonthlyCollection() {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyMap = {};

  monthNames.forEach((name) => {
    monthlyMap[name] = 0;
  });

  donations.forEach((d) => {
    const date = new Date(d.donationDate);
    const month = monthNames[date.getMonth()];
    if (month) {
      monthlyMap[month] += toNumber(d.amount);
    }
  });

  return monthNames.map((month) => ({
    month,
    amount: monthlyMap[month],
  }));
}

export function getColonyWiseCollection() {
  const colonyMap = {};

  donations.forEach((d) => {
    const colony = d.colony || 'Unknown';
    colonyMap[colony] = (colonyMap[colony] || 0) + toNumber(d.amount);
  });

  return Object.entries(colonyMap)
    .map(([colonyName, amount]) => ({ colonyName, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function getPaymentModeBreakdown() {
  const modeMap = {};
  let total = 0;

  donations.forEach((d) => {
    const mode = d.paymentMode || 'Cash';
    modeMap[mode] = (modeMap[mode] || 0) + toNumber(d.amount);
    total += toNumber(d.amount);
  });

  return Object.entries(modeMap)
    .map(([mode, amount]) => ({
      mode,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getYearlyTrend() {
  const yearMap = {};

  donations.forEach((d) => {
    const year = new Date(d.donationDate).getFullYear();
    if (year) {
      yearMap[year] = (yearMap[year] || 0) + toNumber(d.amount);
    }
  });

  return Object.entries(yearMap)
    .map(([year, amount]) => ({ year: Number(year), amount }))
    .sort((a, b) => a.year - b.year);
}

export function getTopDonors(limit = 5) {
  const donorMap = {};

  donations.forEach((d) => {
    const key = d.memberId;
    if (!donorMap[key]) {
      donorMap[key] = { memberId: String(key), memberName: d.memberName, totalAmount: 0 };
    }
    donorMap[key].totalAmount += toNumber(d.amount);
  });

  return Object.values(donorMap)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);
}

export function getRecentActivity() {
  const sortedDonations = [...donations]
    .sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate))
    .slice(0, 10)
    .map((d) => ({
      type: 'donation',
      id: String(d.id),
      memberId: d.memberId != null ? String(d.memberId) : '',
      memberName: d.memberName || '',
      amount: toNumber(d.amount),
      paymentMode: d.paymentMode,
      donationDate: d.donationDate,
      receiptNumber: d.receiptNumber,
      collectorName: d.collectorName,
      remarks: d.remarks,
      colony: d.colony,
    }));

  const sortedMembers = [...members]
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
    .slice(0, 5)
    .map((m) => ({
      type: 'member',
      id: String(m.id),
      fullName: m.fullName,
      mobileNumber: m.mobileNumber,
      whatsappNumber: m.whatsappNumber,
      email: m.email,
      address: m.address,
      colony: m.colony,
      area: m.area,
      houseNumber: m.houseNumber,
      familyMembers: m.familyMembers,
      occupation: m.occupation,
      profilePhoto: m.profilePhoto,
      status: m.status,
      notes: m.notes,
      joinDate: m.joinDate,
    }));

  return {
    recentDonations: sortedDonations,
    recentMembers: sortedMembers,
    upcomingActivities: [],
  };
}
