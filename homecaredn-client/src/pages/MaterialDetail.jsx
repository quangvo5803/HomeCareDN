import { useParams, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMaterial } from '../hook/useMaterial';
import Loading from '../components/Loading';
import ItemDetail from '../components/ItemDetail';

export default function MaterialDetail() {
  const { materialID } = useParams();
  const [material, setMaterial] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [randomMaterials, setRandomMaterials] = useState([]);
  const { getMaterialById, fetchMaterials } = useMaterial();
  const location = useLocation();

  useEffect(() => {
    const fetchMaterial = async () => {
      setLoadingDetail(true);
      const data = await getMaterialById(materialID);
      if (data) data.type = 'material';
      setMaterial(data);
      setLoadingDetail(false);
    };
    fetchMaterial();
  }, [materialID, getMaterialById, location.key]);

  useEffect(() => {
    if (!material?.categoryID) return;

    const loadMaterials = async () => {
      const data = await fetchMaterials({
        PageNumber: 1,
        PageSize: 8,
        SortBy: 'random',
        FilterCategoryID: material.categoryID,
        FilterBrandID: material.brandID,
        ExcludedID: materialID,
      });

      setRandomMaterials(data || []);
    };

    loadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material?.categoryID, material?.brandID, materialID]);

  // Không render khi detail chưa load xong
  if (loadingDetail) return <Loading />;

  return <ItemDetail item={material} relatedItems={randomMaterials} />;
}
