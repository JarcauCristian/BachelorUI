
const baseUrl = "http://localhost:7000"

export const BLOCK_MODEL = (pipeline_type, block_type) => `${baseUrl}/block/model?pipeline_type=${pipeline_type}&block_type=${block_type}`
export const DELETE_PIPELINE = (name) => `${baseUrl}/pipeline/delete?name=${name}`

export const CREATE_PIPELINE = (name, type) => `${baseUrl}/pipeline/create?name=${name}&ptype=${type}`
export const PIPELINES = (contains) => `${baseUrl}/pipelines/specific?contains=${contains}`

export const MODIFY_DESCRIPTION = `${baseUrl}/pipeline/add_tags`;

export const PIPELINE_DESCRIPTION = (name) => `${baseUrl}/pipeline/description?name=${name}`

export const CREATE_BLOCK =  "http://localhost:7000/block/create";