import Button from '../../../components/ui/Button';
import { triggerTrain } from '../../../lib/api';

export default function ProducerDashboard() {
  async function onTrain() {
    // placeholder call - in production, collect upload URLs first
    const res = await triggerTrain({ producerId: 'local-producer', uploadUrls: [] });
    console.log('train response', res);
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold">Producer Dashboard</h2>
      <p className="mt-2 text-sm text-gray-300">Upload your audio, monitor LoRA training, and view earnings.</p>
      <div className="mt-6">
        <Button onClick={() => alert('Upload flow not implemented')}>Upload Beats</Button>
        <Button className="ml-3" onClick={() => onTrain()}>Train LoRA</Button>
      </div>
    </div>
  );
}

