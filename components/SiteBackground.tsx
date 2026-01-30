/**
 * Full-site background image: fixed, behind all content.
 * Add your image as public/background.jpg (or .webp) for a modern look.
 * Overlay keeps text readable; adjust overlay opacity in globals or here if needed.
 */
export default function SiteBackground() {
  return (
    <div
      className="fixed inset-0 z-0"
      aria-hidden
    >
      {/* Background image: cover viewport, centered. Use background.jpg or background.webp in public/ */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/background.jpg)',
          backgroundColor: '#0a0a0f',
        }}
      />
      {/* Overlay so content stays readable; tweak opacity to taste */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(10,10,15,0.75) 0%, rgba(10,10,15,0.88) 50%, rgba(10,10,15,0.92) 100%)',
        }}
      />
    </div>
  );
}
