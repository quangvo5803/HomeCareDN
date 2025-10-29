import { useState, useCallback, useMemo, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import { useAuth } from '../hook/useAuth';
import { withMinLoading } from '../utils/withMinLoading';
import { isSafeText } from '../utils/validateText';
import { isSafePhone } from '../utils/validatePhone';
import PropTypes from 'prop-types';
import ProfileContext from './ProfileContext';

export const ProfileProvider = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false); // chỉ dùng cho fetch

  // 📌 Fetch profile
  const executeFetch = useCallback(async () => {
    if (!user?.id) return null;
    try {
      const data = await profileService.getById(user.id);
      setProfile(data);
      return data;
    } catch (err) {
      toast.error(handleApiError(err));
      setProfile(null);
      return null;
    }
  }, [user?.id]);

  const fetchProfile = useCallback(async () => {
    return await withMinLoading(() => executeFetch(), setLoading);
  }, [executeFetch]);

  // 📌 Update profile
  const updateProfile = useCallback(
    async (form) => {
      if (!user?.id) {
        toast.error('Không xác định được người dùng');
        return;
      }

      const fullName = (form.fullName || '').trim();
      if (!fullName) {
        toast.error('Tên không được để trống');
        return;
      }
      if (!isSafeText(fullName)) {
        toast.error('Tên không hợp lệ');
        return;
      }
      if (!isSafePhone(form.phoneNumber)) {
        toast.error('Số điện thoại không hợp lệ');
        return;
      }

      try {
        const dto = {
          UserId: user.id,
          FullName: form.fullName,
          PhoneNumber: form.phoneNumber || null,
          Gender: form.gender === '' ? null : Number(form.gender),
        };
        await profileService.update(dto);
        toast.success('Cập nhật hồ sơ thành công');
        await fetchProfile();
      } catch (err) {
        toast.error(handleApiError(err, 'Cập nhật hồ sơ thất bại'));
      }
    },
    [user, fetchProfile]
  );

  // 📌 Tự động load khi user thay đổi
  useEffect(() => {
    if (user && user.role === 'Customer') {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user, fetchProfile]);

  const contextValue = useMemo(
    () => ({
      profile,
      loading,
      fetchProfile,
      updateProfile,
    }),
    [profile, loading, fetchProfile, updateProfile]
  );

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

ProfileProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
