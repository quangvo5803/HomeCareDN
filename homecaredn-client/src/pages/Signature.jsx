import { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useAuth } from '../hook/useAuth';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';
import { partnerRequestService } from '../services/partnerRequestService';
import Loading from '../components/Loading';
import { handleApiError } from '../utils/handleApiError';
import { useNavigate } from 'react-router-dom';
import AvatarMenu from '../components/AvatarMenu'
import LanguageSwitch from '../components/LanguageSwitch';

export default function Signature() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const sigCanvas = useRef(null);
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (user?.role === 'Distributor' || user?.role === 'Contractor') {
            const timer = setTimeout(() => {
                if (sigCanvas.current) {
                    setIsCanvasReady(true);
                } else {
                    setIsCanvasReady(false);
                }
            }, 200);

            return () => {
                clearTimeout(timer);
                setIsCanvasReady(false);
            };
        } else {
            setIsCanvasReady(false);
        }
    }, [user]);

    const clearSignature = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        } else {
            toast.warning(
                t('partnerRequest.partnerRegistration.validation.signatureClearWarning')
            );
        }
    };

    const handleSubmitFinal = async () => {
        if (!isCanvasReady || !sigCanvas.current) {
            toast.error(
                t('partnerRequest.partnerRegistration.validation.canvasNotReady')
            );
            return;
        }

        if (sigCanvas.current.isEmpty()) {
            toast.warning(
                t('partnerRequest.partnerRegistration.validation.signatureEmpty')
            );
            return;
        }

        let signatureDataURL;
        try {
            const canvas = sigCanvas.current.getCanvas();
            signatureDataURL = canvas.toDataURL('image/png');
        } catch {
            toast.error(
                t('partnerRequest.partnerRegistration.validation.signatureError')
            );
            return;
        }

        setLoading(true);
        try {
            const blob = await (await fetch(signatureDataURL)).blob();
            const signatureFile = new File([blob], 'signature.png', {
                type: 'image/png',
            });

            const signatureResult = await uploadToCloudinary(
                signatureFile,
                import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                null,
                'HomeCareDN/PartnerRequest/Signatures'
            );

            const payload = {
                Email: user.email,
                SignatureUrl: signatureResult.url,
            };

            const res = await partnerRequestService.update(payload);
            login(res.accessToken);
            toast.success(t('SUCCESS.PARTNER_REQUEST_Signature'));
            let redirectPath = '/';
            if (user?.role === 'Contractor') {
                redirectPath = '/Contractor';
            } else if (user?.role === 'Distributor') {
                redirectPath = '/Distributor';
            }

            navigate(redirectPath);
        } catch (error) {
            toast.error(t(handleApiError(error)));
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };
    if (loading) return <Loading />;
    if (uploadProgress) return <Loading progress={uploadProgress} />;

    return (
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3 p-4">
                    <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-"></div>
                    <div className="hidden sm:block">
                        <LanguageSwitch />
                    </div>
                    <AvatarMenu />
                </div>
            </header>

            {/* Main content */}
            <main className="p-4 md:p-6 space-y-6 flex-1 overflow-x-hidden">
                <div className="space-y-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 h-64 overflow-y-auto text-sm text-gray-700 shadow-inner">
                        <h4 className="text-center font-bold text-lg mb-4 uppercase">
                            {t('partnerRequest.partnerRegistration.step3.contractTitle')}
                            {user?.role === 'Contractor'
                                ? t('partnerRequest.partnerRegistration.step3.contractor')
                                : t('partnerRequest.partnerRegistration.step3.distributor')}
                        </h4>
                        <p className="mb-2">
                            <strong>
                                {t(
                                    'partnerRequest.partnerRegistration.step3.contractPartyA'
                                )}
                            </strong>
                            {t('partnerRequest.partnerRegistration.step3.partyA')}
                        </p>
                        <p className="mb-2">
                            <strong>
                                {t(
                                    'partnerRequest.partnerRegistration.step3.contractPartyB'
                                )}
                            </strong>
                            {user?.fullName}
                        </p>
                        <p className="mb-2">
                            <strong>
                                {t(
                                    'partnerRequest.partnerRegistration.step3.contractRepresentative'
                                )}
                            </strong>
                            {user?.email}
                        </p>
                        <p className="mt-4">
                            {t(
                                'partnerRequest.partnerRegistration.step3.contractContent'
                            )}
                        </p>
                        <div className="whitespace-pre-wrap text-justify border-t border-gray-100 pt-4">
                            {t(
                                'partnerRequest.partnerRegistration.step3.contractDetails'
                            )}
                        </div>
                        <p className="mt-4">
                            {t(
                                'partnerRequest.partnerRegistration.step3.contractCommitment'
                            )}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-pen-nib mr-1 text-blue-600"></i>
                            {t('partnerRequest.partnerRegistration.step3.signatureLabel')}
                            <span className="text-red-500">*</span>
                        </label>
                        <div
                            className="border-2 border-dashed border-gray-400 rounded-xl bg-white overflow-hidden relative"
                            style={{ height: 200 }}
                        >
                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor="black"
                                velocityFilterWeight={0.7}
                                canvasProps={{
                                    className: 'w-full h-full cursor-crosshair',
                                }}
                            />
                            <button
                                type="button"
                                onClick={clearSignature}
                                className="absolute top-2 right-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700"
                            >
                                <i className="fas fa-eraser"></i>
                                {t(
                                    'partnerRequest.partnerRegistration.step3.signatureClear'
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                            {t('partnerRequest.partnerRegistration.step3.signatureNote')}
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={handleSubmitFinal}
                            disabled={!isCanvasReady}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-bold hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-200 flex items-center justify-center uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {!isCanvasReady && (
                                <i className="fas fa-spinner fa-spin mr-2" />
                            )}
                            <i className="fas fa-file-signature mr-2" />
                            {t('partnerRequest.partnerRegistration.step3.submitButton')}
                        </button>
                    </div>
                </div>
            </main>

            <footer className="p-6 text-center text-gray-500 text-xs md:text-sm">
                © {new Date().getFullYear()} HomeCareDN
            </footer>
        </div>

    );

}