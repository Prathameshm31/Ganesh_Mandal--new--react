import murtisData from '../mock-data/murtis';

let murtis = [...murtisData];

const toFrontendMurti = (m) => ({
  id: String(m.id),
  festivalYear: m.festivalYear || '',
  murtiName: m.murtiName || '',
  donatedBy: m.donatedBy || '',
  mobileNumber: m.mobileNumber || '',
  address: m.address || '',
  murtiHeight: m.murtiHeight || '',
  murtiType: m.murtiType || '',
  artistName: m.artistName || '',
  workshopName: m.workshopName || '',
  installationDate: m.installationDate || '',
  visarjanDate: m.visarjanDate || '',
  estimatedCost: m.estimatedCost != null ? Number(m.estimatedCost) : null,
  isSponsored: m.isSponsored || 'No',
  donationAmount: m.donationAmount != null ? Number(m.donationAmount) : null,
  photoUrl: m.photoUrl || '',
  remarks: m.remarks || '',
});

export const getAllMurtis = async () => murtis.map(toFrontendMurti);

export const getMurtiById = async (id) => {
  const m = murtis.find((murti) => murti.id === Number(id));
  return m ? toFrontendMurti(m) : null;
};

export const getCurrentYearMurti = async () => {
  const currentYear = String(new Date().getFullYear());
  const m = murtis.find((murti) => murti.festivalYear === currentYear);
  return m ? toFrontendMurti(m) : null;
};

export const getMurtiHistory = async (year) =>
  murtis.filter((m) => !year || m.festivalYear === String(year)).map(toFrontendMurti);

export const searchMurtiByDonor = async (donorName) =>
  murtis
    .filter((m) => m.donatedBy && m.donatedBy.toLowerCase().includes((donorName || '').toLowerCase()))
    .map(toFrontendMurti);

export const filterMurtiByYear = async (year) =>
  murtis.filter((m) => m.festivalYear === String(year)).map(toFrontendMurti);

export const createMurti = async (murti) => {
  const newMurti = { ...murti, id: murtis.length > 0 ? Math.max(...murtis.map((m) => m.id)) + 1 : 1 };
  murtis.push(newMurti);
  return toFrontendMurti(newMurti);
};

export const updateMurti = async (id, murti) => {
  const idx = murtis.findIndex((m) => m.id === Number(id));
  if (idx === -1) throw new Error('Murti not found');
  murtis[idx] = { ...murtis[idx], ...murti };
  return toFrontendMurti(murtis[idx]);
};

export const deleteMurti = async (id) => {
  murtis = murtis.filter((m) => m.id !== Number(id));
};

export const uploadMurtiPhoto = async (file) => {
  return { url: URL.createObjectURL(file) };
};

const murtiService = {
  getAllMurtis, getMurtiById, getCurrentYearMurti, getMurtiHistory,
  searchMurtiByDonor, filterMurtiByYear, createMurti, updateMurti, deleteMurti, uploadMurtiPhoto,
};

export default murtiService;
