'use strict';

$(function () {
  var $container = $('.async-image-container');
  if (!$container.length) {
    return;
  }
  $container.each(function () {
    var $el = $(this),
      options = $el.data('options'),
      $img = $el.find('.image-container img'),
      croppable = $el.data('croppable');
    if (croppable) {
      if ($img.length) {
        setImageCrop($img, options);
      }
      //handle image crop inside bootstrap accordion/collapsible
      $container.closest('.collapse').one('shown.bs.collapse', function () {
        if ($img.length) {
          setImageCrop($img, $el.data('options'));
        }
      });
    }
  });
  $container.find('.async-upload').fileupload({
    dataType: 'json',
    start: function (e) {
      $(e.target).closest('.async-image-container').addClass('loading');
    },
    done: function (e, data) {
      var result = data.result,
        file = result.files[0],
        $target = $(e.target),
        $block = $target.closest('.async-image-container'),
        $err = $block.find('.async-upload-error');
      if (!result.success) {
        if (!file) {
          $err.html('При загрузке файла произошла ошибка');
        } else {
          $err.html(file.error);
        }
        $target.addClass('error');
        $err.removeClass('hidden').show();
        $block.removeClass('loading');
      } else {
        $target.removeClass('error');
        $err.hide();
        updateCropContainer($block, file);
      }
    }
  });

  $container.on('click', '.crop-btn', function (e) {
    e.preventDefault();
    var $this = $(this),
      $block = $this.closest('.async-image-container'),
      $img = $block.find('.croppable-image-target img.croppable-image'),
      jcrop = $img.data('jcrop'),
      selection = jcrop ? jcrop.tellSelect() : null,
      url = $this.attr('href') + '?path=' + $this.data('path');
    //todo: fix empty jcrop object in $img.data
    if (!selection) {
      return;
    }
    $block.addClass('loading');
    $.post(url, selection, function (data) {
      updateCropContainer($block, data);
    }, 'json');
  });

  function updateCropContainer($block, file) {
    var $target = $block.find('.croppable-image-target'),
      $imgContainer = $block.find('.image-container'),
      $cropBtn = $block.find('.crop-btn'),
      $img = $('<img/>', {src: file.url + '?' + Math.random(), 'class': 'croppable-image'});
    $cropBtn.data('path', file.url);
    $imgContainer.empty().append($img);
    if ($block.data('croppable')) {
      var options = $block.data('options');
      options.trueSize = [file.width, file.height];
      $block.data('options', options);
      $target.removeClass('hidden').show();
      $block.removeClass('loading');
      setImageCrop($img, options);
    }
  }

  function setImageCrop($img, options, callback) {
    var oldJcrop = $img.data('jcrop');
    if (oldJcrop) {
      oldJcrop.destroy();
    }
    if (options.aspectRatioStrict) {
      options.aspectRatio = options.minSize[0] / options.minSize[1];
    }
    options.setSelect = [0, 0, options.minSize[0], options.minSize[1]];
    $img.imagesLoaded(function () {
      $img.Jcrop(options, function () {
        $img.data('jcrop', this);
        if (callback) {
          callback();
        }
      });
    });
  }
});
