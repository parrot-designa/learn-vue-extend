import config from "../config";
import { initExtend } from "./extend";
import { ASSET_TYPES } from "@/my-vue2/shared/constants";
import builtInComponents from "../components/index";
import { extend } from "../util";

export function initGlobalAPI(Vue){
    const configDef = {};
    configDef.get = () => config;

    if (__DEV__) {
        configDef.set = () => {
          warn(
            '不要替换Vue.配置对象，而是设置单独的字段'
          )
        }
    }

    Object.defineProperty(Vue,'config',configDef);

    Vue.options = Object.create(null)
    ASSET_TYPES.forEach(type => {
      Vue.options[type + 's'] = Object.create(null)
    });
    Vue.options._base = Vue; 
    extend(Vue.options.components, builtInComponents)

    initExtend(Vue)
}