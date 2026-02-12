import { useState, useEffect } from 'react';
import type { ConfidenceScoreResponse } from '../types/confidence';
import { getMockConfidenceScore } from '../services/mockConfidenceService';

interface UseConfidenceScoreResult {
  score: ConfidenceScoreResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage confidence scores for destinations
 */
export function useConfidenceScore(
  destinationId: string | null,
  userId?: string
): UseConfidenceScoreResult {
  const [score, setScore] = useState<ConfidenceScoreResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchScore = async () => {
    if (!destinationId) {
      setScore(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getMockConfidenceScore(destinationId, userId);
      setScore(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching confidence score:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch confidence score'));
      setScore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, [destinationId, userId]);

  return {
    score,
    loading,
    error,
    refetch: fetchScore,
  };
}
