import { useParams, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMaterial } from '../hook/useMaterial';
import Loading from '../components/Loading';
import ItemDetail from '../components/ItemDetail';

export default function MaterialDetail() {
  const { materialID } = useParams();
  const [material, setMaterial] = useState({});
  const { getMaterialById, loading, fetchMaterials } = useMaterial();
  const [randomMaterials, setRandomMaterials] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchMaterial = async () => {
      const data = await getMaterialById(materialID);
      if (data) {
        data.type = 'material';
      }
      setMaterial(data || {});
    };
    fetchMaterial();
  }, [materialID, getMaterialById, location.key]);

  useEffect(() => {
    if (!material.categoryID) return;
    const loadMaterials = async () => {
      try {
        const data = await fetchMaterials({
          PageNumber: 1,
          PageSize: 8,
          SortBy: 'random',
          FilterCategoryID: material.categoryID || null,
        });
        setRandomMaterials(data || []);
      } catch (err) {
        console.error(err);
        setRandomMaterials([]);
      }
    };

    loadMaterials();
  }, [fetchMaterials, material.categoryID]);

  if (loading) return <Loading />;
  return <ItemDetail item={material} relatedItems={randomMaterials} />;
}
