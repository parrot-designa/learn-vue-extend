import config from "../config";
import { initExtend } from "./extend";

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

    Vue.options._base = Vue; 

    initExtend(Vue)
}