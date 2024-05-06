import { Schema } from "prosemirror-model";
import { marks } from "./marks"
import { nodes } from "./nodes"

export const schema = new Schema({ nodes, marks })