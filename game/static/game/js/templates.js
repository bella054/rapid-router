!function(){var n=Handlebars.template,a=Handlebars.templates=Handlebars.templates||{};a["button-dismiss"]=n({compiler:[6,">= 2.0.0-beta.1"],main:function(n,a,l,t){var e,o=a.helperMissing,i="function",s=this.escapeExpression;return'<button id="'+s((e=null!=(e=a.id||(null!=n?n.id:n))?e:o,typeof e===i?e.call(n,{name:"id",hash:{},data:t}):e))+'" class="navigation_button long_button" onclick="document.getElementById(\'close-modal\').click()">\n    <span>'+s((e=null!=(e=a.label||(null!=n?n.label:n))?e:o,typeof e===i?e.call(n,{name:"label",hash:{},data:t}):e))+"</span>\n</button>"},useData:!0}),a["button-redirect"]=n({compiler:[6,">= 2.0.0-beta.1"],main:function(n,a,l,t){var e,o=a.helperMissing,i="function",s=this.escapeExpression;return'<button class="navigation_button long_button" onclick="window.location.href='+s((e=null!=(e=a.location||(null!=n?n.location:n))?e:o,typeof e===i?e.call(n,{name:"location",hash:{},data:t}):e))+'">\n    <span>'+s((e=null!=(e=a.label||(null!=n?n.label:n))?e:o,typeof e===i?e.call(n,{name:"label",hash:{},data:t}):e))+"</span>\n</button>"},useData:!0})}();