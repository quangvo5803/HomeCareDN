import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import Loading from "../../components/Loading";
import { handleApiError } from "../../utils/handleApiError";
import { contactService } from "../../services/contactService";

function ReplyModal({ open, onClose, item, onSubmit }) {
  const { t } = useTranslation();
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    // reset nội dung khi mở modal mới
    if (open) setReplyContent("");
  }, [open]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("adminSupportManager.title")}</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {t("adminSupportManager.email")}
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              value={item.email || ""}
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {t("adminSupportManager.fullName")}
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              value={item.fullName || ""}
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {t("adminSupportManager.subject")}
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              value={item.subject || ""}
              readOnly
            />
          </div>

          {/* <div>
            <label className="block text-sm text-gray-600 mb-1">
              {t("adminSupportManager.pending")} / {t("adminSupportManager.status")}
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              value={item.isProcessed ? t("adminSupportManager.processed") : t("adminSupportManager.pending")}
              readOnly
            />
          </div> */}

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {t("adminSupportManager.subtitle")}
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              rows={5}
              value={item.message || ""}
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {t("adminSupportManager.replyLabel")}
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              rows={5}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={t("adminSupportManager.replyPlaceholder")}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            {t("BUTTON.Cancel")}
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => onSubmit(replyContent)}
          >
            {t("BUTTON.Reply")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSupportManager() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [supports, setSupports] = useState([]);
  const [filter, setFilter] = useState("all"); // all | pending | processed

  // modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null); // { id, fullName, email, subject, isProcessed, message }

  const fetchSupports = async () => {
    try {
      setLoading(true);
      // filter server-side theo isProcessed 
      const isProcessedParam =
        filter === "all" ? undefined : filter === "processed" ? true : false;

      const res = await contactService.listAll(isProcessedParam);
      setSupports(res.data || []);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupports();
  }, [filter]);

  const openReply = async (item) => {
    try {
      const res = await contactService.getById(item.id); // GET /api/support/{id}
      setSelected({
        id: item.id,
        fullName: item.fullName,
        email: item.email,
        subject: item.subject,
        isProcessed: item.isProcessed,
        message: res?.data?.message || "",
      });
      setOpen(true);
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const submitReply = async (replyContent) => {
    if (!replyContent?.trim()) {
      toast.error(t("adminSupportManager.replyPlaceholder"));
      return;
    }
    try {
      await contactService.reply(selected.id, { replyContent });
      toast.success(t("SUCCESS.REPLY"));
      setOpen(false);
      setSelected(null);
      fetchSupports();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const handleDelete = async (id) => {
    const title = t("ModalPopup.DeleteSupportModal.title", "Delete this support request?");
    const text  = t("ModalPopup.DeleteSupportModal.text", "This action cannot be undone.");

    const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: t("BUTTON.Delete", "Delete"),
    cancelButtonText: t("BUTTON.Cancel", "Cancel"),
    });


    if (!result.isConfirmed) return;

    try {
      await contactService.delete(id);
      toast.success(t("SUCCESS.DELETE"));
      fetchSupports();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const filteredCount = useMemo(() => supports.length, [supports]);

  if (loading) return <Loading />;

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br rounded-2xl from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            <i className="fa-solid fa-headset mr-3"></i>
            {t("adminSupportManager.title")}
          </h2>
          <p className="text-gray-600">{t("adminSupportManager.subtitle")}</p>
        </div>

        {/* Filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className={`px-3 py-1.5 rounded-full text-sm border ${
              filter === "all"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-3 py-1.5 rounded-full text-sm border ${
              filter === "pending"
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setFilter("pending")}
          >
            {t("adminSupportManager.pending")}
          </button>
          <button
            className={`px-3 py-1.5 rounded-full text-sm border ${
              filter === "processed"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setFilter("processed")}
          >
            {t("adminSupportManager.processed")}
          </button>

          <div className="ml-auto text-sm text-gray-500">
            {filteredCount} item(s)
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    {t("adminSupportManager.fullName")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    {t("adminSupportManager.email")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    {t("adminSupportManager.subject")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    {t("adminSupportManager.status")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    {t("adminSupportManager.action")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {supports?.length ? (
                  supports.map((s, idx) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-4 text-center text-sm">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm">{s.fullName}</td>
                      <td className="px-6 py-4 text-sm">{s.email}</td>
                      <td className="px-6 py-4 text-sm">{s.subject}</td>
                      <td className="px-6 py-4 text-center">
                        {s.isProcessed ? (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                            {t("adminSupportManager.processed")}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs">
                            {t("adminSupportManager.pending")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        {!s.isProcessed && (
                          <button
                            className="px-3 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
                            onClick={() => openReply(s)}
                          >
                            {t("BUTTON.Reply")}
                          </button>
                        )}
                        <button
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          onClick={() => handleDelete(s.id)}
                        >
                          {t("BUTTON.Delete")}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500 text-sm"
                    >
                      {t("adminSupportManager.noSupport")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <ReplyModal
          open={open}
          onClose={() => {
            setOpen(false);
            setSelected(null);
          }}
          item={selected}
          onSubmit={submitReply}
        />
      </div>
    </div>
  );
}
