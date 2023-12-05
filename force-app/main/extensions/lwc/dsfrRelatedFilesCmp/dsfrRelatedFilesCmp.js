import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import basePathName from '@salesforce/community/basePath';

import unlinkFile from '@salesforce/apex/dsfrFileUpload_CTL.unlinkFile';
import sfpegJsonUtl from 'c/sfpegJsonUtl';

import DOWNLOAD_TITLE   from '@salesforce/label/c.dsfrRelatedFilesDownloadTitle';
import SORT_TITLE       from '@salesforce/label/c.dsfrRelatedFilesSortTitle';
import SORT_DEFAULT     from '@salesforce/label/c.dsfrRelatedFilesSortDefault';
import SORT_PREFIX      from '@salesforce/label/c.dsfrRelatedFilesSortPrefix';
import REFRESH_TITLE    from '@salesforce/label/c.dsfrRelatedFilesRefreshTitle';
import UPLOAD_TITLE     from '@salesforce/label/c.dsfrRelatedFilesUploadTitle';
import DELETE_TITLE     from '@salesforce/label/c.dsfrRelatedFilesDeleteTitle';
import UPLOAD_TYPES     from '@salesforce/label/c.dsfrFileUploadTypes';

export default class DsfrRelatedFilesCmp extends NavigationMixin(LightningElement)  {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api label;
    @api tag;
    @api configName;
    @api accept;
    @api countDisplay = 'hide';
    @api showUpload = false;
    @api showDelete = false;
    @api disabled = false;
    @api showRefresh = false;

    _listContext;
    @api 
    get listContext() {
        return this._listContext;
    }
    set listContext(value) {
        let listContext;
        try {
            if (this.isDebug) console.log('set listContext: value provided ', JSON.stringify(value));
            listContext = JSON.parse(value);
            if (this.isDebug) console.log('set listContext: value parsed ', JSON.stringify(listContext));
        }
        catch(error) {
            console.warn('set listContext: value parsing failed ', error);
            this._listContext = null;
            return;
        }
        this._listContext = listContext;
        if (this.isDebug) console.log('set listContext: value set ', JSON.stringify(this._listContext));
    }
    @api wrappingClass;

    @api isDebug = false;

    //-----------------------------------------------------
    // Context parameters
    //-----------------------------------------------------
    @api objectApiName;
    @api recordId;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    fileList;
    configDetails;

    isReady = false;

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    sortTitle       = SORT_TITLE;
    refreshTitle    = REFRESH_TITLE;
    downloadTitle   = DOWNLOAD_TITLE;
    uploadTitle     = UPLOAD_TITLE;
    deleteTitle     = DELETE_TITLE;
    
    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------
    get listTitle() {
        switch (this.countDisplay) {
            case 'left': 
                return '' + (this.fileList?.length || 0) + ' ' + this.label;
            case 'right': 
                return this.label + ' ('+ (this.fileList?.length || 0) + ')';
            default:
                return this.label;
        }
    }
    get hasSort() {
        return (this.configDetails?.sort || false);
    }
    get currentSort() {
        if (this.isDebug) console.log('currentSort: START');
        
        let currentSort = this.configDetails.sort.find(item => {return item.selected;});
        if (this.isDebug) console.log('currentSort: currentSort found ',JSON.stringify(currentSort));
        if (currentSort) {
            if (this.isDebug) console.log('currentSort: END / returning current ');
            return {label: SORT_PREFIX + ' ' + currentSort.label, class: (currentSort.up ? 'fr-icon-arrow-up-line': 'fr-icon-arrow-down-line')};
        }
        if (this.isDebug) console.log('currentSort: END / returning default ');
        return {label: SORT_DEFAULT};
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for related files', this.label);
            console.log('connected: configName ', this.configName);
            console.log('connected: listContext ', this.listContext);
            console.log('connected: objectApiName ', this.objectApiName);
            console.log('connected: recordId ', this.recordId);
            console.log('connected: userId ', this.userId);
            console.log('connected: showUpload? ', this.showUpload);
            console.log('connected: showDelete? ', this.showDelete);
        }

        this.accept = this.accept || UPLOAD_TYPES;
        this.tag = this.tag || this.label || 'Undefined';
        if (this.isDebug) {
            console.log('connected: tag evaluated ', this.tag);
            console.log('connected: accept evaluated ', this.accept);
            console.log('connected: END for related files');
        }
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleRecordLoad(event) {
        if (this.isDebug) console.log('handleRecordLoad: START for related files',event);

        // Config Details Initialization
        if (!this.configDetails) {
            let listCmp = this.template.querySelector('c-sfpeg-list-cmp');
            if (this.isDebug) console.log('handleRecordLoad: fetching listCmp ',listCmp);

            if (this.isDebug) console.log('handleRecordLoad: list configuration available ',JSON.stringify(listCmp.configuration));
            this.configDetails =  listCmp.configuration?.display || {};
            if (this.isDebug) console.log('handleRecordLoad: initial configDetails set ',JSON.stringify(this.configDetails));
            
            if (!this.configDetails.isReady) {
                if (this.isDebug) console.log('handleRecordLoad: initialising configDetails');
            
                if (!this.configDetails.linkId) {
                    this.configDetails.linkId = ['Id'];
                }
                else if (typeof this.configDetails.linkId === 'string') {
                    this.configDetails.linkId = (this.configDetails.linkId).split('.');
                }

                if (!this.configDetails.contentId) {
                    this.configDetails.contentId = ['ContentDocumentId'];
                }
                else if (typeof this.configDetails.contentId === 'string') {
                    this.configDetails.contentId = (this.configDetails.contentId).split('.');
                }
                
                if (!this.configDetails.title) {
                    this.configDetails.title = ['ContentDocument','Title'];
                }
                else if (typeof this.configDetails.title === 'string') {
                    this.configDetails.title = (this.configDetails.title).split('.');
                }

                if (!this.configDetails.details) {
                    this.configDetails.details = [{value:['ContentDocument','FileType']},{value:['ContentDocument','ContentSize'],suffix:'octets'}];
                }
                else {
                    (this.configDetails.details).forEach( detailIter => {
                        if (this.isDebug) console.log('handleRecordLoad: analysing detail item ', JSON.stringify(detailIter));
                        if (typeof detailIter.value === 'string') {
                            if (this.isDebug) console.log('handleRecordLoad: splitting detail value ', detailIter.value);
                            detailIter.value = (detailIter.value).split('.');
                            if (this.isDebug) console.log('handleRecordLoad: detail value init ', detailIter.value);
                        }
                    });
                }

                if (this.configDetails.sort) {
                    (this.configDetails.sort).forEach( sortIter => {
                        if (this.isDebug) console.log('handleRecordLoad: analysing sort item ', JSON.stringify(sortIter));
                        if (typeof sortIter.field === 'string') {
                            if (this.isDebug) console.log('handleRecordLoad: splitting field value ', sortIter.field);
                            sortIter.fieldParts = (sortIter.field).split('.');
                            if (this.isDebug) console.log('handleRecordLoad: field parts init ', sortIter.fieldParts);
                        }
                        else if (typeof sortIter.field === 'object') {
                            if (this.isDebug) console.log('handleRecordLoad: merging field parts ', sortIter.field);
                            sortIter.fieldParts = (sortIter.field);
                            sortIter.field = sortIter.fieldParts.join('.');
                            if (this.isDebug) console.log('handleRecordLoad: field init ', sortIter.field);
                        }
                    });
                }

                this.configDetails.isReady = true;
                if (this.isDebug) console.log('handleRecordLoad: configDetails init ',JSON.stringify(this.configDetails));
            }
        }

        // Displayed File List Init
        let baseRecordList =  event.detail;
        if (this.isDebug) console.log('handleRecordLoad: list loaded ',JSON.stringify(event.detail));

        let targetRecordList = [];
        if (baseRecordList) {
            if (this.isDebug) console.log('handleRecordLoad: processing list');

            baseRecordList.forEach(item => {
                if (this.isDebug) console.log('handleRecordLoad: processing row ',JSON.stringify(item));
                let newItem = {
                    title: this.getValue(this.configDetails.title,item) || '???',
                    linkId: this.getValue(this.configDetails.linkId,item) || '???',
                    contentId: this.getValue(this.configDetails.contentId,item) || '???',
                    details: []
                };
                if (this.isDebug) console.log('handleRecordLoad: newItem init ',JSON.stringify(newItem));
                (this.configDetails.details).forEach(detailItem => {
                    if (this.isDebug) console.log('handleRecordLoad: processing detailItem ',JSON.stringify(detailItem));
                    let newItemDetail = {... detailItem};
                    newItemDetail.value = this.getValue(detailItem.value,item);
                    if (newItemDetail.value) {
                        newItem.details.push(newItemDetail);
                    }
                });
                if (newItem.details.length == 0) {
                    delete newItem.details;
                    newItem.class="fr-download noPadding";
                }
                else {
                    newItem.class="fr-download";
                }

                if (this.configDetails.sort) {
                    if (this.isDebug) console.log('handleRecordLoad: copying sort field values');
                    this.configDetails.sort.forEach(itemSort => {
                        if (this.isDebug) console.log('handleRecordLoad: processing sort item ',itemSort.field);
                        let itemSortTgt = '_' + itemSort.field;
                        let itemSortValue = this.getValue(itemSort.fieldParts,item);
                        if (this.isDebug) console.log('handleRecordLoad: value ',itemSortValue);
                        if (itemSortValue != null) {
                            if (this.isDebug) console.log('handleRecordLoad: registered as ',itemSortTgt);
                            newItem[itemSortTgt] = itemSortValue;
                        }
                        else {
                            if (this.isDebug) console.log('handleRecordLoad: ignored as ',itemSortTgt);
                        }
                    });
                    if (this.isDebug) console.log('handleRecordLoad: newItem init ',JSON.stringify(newItem));
                }

                if (this.isDebug) console.log('handleRecordLoad: newItem init ',JSON.stringify(newItem));
                targetRecordList.push(newItem);
            });
        }

        this.fileList =  targetRecordList;
        if (this.isDebug) console.log('handleRecordLoad: file list registered',JSON.stringify(this.fileList));

        this.isReady = true;
        if (this.isDebug) console.log('handleRecordLoad: END for related files');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------

    handleDownload(event){
        if (this.isDebug) console.log('handleDownload: START',event);
        event.preventDefault();

        if (this.isDebug) console.log('handleDownload: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_button_click',params:{event_source:'dsfrRelatedFilesCmp', event_site: basePathName, event_category:'file_download',event_label:this.tag}}}));
        
        let fileId = event.srcElement?.name;
        if (this.isDebug) console.log('handleDownload: fileId determined ', fileId);

        /*let pageRef = {
            type: 'standard__webPage',
            attributes: {
                url: '/sfc/servlet.shepherd/document/download/' + fileId //+ '?operationContext=S1'
            }
        };
        if (this.isDebug) console.log('handleDownload: opening pageRef ', JSON.stringify(pageRef));

        this[NavigationMixin.Navigate](pageRef, false);*/

        let pageRef = '/sfc/servlet.shepherd/document/download/' + fileId;
        if (this.isDebug) console.log('handleDownload: opening pageRef ', pageRef);
        window.open(pageRef,'_blank');

        if (this.isDebug) console.log('handleDownload: END');
    }

    handleUnlink(event){
        if (this.isDebug) console.log('handleUnlink: START',event);
        event.preventDefault();

        if (this.isDebug) console.log('handleDownload: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_submit',params:{event_source:'dsfrRelatedFilesCmp', event_site: basePathName, event_category:'unlink_file',event_label:this.tag}}}));
        
        let spinner = this.template.querySelector('lightning-spinner');
        if (this.isDebug) console.log('handleUnlink: spinner found',spinner);
        if (spinner) {
            if (this.isDebug) console.log('handleUnlink: showing spinner');
            spinner.classList.remove('slds-hide');
        }

        let linkId = event.srcElement?.name;
        if (this.isDebug) console.log('handleUnlink: linkId determined ', linkId);

        unlinkFile({linkId: linkId})
        .then(() => {
            if (this.isDebug) console.log('handleUnlink: file unlinked');

            if (this.isDebug) console.log('handleDownload: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_success',params:{event_source:'dsfrRelatedFilesCmp', event_site: basePathName, event_category:'unlink_file',event_label:this.tag}}}));
        
            let listCmp = this.template.querySelector("c-sfpeg-list-cmp");
            if (this.isDebug) console.log('handleUnlink: listCmp fetched',listCmp);
            listCmp.doRefresh();
            if (this.isDebug) console.log('handleUnlink: file list refresh triggered');

            if (this.recordId) {
                if (this.isDebug) console.log('handleUnlink: triggering record data reload ',this.recordId);
                notifyRecordUpdateAvailable([{recordId: this.recordId}]);
            }

            if (spinner) {
                if (this.isDebug) console.log('handleUnlink: hiding spinner');
                spinner.classList.add('slds-hide');
            }
            if (this.isDebug) console.log('handleUnlink: END');
        })
        .catch(error => {
            if (this.isDebug) console.log('handleDownload: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_error',params:{event_source:'dsfrRelatedFilesCmp', event_site: basePathName, event_category:'unlink_file',event_label:this.tag}}}));
        
            console.warn('handleUnlink: END KO / file unlink failed ', JSON.stringify(error));
            if (spinner) {
                if (this.isDebug) console.log('handleUnlink: hiding spinner');
                spinner.classList.add('slds-hide');
            }
            let popupUtil = this.template.querySelector('c-dsfr-alert-popup-dsp');
            if (this.isDebug) console.log('handleUnlink: popupUtil fetched ', popupUtil);

            let alertConfig = {alerts:[],size:'small'};
            alertConfig.alerts.push({type:'error', message: (error.body?.message || error.statusText)});

            popupUtil.showAlert(alertConfig).then(() => {
                if (this.isDebug) console.log('handleUnlink: END for RelatedFile / popup closed');
            });
        });
        if (this.isDebug) console.log('handleUnlink: unlink triggered');
    }

    // @TODO finalise new version upload
    triggerUpload(event){
        if (this.isDebug) console.log('triggerUpload: START from RelatedFiles',event);
        event.preventDefault();

        if (this.isDebug) console.log('triggerUpload: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_button_click',params:{event_source:'dsfrRelatedFilesCmp', event_site: basePathName, event_category:'upload_version',event_label:this.tag}}}));
        
        let linkId = event.srcElement?.name;
        if (this.isDebug) console.log('triggerUpload: linkId determined ', linkId);

        let fileCmp = this.template.querySelector('c-dsfr-file-upload-cmp[data-name="' +  linkId +'"]');
        if (this.isDebug) console.log('triggerUpload: file upload found',fileCmp);

        if (fileCmp) {
            if (this.isDebug) console.log('triggerUpload: triggering file upload');
            fileCmp.doUpload();
        }
        if (this.isDebug) console.log('triggerUpload: END from RelatedFiles');
    }

    handleUpload(event){
        if (this.isDebug) console.log('handleUpload: START for RelatedFile');
        if (this.isDebug) console.log('handleUpload: event detail received ',JSON.stringify(event.detail));

        let popupUtil = this.template.querySelector('c-dsfr-alert-popup-dsp');
        if (this.isDebug) console.log('handleUpload: popupUtil fetched ', popupUtil);
        popupUtil.showAlert(event.detail).then(() => {
            if (this.isDebug) console.log('handleUpload: END for RelatedFile / popup closed');
        });

        if (this.isDebug) console.log('handleUpload: opening alert popup');
    }

    handleRefresh(event){
        if (this.isDebug) console.log('handleRefresh: START',event);
        event.preventDefault();
        let listCmp = this.template.querySelector("c-sfpeg-list-cmp");
        if (this.isDebug) console.log('handleRefresh: listCmp fetched',listCmp);
        listCmp.doRefresh();
        if (this.isDebug) console.log('handleRefresh: END file list refresh triggered');
    }

    toggleSort(event) {
        if (this.isDebug) console.log('toggleSort: START for related files',event);
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

        if (this.isDebug) console.log('toggleSort: END for for related files');
    }

    selectSort(event){
        if (this.isDebug) console.log('selectSort: START for related files',event);
        event.stopPropagation();
        event.preventDefault();

        const selectedLink = event.target.dataset.name;
        if (this.isDebug) console.log('selectSort: selectedLink identified ',selectedLink);

        let selectedSort;
        this.configDetails.sort.forEach(item => {
            if (this.isDebug) console.log('selectSort: processing sort option ',JSON.stringify(item));
            if (item.field != selectedLink) {
                item.selected = false;
                item.up = true;
            }
            else {
                if (item.selected) {
                    if (this.isDebug) console.log('selectSort: inverting current sort direction ');
                    item.up = !item.up;
                }
                else {
                    if (this.isDebug) console.log('selectSort: selecting new sorting field ');
                    item.selected = true;
                    item.up = true;
                }
                selectedSort = item;
            }
        });
        if (this.isDebug) console.log('selectSort: sorting entries updated ',JSON.stringify(this.configDetails.sort));
       
        this.toggleSort(event);

        if (selectedSort) {
            if (this.isDebug) console.log('selectSort: sorting by ',JSON.stringify(selectedSort));
            let results2sort = [...this.fileList];
            if (this.isDebug) console.log('selectSort: results2sort init ', JSON.stringify(results2sort));
            if (this.isDebug) console.log('selectSort: sort by field ', ('_' + selectedSort.field));
            if (this.isDebug) console.log('selectSort: revers sorting? ', !selectedSort.up);
            sfpegJsonUtl.sfpegJsonUtl.isDebug = this.isDebug;
            results2sort.sort(sfpegJsonUtl.sfpegJsonUtl.sortBy(('_' + selectedSort.field), !selectedSort.up));
            if (this.isDebug) console.log('handleSort: results2sort sorted ',results2sort);
            this.fileList = results2sort;
            if (this.isDebug) console.log('selectSort: fileList sorted ',JSON.stringify(this.fileList));
        }
        else {
            console.warn('selectSort: no selected sorting field');
        }
        
        if (this.isDebug) console.log('selectSort: END for related files');        
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------

    getValue = function(fieldPath,data) {
        if (this.isDebug) console.log('getValue: START for ',fieldPath);        
        let fieldValue = data;
        fieldPath.forEach(iter => {
            fieldValue = fieldValue[iter];
        });
        if (this.isDebug) console.log('getValue: END with ',fieldValue);        
        return fieldValue;
    }
}