﻿angular.module('virtoCommerce.notificationsModule')
.controller('virtoCommerce.notificationsModule.editTemplateController', ['$rootScope', '$scope', '$timeout', '$localStorage', 'FileUploader', 'virtoCommerce.notificationsModule.notificationsService', 'platformWebApp.bladeNavigationService', 'platformWebApp.dialogService', 'platformWebApp.notifications', 
 function ($rootScope, $scope, $timeout, $localStorage, FileUploader, notificationsService, bladeNavigationService, dialogService, notifications) {
	$scope.setForm = function (form) { 
        $scope.formScope = form; 
    }
    

	var blade = $scope.blade;
	blade.updatePermission = 'platform:notification:update';
	var codemirrorEditor;
	blade.parametersForTemplate = [];
    var keyTemplateLocalStorage;
    var contentType = 'image';//blade.contentType.substr(0, 1).toUpperCase() + blade.contentType.substr(1, blade.contentType.length - 1);
    $scope.fileUploader = new FileUploader({
        url: 'api/platform/assets?folderUrl=cms-content/' + contentType + '/assets',
        headers: { Accept: 'application/json' },
        autoUpload: true,
        removeAfterUpload: true,
        onBeforeUploadItem: function (fileItem) {
            blade.isLoading = true;
        },
        onSuccessItem: function (fileItem, response, status, headers) {
            $scope.$broadcast('filesUploaded', { items: response });
        },
        onErrorItem: function (fileItem, response, status, headers) {
            bladeNavigationService.setError(fileItem._file.name + ' failed: ' + (response.message ? response.message : status), blade);
        },
        onCompleteAll: function () {
            blade.isLoading = false;
        }
    });
     
    function setTemplate(data) {
        data.notificationType = blade.notificationType;
        data.displayName = blade.displayName;
		data.objectId = blade.objectId;
		data.objectTypeId = blade.objectTypeId;
		blade.origEntity = _.clone(data);
		blade.currentEntity = data;
        blade.isLoading = false;
        if (!blade.templateId) {
            blade.isNew = true;    
        }
        
//		notifications.prepareTestData({ type: blade.notificationType }, function (data) {
//			blade.parametersForTemplate = data;
//			blade.isLoading = false;
//
//		}, function (error) {
//			bladeNavigationService.setError('Error ' + error.status, blade);
//		});
        keyTemplateLocalStorage = blade.objectTypeId + '.' + blade.notificationType;
        var itemFromLocalStorage = $localStorage[keyTemplateLocalStorage];
        
        if (itemFromLocalStorage) {
            blade.currentEntity.dynamicProperties = itemFromLocalStorage;
        }

		$timeout(function () {
			if (codemirrorEditor) {
				codemirrorEditor.refresh();
				codemirrorEditor.focus();
			}
			blade.origEntity = angular.copy(blade.currentEntity);
		}, 1);
	};

	blade.initialize = function () {
		blade.isLoading = true;
        //TODO
//		if (blade.templateId) {
//			notifications.getTemplateById({ id: blade.templateId }, function (data) {
//				setTemplate(data);
//			}, function (error) {
//				bladeNavigationService.setError('Error ' + error.status, blade);
//			});
//		}
//		else {
//			notifications.getTemplate({ type: blade.notificationType, objectId: blade.objectId, objectTypeId: blade.objectTypeId, language: blade.language }, function (data) {
//				setTemplate(data);
//			}, function (error) {
//				bladeNavigationService.setError('Error ' + error.status, blade);
//			});
//		}
        if (blade.templateId) {
            notificationsService.getTemplateById(blade.templateId).then(
                function(data){ setTemplate(data); }
            );
        }
        else {
            var data = { id: null, notificationType: null, objectId: null, objectTypeId: null, language: null};
            setTemplate(data);
        }
	};

	blade.updateTemplate = function () {
		blade.isLoading = true;
        if (!blade.currentEntity.language) {
            blade.currentEntity.language = 'default';
        }
        notificationsService.updateTemplate(blade.currentEntity).then(function(data) {
            blade.isLoading = false;
			blade.origEntity = _.clone(blade.currentEntity);
			if (!blade.isNew) {
				blade.parentBlade.initialize();
			}
			else {
				blade.isNew = false;
				if (!blade.isFirst) {
					blade.parentBlade.initialize();
					bladeNavigationService.closeBlade(blade);
				}
				else {
					blade.parentBlade.openList(blade.notificationType, blade.objectId, blade.objectTypeId);
				}
			}
        });
        //TODO
//		notifications.updateTemplate({}, blade.currentEntity, function () {
//			blade.isLoading = false;
//			blade.origEntity = _.clone(blade.currentEntity);
//			if (!blade.isNew) {
//				blade.parentBlade.initialize();
//			}
//			else {
//				blade.isNew = false;
//				if (!blade.isFirst) {
//					blade.parentBlade.initialize();
//					bladeNavigationService.closeBlade(blade);
//				}
//				else {
//					blade.parentBlade.openList(blade.notificationType, blade.objectId, blade.objectTypeId);
//				}
//			}
//		}, function (error) {
//			bladeNavigationService.setError('Error ' + error.status, blade);
//		});
        $localStorage[keyTemplateLocalStorage] = blade.currentEntity.dynamicProperties;
	};

	blade.testResolve = function () {
		var newBlade = {
			id: 'testResolve',
			title: 'notifications.blades.notifications-test-resolve.title',
			subtitle: 'notifications.blades.notifications-test-resolve.subtitle',
			subtitleValues: { type: blade.notificationType },
			notificationType: blade.notificationType,
			objectId: blade.objectId,
			objectTypeId: blade.objectTypeId,
			language: blade.currentEntity.language,
			controller: 'platformWebApp.testResolveController',
			template: '$(Platform)/Scripts/app/notifications/blades/notifications-test-resolve.tpl.html'
		};

		bladeNavigationService.showBlade(newBlade, blade);
	}

	blade.testSend = function () {
		var newBlade = {
			id: 'testSend',
			title: 'platform.blades.notifications-test-send.title',
			subtitle: 'platform.blades.notifications-test-send.subtitle',
			subtitleValues: { type: blade.notificationType },
			notificationType: blade.notificationType,
			objectId: blade.objectId,
			objectTypeId: blade.objectTypeId,
			language: blade.currentEntity.language,
			controller: 'platformWebApp.testSendController',
			template: '$(Platform)/Scripts/app/notifications/blades/notifications-test-send.tpl.html'
		};

		bladeNavigationService.showBlade(newBlade, blade);
	}

	blade.delete = function () {
		notifications.deleteTemplate({ id: blade.currentEntity.id }, function (data) {
			blade.parentBlade.initialize();
			bladeNavigationService.closeBlade(blade);
		}, function (error) {
			bladeNavigationService.setError('Error ' + error.status, blade);
		});
	}

	if (!blade.isNew) {
		$scope.blade.toolbarCommands = [
			{
				name: "platform.commands.save", icon: 'fa fa-save',
				executeMethod: blade.updateTemplate,
				canExecuteMethod: canSave
			},
			{
				name: "platform.commands.undo", icon: 'fa fa-undo',
				executeMethod: function () {
					blade.currentEntity = _.clone(blade.origEntity);
				},
				canExecuteMethod: isDirty
			},
//			{
//				name: "platform.commands.preview", icon: 'fa fa-eye',
//				executeMethod: function () {
//					blade.testResolve();
//				},
//				canExecuteMethod: function () {
//					return false;
//				},
//				permission: blade.updatePermission
//			},
//			{
//				name: "platform.commands.send", icon: 'fa fa-envelope',
//				executeMethod: blade.testSend,
//				canExecuteMethod: function () {
//					return true;
//				},
//				permission: blade.updatePermission
//			},
			{
				name: "platform.commands.set-active", icon: 'fa fa-pencil-square-o',
				executeMethod: function () {
					blade.currentEntity.isDefault = true;
					blade.updateTemplate();
				},
				canExecuteMethod: function () {
					if (angular.isUndefined(blade.currentEntity)) {
						return false;
					}
					return !blade.currentEntity.isDefault;
				},
				permission: blade.updatePermission
			},
			{
				name: "platform.commands.delete", icon: 'fa fa-trash-o',
				executeMethod: blade.delete,
				canExecuteMethod: function () { return true; },
				permission: 'platform:notification:delete'
			}
		];
	}
	else {
		$scope.blade.toolbarCommands = [
			{
				name: "platform.commands.create", icon: 'fa fa-save',
				executeMethod: blade.updateTemplate,
				canExecuteMethod: canSave,
				permission: 'platform:notification:create'
			}
		];
	}

	$scope.editorOptions = {
		lineWrapping: true,
		lineNumbers: true,
		parserfile: "liquid.js",
		extraKeys: { "Ctrl-Q": function (cm) { cm.foldCode(cm.getCursor()); } },
		foldGutter: true,
		gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		onLoad: function (_editor) {
			codemirrorEditor = _editor;
		},
		mode: "liquid-html"
	};

	function isDirty() {
        return (!angular.equals(blade.origEntity, blade.currentEntity) || blade.isNew) && blade.hasUpdatePermission();
	}

	function canSave() {
        return isDirty() && $scope.formScope && $scope.formScope.$valid;
	}

	blade.onClose = function (closeCallback) {
		bladeNavigationService.showConfirmationIfNeeded(isDirty(), canSave(), blade, blade.updateTemplate, closeCallback, "platform.dialogs.notification-template-save.title", "platform.dialogs.notification-template-save.message");
	};

	blade.headIcon = 'fa-envelope';

	blade.initialize();
}]);
