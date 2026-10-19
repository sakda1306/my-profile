// Suspense boundary below the panel layout: every page reads the session (requireAdmin),
// so client navigations between panel pages need their own fallback (cacheComponents).
export default function PanelLoading() {
  return <p>กำลังโหลด...</p>;
}
