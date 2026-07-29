import LeafLogo from '@/components/brand/LeafLogo';

/**
 * Chân trang gắn tên trung tâm. Phụ huynh mở app từ link giáo viên gửi, cuộn
 * hết trang mà không thấy tên trung tâm nào thì không biết mình đang dùng app
 * của ai — nên tên + tagline phải có mặt ở cuối mọi trang người lớn.
 *
 * Chưa có số điện thoại/địa chỉ vì chưa có dữ liệu thật; truyền `contact` vào
 * khi trung tâm cung cấp.
 */
export default function AppFooter({ contact }: { contact?: string }) {
  return (
    <footer className="mt-10 border-t border-gl-green/10 pt-6 pb-2">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <LeafLogo size="sm" />
          <span className="gl-display text-base font-extrabold leading-tight text-gl-green">
            GreenLeaf English Academy
          </span>
        </div>
        <p className="gl-display text-[11px] font-bold uppercase tracking-[0.18em] text-gl-muted">
          Learn today · Lead tomorrow
        </p>
        {contact && <p className="text-xs font-semibold text-gl-muted">{contact}</p>}
        <p className="text-xs text-gl-muted">
          © {new Date().getFullYear()} GreenLeaf English Academy
        </p>
      </div>
    </footer>
  );
}
