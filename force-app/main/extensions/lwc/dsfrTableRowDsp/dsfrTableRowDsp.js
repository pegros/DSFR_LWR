import { LightningElement, api } from 'lwc';

export default class DsfrTableRowDsp extends LightningElement {

    @api fields;
    @api value;
    @api isDebug;

    connectedCallback() {
        if (this.isDebug){
            console.log('connected TR with fields:',JSON.stringify(this.fields));
            console.log('connected TR with value:',JSON.stringify(this.value));
        }
    }

    handleAction(event) {
        if (this.isDebug) console.log('handleAction START on ROW with event',event)
        if (this.isDebug) console.log('handleAction on row',JSON.stringify(this.value));
        const actionEvent = new CustomEvent('action', { detail: {
            action : event.detail?.action,
            row: this.value
        }});
        if (this.isDebug) console.log('handleAction actionEvent prepared ',JSON.stringify(actionEvent));
        this.dispatchEvent(actionEvent);
        if (this.isDebug) console.log('handleAction END on ROW with event',event)
    }
}