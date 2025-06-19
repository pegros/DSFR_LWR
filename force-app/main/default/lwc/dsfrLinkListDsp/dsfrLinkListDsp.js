import { LightningElement, api } from 'lwc';

export default class DsfrLinkListDsp extends LightningElement {
    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------

    @api
    get linkListStr() {
        return JSON.stringify(this.linkList);
    }
    set linkListStr(value) {
        if (this.isDebug) console.log('setting linkListStr: START with value ',value);
        if (value) {
            try {
                this.linkList = JSON.parse(value) || [];
                if (this.isDebug) console.log('setting linkListStr: value parsed ', JSON.stringify(this.linkList));
                this.linkList.forEach(item => {
                    if (item.url) {
                        if (this.isDebug) console.log('setting linkListStr: reworking item ', JSON.stringify(item));
                        item.targetType = item.target;
                        item.icon = item.icon || ((item.target === "_blank") ? "external-link-line" : "arrow-right-line");
                        item.iconPosition = item.iconPosition || "right";
                        item.target = {type: "standard__webPage", attributes:{url: item.url}};
                        delete item.url;
                    }
                });
                if (this.isDebug) console.log('setting linkListStr: END with parsed value', JSON.stringify(this.linkList));
            }
            catch (error) {
                console.warn('setting linkListStr: END KO / error raised ',JSON.stringify(error));
            }
        }
        else {
            if (this.isDebug) console.log('setting linkListStr: END / no value provided');
        }
    }

    @api linkList;      // Liste de de liens au format JSON (parsing de la version linkListStr ou fournie par composant parent)
    @api isDebug;


    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START linkList with ',JSON.stringify(this.linkList));
            console.log('connected: END linkList');
        }
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START linkList with ',JSON.stringify(this.linkList));
            console.log('rendered: END linkList');
        }
    }

}