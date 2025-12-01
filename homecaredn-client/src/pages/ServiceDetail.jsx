import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useService } from '../hook/useService';
import Loading from '../components/Loading';
import ItemDetail from '../components/ItemDetail';

export default function ServiceDetail() {
  const { serviceID } = useParams();
  const location = useLocation();
  const [service, setService] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [randomServices, setRandomServices] = useState([]);
  const { getServiceById, fetchServices } = useService();

  useEffect(() => {
    const fetchService = async () => {
      setLoadingDetail(true);
      const data = await getServiceById(serviceID);
      if (data) data.type = 'service';
      setService(data);
      setLoadingDetail(false);
    };
    fetchService();
  }, [serviceID, getServiceById, location.key]);

  useEffect(() => {
    if (!service?.serviceType) return;

    const loadServices = async () => {
      const data = await fetchServices({
        PageNumber: 1,
        PageSize: 8,
        SortBy: 'random',
        FilterServiceType: service.serviceType,
        ExcludedID: serviceID,
      });

      setRandomServices(data || []);
    };

    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.serviceType, serviceID]);

  if (loadingDetail) return <Loading />;

  return <ItemDetail item={service} relatedItems={randomServices} />;
}
