import { LightningElement, api } from 'lwc';

export default class DsfrTableCellDsp extends LightningElement {

    //--------------------------------------------------------
    // Configuration properties
    //--------------------------------------------------------
    @api field;
    @api value;
    @api isDebug;

    //--------------------------------------------------------
    // Technical properties
    //--------------------------------------------------------
    isButton = false;
    buttonDesc;

    //--------------------------------------------------------
    // Custom getters
    //--------------------------------------------------------
    
    get isMenu() {
        return ((this.field.type === 'action') && (!this.isButton));
    }
    get isBoolean() {
        return (this.field?.type === 'boolean');
    }
    get isDatetime() {
        return (this.field?.type === 'date');
    }
    get isDate() {
        return (this.field?.type === 'date-local');
    }
    get isNumber() {
        return (this.field?.type === 'number');
    }
    get isPercent() {
        return (this.field?.type === 'percent');
    }
    get isEmail() {
        return (this.field?.type === 'email');
    }
    get isUrl() {
        return (this.field?.type === 'url');
    }
    get fieldValue() {
        return (this.field?.fieldName ? this.value[this.field.fieldName] : 'undefined');
        /*return (this.field?.fieldName ? 
                (this.field?.type === 'percent' ? 
                    (this.value[this.field.fieldName] / 100 || 0)
                    : this.value[this.field.fieldName])
                : 'default');*/
    }

    //--------------------------------------------------------
    // Custom getters
    //--------------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START on CELL of type ',this.field?.type)
        this.isButton = (this.field?.type === 'button') || (this.field.type === 'button-icon')
                        || ((this.field.type === 'action') && (this.field.typeAttributes?.rowActions?.length == 1));
        if (this.isDebug)console.log('connected: isButton init ',this.isButton);
        if (this.isButton) {
            this.buttonDesc = (this.field.type == 'action' ? this.field.typeAttributes.rowActions[0] : this.field.typeAttributes);
            if (this.isDebug) console.log('connected: buttonDesc init',JSON.stringify(this.buttonDesc));
        }
        if (this.isDebug) console.log('connected: END on CELL');
    }

    //--------------------------------------------------------
    // Event Handlers
    //--------------------------------------------------------
    handleAction(event) {
        if (this.isDebug) console.log('handleAction: START on CELL with event',event);
        event.stopPropagation();
        event.preventDefault();
        if (this.refs.actionMenu) {
            if (this.isDebug) console.log('handleAction: analysing menu state ',this.refs.menuButton);

            if (this.refs.menuButton.getAttribute('aria-expanded')) {
                if (this.isDebug) console.log('handleAction: closing expanded menu');
                this.toggleMenu(event);
            }
            else {
                console.warn('handleAction: menu already closed');
            }
        }
        else {
            if (this.isDebug) console.log('handleAction: no menu ');
        }
        if (this.isDebug) console.log('handleAction: action triggered (value) ',JSON.stringify(event.target.value));
        if (this.isDebug) console.log('handleAction: action triggered (data-action) ',JSON.stringify(event.target.dataset.action));

        let targetAction = event.target.value || event.target.dataset.action;
        if (this.isDebug) console.log('handleAction: typeof targetAction ', typeof targetAction);
        if (typeof targetAction === 'string') {
            if (this.isDebug) console.log('handleAction: searching targetAction name ',targetAction);
            targetAction = this.field.typeAttributes.rowActions.find(item => item.name === targetAction);
        }
        if (this.isDebug) console.log('handleAction: targetAction identified ',JSON.stringify(targetAction));

        if (this.isDebug) console.log('handleAction: on field',JSON.stringify(this.field));
        if (this.isDebug) console.log('handleAction: on value',JSON.stringify(this.value));
        if (targetAction) {
            const actionEvent = new CustomEvent('action', { detail: { action : targetAction } });
            if (this.isDebug) console.log('handleAction: actionEvent prepared ',JSON.stringify(actionEvent));
            this.dispatchEvent(actionEvent);
            if (this.isDebug) console.log('handleAction: END on CELL with actionEvent',actionEvent);
        }
        else {
            console.warn('handleAction: END KO on CELL / no value found');
        }
    }

    toggleMenu(event) {
        if (this.isDebug) console.log('toggleMenu: START for table cell',event);
        event.stopPropagation();
        event.preventDefault();

        let actionMenu = this.refs.actionMenu;
        if (this.isDebug) console.log('toggleMenu: actionMenu found ',actionMenu);
        let menuButton = this.refs.menuButton;
        if (this.isDebug) console.log('toggleMenu: menuButton found ',menuButton);

        if (actionMenu) {
            if (this.isDebug) console.log('toggleMenu: current Menu classList ',actionMenu.classList);
            if (actionMenu.classList.contains('fr-collapse--expanded')) {
                if (this.isDebug) console.log('toggleMenu: closing menu');
                actionMenu.classList.remove('fr-collapse--expanded');
                menuButton.setAttribute('aria-expanded',false);
            }
            else {
                if (this.isDebug) console.log('toggleMenu: opening menu');
                actionMenu.classList.add('fr-collapse--expanded');
                menuButton.setAttribute('aria-expanded',true);
            }
            if (this.isDebug) console.log('toggleMenu: Menu classList updated ',actionMenu.classList);
        }

        if (this.isDebug) console.log('toggleMenu: END for table cell');
    }
}