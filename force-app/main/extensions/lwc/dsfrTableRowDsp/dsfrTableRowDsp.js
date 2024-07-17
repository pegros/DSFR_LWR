import { LightningElement, api } from 'lwc';

export default class DsfrTableRowDsp extends LightningElement {

    @api fields;
    @api value;

    connectedCallback() {
        console.log('connected TR with fields:',JSON.stringify(this.fields));
        console.log('connected TR with value:',JSON.stringify(this.value));
    }

    handleAction(event) {
        console.log('handleAction START on ROW with event',event)
        console.log('handleAction on row',JSON.stringify(this.value));
        const actionEvent = new CustomEvent('action', { detail: {
            action : event.detail?.action,
            row: this.value
        }});
        console.log('handleAction actionEvent prepared ',JSON.stringify(actionEvent));
        this.dispatchEvent(actionEvent);
        console.log('handleAction END on ROW with event',event)
    }
}