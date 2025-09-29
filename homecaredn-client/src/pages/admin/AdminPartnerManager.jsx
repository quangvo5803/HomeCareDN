import { useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import partnerService from '../../services/partnerService';
import Loading from '../../components/Loading';
import AuthContext from '../../context/AuthContext';

const AdminPartnerManager = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    searchTerm: '',
    status: '',
  });

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await partnerService.getAllPartners(filters);
      
      if (response && response.data) {
        setPartners(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setPartners(response);
      } else {
        setPartners([]);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.message || t('partner.fetch_error'));
      }
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    if (user && user.role === 'Admin') {
      fetchPartners();
    } else {
      setLoading(false);
      toast.error('Admin access required');
    }
  }, [fetchPartners, user]);

  const handleApprove = async (partnerId) => {
    try {
      await partnerService.approvePartner({
        partnerID: partnerId,
        approvedUserId: user?.id || user?.userId || 'admin'
      });
      toast.success(t('partner.approved_successfully'));
      fetchPartners();
    } catch (error) {
      toast.error(error.response?.data?.message || t('partner.approve_error'));
    }
  };

  const handleReject = async (partnerId, reason) => {
    try {
      await partnerService.rejectPartner({
        partnerID: partnerId,
        rejectionReason: reason
      });
      toast.success(t('partner.rejected_successfully'));
      fetchPartners();
    } catch (error) {
      toast.error(error.response?.data?.message || t('partner.reject_error'));
    }
  };

  const handleDelete = async (partnerId) => {
    const result = await Swal.fire({
      title: t('partner.confirm_delete'),
      text: t('partner.delete_warning'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel')
    });

    if (result.isConfirmed) {
      try {
        await partnerService.deletePartner(partnerId);
        toast.success(t('partner.deleted_successfully'));
        fetchPartners();
      } catch (error) {
        toast.error(error.response?.data?.message || t('partner.delete_error'));
      }
    }
  };

  const showApproveDialog = (partner) => {
    Swal.fire({
      title: t('partner.approve_partner'),
      text: `Approve ${partner.companyName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: t('partner.approve'),
      cancelButtonText: t('common.cancel'),
      confirmButtonColor: '#10b981'
    }).then((result) => {
      if (result.isConfirmed) {
        handleApprove(partner.partnerID || partner.id);
      }
    });
  };

  const showRejectDialog = (partner) => {
    Swal.fire({
      title: t('partner.reject_partner'),
      input: 'textarea',
      inputLabel: t('partner.rejection_reason'),
      inputPlaceholder: t('partner.reason_placeholder'),
      inputValidator: (value) => {
        if (!value || value.length > 500) {
          return t('partner.reason_required');
        }
      },
      showCancelButton: true,
      confirmButtonText: t('partner.reject'),
      cancelButtonText: t('common.cancel'),
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        handleReject(partner.partnerID || partner.id, result.value);
      }
    });
  };

  const showPartnerDetail = async (partnerId) => {
    try {
      const partner = await partnerService.getPartnerById(partnerId);
      setSelectedPartner(partner);
      setShowDetailModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || t('partner.detail_error'));
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Loading state
  if (loading) return <Loading />;

  // Unauthorized access
  if (!user || user.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-600">Access Denied</h2>
          <p className="text-gray-500">Admin privileges required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-6">
        {/* Header - giống Service Manager */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-handshake text-blue-600 text-lg"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Partner Management
              </h1>
              <p className="text-sm text-gray-600">View, approve, or reject partner applications.</p>
            </div>
          </div>

          {/* Stats indicator */}
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span>{partners.length} partner(s)</span>
          </div>
        </div>

        {/* Filters - Style giống Service Manager */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value, page: 1 }))}
                  placeholder="Search by company, contact person, or number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page size
                </label>
                <select
                  value={filters.pageSize}
                  onChange={(e) => setFilters(prev => ({ ...prev, pageSize: parseInt(e.target.value), page: 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchPartners}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <i className="fas fa-search mr-2"></i>
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container - Style giống Service Manager */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {partners.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        NO
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        COMPANY INFORMATION
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        CONTACT INFORMATION
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        SUBMITTED AT
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {partners.map((partner, index) => (
                      <tr key={partner.partnerID || partner.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {(filters.page - 1) * filters.pageSize + index + 1}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {partner.companyName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {partner.partnerType || 'N/A'}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-900">{partner.email || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{partner.phoneNumber || 'N/A'}</div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(partner.status)}`}>
                            {partner.status || 'Unknown'}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => showPartnerDetail(partner.partnerID || partner.id)}
                              className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            
                            {partner.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => showApproveDialog(partner)}
                                  className="text-green-600 hover:text-green-900 transition-colors p-1"
                                  title="Approve"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                                
                                <button
                                  onClick={() => showRejectDialog(partner)}
                                  className="text-red-600 hover:text-red-900 transition-colors p-1"
                                  title="Reject"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </>
                            )}
                            
                            <button
                              onClick={() => handleDelete(partner.partnerID || partner.id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-1"
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Style giống Service Manager */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-center">
                  <button className="px-3 py-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors text-sm">
                    {filters.page}
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Empty state - Style giống Service Manager
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-handshake text-2xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 text-sm">No partners have registered yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Partner Detail Modal */}
      {showDetailModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  Partner Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Company Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Partner Type
                    </label>
                    <p className="text-gray-900">{selectedPartner.partnerType || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Company Name
                    </label>
                    <p className="text-gray-900">{selectedPartner.companyName || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900">{selectedPartner.email || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Phone Number
                    </label>
                    <p className="text-gray-900">{selectedPartner.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Status & Details
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedPartner.status)}`}>
                      {selectedPartner.status || 'Unknown'}
                    </span>
                  </div>
                  
                  {selectedPartner.rejectionReason && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Rejection Reason
                      </label>
                      <p className="text-gray-900">{selectedPartner.rejectionReason}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Created At
                    </label>
                    <p className="text-gray-900">
                      {selectedPartner.createdAt ? new Date(selectedPartner.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedPartner.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                    Description
                  </h3>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedPartner.description}</p>
                </div>
              )}
              
              {/* Images */}
              {selectedPartner.imageUrls && selectedPartner.imageUrls.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                    Business Images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedPartner.imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Business ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                {selectedPartner.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        showApproveDialog(selectedPartner);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <i className="fas fa-check mr-2"></i>
                      Approve
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        showRejectDialog(selectedPartner);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Reject
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPartnerManager;
