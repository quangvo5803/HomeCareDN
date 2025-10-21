import { useState, useCallback, useMemo, useEffect } from 'react';
import { addressService } from '../services/addressService';
import { useAuth } from '../hook/useAuth';
import AddressContext from './AddressContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';

export const AddressProvider = ({ children }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [totalAddressess, setTotalAddresses] = useState(0);
  const [loading, setLoading] = useState(false);

  // 📌 Public: fetch all address
  const fetchAddresses = useCallback(async () => {
    if (!user) throw new Error('Unauthorized');
    try {
      setLoading(true);
      const data = await addressService.getUserAddress(user.id);
      setAddresses(data || []);
      setTotalAddresses(data.length || 0);
      return data;
    } catch (err) {
      toast.error(handleApiError(err));
      setAddresses([]);
      setTotalAddresses(0);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createAddress = useCallback(
    async (dto) => {
      if (!user) throw new Error('Unauthorized');
      try {
        const newAddres = await addressService.createAddress(dto);
        setAddresses((prev) => [...prev, newAddres]);
        // Tăng tổng số address
        setTotalAddresses((prev) => prev + 1);
        return newAddres;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user]
  );

  const updateAddress = useCallback(
    async (dto) => {
      if (!user) throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await addressService.updateAddress(dto);
        // Optimistic update
        setAddresses((prev) =>
          prev.map((a) => (a.addressID === dto.AddressId ? updated : a))
        );
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const deleteAddress = useCallback(
    async (id) => {
      if (!user) throw new Error('Unauthorized');
      try {
        await addressService.deleteAddress(id);
        // Xoá khỏi local
        setAddresses((prev) => prev.filter((a) => a.addressID !== id));
        setTotalAddresses((prev) => prev - 1);
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user]
  );
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
      totalAddressess,
      loading,
      fetchAddresses,
      createAddress,
      updateAddress,
      deleteAddress,
    }),
    [
      addresses,
      totalAddressess,
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
