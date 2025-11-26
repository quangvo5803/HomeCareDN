import { useState, useCallback, useMemo, useEffect } from 'react';
import { userService } from '../services/userService';
import UserContext from './UserContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';
import { useAuth } from '../hook/useAuth';

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [totalAddresses, setTotalAddresses] = useState(0);
  const executeFetchUsers = useCallback(
    async ({
      PageNumber = 1,
      PageSize = 10,
      SortBy,
      FilterRoleName,
      Search,
    } = {}) => {
      try {
        if (user?.role === 'Admin') {
          const data = await userService.getAll({
            PageNumber,
            PageSize,
            SortBy,
            FilterRoleName,
            Search,
          });
          const items = data.items || [];
          setUsers(items);
          setTotalUsers(data.totalCount || 0);
          return items;
        } else {
          return { items: [], totalCount: 0 };
        }
      } catch (err) {
        toast.error(handleApiError(err));
        setUsers([]);
        setTotalUsers(0);
        return [];
      }
    },
    [user]
  );

  const fetchUsers = useCallback(
    async (params = {}) => {
      return await withMinLoading(() => executeFetchUsers(params), setLoading);
    },
    [executeFetchUsers]
  );

  const getUserById = useCallback(
    async (id) => {
      try {
        if (user) {
          const data = await userService.getById(id);
          setProfile(data);
          setAddresses(data.addresses || []);
          setTotalAddresses((data.addresses || []).length);
          return data;
        } else {
          return [];
        }
      } catch (err) {
        toast.error(handleApiError(err));
        setProfile(null);
        setAddresses([]);
        setTotalAddresses(0);
        return null;
      }
    },
    [user]
  );
  const updateUser = useCallback(async (dto) => {
    try {
      const data = await userService.updateUser(dto);
      setProfile((prev) => ({
        ...prev,
        fullName: dto.FullName,
        phoneNumber: dto.PhoneNumber,
        gender: dto.Gender,
      }));
      return data;
    } catch (err) {
      toast.error(handleApiError(err));
      return null;
    }
  }, []);

  // 📌 Create address (component tự quản lý loading)
  const createAddress = useCallback(async (dto) => {
    try {
      const newAddress = await userService.createAddress(dto);
      setAddresses((prev) => [...prev, newAddress]);
      setTotalAddresses((prev) => prev + 1);
      return newAddress;
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  }, []);

  // 📌 Update address
  const updateAddress = useCallback(async (dto) => {
    try {
      const updated = await userService.updateAddress(dto);
      setAddresses((prev) =>
        prev.map((a) => (a.addressID === dto.AddressId ? updated : a))
      );
      return updated;
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  }, []);

  // 📌 Delete address
  const deleteAddress = useCallback(async (id) => {
    try {
      await userService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.addressID !== id));
      setTotalAddresses((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  }, []);

  useEffect(() => {
    if (user) {
      getUserById(user.id);
    }
  }, [getUserById, user]);
  const contextValue = useMemo(
    () => ({
      users,
      totalUsers,
      profile,
      addresses,
      totalAddresses,
      loading,
      fetchUsers,
      getUserById,
      updateUser,
      createAddress,
      updateAddress,
      deleteAddress,
    }),
    [
      users,
      totalUsers,
      profile,
      addresses,
      totalAddresses,
      loading,
      fetchUsers,
      getUserById,
      updateUser,
      createAddress,
      updateAddress,
      deleteAddress,
    ]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
UserProvider.propTypes = { children: PropTypes.node.isRequired };
