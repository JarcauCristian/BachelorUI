
const baseUrl = "http://localhost:8000";
const neo4jUrl = "http://localhost:7000";
const modelsUrl = "http://localhost:6060";
const notebooksUrl = "http://main-api-service:49152";

export const BLOCK_MODEL = (block_name) => `${baseUrl}/block/model?block_name=${block_name}`;
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

export const GET_ALL_NODES = `${neo4jUrl}/all`;

export const GET_ALL_DATASETS = (user) => `${neo4jUrl}/datasets?user=${user}`;

export const GET_DATASET_NEO = (name) => `${neo4jUrl}/dataset?name=${name}`;

export const GET_TEMPLATES = (pipeline_type) => `${baseUrl}/pipeline/templates?pipeline_type=${pipeline_type}`;

export const BATCH_STATUS = (id) => `${baseUrl}/pipeline/batch_status?pipeline_id=${id}`;

export const DELETE_FILES = (path, temporary) => `http://62.72.21.79:10000/delete_path?path=${path}&temp=${temporary}`

export const CREATE_NOTEBOOK = `${notebooksUrl}/create_notebook_instance`;

export const GET_DATASET = (path) => `http://62.72.21.79:10000/get/object?path=${path}`

export const GET_MODELS_USER = (user_id) => `${modelsUrl}/model/user?user_id${user_id}`;

export const GET_MODELS= `${modelsUrl}/model/all`;

export const GET_MODEL_DETAILS = (model_id) => `${modelsUrl}/model_details?model_id=${model_id}`;

export const GET_MODEL = (model_id) => `${modelsUrl}/model?model_id=${model_id}`;