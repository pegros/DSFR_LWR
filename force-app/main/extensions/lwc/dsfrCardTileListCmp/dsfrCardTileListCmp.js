import { LightningElement, api } from 'lwc';
//import { NavigationMixin } from 'lightning/navigation';
import userId       from '@salesforce/user/Id';
import sfpegJsonUtl from 'c/sfpegJsonUtl';
//import DefaultGroupNotificationFrequency from '@salesforce/schema/User.DefaultGroupNotificationFrequency';
import SORT_TITLE from '@salesforce/label/c.dsfrCardTileListSortTitle';
import TYPE_ERROR from '@salesforce/label/c.dsfrCardTileListError';
import SORT_DEFAULT from '@salesforce/label/c.dsfrCardTileListSortDefault';
import SORT_PREFIX from '@salesforce/label/c.dsfrCardTileListSortPrefix';


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
        let listContext;
        try {
            if (this.isDebug) console.log('set Card/Tile listContext: value provided ', JSON.stringify(value));
            listContext = JSON.parse(value);
            if (this.isDebug) console.log('set Card/Tile listContext: value parsed ', JSON.stringify(listContext));
        }
        catch(error) {
            console.warn('set Card/Tile listContext: value parsing failed ', error);
            this._listContext = null;
            return;
        }

        /*for (let iter in listContext) {
            if (this.isDebug) console.log('set listContext: processing iter ', JSON.stringify(iter));
            if ((listContext[iter])?.WHERE) {
                if (this.isDebug) console.log('set listContext: evaluating iter', (listContext[iter]).WHERE);
                let condition = (listContext[iter]).WHERE;
                let finalCondition;
                try {
                    finalCondition = this.buildWhere(condition);
                }
                catch(error) {
                    console.warn('set listContext: iter evaluation failed ', error);
                }    
                if (finalCondition) {
                    if (this.isDebug) console.log('set listContext: updating iter', finalCondition);
                    listContext[iter] = 'WHERE ' + finalCondition;
                }
                else {
                    if (this.isDebug) console.log('set listContext: empty iter condition');
                    listContext[iter] = '';
                }
            }
        }*/

        this._listContext = listContext;
        if (this.isDebug) console.log('set Card/Tile listContext: value set ', JSON.stringify(this._listContext));
    }
    @api wrappingCss;
    @api headerCss;         // Classes pour modifier le style du titre du composant.

    @api isDebug = false;

    //-----------------------------------------------------
    // Context parameters
    //-----------------------------------------------------
    @api objectApiName;
    @api recordId;
    currentUserId = userId;
    recordList;
    configDetails;

    iconFieldsTokens;
    targetTokens;

    elementCss = '';
    isReady = false;

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    sortTitle = SORT_TITLE;
    typeError = TYPE_ERROR;

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
    get headerClass() {
        return this.headerCss + ' listTitle';
    }
    get hasSort() {
        //if (this.isDebug) console.log('hasSort: ',(this.configDetails?.display?.sort || false));
        return (this.configDetails?.display?.sort || false);
    }
    get currentSort() {
        if (this.isDebug) console.log('currentSort: START');
        /*if (!this.hasSort) {
            console.warn('currentSort: END KO / issue with sort init ');
            return {label: 'Issue!!!'};
        }*/
        let currentSort = this.configDetails.display.sort.find(item => {return item.selected;});
        if (this.isDebug) console.log('currentSort: currentSort found ',JSON.stringify(currentSort));
        if (currentSort) {
            if (this.isDebug) console.log('currentSort: END / returning current ');
            return {label: SORT_PREFIX + currentSort.label, class: (currentSort.up ? 'fr-icon-arrow-up-line': 'fr-icon-arrow-down-line')};
        }
        if (this.isDebug) console.log('currentSort: END / returning default ');
        return {label: SORT_DEFAULT};
    }
    get cardFieldClass() {
        return this.configDetails?.display?.fieldClass || '';
    }
    get cardIconClass() {
        return this.configDetails?.display?.iconClass || '';        
    }
    get fitImage() {
        return this.configDetails?.display?.fitImage;        
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for card/tile list ',this.configName);
            console.log('connected: listContext ', this.listContext);
            console.log('connected: objectApiName ', this.objectApiName);
            console.log('connected: recordId ', this.recordId);
            console.log('connected: userId ', this.userId);
            console.log('connected: END for card/tile list');
        }
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START for card/tile list ',this.configName);
            console.log('rendered: sort context ', this.configDetails?.display?.sort);
            console.log('rendered: END for card/tile list');
        }
    }

    disconnectedCallback() {
        if (this.isDebug) {
            console.log('disconnected: START for card/tile list ',this.configName);
            console.log('disconnected: listContext ', this.listContext);
            console.log('disconnected: objectApiName ', this.objectApiName);
            console.log('disconnected: recordId ', this.recordId);
            console.log('disconnected: userId ', this.userId);
            console.log('disconnected: END for card/tile list');
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
                this.targetTokens = this.extractTokens(this.configDetails.display.target);
                if (this.isDebug) console.log('handleRecordLoad: all target tokens extracted');
            }
            if (this.configDetails?.display?.sort) {
                if (this.isDebug) console.log('handleRecordLoad: initializing sort');
                this.configDetails.display.sort.forEach(item => {
                    item.selected = false;
                    item.up = true;
                });
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
                //newItem._source = item;

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

                if (this.configDetails?.display?.sort) {
                    if (this.isDebug) console.log('handleRecordLoad: copying sort field values');
                    this.configDetails.display.sort.forEach(itemSort => {
                        if (this.isDebug) console.log('handleRecordLoad: processing sort item ',itemSort.field);
                        let itemSortTgt = '_' + itemSort.field;
                        if (this.isDebug) console.log('handleRecordLoad: registered as ',itemSortTgt);
                        newItem[itemSortTgt] = item[itemSort.field];
                    });
                    if (this.isDebug) console.log('handleRecordLoad: newItem init ',JSON.stringify(newItem));
                }

                // Initialising Icon Fields for Cards
                if (this.configDetails?.display?.iconFields) {
                    if (this.isDebug) console.log('handleRecordLoad: initialising iconFields');

                    let iconFields = [];
                    this.configDetails.display.iconFields.forEach(itemField => {
                        if (this.isDebug) console.log('handleRecordLoad: processing iconField ',JSON.stringify(itemField));
                        if (itemField.field) {
                            let targetField = {... itemField};
                            targetField.value = item[itemField.field];
                            if (this.isDebug) console.log('handleRecordLoad: registering icon field ',JSON.stringify(targetField));
                            iconFields.push(targetField);
                        }
                    });
                    if (this.isDebug) console.log('handleRecordLoad: iconFields init ', JSON.stringify(iconFields));
                    newItem.iconFields = iconFields;
                }

                // Initialising Badge List for Cards
                if (this.configDetails?.display?.badgeList) {
                    if (this.isDebug) console.log('handleRecordLoad: initialising badgeList');

                    let badgeList = [];
                    this.configDetails.display.badgeList.forEach(itemBadge => {
                        if (this.isDebug) console.log('handleRecordLoad: processing itemBadge ',JSON.stringify(itemBadge));
                        let badgeData = {... itemBadge};
                        if (itemBadge.valueField) badgeData.value = item[itemBadge.valueField];
                        if (itemBadge.variantField) badgeData.variant = item[itemBadge.variantField];
                        if (this.isDebug) console.log('handleRecordLoad: registering badge data ',JSON.stringify(badgeData));
                        badgeList.push(badgeData);
                    });
                    if (this.isDebug) console.log('handleRecordLoad: badgeList init ', JSON.stringify(badgeList));
                    newItem.badgeList = badgeList;
                }

                // Merging Target Tokend in Actions
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
                
                if (this.isDebug) console.log('handleRecordLoad: newItem prepared ',JSON.stringify(newItem));
                targetRecordList.push(newItem);
            });
        }
        this.recordList = targetRecordList;
        if (this.isDebug) console.log('handleRecordLoad: recordList init ',JSON.stringify(this.recordList));
        this.isReady = true;
        
        if (this.isDebug) console.log('handleRecordLoad: END for card/tile list');
    }

    toggleSort(event) {
        if (this.isDebug) console.log('toggleSort: START for card/tile list',event);
        event.stopPropagation();
        event.preventDefault();

        let sortMenu = this.template.querySelector("div[data-menu='sort']");
        if (this.isDebug) console.log('toggleSort: sortMenu found ',sortMenu);

        if (sortMenu) {
            if (this.isDebug) console.log('toggleSort: current Menu classList ',sortMenu.classList);
            if (sortMenu.classList.contains('fr-collapse--expanded')) {
                if (this.isDebug) console.log('toggleSort: closing menu');
                sortMenu.classList.remove('fr-collapse--expanded');
            }
            else {
                if (this.isDebug) console.log('toggleSort: opening menu');
                sortMenu.classList.add('fr-collapse--expanded');
            }
            if (this.isDebug) console.log('toggleSort: Menu classList updated ',sortMenu.classList);
        }

        if (this.isDebug) console.log('toggleSort: END for card/tile list');
    }

    selectSort(event){
        if (this.isDebug) console.log('selectSort: START for card/tile list',event);
        event.stopPropagation();
        event.preventDefault();

        const selectedLink = event.target.dataset.name;
        if (this.isDebug) console.log('selectSort: selectedLink identified ',selectedLink);

        let selectedSort;
        this.configDetails.display.sort.forEach(item => {
            if (this.isDebug) console.log('selectSort: processing sort option ',item);
            if (item.field != selectedLink) {
                item.selected = false;
                item.up = true;
                //item.class = '';
            }
            else {
                if (item.selected) {
                    if (this.isDebug) console.log('selectSort: inverting current sort direction ');
                    item.up = !item.up;
                    //item.class = (item.up ? 'fr-icon-arrow-up-line' : 'fr-icon-arrow-down-line');
                }
                else {
                    if (this.isDebug) console.log('selectSort: selecting new sorting field ');
                    item.selected = true;
                    item.up = true;
                    //item.class = 'fr-icon-arrow-up-line';
                }
                selectedSort = item;
            }
        });
        if (this.isDebug) console.log('selectSort: sorting entries updated ',JSON.stringify(this.configDetails.display.sort));
       
        this.toggleSort(event);

        if (selectedSort) {
            if (this.isDebug) console.log('selectSort: sorting by ',JSON.stringify(selectedSort));
            let listCmp = this.template.querySelector('c-sfpeg-list-cmp');
            if (this.isDebug) console.log('selectSort: list fetch component retrieved ',listCmp);

            /*listCmp.doSort(selectedSort.field,(selectedSort.up?'asc':'desc'));
            if (this.isDebug) console.log('selectSort: sorting triggered');
            */
            let results2sort = [...this.recordList];
            if (this.isDebug) console.log('selectSort: results2sort init ', JSON.stringify(results2sort));
            if (this.isDebug) console.log('selectSort: sort by field ', ('_' + selectedSort.field));
            if (this.isDebug) console.log('selectSort: revers sorting? ', !selectedSort.up);
            sfpegJsonUtl.sfpegJsonUtl.isDebug = this.isDebug;
            results2sort.sort(sfpegJsonUtl.sfpegJsonUtl.sortBy(('_' + selectedSort.field), !selectedSort.up));
            if (this.isDebug) console.log('handleSort: results2sort sorted ',results2sort);
            this.recordList = results2sort;
            if (this.isDebug) console.log('selectSort: recordList sorted ',JSON.stringify(this.recordList));
        }
        else {
            console.warn('selectSort: no selected sorting field');
        }
        
        if (this.isDebug) console.log('selectSort: END for card/tile list');        
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    extractTokens = function(template) {
        if (this.isDebug) console.log('extractTokens: START for template ', template);
    
        let pattern = /\{!([\w_]+).([\w_]+)\}/gi;
        let keyMatch;
        let targetTokens = [];
        const tokenSet = new Set();
        while (keyMatch = pattern.exec(template))  {
            if (this.isDebug) console.log('extractTokens: key extracted ', keyMatch);
            if (this.isDebug) console.log('extractTokens: global key ', keyMatch[0]);
            if (this.isDebug) console.log('extractTokens: origin ', keyMatch[1]);
            if (this.isDebug) console.log('extractTokens: field ', keyMatch[2]);
        
            if (tokenSet.has(keyMatch[0])) {
                if (this.isDebug) console.log('extractTokens: ignoring token already found ', keyMatch[0]);
            }
            else {
                if (this.isDebug) console.log('extractTokens: registering token ', keyMatch[0]);
                targetTokens.push({token:keyMatch[0], type: keyMatch[1], field: keyMatch[2]});
                tokenSet.add(keyMatch[0]);
            }
        }
        if (this.isDebug) console.log('extractTokens: END / all tokens extracted ', targetTokens);
        return targetTokens;
    }
    /*
    buildWhere = function(condition) {
        if (this.isDebug) console.log("buildWhere: START with ", condition);

        if (condition.EQ) {
            if (this.isDebug) console.log("buildWhere: processing EQ ");
            if (condition.EQ.value) {
                if (this.isDebug) console.log("buildWhere: END / building condition ");
                return '(' + condition.EQ.field + (condition.EQ.not ? " != '": " = '") + condition.EQ.value + "')";
            }
            else {
                if (this.isDebug) console.log("buildWhere: END / ignoring condition ");
                return null;
            }
        }
        else if (condition.IN) {
            if (this.isDebug) console.log("buildWhere: processing IN ");
            if (condition.IN.value) {
                if (this.isDebug) console.log("buildWhere: END / building condition ");
                let values = condition.IN.value.sfpegJsonUtlt(';');
                return '(' + condition.IN.field + (condition.IN.not ? " NOT IN ('": " IN ('") + values.join("','") + "'))";
            }
            else {
                if (this.isDebug) console.log("buildWhere: END / ignoring condition ");
                return null;
            }
        }
        else if (condition.INCL) {
            if (this.isDebug) console.log("buildWhere: processing INCL ");
            if (condition.INCL.value) {
                if (this.isDebug) console.log("buildWhere: END / building condition ");
                let values = condition.INCL.value.split(';');
                return '(' + condition.INCL.field + (condition.INCL.not ? " EXCLUDES ('": " INCLUDES ('") + values.join("','") + "'))";
            }
            else {
                if (this.isDebug) console.log("buildWhere: END / ignoring condition ");
                return null;
            }
        }
        else if (condition.OR) {
            if (this.isDebug) console.log("buildWhere: processing OR ");
            let unitConditions = [];
            condition.OR.forEach(item =>{
                if (this.isDebug) console.log("buildWhere: processing sub-condition ",item);
                let itemCondition = this.buildWhere(item);
                if (itemCondition) {
                    if (this.isDebug) console.log("buildWhere: registering sub-condition ",itemCondition);
                    unitConditions.push(itemCondition);
                }
                else {
                    if (this.isDebug) console.log("buildWhere: sub-condition ignored");
                }
            });
            if (unitConditions.length > 0) {
                if (this.isDebug) console.log("buildWhere: END / grouping OR sub-conditions");
                return "(" + unitConditions.join(') OR (') + ")";
            }
            else {
                if (this.isDebug) console.log("buildWhere: END / ignoring OR condition (no sub-conditions)");
            }
        }
        else if (condition.AND) {
            if (this.isDebug) console.log("buildWhere: processing AND ");
            let unitConditions = [];
            condition.AND.forEach(item =>{
                if (this.isDebug) console.log("buildWhere: processing sub-condition ",item);
                let itemCondition = this.buildWhere(item);
                if (itemCondition) {
                    if (this.isDebug) console.log("buildWhere: registering sub-condition ",itemCondition);
                    unitConditions.push(itemCondition);
                }
                else {
                    if (this.isDebug) console.log("buildWhere: sub-condition ignored");
                }
            });
            if (unitConditions.length > 0) {
                if (this.isDebug) console.log("buildWhere: END / grouping AND sub-conditions");
                return "(" + unitConditions.join(') AND (') + ")";
            }
            else {
                if (this.isDebug) console.log("buildWhere: END / ignoring OR condition (no sub-conditions)");
            }
        }
    }
    */

}