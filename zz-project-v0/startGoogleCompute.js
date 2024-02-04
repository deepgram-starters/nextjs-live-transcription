const compute = require("@google-cloud/compute");

const projectId = "brysis-consulting";
const zone = "us-central1-a";
const instanceName = "instance-1"; // replace with your instance name
const PORT = 5000;
const RUNNING = "RUNNING";

const computeClient = new compute.InstancesClient();

async function getInstanceDetails() {
  const [instance] = await computeClient.get({
    project: projectId,
    zone,
    instance: instanceName,
  });
  return instance;
}

async function getExternalIP(instance) {
  const networkInterface = instance.networkInterfaces[0];
  const accessConfig = networkInterface.accessConfigs[0];
  return accessConfig && accessConfig.natIP;
}

async function startInstance(sendStatusUpdate) {
  let externalIp;

  try {
    let instance = await getInstanceDetails();

    if (instance.status === RUNNING) {
      //sendStatusUpdate(`The instance ${instanceName} is already running.`);
      externalIp = await getExternalIP(instance);
    } else {
      const [operation] = await computeClient.start({
        project: projectId,
        zone,
        instance: instanceName,
      });
      sendStatusUpdate(`Starting Google Compute VM...`);
      //sendStatusUpdate(`Starting the instance ${instanceName}...`);

      do {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        instance = await getInstanceDetails();
        externalIp = await getExternalIP(instance);
      } while (instance.status !== RUNNING || !externalIp);

      sendStatusUpdate(`Google Compute VM is now running...`);
    }

    //sendStatusUpdate(`The external IP of the instance ${instanceName} is: ${externalIp}`);
    //sendStatusUpdate(`You can check it out at: http://${externalIp}:${PORT}`);

    return externalIp;
  } catch (error) {
    console.error(`An error occurred while starting the instance: ${error}`);
  }
}

module.exports.startInstance = startInstance;
