/**
 * ButtonColumn extension
 *
 * @author    Chris Ramakers
 * @copyright (c) 2011, by Inventis BVBA
 * @date      8 march 2011
 * @version   $Id$
 *
 * @license ButtonColumn.js is licensed under the terms of the Open Source
 * LGPL 3.0 license. Commercial use is permitted to the extent that the 
 * code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 * 
 * License details: http://www.gnu.org/licenses/lgpl.html
 *
 * @class Ext.ux.grid.ButtonColumn
 * @extends Ext.grid.Column
 */
Ext.ns('Ext.ux.grid');

// Required overrides for buttoncolumn to work
Ext.grid.GridView.prototype.rowSelectorDepth  = 20;
Ext.grid.GridView.prototype.cellSelectorDepth = 10;

Ext.ux.grid.ButtonColumn = Ext.extend(Ext.grid.Column, {

    header: '&#160;',
    menuDisabled: true,
    
    buttons: new Ext.util.MixedCollection(),

    constructor: function(cfg) {
        var me = this,
            items = cfg.items || (me.items = [me]),
            l = items.length,
            i,
            itemId,
            item;

        Ext.ux.grid.ButtonColumn.superclass.constructor.call(me, cfg);
        
        me.renderer = function(value, meta, record){

            meta.css += 'x-button-col-cell';

            v = Ext.isFunction(cfg.renderer) ? cfg.renderer.apply(this, arguments)||'' : '';
            
            for (i = 0; i < l; i++) {
                
                item = items[i];
                
                itemId = Ext.id();
                placeholderId = itemId + '-placeholder';
                
                v += String.format('<span id="{0}-placeholder" style="height:22px; display: block; float:left"></span>', itemId);
                
                Ext.lib.Event.onAvailable(placeholderId, this.addButton.createDelegate(this, [itemId, item, record]));
                
            }
            
            return v;
        }
    },
    
    addButton: function(itemId, item, record){
        
        var config = Ext.apply({
            renderTo: itemId + '-placeholder',
            handler: Ext.emptyFn,
            id: itemId
        }, item);
        
        // Detach handler and add it as an handler alias so the button click is not triggered
        // but the handler function is triggered manually in the processEvent method
        config.buttonColumnHandler = config.handler;
        config.handler = Ext.emptyFn;
        
        // Add button to the internal button storage
        var button = new Ext.Button(config);
        this.buttons.add(itemId, button);
        
        if(Ext.isFunction(config.afteradd)) {
            config.afteradd.apply(button, [button, record]);
        }
        
    },
    
    destroy: function() {
        delete this.items;
        delete this.renderer;
        return Ext.ux.grid.ButtonColumn.superclass.destroy.apply(this, arguments);
    },

    processEvent : function(name, e, grid, rowIndex, colIndex){
        var t = Ext.get(e.getTarget()),
            p = t.findParent('table.x-btn'),
            itemIndex,
            item,
            fn;
        
        itemIndex = p.id;
        item = this.buttons.get(itemIndex);
        handler = item.buttonColumnHandler;
    
        if (p && item) {
            if (name == 'click') {
                (fn = handler || this.handler) && !item.disabled && fn.call(item.scope||this.scope||this, grid, rowIndex, colIndex, item, e);
            } else if ((name == 'mousedown') && (item.stopSelection !== false)) {
                return false;
            }
        }
        return Ext.ux.grid.ButtonColumn.superclass.processEvent.apply(this, arguments);
    }
});

Ext.grid.Column.types.buttoncolumn = Ext.ux.grid.ButtonColumn;