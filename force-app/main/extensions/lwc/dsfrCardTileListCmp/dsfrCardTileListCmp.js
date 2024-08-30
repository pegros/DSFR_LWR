import { LightningElement, api } from 'lwc';
//import { NavigationMixin } from 'lightning/navigation';
import userId       from '@salesforce/user/Id';
import sfpegJsonUtl from 'c/sfpegJsonUtl';
import FORM_FACTOR          from '@salesforce/client/formFactor';

//import DefaultGroupNotificationFrequency from '@salesforce/schema/User.DefaultGroupNotificationFrequency';
import SORT_TITLE from '@salesforce/label/c.dsfrCardTileListSortTitle';
import REFRESH_TITLE from '@salesforce/label/c.dsfrCardTileListRefreshTitle';
import TYPE_ERROR from '@salesforce/label/c.dsfrCardTileListError';
import SORT_DEFAULT from '@salesforce/label/c.dsfrCardTileListSortDefault';
import SORT_PREFIX from '@salesforce/label/c.dsfrCardTileListSortPrefix';
import {
    registerRefreshContainer,
    unregisterRefreshContainer,
    REFRESH_ERROR,
    REFRESH_COMPLETE,
    REFRESH_COMPLETE_WITH_ERRORS,
  } from "lightning/refresh";

/**
* @slot emptySection
*/

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
            if (typeof value === 'string') {
                if (this.isDebug) console.log('set Card/Tile listContext: parsing string value');
                listContext = JSON.parse(value);
                if (this.isDebug) console.log('set Card/Tile listContext: value parsed ', JSON.stringify(listContext));
            }
            else {
                listContext = value;
                if (this.isDebug) console.log('set Card/Tile listContext: keeping value provided ', JSON.stringify(listContext));
            }
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
    @api countDisplay = 'left';
    @api wrappingCss;
    @api headerCss;         // Classes pour modifier le style du titre du composant.
    @api displayHeight ;    // = '50vh'

    @api hasEmptySection;
    @api forceDisplay;
    @api showRefresh;

    @api pageSize = 100;

    @api isDebug = false;

    //-----------------------------------------------------
    // Context parameters
    //-----------------------------------------------------
    @api objectApiName;
    @api recordId;

    //Form Factor (fo mobile specific configuration override)
    formfactor = FORM_FACTOR;

    currentUserId = userId;
    recordList;
    configDetails;

    iconFieldsTokens;
    targetTokens;
    buttonsTokens;

    elementCss = '';
    isReady = false;

    refreshContainerId;

    // Pagination management
    currentPage = 1;
    maxPage = 1;
    displayList;

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    sortTitle = SORT_TITLE;
    refreshTitle = REFRESH_TITLE;
    typeError = TYPE_ERROR;

    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------

    get isH2() {
        return this.headerCss.includes('h2');
    }
    get isH3() {
        return this.headerCss.includes('h3');
    }

    get isTable() {
        return this.configDetails?.display?.type === 'Table';
    }
    get isCard() {
        return this.configDetails?.display?.type === 'Card';
    }
    get isTile() {
        return this.configDetails?.display?.type === 'Tile';
    }
    get isContainer() {
        return this.configDetails?.display?.type === 'Container';
    }
    get isButton() {
        return this.configDetails?.display?.type === 'Button';
    }
    get isIconField() {
        return this.configDetails?.display?.type === 'IconField';
    }
    get displayType() {
        return this.configDetails?.display?.type || 'non défini';
    }
    get headerTitle() {
        switch (this.countDisplay) {
            case 'left': 
                return '' + (this.recordList?.length || 0) + ' ' + this.listTitle;
            case 'right': 
                return this.listTitle + ' ('+ (this.recordList?.length || 0) + ')';
            default:
                return this.listTitle;
        }
    }
    get headerClass() {
        return this.headerCss + ' listTitle' + (this.listTitle ? '' : ' slds-hide');
    }
    get hasSort() {
        //if (this.isDebug) console.log('hasSort: ',(this.configDetails?.display?.sort || false));
        return this.hasResults && (this.configDetails?.display?.sort || false);
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
            return {
                label: SORT_PREFIX + ' ' + currentSort.label,
                class: (currentSort.up ? 'fr-icon-arrow-up-line': 'fr-icon-arrow-down-line'),
                ariaLabel: this.sortTitle + '. Actuellement ' + SORT_PREFIX + ' ' + currentSort.label + (currentSort.up ? ' croissant': ' décroissant')
            };
        }
        if (this.isDebug) console.log('currentSort: END / returning default ');
        return {
            label: SORT_DEFAULT,
            ariaLabel: this.sortTitle + '. Actuellement ' + SORT_DEFAULT
        };
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
    get buttonAlignClass() {
        return 'fr-btns-group fr-btns-group--inline-reverse fr-btns-group--inline-sm align-' + this.configDetails?.display?.align;
    }
    get hasNoResult() {
        return ((this.hasEmptySection) && ((this.forceDisplay) || ((this.recordList?.length || 0) == 0)));
    }
    get hasResults() {
        return (this.recordList?.length > 0);
    }
    get hasSingleResult() {
        return (this.recordList?.length == 1);
    }
    get resultListStyle() {
        if ((this.isCollapsible) && (this.isCollapsed)) {
            return ' ';
        }
        else if ((this.recordList || []).length == 0) {
            return ' ';
        }
        return (((this.displayHeight) &&  (this.displayHeight !== '0')) ? 'height: ' + this.displayHeight + ';' : ' ');        
    }
    get iconFieldWrappingClass() {
        return 'fr-col-12 ' + (this.configDetails?.display.wrappingClass || 'horizontalUL'); 
    }
    get tableClass() {
        // fr-table--layout-fixed slds-table_header-fixed_container
        return  (this.configDetails?.display?.tableClass || 'fr-table ') + ' slds-scrollable_y tableContainer';
    }
    get tableCaption() {
        return this.configDetails?.display?.tableCaption;
    }

    // Pagination
    get hasPagination() {
        return (this.pageSize > 0) && ((this.recordList?.length || 0) > this.pageSize);
    }
    get isFirstPage() {
        return this.currentPage == 1;
    }
    get isAfterStartPage() {
        return this.currentPage > 2;
    }
    get isLastPage() {
        return this.currentPage == this.maxPage;
    }
    get isBeforeEndPage() {
        return this.currentPage < this.maxPage - 1;
    }
    get previousPage() {
        return (this.currentPage > 1 ? this.currentPage - 1 : null);
    }
    get previousPageTitle() {
        return 'Accès à la page ' + (this.currentPage - 1);
    }
    get currentPageTitle() {
        return 'Accès à la page ' + this.currentPage;
    }
    get nextPage() {
        //console.log('nextPage: currentPage ',this.currentPage);
        //console.log('nextPage: return ',(this.currentPage < this.maxPage ? this.currentPage + 1 : null));
        return (this.currentPage < this.maxPage ? this.currentPage + 1 : null);
    }
    get nextPageTitle() {
        return 'Accès à la page ' + (this.currentPage + 1);
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for card/tile list ',this.configName);
            console.log('connected: listContext ', JSON.stringify(this.listContext));
            console.log('connected: objectApiName ', this.objectApiName);
            console.log('connected: recordId ', this.recordId);
            console.log('connected: userId ', this.userId);
            console.log('connected: pageSize ', this.pageSize);
            console.log('connected: formfactor provided ',this.formfactor);
        }

        this.refreshContainerId = registerRefreshContainer(this, this.refreshContainer);
        if (this.isDebug)console.log('connected: refresh container registered ',this.refreshContainerId);
        
        if (this.isDebug) console.log('connected: END for card/tile list');
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
        }

        unregisterRefreshContainer(this.refreshContainerId);
        if (this.isDebug)console.log('disconnected: refresh container unregistered');

        if (this.isDebug) console.log('disconnected: END for card/tile list');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    refreshContainer(refreshPromise) {
        if (this.isDebug) console.log("refreshContainer: START");
        
        let listCmp = this.template.querySelector('c-sfpeg-list-cmp');
        if (this.isDebug) console.log('refreshContainer: fetching listCmp ',listCmp);
        listCmp.doRefresh();

        if (this.isDebug) console.log('refreshContainer: END ');
        return refreshPromise.then((status) => {
          if (status === REFRESH_COMPLETE) {
            console.log("refreshContainer Done!");
          } else if (status === REFRESH_COMPLETE_WITH_ERRORS) {
            console.warn("refreshContainer Done, with issues refreshing some components");
          } else if (status === REFRESH_ERROR) {
            console.error("refreshContainer Major error with refresh.");
          }
        });
    }

    handleRecordLoad(event) {
        if (this.isDebug) console.log('handleRecordLoad: START for card/tile list',event);

        if (!this.configDetails) {
            if (this.isDebug) console.log('handleRecordLoad: initializing configDetails');
            this.initConfigDetails();
        }

        let baseRecordList = event.detail;
        if (this.isDebug) console.log('handleRecordLoad: #records loaded ',baseRecordList.length);
        if (this.isDebug) console.log('handleRecordLoad: list loaded ',JSON.stringify(event.detail));

        let targetRecordList = [];
        if (baseRecordList) {
            if (this.isDebug) console.log('handleRecordLoad: processing list');
            if (this.isDebug) console.log('handleRecordLoad: configDetails ',JSON.stringify(this.configDetails));

            if (!this.isTable) {
                if (this.isDebug) console.log('handleRecordLoad: preparing data for display');

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
                            else {
                                console.warn('handleRecordLoad: no field property set');
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

                    // Merging Target Tokens in Actions
                    if (this.targetTokens) {
                        if (this.isDebug) console.log('handleRecordLoad: merging row target');

                        let mergedTarget = '' + this.configDetails.display.targetJson;
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
                            else {
                                console.warn('handleRecordLoad: No value found for item field in target ',itemToken.field);
                            }
                        });
                        if (this.isDebug) console.log('handleRecordLoad: target merged ',JSON.stringify(mergedTarget));
                        newItem.target = mergedTarget;
                    }
                
                    // Merging Buttons Tokens in Actions
                    if (this.buttonsTokens) {
                        if (this.isDebug) console.log('handleRecordLoad: merging row buttons');

                        let mergedButtons = '' + this.configDetails.display.buttonsJson;
                        this.buttonsTokens.forEach(itemToken => {
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
                            //if ((itemValue !== undefined) && (itemValue !== null))  {
                            if (itemValue !== undefined) {
                                if (this.isDebug) console.log('handleRecordLoad: merging token value ',itemValue);
                                mergedButtons = mergedButtons.replace(tokenRegex,itemValue);
                            }
                            else {
                                if (this.isDebug) console.log('handleRecordLoad: no token value to merge',itemValue);
                                mergedButtons = mergedButtons.replace(tokenRegex,'');                         
                            }
                        });
                        if (this.isDebug) console.log('handleRecordLoad: buttons merged ',mergedButtons);
                        newItem.buttons = JSON.parse(mergedButtons);
                    }
                    else {
                        newItem.buttons = this.configDetails.display.buttons;
                    }

                    if (this.isDebug) console.log('handleRecordLoad: newItem prepared ',JSON.stringify(newItem));
                    targetRecordList.push(newItem);
                });
            }
            else {
                if (this.isDebug) console.log('handleRecordLoad: keeping original data for table display');
                targetRecordList = baseRecordList;
            }
        }
        this.recordList = targetRecordList;
        if (this.isDebug) console.log('handleRecordLoad: recordList init ',JSON.stringify(this.recordList));
        if (this.isDebug) console.log('handleRecordLoad: #records init ',this.recordList.length);

        if (this.pageSize) {
            if (this.isDebug) console.log('handleRecordLoad: paginating by pageSize ',this.pageSize);
            this.currentPage = 1;
            this.maxPage = Math.ceil(baseRecordList.length / this.pageSize);
            if (this.isDebug) console.log('handleRecordLoad: maxPage determined ',this.maxPage);
            this.displayList = this.recordList.slice(0, this.pageSize);
            if (this.isDebug) console.log('handleRecordLoad: #records kept for page 1 ',this.displayList.length);    
        }
        else {
            if (this.isDebug) console.log('handleRecordLoad: no pagination ');    
            this.displayList = this.recordList;
        }
        this.isReady = true;
        
        if (this.isDebug) console.log('handleRecordLoad: END for card/tile list');
    }

    toggleSort(event) {
        if (this.isDebug) console.log('toggleSort: START for card/tile list',event);
        event.stopPropagation();
        event.preventDefault();

        //let sortMenu = this.template.querySelector("div[data-menu='sort']");
        let sortMenu = this.refs.sortMenu;
        if (this.isDebug) console.log('toggleSort: sortMenu found ',sortMenu);
        let sortButton = this.refs.sortButton;
        if (this.isDebug) console.log('toggleSort: sortButton found ',sortButton);

        if (sortMenu) {
            if (this.isDebug) console.log('toggleSort: current Menu classList ',sortMenu.classList);
            if (sortMenu.classList.contains('fr-collapse--expanded')) {
                if (this.isDebug) console.log('toggleSort: closing menu');
                sortMenu.classList.remove('fr-collapse--expanded');
                sortButton.setAttribute('aria-expanded',false);
            }
            else {
                if (this.isDebug) console.log('toggleSort: opening menu');
                sortMenu.classList.add('fr-collapse--expanded');
                sortButton.setAttribute('aria-expanded',true);
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
            if (this.isDebug) console.log('selectSort: processing sort option ',JSON.stringify(item));
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
            //let listCmp = this.template.querySelector('c-sfpeg-list-cmp');
            let listCmp = this.refs.listLoader;
            if (this.isDebug) console.log('selectSort: list fetch component retrieved ',listCmp);

            /*listCmp.doSort(selectedSort.field,(selectedSort.up?'asc':'desc'));
            if (this.isDebug) console.log('selectSort: sorting triggered');
            */
            let results2sort = [...this.recordList];
            if (this.isDebug) console.log('selectSort: results2sort init ', JSON.stringify(results2sort));
            if (this.isDebug) console.log('selectSort: sort by field ', ('_' + selectedSort.field));
            if (this.isDebug) console.log('selectSort: reverse sorting? ', !selectedSort.up);
            sfpegJsonUtl.sfpegJsonUtl.isDebug = this.isDebug;
            if (this.isTable) {
                if (this.isDebug) console.log('selectSort: standard sorting');
                results2sort.sort(sfpegJsonUtl.sfpegJsonUtl.sortBy((selectedSort.field), !selectedSort.up));
            }
            else {
                if (this.isDebug) console.log('selectSort: DSFR sorting');
                results2sort.sort(sfpegJsonUtl.sfpegJsonUtl.sortBy(('_' + selectedSort.field), !selectedSort.up));
            }
            if (this.isDebug) console.log('handleSort: results2sort sorted ',JSON.stringify(results2sort));
            this.recordList = results2sort;
            //this.recordList = JSON.parse(JSON.stringify(results2sort));
            if (this.isDebug) console.log('selectSort: recordList updated ');

            if (this.pageSize) {
                if (this.isDebug) console.log('selectSort: paginating by pageSize ',this.pageSize);
                this.currentPage = 1;
                this.maxPage = Math.ceil(results2sort.length / this.pageSize);
                if (this.isDebug) console.log('selectSort: maxPage determined ',this.maxPage);
                this.displayList = this.recordList.slice(0, this.pageSize);
                if (this.isDebug) console.log('selectSort: #records kept for page 1 ',this.displayList.length);    
            }
            else {
                if (this.isDebug) console.log('selectSort: no pagination ');    
                this.displayList = this.recordList;
            }
        }
        else {
            console.warn('selectSort: no selected sorting field');
        }
        
        if (this.isDebug) console.log('selectSort: END for card/tile list');        
    }

    handleRefresh(event){
        if (this.isDebug) console.log('handleRefresh: START',event);
        event.preventDefault();
        let listCmp = this.template.querySelector("c-sfpeg-list-cmp");
        if (this.isDebug) console.log('handleRefresh: listCmp fetched',listCmp);
        listCmp.doRefresh();
        if (this.isDebug) console.log('handleRefresh: END file list refresh triggered');
    }

    handlePagination(event) {
        if (this.isDebug) console.log('handlePagination: START for card/tile list',event);
        event.stopPropagation();
        event.preventDefault();

        const targetPage = event.target.dataset.value;
        if (this.isDebug) console.log('handlePagination: targetPage identified ',targetPage);
        if (this.isDebug) console.log('handlePagination: typeof targetPage ', typeof targetPage);

        this.currentPage = parseInt(targetPage);
        if (this.isDebug) console.log('handlePagination: currentPage updated ',this.currentPage);
        
        this.displayList = this.recordList.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
        if (this.isDebug) console.log('handlePagination: #new displayed records set ',this.displayList.length);
        if (this.isDebug) console.log('handlePagination: new records displayed ',JSON.stringify(this.displayList));

        if (this.isDebug) console.log('handlePagination: recordList fetched ',this.refs.recordList);
        if (this.refs.recordList) {
            this.refs.recordList.scrollTop = 0;
            if (this.isDebug) console.log('handlePagination: recordList rewinded to top ');
        }

        if (this.isDebug) console.log('handlePagination: END for card/tile list');
    }

    handleAction(event) {
        if (this.isDebug) console.log('handleAction: START for card/tile list',event);
        event.stopPropagation();
        event.preventDefault();
        if (this.isDebug) console.log('handleAction: event details received ',JSON.stringify(event.detail));
        this.refs.listLoader.doRowAction(event);
        if (this.isDebug) console.log('handleAction: END for card/tile list');
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------

    initConfigDetails = () => {
        if (this.isDebug) console.log('initConfigDetails: START');
    
        let listCmp = this.refs.listLoader;
        if (this.isDebug) console.log('initConfigDetails: fetching listCmp ',listCmp);
        this.configDetails =  listCmp.configuration;

        // Extracting button tokens
        if (this.configDetails?.display?.target) {
            this.configDetails.display.targetJson = (typeof this.configDetails.display.target == 'object' ? JSON.stringify(this.configDetails.display.target) : this.configDetails.display.target);
            if (this.isDebug) console.log('initConfigDetails: extracting tokens from target ', this.configDetails.display.targetJson);
            this.targetTokens = this.extractTokens(this.configDetails.display.targetJson);
            if (this.isDebug) console.log('initConfigDetails: all target tokens extracted');
        }
        if (this.configDetails?.display?.buttons) {
            this.configDetails.display.buttonsJson = (typeof this.configDetails.display.buttons == 'object' ? JSON.stringify(this.configDetails.display.buttons) : this.configDetails.display.buttons);
            if (this.isDebug) console.log('initConfigDetails: extracting tokens from buttons ', this.configDetails.display.buttonsJson);
            this.buttonsTokens = this.extractTokens(this.configDetails.display.buttonsJson);
            if (this.isDebug) console.log('initConfigDetails: all buttons tokens extracted');
        }

        // Initializing sort options
        if (this.configDetails?.display?.sort) {
            if (this.isDebug) console.log('initConfigDetails: initializing sort from sort property');
            this.configDetails.display.sort.forEach(item => {
                item.selected = false;
                item.up = true;
                item.ariaLabel = SORT_PREFIX + ' ' + item.label;
            });
        }
        else if (this.configDetails?.display?.type === 'Table') {
            if (this.isDebug) console.log('initConfigDetails: initializing from table properties');
            if (this.configDetails?.display?.columns) {
                if (this.isDebug) console.log('initConfigDetails: initializing sort from columns property');
                this.configDetails.display.sort = [];
                this.configDetails.display.columns.forEach(item => {
                    if (item.sortable) {
                        this.configDetails.display.sort.push({label: item.label,field: item.fieldName,selected: false,up: true});
                    }
                });
                if (this.configDetails.display.details) {
                    if (this.isDebug) console.log('initConfigDetails: complementing sort from details property');
                    this.configDetails.display.details.forEach(item => {
                        if (item.sortable) {
                            this.configDetails.display.sort.push({label: item.label,field: item.fieldName,selected: false,up: true});
                        }
                    });
                }
                if (this.configDetails.display.title?.sortable) {
                    if (this.configDetails.display.sort.some(item => item.field === this.configDetails.display.title.fieldName)) {
                        if (this.isDebug) console.log('initConfigDetails: title property already included');
                    }
                    else {
                        if (this.isDebug) console.log('initConfigDetails: complementing sort from title property');
                        this.configDetails.display.sort.push({
                            label: this.configDetails.display.title.label,
                            field: this.configDetails.display.title.fieldName,
                            selected: false,
                            up: true
                        });
                    }
                }
            }
        }

        // Forcing Card display on mobile
        if (this.isDebug) console.log('initConfigDetails: formfactor provided ',this.formfactor);
        if (this.formfactor === "Small") {
            if (this.isDebug) console.log('initConfigDetails: overriding configuration for mobile');
            this.configDetails.type = "Card"; 
        }
        else if ((this.isTable) && (this.configDetails.type !== 'DataTable') && (this.configDetails.type !== 'TreeGrid')) {
            if (this.isDebug) console.log('initConfigDetails: reworking table columns from display type ',this.configDetails.type);
            if ((this.configDetails.display.columns) && (this.configDetails.display.details)) {
                if (this.isDebug) console.log('initConfigDetails: registering detail fields as columns');
                this.configDetails.display.columns = this.configDetails.display.columns.concat(this.configDetails.display.details);;
            }
            if ((this.configDetails.display.menu) && (this.configDetails.display.columns)) {
                if (this.isDebug) console.log('initConfigDetails: registering menu column');
                this.configDetails.display.columns.push({
                    label: this.configDetails.display.menuLabel || '',
                    type: "action",
                    typeAttributes: {
                        label: this.configDetails.display.menuSelectLabel || '',
                        class: "slds-scrollable_none",
                        rowActions: this.configDetails.display.menu
                    }
                });
            }
        }

        if (this.isDebug) console.log('initConfigDetails: END with configDetails init ',JSON.stringify(this.configDetails));
    }

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

}