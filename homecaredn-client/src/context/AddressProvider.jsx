import { useState, useCallback, useMemo, useEffect } from 'react';
import { addressService } from '../services/addressService';
import { useAuth } from '../hook/useAuth';
import AddressContext from './AddressContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import { withMinLoading } from '../utils/withMinLoading';
import PropTypes from 'prop-types';

export const AddressProvider = ({ children }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [totalAddresses, setTotalAddresses] = useState(0);
  const [loading, setLoading] = useState(false); // chỉ dùng cho fetch

  // 📌 Fetch addresses (min loading để tránh giật UI)
  const executeFetch = useCallback(async () => {
    try {
      const data = await addressService.getAll(user.id);
      setAddresses(data || []);
      setTotalAddresses(data.length || 0);
      return data;
    } catch (err) {
      toast.error(handleApiError(err));
      setAddresses([]);
      setTotalAddresses(0);
      return [];
    }
  }, [user]);

  const fetchAddresses = useCallback(async () => {
    return await withMinLoading(() => executeFetch(), setLoading);
  }, [executeFetch]);

  // 📌 Create address (component tự quản lý loading)
  const createAddress = useCallback(async (dto) => {
    try {
      const newAddress = await addressService.create(dto);
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
      const updated = await addressService.update(dto);
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
      await addressService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.addressID !== id));
      setTotalAddresses((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  }, []);

  // 📌 Auto-fetch khi user thay đổi
  useEffect(() => {
    if (!user) {
      setAddresses([]);
      setTotalAddresses(0);
      return;
    }
    if (user.role === 'Customer') {
      fetchAddresses();
    }
  }, [user, fetchAddresses]);

  const contextValue = useMemo(
    () => ({
      addresses,
      totalAddresses,
      loading, // chỉ dùng cho fetch
      fetchAddresses,
      createAddress,
      updateAddress,
      deleteAddress,
    }),
    [
      addresses,
      totalAddresses,
      loading,
      fetchAddresses,
      createAddress,
      updateAddress,
      deleteAddress,
    ]
  );

  return (
    <AddressContext.Provider value={contextValue}>
      {children}
    </AddressContext.Provider>
  );
};

AddressProvider.propTypes = { children: PropTypes.node.isRequired };
