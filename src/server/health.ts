import { cpuUsage } from "process";
import { cpus, freemem, totalmem, hostname, loadavg } from "os";

const CPU_HISTORY_HOURS = 24;
const cpuHistory: Array<{ timestamp: string; usage: string }> = [];

function formatBytes(bytes: number) {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function updateCpuHistory() {
  const startUsage = cpuUsage();

  setTimeout(() => {
    const endUsage = cpuUsage(startUsage);
    const totalUsage = endUsage.user + endUsage.system;
    const usagePercent = (totalUsage / 1000000 / 3600).toFixed(1);

    cpuHistory.push({
      timestamp: new Date().toISOString(),
      usage: `${usagePercent}%`,
    });

    if (cpuHistory.length > CPU_HISTORY_HOURS) {
      cpuHistory.shift();
    }
  }, 1000);
}

export function startHealthMonitoring() {
  setInterval(updateCpuHistory, 3600000);
  updateCpuHistory();
}

export function getHealthStatus() {
  const memoryTotal = totalmem();
  const memoryFree = freemem();
  const memoryUsed = memoryTotal - memoryFree;
  const memoryUsagePercent = ((memoryUsed / memoryTotal) * 100).toFixed(1);

  const [oneMin, fiveMin, fifteenMin] = loadavg();
  const cpuCount = cpus().length;

  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    server: {
      hostname: hostname(),
      uptime: formatUptime(process.uptime()),
    },
    memory: {
      total: formatBytes(memoryTotal),
      used: formatBytes(memoryUsed),
      free: formatBytes(memoryFree),
      usage: `${memoryUsagePercent}%`,
      status: Number(memoryUsagePercent) > 90 ? "WARNING" : "OK",
    },
    cpu: {
      cores: cpuCount,
      load: {
        "1min": ((oneMin / cpuCount) * 100).toFixed(1) + "%",
        "5min": ((fiveMin / cpuCount) * 100).toFixed(1) + "%",
        "15min": ((fifteenMin / cpuCount) * 100).toFixed(1) + "%",
      },
      history: cpuHistory,
      status: oneMin / cpuCount > 0.8 ? "WARNING" : "OK",
    },
  };

  const statusCode = health.memory.status === "WARNING" || health.cpu.status === "WARNING" ? 207 : 200;

  return { health, statusCode };
}
