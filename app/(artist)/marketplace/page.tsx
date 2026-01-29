import Button from '../../../components/ui/Button';
import { createCheckout } from '../../../lib/api';

export default function Marketplace() {
  async function onBuy() {
    const res = await createCheckout({ quantity: 1 });
    if (res?.url) window.location.href = res.url;
    else alert('Checkout failed');
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold">Artist Marketplace</h2>
      <p className="mt-2 text-sm text-gray-300">Browse producers, buy credits, and generate tracks.</p>
      <div className="mt-6">
        <Button onClick={() => onBuy()}>Buy Credits</Button>
      </div>
    </div>
  );
}

