import Header from '../../components/Header';
import AboutContent from '../../components/AboutContent.client';

export default function About() {
  return (
    <div
      className="min-h-screen text-gray-200"
      style={{ backgroundColor: '#0a0a0f' }}
    >
      <Header />
      <AboutContent />
    </div>
  );
}
