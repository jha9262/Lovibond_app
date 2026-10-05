import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { getSlaveConfig, updateSlaveConfig } from "../../services/deviceService";
import { Device, ConfigDetail } from "../../types";

function getFormattedDate() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

function getFormattedTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export const fetchDevices = createAsyncThunk(
  "devices/fetchDevices",
  async () => {
    const response = await getSlaveConfig();
    const savedDevices = response?.SLAVE_CONFIGURATION?.SLAVE_DEVICES || {};
    const folderName = response?.SLAVE_CONFIGURATION?.SLAVE_MAIN_FOLDER_NAME || "";

    const devicesArray: Device[] = Object.values(savedDevices).map((slave: any) => ({
      slaveId: slave.SLAVE_ID || "",
      name: slave.SLAVE_NAME || "",
      make: slave.MAKE || "",
      model: slave.MODEL || "",
      controllerPin: slave.CONTROLLER_PIN || "",
      configDetails: slave.CHANNELS ? convertChannelsToConfigDetails(slave.CHANNELS) : [],
    }));

    return { devices: devicesArray, folderName };
  }
);

function convertChannelsToConfigDetails(channels: any): ConfigDetail[] {
  if (!channels) return [];
  return Object.entries(channels).map(([key, channel]: [string, any], index) => {
    return {
      serialNo: index + 1,
      parameterName: channel.CHANNEL_NAME || "",
      addressType: channel.CHANNEL_ADDRESS?.toString().startsWith('0x') ? "Hex" : "Decimal",
      address: channel.CHANNEL_ADDRESS || "",
      dataType: convertDataTypeToUi(channel.CHANNEL_REGISTER_TYPE),
      unit: channel.CHANNEL_UNIT || "",
      registerFunction: convertRegisterFunctionToUi(channel.CHANNEL_REGISTER_FUNCTION),
      scalingDecimal: convertScalingDecimalToUi(channel.CHANNEL_SCALING_DECIMAL)
    };
  });
}

function convertScalingDecimalToUi(decimalValue: number) {
  const scaleMap: Record<number, string> = { 0: "no decimal", 1: "1 decimal", 2: "2 decimal", 3: "3 decimal" };
  return scaleMap[decimalValue] || "no decimal";
}

function convertScalingDecimalToApi(uiValue: string) {
  const scaleMap: Record<string, number> = { "no decimal": 0, "1 decimal": 1, "2 decimal": 2, "3 decimal": 3, "4 decimal": 4 };
  return scaleMap[uiValue] !== undefined ? scaleMap[uiValue] : 0;
}

function convertDataTypeToUi(dataTypeCode: number) {
  const dataTypeMap: Record<number, string> = {
    1: "1-byte(8-BIT)", 2: "HEX(LITTLE ENDIAN)", 3: "HEX(BIG ENDIAN)", 4: "FLOAT(LITTLE ENDIAN)",
    5: "FLOAT(BIG ENDIAN)", 6: "FLOAT(LITTLE SWAP ENDIAN)", 7: "FLOAT(BIG SWAP ENDIAN)",
    8: "4-byte(LITTLE ENDIAN)", 9: "4-byte(BIG ENDIAN)", 10: "4-byte(LITTLE SWAP ENDIAN)", 11: "4-byte(BIG SWAP ENDIAN)"
  };
  return dataTypeMap[dataTypeCode] || "";
}

function convertRegisterFunctionToUi(functionCode: number) {
  const functionMap: Record<number, string> = {
    1: "0x01 Read Coils", 2: "0x02 Read Discrete Inputs", 3: "0x03 Read Holding Registers", 4: "0x04 Read Input Register"
  };
  return functionMap[functionCode] || "";
}

function convertDataTypeToCode(dataType: string) {
  const dataTypeMap: Record<string, number> = {
    "1-byte(8-BIT)": 1, "HEX(LITTLE ENDIAN)": 2, "HEX(BIG ENDIAN)": 3, "FLOAT(LITTLE ENDIAN)": 4,
    "FLOAT(BIG ENDIAN)": 5, "FLOAT(LITTLE SWAP ENDIAN)": 6, "FLOAT(BIG SWAP ENDIAN)": 7,
    "4-byte(LITTLE ENDIAN)": 8, "4-byte(BIG ENDIAN)": 9, "4-byte(LITTLE SWAP ENDIAN)": 10, "4-byte(BIG SWAP ENDIAN)": 11
  };
  return dataTypeMap[dataType] || 2;
}

function convertRegisterFunctionToCode(registerFunction: string) {
  if (registerFunction.includes("0x01")) return 1;
  if (registerFunction.includes("0x02")) return 2;
  if (registerFunction.includes("0x03")) return 3;
  if (registerFunction.includes("0x04")) return 4;
  return 4;
}

export const saveDevices = createAsyncThunk(
  "devices/saveDevices",
  async ({ devices, folderName }: { devices: Device[]; folderName: string }) => {
    const currentDate = getFormattedDate();
    const currentTime = getFormattedTime();

    const formattedData: any = {
      SLAVE_CONFIGURATION: {
        SLAVE_MAIN_FOLDER_NAME: folderName,
        SLAVE_COUNT: devices.length,
        SLAVE_DEVICES: {}
      }
    };

    devices.forEach((device, index) => {
      const slaveKey = `SLAVE_${index + 1}`;
      formattedData.SLAVE_CONFIGURATION.SLAVE_DEVICES[slaveKey] = {
        LOCAL_DATE: currentDate,
        LOCAL_TIME: currentTime,
        SLAVE_ID: typeof device.slaveId === 'string' ? parseInt(device.slaveId, 10) || 1 : device.slaveId,
        SLAVE_BATCH_ID: `BATCH_${String.fromCharCode(65 + index)}1`,
        SLAVE_NAME: device.name || `Device${index + 1}`,
        MAKE: device.make || "DEFAULT",
        MODEL: device.model || "DEFAULT",
        CONTROLLER_PIN: device.controllerPin || "",
        PROTOCOL: "MODBUS",
        STORAGE_COUNT: 100,
        STORAGE_RATE: 10
      };

      if (device.make === "OTHERS" && device.model === "OTHERS" && device.configDetails && device.configDetails.length > 0) {
        formattedData.SLAVE_CONFIGURATION.SLAVE_DEVICES[slaveKey].CHANNEL_COUNT = device.configDetails.length;
        const channels: any = {};
        device.configDetails.forEach((config, configIndex) => {
          const channelKey = `CHANNEL_${configIndex + 1}`;
          channels[channelKey] = {
            CHANNEL_NAME: config.parameterName || `Parameter${configIndex + 1}`,
            CHANNEL_ADDRESS_TYPE: config.addressType === "Hex" ? 1 : 2,
            CHANNEL_ADDRESS: config.address || "40001",
            CHANNEL_REGISTER_TYPE: convertDataTypeToCode(config.dataType),
            CHANNEL_REGISTER_FUNCTION: convertRegisterFunctionToCode(config.registerFunction),
            CHANNEL_SCALING_DECIMAL: convertScalingDecimalToApi(config.scalingDecimal),
            CHANNEL_UNIT: config.unit || ""
          };
        });
        formattedData.SLAVE_CONFIGURATION.SLAVE_DEVICES[slaveKey].CHANNELS = channels;
      }
    });

    return await updateSlaveConfig(formattedData);
  }
);

interface DevicesState {
  devices: Device[];
  newFolder: string;
  loading: boolean;
  error: string | null;
}

const initialState: DevicesState = {
  devices: [],
  newFolder: "",
  loading: false,
  error: null,
};

const devicesSlice = createSlice({
  name: "devices",
  initialState,
  reducers: {
    addDevice: (state, action: PayloadAction<Device>) => {
      const newDevice = action.payload;
      const isDuplicate = state.devices.some(
        (device) => device.slaveId === newDevice.slaveId || device.name === newDevice.name
      );
      if (isDuplicate) {
        toast.error("DEVICE ALREADY EXISTS");
        return;
      }
      state.devices.push(newDevice);
      toast.success("DEVICE ADDED TO LIST");
    },
    setFolderName: (state, action: PayloadAction<string>) => {
      state.newFolder = action.payload;
    },
    deleteDevice: (state, action: PayloadAction<number>) => {
      state.devices.splice(action.payload, 1);
    },
    updateDevice: (state, action: PayloadAction<{ index: number; field: keyof Device; value: any }>) => {
      const { index, field, value } = action.payload;
      (state.devices[index] as any)[field] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload.devices;
        state.newFolder = action.payload.folderName;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed";
        toast.error("FAILED TO FETCH DEVICES");
      })
      .addCase(saveDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveDevices.fulfilled, (state) => {
        state.loading = false;
        toast.success("DEVICES CONFIGURED SUCCESSFULLY");
      })
      .addCase(saveDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed";
        toast.error("FAILED TO SAVE DEVICES");
      });
  },
});

export const { addDevice, deleteDevice, updateDevice, setFolderName } = devicesSlice.actions;
export default devicesSlice.reducer;