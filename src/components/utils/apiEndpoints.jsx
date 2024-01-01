
const baseUrl = "http://localhost:8000";

export const BLOCK_MODEL = (pipeline_type, block_type) => `${baseUrl}/block/model?pipeline_type=${pipeline_type}&block_type=${block_type}`;
export const BLOCK_MODEL_TRANSFORMERS = (pipeline_type, block_type, type) => `${baseUrl}/block/model?pipeline_type=${pipeline_type}&block_type=${block_type}&transformer_type=${type}`;
export const DELETE_PIPELINE = (name) => `${baseUrl}/pipeline/delete?name=${name}`;

export const CREATE_PIPELINE = (name, type) => `${baseUrl}/pipeline/create?name=${name}&ptype=${type}`;
export const PIPELINES = (contains) => `${baseUrl}/pipelines/specific?contains=${contains}`;

export const MODIFY_DESCRIPTION = `${baseUrl}/pipeline/description`;

export const PIPELINE_DESCRIPTION = (name) => `${baseUrl}/pipeline/description?name=${name}`;

export const PIPELINE_RUN_DATA = (pipeline_name) => `${baseUrl}/pipeline/triggers?name=${pipeline_name}`;

export const CREATE_BLOCK =  `${baseUrl}/block/create`;

export const READ_PIPELINE = (name) => `${baseUrl}/pipeline/read?pipeline_name=${name}`;
export const RUN_PIPELINE = `${baseUrl}/pipeline/run`;
export const BLOCK_STATUS = (pipeline_id, block_name) => `${baseUrl}/pipeline/status_once?pipeline_id=${pipeline_id}&block_name=${block_name}`;
export const CREATE_PIPELINE_TRIGGER = `${baseUrl}/pipeline/create/trigger`;

export const CHANGE_PIPELINE_STATUS = `${baseUrl}/pipeline/trigger/status`;

export const PIPELINE_STATUS = (name) => `${baseUrl}/pipeline/status?name=${name}`;

export const PIPELINE_TRIGGER_STATUS = (name) => `${baseUrl}/pipeline/trigger/status?name=${name}`;

export const PIPELINE_VARIABLES = `${baseUrl}/pipeline/variables`;

export const UPLOAD_TEMP_FILE = "http://62.72.21.79:10000/upload";