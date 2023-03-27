import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import userId from '@salesforce/user/Id';
import sfpegMergeUtl from 'c/sfpegMergeUtl';

export default class DsfrCardTileListCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api listTitle;
    @api configName;
    _listContext;
    @api 
    get listContext() {
        return this._listContext;
    }
    set listContext(value) {
        try {
            this._listContext = JSON.parse(value);
            if (this.isDebug) console.log('set listContext: value parsed ', this._listContext);
        }
        catch(error) {
            console.warn('set listContext: value parsing failed ', error);
            this._listContext = null;
        }
    }
    @api wrappingCss;

    @api isDebug = false;

    //-----------------------------------------------------
    // Context parameters
    //-----------------------------------------------------
    @api objectApiName;
    @api recordId;
    currentUserId = userId;
    recordList;
    configDetails;
    targetTokens;
    elementCss = '';
    isReady = false;


    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------
    get isCard() {
        return this.configDetails?.display?.type === 'Card';
    }
    get isTile() {
        return this.configDetails?.display?.type === 'Tile';
    }
    get isContainer() {
        return this.configDetails?.display?.type === 'Container';
    }
    get displayType() {
        return this.configDetails?.display?.type || 'non défini';
    }
    get headerTitle() {
        return '' + (this.recordList?.length || 0) + ' ' + this.listTitle;
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for card/tile list');
            console.log('connected: configName ', this.configName);
            console.log('connected: listContext ', this.listContext);
            console.log('connected: objectApiName ', this.objectApiName);
            console.log('connected: recordId ', this.recordId);
            console.log('connected: userId ', this.userId);
            console.log('connected: END for card/tile list');
        }
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleRecordLoad(event) {
        if (this.isDebug) console.log('handleRecordLoad: START for card/tile list',event);


        if (!this.configDetails) {
            let listCmp = this.template.querySelector('c-sfpeg-list-cmp');
            if (this.isDebug) console.log('handleRecordLoad: fetching listCmp ',listCmp);
            this.configDetails =  listCmp.configuration;
            if (this.configDetails?.display?.target) {
                if (this.isDebug) console.log('handleRecordLoad: extracting tokens from target ', this.configDetails.display.target);
                let pattern = /\{!([\w_]+).([\w_]+)\}/gi;
                let keyMatch;
                let targetTokens = [];
                const tokenSet = new Set();
                while (keyMatch = pattern.exec(this.configDetails.display.target))  {
                    if (this.isDebug) console.log('handleRecordLoad: key extracted ', keyMatch);
                    if (this.isDebug) console.log('handleRecordLoad: global key ', keyMatch[0]);
                    if (this.isDebug) console.log('handleRecordLoad: origin ', keyMatch[1]);
                    if (this.isDebug) console.log('handleRecordLoad: field ', keyMatch[2]);

                    if (tokenSet.has(keyMatch[0])) {
                        if (this.isDebug) console.log('handleRecordLoad: ignoring token already found ', keyMatch[0]);
                    }
                    else {
                        if (this.isDebug) console.log('handleRecordLoad: registering token ', keyMatch[0]);
                        targetTokens.push({token:keyMatch[0], type: keyMatch[1], field: keyMatch[2]});
                        tokenSet.add(keyMatch[0]);
                    }
                }
                if (this.isDebug) console.log('handleRecordLoad: all tokens extracted',targetTokens);
                this.targetTokens = targetTokens;
            }
            if (this.isDebug) console.log('handleRecordLoad: configDetails init ',JSON.stringify(this.configDetails));
        }

        let baseRecordList =  event.detail;
        if (this.isDebug) console.log('handleRecordLoad: list loaded ',JSON.stringify(event.detail));

        let targetRecordList = [];
        if (baseRecordList) {
            if (this.isDebug) console.log('handleRecordLoad: processing list');
            if (this.isDebug) console.log('handleRecordLoad: configDetails ',this.configDetails);
            baseRecordList.forEach(item => {
                if (this.isDebug) console.log('handleRecordLoad: processing row ',JSON.stringify(item));
                let newItem = {... (this.configDetails?.display?.base)};
                if (this.configDetails?.display?.row) {
                    if (this.isDebug) console.log('handleRecordLoad: processing row fields');
                    for (let fieldItem in this.configDetails.display.row) {
                        if (this.isDebug) console.log('handleRecordLoad: processing fieldItem ',fieldItem);
                        let fieldItemSrc = this.configDetails.display.row[fieldItem];
                        if (this.isDebug) console.log('handleRecordLoad: fieldItemSrc fetched ',fieldItemSrc);
                        newItem[fieldItem] =  item[fieldItemSrc];
                    }
                    if (this.isDebug) console.log('handleRecordLoad: newItem init ',JSON.stringify(newItem));
                }
                if (this.targetTokens) {
                    if (this.isDebug) console.log('handleRecordLoad: merging row target');

                    let mergedTarget = '' + this.configDetails.display.target;
                    this.targetTokens.forEach(itemToken => {
                        if (this.isDebug) console.log('handleRecordLoad: processing token ',JSON.stringify(itemToken));
                        let tokenRegex = new RegExp(itemToken.token, 'g');
                        let itemValue;
                        if (itemToken.type === 'Item') {
                            itemValue = item[itemToken.field];
                        }
                        else if (itemToken.type === 'Route') {
                            if (itemToken.field === 'objectApiName') { itemValue = this.objectApiName;}
                            else if (itemToken.field === 'recordId') { itemValue = this.recordId;}
                        }
                        if ((itemValue !== undefined) && (itemValue !== null))  {
                            mergedTarget = mergedTarget.replace(tokenRegex,itemValue);
                        }
                    });
                    if (this.isDebug) console.log('handleRecordLoad: target merged ',JSON.stringify(mergedTarget));
                    newItem.target = mergedTarget;
                }
                else {
                    if (this.isDebug) console.log('handleRecordLoad: no row target merge required');
                }
                
                if (this.isDebug) console.log('handleRecordLoad: newItem prepared ',JSON.stringify(newItem));
                targetRecordList.push(newItem);
            });
        }
        this.recordList = targetRecordList;
        this.isReady = true;
        
        if (this.isDebug) console.log('handleRecordLoad: END for card/tile list');
    }
}