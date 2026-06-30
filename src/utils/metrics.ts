import { MetricDefinition, SessionMetricValue, AppState } from "../types";

/**
 * Gets all evaluated metrics for a specific session
 */
export const getMetricsForSession = (
  sessionId: string,
  appState: AppState
): { definition: MetricDefinition; value: number }[] => {
  const sessionValues = appState.sessionMetrics.filter(
    (sm) => sm.sessionId === sessionId
  );

  return sessionValues
    .map((sm) => {
      const definition = appState.metrics.find((m) => m.id === sm.metricId);
      if (!definition) return null;
      return {
        definition,
        value: sm.value,
      };
    })
    .filter((m): m is { definition: MetricDefinition; value: number } => m !== null);
};

/**
 * Calculates the average value for a specific metric across a set of sessions
 */
export const getAverageMetric = (
  metricId: string,
  sessionIds: string[],
  appState: AppState
): number | null => {
  const relevantValues = appState.sessionMetrics.filter(
    (sm) => sm.metricId === metricId && sessionIds.includes(sm.sessionId)
  );

  if (relevantValues.length === 0) return null;

  const sum = relevantValues.reduce((acc, curr) => acc + curr.value, 0);
  return sum / relevantValues.length;
};

/**
 * Groups sessions by a specific target (e.g. 'student' or 'group') to figure out which metrics apply
 */
export const getApplicableMetricsForTarget = (
  target: MetricDefinition["target"],
  appState: AppState
): MetricDefinition[] => {
  return appState.metrics.filter(
    (m) => m.target === target || m.target === "all"
  );
};