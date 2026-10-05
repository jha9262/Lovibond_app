export const validateStaticAndGatewayIP = (staticIp: string, gatewayIp: string) => {
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  if (!ipRegex.test(staticIp)) {
    return { valid: false, message: 'Invalid Static IP format' };
  }
  
  if (!ipRegex.test(gatewayIp)) {
    return { valid: false, message: 'Invalid Gateway IP format' };
  }

  return { valid: true };
};