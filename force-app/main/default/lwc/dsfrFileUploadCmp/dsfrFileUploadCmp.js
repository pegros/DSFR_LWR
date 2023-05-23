import { LightningElement, api } from 'lwc';
import uploadFile from '@salesforce/apex/dsfrFileUpload_CTL.uploadFile';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';

export default class DsfrFileUploadCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api label = 'Charger un fichier';
    @api comment = 'Taille maximale : 500 Mo. Formats supportés : jpg, png, pdf. Plusieurs fichiers possibles.';
    @api accept;
    @api contentMeta;
    @api shareMode = 'V';
    @api disabled = false;
    @api wrappingClass;

    @api recordId;
    @api recordIds;
    @api fileId;

    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    message;
    isError = false;

    fileName;
    fileContent;

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------

    get mainClass() {
        return (this.wrappingClass || '') + (this.isError ? ' fr-upload-group fr-input-group--error' : ' fr-upload-group');
    }
    get messageClass() {
        return (this.isError ? 'fr-error-text' : 'fr-valid-text');
    }
    
    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START file upload');
            console.log('connected: label ',this.label);
            console.log('connected: comment ',this.comment);
            console.log('connected: accept ',this.accept);
            console.log('connected: content version metadata ',this.contentMeta);
            console.log('connected: disabled ', this.disabled);
            console.log('connected: END file upload');
        }
    }

    //-----------------------------------------------------
    // Event handlers
    //-----------------------------------------------------
    handleUpload(event) {
        if (this.isDebug) console.log('handleUpload: START file upload',event);

        let fileInput = this.template.querySelector('input.fr-upload');
        
        if (this.isDebug) console.log('handleUpload: files selected ',fileInput.files);
        const selectedFile = fileInput.files[0];
        if (this.isDebug) console.log('handleUpload: file selected ',selectedFile);

        if (!selectedFile) {
            if (this.isDebug) console.log('handleUpload: END / no file selected');
            fileInput.disabled = false;
            return;
        }
        if (this.isDebug) console.log('handleUpload: disabling fileInput ',fileInput);
        fileInput.disabled = true;

        this.fileName = selectedFile.name;
        if (this.isDebug) console.log('handleUpload: fileName registered ',this.fileName);

        let fileReader = new FileReader()
        fileReader.onload = () => {
            if (this.isDebug) console.log('handleUpload: file content loaded',fileReader.result);
            this.fileContent = fileReader.result.split(',')[1];
            if (this.isDebug) console.log('handleUpload: fileContent extracted ', this.fileContent);
            this.registerFile();
            if (this.isDebug) console.log('handleUpload: END file registration requested');
        }
        if (this.isDebug) console.log('handleUpload: fileReader prepared',fileReader);
        fileReader.readAsDataURL(selectedFile)
        if (this.isDebug) console.log('handleUpload: file Content load triggered');
    }

    registerFile() {
        if (this.isDebug) console.log('registerFile: START');

        try {
            let recordIds = [];
            if (this.recordId) {
                if (this.isDebug) console.log('registerFile: registering main recordId ',this.recordId);
                recordIds.push(this.recordId);
            }
            if (this.recordIds) {
                if (this.isDebug) console.log('registerFile: registering other recordIds ',this.recordIds);
                let otherIDs = JSON.parse(this.recordIds);
                recordIds.push(...otherIDs);
            }
            if (this.isDebug) console.log('registerFile: recordIds init ',recordIds);

            const uploadData = {
                name: this.fileName,
                content: this.fileContent,
                recordIds: recordIds,
                meta: JSON.parse(this.contentMeta),
                sharing: this.shareMode
            };
            if (this.isDebug) console.log('registerFile: uploadData prepared ', JSON.stringify(uploadData));
            uploadFile(uploadData).then(result => {
                if (this.isDebug) console.log('registerFile: file registered as ', JSON.stringify(result));
                this.fileContent = null;
                this.message =  this.fileName + ' file uploaded successfully!';
                this.isError =  false;

                if (recordIds && recordIds.length > 0) {
                    if (this.isDebug) console.log('handleUpload: handling record data reload ',recordIds);
                    let recordIdList = [];
                    recordIds.forEach(item => {recordIdList.push({recordId: item})});
                    if (this.isDebug) console.log('handleUpload: triggering reload on recordIdList ',recordIdList);
                    notifyRecordUpdateAvailable(recordIdList);
                }
                
                let fileInput = this.template.querySelector('input.fr-upload');
                if (this.isDebug) console.log('handleUpload: reactivating fileInput ',fileInput);
                fileInput.disabled = false;

                if (this.isDebug) console.log('registerFile: END');
            }).catch(error => {
                console.warn('registerFile: upload failed',error);
                let fileInput = this.template.querySelector('input.fr-upload');
                if (this.isDebug) console.log('handleUpload: reactivating fileInput ',fileInput);
                fileInput.disabled = false;
                console.warn('registerFile: END KO / upload failed ',error);
                this.message = JSON.stringify(error);
                this.isError = true;
            });
            if (this.isDebug) console.log('registerFile: upload triggered');
        }
        catch (error) {
            let fileInput = this.template.querySelector('input.fr-upload');
            if (this.isDebug) console.log('registerFile: reactivating fileInput ',fileInput);
            fileInput.disabled = false;
            console.warn('registerFile: END KO / upload failed ',error);
            this.message = JSON.stringify(error);
            this.isError = true;
        }
    }
}