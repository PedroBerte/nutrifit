export interface HealthStatus {
  status: "ok";
  service: string;
  timestamp: string;
}

export function getHealthStatus(service = "nutrifit-backend-node"): HealthStatus {
  return {
    status: "ok",
    service,
    timestamp: new Date().toISOString(),
  };
}
