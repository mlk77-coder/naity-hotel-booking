import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Star, StarOff, Eye, EyeOff,
  Trash2, ChevronDown, ChevronUp,
  Search, RefreshCw, Send
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import AdminLayout from "./AdminLayout";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SUBJECT_LABELS: Record<string, { ar: string; en: string }> = {
  booking_issue: { ar: "مشكلة حجز", en: "Booking Issue" },
  hotel_inquiry: { ar: "استفسار فندق", en: "Hotel Inquiry" },
  payment: { ar: "استفسار دفع", en: "Payment Question" },
  cancellation: { ar: "طلب إلغاء", en: "Cancellation" },
  partnership: { ar: "شراكة / فندق", en: "Partnership" },
  complaint: { ar: "شكوى", en: "Complaint" },
  suggestion: { ar: "اقتراح", en: "Suggestion" },
  other: { ar: "أخرى", en: "Other" },
};

const SUBJECT_COLORS: Record<string, string> = {
  booking_issue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  hotel_inquiry: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  payment: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  cancellation: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  partnership: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  complaint: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  suggestion: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  other: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_starred: boolean;
  replied_at: string | null;
  created_at: string;
}

export default function AdminMessages() {
  const { lang } = useI18n();
  const tx = (ar: string, en: string) => (lang === "ar" ? ar : en);

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterRead, setFilterRead] = useState("all");
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response: any = await apiClient.get('/api/contact');
      if (response.success) {
        setMessages((response.data as ContactMessage[]) ?? []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const filtered = messages.filter((m) => {
    const matchSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "all" || m.subject === filterSubject;
    const matchRead =
      filterRead === "all" ||
      (filterRead === "unread" && !m.is_read) ||
      (filterRead === "read" && m.is_read) ||
      (filterRead === "starred" && m.is_starred);
    return matchSearch && matchSubject && matchRead;
  });

  const markRead = async (id: string, val: boolean) => {
    await apiClient.patch(`/api/contact/${id}/read`, { is_read: val });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: val } : m)));
  };

  const toggleStar = async (id: string, val: boolean) => {
    await apiClient.patch(`/api/contact/${id}/star`, { is_starred: val });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_starred: val } : m)));
  };

  const deleteMsg = async (id: string) => {
    if (!confirm(tx("هل تريد حذف هذه الرسالة؟", "Delete this message?"))) return;
    await apiClient.delete(`/api/contact/${id}`);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    toast.success(tx("تم الحذف", "Deleted"));
  };

  const openReplyDialog = (msg: ContactMessage) => {
    setReplyingTo(msg);
    setReplyMessage("");
    setReplyDialogOpen(true);
  };

  const sendReply = async () => {
    if (!replyingTo || !replyMessage.trim()) {
      toast.error(tx("يجب إدخال نص الرد", "Please enter reply message"));
      return;
    }

    setSendingReply(true);
    try {
      const response: any = await apiClient.post(`/api/contact/${replyingTo.id}/reply`, {
        reply_message: replyMessage.trim(),
        admin_name: "Naity Support Team"
      });

      if (response.success) {
        toast.success(tx("تم إرسال الرد بنجاح", "Reply sent successfully"));
        setReplyDialogOpen(false);
        setReplyMessage("");
        
        // Update message as replied
        setMessages((prev) =>
          prev.map((m) =>
            m.id === replyingTo.id
              ? { ...m, replied_at: new Date().toISOString(), is_read: true }
              : m
          )
        );
      } else {
        throw new Error(response.message || "Failed to send reply");
      }
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast.error(error.message || tx("فشل إرسال الرد", "Failed to send reply"));
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {tx("الرسائل الواردة", "Incoming Messages")}
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {unreadCount} {tx("رسالة غير مقروءة", "unread")}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={fetchMessages}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium text-foreground transition"
          >
            <RefreshCw className="w-4 h-4" />
            {tx("تحديث", "Refresh")}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: tx("إجمالي", "Total"), value: messages.length, color: "text-foreground" },
            { label: tx("غير مقروء", "Unread"), value: messages.filter((m) => !m.is_read).length, color: "text-blue-500" },
            { label: tx("مميّز", "Starred"), value: messages.filter((m) => m.is_starred).length, color: "text-amber-500" },
            {
              label: tx("اليوم", "Today"),
              value: messages.filter((m) => new Date(m.created_at).toDateString() === new Date().toDateString()).length,
              color: "text-green-500",
            },
          ].map((s, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card rounded-xl px-3 py-2 border border-border/50 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tx("ابحث بالاسم أو البريد أو الرسالة...", "Search by name, email or message...")}
              className="flex-1 bg-transparent text-sm outline-none text-foreground"
            />
          </div>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-card rounded-xl px-3 py-2 border border-border/50 text-sm text-foreground outline-none cursor-pointer"
          >
            <option value="all">{tx("كل المواضيع", "All Subjects")}</option>
            {Object.entries(SUBJECT_LABELS).map(([key, val]) => (
              <option key={key} value={key}>
                {lang === "ar" ? val.ar : val.en}
              </option>
            ))}
          </select>
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            className="bg-card rounded-xl px-3 py-2 border border-border/50 text-sm text-foreground outline-none cursor-pointer"
          >
            <option value="all">{tx("الكل", "All")}</option>
            <option value="unread">{tx("غير مقروء", "Unread")}</option>
            <option value="read">{tx("مقروء", "Read")}</option>
            <option value="starred">{tx("مميّز", "Starred")}</option>
          </select>
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            {tx("جاري التحميل...", "Loading...")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-muted-foreground">
              {tx("لا توجد رسائل", "No messages found")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((msg) => {
                const subjectLabel = SUBJECT_LABELS[msg.subject] ?? SUBJECT_LABELS.other;
                const subjectColor = SUBJECT_COLORS[msg.subject] ?? SUBJECT_COLORS.other;
                const expanded = expandedId === msg.id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`bg-card rounded-xl border transition ${
                      !msg.is_read ? "border-primary/30 bg-primary/5" : "border-border/50"
                    }`}
                  >
                    {/* Row */}
                    <div className="flex items-start gap-3 p-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                        {msg.full_name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground text-sm">{msg.full_name}</span>
                          {!msg.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${subjectColor}`}>
                            {lang === "ar" ? subjectLabel.ar : subjectLabel.en}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{msg.email}</p>
                        <p className="text-xs text-muted-foreground">
                          📞 {msg.phone} · 🌍 {msg.country}
                        </p>
                        <p className="text-sm text-foreground/80 line-clamp-2">{msg.message}</p>
                      </div>

                      {/* Actions + Date */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(msg.created_at), "dd/MM/yyyy HH:mm")}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleStar(msg.id, !msg.is_starred)}
                            className="p-1.5 rounded-lg hover:bg-muted transition"
                            title={tx("تمييز", "Star")}
                          >
                            {msg.is_starred ? (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            ) : (
                              <StarOff className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                          <button
                            onClick={() => markRead(msg.id, !msg.is_read)}
                            className="p-1.5 rounded-lg hover:bg-muted transition"
                            title={msg.is_read ? tx("تعليم غير مقروء", "Mark unread") : tx("تعليم مقروء", "Mark read")}
                          >
                            {msg.is_read ? (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Eye className="w-4 h-4 text-primary" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteMsg(msg.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            title={tx("حذف", "Delete")}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                          <button
                            onClick={() => {
                              setExpandedId(expanded ? null : msg.id);
                              if (!msg.is_read) markRead(msg.id, true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted transition"
                          >
                            {expanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded */}
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2 border-t border-border/30 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="text-xs text-muted-foreground block">
                                  {tx("الاسم الكامل", "Full Name")}
                                </span>
                                <p className="font-medium text-foreground">{msg.full_name}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground block">
                                  {tx("البريد", "Email")}
                                </span>
                                <a href={`mailto:${msg.email}`} className="font-medium text-primary hover:underline">
                                  {msg.email}
                                </a>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground block">
                                  {tx("الهاتف", "Phone")}
                                </span>
                                <a href={`tel:${msg.phone}`} className="font-medium text-primary hover:underline">
                                  {msg.phone}
                                </a>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground block">
                                  {tx("الدولة", "Country")}
                                </span>
                                <p className="font-medium text-foreground">{msg.country}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground block">
                                  {tx("الموضوع", "Subject")}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${subjectColor}`}>
                                  {lang === "ar" ? subjectLabel.ar : subjectLabel.en}
                                </span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground block">
                                  {tx("تاريخ الإرسال", "Sent At")}
                                </span>
                                <p className="font-medium text-foreground">
                                  {format(new Date(msg.created_at), "dd/MM/yyyy HH:mm:ss")}
                                </p>
                              </div>
                            </div>

                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">
                                {tx("نص الرسالة الكاملة", "Full Message")}
                              </span>
                              <p className="text-sm text-foreground bg-muted rounded-xl p-4 whitespace-pre-wrap">
                                {msg.message}
                              </p>
                            </div>

                            {msg.replied_at && (
                              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
                                <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                                  <span className="text-lg">✅</span>
                                  <span>
                                    {tx("تم الرد على هذه الرسالة في", "Replied on")} {format(new Date(msg.replied_at), "dd/MM/yyyy HH:mm")}
                                  </span>
                                </p>
                              </div>
                            )}

                            <div className="flex gap-3">
                              <button
                                onClick={() => openReplyDialog(msg)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
                              >
                                <Send className="w-4 h-4" />
                                {tx("رد مباشر من الموقع", "Reply from Website")}
                              </button>
                              
                              <a
                                href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition"
                              >
                                <Mail className="w-4 h-4" />
                                {tx("رد عبر البريد الخارجي", "Reply via External Email")}
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              {tx("رد على الرسالة", "Reply to Message")}
            </DialogTitle>
          </DialogHeader>

          {replyingTo && (
            <div className="space-y-4">
              {/* Original Message Info */}
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-foreground">{tx("من:", "From:")}</span>
                  <span className="text-muted-foreground">{replyingTo.full_name}</span>
                  <span className="text-muted-foreground">({replyingTo.email})</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-foreground">{tx("الموضوع:", "Subject:")}</span>
                  <span className="text-muted-foreground ml-2">
                    {lang === "ar" 
                      ? SUBJECT_LABELS[replyingTo.subject]?.ar 
                      : SUBJECT_LABELS[replyingTo.subject]?.en}
                  </span>
                </div>
              </div>

              {/* Original Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {tx("الرسالة الأصلية:", "Original Message:")}
                </label>
                <div className="bg-muted/50 rounded-xl p-4 border-l-4 border-border">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {replyingTo.message}
                  </p>
                </div>
              </div>

              {/* Reply Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {tx("ردك:", "Your Reply:")} *
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={tx(
                    "اكتب ردك هنا... سيتم إرساله مباشرة إلى بريد العميل",
                    "Write your reply here... It will be sent directly to the customer's email"
                  )}
                  className="w-full min-h-[200px] bg-muted rounded-xl px-4 py-3 text-sm outline-none text-foreground focus:ring-2 focus:ring-primary/30 transition resize-y"
                  dir="auto"
                />
                <p className="text-xs text-muted-foreground">
                  {tx(
                    "💡 سيتم إرسال الرد مباشرة إلى بريد العميل مع نسخة من رسالته الأصلية",
                    "💡 The reply will be sent directly to the customer's email with a copy of their original message"
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setReplyDialogOpen(false)}
                  disabled={sendingReply}
                >
                  {tx("إلغاء", "Cancel")}
                </Button>
                <Button
                  onClick={sendReply}
                  disabled={sendingReply || !replyMessage.trim()}
                  className="gradient-cta"
                >
                  {sendingReply ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {tx("جاري الإرسال...", "Sending...")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {tx("إرسال الرد", "Send Reply")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
