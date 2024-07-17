import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

const CONFIG_MAP = {test:{test:'test'}};

export default class DsfrConfigUtl extends LightningElement {

    //----------------------------------------------------------------
    // Configuration fields
    //----------------------------------------------------------------
    @api isMain = false;    // Component display activation in Site Builder
    @api isDebug = false;   // Debug logs activation

    //----------------------------------------------------------------
    // Technical internal fields
    //----------------------------------------------------------------
    isSiteBuilder = false;

    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------
    get showUtil() {
        return this.isMain && this.isSiteBuilder;
    }

    //----------------------------------------------------------------
    // Context Initialization
    //----------------------------------------------------------------

    @wire(CurrentPageReference)
    wiredPage(data){
        if (this.isDebug) console.log('wiredPage: START config');
        if (this.isDebug) console.log('wiredPage: with page ',JSON.stringify(data));

        let app = data && data.state && data.state.app;
        if (this.isDebug) console.log('wiredPage: app extracted ',app);
        this.isSiteBuilder = (app === 'commeditor');

        if (this.isDebug) console.log('wiredPage: END config',this.isSiteBuilder);
    };

    //----------------------------------------------------------------
    // Component Initialization
    //----------------------------------------------------------------

    connectedCallback() {
        if (this.isDebug) console.log('connected: START for Config Mgr in state ', JSON.stringify(CONFIG_MAP));
        if (this.isDebug) console.log('connected: END for Config Mgr');
    }

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START for Config Mgr in state ', JSON.stringify(CONFIG_MAP));
        if (this.isDebug) console.log('disconnected: END for Config Mgr');
    }

    //----------------------------------------------------------------
    // Interface actions
    //----------------------------------------------------------------

    @api getMap(type) {
        if (this.isDebug) console.log('getMap: START for type ', type);
        if (this.isDebug) console.log('getMap: END returning ', JSON.stringify(CONFIG_MAP[type]));
        return CONFIG_MAP[type];
    }

    @api getConfig(type,name) {
        if (this.isDebug) console.log('getConfig: START for config ', name);
        if (this.isDebug) console.log('getConfig: of type ', type);
        let typeMap = CONFIG_MAP[type];
        if (typeMap) {
            if (typeMap[name]) {
                if (this.isDebug) console.log('getConfig: END / returning config found ',JSON.stringify(typeMap[name]));
                return typeMap[name];
            }
            else {
                if (this.isDebug) console.log('getConfig: END / no config with this name set');
                return;
            }
        }
        else {
            if (this.isDebug) console.log('getConfig: END / no config of this type set');
            return null;
        }
    }

    @api setConfig(type,name,value) {
        if (this.isDebug) console.log('setConfig: for config ', name);
        if (this.isDebug) console.log('setConfig: of type ', type);
        if (!CONFIG_MAP[type]) { CONFIG_MAP[type] = {};}
        CONFIG_MAP[type][name] = value;
        if (this.isDebug) console.log('setConfig: END with value ', JSON.stringify(value));
    }

}