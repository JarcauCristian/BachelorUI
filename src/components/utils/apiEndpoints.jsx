
const baseUrl = "https://ingress.sedimark.work/mage";
const neo4jUrl = "https://ingress.sedimark.work/neo4j";
const modelsUrl = "https://ingress.sedimark.work/models";
const notebooksUrl = "https://ingress.sedimark.work/notebook_manager";
const balancerUrl = "https://ingress.sedimark.work/balancer";

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

export const PIPELINE_SECRET = `${baseUrl}/pipeline/secret`;

export const UPLOAD_TEMP_FILE = `${balancerUrl}/upload`;

export const GET_ALL_NODES = `${neo4jUrl}/all`;

export const UPDATE_DATASET = `${neo4jUrl}/dataset/update`;

export const GET_ALL_DATASETS = (user) => `${neo4jUrl}/datasets?user=${user}`;

export const GET_DATASET_NEO = (name) => `${neo4jUrl}/dataset?name=${name}`;

export const GET_TEMPLATES = (pipeline_type) => `${baseUrl}/pipeline/templates?pipeline_type=${pipeline_type}`;

export const BATCH_STATUS = (id) => `${baseUrl}/pipeline/batch_status?pipeline_id=${id}`;

export const DELETE_FILES = (path, temporary) => `${balancerUrl}/delete_path?path=${path}&temp=${temporary}`

export const CREATE_NOTEBOOK = `${notebooksUrl}/create_notebook_instance`;

export const UPDATE_ACCESS = (uid) => `${notebooksUrl}/update_access?uid=${uid}`;

export const DELETE_NOTEBOOK = (uid) => `${notebooksUrl}/delete_notebook?uid=${uid}`;

export const USER_NOTEBOOKS_DETAILS = (user_id) => `${notebooksUrl}/get_notebook_details?user_id=${user_id}`;

export const GET_DATASET = (path) => `${balancerUrl}/get/object?path=${path}`

export const GET_MODELS_USER = (user_id) => `${modelsUrl}/model/user?user_id=${user_id}`;

export const GET_MODELS = `${modelsUrl}/model/all`;

export const GET_MODEL_DETAILS = (model_id) => `${modelsUrl}/model_details?model_id=${model_id}`;

export const GET_MODEL = (model_id) => `${modelsUrl}/model?model_id=${model_id}`;

export const UPDATE_MODEL_SCORE = `${modelsUrl}/update_score`;

export const PREDICTION = (model_id) => `${modelsUrl}/prediction?model_id=${model_id}`;