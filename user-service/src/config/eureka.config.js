const axios = require('axios');
const logger = require('../utils/logger');

class EurekaClient {
  constructor() {
    this.eurekaUrl = process.env.EUREKA_URL || 'http://localhost:8761/eureka';
    this.appName = (process.env.APP_NAME || 'USER-SERVICE').toUpperCase();
    this.port = process.env.PORT || 3000;
    this.hostName = process.env.HOSTNAME || 'localhost';
    this.ipAddr = process.env.IP_ADDRESS || '127.0.0.1';
    this.instanceId = `${this.hostName}:${this.appName}:${this.port}`;
    
    this.heartbeatInterval = 30000; // 30 seconds
    this.renewalInterval = null;
  }

  /**
   * Register the service with Eureka
   */
  async register() {
    const instance = {
      instance: {
        instanceId: this.instanceId,
        hostName: this.hostName,
        app: this.appName,
        ipAddr: this.ipAddr,
        status: 'UP',
        overriddenStatus: 'UNKNOWN',
        port: {
          '$': this.port,
          '@enabled': true
        },
        securePort: {
          '$': 443,
          '@enabled': false
        },
        countryId: 1,
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          name: 'MyOwn'
        },
        leaseInfo: {
          renewalIntervalInSecs: 30,
          durationInSecs: 90,
          registrationTimestamp: Date.now(),
          lastRenewalTimestamp: Date.now(),
          evictionTimestamp: 0,
          serviceUpTimestamp: Date.now()
        },
        metadata: {
          'management.port': this.port,
          'service-type': 'nodejs-express'
        },
        homePageUrl: `http://${this.hostName}:${this.port}/`,
        statusPageUrl: `http://${this.hostName}:${this.port}/api/health`,
        healthCheckUrl: `http://${this.hostName}:${this.port}/api/health`,
        vipAddress: this.appName,
        secureVipAddress: this.appName,
        isCoordinatingDiscoveryServer: false,
        lastUpdatedTimestamp: Date.now(),
        lastDirtyTimestamp: Date.now(),
        actionType: 'ADDED'
      }
    };

    try {
      const response = await axios.post(
        `${this.eurekaUrl}/apps/${this.appName}`,
        instance,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 204) {
        logger.info(`✅ Successfully registered with Eureka: ${this.instanceId}`);
        this.startHeartbeat();
        return true;
      }
    } catch (error) {
      logger.error(`❌ Failed to register with Eureka: ${error.message}`);
      // Retry registration after 10 seconds
      setTimeout(() => this.register(), 10000);
    }
    return false;
  }

  /**
   * Send heartbeat to Eureka
   */
  async sendHeartbeat() {
    try {
      const response = await axios.put(
        `${this.eurekaUrl}/apps/${this.appName}/${this.instanceId}`,
        null,
        {
          params: {
            status: 'UP',
            lastDirtyTimestamp: Date.now()
          }
        }
      );

      if (response.status === 200) {
        logger.debug(`💓 Heartbeat sent to Eureka`);
      }
    } catch (error) {
      logger.error(`❌ Failed to send heartbeat to Eureka: ${error.message}`);
      // Try to re-register if heartbeat fails
      if (error.response && error.response.status === 404) {
        logger.warn('⚠️ Instance not found in Eureka, attempting re-registration...');
        this.stopHeartbeat();
        await this.register();
      }
    }
  }

  /**
   * Start sending periodic heartbeats
   */
  startHeartbeat() {
    if (this.renewalInterval) {
      clearInterval(this.renewalInterval);
    }

    this.renewalInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatInterval);

    logger.info('💓 Started heartbeat to Eureka');
  }

  /**
   * Stop sending heartbeats
   */
  stopHeartbeat() {
    if (this.renewalInterval) {
      clearInterval(this.renewalInterval);
      this.renewalInterval = null;
      logger.info('💔 Stopped heartbeat to Eureka');
    }
  }

  /**
   * Deregister from Eureka
   */
  async deregister() {
    try {
      this.stopHeartbeat();

      const response = await axios.delete(
        `${this.eurekaUrl}/apps/${this.appName}/${this.instanceId}`
      );

      if (response.status === 200) {
        logger.info(`✅ Successfully deregistered from Eureka: ${this.instanceId}`);
        return true;
      }
    } catch (error) {
      logger.error(`❌ Failed to deregister from Eureka: ${error.message}`);
    }
    return false;
  }

  /**
   * Update instance status
   */
  async updateStatus(status) {
    try {
      const response = await axios.put(
        `${this.eurekaUrl}/apps/${this.appName}/${this.instanceId}/status`,
        null,
        {
          params: {
            value: status
          }
        }
      );

      if (response.status === 200) {
        logger.info(`✅ Updated status to: ${status}`);
        return true;
      }
    } catch (error) {
      logger.error(`❌ Failed to update status: ${error.message}`);
    }
    return false;
  }

  /**
   * Fetch service instances from Eureka
   */
  async fetchInstances(serviceName) {
    try {
      const response = await axios.get(
        `${this.eurekaUrl}/apps/${serviceName.toUpperCase()}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (response.status === 200 && response.data.application) {
        return response.data.application.instance;
      }
    } catch (error) {
      logger.error(`❌ Failed to fetch instances for ${serviceName}: ${error.message}`);
    }
    return [];
  }
}

// Singleton instance
let eurekaClient = null;

/**
 * Initialize and register with Eureka
 */
async function initEureka() {
  if (!eurekaClient) {
    eurekaClient = new EurekaClient();
    await eurekaClient.register();
  }
  return eurekaClient;
}

/**
 * Get Eureka client instance
 */
function getEurekaClient() {
  return eurekaClient;
}

/**
 * Graceful shutdown handler
 */
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    logger.info(`\n${signal} received, starting graceful shutdown...`);
    
    if (eurekaClient) {
      await eurekaClient.deregister();
    }

    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = {
  initEureka,
  getEurekaClient,
  setupGracefulShutdown
};
