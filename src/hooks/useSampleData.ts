import { useEffect, useState } from 'react';
import { sampleService } from '../services/sampleService';
import { Sample } from '../types';

export const useSampleData = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sampleService.getSamples()
      .then((res) => setSamples(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { samples, loading, error };
};