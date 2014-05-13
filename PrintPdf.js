"use strict";
 var printPdf = (function($, customProp){
	var self = this || {};
	var defaultProp = {debug : false};
	
	var prop = $.extend({}, defaultProp, customProp);
	
	var defaultPrintOptions = { autoPrint : false, pdfFile : null, previewDiv : null, closePreviewOnPrint : false};

	self.printIt = function(opt){
		var printOptions = $.extend({}, defaultPrintOptions, opt);
		
		if (printOptions.autoPrint){
			printOptions.previewDiv = null;
			printOptions.closePreviewOnPrint = true;
		}
		
		var document = self.injectPdf(printOptions);
	}

	self.injectPdf = function(printOptions){
		var printParentElement = null;
		if (printOptions.autoPrint){
			//quick shortcut to generate random div id
			printOptions.previewDiv = 'print-preview_' + Math.random().toString(36).substring(3);
			printParentElement = document.createElement('div');
			printParentElement.className = 'pdfPrinter-autoprint-container';
			printParentElement.id = printOptions.previewDiv;
			document.body.appendChild(printParentElement);
		}
		else{
			printParentElement = document.getElementById(printOptions.previewDiv);
		}
		printOptions.printParentElement = printParentElement;
		
		var printerIsSet = printParentElement.getAttribute('data-printer-set');
		if(printerIsSet == 'true')
			return;
		
		printParentElement.setAttribute('data-printer-set', true);
		
		var printContainer = document.createElement('div');
		printContainer.id = 'pdfPrinter-container' + printOptions.previewDiv;
		printContainer.className = 'pdfPrinter-container';
		printParentElement.appendChild(printContainer)
		
		printOptions.printContainer = printContainer;
		//This has to be worked out, since some older IE's work better with embed.
		if (false){//we want embed
			var pdfDocument = document.createElement('embed');
			pdfDocument.src = printOptions.pdfFile;
			pdfDocument.id = 'pdfDocument_' + printOptions.previewDiv;
			printContainer.appendChild(pdfDocument)
			return pdfDocument;
		}else{//iframe
			var pdfDocument = document.createElement('iframe');
			printOptions.pdfDocument = pdfDocument;	
			printOptions.clasName = 'highlight';	
			pdfDocument.id = 'pdfDocument_' + printOptions.previewDiv;
			
			//if autoprint is enabled we will have to wait on the load event to call the print, after which we need to trigger a remove of the element
			if (printOptions.autoPrint){
				(function(self, printOptions){
					$(printOptions.pdfDocument).on('load', function(){
						if (printOptions.autoPrint){
							printOptions.pdfDocument.contentWindow.print();
							(function(self, printOptions){
								self.removePrintable(printOptions);
							})(self, printOptions);
						}
					});
				})(self, printOptions);
			}
			
			pdfDocument.src = printOptions.pdfFile;
			printContainer.appendChild(pdfDocument);
			
			var toolbar = document.createElement('div');
			toolbar.id = 'pdfPrinter-toolbar_' + printOptions.previewDiv;
			toolbar.className = 'pdfPrinter-toolbar btn-group';
			printContainer.appendChild(toolbar);
			
			
			var printBtn = document.createElement('button');
			printBtn.id = 'pdfPrinter-print_' + printOptions.previewDiv;
			printBtn.className = 'pdfPrinter-printBtn btn btn-default';
			printBtn.innerHTML = 'Print';
			
			(function(self, printOptions){
				printBtn.onclick = function(){
					printOptions.pdfDocument.contentWindow.print();
					self.hidePrintable(printOptions);
					(function(self, printOptions){
						self.removePrintable(printOptions);
					})(self, printOptions);
				};
			})(self, printOptions);
			
			toolbar.appendChild(printBtn);
			
			var closePrintBtn = document.createElement('button');
			closePrintBtn.id = 'pdfPrinter-closePrint_' + printOptions.previewDiv;
			closePrintBtn.className = 'pdfPrinter-closePrintBtn btn btn-default';
			closePrintBtn.innerHTML = 'Close';
		
			(function(self, printOptions){
				closePrintBtn.onclick = function(){
					self.removePrintable(printOptions);
				};
			})(self, printOptions);
		
			toolbar.appendChild(closePrintBtn);
			
			return pdfDocument;
		}
	}
	
	self.removePrintable = function(printOptions){
		printOptions.printParentElement.removeChild(printOptions.printContainer);
		printOptions.printParentElement.setAttribute('data-printer-set', false);
		if (printOptions.autoPrint){
			printOptions.printParentElement.parentNode.removeChild(printOptions.printParentElement);
		}
	}
	
	self.hidePrintable = function(printOptions){
		printOptions.printContainer.style.display = 'none';
		printOptions.printParentElement.setAttribute('data-printer-set', false);
		if (printOptions.autoPrint){
			printOptions.printParentElement.style.display = 'node';
		}
	}
	
	//Set this to a separate obj so we can attach debug var's only if debug is true
	self.returnObj = {
		print : function(opt){
			self.printIt(opt);
		},
		enableDebug:function(){
			//Careful bc this is technically a recursive obj ref
			self.returnObj.self = self;
			return self.returnObj;
		}
	};
	
	
	
	if (prop.debug){
		returnObj.self = self;
	}
	
	return self.returnObj;
	
})(jQuery);