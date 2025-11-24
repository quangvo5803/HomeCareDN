import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useService } from '../hook/useService';
import Loading from '../components/Loading';
import ItemDetail from '../components/ItemDetail';

export default function ServiceDetail() {
  const { serviceID } = useParams();
  const location = useLocation();
  const [service, setService] = useState({});
  const [randomServices, setRandomServices] = useState([]);
  const { getServiceById, fetchServices, loading } = useService();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await getServiceById(serviceID);
        if (data) {
          data.type = 'service';
        }
        setService(data || {});
      } catch (err) {
        console.error('Error fetching service:', err);
        setService({});
      }
    };
    fetchService();
  }, [serviceID, getServiceById, location.key]);

  useEffect(() => {
    if (!service.serviceType) return;

    const loadServices = async () => {
      try {
        const data = await fetchServices({
          PageNumber: 1,
          PageSize: 8,
          SortBy: 'random',
          FilterServiceType: service.serviceType || null,
          ExcludedID: serviceID,
        });
        setRandomServices(data || []);
      } catch (err) {
        console.error(err);
        setRandomServices([]);
      }
    };

    loadServices();
  }, [fetchServices, service.serviceType, serviceID]);

  if (loading) return <Loading />;

  return <ItemDetail item={service} relatedItems={randomServices} />;
}
