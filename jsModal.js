//indexOf for old IE
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

(function($) {
	var $overlay,
		classPrefix = 'js-modal',
		modalClass = classPrefix,
		contentContainerClass = classPrefix + '-content-container',
		contentClass = classPrefix + '-content',
		closeClass = classPrefix + '-close',
		overlayClass = classPrefix + '-overlay',
		$body,
		$window = $(window),
		openModals = [];
		
	$(document).bind('keyup.modal', function(e) {
		if (e.keyCode === 27 && openModals.length) {
			openModals[openModals.length - 1].close();
		}
	});
		
	function createOverlay() {
		return $('<div />').addClass(overlayClass);	
	}
		
	function Modal($content, options) {
		var options,
			_self = this;
		
		this.options = options = $.extend( {
		  'attr': {}
		}, options);		
		this.openFlag = false;		
		$body = $body ? $body : $('body');

		if (!options.modalOuterElMarkup) {
			this.$modal = $('<div><a href="#" class="' + closeClass + '">Close</a>' +
			'<div class="' + contentContainerClass + '"></div></div>');
		} else {
			this.$modal = $(options.modalOuterElMarkup);
		}
		
		// if necessary, create an overlay element
		if (!$overlay) {
			$overlay = createOverlay();
			$overlay.data('modal', {active: false})
				.appendTo($body);
		}
		
		// put the content inside the modal, then append the modal to the body and position it
		$('.' + contentContainerClass, this.$modal).replaceWith($content);
		this.$modal.appendTo($body)
			.attr(options.attr)
			.addClass(modalClass)
			.hide();
		this._setPosition();
		
		// assign the reference to this object in the data of the $modal el
		this.$modal.data('modal', this);
			
		// set-up some event handlers
		$('.' + closeClass, this.$modal).bind('click.modal', function(e) {
			_self.close();
			
			e.preventDefault();
		});
		
		this.overlayClickHandler = function(e) {
			if (e.target === this) {
				_self.close();
			}
		};
		
		$overlay.bind('click.modal', this.overlayClickHandler);
	};
	
	Modal.prototype._setPosition = function() {
		this.$modal.css({
				left: (($window.width() - this.$modal.outerWidth()) / 2) + $window.scrollLeft(),
				top: (($window.height() - this.$modal.outerHeight()) / 2) + $window.scrollTop()
			});
	};
	
	Modal.prototype._showOverlay = function() {	
		if (!$overlay.data('modal').active) {
			$overlay.show()
				.data('modal', {active: true});
		} else {
			this.$extraOverlay = createOverlay();
			this.$extraOverlay.bind('click.modal', this.overlayClickHandler)
				.insertBefore(this.$modal)
				.css('z-index', this.$modal.css('z-index'))
				.show();
		}
	};
	
	Modal.prototype._hideOverlay = function() {		
		if (!this.$extraOverlay) {
			$overlay.hide()
				.data('modal', {active: false});
		} else {
			this.$extraOverlay.remove();
		}
	}
	
	Modal.prototype.open = function() {
		if (openModals.length) {
			this.$modal.css('z-index', parseInt(openModals[openModals.length - 1].$modal.css('z-index')) + 1);
		}
		
		openModals.push(this);
		this._showOverlay();
		this.$modal.show();
		this.openFlag = true;
	};
	
	Modal.prototype.close = function() {
		if (!this.isOpen()) {
			return;
		}
		
		openModals.splice(openModals.indexOf(this), 1);
		this.openFlag = false;
		this._hideOverlay();
		this.$modal.hide();
	};	
	
	Modal.prototype.isOpen = function() {	
		return this.openFlag;
	};
	
	$.fn.jsModal = function(options) {
		return this.each(function() {
			var $this = $(this),
				modalInstance = $this.data('modal');
			
			if (!modalInstance) {
				$this.data('modal', new Modal($this, options));
			} else {
				switch(options) {
					case 'open':
						modalInstance.open();
						break;
					case 'close':
						modalInstance.close();						
						break;
					case 'isOpen':
						return modalInstance.isOpen();
						break;
				}
			}
		});
	}
})(jQuery);