/*
 * 文件分段上传jquery插件
 * author:lovefc
 * time:2018/01/05 23:05
 */
(function (jQuery) {
	$.fn.fcupInitialize = function () {

		return this.each(function () {

			var button = $(this),
			fcup = 0;
			if (!jQuery.uploading) {
				jQuery.uploading = '上传中...';
			}
			if (!jQuery.upfinished) {
				jQuery.upfinished = '上传完成';
			}
			var options = $.extend({
					loading: jQuery.uploading,
					finished: jQuery.upfinished
				}, button.data());

			button.attr({
				'data-loading': options.loading,
				'data-finished': options.finished
			});
			var bar = $('<span class="tz-bar background-horizontal">').appendTo(button);
			button.on('fcup', function (e, val, absolute, finish) {

				if (!button.hasClass('in-fcup')) {
					bar.show();
					fcup = 0;
					button.removeClass('finished').addClass('in-fcup')
				}
				if (absolute) {
					fcup = val;
				} else {
					fcup += val;
				}

				if (fcup >= 100) {
					fcup = 100;
					jQuery.upstr = options.finished;
					jQuery.fcup_add();
				}

				if (finish) {

					button.removeClass('in-fcup').addClass('finished');

					bar.delay(500).fadeOut(function () {
						button.trigger('fcup-finish');
						setProgress(0);
					});

				}

				setProgress(fcup);
			});

			function setProgress(percentage) {
				bar.filter('.background-horizontal,.background-bar').width(percentage + '%');
				bar.filter('.background-vertical').height(percentage + '%');
			}

		});

	};

	$.fn.fcupStart = function () {

		var button = this.first(),
		last_fcup = new Date().getTime();

		if (button.hasClass('in-fcup')) {
			return this;
		}

		button.on('fcup', function () {
			last_fcup = new Date().getTime();
		});

		var interval = window.setInterval(function () {

				if (new Date().getTime() > 2000 + last_fcup) {

					button.fcupIncrement(5);
				}

			}, 500);

		button.on('fcup-finish', function () {
			window.clearInterval(interval);
		});

		return button.fcupIncrement(10);
	};

	$.fn.fcupFinish = function () {
		return this.first().fcupSet(100);
	};

	$.fn.fcupIncrement = function (val) {

		val = val || 10;

		var button = this.first();

		button.trigger('fcup', [val])

		return this;
	};

	$.fn.fcupSet = function (val) {
		val = val || 10;

		var finish = false;
		if (val >= 100) {
			finish = true;
		}

		return this.first().trigger('fcup', [val, true, finish]);
	};

})(jQuery);

var big_upload = {

	fcup: function (config) {
		jQuery.extend(config);
		if (jQuery.upstr) {
			jQuery.upstr = '上传文件';
		}
		if (jQuery.updom && jQuery.upurl) {
			jQuery.fcup_add();
		}
	},

	fcup_add: function () {
		var html = '<div class="fcup-button">';
		html += jQuery.upstr;
		html += '<input type="file" id="ad47494fc02c388e" onchange="$.big_upload()" style="position:absolute;font-size:100px;right:0;top:0;opacity:0;">';
		html += '</div>';
		jQuery(jQuery.updom).html(html);
	},
	fc_GetPercent: function (num, total) {
		num = parseFloat(num);
		total = parseFloat(total);
		if (isNaN(num) || isNaN(total)) {
			return "-";
		}
		return total <= 0 ? 0 : (Math.round(num / total * 10000) / 100.00);
	},

	big_upload: function () {
		jQuery('.fcup-button').fcupInitialize();
		var controlButton = $('.fcup-button');
		var width = controlButton.outerWidth(true);
		var result = '';
		var file = jQuery("#ad47494fc02c388e")[0].files[0],

		name = file.name,

		size = file.size,

		index1 = name.lastIndexOf(".");

		index2 = name.length,

		suffix = name.substring(index1 + 1, index2);
		if (!jQuery.shardsize) {
			jQuery.shardsize = 2;
		}
		var shardSize = jQuery.shardsize * 1024 * 1024,

		succeed = 0;

		shardCount = Math.ceil(size / shardSize);

		if (jQuery.uptype) {
			if (!jQuery.errtype) {
				jQuery.errtype = '文件类型不对';
			}
			uptype = jQuery.uptype.split(",");
			if (jQuery.inArray(suffix, uptype) == -1) {
				jQuery.upstr = jQuery.errtype;
				jQuery.fcup_add();
				return false;
			}
		}

		for (var i = 0; i < shardCount; ++i) {

			var start = i * shardSize,

			end = Math.min(size, start + shardSize);

			//构造表单

			var form = new FormData();

			form.append("data", file.slice(start, end)); //slice方法用于切出文件的一部分

			form.append("name", name);

			form.append("total", shardCount); //总片数

			form.append("index", i + 1); //当前是第几片

			//Ajax提交
			jQuery.ajax({
				url: jQuery.upurl,
				type: "POST",
				data: form,
				async: true,
				processData: false, //告诉jquery不要对form进行处理
				contentType: false, //指定为false才能形成正确的Content-Type
				success: function () {
					++succeed;
					var cent = $.fc_GetPercent(succeed, shardCount);
					console.log(cent + '%');
					controlButton.fcupSet(cent);
				}
			});

		}

	}

};
(function (jQuery) {
	jQuery.extend(big_upload);
})(jQuery);