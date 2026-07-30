import LeafLogo from '@/components/brand/LeafLogo';

/**
 * Footer with the academy name. Parents opening the app from a teacher's link
 * need to see the academy name at the bottom of every page.
 *
 * No phone/address yet — pass `contact` when real data is available.
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
          Grow Beyond
        </p>
        {contact && <p className="text-xs font-semibold text-gl-muted">{contact}</p>}
        <p className="text-xs text-gl-muted">
          © {new Date().getFullYear()} GreenLeaf English Academy
        </p>
      </div>
    </footer>
  );
}
