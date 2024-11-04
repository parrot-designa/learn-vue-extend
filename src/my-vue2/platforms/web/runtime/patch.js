import * as nodeOps from "./node-ops";
import { createPatchFunction } from "@/my-vue2/core/vdom/patch";
import platformModules from "@/my-vue2/platforms/web/runtime/modules/index";

const modules = platformModules;

export const patch = createPatchFunction({ nodeOps, modules })