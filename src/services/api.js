import axiosInstance from '../utils/axiosInstance';

// --- Auth APIs ---
export const register = (userData) => axiosInstance.post('/auth/register', userData);
export const login = (credentials) => axiosInstance.post('/auth/login', credentials);
export const googleLogin = (credential) => axiosInstance.post('/auth/google', { credential });
export const getProfile = () => axiosInstance.get('/auth/profile');
export const getCreatorStats = () => axiosInstance.get('/auth/creator-stats');
export const updateProfile = (formData) => axiosInstance.put('/auth/profile', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const changePassword = (data) => axiosInstance.put('/auth/change-password', data);
export const clearWatchHistory = () => axiosInstance.delete('/auth/watch-history');
export const updateWatchTime = (watchTimeDelta) => axiosInstance.post('/auth/watch-time', { watchTimeDelta });
export const becomeCreator = () => axiosInstance.put('/auth/become-creator');
export const getCreatorProfileById = (id) => axiosInstance.get(`/auth/creator/${id}`);
export const adminLogin = (credentials) => axiosInstance.post('/admin/login', credentials);

// --- Video APIs ---
export const getVideos = (params) => axiosInstance.get('/videos', { params });
export const getCreatorVideos = () => axiosInstance.get('/videos/my/all');
export const getVideoById = (id) => axiosInstance.get(`/videos/${id}`);
export const updateVideoDuration = (id, duration) => axiosInstance.put(`/videos/${id}/duration`, { duration });
export const uploadVideo = (formData, onProgress) => axiosInstance.post('/videos/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: (progressEvent) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    if (onProgress) onProgress(percentCompleted);
  }
});

// --- Stream APIs ---
export const getLiveStreams = () => axiosInstance.get('/streams/live');
export const getStreamById = (id) => axiosInstance.get(`/streams/${id}`);
export const startStream = (streamData) => axiosInstance.post('/streams/start', streamData);
export const endStream = (id) => axiosInstance.put(`/streams/end/${id}`);

// --- Admin APIs ---
export const getAdminStats = () => axiosInstance.get('/admin/stats');
export const getAllUsers = () => axiosInstance.get('/admin/users');
export const getPendingContent = () => axiosInstance.get('/admin/content/pending');
export const approveContent = (id, type) => axiosInstance.post(`/admin/content/approve/${id}`, { type });
export const rejectContent = (id, type) => axiosInstance.post(`/admin/content/reject/${id}`, { type });


// --- News APIs ---
export const getNews = (params) => axiosInstance.get('/news', { params });
export const createNews = (newsData) => axiosInstance.post('/news', newsData);

// --- Chat APIs ---
export const getChatMessages = (room) => axiosInstance.get(`/chat/${room}`);
export const sendChatMessage = (messageData) => axiosInstance.post('/chat/send', messageData);

// --- Event APIs ---
export const getTrendingEvents = () => axiosInstance.get('/events/trending');
export const searchEvents = (params) => axiosInstance.get('/events/search', { params });
export const getEventDetails = (id) => axiosInstance.get(`/events/${id}`);

// --- Plan APIs ---
export const getPlans = () => axiosInstance.get('/plans');
export const createPlan = (data) => axiosInstance.post('/plans', data);
export const updatePlan = (id, data) => axiosInstance.put(`/plans/${id}`, data);
export const deletePlan = (id) => axiosInstance.delete(`/plans/${id}`);

// --- Payment APIs ---
export const createOrder = (orderData) => axiosInstance.post('/payments/order', orderData);
export const verifyPayment = (paymentData) => axiosInstance.post('/payments/verify', paymentData);

// --- Interaction APIs ---
export const toggleLike = (id) => axiosInstance.post(`/videos/${id}/like`);
export const toggleDislike = (id) => axiosInstance.post(`/videos/${id}/dislike`);
export const incrementViews = (id) => axiosInstance.post(`/videos/${id}/view`);
export const toggleSubscribe = (id) => axiosInstance.post(`/auth/subscribe/${id}`);

// --- Comment APIs ---
export const addComment = (videoId, commentData) => axiosInstance.post(`/videos/${videoId}/comments`, commentData);
export const getComments = (videoId) => axiosInstance.get(`/videos/${videoId}/comments`);
export const toggleCommentLike = (commentId) => axiosInstance.post(`/comments/${commentId}/like`);
export const getCommentReplies = (commentId) => axiosInstance.get(`/comments/${commentId}/replies`);

// --- Notification APIs ---
export const getNotifications = () => axiosInstance.get('/notifications');
export const markNotificationAsRead = (id) => axiosInstance.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => axiosInstance.put('/notifications/read');
export const deleteNotification = (id) => axiosInstance.delete(`/notifications/${id}`);

// --- Community APIs ---
export const createCommunity = (data) => axiosInstance.post('/communities/create', data);
export const uploadCommunityImage = (formData) => axiosInstance.post('/communities/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getMyCommunities = () => axiosInstance.get('/communities/my');
export const getCommunityById = (id) => axiosInstance.get(`/communities/${id}`);
export const updateCommunity = (id, data) => axiosInstance.post(`/communities/${id}/update`, data);
export const deleteCommunity = (id) => axiosInstance.delete(`/communities/${id}`);
export const joinCommunity = (id) => axiosInstance.post(`/communities/${id}/join`);
export const leaveCommunity = (id) => axiosInstance.post(`/communities/${id}/leave`);
export const inviteToCommunity = (id, data) => axiosInstance.post(`/communities/${id}/invite`, data);
export const removeCommunityMember = (id, data) => axiosInstance.post(`/communities/${id}/remove-member`, data);
export const promoteCommunityAdmin = (id, data) => axiosInstance.post(`/communities/${id}/promote-admin`, data);

// --- Community Groups APIs ---
export const createCommunityGroup = (id, data) => axiosInstance.post(`/communities/${id}/groups/create`, data);
export const getCommunityGroups = (id) => axiosInstance.get(`/communities/${id}/groups`);
export const joinCommunityGroup = (id) => axiosInstance.post(`/communities/groups/${id}/join`);
export const leaveCommunityGroup = (id) => axiosInstance.post(`/communities/groups/${id}/leave`);
export const getCommunityGroupMessages = (id) => axiosInstance.get(`/communities/groups/${id}/messages`);
