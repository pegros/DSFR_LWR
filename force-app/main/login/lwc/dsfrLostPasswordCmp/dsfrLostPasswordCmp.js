import { LightningElement,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import sendLostPassword from '@salesforce/apex/dsfrSiteManagement_CTL.sendLostPassword';

export default class DsfrLostPasswordCmp extends NavigationMixin(LightningElement) {
    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api mainHeader;
    @api formHeader;
    @api formDescription;
    @api sendLabel;
    @api targetPage;

    @api isDebug = false;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    message;

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleSend(event) {
        if (this.isDebug) console.log('handleSend: START ',event);
        event.preventDefault();
        this.message = null;

        let identity = this.template.querySelector('.fr-input[name="username"]').value;
        if (this.isDebug) console.log('handleSend: identity input fetched ', identity);

        if (!(identity)) {
            if (this.isDebug) console.warn('handleSend: END KO / missing input');
            this.message = {
                type: "error",
                title: "Echec d'envoi",
                details: 'Merci de bien vouloir renseigner tous les champs demandés.'
            };
            return;
        }

        sendLostPassword({identity:identity}).then(result => {
            if (this.isDebug) console.log('handleSend: lost pwd email sent',result);
            if (this.isDebug) console.log('handleSend: redirecting to ',this.targetPage);
            let pageRef = JSON.parse(this.targetPage);
            this[NavigationMixin.Navigate](pageRef, false);
            if (this.isDebug) console.log('handleSend: END / redirected to target');
        }).catch(error => {
            if (this.isDebug) console.log('handleSend: END KO / send failed ', JSON.stringify(error));
            this.message = {
                type: "error",
                title: "Echec d'envoi",
                details: (error.body?.message || error.statusText || '')
            };
        });
        if (this.isDebug) console.log('handleSend: requesting lost pwd email');
    }

}