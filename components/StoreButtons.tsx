function AppleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.4 12.7c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9s-1.9-.9-3.1-.8c-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.8.8 3.1.8c1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7 0 0-2.5-1-2.5-4zM14 5.6c.6-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.6 2.8-1.4z" />
    </svg>
  );
}
function PlayMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4.5 2.6c-.3.3-.5.8-.5 1.4v16c0 .6.2 1.1.5 1.4l.1.1L13.6 12v-.2L4.6 2.5l-.1.1zm12.1 6.4-3-3L4.6 2.5 16.6 9zm0 6L4.6 21.5l9-9.3 3 2.8zm3.4-2.9-2.6-1.5-3.2 3.2 3.2 3.2 2.6-1.5c.7-.4 1-.9 1-1.7s-.3-1.3-1-1.7z" />
    </svg>
  );
}

/** Store buttons stay disabled until the apps are live. */
export function StoreButtons({ dark = false }: { dark?: boolean }) {
  const base =
    'inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-[14px] font-semibold cursor-not-allowed select-none';
  const tone = dark ? 'bg-white/10 text-white/80 ring-1 ring-white/20' : 'bg-ink/[0.06] text-ink/60 ring-1 ring-ink/10';
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span aria-disabled className={`${base} ${tone}`}>
        <AppleMark /> App Store <span className="text-[11px] font-medium opacity-70">coming soon</span>
      </span>
      <span aria-disabled className={`${base} ${tone}`}>
        <PlayMark /> Google Play <span className="text-[11px] font-medium opacity-70">coming soon</span>
      </span>
    </div>
  );
}
