/*
	© 2016 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard.Module.Shipmethod
define(
	'OrderWizard.Module.ShowShipments'
,	[	'Wizard.Module'
	,	'Address.Details.View'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'ItemViews.Cell.Navigable.View'

	,	'order_wizard_showshipments_module.tpl'

	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		WizardModule
	,	AddressDetailsView
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	ItemViewsCellNavigableView

	,	order_wizard_showshipments_module_tpl

	,	_
	,	jQuery
	)
{
	'use strict';

	//@class OrderWizard.Module.ShowShipments @extends Wizard.Module
	return WizardModule.extend({

		//@property {Function} template
		template: order_wizard_showshipments_module_tpl

		//@property {Array} errors
	,	errors: ['ERR_NOT_SET_SHIPPING_METHODS', 'ERR_NOT_SET_SHIPPING_ADDRESS']

	,	shipMethodIsRequire: {
			errorMessage: _('Please select a delivery method').translate()
		,	errorCode: 'ERR_NOT_SET_SHIPPING_METHODS'
		}

	,	shipAddressIsRequire: {
			errorMessage: _('Please select a shipping address').translate()
		,	errorCode: 'ERR_NOT_SET_SHIPPING_ADDRESS'
		}

		//@property {Object} events
	,	events: {
			'change [data-action="change-delivery-options"]': 'changeDeliveryOptions'
		}

	,	initialize: function ()
		{
			WizardModule.prototype.initialize.apply(this, arguments);

			this.application = this.wizard.application;
			this.options.application = this.wizard.application;

			this.addressSource = this.options.useModelAddresses ? this.model.get('addresses') : this.wizard.options.profile.get('addresses');
			
			BackboneCompositeView.add(this);

			this.wizard.model.on('ismultishiptoUpdated', this.render, this);
			this.wizard.model.on('promocodeUpdated', this.render, this);			
		}

		//@method isActive
		//@return {Boolean}
	,	isActive: function ()
		{
			return !this.model.get('ismultishipto');
		}

	,	isValid: function ()
		{
			if (this.model.shippingAddressIsRequired())
			{
				if (!this.model.get('shipmethod'))
				{
					return jQuery.Deferred().reject(this.shipMethodIsRequire);
				}
				else if (!this.model.get('shipaddress'))
				{
					return jQuery.Deferred().reject(this.shipAddressIsRequire);
				}
			}

			return jQuery.Deferred().resolve();
		}

		//@method changeDeliveryOptions
	,	changeDeliveryOptions: function (e)
		{
			var value = this.$(e.target).val()
			,	self = this;

			this.model.set('shipmethod', value);
			this.step.disableNavButtons();
			this.model.save().always(function ()
			{
				self.render();
				self.step.enableNavButtons();
			});
		}

		//@property {Object} childViews
	,	childViews: {
				'Shipping.Address': function ()
				{
					return new AddressDetailsView({
							hideActions: true
						,	hideDefaults: true
						,	manage: 'shipaddress'
						,	model: this.addressSource.get(this.model.get('shipaddress'))
					});
				}
		}

		//@method getContext
		//@returns {OrderWizard.Module.ShowShipments.Context}
	,	getContext: function ()
		{
			var self = this
			,	selected_shipmethod = this.model.get('shipmethods').findWhere({internalid: this.model.get('shipmethod')})
			,	shipping_methods = this.model.get('shipmethods').map(function (shipmethod)
				{
					return {
							name: shipmethod.get('name')
						,	rate_formatted: shipmethod.get('rate_formatted')
						,	internalid: shipmethod.get('internalid')
						,	isActive: shipmethod.get('internalid') === self.model.get('shipmethod')
					};
				});

			//@class OrderWizard.Module.ShowShipments.Context
			return {
					//@property {LiveOrder.Model} model
					model: this.model
					//@property {Boolean} showShippingInformation Indicate if the shipmethod select should be shown or not. Used when in SST all items are non shippable
				,	showShippingInformation: !!this.model.shippingAddressIsRequired()
					//@property {Boolean} showShippingAddress
				,	showShippingAddress: !!this.addressSource.get(this.model.get('shipaddress'))
					//@property {String} editUrl
				,	editUrl: this.options.edit_url
					//@property {Boolean} showEditButton
				,	showEditButton: !!this.options.edit_url
					//@property {Boolean}
				,	showSelectedShipmethod: !!selected_shipmethod
					//@property {Object} selectedShipmethod
				,	selectedShipmethod: selected_shipmethod
					//@property {Array} shippingMethods
				,	shippingMethods: shipping_methods
					//@property {Boolean} showShippingMetod
				,	showShippingMetod: !this.options.hideShippingMethod
			};
		}
	});
});